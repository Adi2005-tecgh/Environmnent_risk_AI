import requests
import json

def test_waqi_api():
    token = "12ad7099ee38e34b4eeafa2059289e0d763f9a6e"
    city = "Delhi"
    url = f"https://api.waqi.info/feed/{city}/?token={token}"
    
    print(f"Testing WAQI API for {city}...")
    print(f"URL: {url}")
    
    try:
        response = requests.get(url, timeout=10)
        print(f"Status Code: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print(f"Response Status: {data.get('status')}")
            
            if data.get('status') == 'ok':
                aqi_data = data.get('data', {})
                aqi = aqi_data.get('aqi')
                iaqi = aqi_data.get('iaqi', {})
                
                print(f"AQI: {aqi}")
                print(f"PM2.5: {iaqi.get('pm25', {}).get('v')}")
                print(f"PM10: {iaqi.get('pm10', {}).get('v')}")
                print(f"NO2: {iaqi.get('no2', {}).get('v')}")
                print("✅ API working correctly")
                return True
            else:
                print(f"❌ API returned status: {data.get('status')}")
                return False
        else:
            print(f"❌ HTTP Error: {response.status_code}")
            return False
            
    except Exception as e:
        print(f"❌ Exception: {str(e)}")
        return False

if __name__ == "__main__":
    test_waqi_api()
