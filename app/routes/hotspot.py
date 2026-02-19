from flask import Blueprint, jsonify
import pandas as pd
import numpy as np
import os
from ..model_loader import model_loader
from ..config import Config

hotspot_bp = Blueprint('hotspot', __name__)

@hotspot_bp.route('/hotspots/<city>', methods=['GET'])
def get_hotspots(city):
    try:
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
        
        # DBSCAN in scikit-learn doesn't have a 'predict' for new data usually, 
        # but here we are using it to find clusters in the CURRENT city data
        # Actually, the user asked to USE the model. DBSCAN fit_predict is what was used.
        # Since it's a clustering model, we'll re-run fit_predict or use it to find clusters in the city data.
        # However, the user said "Use hotspot_dbscan.pkl".
        # In scikit-learn, DBSCAN doesn't have predict(). You fit on the data.
        # We can use the trained model's EPS and MIN_SAMPLES to cluster the city data.
        
        # If the user wants to "use" the saved model, they might mean use its parameters.
        # Let's perform fit_predict on the city's scaled data using the model's params.
        
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
        
        return jsonify({
            'city': city,
            'total_stations': len(pivot_df),
            'hotspot_stations_count': len(hotspots),
            'hotspots': [
                {
                    'station': row['station'],
                    'latitude': float(row['latitude']),
                    'longitude': float(row['longitude']),
                    'pollution_score': float(round(row['pollution_score'], 2)),
                    'severity': row['severity'],
                    'cluster': int(row['cluster'])
                } for _, row in hotspots.iterrows()
            ]
        }), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500
