import os
import pickle
import tensorflow as tf
import numpy as np
import torch
from PIL import Image
from ultralytics import YOLO
from .config import Config


class ModelLoader:
    _instance = None

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(ModelLoader, cls).__new__(cls)
            cls._instance._initialize()
        return cls._instance

    def _initialize(self):
        self.models = {}
        self.scalers = {}
        print("✅ ModelLoader initialized (lazy loading enabled).")

    # ======================================================
    # LSTM MODEL
    # ======================================================

    def get_lstm_model(self):
        if "lstm" not in self.models:
            print(f"🔄 Loading LSTM model from {Config.LSTM_MODEL_PATH}...")

            if not os.path.exists(Config.LSTM_MODEL_PATH):
                raise FileNotFoundError(
                    f"LSTM model not found at {Config.LSTM_MODEL_PATH}"
                )

            # 🔥 IMPORTANT FIX
            self.models["lstm"] = tf.keras.models.load_model(
                Config.LSTM_MODEL_PATH,
                compile=False  # Prevents keras.metrics.mse deserialization error
            )

            print("✅ LSTM model loaded successfully.")

        return self.models["lstm"]

    def get_lstm_scaler(self):
        if "lstm_scaler" not in self.scalers:
            print(f"🔄 Loading LSTM scaler from {Config.LSTM_SCALER_PATH}...")

            if not os.path.exists(Config.LSTM_SCALER_PATH):
                raise FileNotFoundError(
                    f"LSTM scaler not found at {Config.LSTM_SCALER_PATH}"
                )

            with open(Config.LSTM_SCALER_PATH, "rb") as f:
                self.scalers["lstm_scaler"] = pickle.load(f)

            print("✅ LSTM scaler loaded successfully.")

        return self.scalers["lstm_scaler"]

    # ======================================================
    # RISK MODEL
    # ======================================================

    def get_risk_model(self):
        if "risk" not in self.models:
            print(f"🔄 Loading Risk model from {Config.RISK_MODEL_PATH}...")

            if not os.path.exists(Config.RISK_MODEL_PATH):
                raise FileNotFoundError(
                    f"Risk model not found at {Config.RISK_MODEL_PATH}"
                )

            with open(Config.RISK_MODEL_PATH, "rb") as f:
                self.models["risk"] = pickle.load(f)

            print("✅ Risk model loaded successfully.")

        return self.models["risk"]

    # ======================================================
    # ISOLATION FOREST
    # ======================================================

    def get_iso_forest(self):
        if "iso_forest" not in self.models:
            print(
                f"🔄 Loading Isolation Forest from {Config.ISOLATION_FOREST_PATH}..."
            )

            if not os.path.exists(Config.ISOLATION_FOREST_PATH):
                raise FileNotFoundError(
                    f"Isolation Forest not found at {Config.ISOLATION_FOREST_PATH}"
                )

            with open(Config.ISOLATION_FOREST_PATH, "rb") as f:
                self.models["iso_forest"] = pickle.load(f)

            print("✅ Isolation Forest loaded successfully.")

        return self.models["iso_forest"]

    def get_iso_scaler(self):
        if "iso_scaler" not in self.scalers:
            print(f"🔄 Loading ISO scaler from {Config.ISO_SCALER_PATH}...")

            if not os.path.exists(Config.ISO_SCALER_PATH):
                raise FileNotFoundError(
                    f"ISO scaler not found at {Config.ISO_SCALER_PATH}"
                )

            with open(Config.ISO_SCALER_PATH, "rb") as f:
                self.scalers["iso_scaler"] = pickle.load(f)

            print("✅ ISO scaler loaded successfully.")

        return self.scalers["iso_scaler"]

    # ======================================================
    # HOTSPOT MODEL (DBSCAN)
    # ======================================================

    def get_hotspot_model(self):
        if "hotspot" not in self.models:
            print(f"🔄 Loading Hotspot model from {Config.HOTSPOT_MODEL_PATH}...")

            if not os.path.exists(Config.HOTSPOT_MODEL_PATH):
                raise FileNotFoundError(
                    f"Hotspot model not found at {Config.HOTSPOT_MODEL_PATH}"
                )

            with open(Config.HOTSPOT_MODEL_PATH, "rb") as f:
                self.models["hotspot"] = pickle.load(f)

            print("✅ Hotspot model loaded successfully.")

        return self.models["hotspot"]

    def get_hotspot_scaler(self):
        if "hotspot_scaler" not in self.scalers:
            print(
                f"🔄 Loading Hotspot scaler from {Config.HOTSPOT_SCALER_PATH}..."
            )

            if not os.path.exists(Config.HOTSPOT_SCALER_PATH):
                raise FileNotFoundError(
                    f"Hotspot scaler not found at {Config.HOTSPOT_SCALER_PATH}"
                )

            with open(Config.HOTSPOT_SCALER_PATH, "rb") as f:
                self.scalers["hotspot_scaler"] = pickle.load(f)

            print("✅ Hotspot scaler loaded successfully.")

        return self.scalers["hotspot_scaler"]

    # ======================================================
    # FIRE AND SMOKE DETECTION (YOLOv8)
    # ======================================================

    def get_fire_smoke_model(self):
        print("🔥 get_fire_smoke_model called!")
        if "fire_smoke" not in self.models:
            print(f"🔄 Loading Fire/Smoke YOLOv8 model from {Config.FIRE_SMOKE_MODEL_PATH}...")
            print(f"📂 File exists check: {os.path.exists(Config.FIRE_SMOKE_MODEL_PATH)}")
            
            if not os.path.exists(Config.FIRE_SMOKE_MODEL_PATH):
                raise FileNotFoundError(
                    f"Fire/Smoke model not found at {Config.FIRE_SMOKE_MODEL_PATH}"
                )
            
            # Load YOLOv8 model
            print("🚀 About to load YOLO model...")
            self.models["fire_smoke"] = YOLO(Config.FIRE_SMOKE_MODEL_PATH)
            
            print("✅ Fire/Smoke YOLOv8 model loaded successfully.")
            print(f"🏗️ Model details: {self.models['fire_smoke'].names}")
            print(f"📊 Model classes: {list(self.models['fire_smoke'].names.values())}")
        
        return self.models["fire_smoke"]

    def classify_fire_smoke(self, image_path):
        """Classify image for fire/smoke using YOLO"""
        try:
            print(f"🔥 YOLO CLASSIFICATION: Processing {image_path}")
            
            # Check if image exists
            if not os.path.exists(image_path):
                print(f"❌ Image file not found: {image_path}")
                return self._get_no_violation_classification()
            
            # Get YOLO model
            model = self.get_fire_smoke_model()
            
            # Run inference
            results = model(image_path)
            
            # Process results
            detections = []
            max_confidence = 0.0
            detected_class = 'none'
            
            for result in results:
                boxes = result.boxes
                if boxes is not None:
                    for box in boxes:
                        # Get class and confidence
                        cls = int(box.cls[0])
                        conf = float(box.conf[0])
                        
                        # Get class name
                        class_name = model.names[cls]
                        
                        # Store detection
                        detection = {
                            'class': class_name,
                            'confidence': conf,
                            'bbox': box.xyxy[0].tolist() if box.xyxy is not None else []
                        }
                        detections.append(detection)
                        
                        # Track highest confidence detection
                        if conf > max_confidence:
                            max_confidence = conf
                            detected_class = class_name
            
            print(f"🔍 YOLO DETECTIONS: {len(detections)} objects found")
            print(f"📊 BEST DETECTION: {detected_class} with {max_confidence:.3f} confidence")
            
            # Determine violation type and severity based on detection
            if detected_class == 'fire':
                violation_type = 'fire_hazard'
                severity = 'Severe'
                action_required = 'Emergency Response Required'
            elif detected_class == 'smoke':
                violation_type = 'industrial_smoke'
                severity = 'High'
                action_required = 'Immediate Inspection Required'
            else:
                violation_type = 'no_violation'
                severity = 'Low'
                action_required = 'Routine Monitoring'
                max_confidence = 0.0
            
            return {
                'violation_type': violation_type,
                'confidence': max_confidence,
                'severity': severity,
                'action_required': action_required,
                'detected_class': detected_class,
                'all_detections': detections,
                'method': 'yolo_v8'
            }
            
        except Exception as e:
            print(f"❌ Error in YOLO classification: {e}")
            import traceback
            traceback.print_exc()
            return self._get_no_violation_classification()

    def classify_hybrid_violation(self, image_path, user_description=""):
        """Hybrid classification using text + YOLO detection"""
        try:
            print(f"🔍 HYBRID CLASSIFICATION: Processing {image_path}")
            print(f"� User description: '{user_description}'")
            
            # Initialize with text-based classification
            text_result = self._classify_from_text(user_description)
            print(f"� Text classification result: {text_result}")
            
            # Get YOLO detection
            yolo_result = self.classify_fire_smoke(image_path)
            print(f"🔮 YOLO detection result: {yolo_result}")
            
            # Fusion logic
            final_confidence = text_result['confidence']
            final_violation_type = text_result['violation_type']
            final_severity = text_result['severity']
            final_recommendation = text_result['action_required']
            
            # If YOLO detects something, use it for confirmation/boost
            if yolo_result['detected_class'] != 'none':
                detected_class = yolo_result['detected_class'].lower()
                
                # Check for confirmation (YOLO supports text classification)
                if detected_class in ['fire', 'smoke']:
                    print(f"✅ YOLO CONFIRMATION: {detected_class} matches text keywords")
                    final_confidence = min(0.95, final_confidence + 0.20)  # Boost confidence
                    print(f"📈 Confidence boosted: {final_confidence:.3f} (text: {text_result['confidence']:.3f} + yolo: +0.20)")
                else:
                    print(f"⚠️ YOLO CONTRADICTION: {detected_class} vs text keywords")
                    # Reduce confidence due to contradiction
                    final_confidence = max(0.10, final_confidence - 0.15)
                    print(f"📉 Confidence reduced: {final_confidence:.3f} (text: {text_result['confidence']:.3f} - yolo: -0.15)")
                
                # Update violation type if YOLO provides more specific info
                if detected_class == 'fire' and 'fire' not in user_description.lower():
                    final_violation_type = "fire_hazard"
                    final_severity = "Severe"
                    final_recommendation = "Emergency Response Required"
                elif detected_class == 'smoke' and 'smoke' not in user_description.lower():
                    final_violation_type = "industrial_smoke"
                    final_severity = "High"
                    final_recommendation = "Immediate Inspection Required"
            
            print(f"� HYBRID RESULT: {final_violation_type} ({final_severity}) - {final_confidence:.3f} confidence")
            print(f"💡 HYBRID RECOMMENDATION: {final_recommendation}")
            
            return {
                'violation_type': final_violation_type,
                'confidence': final_confidence,
                'severity': final_severity,
                'action_required': final_recommendation,
                'text_classification': text_result,
                'yolo_detection': yolo_result,
                'fusion_logic': 'text_primary_yolo_secondary'
            }
            
        except Exception as e:
            print(f"❌ Error in hybrid classification: {e}")
            import traceback
            traceback.print_exc()
            return self._get_no_violation_classification()

    def _classify_from_text(self, description):
        """Text-based violation classification"""
        if not description:
            description = ""
        
        description_lower = description.lower().strip()
        print(f"🔍 TEXT ANALYSIS: Processing '{description_lower}'")
        
        # Standardized category mapping
        CATEGORY_LABEL_MAP = {
            'fire': 'fire_hazard',
            'smoke': 'industrial_smoke', 
            'construction': 'construction',
            'vehicle': 'vehicle_emissions'
        }
        
        # Keyword mapping with standardized labels
        keyword_mapping = {
            'fire_hazard': {
                'keywords': ['fire', 'burning', 'flames', 'blaze', 'inferno'],
                'violation_type': 'fire_hazard',
                'severity': 'Severe',
                'base_confidence': 0.75
            },
            'industrial_smoke': {
                'keywords': ['smoke', 'factory', 'chimney', 'industrial', 'emissions', 'exhaust'],
                'violation_type': 'industrial_smoke',
                'severity': 'High',
                'base_confidence': 0.60
            },
            'construction': {
                'keywords': ['construction', 'debris', 'dust', 'building', 'demolition'],
                'violation_type': 'construction',
                'severity': 'Moderate',
                'base_confidence': 0.50
            },
            'vehicle_emissions': {
                'keywords': ['vehicle', 'exhaust', 'traffic', 'car', 'truck', 'pollution'],
                'violation_type': 'vehicle_emissions',
                'severity': 'Low',
                'base_confidence': 0.40
            }
        }
        
        # Check for keyword matches
        matched_violation = None
        max_confidence = 0.20  # Default low confidence
        
        print(f"🔍 CHECKING KEYWORDS...")
        
        for violation_type, details in keyword_mapping.items():
            keywords = details['keywords']
            print(f"   📋 Checking {violation_type} keywords: {keywords}")
            
            for keyword in keywords:
                if keyword in description_lower:
                    print(f"   ✅ TEXT MATCH: Found keyword '{keyword}' in description")
                    matched_violation = violation_type
                    matched_confidence = details['base_confidence']
                    max_confidence = max(max_confidence, matched_confidence)
                    
                    # Strong keyword match gets higher confidence
                    if violation_type == 'fire_hazard' and any(word in description_lower for word in ['fire', 'burning', 'blaze', 'inferno']):
                        matched_confidence = 0.85
                    elif violation_type == 'industrial_smoke' and any(word in description_lower for word in ['smoke', 'factory', 'chimney']):
                        matched_confidence = 0.80
                    
                    print(f"   📊 TEXT CONFIDENCE: {matched_confidence:.3f} (base: {details['base_confidence']:.3f})")
                    break
            else:
                print(f"   ❌ No matches for {violation_type} keywords")
        
        if matched_violation:
            print(f"✅ FINAL TEXT CLASSIFICATION: {matched_violation} - {max_confidence:.3f} confidence")
            return {
                'violation_type': matched_violation,
                'confidence': max_confidence,
                'severity': keyword_mapping[matched_violation]['severity'],
                'action_required': f"Immediate inspection required for {matched_violation}",
                'method': 'text_only'
            }
        else:
            print(f"❌ NO TEXT MATCH: No keywords found in '{description_lower}'")
            return {
                'violation_type': 'no_violation',
                'confidence': max_confidence,
                'severity': 'Low',
                'action_required': 'Routine Monitoring',
                'method': 'text_only'
            }

    def _get_no_violation_classification(self):
        """Fallback classification when no fire/smoke detected"""
        return {
            'violation_type': 'No Clear Violation',
            'confidence': 0.0,
            'severity': 'Low',
            'action_required': 'Routine Monitoring',
            'detected_class': 'none',
            'all_detections': []
        }


# Singleton instance
model_loader = ModelLoader()
