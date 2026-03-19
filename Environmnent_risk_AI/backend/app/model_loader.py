import os
import pickle
import logging
import numpy as np
import tensorflow as tf
from tensorflow.keras.models import load_model

logger = logging.getLogger(__name__)

class ModelLoader:
    """
    Singleton class to load and manage all ML models and scalers.
    """
    def __init__(self):
        self.models_dir = r'c:\Users\LENOVO\Desktop\AQI\Environmnent_risk_AI\backend\models'
        self.models = {}
        self.scalers = {}
        self._load_all()

    def _load_all(self):
        try:
            # Load LSTM Model
            lstm_path = os.path.join(self.models_dir, 'lstm_model.h5')
            if os.path.exists(lstm_path):
                self.models['lstm'] = load_model(lstm_path)
                logger.info("✅ LSTM model loaded successfully")
            
            # Load Isolation Forest
            iso_path = os.path.join(self.models_dir, 'isolation_forest.pkl')
            if os.path.exists(iso_path):
                with open(iso_path, 'rb') as f:
                    self.models['isolation_forest'] = pickle.load(f)
                logger.info("✅ Isolation Forest model loaded successfully")
            
            # Load Risk Model (XGBoost/Pickle)
            risk_path = os.path.join(self.models_dir, 'risk_model.pkl')
            if os.path.exists(risk_path):
                with open(risk_path, 'rb') as f:
                    self.models['risk'] = pickle.load(f)
                logger.info("✅ Risk assessment model loaded successfully")
            
            # Load Scalers
            scaler_files = {
                'scaler': 'scaler.pkl',
                'iso_scaler': 'iso_scaler.pkl',
                'hotspot_scaler': 'hotspot_scaler.pkl'
            }
            for key, filename in scaler_files.items():
                path = os.path.join(self.models_dir, filename)
                if os.path.exists(path):
                    with open(path, 'rb') as f:
                        self.scalers[key] = pickle.load(f)
                    logger.info(f"✅ Scaler '{key}' loaded successfully")
            
            # Load DBSCAN
            dbscan_path = os.path.join(self.models_dir, 'hotspot_dbscan.pkl')
            if os.path.exists(dbscan_path):
                with open(dbscan_path, 'rb') as f:
                    self.models['dbscan'] = pickle.load(f)
                logger.info("✅ DBSCAN hotspot model loaded successfully")
                
        except Exception as e:
            logger.error(f"❌ Error during model/scaler loading: {e}")

    def get_model(self, name):
        return self.models.get(name)

    def get_scaler(self, name):
        return self.scalers.get(name)

# Global singleton
_model_loader = None

def get_model_loader():
    global _model_loader
    if _model_loader is None:
        _model_loader = ModelLoader()
    return _model_loader
