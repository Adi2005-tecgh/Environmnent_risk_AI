/**
 * Central AQI Severity Utility
 */
export const getAQISeverity = (aqi) => {
    if (aqi <= 50) return { label: "Good", level: 1, color: "green", theme: "text-emerald-600", bg: "bg-emerald-50", border: "border-emerald-100" };
    if (aqi <= 100) return { label: "Moderate", level: 2, color: "yellow", theme: "text-yellow-600", bg: "bg-yellow-50", border: "border-yellow-100" };
    if (aqi <= 150) return { label: "Unhealthy for Sensitive Groups", level: 3, color: "orange", theme: "text-orange-600", bg: "bg-orange-50", border: "border-orange-100" };
    if (aqi <= 200) return { label: "Unhealthy", level: 4, color: "red", theme: "text-rose-600", bg: "bg-rose-50", border: "border-rose-100" };
    if (aqi <= 300) return { label: "Severe", level: 5, color: "purple", theme: "text-purple-600", bg: "bg-purple-50", border: "border-purple-100" };
    return { label: "Hazardous", level: 6, color: "maroon", theme: "text-red-900", bg: "bg-red-50", border: "border-red-200" };
};

/**
 * Dynamic Health Risk Engine
 */
export const getHealthRisk = (condition, aqi) => {
    const severity = getAQISeverity(aqi);

    const riskConfig = {
        asthma: {
            thresholds: [
                { limit: 100, risk: "Low", badge: "Low Chances of Asthma flare-up" },
                { limit: 200, risk: "High", badge: "High Chances of Asthma" },
                { limit: 999, risk: "Critical", badge: "CRITICAL CHANCES OF ASTHMA" }
            ],
            description: "Severe symptoms including intense wheezing, severe shortness of breath, significant chest tightness, and persistent coughing that may disrupt daily activities.",
            guidance: {
                low: { dos: ["Maintain normal medication.", "Ventilate rooms."], donts: ["Smoke indoors."] },
                high: { dos: ["Avoid outdoors and keep windows closed.", "Take prescribed medications.", "Use air purifiers."], donts: ["Smoke areas.", "Outdoor exercise."] },
                critical: { dos: ["Strict isolation in HEPA rooms.", "Monitor peak flow values.", "Emergency meds ready."], donts: ["All outdoor exposure.", "Physical exertion."] }
            }
        },
        sinus: {
            thresholds: [
                { limit: 120, risk: "Low", badge: "Minimal Sinus Irritation" },
                { limit: 220, risk: "High", badge: "Elevated Sinus Risk" },
                { limit: 999, risk: "Critical", badge: "SEVERE SINUS CONGESTION" }
            ],
            description: "High particulate volume irritates facial membranes, causing facia pressure, chronic headaches, and severe nasal congestion.",
            guidance: {
                low: { dos: ["Drink water.", "Dust surfaces."], donts: ["Pollen heavy zones."] },
                high: { dos: ["Saline nasal rinses.", "Steam inhalation.", "Hydration."], donts: ["Strong perfumes.", "Dry/dusty rooms."] },
                critical: { dos: ["Antihistamines advised.", "Strict hydration.", "Warm facial compress."], donts: ["Air-conditioned dryers.", "Open window ventilation."] }
            }
        },
        heart: {
            thresholds: [
                { limit: 80, risk: "Low", badge: "Normal Cardiac Stress" },
                { limit: 180, risk: "High", badge: "High Cardiac Strain" },
                { limit: 999, risk: "Critical", badge: "EXTREME CARDIAC RISK" }
            ],
            description: "Pollutants entering the bloodstream trigger inflammatory responses, increasing myocardial load and biological stress.",
            guidance: {
                low: { dos: ["Normal activity.", "Check BP."], donts: ["Extreme fatigue."] },
                high: { dos: ["Monitor heart rate.", "Limit physical stress.", "Filtered air."], donts: ["Intense cardio.", "Stressful environments."] },
                critical: { dos: ["Complete rest indoors.", "Emergency clinical contact.", "Monitor oxygen levels."], donts: ["Any exertion.", "Caffeine/stimulants."] }
            }
        },
        allergy: {
            thresholds: [
                { limit: 110, risk: "Low", badge: "Minimal Allergic Reactive" },
                { limit: 210, risk: "High", badge: "Strong Allergic Response" },
                { limit: 999, risk: "Critical", badge: "SEVERE SYSTEMIC ALLERGY" }
            ],
            description: "Particulate synergy with environmental allergens increases mucosal sensitivity, causing rhinitis and eye irritation.",
            guidance: {
                low: { dos: ["Shower after out.", "Wash face."], donts: ["Pet dander zones."] },
                high: { dos: ["Change clothes often.", "Use HEPA filters.", "Keep eyes clean."], donts: ["Drying clothes out.", "Open window sleep."] },
                critical: { dos: ["Clinical allergy meds.", "Total isolation.", "Air filtration."], donts: ["Outdoor exposure.", "Skin contact with dust."] }
            }
        }
    };

    const config = riskConfig[condition?.toLowerCase()] || riskConfig.asthma;
    const currentRisk = config.thresholds.find(t => aqi <= t.limit) || config.thresholds[2];

    const riskKey = currentRisk.risk.toLowerCase();
    const advisory = config.guidance[riskKey] || config.guidance.high;

    return {
        riskLevel: currentRisk.risk,
        badgeText: currentRisk.badge,
        dos: advisory.dos,
        donts: advisory.donts,
        description: config.description,
        severityLabel: severity.label,
        severityColor: severity.theme
    };
};
