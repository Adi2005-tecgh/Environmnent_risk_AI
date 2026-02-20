from flask import Blueprint, jsonify, current_app
import pandas as pd
import numpy as np
import os
import logging
from ..model_loader import model_loader
from ..config import Config
from ..services.live_aqi_service import get_live_aqi_service

logger = logging.getLogger(__name__)

predict_bp = Blueprint('predict', __name__)

@predict_bp.route('/predict/<city>', methods=['GET'])
def predict_aqi(city):
    try:
        live_aqi_service = get_live_aqi_service()
        
        # Try to fetch live data
        pollution_reading, data_source = live_aqi_service.fetch_and_buffer(city)
        
        # Get LSTM sequence
        sequence, is_live = live_aqi_service.create_lstm_sequence(city, fill_size=30)
        
        if sequence is None:
            # Fallback to CSV if neither live data nor buffer available
            if not os.path.exists(Config.AQI_DATASET_PATH):
                return jsonify({'error': 'No data source available'}), 500
                
            df = pd.read_csv(Config.AQI_DATASET_PATH)
            city_df = df[df['City'].str.lower() == city.lower()]
            
            if city_df.empty:
                return jsonify({'error': f'No data found for city: {city}'}), 404
                
            city_df = city_df.sort_values('Date').tail(30)
            
            if len(city_df) < 30:
                return jsonify({'error': 'Insufficient historical data for prediction'}), 400
                
            feature_cols = [
                'PM2.5', 'PM10', 'NO2', 'CO', 'SO2', 'O3', 
                'wind_speed', 'temperature', 'humidity', 'violations_7d', 'AQI'
            ]
            target_col = 'future_aqi'
            
            scaler = model_loader.get_lstm_scaler()
            input_data = city_df[feature_cols + [target_col]].copy()
            scaled_data = scaler.transform(input_data)
            
            sequence = scaled_data[:, :-1].reshape(1, 30, 11)
            data_source = "csv_fallback"
        
        # Load model and make prediction
        model = model_loader.get_lstm_model()
        predictions = []
        temp_window = sequence.copy()
        
        scaler = model_loader.get_lstm_scaler()
        
        for _ in range(3):
            pred_scaled = model.predict(temp_window, verbose=0)
            
            # De-scale prediction properly
            # Create a dummy row with all 12 features (11 input + 1 target)
            dummy_row = np.zeros((1, 12))
            dummy_row[0, -1] = pred_scaled[0, 0]  # Set the target (AQI/future_aqi) column
            
            try:
                # Inverse transform to get actual AQI value
                unscaled_row = scaler.inverse_transform(dummy_row)
                unscaled_pred = unscaled_row[0, -1]  # Get the AQI value
            except Exception as e:
                # Fallback: simple approximation if inverse transform fails
                logger.warning(f"De-scaling error: {e}, using approximation")
                unscaled_pred = max(0, pred_scaled[0, 0] * 300)
            
            predictions.append(float(round(max(0, unscaled_pred), 2)))
            
            # Update window for next prediction
            new_row = temp_window[0, -1, :].copy()
            new_row[-1] = pred_scaled[0, 0]  # Update AQI (last feature)
            
            temp_window = np.roll(temp_window, -1, axis=1)
            temp_window[0, -1, :] = new_row

        return jsonify({
            'city': city,
            'data_source': data_source,
            'is_live': is_live,
            'forecast': [
                {'day': 1, 'aqi': predictions[0]},
                {'day': 2, 'aqi': predictions[1]},
                {'day': 3, 'aqi': predictions[2]}
            ]
        }), 200

    except Exception as e:
        import traceback
        logger.error(f"Prediction error: {traceback.format_exc()}")
        return jsonify({'error': str(e)}), 500
