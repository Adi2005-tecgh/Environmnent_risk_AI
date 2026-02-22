#!/usr/bin/env python3
import sys
import os

# Add current directory to Python path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

try:
    print("Testing YOLO import...")
    from ultralytics import YOLO
    print("✅ YOLO import successful")
    
    print("Testing model loading...")
    from app.model_loader import model_loader
    
    # Test model loading
    model = model_loader.get_fire_smoke_model()
    print(f"✅ Model test: {type(model)}")
    
    # Test with a dummy image path
    print("Testing classification...")
    # result = model_loader.classify_fire_smoke("test.jpg")
    # print(f"Result: {result}")
    
except ImportError as e:
    print(f"❌ Import error: {e}")
except Exception as e:
    print(f"❌ Error: {e}")
