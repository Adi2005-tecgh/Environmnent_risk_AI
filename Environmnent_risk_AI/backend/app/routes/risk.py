from flask import Blueprint, jsonify
from services.live_aqi_service import get_live_aqi_service
from services.environmental_intelligence import get_environmental_intelligence
import logging

logger = logging.getLogger(__name__)
risk_bp = Blueprint('risk', __name__)

@risk_bp.route('/risk/<city>', methods=['GET'])
def get_city_risk(city):
    """
    Get composite risk assessment for a city.
    Synced with RiskCard.jsx and GovernmentDashboard.jsx.
    """
    try:
        service = get_live_aqi_service()
        intel = get_environmental_intelligence()
        
        # Fetch live data
        reading, source = service.fetch_and_buffer(city)
        if not reading:
            return jsonify({"error": f"No data found for {city}"}), 404
            
        # Compute intelligence context
        context = intel.compute_environmental_context(reading)
        
        # Calculate scores
        risk_score, risk_level, escalation_prob = intel.compute_composite_risk_score(context)
        source_type, source_desc = intel.infer_pollution_source(context)
        early_warning = intel.detect_early_warning(context)
        recommendations = intel.generate_government_recommendations(context, risk_level)
        health_tip = intel.generate_health_tip(context, risk_level)
        
        # Build response
        response = {
            "city": city,
            "data_source": source,
            "risk_score": round(risk_score, 1),
            "risk_level": risk_level,
            "escalation_probability": round(escalation_prob * 100, 1),
            "pollution_source": source_type,
            "source_description": source_desc,
            "description": f"Environmental risk is {risk_level.lower()} with an AQI of {reading['aqi']}. Primary pollutant is {source_type}.",
            "latest_aqi": reading['aqi'],
            "current_aqi": reading['aqi'],
            "pollutants": context['pollutants'],
            "environmental_context": context['weather'],
            "early_warning": {
                "triggered": early_warning is not None,
                "alert_level": early_warning[0] if early_warning else None,
                "severity": early_warning[1] if early_warning else None
            },
            "recommendations": recommendations,
            "health_tip": health_tip,
            "legacy_risk_level": risk_level
        }
        
        return jsonify(response), 200
        
    except Exception as e:
        logger.error(f"Error in risk route: {str(e)}")
        return jsonify({"error": str(e)}), 500
