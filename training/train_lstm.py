# =====================================================
# ENVIRONMENTAL RISK AI PROJECT
# LSTM AQI FORECAST TRAINING (HYBRID DATASET)
# =====================================================

import pandas as pd
import numpy as np
import os
import pickle

from sklearn.preprocessing import MinMaxScaler
from sklearn.model_selection import train_test_split

from tensorflow.keras.models import Sequential
from tensorflow.keras.layers import LSTM, Dense, Dropout
from tensorflow.keras.callbacks import EarlyStopping


# =====================================================
# CONFIG
# =====================================================

DATA_PATH = "../data/final_hybrid_india_aqi_dataset (3).csv"
MODEL_SAVE_PATH = "../models/lstm_model.h5"
SCALER_SAVE_PATH = "../models/scaler.pkl"

WINDOW_SIZE = 30
EPOCHS = 25
BATCH_SIZE = 32


# =====================================================
# STEP 1: LOAD DATA
# =====================================================

print("Loading dataset...")
df = pd.read_csv(DATA_PATH)

print("Initial Shape:", df.shape)

# Convert Date column
df['Date'] = pd.to_datetime(df['Date'])

# Sort by City + Date (CRITICAL for time series)
df = df.sort_values(['City', 'Date']).reset_index(drop=True)


# =====================================================
# STEP 2: HANDLE MISSING VALUES
# =====================================================

print("\nHandling missing values...")

# Forward + Backward fill per city
df = df.groupby('City').apply(lambda x: x.ffill().bfill())
df = df.reset_index(drop=True)

# Drop any remaining nulls
df = df.dropna()

print("Remaining nulls:")
print(df.isnull().sum())


# =====================================================
# STEP 3: FEATURE SELECTION
# =====================================================

print("\nSelecting features...")

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

# Keep only required columns
df = df[['City', 'Date'] + feature_cols + [target_col]]

print("Final Columns:", df.columns)


# =====================================================
# STEP 4: SCALING
# =====================================================

print("\nScaling features...")

scaler = MinMaxScaler()

df[feature_cols + [target_col]] = scaler.fit_transform(
    df[feature_cols + [target_col]]
)

# Save scaler
os.makedirs("../models", exist_ok=True)
with open(SCALER_SAVE_PATH, "wb") as f:
    pickle.dump(scaler, f)

print("Scaler saved.")


# =====================================================
# STEP 5: CREATE SEQUENCES
# =====================================================

print("\nCreating sequences...")

def create_sequences(data, window_size):
    X, y = [], []

    cities = data['City'].unique()

    for city in cities:
        city_df = data[data['City'] == city]

        values = city_df[feature_cols + [target_col]].values

        for i in range(len(values) - window_size):
            X.append(values[i:i+window_size, :-1])  # all features
            y.append(values[i+window_size-1, -1])   # future_aqi

    return np.array(X), np.array(y)


X, y = create_sequences(df, WINDOW_SIZE)

print("X shape:", X.shape)
print("y shape:", y.shape)


# =====================================================
# STEP 6: TRAIN-VALIDATION SPLIT
# =====================================================

X_train, X_val, y_train, y_val = train_test_split(
    X, y,
    test_size=0.2,
    shuffle=False  # NEVER shuffle time series
)

print("Training samples:", X_train.shape[0])
print("Validation samples:", X_val.shape[0])


# =====================================================
# STEP 7: BUILD LSTM MODEL
# =====================================================

print("\nBuilding LSTM model...")

model = Sequential()

model.add(LSTM(64, return_sequences=True,
               input_shape=(WINDOW_SIZE, len(feature_cols))))
model.add(Dropout(0.2))

model.add(LSTM(32))
model.add(Dropout(0.2))

model.add(Dense(16, activation='relu'))
model.add(Dense(1))

model.compile(
    optimizer='adam',
    loss='mse'
)

model.summary()


# =====================================================
# STEP 8: TRAIN MODEL
# =====================================================

early_stop = EarlyStopping(
    monitor='val_loss',
    patience=5,
    restore_best_weights=True
)

print("\nTraining model...")

history = model.fit(
    X_train,
    y_train,
    validation_data=(X_val, y_val),
    epochs=EPOCHS,
    batch_size=BATCH_SIZE,
    callbacks=[early_stop]
)


# =====================================================
# STEP 9: SAVE MODEL
# =====================================================

model.save(MODEL_SAVE_PATH)

print("\nModel saved successfully.")
print("Training complete.")
