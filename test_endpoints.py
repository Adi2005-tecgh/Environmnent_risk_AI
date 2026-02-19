import requests
import os
import time

BASE_URL = "http://localhost:5000/api"

def test_endpoint(name, url, method="GET", files=None, data=None):
    print(f"Testing {name}: {url}...")
    try:
        if method == "GET":
            response = requests.get(url)
        else:
            response = requests.post(url, files=files, data=data)
        
        print(f"Status: {response.status_code}")
        if response.status_code in [200, 201]:
            print("Response:", response.json())
        else:
            print("Error:", response.text)
    except Exception as e:
        print(f"Connection failed: {e}")
    print("-" * 30)

if __name__ == "__main__":
    print("Starting API tests...")
    
    # Test Predict
    test_endpoint("Predict Delhi", f"{BASE_URL}/predict/Delhi")
    
    # Test Risk
    test_endpoint("Risk Delhi", f"{BASE_URL}/risk/Delhi")
    
    # Test Anomalies
    test_endpoint("Anomalies Delhi", f"{BASE_URL}/anomalies/Delhi")
    
    # Test Hotspots
    test_endpoint("Hotspots Delhi", f"{BASE_URL}/hotspots/Delhi")
    
    # Test Violation Report
    # Create a dummy image for testing
    dummy_image_path = "test_violation.jpg"
    with open(dummy_image_path, "wb") as f:
        f.write(os.urandom(1024)) # 1KB dummy image
        
    with open(dummy_image_path, "rb") as image_file:
        test_endpoint("Report Violation", f"{BASE_URL}/report_violation", 
                      method="POST", 
                      files={'image': image_file},
                      data={'name': 'Test User', 'location': 'Delhi Sector 5', 'description': 'Illegal burning'})
    
    # Clean up dummy image
    if os.path.exists(dummy_image_path):
        os.remove(dummy_image_path)

    print("Verification complete.")
