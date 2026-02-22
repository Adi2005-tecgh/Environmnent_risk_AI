from flask import Blueprint, jsonify
import pandas as pd
import numpy as np
import os
import logging
from ..model_loader import model_loader
from ..config import Config
from ..services.live_aqi_service import get_live_aqi_service
from ..services.environmental_intelligence import get_environmental_intelligence

logger = logging.getLogger(__name__)
hotspot_bp = Blueprint('hotspot', __name__)

@hotspot_bp.route('/hotspots/<city>', methods=['GET'])
def get_hotspots(city):
    try:
        intelligence = get_environmental_intelligence()
        live_aqi_service = get_live_aqi_service()
        
        if not os.path.exists(Config.STATION_DATASET_PATH):
            return jsonify({'error': 'Station dataset not found'}), 500
            
        df = pd.read_csv(Config.STATION_DATASET_PATH)
        df.columns = df.columns.str.strip().str.lower()
        
        city_df = df[df['city'].str.lower() == city.lower()]
        
        if city_df.empty:
            return jsonify({'error': f'No station data found for city: {city}'}), 404
            
        # Clean and Pivot (similar to training_hotspot_model.py)
        city_df = city_df.dropna(subset=["latitude", "longitude"])
        city_df["pollutant_avg"] = pd.to_numeric(city_df["pollutant_avg"], errors="coerce")
        city_df = city_df.dropna(subset=["pollutant_avg"])
        
        pivot_df = city_df.pivot_table(
            index=["city", "station", "latitude", "longitude"],
            columns="pollutant_id",
            values="pollutant_avg",
            aggfunc="mean"
        ).reset_index()
        
        pivot_df.columns.name = None
        
        # Create Pollution Score
        pollutant_cols = pivot_df.columns.difference(["city", "station", "latitude", "longitude"])
        pivot_df["pollution_score"] = pivot_df[pollutant_cols].mean(axis=1)
        pivot_df = pivot_df.dropna(subset=["pollution_score"])
        
        if pivot_df.empty:
            return jsonify({'error': 'Insufficient pollutant data for hotspot detection'}), 400

        # Features for prediction
        features = pivot_df[["latitude", "longitude", "pollution_score"]]
        
        scaler = model_loader.get_hotspot_scaler()
        model = model_loader.get_hotspot_model()
        
        X_scaled = scaler.transform(features)
        
        # Adaptive clustering based on number of stations
        n_stations = len(features)
        if n_stations < 10:
            # For smaller cities, use more lenient clustering
            from sklearn.cluster import DBSCAN
            adaptive_model = DBSCAN(eps=0.5, min_samples=max(2, n_stations // 3))
            clusters = adaptive_model.fit_predict(X_scaled)
        else:
            # Use original model for larger cities
            clusters = model.fit_predict(X_scaled)
        
        pivot_df["cluster"] = clusters
        
        hotspots = pivot_df[pivot_df["cluster"] != -1].copy()
        
        # Severity mapping
        def assign_severity(score):
            if score < 35: return "Low"
            elif score < 50: return "Moderate"
            elif score < 60: return "High"
            else: return "Extreme"
        
        hotspots["severity"] = hotspots["pollution_score"].apply(assign_severity)
        
        # Add source inference using live reading if available
        live_reading, _ = live_aqi_service.fetch_and_buffer(city)
        source_type = "Unknown"
        source_desc = "Source not determined"
        
        if live_reading:
            context = intelligence.compute_environmental_context(live_reading)
            source_type, source_desc = intelligence.infer_pollution_source(context)
        
        # Infer source for each hotspot station based on dominant pollutant pattern
        def infer_station_source(row):
            """Infer source for a specific station based on available pollutant columns."""
            pollutant_values = {}
            for col in pollutant_cols:
                if col in row.index and pd.notna(row[col]):
                    pollutant_values[col] = row[col]
            
            if not pollutant_values:
                return "Mixed"
            
            dominant_pollutant = max(pollutant_values, key=pollutant_values.get)
            
            source_map = {
                'pm25': 'Combustion',
                'pm10': 'Dust',
                'pm2.5': 'Combustion',
                'no2': 'Traffic',
                'no': 'Traffic',
                'so2': 'Industrial',
                'so': 'Industrial',
                'o3': 'Photochemical',
                'co': 'Vehicle',
            }
            
            return source_map.get(dominant_pollutant.lower(), 'Mixed')
        
        hotspots["inferred_source"] = hotspots.apply(infer_station_source, axis=1)
        
        logger.info(
            f"[HOTSPOTS] {city}: {len(hotspots)} hotspots detected, "
            f"Overall source: {source_type}"
        )
        
        return jsonify({
            'city': city,
            'total_stations': len(pivot_df),
            'hotspot_stations_count': len(hotspots),
            'city_pollution_source': source_type,
            'source_description': source_desc,
            'hotspots': [
                {
                    'station': row['station'],
                    'latitude': float(row['latitude']),
                    'longitude': float(row['longitude']),
                    'pollution_score': float(round(row['pollution_score'], 2)),
                    'severity': row['severity'],
                    'cluster': int(row['cluster']),
                    'inferred_source': row['inferred_source'],
                } for _, row in hotspots.iterrows()
            ]
        }), 200

    except Exception as e:
        logger.error(f"[ERROR] Hotspot endpoint failed: {str(e)}")
        return jsonify({'error': str(e)}), 500
