from flask import Blueprint, jsonify
import pandas as pd
import os
from ..model_loader import model_loader
from ..config import Config

risk_bp = Blueprint('risk', __name__)

@risk_bp.route('/risk/<city>', methods=['GET'])
def get_risk(city):
    try:
        if not os.path.exists(Config.AQI_DATASET_PATH):
            return jsonify({'error': 'Dataset not found'}), 500
            
        df = pd.read_csv(Config.AQI_DATASET_PATH)
        city_data = df[df['City'].str.lower() == city.lower()]
        
        if city_data.empty:
            return jsonify({'error': f'No data found for city: {city}'}), 404
            
        # Get latest record
        latest = city_data.sort_values('Date').iloc[-1]
        
        feature_cols = [
            'AQI',
            'violations_7d',
            'wind_speed',
            'temperature',
            'humidity'
        ]
        
        X = latest[feature_cols].values.reshape(1, -1)
        
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
            'risk_level': risk_map.get(risk_class, "Unknown"),
            'risk_score': risk_class,
            'description': risk_desc.get(risk_class, ""),
            'latest_aqi': float(latest['AQI'])
        }), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500
