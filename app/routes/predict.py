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

# Safety bounds for AQI
AQI_MIN = 0
AQI_MAX = 500


def _get_training_feature_info(scaler):
    """Return feature names and training means if available from the scaler."""
    feature_names = getattr(scaler, 'feature_names_in_', None)
    means = getattr(scaler, 'mean_', None)
    return feature_names, means


def build_feature_vector_from_reading(reading: dict, scaler):
    """Construct feature vector in exact training order, filling missing
    values with training means when available.

    Required training order (user-specified):
    [pm25, pm10, no2, so2, o3, co, temperature, humidity, wind_speed]
    """
    # Desired order (lowercase keys expected in reading)
    desired = ['pm25', 'pm10', 'no2', 'so2', 'o3', 'co', 'temperature', 'humidity', 'wind_speed']

    feature_names, means = _get_training_feature_info(scaler)

    vals = []
    for i, key in enumerate(desired):
        raw = reading.get(key)
        if raw is None:
            # Prefer training mean for this feature if available and names align
            if feature_names is not None and means is not None:
                try:
                    # Find index of this feature in scaler.feature_names_in_
                    # Some scalers may use different naming; try case-insensitive match
                    idx = next((j for j, n in enumerate(feature_names) if n.lower().startswith(key)), None)
                    if idx is not None:
                        substitute = float(means[idx])
                    else:
                        substitute = None
                except Exception:
                    substitute = None
            else:
                substitute = None

            if substitute is None:
                # sensible defaults (not zero)
                defaults = {'pm25': 25.0, 'pm10': 40.0, 'no2': 20.0, 'so2': 5.0, 'o3': 30.0, 'co': 0.5,
                            'temperature': 25.0, 'humidity': 60.0, 'wind_speed': 2.0}
                vals.append(defaults.get(key, 0.0))
            else:
                vals.append(substitute)
        else:
            vals.append(float(raw))

    return np.array(vals)


def apply_rolling_mean_if_needed(sequence, scaler):
    """If scaler feature names indicate rolling averages were used during
    training, apply a rolling mean along the timesteps axis (window=3).
    Returns the possibly-modified sequence.
    """
    feature_names = getattr(scaler, 'feature_names_in_', None)
    if feature_names is None:
        return sequence

    if any(('ma' in n.lower() or 'rolling' in n.lower() or 'avg' in n.lower()) for n in feature_names):
        # Apply simple moving average with window 3 along timesteps axis
        kernel = np.ones(3) / 3.0
        seq = sequence.copy()
        # seq shape: (1, timesteps, n_features)
        timesteps = seq.shape[1]
        for f in range(seq.shape[2]):
            col = seq[0, :, f]
            # pad edges by repeating
            padded = np.pad(col, (1, 1), mode='edge')
            ma = np.convolve(padded, kernel, mode='valid')
            seq[0, :, f] = ma
        logger.info('[ROLLING] Applied rolling-mean wrapper to sequence')
        return seq

    return sequence


def scale_live_sequence(sequence, scaler):
    """
    Scale live data sequence to match training distribution.
    
    Args:
        sequence: np.ndarray of shape (1, 30, 11) with raw feature values
        scaler: StandardScaler fitted on training data
        
    Returns:
        scaled_sequence: np.ndarray of same shape with scaled values
    """
    # Reshape sequence for scaling: (30, n_features)
    batch_size, timesteps, n_features = sequence.shape
    seq_reshaped = sequence.reshape(-1, n_features)

    logger.info(f"[SCALE] Input shape before scaling: {seq_reshaped.shape}")
    logger.info(f"[SCALE] Sample raw values (first row): {seq_reshaped[0]}")

    # Handle mismatch between scaler expected features and live input features.
    expected = getattr(scaler, 'n_features_in_', None)

    if expected is not None and expected != n_features:
        # If scaler was fitted on training rows including the target column
        # (i.e. expected == n_features + 1), pad a dummy target column,
        # transform, then drop the extra column. This preserves the scaler's
        # learned parameters without changing other code paths.
        if expected == n_features + 1:
            logger.info(f"[SCALE] Scaler expects {expected} features, padding one dummy column")
            seq_padded = np.zeros((seq_reshaped.shape[0], expected))
            seq_padded[:, :n_features] = seq_reshaped
            seq_scaled_padded = scaler.transform(seq_padded)
            seq_scaled = seq_scaled_padded[:, :n_features]
        else:
            # Unexpected mismatch: attempt transform and let sklearn raise a clear error
            logger.warning(f"[SCALE] Unexpected feature mismatch: scaler expects {expected}, got {n_features}")
            seq_scaled = scaler.transform(seq_reshaped)
    else:
        # Expected match: transform directly
        seq_scaled = scaler.transform(seq_reshaped)

    logger.info(f"[SCALE] Sample scaled values (first row): {seq_scaled[0]}")
    logger.info(f"[SCALE] Scaler data_min_: {getattr(scaler, 'data_min_', None)}")
    logger.info(f"[SCALE] Scaler data_max_: {getattr(scaler, 'data_max_', None)}")

    # Reshape back to (1, timesteps, n_features)
    seq_scaled = seq_scaled.reshape(batch_size, timesteps, n_features)

    return seq_scaled


