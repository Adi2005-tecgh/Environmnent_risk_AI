import requests
import json

def test_with_fire_description():
    """Test with fire-related description"""
    url = "http://localhost:5000/api/report_violation"
    
    # Create a simple test image file (1x1 pixel PNG)
    test_image_data = b'\x89PNG\r\n\x1a\n\x00\x00\x00\rIHDR\x00\x00\x00\x01\x00\x00\x00\x01\x08\x02\x00\x00\x00\x90wS\xde\x00\x00\x00\tpHYs\x00\x00\x0b\x13\x00\x00\x0b\x13\x01\x00\x9a\x9c\x18\x00\x00\x00\nIDATx\x9cc\xf8\x00\x00\x00\x01\x00\x01\x00\x00\x00\x00IEND\xaeB`\x82'
    
    # Test with strong fire keywords
    test_cases = [
        {
            'name': 'Strong Fire Test',
            'description': 'There is a massive fire burning with flames and smoke coming from the factory',
            'expected_keywords': ['fire', 'burning', 'flames', 'smoke', 'factory']
        },
        {
            'name': 'Smoke Test', 
            'description': 'Heavy smoke emissions from industrial chimney',
            'expected_keywords': ['smoke', 'industrial', 'chimney']
        },
        {
            'name': 'No Keywords Test',
            'description': 'Just a normal day with clear skies',
            'expected_keywords': []
        }
    ]
    
    for i, test_case in enumerate(test_cases):
        print(f"\n🧪 TEST CASE {i+1}: {test_case['name']}")
        print(f"📝 Description: '{test_case['description']}'")
        print(f"🔍 Expected keywords: {test_case['expected_keywords']}")
        
        files = {
            'image': (f'test_{i}.png', test_image_data, 'image/png')
        }
        
        data = {
            'name': f'Test User {i}',
            'location': 'Test Location',
            'description': test_case['description']
        }
        
        try:
            response = requests.post(url, files=files, data=data)
            
            if response.status_code == 200:
                result = response.json()
                classification = result.get('classification', {})
                
                print(f"✅ Status: {response.status_code}")
                print(f"🎯 Violation Type: {classification.get('violation_type', 'N/A')}")
                print(f"📊 Confidence: {classification.get('confidence', 0):.3f}")
                print(f"⚠️ Severity: {classification.get('severity', 'N/A')}")
                print(f"💡 Action: {classification.get('action_required', 'N/A')}")
                
                # Check text classification
                text_class = classification.get('text_classification', {})
                print(f"📝 Text method: {text_class.get('method', 'N/A')}")
                
                # Check YOLO detection
                yolo_class = classification.get('yolo_detection', {})
                print(f"🔥 YOLO detected: {yolo_class.get('detected_class', 'N/A')} with {yolo_class.get('confidence', 0):.3f} confidence")
                
            else:
                print(f"❌ Status: {response.status_code}")
                print(f"❌ Error: {response.text}")
                
        except Exception as e:
            print(f"❌ ERROR: {str(e)}")

if __name__ == "__main__":
    test_with_fire_description()
