import React, { useMemo } from 'react';
import { Heart, Activity } from 'lucide-react';
import { calculateAnomalyDensity, clamp, safeToFixed } from '../utils/pollutantSeverity';

const EnvironmentalHealthIndex = ({ currentAQI = 100, hotspotCount = 0, anomalyCount = 0, pollutants = {} }) => {
    const totalStations = 40; // Default reference

    const healthMetrics = useMemo(() => {
        // AQI Impact: Lower AQI = Higher health score (max 100)
        const aqiImpact = clamp(100 - (Number(currentAQI) || 0) / 3);

        // Hotspot Density: Lower is better
        const hotspotDensity = Math.min(1, (Number(hotspotCount) || 0) / totalStations);
        const hotspotScore = clamp((1 - hotspotDensity) * 100);

        // Anomaly Density: Lower is better (24 hours reference) - Now using safe calculation
        const anomalyDensityPercent = calculateAnomalyDensity(anomalyCount, 24);
        const anomalyScore = clamp(100 - anomalyDensityPercent);

        // Overall Health Index with safe clamping
        const overallScore = Math.round(
            clamp((aqiImpact * 0.4) + (hotspotScore * 0.3) + (anomalyScore * 0.3))
        );

        const getHealthStatus = () => {
            if (overallScore >= 80) return 'Excellent';
            if (overallScore >= 60) return 'Good';
            if (overallScore >= 40) return 'Fair';
            if (overallScore >= 20) return 'Poor';
            return 'Critical';
        };

        const getStatusTheme = () => {
            const score = overallScore;
            if (score >= 80) return { text: 'text-emerald-700', bg: 'bg-emerald-50', border: 'border-emerald-200' };
            if (score >= 60) return { text: 'text-blue-700', bg: 'bg-blue-50', border: 'border-blue-200' };
            if (score >= 40) return { text: 'text-amber-700', bg: 'bg-amber-50', border: 'border-amber-200' };
            if (score >= 20) return { text: 'text-orange-700', bg: 'bg-orange-50', border: 'border-orange-200' };
            return { text: 'text-rose-700', bg: 'bg-rose-50', border: 'border-rose-200' };
        };

        return {
            aqiImpact: Math.round(aqiImpact),
            hotspotScore: Math.round(hotspotScore),
            anomalyScore: Math.round(anomalyScore),
            overallScore,
            healthStatus: getHealthStatus(),
            statusTheme: getStatusTheme(),
            hotspotDensity: safeToFixed(hotspotDensity * 100, 1),
            anomalyDensity: safeToFixed(anomalyDensityPercent, 1)
        };
    }, [currentAQI, hotspotCount, anomalyCount]);

    const getHealthIcon = (score) => {
        if (score >= 70) return '✓';
        if (score >= 50) return '◐';
        if (score >= 30) return '◑';
        return '✕';
    };

    return (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
            <div>
                <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Composite Index</h3>
                <div className="flex items-center space-x-2 mb-6">
                    <Heart size={16} className="text-slate-600" />
                    <span className="text-sm font-black text-slate-800 uppercase tracking-tight">Environmental Health Index</span>
                </div>
            </div>

            {/* Overall Score - Large Display */}
            <div className={`${healthMetrics.statusTheme.bg} border ${healthMetrics.statusTheme.border} rounded-xl p-5 mb-5`}>
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-xs font-black text-slate-600 uppercase tracking-widest mb-2">Overall Score</p>
                        <div className="flex items-baseline gap-2">
                            <p className="text-3xl font-black text-slate-900">{healthMetrics.overallScore}</p>
                            <p className="text-sm text-slate-600">/100</p>
                        </div>
                        <p className={`text-base font-black mt-2 ${healthMetrics.statusTheme.text}`}>
                            {healthMetrics.healthStatus}
                        </p>
                    </div>
                    <div className={`text-4xl font-black flex items-center justify-center w-16 h-16 rounded-full ${healthMetrics.statusTheme.bg}`}>
                        <span className={healthMetrics.statusTheme.text}>{getHealthIcon(healthMetrics.overallScore)}</span>
                    </div>
                </div>
            </div>

            {/* Component Breakdown */}
            <div className="space-y-3 mb-5">
                {/* AQI Impact */}
                <div className="bg-slate-50 border border-slate-100 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-2">
                        <p className="text-xs font-black text-slate-600 uppercase tracking-widest">AQI Impact</p>
                        <span className="text-lg font-black text-slate-900">{healthMetrics.aqiImpact}</span>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-2">
                        <div
                            className="bg-blue-600 h-2 rounded-full transition-all"
                            style={{ width: `${healthMetrics.aqiImpact}%` }}
                        ></div>
                    </div>
                    <p className="text-[9px] text-slate-500 mt-2">Weight: 40% | 100-(AQI/3)</p>
                </div>

                {/* Hotspot Density */}
                <div className="bg-slate-50 border border-slate-100 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-2">
                        <p className="text-xs font-black text-slate-600 uppercase tracking-widest">Hotspot Density</p>
                        <span className="text-lg font-black text-slate-900">{healthMetrics.hotspotScore}</span>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-2">
                        <div
                            className="bg-orange-600 h-2 rounded-full transition-all"
                            style={{ width: `${healthMetrics.hotspotScore}%` }}
                        ></div>
                    </div>
                    <p className="text-[9px] text-slate-500 mt-2">Weight: 30% | {hotspotCount}/{totalStations} ({healthMetrics.hotspotDensity}%)</p>
                </div>

                {/* Anomaly Density */}
                <div className="bg-slate-50 border border-slate-100 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-2">
                        <p className="text-xs font-black text-slate-600 uppercase tracking-widest">Anomaly Density</p>
                        <span className="text-lg font-black text-slate-900">{healthMetrics.anomalyScore}</span>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-2">
                        <div
                            className="bg-rose-600 h-2 rounded-full transition-all"
                            style={{ width: `${healthMetrics.anomalyScore}%` }}
                        ></div>
                    </div>
                    <p className="text-[9px] text-slate-500 mt-2">Weight: 30% | {anomalyCount}/24 ({healthMetrics.anomalyDensity}%)</p>
                </div>
            </div>

            {/* Health Status Indicator */}
            <div className="bg-slate-50 border border-slate-100 rounded-xl p-4">
                <div className="flex items-center justify-between mb-2">
                    <p className="text-xs font-black text-slate-600 uppercase tracking-widest">Status</p>
                    <Activity size={16} className={healthMetrics.statusTheme.text} />
                </div>
                <p className={`text-base font-bold ${healthMetrics.statusTheme.text} mb-2`}>
                    {healthMetrics.healthStatus}
                </p>
                <p className="text-[9px] text-slate-600">
                    {healthMetrics.healthStatus === 'Excellent' && '✓ Environmental conditions are optimal'}
                    {healthMetrics.healthStatus === 'Good' && '✓ Environmental conditions are favorable'}
                    {healthMetrics.healthStatus === 'Fair' && '⚠ Environmental conditions need attention'}
                    {healthMetrics.healthStatus === 'Poor' && '⚠ Environmental conditions require intervention'}
                    {healthMetrics.healthStatus === 'Critical' && '✕ Emergency environmental response needed'}
                </p>
            </div>
        </div>
    );
};

export default EnvironmentalHealthIndex;
