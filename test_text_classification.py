import sys
import os

# Add current directory to Python path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app.model_loader import model_loader

def test_text_classification():
    """Test text classification directly"""
    
    test_cases = [
        "There is a massive fire burning with flames and smoke coming from the factory",
        "Heavy smoke emissions from industrial chimney", 
        "Just a normal day with clear skies"
    ]
    
    for i, description in enumerate(test_cases):
        print(f"\n🧪 TEST {i+1}: '{description}'")
        result = model_loader._classify_from_text(description)
        print(f"🎯 Result: {result}")

if __name__ == "__main__":
    test_text_classification()
