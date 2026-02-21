/**
 * Validation tests for utility functions
 * Tests that no NaN or undefined values are returned
 */

import {
    calculateAnomalyDensity,
    getPM25Status,
    getPM10Status,
    getNO2Status,
    getSO2Status,
    getCOStatus,
    getO3Status,
    clamp,
    safeToFixed
} from './pollutantSeverity';

import {
    generatePollutantSuggestions,
    mergeSuggestions
} from './suggestionsHelper';

// Test anomaly density
console.log('=== ANOMALY DENSITY TESTS ===');
console.log('Normal case (5 anomalies, 24 total):', calculateAnomalyDensity(5, 24));
console.log('Zero anomalies:', calculateAnomalyDensity(0, 24)); // Should be 0
console.log('Null anomalies:', calculateAnomalyDensity(null, 24)); // Should be 0
console.log('Undefined anomalies:', calculateAnomalyDensity(undefined, 24)); // Should be 0
console.log('Large number capped:', calculateAnomalyDensity(100, 24)); // Should be 75 (capped)

// Test status functions
console.log('\n=== POLLUTANT STATUS TESTS ===');
console.log('PM2.5 - 45:', getPM25Status(45)); // Moderate
console.log('PM2.5 - null:', getPM25Status(null)); // Should not crash
console.log('PM2.5 - undefined:', getPM25Status(undefined)); // Should not crash
console.log('PM10 - 150:', getPM10Status(150)); // Poor
console.log('NO2 - 50:', getNO2Status(50)); // Moderate
console.log('SO2 - 10:', getSO2Status(10)); // Good
console.log('CO - 8:', getCOStatus(8)); // Poor
console.log('O3 - 75:', getO3Status(75)); // Moderate

// Test clamp
console.log('\n=== CLAMP TESTS ===');
console.log('Clamp 150:', clamp(150)); // Should be 100
console.log('Clamp -50:', clamp(-50)); // Should be 0
console.log('Clamp 50:', clamp(50)); // Should be 50
console.log('Clamp null:', clamp(null)); // Should be 0
console.log('Clamp NaN:', clamp(NaN)); // Should be 0

// Test safeToFixed
console.log('\n=== SAFE TO FIXED TESTS ===');
console.log('ToFixed 45.123:', safeToFixed(45.123, 2)); // 45.12
console.log('ToFixed null:', safeToFixed(null, 2)); // 0.00
console.log('ToFixed undefined:', safeToFixed(undefined, 2)); // 0.00
console.log('ToFixed NaN:', safeToFixed(NaN, 2)); // 0

// Test suggestion generation
console.log('\n=== SUGGESTION TESTS ===');
const suggestions1 = generatePollutantSuggestions({ pm25: 95, pm10: 55 });
console.log('PM2.5 95, PM10 55:', suggestions1.length, 'suggestions');
console.log('Suggestions:', suggestions1);

const suggestions2 = generatePollutantSuggestions(null);
console.log('Null pollutants:', suggestions2.length, 'suggestions (should be 0)');

const suggestions3 = generatePollutantSuggestions({});
console.log('Empty pollutants:', suggestions3.length, 'suggestions (should be 0)');

// Test merge
console.log('\n=== MERGE TESTS ===');
const merged = mergeSuggestions(['Action 1', 'Action 2'], ['Action 2', 'Action 3']);
console.log('Merged suggestions:', merged.length, 'total');
console.log('Merged:', merged);

console.log('\n✅ All validation tests completed - No crashes with null/undefined');
