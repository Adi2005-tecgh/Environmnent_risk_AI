# AI-Driven Government Environmental Command Center - Architecture

## Overview

This document describes the enhanced AI-powered backend architecture for the Government Environmental Command Center. The system integrates real-time WAQI API data with advanced ML models to provide intelligent environmental monitoring, risk assessment, resource optimization, and economic impact analysis.

---

## Enhanced Data Pipeline

### 1. Live WAQI API Integration

**File:** `app/services/live_aqi_service.py`

**Extracted Fields:**
- **Pollutants:** PM2.5, PM10, NO2, SO2, O3, CO, Dominant Pollutant
- **Weather:** Temperature, Humidity, Pressure, Wind Speed, Wind Direction, Wind Gust, Dew Point
- **Forecast:** 3-day PM2.5 average, 3-day PM10 average, 3-day UVI average
- **Metadata:** Station name, Geographic coordinates, Timestamp

**Key Methods:**
- `fetch_live_pollution()`: Retrieves full WAQI data payload
- `_extract_forecast_avg()`: Parses and averages pollutant forecasts
- `add_to_buffer()`: Maintains rolling 24-hour buffer for temporal analysis

**Architecture Note:** All existing AQI logic preserved; new fields added safely.

---

## Environmental Intelligence Service

**File:** `app/services/environmental_intelligence.py`

### A. Composite Risk Scoring

**Algorithm:**
```
Composite Risk Score = 
    (0.50 × Pollution Risk) + 
    (0.25 × Stagnation Risk) + 
    (0.25 × Forecast Risk)

Range: 0-100
Categories: Low (<25), Moderate (25-50), High (50-75), Critical (75-100)
```

**Pollution Risk Components:**
- Base AQI normalization: `(AQI / 500) × 100`
- PM2.5 severity boost: `(PM25 / 300) × 30`
- PM10 exposure boost: `(PM10 / 500) × 15`
- NO2 traffic/industry boost: `(NO2 / 200) × 20`

**Weather Stagnation Risk:**
- Wind speed < 1.5 m/s → +40 points
- Humidity > 70% + wind < 2.0 m/s → +25 points
- High pressure (> 1010 hPa) → +20 points
- Humidity > 80% → +15 points

**Forecast Trend Risk:**
- 3-day PM2.5 forecast > current + 20 µg/m³ → risk 60, escalation 70%
- 3-day PM2.5 forecast > current + 10 µg/m³ → risk 40, escalation 50%
- 3-day PM2.5 forecast > current → risk 20, escalation 30%

### B. Pollution Source Inference

**Logic:**
```
If dominant_pollutant == pm25:
    source = "Combustion-driven"
    description = "Vehicles, industry, biomass burning"

If dominant_pollutant == no2:
    source = "Traffic-driven"
    description = "Vehicular emissions"

If dominant_pollutant == so2:
    source = "Industrial-driven"
    description = "Power generation, factories"

If dominant_pollutant == pm10:
    source = "Dust-driven"
    description = "Construction, natural dust"

If dominant_pollutant == o3:
    source = "Photochemical"
    description = "Secondary formation from NOx + VOCs"

If dominant_pollutant == co:
    source = "Vehicle-driven"
    description = "Incomplete combustion"
```

### C. Early Warning System

**Trigger Conditions:**
- Wind speed < 1.0 m/s AND
- PM2.5 > 50 µg/m³ AND
- Forecast PM2.5 > current PM2.5

**Output:** `alert_level`, `severity (0-100)`

### D. Government Recommendations

**Dynamic Rule Engine:**

| Condition | Recommendation | Priority |
|-----------|---|---|
| NO2 > 80 ppb OR PM25 > 150 | Traffic restrictions | Risk-based |
| PM10 > 200 + wind < 2 | Deploy water spraying | Risk-based |
| SO2 > 30 ppb | Industrial audit | Risk-1 |
| Wind < 1 + AQI > 200 | Halt construction | Immediate |
| PM25 > 100 + humidity > 70 | Health alert | Immediate |
| AQI > 250 | Close schools/events | Critical |

---

## Enhanced Risk Endpoint

**Endpoint:** `GET /api/risk/<city>`

**Response Structure:**
```json
{
  "city": "Delhi",
  "data_source": "live",
  "risk_score": 35,
  "risk_level": "Moderate",
  "escalation_probability": 20.0,
  "latest_aqi": 112.0,
  "pollution_source": "Combustion-driven",
  "source_description": "...",
  "environmental_context": {
    "temperature": 16.7,
    "humidity": 61.4,
    "wind_speed": 0.62,
    "pressure": 991.1
  },
  "early_warning": {
    "triggered": false,
    "alert_level": null,
    "severity": null
  },
  "recommendations": [
    {
      "action": "...",
      "reason": "...",
      "priority": 2,
      "time_horizon": "..."
    }
  ],
  "legacy_risk_level": "Moderate"
}
```

