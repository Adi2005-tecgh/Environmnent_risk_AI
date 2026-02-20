"""
Resource Optimizer and Economic Impact Module

Intelligently recommends resource deployment based on:
- Pollution severity
- Weather patterns
- Escalation probability
- And calculates economic impact metrics
"""

import numpy as np
import logging
from typing import Dict, List, Tuple

logger = logging.getLogger(__name__)


class ResourceOptimizer:
    """
    AI-driven resource optimization for government deployments.
    """

    def __init__(self):
        """Initialize resource optimizer."""
        logger.info("✅ Resource Optimizer initialized")

    def optimize_inspections_teams(self, context: Dict, escalation_prob: float,
                                   num_hotspots: int) -> Dict:
        """
        Recommend inspection team deployments based on:
        - PM2.5 severity
        - Number of hotspots
        - Escalation probability
        
        Args:
            context: Environmental context
            escalation_prob: Escalation probability (0-1)
            num_hotspots: Number of detected hotspots
            
        Returns:
            Deployment recommendation dictionary
        """
        
        pm25 = context['pollutants'].get('pm25') or 0
        aqi = context['aqi']
        
        # Base teams calculation
        base_teams = 2
        pm25_multiplier = min(8, (pm25 / 100) * 4)  # 0-4x for PM25
        hotspot_multiplier = min(6, (num_hotspots / 10))  # 0-6x for hotspots
        escalation_multiplier = 1 + (escalation_prob * 2)  # 1-3x for escalation
        
        recommended_teams = int(
            base_teams +
            pm25_multiplier +
            hotspot_multiplier +
            escalation_multiplier
        )
        
        return {
            'base_units': base_teams,
            'recommended_teams': min(50, recommended_teams),
            'priority': 'IMMEDIATE' if aqi > 250 else 'HIGH' if aqi > 150 else 'MODERATE',
            'focus_areas': {
                'high_pm25_zones': pm25 > 150,
                'traffic_hotspots': context['pollutants'].get('dominant') == 'no2',
                'industrial_zones': context['pollutants'].get('dominant') == 'so2',
            }
        }

    def optimize_dust_vehicles(self, context: Dict) -> Dict:
        """
        Recommend dust suppression vehicle deployment based on:
        - PM10 severity
        - Wind speed (low wind = poor dispersion)
        
        Args:
            context: Environmental context
            
        Returns:
            Deployment recommendation dictionary
        """
        
        pm10 = context['pollutants'].get('pm10') or 0
        wind_speed = context['weather'].get('wind_speed') or 0
        
        # Base deployment
        base_vehicles = 1
        pm10_factor = min(15, (pm10 / 200) * 10)
        wind_factor = 1 + (2.0 / max(wind_speed, 0.1))  # More vehicles if low wind
        
        recommended_vehicles = int(base_vehicles + pm10_factor + wind_factor)
        
        return {
            'base_units': base_vehicles,
            'recommended_vehicles': min(30, recommended_vehicles),
            'operation_type': 'AGGRESSIVE_SPRAYING' if wind_speed < 1.5 else 'STANDARD_SPRAYING',
            'area_coverage': {
                'focus_pm10': pm10 > 150,
                'low_wind_zones': wind_speed < 2.0,
            }
        }

    def optimize_mobile_health_units(self, context: Dict) -> Dict:
        """
        Recommend mobile health unit deployment based on:
        - AQI severity
        - Humidity (high humidity increases respiratory risk)
        
        Args:
            context: Environmental context
            
        Returns:
            Deployment recommendation dictionary
        """
        
        aqi = context['aqi']
        humidity = context['weather'].get('humidity') or 0
        
        # Base units
        base_units = 1
        aqi_factor = min(12, (aqi / 300) * 10)
        humidity_factor = (humidity / 100) * 2  # Up to 2x for high humidity
        
        recommended_units = int(base_units + aqi_factor + humidity_factor)
        
        return {
            'base_units': base_units,
            'recommended_units': min(20, recommended_units),
            'alert_type': 'RESPIRATORY_EMERGENCY' if aqi > 200 and humidity > 70 else 'HEALTH_SUPPORT',
            'staffing': {
                'respiratory_specialists': aqi > 200,
                'general_practitioners': True,
                'paramedics': int(recommended_units),
            }
        }

    def get_total_deployment_plan(self, context: Dict, escalation_prob: float,
                                  num_hotspots: int) -> Dict:
        """
        Generate comprehensive deployment plan combining all resources.
        
        Args:
            context: Environmental context
            escalation_prob: Escalation probability (0-1)
            num_hotspots: Number of hotspots
            
        Returns:
            Complete deployment plan
        """
        
        inspection_plan = self.optimize_inspections_teams(context, escalation_prob, num_hotspots)
        dust_plan = self.optimize_dust_vehicles(context)
        health_plan = self.optimize_mobile_health_units(context)
        
        total_cost = (
            inspection_plan['recommended_teams'] * 500 +
            dust_plan['recommended_vehicles'] * 800 +
            health_plan['recommended_units'] * 1200
        )
        
        logger.info(
            f"[DEPLOYMENT] Inspection Teams: {inspection_plan['recommended_teams']}, "
            f"Dust Vehicles: {dust_plan['recommended_vehicles']}, "
            f"Health Units: {health_plan['recommended_units']}, "
            f"Estimated Daily Cost: ₹{total_cost:,.0f}"
        )
        
        return {
            'inspection_teams': inspection_plan,
            'dust_vehicles': dust_plan,
            'mobile_health': health_plan,
            'total_estimated_daily_cost': total_cost,
        }


