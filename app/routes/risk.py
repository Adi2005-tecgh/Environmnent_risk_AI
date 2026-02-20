from flask import Blueprint, jsonify
import pandas as pd
import numpy as np
import os
from ..model_loader import model_loader
from ..config import Config
from ..services.live_aqi_service import get_live_aqi_service

risk_bp = Blueprint('risk', __name__)

@risk_bp.route('/risk/<city>', methods=['GET'])
def get_risk(city):
    try:
        live_aqi_service = get_live_aqi_service()
        
        # Try to fetch live data
        pollution_reading, data_source = live_aqi_service.fetch_and_buffer(city)
        
        if pollution_reading is None:
            # Fallback to CSV
            if not os.path.exists(Config.AQI_DATASET_PATH):
                return jsonify({'error': 'No data source available'}), 500
                
            df = pd.read_csv(Config.AQI_DATASET_PATH)
            city_data = df[df['City'].str.lower() == city.lower()]
            
            if city_data.empty:
                return jsonify({'error': f'No data found for city: {city}'}), 404
                
            latest = city_data.sort_values('Date').iloc[-1]
            
            feature_cols = [
                'AQI',
                'violations_7d',
                'wind_speed',
                'temperature',
                'humidity'
            ]
            
            X = latest[feature_cols].values.reshape(1, -1)
            latest_aqi = float(latest['AQI'])
            data_source = "csv_fallback"
        else:
            # Use live pollution data
            # Feature vector: [aqi, violations_7d (estimated), wind_speed (estimated), temp (est), humidity (est)]
            # For risk model with live data, we use simplified features
            
            aqi = float(pollution_reading['aqi'])
            pm25 = pollution_reading.get('pm25') or 0
            pm10 = pollution_reading.get('pm10') or 0
            
            # Simplified risk features from live data
            # Estimate violations as anomaly count (proxy)
            violations_7d = 0  # Will be updated by anomaly detection
            
            # Using pollutant levels as proxy for weather impact
            wind_speed = 2.0  # Default estimate
            temperature = 25.0  # Default estimate
            humidity = 60.0  # Default estimate
            
            feature_cols = [
                'AQI', 'violations_7d', 'wind_speed', 'temperature', 'humidity'
            ]
            
            X = np.array([[aqi, violations_7d, wind_speed, temperature, humidity]]).reshape(1, -1)
            latest_aqi = aqi
            data_source = "live"
        
        model = model_loader.get_risk_model()
        risk_class = int(model.predict(X)[0])
        
        risk_map = {
            0: "Low",
            1: "Moderate",
            2: "High",
            3: "Extreme"
        }
        
        risk_desc = {
            0: "Air quality is satisfactory, and air pollution poses little or no risk.",
            1: "Air quality is acceptable; however, for some pollutants there may be a moderate health concern.",
            2: "Members of sensitive groups may experience health effects.",
            3: "Everyone may begin to experience health effects; members of sensitive groups may experience more serious health effects."
        }
        
        return jsonify({
            'city': city,
            'data_source': data_source,
            'risk_level': risk_map.get(risk_class, "Unknown"),
            'risk_score': risk_class,
            'description': risk_desc.get(risk_class, ""),
            'latest_aqi': latest_aqi
        }), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500