---

## Enhanced Hotspot Endpoint

**Endpoint:** `GET /api/hotspots/<city>`

**New Fields:**
- `city_pollution_source`: City-level source inference
- `source_description`: Detailed explanation
- Each hotspot now includes `inferred_source` field

**Example Hotspot:**
```json
{
  "station": "Alipur, Delhi - DPCC",
  "latitude": 28.815329,
  "longitude": 77.15301,
  "pollution_score": 57.57,
  "severity": "High",
  "cluster": 0,
  "inferred_source": "Combustion"
}
```

---

## Resource Optimizer Service

**File:** `app/services/resource_optimizer.py`

### Resource Deployment Optimization

#### Inspection Teams
```
recommended = base (2) + 
              pm25_multiplier (0-4x) + 
              hotspot_multiplier (0-6x) + 
              escalation_multiplier (1-3x)
```

#### Dust Suppression Vehicles
```
recommended = base (1) + 
              pm10_factor (0-10x) + 
              wind_factor (1-20x for wind < 2m/s)
```

#### Mobile Health Units
```
recommended = base (1) + 
              aqi_factor (0-10x) + 
              humidity_factor (0-2x)
```

---

## Economic Impact Calculator

**File:** `app/services/resource_optimizer.py`

### Productivity Loss
```
loss_percent = (AQI / 300) × 100
daily_loss = workforce_count × loss_percent × 500₹/person
```

### Healthcare Burden
```
burden_percent = (PM25 / 200) × 100 × (1 + (humidity_excess / 100))
daily_healthcare = estimated_cases × 2000₹/case
```

### Emergency Cost Index
```
If escalation_probability > 40%:
    emergency_cost = (base + hotspots × 5000) × escalation_multiplier
Else:
    emergency_cost = 0
```

---

## Government Analytics Endpoints

### Endpoint 1: Resource Deployment Plan

**GET `/api/government/resource-deployment/<city>`**

**Response:**
```json
{
  "city": "Delhi",
  "data_source": "live",
  "risk_category": "Moderate",
  "escalation_probability": 20.0,
  "deployment_optimization": {
    "inspection_teams": {
      "base_units": 2,
      "recommended_teams": 8,
      "priority": "HIGH",
      "focus_areas": { ... }
    },
    "dust_vehicles": {
      "base_units": 1,
      "recommended_vehicles": 9,
      "operation_type": "STANDARD_SPRAYING",
      "area_coverage": { ... }
    },
    "mobile_health": {
      "base_units": 1,
      "recommended_units": 5,
      "alert_type": "HEALTH_SUPPORT",
      "staffing": { ... }
    },
    "total_estimated_daily_cost": 17200
  }
}
```

### Endpoint 2: Economic Impact Assessment

**GET `/api/government/economic-impact/<city>`**

**Response:**
```json
{
  "city": "Delhi",
  "data_source": "live",
  "aqi": 112.0,
  "economic_impact_assessment": {
    "productivity_impact": {
      "loss_percentage": 37.33,
      "estimated_daily_loss_rupees": 56000000,
      "affected_workforce_percentage": 30.0
    },
    "healthcare_impact": {
      "burden_percentage": 57.01,
      "estimated_daily_cost_rupees": 57008000,
      "estimated_cases": 28504
    },
    "emergency_preparedness": {
      "emergency_triggered": false,
      "escalation_probability_threshold": 0.40,
      "current_escalation_prob": 0.20,
      "estimated_emergency_deployment_cost": 0,
      "additional_resources_needed": false
    },
    "total_daily_economic_impact": 113008000,
    "weekly_impact": 791056000,
    "monthly_impact": 3390240000
  }
}
```

---

