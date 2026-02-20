from flask import Blueprint, jsonify
import pandas as pd
import numpy as np
import os
import logging
from ..model_loader import model_loader
from ..config import Config
from ..services.live_aqi_service import get_live_aqi_service
from ..services.environmental_intelligence import get_environmental_intelligence

logger = logging.getLogger(__name__)
risk_bp = Blueprint('risk', __name__)

@risk_bp.route('/risk/<city>', methods=['GET'])
def get_risk(city):
    try:
        live_aqi_service = get_live_aqi_service()
        intelligence = get_environmental_intelligence()
        
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
            
            # Build minimal context for CSV fallback
            context = {
                'aqi': latest_aqi,
                'pollutants': {
                    'pm25': None,
                    'pm10': None,
                    'no2': None,
                    'so2': None,
                    'o3': None,
                    'co': None,
                    'dominant': None,
                },
                'weather': {
                    'temperature': float(latest.get('temperature', 25.0)),
                    'humidity': float(latest.get('humidity', 60.0)),
                    'pressure': None,
                    'wind_speed': float(latest.get('wind_speed', 2.0)),
                    'wind_direction': None,
                    'wind_gust': None,
                    'dew_point': None,
                },
                'forecast': {
                    'pm25_avg_3d': None,
                    'pm10_avg_3d': None,
                    'uvi_avg_3d': None,
                },
                'timestamp': str(latest.get('Date', 'Unknown')),
                'station': city,
            }
        else:
            # Use live pollution data with advanced intelligence
            context = intelligence.compute_environmental_context(pollution_reading)
            latest_aqi = context['aqi']
            data_source = "live"
        
        # Compute advanced composite risk score
        composite_risk_score, risk_category, escalation_prob = intelligence.compute_composite_risk_score(context)
        
        # Infer pollution source
        source_type, source_description = intelligence.infer_pollution_source(context)
        
        # Detect early warning
        early_warning = intelligence.detect_early_warning(context)
        
        # Generate recommendations
        recommendations = intelligence.generate_government_recommendations(context, risk_category)
        
        # Also run legacy ML model for comparison/validation
        model = model_loader.get_risk_model()
        
        feature_cols = ['AQI', 'violations_7d', 'wind_speed', 'temperature', 'humidity']
        X = np.array([[
            latest_aqi,
            0,  # violations_7d (estimated)
            context['weather']['wind_speed'] or 2.0,
            context['weather']['temperature'] or 25.0,
            context['weather']['humidity'] or 60.0,
        ]]).reshape(1, -1)
        
        legacy_risk_class = int(model.predict(X)[0])
        legacy_risk_map = {0: "Low", 1: "Moderate", 2: "High", 3: "Extreme"}
        
        logger.info(
            f"[RISK] {city}: Composite={composite_risk_score} ({risk_category}), "
            f"Legacy={legacy_risk_class} ({legacy_risk_map.get(legacy_risk_class)}), "
            f"Escalation={escalation_prob*100:.1f}%, Source={source_type}"
        )
        
        # Build comprehensive response
        response = {
            'city': city,
            'data_source': data_source,
            # Primary AI-driven risk
            'risk_score': composite_risk_score,
            'risk_level': risk_category,
            'escalation_probability': round(escalation_prob * 100, 1),
            'latest_aqi': round(latest_aqi, 1),
            # Pollution source intelligence
            'pollution_source': source_type,
            'source_description': source_description,
            # Environmental context
            'environmental_context': {
                'temperature': round(context['weather']['temperature'], 1) if context['weather']['temperature'] else None,
                'humidity': round(context['weather']['humidity'], 1) if context['weather']['humidity'] else None,
                'wind_speed': round(context['weather']['wind_speed'], 2) if context['weather']['wind_speed'] else None,
                'pressure': round(context['weather']['pressure'], 1) if context['weather']['pressure'] else None,
            },
            # Early warning if triggered
            'early_warning': {
                'triggered': early_warning is not None,
                'alert_level': early_warning[0] if early_warning else None,
                'severity': early_warning[1] if early_warning else None,
            } if early_warning else None,
            # Government recommendations
            'recommendations': recommendations[:3],  # Top 3 recommendations
            # Legacy model score for validation
            'legacy_risk_level': legacy_risk_map.get(legacy_risk_class, "Unknown"),
        }
        
        return jsonify(response), 200

    except Exception as e:
        logger.error(f"[ERROR] Risk endpoint failed: {str(e)}")
        return jsonify({'error': str(e)}), 500