def inverse_transform_aqi(pred_scaled, scaler):
    """
    Safely inverse transform a single AQI prediction.
    
    Args:
        pred_scaled: float, scaled prediction from model
        scaler: StandardScaler
        
    Returns:
        float: unscaled AQI value, clipped to [0, 500]
    """
    # Create dummy row with 12 features (11 input + 1 target for inverse transform)
    dummy_row = np.zeros((1, 12))
    dummy_row[0, -1] = pred_scaled  # Last column is the AQI target
    
    try:
        # Inverse transform
        unscaled_row = scaler.inverse_transform(dummy_row)
        unscaled_aqi = float(unscaled_row[0, -1])
        
        logger.info(f"[INVERSE] Scaled input: {pred_scaled:.6f} → Unscaled output: {unscaled_aqi:.2f}")
        
    except Exception as e:
        logger.error(f"[INVERSE] Error during inverse transform: {e}")
        # Fallback: use linear approximation
        unscaled_aqi = pred_scaled * (scaler.data_max_[-1] - scaler.data_min_[-1]) + scaler.data_min_[-1]
        logger.warning(f"[INVERSE] Using fallback calculation: {unscaled_aqi:.2f}")
    
    # CRITICAL SAFETY: Clip to realistic AQI bounds
    clipped_aqi = np.clip(unscaled_aqi, AQI_MIN, AQI_MAX)
    
    if clipped_aqi != unscaled_aqi:
        logger.warning(f"[CLIP] AQI clipped from {unscaled_aqi:.2f} to {clipped_aqi:.2f}")
    
    return float(clipped_aqi)


