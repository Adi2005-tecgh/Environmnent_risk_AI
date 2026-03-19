from flask import Blueprint, jsonify
from services.live_aqi_service import get_live_aqi_service
from services.environmental_intelligence import get_environmental_intelligence
from services.resource_optimizer import get_resource_optimizer, get_economic_impact_calculator
import logging

logger = logging.getLogger(__name__)
gov_bp = Blueprint('gov_analytics', __name__)

@gov_bp.route('/government/resource-deployment/<city>', methods=['GET'])
def get_resource_deployment(city):
    """
    Get recommended resource deployment plan.
    """
    try:
        service = get_live_aqi_service()
        intel = get_environmental_intelligence()
        optimizer = get_resource_optimizer()
        
        # Fetch data
        reading, source = service.fetch_and_buffer(city)
        if not reading:
            return jsonify({"error": f"No data found for {city}"}), 404
            
        # Get context and scoring
        context = intel.compute_environmental_context(reading)
        risk_score, risk_level, escalation_prob = intel.compute_composite_risk_score(context)
        
        # Optimize deployment
        # Simulated hotspots count (could also be fetched from hotspots service)
        num_hotspots = 2 if reading['aqi'] > 100 else 0
        deployment_plan = optimizer.get_total_deployment_plan(context, escalation_prob, num_hotspots)
        
        response = {
            "city": city,
            "data_source": source,
            "risk_category": risk_level,
            "escalation_probability": round(escalation_prob * 100, 1),
            "deployment_optimization": deployment_plan
        }
        
        return jsonify(response), 200
        
    except Exception as e:
        logger.error(f"Error in deployment route: {str(e)}")
        return jsonify({"error": str(e)}), 500

@gov_bp.route('/government/economic-impact/<city>', methods=['GET'])
def get_economic_impact(city):
    """
    Get estimated economic impact quantification.
    """
    try:
        service = get_live_aqi_service()
        intel = get_environmental_intelligence()
        calc = get_economic_impact_calculator()
        
        # Fetch data
        reading, source = service.fetch_and_buffer(city)
        if not reading:
            return jsonify({"error": f"No data found for {city}"}), 404
            
        # Get context and risk
        context = intel.compute_environmental_context(reading)
        risk_score, risk_level, escalation_prob = intel.compute_composite_risk_score(context)
        
        # Calculate impact
        num_hotspots = 2 if reading['aqi'] > 100 else 0
        impact_assessment = calc.get_comprehensive_economic_impact(context, escalation_prob, num_hotspots)
        
        response = {
            "city": city,
            "data_source": source,
            "aqi": reading['aqi'],
            "economic_impact_assessment": impact_assessment
        }
        
        return jsonify(response), 200
        
    except Exception as e:
        logger.error(f"Error in economic impact route: {str(e)}")
        return jsonify({"error": str(e)}), 500