class EconomicImpactCalculator:
    """
    Calculate economic impact of air pollution.
    """

    def __init__(self):
        """Initialize economic impact calculator."""
        logger.info("✅ Economic Impact Calculator initialized")

    def calculate_productivity_loss_percent(self, context: Dict) -> float:
        """
        Calculate productivity loss percentage based on AQI.
        Formula: (AQI / 300) * 100
        
        Args:
            context: Environmental context
            
        Returns:
            Productivity loss as percentage (0-100+)
        """
        aqi = context['aqi']
        loss = (aqi / 300.0) * 100.0
        return float(np.clip(loss, 0, 200))  # Cap at 200%

    def calculate_healthcare_burden_percent(self, context: Dict) -> float:
        """
        Calculate healthcare burden percentage based on PM2.5.
        Formula: (PM2.5 / 200) * 100, multiplied by humidity factor
        
        Args:
            context: Environmental context
            
        Returns:
            Healthcare burden as percentage
        """
        pm25 = context['pollutants'].get('pm25') or 0
        humidity = context['weather'].get('humidity') or 0
        
        base_burden = (pm25 / 200.0) * 100.0
        
        # Humidity multiplier (high humidity increases respiratory risk)
        humidity_multiplier = 1.0 + (max(0, humidity - 60) / 100.0)
        
        burden = base_burden * humidity_multiplier
        return float(np.clip(burden, 0, 250))

    def calculate_emergency_cost_index(self, escalation_prob: float, num_hotspots: int) -> Dict:
        """
        Calculate emergency cost index if escalation probability exceeds threshold.
        
        Returns:
            Emergency cost estimates
        """
        
        emergency_status = escalation_prob > 0.40
        
        if emergency_status:
            # High escalation probability triggers emergency deployment cost
            base_emergency = 50000  # Base emergency cost in rupees
            hotspot_cost = num_hotspots * 5000
            escalation_multiplier = 1 + (escalation_prob * 2)
            
            total_emergency_cost = int((base_emergency + hotspot_cost) * escalation_multiplier)
        else:
            total_emergency_cost = 0
        
        return {
            'emergency_triggered': emergency_status,
            'escalation_probability_threshold': 0.40,
            'current_escalation_prob': round(escalation_prob, 3),
            'estimated_emergency_deployment_cost': total_emergency_cost,
            'additional_resources_needed': emergency_status,
        }

    def get_comprehensive_economic_impact(self, context: Dict, escalation_prob: float,
                                         num_hotspots: int, population_estimate: int = 1000000) -> Dict:
        """
        Generate comprehensive economic impact assessment.
        
        Args:
            context: Environmental context
            escalation_prob: Escalation probability (0-1)
            num_hotspots: Number of hotspots
            population_estimate: Estimated city population
            
        Returns:
            Complete economic impact report
        """
        
        productivity_loss_pct = self.calculate_productivity_loss_percent(context)
        healthcare_burden_pct = self.calculate_healthcare_burden_percent(context)
        emergency_costs = self.calculate_emergency_cost_index(escalation_prob, num_hotspots)
        
        # Estimate daily productivity loss (assuming 30% workforce at risk)
        workforce_proportion = 0.3
        daily_productivity_loss = int(
            (population_estimate * workforce_proportion) * 
            (productivity_loss_pct / 100.0) * 
            500  # Assumed daily wage per person
        )
        
        # Estimate daily healthcare costs
        healthcare_cost_per_case = 2000  # Rupees
        estimated_cases = int((population_estimate * healthcare_burden_pct) / 100.0 * 0.05)  # 5% symptomatic
        daily_healthcare_cost = estimated_cases * healthcare_cost_per_case
        
        total_daily_cost = daily_productivity_loss + daily_healthcare_cost + (emergency_costs['estimated_emergency_deployment_cost'] / 7)  # Spread emergency over week
        
        logger.info(
            f"[ECONOMIC] Daily Productivity Loss: ₹{daily_productivity_loss:,.0f}, "
            f"Healthcare Cost: ₹{daily_healthcare_cost:,.0f}, "
            f"Total Daily Impact: ₹{total_daily_cost:,.0f}"
        )
        
        return {
            'productivity_impact': {
                'loss_percentage': round(productivity_loss_pct, 2),
                'estimated_daily_loss_rupees': daily_productivity_loss,
                'affected_workforce_percentage': round(workforce_proportion * 100, 1),
            },
            'healthcare_impact': {
                'burden_percentage': round(healthcare_burden_pct, 2),
                'estimated_daily_cost_rupees': daily_healthcare_cost,
                'estimated_cases': estimated_cases,
            },
            'emergency_preparedness': emergency_costs,
            'total_daily_economic_impact': int(total_daily_cost),
            'weekly_impact': int(total_daily_cost * 7),
            'monthly_impact': int(total_daily_cost * 30),
        }


# Global singletons
_resource_optimizer = None
_economic_calculator = None


def get_resource_optimizer() -> ResourceOptimizer:
    """Get or create the global ResourceOptimizer instance."""
    global _resource_optimizer
    if _resource_optimizer is None:
        _resource_optimizer = ResourceOptimizer()
    return _resource_optimizer


def get_economic_impact_calculator() -> EconomicImpactCalculator:
    """Get or create the global EconomicImpactCalculator instance."""
    global _economic_calculator
    if _economic_calculator is None:
        _economic_calculator = EconomicImpactCalculator()
    return _economic_calculator
