import requests
import json

def test_endpoints():
    base_url = "http://localhost:5000/api"
    
    print("Testing API endpoints...")
    
    # Test risk endpoint
    try:
        response = requests.get(f"{base_url}/risk/Delhi", timeout=10)
        print(f"Risk endpoint status: {response.status_code}")
        if response.status_code == 200:
            data = response.json()
            print(f"Risk data source: {data.get('data_source')}")
            print(f"Risk AQI: {data.get('latest_aqi')}")
            print(f"Risk PM2.5: {data.get('pollutants', {}).get('pm25')}")
            print("✅ Risk endpoint working")
        else:
            print(f"❌ Risk endpoint error: {response.text}")
    except Exception as e:
        print(f"❌ Risk endpoint exception: {e}")
    
    # Test predict endpoint
    try:
        response = requests.get(f"{base_url}/predict/Delhi", timeout=10)
        print(f"Predict endpoint status: {response.status_code}")
        if response.status_code == 200:
            data = response.json()
            print(f"Predict data source: {data.get('data_source')}")
            print(f"Predict is_live: {data.get('is_live')}")
            print("✅ Predict endpoint working")
        else:
            print(f"❌ Predict endpoint error: {response.text}")
    except Exception as e:
        print(f"❌ Predict endpoint exception: {e}")

if __name__ == "__main__":
    test_endpoints()
