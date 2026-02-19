from flask import Blueprint, jsonify
import pandas as pd
import os
from ..model_loader import model_loader
from ..config import Config

anomaly_bp = Blueprint('anomaly', __name__)

@anomaly_bp.route('/anomalies/<city>', methods=['GET'])
def get_anomalies(city):
    try:
        if not os.path.exists(Config.HOURLY_DATASET_PATH):
            return jsonify({'error': 'Hourly dataset not found'}), 500
            
        df = pd.read_csv(Config.HOURLY_DATASET_PATH)
        city_data = df[df['City'].str.lower() == city.lower()]
        
        if city_data.empty:
            return jsonify({'error': f'No data found for city: {city}'}), 404
            
        # Get latest 24 hours of data
        city_data['Datetime'] = pd.to_datetime(city_data['Datetime'])
        latest_data = city_data.sort_values('Datetime').tail(24)
        
        feature_cols = ['PM2.5', 'NO2', 'CO', 'SO2', 'O3']
        
        # Check for missing features
        data_to_predict = latest_data[feature_cols].copy()
        data_to_predict = data_to_predict.ffill().bfill()
        
        if data_to_predict.isnull().values.any():
             return jsonify({'error': 'Missing pollutant data for anomaly detection'}), 400

        scaler = model_loader.get_iso_scaler()
        model = model_loader.get_iso_forest()
        
        X_scaled = scaler.transform(data_to_predict)
        preds = model.predict(X_scaled)
        
        # Isolation Forest returns -1 for anomalies
        anomalies = latest_data[preds == -1].copy()
        
        return jsonify({
            'city': city,
            'total_hours_checked': 24,
            'anomaly_count': int(len(anomalies)),
            'alerts': [
                {
                    'timestamp': row['Datetime'].strftime('%Y-%m-%d %H:%M:%S'),
                    'pollutants': row[feature_cols].to_dict(),
                    'message': 'Unusual pollutant levels detected'
                } for _, row in anomalies.iterrows()
            ]
        }), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500
