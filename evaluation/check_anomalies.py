    # =====================================================
# CHECK ISOLATION FOREST ANOMALIES
# =====================================================

import pandas as pd
import numpy as np
import pickle

# =====================================================
# CONFIG
# =====================================================

DATA_PATH = "../data/city_hour.csv"
MODEL_PATH = "../models/isolation_forest.pkl"
SCALER_PATH = "../models/iso_scaler.pkl"

feature_cols = [
    'PM2.5',
    'NO2',
    'CO',
    'SO2',
    'O3'
]


# =====================================================
# LOAD MODEL & SCALER
# =====================================================

print("Loading model...")

with open(MODEL_PATH, "rb") as f:
    iso_model = pickle.load(f)

with open(SCALER_PATH, "rb") as f:
    scaler = pickle.load(f)

print("Model loaded.")


# =====================================================
# LOAD DATA
# =====================================================

df = pd.read_csv(DATA_PATH)

df['Datetime'] = pd.to_datetime(df['Datetime'])
df = df.sort_values(['City', 'Datetime']).reset_index(drop=True)

df = df.groupby('City', group_keys=False).apply(lambda x: x.ffill().bfill())
df = df.dropna(subset=feature_cols)

print("Cleaned shape:", df.shape)


# =====================================================
# SCALE + PREDICT
# =====================================================

X = df[feature_cols]
X_scaled = scaler.transform(X)

df['anomaly'] = iso_model.predict(X_scaled)

# =====================================================
# SHOW SOME ANOMALIES
# =====================================================

print("\nSample anomalies:\n")

anomalies = df[df['anomaly'] == -1]

print(anomalies[['City', 'Datetime'] + feature_cols].head(10))

print("\nTotal anomalies:", len(anomalies))
print("Anomaly %:", len(anomalies) / len(df))
