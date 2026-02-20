# Live AQI API Integration Guide

## Overview

The AQI ML Backend now uses **live WAQI API data** for real-time pollution readings, while maintaining seamless fallback to CSV data for robustness.

## Architecture

### 1. **Live AQI Service Layer** (`app/services/live_aqi_service.py`)

Central service for managing live pollution data:

```
LiveAQIService
├── fetch_live_pollution(city) → Dict with pollutants
├── add_to_buffer(city, reading) → Updates rolling buffer
├── create_lstm_sequence(city) → Generates LSTM sequences
├── fetch_and_buffer(city) → Fetch + cache + fallback logic
└── get_buffer_stats(city) → Debug statistics
```

**Key Features:**
- Rolling buffer of last 24 readings per city (FIFO)
- Automatic fallback to CSV on API failure
- Data source tracking (`live` vs `fallback`)
- Singleton pattern for efficient resource usage

### 2. **Modified API Endpoints**

#### `/api/predict/<city>`
- **Data Source Priority:**
  1. Live WAQI API + buffer (preferred)
  2. CSV fallback (if API fails)
  
- **Response:**
  ```json
  {
    "city": "Delhi",
    "data_source": "live",
    "is_live": true,
    "forecast": [
      {"day": 1, "aqi": 145},
      {"day": 2, "aqi": 152},
      {"day": 3, "aqi": 148}
    ]
  }
  ```

#### `/api/risk/<city>`
- Uses live pollutant data for risk classification
- Falls back to CSV if no live data available
- Returns `data_source` field

#### `/api/anomalies/<city>`
- Uses live buffer readings for anomaly detection
- Maintains 24-hour rolling window of live data
- Falls back to CSV for 24-hour historical anomalies

### 3. **LSTM Sequence Generation**

Live data is processed for LSTM:

```
Buffer (24 max readings)
    ↓
Extract 7-feature vectors [AQI, PM2.5, PM10, NO2, SO2, O3, CO]
    ↓
Fill/pad to 30 timesteps (repeat last if needed)
    ↓
Reshape to (1, 30, 7) for LSTM input
```

## Configuration

### WAQI API Setup

1. **Get Token:**
   - Visit: https://aqicn.org/data-platform/token
   - Register and obtain API token

2. **Set Environment Variable:**

```bash
# On Windows (PowerShell)
$env:WAQI_TOKEN = "your_token_here"

# On Windows (CMD)
set WAQI_TOKEN=your_token_here

# On Linux/Mac
export WAQI_TOKEN=your_token_here
```

3. **Or Update Config:**
   Edit `app/config.py`:
   ```python
   WAQI_TOKEN = 'your_token_here'  # Replace 'demo' with actual token
   ```

### Fallback Behavior

If WAQI API fails:
- Logs error with reason (timeout, connection error, invalid response)
- Returns last cached live data if available
- Falls back to CSV if no cache
- Returns `data_source: "fallback"` in response

## Features Extracted from Live API

```
From WAQI API Response:
├── aqi → Overall AQI value
├── pm25 → PM2.5 level (μg/m³)
├── pm10 → PM10 level (μg/m³)
├── no2 → Nitrogen Dioxide (ppb)
├── so2 → Sulfur Dioxide (ppb)
├── o3 → Ozone (ppb)
└── co → Carbon Monoxide (ppm)
```

## Buffer Management

### Automatic Buffer Updates

- **Trigger:** Each API call (predict, risk, anomalies)
- **Max Size:** 24 readings per city
- **Capacity:** ~5 minutes per reading (auto-refresh)
- **Memory:** ~100KB per city (minimal overhead)

### Buffer Statistics

Debug endpoint (not exposed, for development):
```python
live_aqi_service.get_buffer_stats('Delhi')
# Returns: {'city': 'Delhi', 'buffer_size': 18, 'oldest_reading': '...', 'newest_reading': '...'}
```

## Error Handling

### API Failures

1. **Timeout (5s timeout):**
   - Logs: `"❌ API timeout for {city}"`
   - Action: Return fallback/CSV data

2. **Connection Error:**
   - Logs: `"❌ Connection error for {city}"`
   - Action: Return fallback/CSV data

3. **Invalid Status:**
   - Status != "ok" from WAQI
   - Logs: Warning with status
   - Action: Skip and use fallback

4. **Missing Pollutants:**
   - Sets missing values to `None`
   - Handled during model inference with defaults

### Graceful Degradation

```
Live API Available → Use live data + buffer
              ↓
Live API Failed → Use last cached reading
              ↓
No Cache → Fall back to CSV
              ↓
No CSV → Return 404 error
```

## Model Compatibility

### No Model Retraining Required

- Existing models untouched
- Input normalization handled automatically
- Scaler used for LSTM sequences
- Feature matching maintained

### Feature Engineering

For risk model (requires 5 features):
```python
[AQI, violations_7d (0), wind_speed (2.0), temperature (25.0), humidity (60.0)]
```

For isolation forest (requires 5 features):
```python
[PM2.5, NO2, SO2, O3, CO]
```

## Performance

- **WAQI API Response Time:** ~200-400ms
- **Buffer Operation:** <1ms
- **LSTM Sequence Generation:** ~10ms
- **Total Endpoint Latency:** ~250-500ms (live) vs ~100ms (CSV)

## Debugging

Enable logs to monitor live data flow:

```python
import logging
logging.basicConfig(level=logging.DEBUG)

# In your code:
live_aqi_service = get_live_aqi_service()
stats = live_aqi_service.get_buffer_stats('Delhi')
print(stats)
```

## Migration from CSV-only

### Before
```python
# Read CSV → Predict
df.read_csv() → model.predict()
```

### After
```
# Try Live API → Buffer → Fallback CSV → Predict
fetch_live_aqi() → buffer → model.predict()
```

**User-facing change:** Responses now include `data_source` field for transparency.

## Future Enhancements

1. **Multi-city Buffer Optimization:**
   - Reduce memory footprint for 100+ cities
   - LRU cache for frequently accessed cities

2. **API Rate Limiting:**
   - Implement exponential backoff
   - Cache responses for repeated requests

3. **Data Enrichment:**
   - Add wind speed, temperature from weather API
   - Use actual weather data instead of defaults

4. **Advanced Anomaly Detection:**
   - Compare live readings vs historical patterns
   - Real-time trend analysis

## Testing

### Local Testing with Demo Token

```bash
curl "http://localhost:5000/api/predict/Delhi"
```

Response (demo token limited data):
```json
{
  "city": "Delhi",
  "data_source": "live",
  "forecast": [...]
}
```

### With Real WAQI Token

Set `WAQI_TOKEN` environment variable before running app:

```bash
python run.py
```

Monitor logs for live data fetches.
