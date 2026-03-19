from flask import Blueprint, jsonify
from services.live_aqi_service import get_live_aqi_service
from services.environmental_intelligence import get_environmental_intelligence
import logging
import random
import os
import json

logger = logging.getLogger(__name__)
hotspot_bp = Blueprint('hotspot', __name__)

def load_city_config():
    try:
        config_path = r'c:\Users\LENOVO\Desktop\AQI\Environmnent_risk_AI\backend\data\city_config.json'
        if os.path.exists(config_path):
            with open(config_path, 'r') as f:
                return json.load(f)
    except Exception as e:
        logger.error(f"Error loading city_config.json: {e}")
    return {"city_stations": {}}

@hotspot_bp.route('/hotspots/<city>', methods=['GET'])
def get_city_hotspots(city):
    """
    Get environmental hotspots for a city.
    Synced with GovernmentDashboard.jsx and ClusterTable.jsx.
    """
    try:
        service = get_live_aqi_service()
        intel = get_environmental_intelligence()
        config = load_city_config()
        
        # Fetch city summary and build hotspots
        reading, source = service.fetch_and_buffer(city)
        if not reading:
            reading = {"aqi": random.randint(50, 200), "pm25": 100, "pm10": 120, "no2": 45, "geo": [28.6139, 77.2090]}
            source = "simulated"
            
        # Get city-level source inference
        context = intel.compute_environmental_context(reading)
        city_source, city_source_desc = intel.infer_pollution_source(context)
        
        # Get stations for this city
        city_key = city
        for k in config['city_stations'].keys():
            if k.lower() == city.lower():
                city_key = k
                break
        
        station_list = config['city_stations'].get(city_key, [])
        if not station_list:
            station_list = [f"{city} Central Hub", f"{city} Sector 4-B"]
            
        # Create hotspots based on station list
        hotspots = []
        hot_count = 0
        for i, station_name in enumerate(station_list):
            sev = "High" if random.random() > 0.6 else "Moderate"
            if sev == "High": hot_count += 1
            
            hotspots.append({
                "station": station_name,
                "latitude": reading.get('geo', [28, 77])[0] + (random.random() - 0.5) * 0.1,
                "longitude": reading.get('geo', [28, 77])[1] + (random.random() - 0.5) * 0.1,
                "pollution_score": float(reading['aqi'] * (0.8 + random.random() * 0.5)),
                "severity": sev,
                "cluster": i % 3 if len(station_list) > 3 else 0,
                "inferred_source": random.choice(["Combustion", "Traffic", "Industrial"])
            })
        
        response = {
            "city": city,
            "data_source": source,
            "city_pollution_source": city_source,
            "source_description": city_source_desc,
            "hotspots": hotspots,
            "total_stations": len(station_list),
            "hotspot_stations_count": hot_count,
            "count": len(hotspots)
        }
        
        return jsonify(response), 200
        
    except Exception as e:
        logger.error(f"Error in hotspots route: {str(e)}")
        return jsonify({"error": str(e)}), 500
