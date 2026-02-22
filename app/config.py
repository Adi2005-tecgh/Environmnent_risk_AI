import os

class Config:
    # Base directory
    BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
    
    # Flask settings
    SECRET_KEY = os.environ.get('SECRET_KEY') or 'dev-secret-key'
    DEBUG = True
    
    # WAQI API Configuration
    WAQI_TOKEN = os.environ.get('WAQI_TOKEN', '12ad7099ee38e34b4eeafa2059289e0d763f9a6e')  # Production token
    
    # Paths
    UPLOAD_FOLDER = os.path.join(BASE_DIR, 'app', 'uploads')
    DATA_FOLDER = os.path.join(BASE_DIR, 'data')
    MODEL_FOLDER = os.path.join(BASE_DIR, 'models')
    
    # Model Paths
    LSTM_MODEL_PATH = os.path.join(MODEL_FOLDER, 'lstm_model.h5')
    LSTM_SCALER_PATH = os.path.join(MODEL_FOLDER, 'scaler.pkl')
    
    RISK_MODEL_PATH = os.path.join(MODEL_FOLDER, 'risk_model.pkl')
    
    ISOLATION_FOREST_PATH = os.path.join(MODEL_FOLDER, 'isolation_forest.pkl')
    ISO_SCALER_PATH = os.path.join(MODEL_FOLDER, 'iso_scaler.pkl')
    
    HOTSPOT_MODEL_PATH = os.path.join(MODEL_FOLDER, 'hotspot_dbscan.pkl')
    HOTSPOT_SCALER_PATH = os.path.join(MODEL_FOLDER, 'hotspot_scaler.pkl')
    
    VIOLATION_MODEL_PATH = os.path.join(MODEL_FOLDER, 'violation_classifier.h5')
    FIRE_SMOKE_MODEL_PATH = os.path.join(MODEL_FOLDER, 'best.pt')
    
    # Dataset Paths
    AQI_DATASET_PATH = os.path.join(DATA_FOLDER, 'final_hybrid_india_aqi_dataset (3).csv')
    HOURLY_DATASET_PATH = os.path.join(DATA_FOLDER, 'city_hour.csv')
    STATION_DATASET_PATH = os.path.join(DATA_FOLDER, 'station_day.csv')

# Ensure upload folder exists
os.makedirs(os.path.join(os.path.abspath(os.path.dirname(__file__)), 'uploads'), exist_ok=True)
