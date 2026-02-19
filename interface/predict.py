# =====================================================
# LSTM AQI 3-DAY PREDICTION SCRIPT (FINAL VERSION)
# =====================================================

import pandas as pd
import numpy as np
import pickle
from tensorflow.keras.models import load_model


# =====================================================
# CONFIG
# =====================================================

DATA_PATH = "../data/final_hybrid_india_aqi_dataset (3).csv"
MODEL_PATH = "../models/lstm_model.h5"
SCALER_PATH = "../models/scaler.pkl"

WINDOW_SIZE = 30

feature_cols = [
    'PM2.5',
    'PM10',
    'NO2',
    'CO',
    'SO2',
    'O3',
    'wind_speed',
    'temperature',
    'humidity',
    'violations_7d',
    'AQI'
]

target_col = 'future_aqi'


# =====================================================
# LOAD MODEL & SCALER
# =====================================================

print("Loading model and scaler...")

model = load_model(MODEL_PATH, compile=False)

with open(SCALER_PATH, "rb") as f:
    scaler = pickle.load(f)

print("Loaded successfully.")


# =====================================================
# LOAD DATA
# =====================================================

df = pd.read_csv(DATA_PATH)
df['Date'] = pd.to_datetime(df['Date'])
df = df.sort_values(['City', 'Date']).reset_index(drop=True)

# Handle missing values safely
df = df.groupby('City', group_keys=False).apply(lambda x: x.ffill().bfill())
df = df.dropna()


# =====================================================
# FUNCTION: 3-DAY FORECAST
# =====================================================

def predict_next_3_days(city_name):

    city_df = df[df['City'] == city_name]

    if city_df.empty:
        raise ValueError("City not found in dataset.")

    if len(city_df) < WINDOW_SIZE:
        raise ValueError("Not enough data for this city.")

    # Last real AQI (for reference)
    last_real_aqi = city_df.tail(1)['AQI'].values[0]

    # Take last 30 days
    last_30 = city_df.tail(WINDOW_SIZE).copy()

    # Scale input (features + target)
    scaled_all = scaler.transform(last_30[feature_cols + [target_col]])

    # Remove target column from input
    current_sequence = scaled_all[:, :-1]

    predictions_scaled = []

    for _ in range(3):

        input_seq = np.expand_dims(current_sequence, axis=0)

        scaled_pred = model.predict(input_seq, verbose=0)[0][0]

        predictions_scaled.append(scaled_pred)

        # Prepare next row (copy last row and update AQI)
        new_row = current_sequence[-1].copy()
        new_row[-1] = scaled_pred  # replace AQI with predicted value

        # Slide window
        current_sequence = np.vstack([current_sequence[1:], new_row])

    # Inverse scale predictions properly
    dummy_array = np.zeros((3, len(feature_cols) + 1))

    for i in range(3):
        dummy_array[i, -1] = predictions_scaled[i]

    inv_scaled = scaler.inverse_transform(dummy_array)

    predictions_real = inv_scaled[:, -1]

    return last_real_aqi, predictions_real


# =====================================================
# TEST BLOCK
# =====================================================

if __name__ == "__main__":

    city = input("Enter City Name: ")

    last_aqi, preds = predict_next_3_days(city)

    print(f"\nLast Real AQI: {last_aqi:.2f}")

    print("\n3-Day AQI Forecast:")
    print(f"Day+1: {preds[0]:.2f}")
    print(f"Day+2: {preds[1]:.2f}")
    print(f"Day+3: {preds[2]:.2f}")
