from flask import Blueprint, jsonify, current_app
import pandas as pd
import numpy as np
import os
from ..model_loader import model_loader
from ..config import Config

predict_bp = Blueprint('predict', __name__)

@predict_bp.route('/predict/<city>', methods=['GET'])
def predict_aqi(city):
    try:
        # Load dataset to get latest city data
        if not os.path.exists(Config.AQI_DATASET_PATH):
            return jsonify({'error': 'Dataset not found'}), 500
            
        df = pd.read_csv(Config.AQI_DATASET_PATH)
        city_df = df[df['City'].str.lower() == city.lower()]
        
        if city_df.empty:
            return jsonify({'error': f'No data found for city: {city}'}), 404
            
        # Get latest 30 days of data
        city_df = city_df.sort_values('Date').tail(30)
        
        feature_cols = [
            'PM2.5', 'PM10', 'NO2', 'CO', 'SO2', 'O3', 
            'wind_speed', 'temperature', 'humidity', 'violations_7d', 'AQI'
        ]
        target_col = 'future_aqi'
        
        # Check if we have enough data
        if len(city_df) < 30:
            return jsonify({'error': 'Insufficient historical data for prediction'}), 400
            
        # Scaling
        scaler = model_loader.get_lstm_scaler()
        model = model_loader.get_lstm_model()
        
        # Initial window
        input_data = city_df[feature_cols + [target_col]].copy()
        scaled_data = scaler.transform(input_data)
        
        current_window = scaled_data[:, :-1] # all features except target
        current_window = current_window.reshape(1, 30, len(feature_cols))
        
        predictions = []
        
        # Predict 3 days
        temp_window = current_window.copy()
        
        for _ in range(3):
            pred_scaled = model.predict(temp_window, verbose=0)
            
            # De-scale prediction
            # We need a full dummy row for the scaler
            dummy_row = np.zeros((1, len(feature_cols) + 1))
            dummy_row[0, -1] = pred_scaled[0, 0]
            unscaled_pred = scaler.inverse_transform(dummy_row)[0, -1]
            predictions.append(float(round(unscaled_pred, 2)))
            
            # Update window for next prediction (shift and append)
            # This is complex because we don't have future feature values
            # For simplicity, we'll keep other features constant or use latest
            new_row = temp_window[0, -1, :].copy()
            # If the model expects AQI in features (which it does in feature_cols), 
            # we should update the AQI feature with the new prediction for next step
            # Note: in train_lstm.py, AQI is the last feature in feature_cols
            new_row[-1] = pred_scaled[0, 0] # update AQI with predicted value
            
            temp_window = np.roll(temp_window, -1, axis=1)
            temp_window[0, -1, :] = new_row

        return jsonify({
            'city': city,
            'forecast': [
                {'day': 1, 'aqi': predictions[0]},
                {'day': 2, 'aqi': predictions[1]},
                {'day': 3, 'aqi': predictions[2]}
            ]
        }), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500
