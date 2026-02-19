# =====================================================
# MODEL EVALUATION SCRIPT (NO RETRAINING)
# =====================================================

import pandas as pd
import numpy as np
import pickle
from tensorflow.keras.models import load_model
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score
from sklearn.model_selection import train_test_split


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
# LOAD & PREPARE DATA (SAME AS TRAINING)
# =====================================================

df = pd.read_csv(DATA_PATH)
df['Date'] = pd.to_datetime(df['Date'])
df = df.sort_values(['City', 'Date']).reset_index(drop=True)

df = df.groupby('City', group_keys=False).apply(lambda x: x.ffill().bfill())
df = df.dropna()

df = df[['City', 'Date'] + feature_cols + [target_col]]

# Scale
df[feature_cols + [target_col]] = scaler.transform(
    df[feature_cols + [target_col]]
)


# =====================================================
# CREATE SEQUENCES
# =====================================================

def create_sequences(data, window_size):
    X, y = [], []

    for city in data['City'].unique():
        city_df = data[data['City'] == city]
        values = city_df[feature_cols + [target_col]].values

        for i in range(len(values) - window_size):
            X.append(values[i:i+window_size, :-1])
            y.append(values[i+window_size-1, -1])

    return np.array(X), np.array(y)


X, y = create_sequences(df, WINDOW_SIZE)

# Same split logic as training
X_train, X_val, y_train, y_val = train_test_split(
    X, y,
    test_size=0.2,
    shuffle=False
)


# =====================================================
# PREDICT ON VALIDATION SET
# =====================================================

print("Evaluating model...")

y_pred_scaled = model.predict(X_val)

# Prepare for inverse scaling
dummy_pred = np.zeros((len(y_pred_scaled), len(feature_cols) + 1))
dummy_true = np.zeros((len(y_val), len(feature_cols) + 1))

dummy_pred[:, -1] = y_pred_scaled.flatten()
dummy_true[:, -1] = y_val.flatten()

# Inverse scale
y_pred_real = scaler.inverse_transform(dummy_pred)[:, -1]
y_true_real = scaler.inverse_transform(dummy_true)[:, -1]


# =====================================================
# METRICS
# =====================================================

mae = mean_absolute_error(y_true_real, y_pred_real)
rmse = np.sqrt(mean_squared_error(y_true_real, y_pred_real))
r2 = r2_score(y_true_real, y_pred_real)

print("\n===== MODEL PERFORMANCE =====")
print(f"MAE  : {mae:.2f}")
print(f"RMSE : {rmse:.2f}")
print(f"R²   : {r2:.4f}")
print("=============================")
