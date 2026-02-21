/**
 * Safe anomaly density calculation
 * Returns percentage (0-75) or 0 if invalid input
 */
export function calculateAnomalyDensity(anomalyCount, totalReadings = 24) {
    // Guard against null, undefined, or non-numeric values
    const count = Number(anomalyCount) || 0;
    const total = Number(totalReadings) || 24;
    
    // Early return for edge cases
    if (total <= 0 || !Number.isFinite(count) || !Number.isFinite(total)) {
        return 0;
    }
    
    if (count <= 0) {
        return 0;
    }

    // Calculate percentage
    const raw = (count / total) * 100;
    
    // Cap at 75% to prevent inflated values
    const capped = Math.min(75, raw);
    
    // Ensure it's a valid number
    const result = Number(capped.toFixed(2));
    
    return Number.isNaN(result) ? 0 : result;
}

/**
 * Get PM2.5 air quality status
 */
export function getPM25Status(value = 0) {
    const v = Number(value) || 0;
    if (isNaN(v)) return "Data Unavailable";
    if (v <= 30) return "Good";
    if (v <= 60) return "Moderate";
    if (v <= 90) return "Poor";
    return "Severe";
}

/**
 * Get PM10 air quality status
 */
export function getPM10Status(value = 0) {
    const v = Number(value) || 0;
    if (isNaN(v)) return "Data Unavailable";
    if (v <= 50) return "Good";
    if (v <= 100) return "Moderate";
    if (v <= 250) return "Poor";
    return "Severe";
}

/**
 * Get NO2 air quality status
 */
export function getNO2Status(value = 0) {
    const v = Number(value) || 0;
    if (isNaN(v)) return "Data Unavailable";
    if (v <= 40) return "Good";
    if (v <= 80) return "Moderate";
    if (v <= 180) return "Poor";
    return "Severe";
}

/**
 * Get SO2 air quality status
 */
export function getSO2Status(value = 0) {
    const v = Number(value) || 0;
    if (isNaN(v)) return "Data Unavailable";
    if (v <= 40) return "Good";
    if (v <= 80) return "Moderate";
    if (v <= 380) return "Poor";
    return "Severe";
}

/**
 * Get CO air quality status
 */
export function getCOStatus(value = 0) {
    const v = Number(value) || 0;
    if (isNaN(v)) return "Data Unavailable";
    if (v <= 2) return "Good";
    if (v <= 4) return "Moderate";
    if (v <= 10) return "Poor";
    return "Severe";
}

/**
 * Get O3 air quality status
 */
export function getO3Status(value = 0) {
    const v = Number(value) || 0;
    if (isNaN(v)) return "Data Unavailable";
    if (v <= 50) return "Good";
    if (v <= 100) return "Moderate";
    if (v <= 168) return "Poor";
    return "Severe";
}

/**
 * Safe number clamping (0-100)
 */
export function clamp(value) {
    const num = Number(value) || 0;
    if (!Number.isFinite(num)) return 0;
    return Math.max(0, Math.min(100, num));
}

/**
 * Safe toFixed with fallback
 */
export function safeToFixed(value, decimals = 2) {
    const num = Number(value) || 0;
    if (!Number.isFinite(num)) return "0";
    return num.toFixed(decimals);
}

/**
 * Get pollutant status by key (pm25, pm10, no2, so2, co, o3)
 */
export function getPollutantStatus(key, value) {
    const getters = {
        pm25: getPM25Status,
        pm10: getPM10Status,
        no2: getNO2Status,
        so2: getSO2Status,
        co: getCOStatus,
        o3: getO3Status
    };
    const fn = getters[key];
    return fn ? fn(value) : "Data Unavailable";
}
