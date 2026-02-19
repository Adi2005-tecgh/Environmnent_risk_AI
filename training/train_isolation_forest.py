# =====================================================
# ISOLATION FOREST - POLLUTION ANOMALY DETECTION
# =====================================================

import pandas as pd
import numpy as np
import pickle
import os

from sklearn.ensemble import IsolationForest
from sklearn.preprocessing import StandardScaler


# =====================================================
# CONFIG
# =====================================================

DATA_PATH = "../data/city_hour.csv"
MODEL_SAVE_PATH = "../models/isolation_forest.pkl"
SCALER_SAVE_PATH = "../models/iso_scaler.pkl"

feature_cols = [
    'PM2.5',
    'NO2',
    'CO',
    'SO2',
    'O3'
]


# =====================================================
# LOAD DATA
# =====================================================

print("Loading hourly dataset...")
df = pd.read_csv(DATA_PATH)

df['Datetime'] = pd.to_datetime(df['Datetime'])
df = df.sort_values(['City', 'Datetime']).reset_index(drop=True)

print("Initial shape:", df.shape)


# =====================================================
# HANDLE MISSING VALUES
# =====================================================

print("Handling missing values...")

df = df.groupby('City', group_keys=False).apply(lambda x: x.ffill().bfill())

df = df.dropna(subset=feature_cols)

print("Shape after cleaning:", df.shape)


# =====================================================
# FEATURE SELECTION
# =====================================================

X = df[feature_cols]

scaler = StandardScaler()
X_scaled = scaler.fit_transform(X)

print("Features scaled.")


# =====================================================
# TRAIN ISOLATION FOREST
# =====================================================

print("Training Isolation Forest...")

iso_model = IsolationForest(
    n_estimators=200,
    contamination=0.02,
    random_state=42,
    n_jobs=-1
)

iso_model.fit(X_scaled)

print("Training complete.")


# =====================================================
# SAVE MODEL
# =====================================================

os.makedirs("../models", exist_ok=True)

with open(MODEL_SAVE_PATH, "wb") as f:
    pickle.dump(iso_model, f)

with open(SCALER_SAVE_PATH, "wb") as f:
    pickle.dump(scaler, f)

print("Isolation Forest model saved successfully.")

preds = iso_model.predict(X_scaled)

anomaly_count = np.sum(preds == -1)
total_count = len(preds)

print("Total samples:", total_count)
print("Anomalies detected:", anomaly_count)
print("Anomaly %:", anomaly_count / total_count)

scores = iso_model.decision_function(X_scaled)

print("Score min:", scores.min())
print("Score max:", scores.max())
