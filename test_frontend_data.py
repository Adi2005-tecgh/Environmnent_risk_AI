import requests
import json

def test_full_api_response():
    """Test the full API response that frontend receives"""
    base_url = "http://localhost:5000"
    
    print("Testing full API responses...")
    
    # Test risk endpoint (main one with pollutants)
    try:
        response = requests.get(f"{base_url}/api/risk/Delhi", timeout=10)
        print(f"\n=== RISK ENDPOINT ===")
        print(f"Status: {response.status_code}")
        if response.status_code == 200:
            data = response.json()
            print(f"Data source: {data.get('data_source')}")
            print(f"Latest AQI: {data.get('latest_aqi')}")
            print(f"Risk level: {data.get('risk_level')}")
            print(f"Pollutants: {json.dumps(data.get('pollutants'), indent=2)}")
            print(f"Environmental context: {json.dumps(data.get('environmental_context'), indent=2)}")
        else:
            print(f"Error: {response.text}")
    except Exception as e:
        print(f"Exception: {e}")
    
    # Test predict endpoint
    try:
        response = requests.get(f"{base_url}/api/predict/Delhi", timeout=10)
        print(f"\n=== PREDICT ENDPOINT ===")
        print(f"Status: {response.status_code}")
        if response.status_code == 200:
            data = response.json()
            print(f"Data source: {data.get('data_source')}")
            print(f"Is live: {data.get('is_live')}")
            print(f"Forecast: {json.dumps(data.get('forecast'), indent=2)}")
        else:
            print(f"Error: {response.text}")
    except Exception as e:
        print(f"Exception: {e}")

if __name__ == "__main__":
    test_full_api_response()
