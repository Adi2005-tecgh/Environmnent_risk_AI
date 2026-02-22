"""
Environmental Intelligence Service

Provides advanced AI-driven environmental analysis including:
- Composite risk scoring (pollution, weather, forecast)
- Pollution source inference
- Early warning detection
- Dynamic government recommendations
"""

import numpy as np
import logging
from typing import Dict, Optional, Tuple

logger = logging.getLogger(__name__)


class EnvironmentalIntelligence:
    """
    Advanced environmental analysis engine using weighted scoring
    and AI-driven heuristics.
    """

    def __init__(self):
        """Initialize intelligence engine."""
        logger.info("✅ Environmental Intelligence Service initialized")

    def compute_environmental_context(self, reading: Dict) -> Dict:
        """
        Build a comprehensive environmental context object from live reading.
        
        Args:
            reading: Live pollution + weather data from WAQI API
            
        Returns:
            Structured environmental context with all derived metrics
        """
        context = {
            'aqi': float(reading.get('aqi') or 0),
            'pollutants': {
                'pm25': reading.get('pm25'),
                'pm10': reading.get('pm10'),
                'no2': reading.get('no2'),
                'so2': reading.get('so2'),
                'o3': reading.get('o3'),
                'co': reading.get('co'),
                'dominant': reading.get('dominantpol'),
            },
            'weather': {
                'temperature': reading.get('temperature'),
                'humidity': reading.get('humidity'),
                'pressure': reading.get('pressure'),
                'wind_speed': reading.get('wind_speed'),
                'wind_direction': reading.get('wind_direction'),
                'wind_gust': reading.get('wind_gust'),
                'dew_point': reading.get('dew_point'),
            },
            'forecast': {
                'pm25_avg_3d': reading.get('forecast_pm25_avg'),
                'pm10_avg_3d': reading.get('forecast_pm10_avg'),
                'uvi_avg_3d': reading.get('forecast_uvi_avg'),
            },
            'timestamp': reading.get('timestamp'),
            'station': reading.get('station'),
        }
        return context

    def compute_composite_risk_score(self, context: Dict) -> Tuple[int, str, float]:
        """
        Compute weighted composite risk score using:
        - Pollution weight: 50%
        - Weather stagnation: 25%
        - Forecast trend: 25%
        
        Args:
            context: Environmental context from compute_environmental_context
            
        Returns:
            Tuple of (risk_score 0-100, risk_category, escalation_probability)
        """
        
        # 1. Pollution Risk (50% weight)
        pollution_risk = self._compute_pollution_risk(context['pollutants'], context['aqi'])
        
        # 2. Weather Stagnation Risk (25% weight)
        stagnation_risk = self._compute_stagnation_risk(context['weather'])
        
        # 3. Forecast Trend Risk (25% weight)
        forecast_risk, escalation_prob = self._compute_forecast_risk(
            context['aqi'],
            context['pollutants'].get('pm25'),
            context['forecast']
        )
        
        # Weighted composite score
        composite_score = (
            0.50 * pollution_risk +
            0.25 * stagnation_risk +
            0.25 * forecast_risk
        )
        
        # Ensure 0-100 range
        composite_score = float(np.clip(composite_score, 0, 100))
        
        # Map to category
        if composite_score < 25:
            category = "Low"
        elif composite_score < 50:
            category = "Moderate"
        elif composite_score < 75:
            category = "High"
        else:
            category = "Critical"
        
        logger.info(
            f"[RISK] Composite: {composite_score:.1f} ({category}), "
            f"Pollution: {pollution_risk:.1f}, Stagnation: {stagnation_risk:.1f}, "
            f"Forecast: {forecast_risk:.1f}, Escalation: {escalation_prob*100:.1f}%"
        )
        
        return int(composite_score), category, float(escalation_prob)

    def _compute_pollution_risk(self, pollutants: Dict, aqi: float) -> float:
        """Compute pollution risk component (0-100)."""
        # Base risk from AQI (0-500 scale normalized to 0-100)
        aqi_risk = min(100, (aqi / 500) * 100)
        
        # Boost based on high pm25 (respiratory threat)
        pm25 = pollutants.get('pm25') or 0
        pm25_risk = min(30, (pm25 / 300) * 30)
        
        # Boost based on high pm10 (exposure)
        pm10 = pollutants.get('pm10') or 0
        pm10_risk = min(15, (pm10 / 500) * 15)
        
        # Boost for NO2 (traffic/industry)
        no2 = pollutants.get('no2') or 0
        no2_risk = min(20, (no2 / 200) * 20)
        
        # Combined pollution risk
        pollution_risk = min(100, aqi_risk + pm25_risk + pm10_risk + no2_risk)
        return float(pollution_risk)

    def _compute_stagnation_risk(self, weather: Dict) -> float:
        """Compute weather stagnation risk component (0-100)."""
        risk = 0.0
        
        wind_speed = weather.get('wind_speed') or 0
        humidity = weather.get('humidity') or 0
        pressure = weather.get('pressure') or 0
        
        # Low wind stagnation alert
        if wind_speed < 1.5:
            risk += 40  # Major stagnation
        elif wind_speed < 3.0:
            risk += 20
        
        # High humidity with poor dispersion
        if humidity > 70 and wind_speed < 2.0:
            risk += 25
        
        # Low pressure trapping (1000+ hPa is normal; over 1010 is high)
        if pressure is not None and pressure > 1010:
            risk += 20
        
        # High humidity alone (respiratory concerns)
        if humidity > 80:
            risk += 15
        
        stagnation_risk = float(np.clip(risk, 0, 100))
        return stagnation_risk

    def _compute_forecast_risk(self, current_aqi: float, current_pm25: Optional[float], 
                                forecast: Dict) -> Tuple[float, float]:
        """
        Compute forecast trend risk and escalation probability.
        
        Returns:
            Tuple of (forecast_risk 0-100, escalation_probability 0-1)
        """
        forecast_pm25_avg = forecast.get('pm25_avg_3d')
        
        escalation_prob = 0.0
        forecast_risk = 0.0
        
        if forecast_pm25_avg is not None and current_pm25 is not None:
            # Check if 3-day average exceeds current levels
            trend_diff = forecast_pm25_avg - current_pm25
            
            if trend_diff > 20:  # Significant rise expected
                forecast_risk = 60
                escalation_prob = 0.7
            elif trend_diff > 10:
                forecast_risk = 40
                escalation_prob = 0.5
            elif trend_diff > 0:
                forecast_risk = 20
                escalation_prob = 0.3
            else:
                forecast_risk = 10
                escalation_prob = 0.1
        else:
            # Default if no forecast available
            forecast_risk = 25
            escalation_prob = 0.2
        
        forecast_risk = float(np.clip(forecast_risk, 0, 100))
        escalation_prob = float(np.clip(escalation_prob, 0, 1))
        
        return forecast_risk, escalation_prob

    def infer_pollution_source(self, context: Dict) -> Tuple[str, str]:
        """
        Infer pollution source based on dominant pollutant.
        
        Returns:
            Tuple of (source_type, source_inference_description)
        """
        dominant = context['pollutants'].get('dominant')
        
        source_map = {
            'pm25': ('Combustion-driven', 'High PM2.5 indicates combustion sources (vehicles, industry, biomass burning)'),
            'pm10': ('Dust-driven', 'High PM10 suggests dust resuspension, construction, or natural sources'),
            'no2': ('Traffic-driven', 'Elevated NO2 strongly indicates vehicular traffic emissions'),
            'so2': ('Industrial-driven', 'High SO2 points to industrial emissions or power generation'),
            'o3': ('Photochemical', 'Ozone levels indicate secondary photochemical formation from NOx+VOC'),
            'co': ('Vehicle-driven', 'Elevated CO indicates incomplete combustion from traffic or heating'),
        }
        
        source, description = source_map.get(dominant, ('Mixed-source', 'No dominant pollutant identified'))
        
        logger.info(f"[SOURCE] {source}: {description}")
        return source, description

    def detect_early_warning(self, context: Dict) -> Optional[Tuple[str, int]]:
        """
        Detect early warning condition:
        - wind_speed < 1 m/s
        - pm25 trending upward
        - forecast pm25 rising
        
        Returns:
            Tuple of (alert_level, severity_0_to_100) or None if no alert
        """
        wind_speed = context['weather'].get('wind_speed') or 0
        current_pm25 = context['pollutants'].get('pm25') or 0
        forecast_pm25 = context['forecast'].get('pm25_avg_3d')
        
        alert_level = None
        severity = 0
        
        # Stagnation condition
        if wind_speed < 1.0 and current_pm25 > 50:
            if forecast_pm25 is not None and forecast_pm25 > current_pm25:
                alert_level = "STAGNATION_ESCALATION"
                severity = min(100, int((forecast_pm25 / 300) * 100))
        
        if alert_level:
            logger.warning(f"[EARLY_WARNING] {alert_level} (severity={severity}%)")
            return alert_level, severity
        
        return None

    def generate_government_recommendations(self, context: Dict, risk_category: str) -> list:
        """
        Generate dynamic, data-driven government recommendations.
        
        Args:
            context: Environmental context
            risk_category: Current risk category (Low/Moderate/High/Critical)
            
        Returns:
            List of recommendation dictionaries with action, reason, priority
        """
        recommendations = []
        
        pollutants = context['pollutants']
        weather = context['weather']
        aqi = context['aqi']
        pm25 = pollutants.get('pm25') or 0
        pm10 = pollutants.get('pm10') or 0
        no2 = pollutants.get('no2') or 0
        so2 = pollutants.get('so2') or 0
        wind_speed = weather.get('wind_speed') or 0
        humidity = weather.get('humidity') or 0
        
        # Priority levels
        priority_map = {"Critical": 1, "High": 2, "Moderate": 3, "Low": 4}
        base_priority = priority_map.get(risk_category, 4)
        
        # Traffic-related recommendations
        if no2 > 80 or pm25 > 150:
            recommendations.append({
                'action': 'Implement traffic restrictions in hotspot zones',
                'reason': f'NO2={no2:.1f} ppb indicates heavy traffic; PM2.5={pm25:.1f} µg/m³ poses health risk',
                'priority': base_priority,
                'time_horizon': 'Immediate',
            })
        
        # Dust control
        if pm10 > 200 and wind_speed < 2.0:
            recommendations.append({
                'action': 'Deploy water spraying vehicles in high-pollution zones',
                'reason': f'PM10={pm10:.1f} µg/m³ with low wind speed ({wind_speed:.1f} m/s) allows dust accumulation',
                'priority': base_priority,
                'time_horizon': '2-4 hours',
            })
        
        # Industrial audit
        if so2 > 30:
            recommendations.append({
                'action': 'Conduct emergency industrial pollution audit',
                'reason': f'SO2={so2:.1f} ppb exceeds safe levels; likely industrial source',
                'priority': base_priority - 1 if base_priority > 1 else 1,
                'time_horizon': '24 hours',
            })
        
        # Construction halt
        if wind_speed < 1.0 and aqi > 200:
            recommendations.append({
                'action': 'Halt construction activities in stagnant air conditions',
                'reason': f'Wind speed={wind_speed:.1f} m/s + AQI={aqi} creates critical environment',
                'priority': base_priority,
                'time_horizon': 'Immediate',
            })
        
        # Health/respiratory alert
        if pm25 > 100 and humidity > 70:
            recommendations.append({
                'action': 'Issue respiratory health alert; increase medical preparedness',
                'reason': f'High PM2.5={pm25:.1f} + humidity={humidity:.0f}% increases respiratory risk',
                'priority': base_priority,
                'time_horizon': 'Immediate',
            })
        
        # School/event closures
        if aqi > 250:
            recommendations.append({
                'action': 'Consider closing schools and outdoor events',
                'reason': f'AQI={aqi} reaches hazardous levels; vulnerable groups at severe risk',
                'priority': 1,
                'time_horizon': 'Immediate',
            })
        
        logger.info(f"[RECOMMENDATIONS] Generated {len(recommendations)} actions for {risk_category} risk")
        return recommendations

    def generate_health_tip(self, context: Dict, risk_category: str) -> str:
        """
        Generate a concise, health-focused tip for citizens.
        """
        aqi = context['aqi']
        pm25 = context['pollutants'].get('pm25') or 0
        
        if risk_category == "Critical":
            return "Air quality is hazardous. Avoid all outdoor physical activity and wear an N95 mask if you must go outside."
        elif risk_category == "High":
            return "Significant pollution detected. Vulnerable groups should stay indoors; others should limit prolonged outdoor exertion."
        elif risk_category == "Moderate":
            if pm25 > 35:
                return "Particulate levels are slightly elevated. Sensitive individuals should consider reducing heavy outdoor work."
            return "Air quality is acceptable; however, some individuals may be sensitive to specific pollutants."
        else:
            if aqi < 50:
                return "Excellent air quality today. A perfect time for outdoor activities and fresh air ventilation."
            return "Air quality is good. Business as usual for most citizens."


# Global singleton instance
_environmental_intelligence = None


def get_environmental_intelligence() -> EnvironmentalIntelligence:
    """Get or create the global EnvironmentalIntelligence instance."""
    global _environmental_intelligence
    if _environmental_intelligence is None:
        _environmental_intelligence = EnvironmentalIntelligence()
    return _environmental_intelligence
