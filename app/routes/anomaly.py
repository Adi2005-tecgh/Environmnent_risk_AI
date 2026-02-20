from flask import Blueprint, jsonify
import pandas as pd
import numpy as np
import os
from datetime import datetime, timedelta
from ..model_loader import model_loader
from ..config import Config
from ..services.live_aqi_service import get_live_aqi_service

anomaly_bp = Blueprint('anomaly', __name__)

@anomaly_bp.route('/anomalies/<city>', methods=['GET'])
def get_anomalies(city):
    try:
        live_aqi_service = get_live_aqi_service()
        
        # Try to fetch live data
        pollution_reading, data_source = live_aqi_service.fetch_and_buffer(city)
        
        # Get buffer for city
        buffer = live_aqi_service.get_buffer(city)
        
        if buffer:
            # Use live buffer data for anomaly detection
            feature_cols = ['pm25', 'no2', 'so2', 'o3', 'co']
            
            # Extract features from buffer
            data_to_predict = []
            anomaly_timestamps = []
            
            for reading in buffer:
                features = [
                    reading.get('pm25', 0),
                    reading.get('no2', 0),
                    reading.get('so2', 0),
                    reading.get('o3', 0),
                    reading.get('co', 0),
                ]
                data_to_predict.append(features)
                anomaly_timestamps.append(reading.get('timestamp', datetime.utcnow().isoformat()))
            
            if not data_to_predict:
                return jsonify({
                    'city': city,
                    'data_source': 'live',
                    'total_hours_checked': 0,
                    'anomaly_count': 0,
                    'alerts': []
                }), 200
            
            data_to_predict = np.array(data_to_predict)
            
            # Handle zero/NaN values
            data_to_predict = np.where(data_to_predict == 0, np.nanmean(data_to_predict[data_to_predict != 0], axis=0), data_to_predict)
            
            scaler = model_loader.get_iso_scaler()
            model = model_loader.get_iso_forest()
            
            X_scaled = scaler.transform(data_to_predict)
            preds = model.predict(X_scaled)
            
            # Isolation Forest returns -1 for anomalies
            anomalies_indices = np.where(preds == -1)[0]
            
            alerts = []
            for idx in anomalies_indices:
                alerts.append({
                    'timestamp': anomaly_timestamps[idx],
                    'pollutants': {col: float(data_to_predict[idx, i]) for i, col in enumerate(feature_cols)},
                    'message': 'Unusual pollutant levels detected'
                })
            
            return jsonify({
                'city': city,
                'data_source': 'live',
                'total_hours_checked': len(buffer),
                'anomaly_count': int(len(anomalies_indices)),
                'alerts': alerts
            }), 200
        
        else:
            # Fallback to CSV
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
                'data_source': 'csv_fallback',
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
