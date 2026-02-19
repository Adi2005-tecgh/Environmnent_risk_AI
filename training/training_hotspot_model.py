# =====================================================
# HOTSPOT DETECTION USING DBSCAN
# =====================================================

import pandas as pd
import numpy as np
from sklearn.cluster import DBSCAN
from sklearn.preprocessing import StandardScaler
import pickle

# =====================================================
# LOAD DATA
# =====================================================

print("Loading station dataset...")
df = pd.read_csv("../data/station_day.csv")


# Standardize column names
df.columns = df.columns.str.strip().str.lower()

print("Columns:", df.columns)

# =====================================================
# CLEAN DATA
# =====================================================

# Remove rows with missing coordinates
df = df.dropna(subset=["latitude", "longitude"])

# Convert pollutant_avg to numeric
df["pollutant_avg"] = pd.to_numeric(df["pollutant_avg"], errors="coerce")

# Remove rows without pollutant values
df = df.dropna(subset=["pollutant_avg"])

print("Shape after cleaning:", df.shape)

# =====================================================
# PIVOT POLLUTANTS INTO COLUMNS
# =====================================================

pivot_df = df.pivot_table(
    index=["city", "station", "latitude", "longitude"],
    columns="pollutant_id",
    values="pollutant_avg",
    aggfunc="mean"
).reset_index()

pivot_df.columns.name = None

print("After pivot shape:", pivot_df.shape)

# =====================================================
# CREATE POLLUTION SCORE
# =====================================================

pollutant_cols = pivot_df.columns.difference(
    ["city", "station", "latitude", "longitude"]
)

pivot_df["pollution_score"] = pivot_df[pollutant_cols].mean(axis=1)

# Remove stations without pollution score
pivot_df = pivot_df.dropna(subset=["pollution_score"])

print("Stations ready for clustering:", pivot_df.shape[0])

# =====================================================
# PREPARE FEATURES FOR DBSCAN
# =====================================================

features = pivot_df[["latitude", "longitude", "pollution_score"]]

scaler = StandardScaler()
X_scaled = scaler.fit_transform(features)



# =====================================================
# TRAIN DBSCAN
# =====================================================

print("Training DBSCAN hotspot model...")

dbscan = DBSCAN(
    eps=0.3,      # adjust later if needed
    min_samples=5
)

clusters = dbscan.fit_predict(X_scaled)

pivot_df["cluster"] = clusters

print("Unique clusters found:", np.unique(clusters))

# =====================================================
# SAVE MODEL
# =====================================================

with open("../models/hotspot_dbscan.pkl", "wb") as f:
    pickle.dump(dbscan, f)

with open("../models/hotspot_scaler.pkl", "wb") as f:
    pickle.dump(scaler, f)

print("Hotspot model saved successfully.")

# =====================================================
# SHOW HOTSPOTS
# =====================================================

hotspots = pivot_df[pivot_df["cluster"] != -1]

print("\nSample Hotspot Stations:")
print(hotspots[["city", "station", "pollution_score", "cluster"]].head(10))

print("\nTotal Hotspot Stations:", hotspots.shape[0])

cluster_summary = pivot_df.groupby("cluster")["pollution_score"].mean().sort_values()

print("\nCluster Pollution Ranking:")
print(cluster_summary)

cluster_summary = cluster_summary.reset_index()
cluster_summary.columns = ["cluster", "avg_pollution"]

# Assign severity
def assign_severity(score):
    if score < 35:
        return "Low"
    elif score < 50:
        return "Moderate"
    elif score < 60:
        return "High"
    else:
        return "Extreme"

cluster_summary["severity"] = cluster_summary["avg_pollution"].apply(assign_severity)

print(cluster_summary)

