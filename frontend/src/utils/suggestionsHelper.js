/**
 * Safe suggestion generator based on pollutant values
 * Always returns an array, never undefined
 */
export function generatePollutantSuggestions(data = {}) {
    const suggestions = [];
    
    // Safely extract values with defaults
    const pm25 = Number(data?.pm25) || 0;
    const pm10 = Number(data?.pm10) || 0;
    const no2 = Number(data?.no2) || 0;
    const so2 = Number(data?.so2) || 0;
    const co = Number(data?.co) || 0;

    // PM2.5 suggestions
    if (pm25 > 90) {
        suggestions.push("Increase dust suppression vehicles");
        suggestions.push("Restrict construction temporarily");
        suggestions.push("Issue public health advisory");
    } else if (pm25 > 60) {
        suggestions.push("Enforce dust control measures");
        suggestions.push("Promote use of air purifiers");
    }

    // PM10 suggestions
    if (pm10 > 100) {
        suggestions.push("Enforce construction compliance");
        suggestions.push("Deploy mobile air filters");
    } else if (pm10 > 50) {
        suggestions.push("Monitor construction sites closely");
    }

    // NO2 suggestions
    if (no2 > 80) {
        suggestions.push("Traffic restriction in affected zones");
        suggestions.push("Industrial emission audit");
    } else if (no2 > 40) {
        suggestions.push("Increase traffic monitoring");
    }

    // SO2 suggestions
    if (so2 > 80) {
        suggestions.push("Inspect industrial emission sources");
        suggestions.push("Increase emissions monitoring frequency");
    }

    // CO suggestions
    if (co > 10) {
        suggestions.push("Vehicle emission checks");
        suggestions.push("Promote public transport usage");
    } else if (co > 4) {
        suggestions.push("Encourage vehicle maintenance programs");
    }

    // Return empty array if no suggestions, never undefined
    return suggestions.length > 0 ? suggestions : [];
}

/**
 * Merge pollutant suggestions with existing recommendations
 * Prevents duplicates and returns unique suggestions
 */
export function mergeSuggestions(existing = [], pollutantSuggestions = []) {
    const merged = [...(Array.isArray(existing) ? existing : [])];
    const suggestionSet = new Set(merged);
    
    for (const suggestion of Array.isArray(pollutantSuggestions) ? pollutantSuggestions : []) {
        if (suggestion && !suggestionSet.has(suggestion)) {
            merged.push(suggestion);
            suggestionSet.add(suggestion);
        }
    }
    
    return merged;
}
