import sys
import os
sys.path.append(os.path.join(os.path.dirname(__file__)))

from app.services.live_aqi_service import get_live_aqi_service

def test_live_service():
    print("Testing LiveAQIService...")
    service = get_live_aqi_service()
    
    # Test fetch_and_buffer
    data, source = service.fetch_and_buffer('Delhi')
    print(f"Source: {source}")
    
    if data:
        print(f"AQI: {data.get('aqi')}")
        print(f"PM2.5: {data.get('pm25')}")
        print(f"PM10: {data.get('pm10')}")
        print(f"NO2: {data.get('no2')}")
        print(f"Temperature: {data.get('temperature')}")
        print(f"Humidity: {data.get('humidity')}")
        print("✅ Live service working")
    else:
        print("❌ No data returned")
    
    # Test buffer
    buffer = service.get_buffer('Delhi')
    print(f"Buffer size: {len(buffer)}")
    
    return data is not None

if __name__ == "__main__":
    test_live_service()
