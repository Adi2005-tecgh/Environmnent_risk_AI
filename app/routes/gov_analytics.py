"""
Government Analytics & Intelligence Module

Exposes AI-driven government intelligence:
- Resource deployment optimization
- Economic impact assessment
"""

from flask import Blueprint, jsonify
import os
import logging
from ..config import Config
from ..services.live_aqi_service import get_live_aqi_service
from ..services.environmental_intelligence import get_environmental_intelligence
from ..services.resource_optimizer import get_resource_optimizer, get_economic_impact_calculator

logger = logging.getLogger(__name__)

gov_analytics_bp = Blueprint('gov_analytics', __name__)


@gov_analytics_bp.route('/government/resource-deployment/<city>', methods=['GET'])
def get_resource_deployment(city):
    """
    AI-driven resource deployment recommendations for government.
    
    Returns deployment plan for inspection teams, dust vehicles, and mobile health units.
    """
    try:
        live_aqi_service = get_live_aqi_service()
        intelligence = get_environmental_intelligence()
        optimizer = get_resource_optimizer()
        
        # Fetch live data
        pollution_reading, data_source = live_aqi_service.fetch_and_buffer(city)
        
        if pollution_reading is None:
            return jsonify({'error': f'No live data available for {city}'}), 404
        
        # Build environmental context
        context = intelligence.compute_environmental_context(pollution_reading)
        
        # Compute risk metrics
        _, risk_category, escalation_prob = intelligence.compute_composite_risk_score(context)
        
        # Count hotspots (simplified; in production, query hotspot service)
        num_hotspots = int((context['aqi'] / 50) * 5)  # Rough estimate
        
        # Get deployment plan
        deployment_plan = optimizer.get_total_deployment_plan(context, escalation_prob, num_hotspots)
        
        logger.info(f"[GOV_ANALYTICS] Deployment plan generated for {city} ({risk_category} risk)")
        
        return jsonify({
            'city': city,
            'data_source': data_source,
            'risk_category': risk_category,
            'escalation_probability': round(escalation_prob * 100, 1),
            'deployment_optimization': deployment_plan,
        }), 200
        
    except Exception as e:
        logger.error(f"[ERROR] Resource deployment endpoint failed: {str(e)}")
        return jsonify({'error': str(e)}), 500


@gov_analytics_bp.route('/government/economic-impact/<city>', methods=['GET'])
def get_economic_impact(city):
    """
    Comprehensive economic impact assessment of air pollution.
    
    Returns productivity loss, healthcare costs, and emergency expenditures.
    """
    try:
        live_aqi_service = get_live_aqi_service()
        intelligence = get_environmental_intelligence()
        econ_calc = get_economic_impact_calculator()
        
        # Fetch live data
        pollution_reading, data_source = live_aqi_service.fetch_and_buffer(city)
        
        if pollution_reading is None:
            return jsonify({'error': f'No live data available for {city}'}), 404
        
        # Build environmental context
        context = intelligence.compute_environmental_context(pollution_reading)
        
        # Compute risk metrics
        _, _, escalation_prob = intelligence.compute_composite_risk_score(context)
        
        # Estimate hotspots
        num_hotspots = int((context['aqi'] / 50) * 5)
        
        # Get economic impact
        economic_impact = econ_calc.get_comprehensive_economic_impact(
            context,
            escalation_prob,
            num_hotspots,
            population_estimate=1000000  # Default; can be city-specific
        )
        
        logger.info(f"[ECONOMIC] Impact assessment for {city}: ₹{economic_impact['total_daily_economic_impact']:,.0f}/day")
        
        return jsonify({
            'city': city,
            'data_source': data_source,
            'aqi': round(context['aqi'], 1),
            'economic_impact_assessment': economic_impact,
        }), 200
        
    except Exception as e:
        logger.error(f"[ERROR] Economic impact endpoint failed: {str(e)}")
        return jsonify({'error': str(e)}), 500
