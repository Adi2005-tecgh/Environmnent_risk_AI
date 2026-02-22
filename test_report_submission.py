import requests
import json

def test_report_submission():
    """Test the report submission endpoint"""
    url = "http://localhost:5000/api/report_violation"
    
    # Create a simple test image file (1x1 pixel PNG)
    test_image_data = b'\x89PNG\r\n\x1a\n\x00\x00\x00\rIHDR\x00\x00\x00\x01\x00\x00\x00\x01\x08\x02\x00\x00\x00\x90wS\xde\x00\x00\x00\tpHYs\x00\x00\x0b\x13\x00\x00\x0b\x13\x01\x00\x9a\x9c\x18\x00\x00\x00\nIDATx\x9cc\xf8\x00\x00\x00\x01\x00\x01\x00\x00\x00\x00IEND\xaeB`\x82'
    
    # Prepare form data
    files = {
        'image': ('test.png', test_image_data, 'image/png')
    }
    
    data = {
        'name': 'Test User',
        'location': 'Test Location',
        'description': 'Test fire violation'
    }
    
    try:
        print("🧪 Testing report submission...")
        print(f"📡 URL: {url}")
        print(f"📝 Form data: {data}")
        
        response = requests.post(url, files=files, data=data)
        
        print(f"📊 Status Code: {response.status_code}")
        print(f"📋 Response Headers: {dict(response.headers)}")
        
        try:
            response_json = response.json()
            print(f"✅ Response JSON: {json.dumps(response_json, indent=2)}")
        except:
            print(f"❌ Response Text: {response.text}")
            
        return response.status_code == 200
        
    except Exception as e:
        print(f"❌ ERROR: {str(e)}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == "__main__":
    success = test_report_submission()
    print(f"\n🎯 Test Result: {'PASSED' if success else 'FAILED'}")
