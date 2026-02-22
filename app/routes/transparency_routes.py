from flask import Blueprint, jsonify
from datetime import datetime, timedelta
import random

transparency_bp = Blueprint('transparency', __name__)

# Persistent in-memory storage for transparency records
transparency_records = []

def calculate_effectiveness(initial_aqi, final_aqi):
    """Calculate effectiveness score based on AQI improvement"""
    if final_aqi is None or initial_aqi == 0:
        return None
    return round(((initial_aqi - final_aqi) / initial_aqi) * 100, 2)

def add_transparency_record(initial_aqi, ai_recommendation, gov_action, final_aqi=None, compliance=100):
    """Add a new public transparency record"""
    record = {
        "id": f"TR-{random.randint(1000, 9999)}",
        "date": datetime.now().strftime("%d %b %Y"),
        "timestamp": datetime.now().isoformat(),
        "initial_aqi": initial_aqi,
        "ai_recommendation": ai_recommendation,
        "gov_action": gov_action,
        "final_aqi": final_aqi,
        "compliance": compliance
    }
    transparency_records.insert(0, record)  # Newest first
    return record

@transparency_bp.route('/transparency/history', methods=['GET'])
def get_transparency_history():
    """Get government environmental action transparency data"""
    
    # Process records to add effectiveness
    display_records = []
    for record in transparency_records:
        r = record.copy()
        r['effectiveness'] = calculate_effectiveness(r['initial_aqi'], r['final_aqi'])
        display_records.append(r)
    
    return jsonify({
        "status": "success",
        "count": len(display_records),
        "data": display_records
    })