@predict_bp.route('/predict/<city>', methods=['GET'])
def predict_aqi(city):
    """
    Predict 3-day AQI forecast with proper scaling, clipping, and validation.
    """
    try:
        logger.info(f"\n{'='*80}")
        logger.info(f"[START] AQI Prediction for {city}")
        logger.info(f"{'='*80}\n")
        
        live_aqi_service = get_live_aqi_service()
        scaler = model_loader.get_lstm_scaler()
        model = model_loader.get_lstm_model()
        # Debug: print scaler info (do NOT refit)
        feature_names = getattr(scaler, 'feature_names_in_', None)
        scaler_means = getattr(scaler, 'mean_', None)
        logger.info(f"[SCALER] n_features_in_: {getattr(scaler, 'n_features_in_', None)}")
        logger.info(f"[SCALER] feature_names_in_: {feature_names}")
        logger.info(f"[SCALER] mean_: {scaler_means}")
        print("MODEL TRAINING FEATURES:", feature_names)
        print("MODEL TRAINING MEANS:", scaler_means)
        
        # Try to fetch live data
        pollution_reading, data_source = live_aqi_service.fetch_and_buffer(city)
        logger.info(f"[DATA] Source: {data_source}")
        
        # Get LSTM sequence
        sequence, is_live = live_aqi_service.create_lstm_sequence(city, fill_size=30)
        
        # If we don't have a full live sequence but we do have a recent live reading,
        # build a hybrid sequence using recent CSV historical rows and the latest
        # live reading as the final timestep. This ensures predictions reflect
        # the latest live measurement without disrupting other code paths.
        if (sequence is None or not is_live) and pollution_reading is not None:
            logger.info("[HYBRID] Building hybrid sequence from CSV + live reading")
            # Load CSV historical rows for the city
            if not os.path.exists(Config.AQI_DATASET_PATH):
                logger.error("[ERROR] CSV dataset not found for hybrid sequence")
                # Fall through to existing handling below
            else:
                df = pd.read_csv(Config.AQI_DATASET_PATH)
                city_df = df[df['City'].str.lower() == city.lower()]

                if not city_df.empty:
                    city_df = city_df.sort_values('Date').tail(30)
                    # If fewer than 29 historical rows, repeat last to make room
                    if len(city_df) < 29:
                        # Repeat last row until we have 29
                        rows = list(city_df.to_dict('records'))
                        while len(rows) < 29:
                            rows.append(rows[-1])
                        city_df = pd.DataFrame(rows)

                    # Prepare feature columns (11 features) and target.
                    # NOTE: Use training-aligned ordering: pollutant features first,
                    # then temperature/humidity/wind, then violations and AQI.
                    feature_cols = [
                        'PM2.5', 'PM10', 'NO2', 'SO2', 'O3', 'CO',
                        'temperature', 'humidity', 'wind_speed', 'violations_7d', 'AQI'
                    ]
                    target_col = 'future_aqi'

                    # Build input matrix from historical rows (up to 29)
                    hist_rows = city_df[feature_cols + [target_col]].copy().tail(29)

                    try:
                        hist_scaled = scaler.transform(hist_rows)
                        hist_features = hist_scaled[:, :-1]  # shape (29, 11)

                        # Build live features vector (same ordering as feature_cols)
                        fv9 = build_feature_vector_from_reading({
                            'pm25': pollution_reading.get('pm25'),
                            'pm10': pollution_reading.get('pm10'),
                            'no2': pollution_reading.get('no2'),
                            'so2': pollution_reading.get('so2'),
                            'o3': pollution_reading.get('o3'),
                            'co': pollution_reading.get('co'),
                            'temperature': pollution_reading.get('temperature', None),
                            'humidity': pollution_reading.get('humidity', None),
                            'wind_speed': pollution_reading.get('wind_speed', None),
                        }, scaler)

                        violations = pollution_reading.get('violations_7d', 0)
                        aqi_val = float(pollution_reading.get('aqi') or 0.0)

                        live_vals = np.concatenate([fv9, [violations, aqi_val]])

                        # Create dummy row with target placeholder to match scaler input shape
                        dummy_row = np.zeros((1, hist_rows.shape[1]))
                        dummy_row[0, :11] = live_vals
                        dummy_row[0, -1] = aqi_val  # set target placeholder

                        logger.info(f"[HYBRID] LIVE FEATURE (pre-scale): {live_vals}")
                        print("LIVE AQI:", aqi_val)

                        live_scaled = scaler.transform(dummy_row)[0, :-1]
                        logger.info(f"[HYBRID] LIVE FEATURE (post-scale): {live_scaled}")

                        # Concatenate historical features and overlay the final few
                        # timesteps with the live_scaled vector so predictions reflect
                        # the most recent live measurement.
                        seq_array = np.vstack([hist_features, live_scaled])

                        # Influence count: how many final timesteps to set to live reading
                        LIVE_INFLUENCE_COUNT = 3
                        k = min(LIVE_INFLUENCE_COUNT, seq_array.shape[0])
                        if k > 0:
                            seq_array[-k:, :] = live_scaled
                        sequence = seq_array.reshape(1, 30, 11)
                        is_live = True
                        data_source = 'live_hybrid'
                        logger.info('[HYBRID] Hybrid sequence built successfully')
                    except Exception as e:
                        logger.error(f"[HYBRID] Failed to build hybrid sequence: {e}")
                        # Fall back to existing handling below
                else:
                    logger.warning(f"[HYBRID] No CSV history for {city}, cannot build hybrid sequence")

        if sequence is None:
            logger.info("[SEQUENCE] No live buffer, falling back to CSV")
            
            # Fallback to CSV
            if not os.path.exists(Config.AQI_DATASET_PATH):
                logger.error("[ERROR] CSV dataset not found")
                return jsonify({'error': 'No data source available'}), 500
                
            df = pd.read_csv(Config.AQI_DATASET_PATH)
            city_df = df[df['City'].str.lower() == city.lower()]
            
            if city_df.empty:
                logger.error(f"[ERROR] No CSV data for {city}")
                return jsonify({'error': f'No data found for city: {city}'}), 404
                
            city_df = city_df.sort_values('Date').tail(30)
            
            if len(city_df) < 30:
                logger.error(f"[ERROR] Insufficient CSV data: {len(city_df)} rows")
                return jsonify({'error': 'Insufficient historical data for prediction'}), 400
                
            feature_cols = [
                'PM2.5', 'PM10', 'NO2', 'SO2', 'O3', 'CO',
                'temperature', 'humidity', 'wind_speed', 'violations_7d', 'AQI'
            ]
            target_col = 'future_aqi'
            
            logger.info(f"[CSV] Using {len(city_df)} rows, {len(feature_cols)} features")
            
            input_data = city_df[feature_cols + [target_col]].copy()
            logger.info(f"[CSV] Raw AQI range: [{input_data['AQI'].min():.1f}, {input_data['AQI'].max():.1f}]")
            
            scaled_data = scaler.transform(input_data)
            sequence = scaled_data[:, :-1].reshape(1, 30, 11)
            data_source = "csv_fallback"
            logger.info("[CSV] Data scaled successfully")
        
        else:
            # Rebuild live sequence from buffer in training feature order
            logger.info("[LIVE] Rebuilding live sequence from buffer with training feature order")
            buffer = live_aqi_service.get_buffer(city)
            seq_rows = []
            for reading in buffer[-30:]:
                fv9 = build_feature_vector_from_reading({
                    'pm25': reading.get('pm25'),
                    'pm10': reading.get('pm10'),
                    'no2': reading.get('no2'),
                    'so2': reading.get('so2'),
                    'o3': reading.get('o3'),
                    'co': reading.get('co'),
                    'temperature': reading.get('temperature', None),
                    'humidity': reading.get('humidity', None),
                    'wind_speed': reading.get('wind_speed', None),
                }, scaler)
                violations = reading.get('violations_7d', 0)
                aqi_val = float(reading.get('aqi') or 0.0)
                row = np.concatenate([fv9, [violations, aqi_val]])
                seq_rows.append(row)

            # If buffer shorter than 30, repeat last
            if len(seq_rows) < 30 and seq_rows:
                last = seq_rows[-1]
                while len(seq_rows) < 30:
                    seq_rows.append(last.copy())

            if not seq_rows:
                logger.warning('[LIVE] Buffer empty when rebuilding sequence; falling back to CSV later')
            else:
                sequence = np.array(seq_rows).reshape(1, 30, -1)
                logger.info(f"[LIVE] Sample live feature (pre-scale): {sequence[0,0,:]}")
                print("MODEL INPUT:", sequence[0,0,:])

                # Apply rolling-mean wrapper if scaler indicates moving-average features
                sequence = apply_rolling_mean_if_needed(sequence, scaler)

                # Scale using scaler (scale_live_sequence handles padding if needed)
                logger.info("[LIVE] Scaling live data sequence")
                sequence = scale_live_sequence(sequence, scaler)
                logger.info("[LIVE] Live sequence scaled")
        
        logger.info(f"[MODEL] Input sequence shape: {sequence.shape}")
        logger.info(f"[MODEL] Sample scaled sequence (first timestep): {sequence[0, 0]}")
        
        # If we built a hybrid sequence from a single recent live reading and
        # the live buffer is still small, prefer a simple persistence-based
        # forecast anchored to the latest live AQI so results reflect the API.
        buffer_size = len(live_aqi_service.get_buffer(city))
        if data_source == 'live_hybrid' and buffer_size < 5 and pollution_reading is not None:
            logger.info('[PERSISTENCE] Using persistence forecast due to small live buffer')
            base_aqi = float(pollution_reading.get('aqi') or 0.0)
            decay = 0.95
            predictions = [
                float(np.clip(base_aqi, AQI_MIN, AQI_MAX)),
                float(np.clip(base_aqi * decay, AQI_MIN, AQI_MAX)),
                float(np.clip(base_aqi * decay * decay, AQI_MIN, AQI_MAX)),
            ]
            logger.info(f"[PERSISTENCE] Forecast: {predictions}")
            return jsonify({
                'city': city,
                'data_source': data_source,
                'is_live': True,
                'forecast': [
                    {'day': 1, 'aqi': predictions[0]},
                    {'day': 2, 'aqi': predictions[1]},
                    {'day': 3, 'aqi': predictions[2]}
                ]
            }), 200

        # Make predictions with safety guards
        predictions = []
        temp_window = sequence.copy()
        
        for day in range(1, 4):
            logger.info(f"\n[FORECAST] Day {day} prediction")
            logger.info(f"[FORECAST] Input window shape: {temp_window.shape}")
            
            # Get scaled prediction from model
            pred_scaled = model.predict(temp_window, verbose=0)[0, 0]
            logger.info(f"[FORECAST] Raw model output (scaled): {pred_scaled:.6f}")
            
            # Inverse transform to get actual AQI
            aqi_value = inverse_transform_aqi(pred_scaled, scaler)
            print("PREDICTED AQI:", aqi_value)
            
            # Store prediction
            predictions.append(aqi_value)
            logger.info(f"[FORECAST] Final AQI for Day {day}: {aqi_value:.2f}\n")
            
            # Update window for next prediction with CLIPPED scaled value
            # CRITICAL: Clip the scaled value to prevent explosive behavior
            new_row = temp_window[0, -1, :].copy()
            
            # Inverse transform the prediction to get raw values, then scale again
            # This prevents propagating out-of-distribution scaled values
            raw_aqi = inverse_transform_aqi(pred_scaled, scaler)
            
            # Create a dummy raw row with the predicted AQI
            dummy_raw = np.zeros((1, 12))
            dummy_raw[0, -1] = raw_aqi  # Set AQI to predicted value
            
            # Scale it properly for the next window
            predicted_scaled_row = scaler.transform(dummy_raw)[0, :11]  # Get scaled features (exclude target)
            
            new_row[-1] = predicted_scaled_row[-1]  # Update only AQI feature (last column)
            logger.info(f"[WINDOW] Updated last feature (AQI) from scaled: {predicted_scaled_row[-1]:.6f}")
            
            # Shift window
            temp_window = np.roll(temp_window, -1, axis=1)
            temp_window[0, -1, :] = new_row
            logger.info(f"[WINDOW] Window shifted for next prediction")
        
        # Final sanity check
        logger.info(f"\n[FINAL] Predictions: {predictions}")
        # If live reading exists, ensure predictions are within realistic range.
        if pollution_reading is not None:
            live_aqi_val = float(pollution_reading.get('aqi') or 0.0)
            if live_aqi_val > 0:
                pred_ref = predictions[0]
                rel_err = abs(pred_ref - live_aqi_val) / float(live_aqi_val)
                logger.info(f"[FINAL] Live AQI: {live_aqi_val}, Predicted Day1: {pred_ref}, RelError: {rel_err:.3f}")
                print("LIVE AQI:", live_aqi_val)
                # If mismatch >15%, rescale predictions proportionally (safety cap)
                if rel_err > 0.15:
                    factor = live_aqi_val / (pred_ref if pred_ref != 0 else 1.0)
                    factor = np.clip(factor, 0.7, 1.3)
                    logger.warning(f"[SCALE_FIX] Rescaling predictions by factor {factor:.3f} to match live AQI")
                    predictions = [float(np.clip(p * factor, AQI_MIN, AQI_MAX)) for p in predictions]
                    logger.info(f"[SCALE_FIX] Rescaled predictions: {predictions}")
        for i, pred in enumerate(predictions):
            if pred < AQI_MIN or pred > AQI_MAX:
                logger.error(f"[FINAL] ALERT: Prediction {i+1} = {pred} is outside bounds [{AQI_MIN}, {AQI_MAX}]")
            if pred > 300:
                logger.warning(f"[FINAL] WARNING: Prediction {i+1} = {pred} is unusually high (> 300)")
        
        logger.info(f"{'='*80}")
        logger.info(f"[END] AQI Prediction complete for {city}")
        logger.info(f"{'='*80}\n")
        
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
        logger.error(f"\n[EXCEPTION] Prediction failed:\n{traceback.format_exc()}\n")
        return jsonify({'error': str(e)}), 500
