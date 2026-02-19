# =====================================================
# RISK CLASSIFICATION MODEL (XGBOOST)
# =====================================================

import pandas as pd
import numpy as np
import pickle
import os

from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report, accuracy_score
from xgboost import XGBClassifier


# =====================================================
# CONFIG
# =====================================================

DATA_PATH = "../data/final_hybrid_india_aqi_dataset (3).csv"
MODEL_SAVE_PATH = "../models/risk_model.pkl"


# =====================================================
# LOAD DATA
# =====================================================

print("Loading dataset...")
df = pd.read_csv(DATA_PATH)

df['Date'] = pd.to_datetime(df['Date'])
df = df.sort_values(['City', 'Date']).reset_index(drop=True)

# Handle missing values
df = df.groupby('City', group_keys=False).apply(lambda x: x.ffill().bfill())
df = df.dropna()

print("Dataset ready.")


# =====================================================
# CREATE RISK LABEL
# =====================================================

def categorize_aqi(aqi):
    if aqi <= 100:
        return 0
    elif aqi <= 200:
        return 1
    elif aqi <= 300:
        return 2
    else:
        return 3


df['risk_class'] = df['future_aqi'].apply(categorize_aqi)


# =====================================================
# FEATURE ENGINEERING
# =====================================================

df['aqi_delta'] = df['future_aqi'] - df['AQI']

feature_cols = [
    'AQI',
    'violations_7d',
    'wind_speed',
    'temperature',
    'humidity'
]


X = df[feature_cols]
y = df['risk_class']


# =====================================================
# TRAIN-TEST SPLIT
# =====================================================

X_train, X_test, y_train, y_test = train_test_split(
    X, y,
    test_size=0.2,
    random_state=42
)


# =====================================================
# TRAIN MODEL
# =====================================================

print("Training Risk Model...")

model = XGBClassifier(
    n_estimators=200,
    max_depth=5,
    learning_rate=0.05,
    objective='multi:softprob',
    num_class=4,
    eval_metric='mlogloss'
)

model.fit(X_train, y_train)


# =====================================================
# EVALUATE
# =====================================================

y_pred = model.predict(X_test)

print("\n===== RISK MODEL PERFORMANCE =====")
print("Accuracy:", accuracy_score(y_test, y_pred))
print("\nClassification Report:\n")
print(classification_report(y_test, y_pred))
print("===================================")


# =====================================================
# SAVE MODEL
# =====================================================

os.makedirs("../models", exist_ok=True)

with open(MODEL_SAVE_PATH, "wb") as f:
    pickle.dump(model, f)

print("\nRisk model saved successfully.")
