#!/usr/bin/env python3
"""
Quick test for new government analytics endpoints.
"""

import requests
import json

BASE_URL = "http://localhost:5000/api"
CITY = "Delhi"

print("=" * 80)
print("Testing Government Analytics Endpoints")
print("=" * 80)

# Test 1: Resource Deployment
print(f"\nTesting Resource Deployment: {BASE_URL}/government/resource-deployment/{CITY}...")
try:
    response = requests.get(f"{BASE_URL}/government/resource-deployment/{CITY}", timeout=10)
    print(f"Status: {response.status_code}")
    if response.status_code == 200:
        data = response.json()
        print(f"✅ Resource Deployment:")
        print(f"  - Risk Category: {data.get('risk_category')}")
        print(f"  - Escalation Probability: {data.get('escalation_probability')}%")
        if 'deployment_optimization' in data:
            depl = data['deployment_optimization']
            print(f"  - Recommended Inspection Teams: {depl['inspection_teams'].get('recommended_teams')}")
            print(f"  - Recommended Dust Vehicles: {depl['dust_vehicles'].get('recommended_vehicles')}")
            print(f"  - Recommended Health Units: {depl['mobile_health'].get('recommended_units')}")
            print(f"  - Daily Cost: ₹{depl.get('total_estimated_daily_cost'):,.0f}")
    else:
        print(f"❌ Error: {response.text}")
except Exception as e:
    print(f"❌ Exception: {e}")

# Test 2: Economic Impact
print(f"\nTesting Economic Impact: {BASE_URL}/government/economic-impact/{CITY}...")
try:
    response = requests.get(f"{BASE_URL}/government/economic-impact/{CITY}", timeout=10)
    print(f"Status: {response.status_code}")
    if response.status_code == 200:
        data = response.json()
        print(f"✅ Economic Impact Assessment:")
        print(f"  - AQI: {data.get('aqi')}")
        if 'economic_impact_assessment' in data:
            econ = data['economic_impact_assessment']
            prod = econ.get('productivity_impact', {})
            health = econ.get('healthcare_impact', {})
            print(f"  - Productivity Loss: {prod.get('loss_percentage')}% (₹{prod.get('estimated_daily_loss_rupees'):,.0f}/day)")
            print(f"  - Healthcare Burden: {health.get('burden_percentage')}% (₹{health.get('estimated_daily_cost_rupees'):,.0f}/day)")
            print(f"  - Daily Total Impact: ₹{econ.get('total_daily_economic_impact'):,.0f}")
            print(f"  - Weekly Impact: ₹{econ.get('weekly_impact'):,.0f}")
    else:
        print(f"❌ Error: {response.text}")
except Exception as e:
    print(f"❌ Exception: {e}")

print("\n" + "=" * 80)
print("Government Analytics Tests Complete")
print("=" * 80)