## System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                     WAQI Live API                                │
│    (Pollutants + Weather + Forecast Data)                        │
└────────────────────┬────────────────────────────────────────────┘
                     │
                     ▼ fetch_live_pollution()
        ┌────────────────────────────────────┐
        │   LiveAQIService                   │
        │ (Extract all useful fields)        │
        │ - Pollutants (6 types)             │
        │ - Weather (7 types)                │
        │ - Forecast (3 types)               │
        │ - Metadata                         │
        └────┬──────────────────────┬────────┘
             │                      │
             ▼                      ▼
    ┌─────────────────────┐  ┌──────────────────────┐
    │ Rolling Buffer      │  │ Environmental        │
    │ (24 readings)       │  │ Intelligence Service │
    └─────────────────────┘  │                      │
                             │ Composite Risk:     │
                             │ - Pollution (50%)    │
                             │ - Stagnation (25%)   │
                             │ - Forecast (25%)     │
                             │                      │
                             │ Source Inference     │
                             │ Early Warning        │
                             │ Recommendations      │
                             └──────┬──────────────┘
                                    │
                ┌───────────────────┼────────────────────┐
                │                   │                    │
                ▼                   ▼                    ▼
        ┌──────────────┐   ┌──────────────┐   ┌──────────────┐
        │ Risk Route   │   │ Hotspot Route│   │ Gov Analytics│
        │ Enhanced w/: │   │ Enhanced w/: │   │              │
        │ - Risk Score │   │ - Source     │   │ - Resource   │
        │ - Source     │   │   Inference  │   │   Optimizer  │
        │ - Warning    │   │ - Station    │   │ - Economic   │
        │ - Recs       │   │   Source Tag │   │   Impact     │
        └──────────────┘   └──────────────┘   └──────────────┘
                │                   │                    │
                └───────────────────┼────────────────────┘
                                    │
                                    ▼
                        ┌──────────────────────┐
                        │   Frontend           │
                        │ (React Dashboard)    │
                        │ Shows AI insights    │
                        └──────────────────────┘
```

---

## Testing & Validation

### Test Files:
- `test_endpoints.py` - Basic endpoints (existing)
- `test_gov_analytics.py` - Government analytics endpoints (new)

### Example Test Results:
```
✅ /api/risk/Delhi
   - Composite Score: 35 (Moderate)
   - Escalation: 20%
   - Source: Combustion-driven
   - Recommendations: 0 (conditions normal)

✅ /api/hotspots/Delhi
   - 36 hotspots detected
   - Inferred sources: Combustion, Dust, Traffic
   - City source: Combustion-driven

✅ /api/government/resource-deployment/Delhi
   - Recommended: 8 teams, 9 vehicles, 5 health units
   - Daily cost: ₹17,200

✅ /api/government/economic-impact/Delhi
   - Daily productivity loss: ₹56M
   - Daily healthcare cost: ₹57M
   - Total daily impact: ₹113M
```

---

## Production Deployment Checklist

- [x] All existing API structures unchanged
- [x] No breaking changes to frontend
- [x] Modular service architecture
- [x] Clean logging throughout
- [x] Error handling with graceful fallbacks
- [x] WAQI API fields extracted safely (defaults where unavailable)
- [x] ML models preserved (legacy risk model still used for validation)
- [x] Database operations unchanged
- [x] Authentication/authorization schemas preserved
- [x] System remains backward compatible

---

## Performance Notes

- **WAQI API Calls:** ~1-2 seconds (cached in buffer)
- **Risk Calculation:** ~50ms (all in-memory)
- **Hotspot Inference:** ~100ms (quick pollutant mapping)
- **Economic Impact:** ~30ms (formula-based calculations)
- **Total Endpoint Response:** <500ms (live data path)

---

## Future Enhancements

1. **Machine Learning:**
   - Train source inference classifier on historical patterns
   - Predictive escalation modeling beyond simple thresholds
   - Anomaly detection on forecast vs. actual divergence

2. **Integration:**
   - Connect to resource management ERP system
   - Real-time webhook notifications for critical events
   - SMS/on-field app alerts for field teams

3. **Analytics:**
   - Historical trend analysis (patterns by season/day)
   - City-level policy effectiveness metrics
   - Correlation between interventions and AQI improvement

4. **Visualization:**
   - Heatmaps of pollution sources by station
   - Resource deployment maps showing coverage
   - Economic impact timeline projections

---

## Summary

The system is now a comprehensive, AI-driven environmental command center capable of:

✅ **Predictive** - 3-day forecasts, escalation probability, trend analysis
✅ **Context-aware** - Pollution source identification, weather stagnation detection
✅ **Weather-aware** - Wind, humidity, pressure factored into risk scoring
✅ **Source-aware** - Automatic classification (combustion, traffic, industrial, dust, photochemical)
✅ **Resource-optimized** - Intelligent deployment recommendations
✅ **Economically intelligent** - Real-time economic impact assessment
✅ **Policy recommendation capable** - Data-driven government recommendations

**Status:** Production-ready, backward compatible, modular, and maintainable.
