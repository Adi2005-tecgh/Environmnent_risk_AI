"""
Live AQI Service Layer

Fetches real-time pollution data from WAQI API and maintains in-memory buffer
for LSTM sequence generation and anomaly detection.
"""

import requests
import logging
from datetime import datetime
from collections import defaultdict
from typing import Dict, List, Optional, Tuple
import numpy as np

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class LiveAQIService:
    """
    Service to fetch and manage live pollution data from WAQI API.
    Maintains rolling buffer of last 24 readings per city for time-series predictions.
    """

    # WAQI API Token (set via environment variable or hardcoded for demo)
    WAQI_TOKEN = "12ad7099ee38e34b4eeafa2059289e0d763f9a6e"  # Production token
    WAQI_BASE_URL = "https://api.waqi.info/feed"

    # Buffer configuration
    MAX_BUFFER_SIZE = 24  # Last 24 readings
    BUFFER_TIMEOUT = 300  # Refresh buffer every 5 minutes (in seconds)

    def __init__(self):
        """Initialize the live AQI service with empty buffers."""
        self.city_buffers: Dict[str, List[Dict]] = defaultdict(list)
        self.buffer_timestamps: Dict[str, float] = {}
        self.last_csv_fallback: Dict[str, Dict] = {}

    def fetch_live_pollution(self, city: str) -> Optional[Dict]:
        """
        Fetch live pollution data from WAQI API.

        Args:
            city: City name (e.g., 'Delhi', 'Mumbai')

        Returns:
            Dictionary with pollutant readings or None if API fails
            {
                'aqi': int,
                'pm25': float or None,
                'pm10': float or None,
                'no2': float or None,
                'so2': float or None,
                'o3': float or None,
                'co': float or None,
                'timestamp': str,
                'station': str
            }
        """
        try:
            # Build API URL
            url = f"{self.WAQI_BASE_URL}/{city}/?token={self.WAQI_TOKEN}"

            # Fetch with timeout
            response = requests.get(url, timeout=5)
            response.raise_for_status()

            data = response.json()

            # Check API response status
            if data.get('status') != 'ok':
                logger.warning(
                    f"WAQI API returned non-ok status: {data.get('status')} for {city}"
                )
                return None

            # Extract main AQI
            aqi = data.get('data', {}).get('aqi')
            if aqi is None:
                logger.warning(f"No AQI value in WAQI response for {city}")
                return None

            # Safely extract pollutants (may not all be present)
            iaqi = data.get('data', {}).get('iaqi', {})

            pollution_reading = {
                'aqi': int(aqi),
                'pm25': iaqi.get('pm25', {}).get('v'),
                'pm10': iaqi.get('pm10', {}).get('v'),
                'no2': iaqi.get('no2', {}).get('v'),
                'so2': iaqi.get('so2', {}).get('v'),
                'o3': iaqi.get('o3', {}).get('v'),
                'co': iaqi.get('co', {}).get('v'),
                'timestamp': datetime.utcnow().isoformat(),
                'station': data.get('data', {}).get('city', {}).get('name', city),
            }

            logger.info(
                f"✅ Live data fetched for {city}: AQI={aqi}, "
                f"PM2.5={pollution_reading['pm25']}, PM10={pollution_reading['pm10']}"
            )

            return pollution_reading

        except requests.exceptions.Timeout:
            logger.error(f"❌ API timeout for {city}")
            return None
        except requests.exceptions.ConnectionError:
            logger.error(f"❌ Connection error for {city}")
            return None
        except Exception as e:
            logger.error(f"❌ Error fetching live data for {city}: {str(e)}")
            return None

    def add_to_buffer(self, city: str, pollution_reading: Dict) -> None:
        """
        Add a pollution reading to the city's rolling buffer.

        Args:
            city: City name
            pollution_reading: Dictionary with AQI and pollutants
        """
        if city not in self.city_buffers:
            self.city_buffers[city] = []

        self.city_buffers[city].append(pollution_reading)

        # Maintain max buffer size (FIFO)
        if len(self.city_buffers[city]) > self.MAX_BUFFER_SIZE:
            self.city_buffers[city].pop(0)

        self.buffer_timestamps[city] = datetime.utcnow().timestamp()
        logger.info(f"Buffer updated for {city}: {len(self.city_buffers[city])} readings")

    def get_buffer(self, city: str) -> List[Dict]:
        """
        Get the rolling buffer for a city.

        Args:
            city: City name

        Returns:
            List of pollution readings (last 24 or fewer)
        """
        return self.city_buffers.get(city, [])

    def get_features_vector(
        self, city: str, pollution_reading: Dict
    ) -> Tuple[np.ndarray, bool]:
        """
        Construct a feature vector from a pollution reading.
        Format: [PM2.5, PM10, NO2, CO, SO2, O3, wind_speed, temperature, humidity, violations_7d, AQI]
        (11 features to match LSTM model training)

        Args:
            city: City name
            pollution_reading: Dictionary with pollutant values

        Returns:
            Tuple of (feature_vector as np.ndarray, has_all_features flag)
        """
        features = [
            pollution_reading.get('pm25'),  # PM2.5
            pollution_reading.get('pm10'),  # PM10
            pollution_reading.get('no2'),   # NO2
            pollution_reading.get('co'),    # CO
            pollution_reading.get('so2'),   # SO2
            pollution_reading.get('o3'),    # O3
            2.0,                             # wind_speed (default)
            25.0,                            # temperature (default)
            60.0,                            # humidity (default)
            0,                               # violations_7d (default)
            pollution_reading.get('aqi'),   # AQI
        ]

        # Check if all pollutants are present (not counting defaults)
        has_all = all(f is not None for f in features[:6])  # Check first 6 (pollutants)

        # Convert None to 0 for feature vector
        features = np.array([f if f is not None else 0.0 for f in features])

        return features, has_all

    def create_lstm_sequence(self, city: str, fill_size: int = 30) -> Tuple[Optional[np.ndarray], bool]:
        """
        Create a sequence for LSTM from buffer.
        If buffer has less than fill_size, repeats last value.

        Args:
            city: City name
            fill_size: Expected sequence length (default 30)

        Returns:
            Tuple of (sequence as np.ndarray of shape (1, fill_size, 11), is_filled_with_live_data flag)
        """
        buffer = self.get_buffer(city)

        if not buffer:
            logger.warning(f"Empty buffer for {city}, cannot create LSTM sequence")
            return None, False

        # Extract feature vectors from buffer
        sequences = []
        for reading in buffer:
            features, _ = self.get_features_vector(city, reading)
            sequences.append(features)

        # If buffer has less than fill_size, repeat the last reading
        if len(sequences) < fill_size:
            logger.info(
                f"Buffer has {len(sequences)} readings, filling to {fill_size} by repeating last value"
            )
            last_seq = sequences[-1]
            while len(sequences) < fill_size:
                sequences.append(last_seq.copy())

        # Keep only last fill_size readings
        sequences = sequences[-fill_size:]

        # Stack into (1, fill_size, 11)
        sequence = np.array(sequences).reshape(1, fill_size, 11)

        is_live = len(buffer) >= 5  # Have at least 5 live readings

        return sequence, is_live

    def get_html_sequence_from_buffer(self, city: str, fill_size: int = 30) -> Optional[np.ndarray]:
        """
        Alias for create_lstm_sequence for compatibility.
        """
        seq, _ = self.create_lstm_sequence(city, fill_size)
        return seq

    def fetch_and_buffer(self, city: str) -> Tuple[Optional[Dict], str]:
        """
        Fetch live data and add to buffer, with fallback to CSV.

        Args:
            city: City name

        Returns:
            Tuple of (pollution_reading dict, data_source string: 'live' or 'fallback')
        """
        # Try live API
        pollution_reading = self.fetch_live_pollution(city)

        if pollution_reading:
            # Add to buffer
            self.add_to_buffer(city, pollution_reading)
            self.last_csv_fallback[city] = pollution_reading  # Cache for fallback
            return pollution_reading, "live"
        else:
            logger.warning(f"Live API failed for {city}, returning cached data if available")
            # Return last cached value or None
            cached = self.last_csv_fallback.get(city)
            return cached, "fallback" if cached else "error"

    def clear_buffer(self, city: str) -> None:
        """Clear buffer for a specific city (for testing)."""
        if city in self.city_buffers:
            self.city_buffers[city] = []
            logger.info(f"Cleared buffer for {city}")

    def get_buffer_stats(self, city: str) -> Dict:
        """Get statistics about the buffer for debugging."""
        buffer = self.get_buffer(city)
        return {
            'city': city,
            'buffer_size': len(buffer),
            'max_size': self.MAX_BUFFER_SIZE,
            'oldest_reading': buffer[0]['timestamp'] if buffer else None,
            'newest_reading': buffer[-1]['timestamp'] if buffer else None,
        }


# Global singleton instance
_live_aqi_service = None


def get_live_aqi_service() -> LiveAQIService:
    """Get or create the global LiveAQIService instance."""
    global _live_aqi_service
    if _live_aqi_service is None:
        _live_aqi_service = LiveAQIService()
    return _live_aqi_service
