"""
Government Analytics & Intelligence Module

Exposes AI-driven government intelligence:
- Resource deployment optimization
- Economic impact assessment
"""

from flask import Blueprint, jsonify, request
import os
import logging
from ..config import Config
from ..services.live_aqi_service import get_live_aqi_service
from ..services.environmental_intelligence import get_environmental_intelligence
from ..services.resource_optimizer import get_resource_optimizer, get_economic_impact_calculator
from .transparency_routes import add_transparency_record

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


@gov_analytics_bp.route('/government/resource-deployment', methods=['POST'])
def generate_resource_deployment():
    """
    Generate resource deployment recommendation for a specific reported violation.
    """
    try:
        data = request.get_json()
        if not data:
            logger.error("[GOV_ANALYTICS] No data provided in POST request")
            return jsonify({'error': 'No data provided'}), 400
            
        violation_type = str(data.get('violation_type', 'Unknown')).strip()
        risk_level = str(data.get('risk_level', 'Low')).strip()
        location = str(data.get('location', 'Unknown')).strip()
        confidence = data.get('confidence', 0)
        aqi = data.get('aqi')
        
        logger.info(f"[GOV_ANALYTICS] Generating deployment for {violation_type} at {location} (Risk: {risk_level})")
        
        # Logic to generate recommendation
        recommendation = f"<div class='space-y-3 p-1'>"
        recommendation += f"<div class='flex items-center justify-between mb-2 border-b border-slate-100 pb-2'>"
        recommendation += f"  <p class='font-black text-slate-800 uppercase tracking-tight text-sm'>AI Deployment Strategy</p>"
        recommendation += f"  <span class='text-[10px] font-black bg-blue-600 text-white px-2 py-0.5 rounded'>REPORT #{id(data) % 10000}</span>"
        recommendation += f"</div>"
        
        recommendation += f"<div class='flex gap-2 mb-3'>"
        recommendation += f"  <span class='px-2 py-1 bg-slate-900 text-white text-[9px] font-black rounded uppercase tracking-wider'>Priority: {risk_level}</span>"
        recommendation += f"  <span class='px-2 py-1 bg-blue-50 text-blue-700 border border-blue-100 text-[9px] font-black rounded uppercase tracking-wider'>{location}</span>"
        recommendation += f"  <span class='px-2 py-1 bg-emerald-50 text-emerald-700 border border-emerald-100 text-[9px] font-black rounded uppercase tracking-wider'>{confidence}% Conf.</span>"
        recommendation += f"</div>"
        
        recommendation += "<ul class='space-y-2'>"
        
        # Risk-based primary action
        if risk_level.lower() in ['high', 'severe', 'critical']:
            recommendation += "<li class='flex items-start gap-3 text-xs text-slate-700'>"
            recommendation += "  <div class='mt-1 w-1.5 h-1.5 rounded-full bg-rose-500 shrink-0 shadow-[0_0_8px_rgba(244,63,94,0.5)]'></div>"
            recommendation += "  <span><b>IMMEDIATE DISPATCH:</b> Rapid Response Unit (RRU-4) activated for on-site interdiction.</span>"
            recommendation += "</li>"
        else:
            recommendation += "<li class='flex items-start gap-3 text-xs text-slate-700'>"
            recommendation += "  <div class='mt-1 w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0'></div>"
            recommendation += "  <span><b>SCHEDULED AUDIT:</b> Standard inspection team assigned for verification within 12h.</span>"
            recommendation += "</li>"
            
        # Violation-specific actions
        v_type_lower = violation_type.lower()
        if 'fire' in v_type_lower or 'smoke' in v_type_lower:
            recommendation += "<li class='flex items-start gap-3 text-xs text-slate-700'>"
            recommendation += "  <div class='mt-1 w-1.5 h-1.5 rounded-full bg-orange-500 shrink-0 animate-pulse'></div>"
            recommendation += "  <span><b>EMERGENCY ALERT:</b> local fire services and industrial cluster management notified of potential hazard.</span>"
            recommendation += "</li>"
        elif 'industrial' in v_type_lower or 'emission' in v_type_lower:
            recommendation += "<li class='flex items-start gap-3 text-xs text-slate-700'>"
            recommendation += "  <div class='mt-1 w-1.5 h-1.5 rounded-full bg-indigo-500 shrink-0'></div>"
            recommendation += "  <span><b>EMISSION MONITORING:</b> Deploying mobile VOC/PM sensors to track pollutant plume dispersion.</span>"
            recommendation += "</li>"
        elif 'dust' in v_type_lower or 'construction' in v_type_lower:
            recommendation += "<li class='flex items-start gap-3 text-xs text-slate-700'>"
            recommendation += "  <div class='mt-1 w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0'></div>"
            recommendation += "  <span><b>SUPPRESSION:</b> Dispatching dust suppression vehicles for localized water spraying.</span>"
            recommendation += "</li>"
            
        # Context-aware warning
        try:
            aqi_val = int(aqi) if aqi is not None else 0
            if aqi_val > 200:
                recommendation += "<li class='mt-2 p-2 bg-rose-50 border border-rose-100 rounded-lg flex items-center gap-2'>"
                recommendation += "  <span class='text-rose-600 font-black text-[10px] uppercase tracking-tighter'>⚠️ Personnel Warning:</span> "
                recommendation += f"  <span class='text-rose-800 text-[10px] font-bold italic'>High Ambient AQI ({aqi_val}) detected; N95 respiratory protection mandatory for field teams.</span>"
                recommendation += "</li>"
        except (ValueError, TypeError):
            pass

        recommendation += "</ul></div>"

        # Log to transparency registry
        add_transparency_record(
            initial_aqi=int(aqi) if aqi else 150,
            ai_recommendation=f"Deploy units for {violation_type} in {location}",
            gov_action=f"AI Optimized Deployment Strategy Generated for {violation_type}",
            final_aqi=None,  # Not yet resolved
            compliance=100
        )

        return jsonify({
            'status': 'success',
            'recommendation': recommendation
        }), 200
        
    except Exception as e:
        logger.error(f"[ERROR] Generate resource deployment failed: {str(e)}")
        import traceback
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500
