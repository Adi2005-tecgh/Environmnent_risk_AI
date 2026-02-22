import React, { useMemo } from 'react';
import { Heart, Activity, Info } from 'lucide-react';
import { calculateAnomalyDensity, clamp, safeToFixed } from '../utils/pollutantSeverity';

const EnvironmentalHealthIndex = ({ currentAQI = 100, hotspotCount = 0, anomalyCount = 0, pollutants = {} }) => {
    const totalStations = 40;

    const healthMetrics = useMemo(() => {
        const aqiImpact = clamp(100 - (Number(currentAQI) || 0) / 3);
        const hotspotDensity = Math.min(1, (Number(hotspotCount) || 0) / totalStations);
        const hotspotScore = clamp((1 - hotspotDensity) * 100);
        const anomalyDensityPercent = calculateAnomalyDensity(anomalyCount, 24);
        const anomalyScore = clamp(100 - anomalyDensityPercent);

        const overallScore = Math.round(
            clamp((aqiImpact * 0.4) + (hotspotScore * 0.3) + (anomalyScore * 0.3))
        );

        const getStatusTheme = () => {
            if (overallScore >= 80) return { text: 'text-emerald-600', color: '#10b981', label: 'EXCELLENT' };
            if (overallScore >= 60) return { text: 'text-blue-600', color: '#2563eb', label: 'GOOD' };
            if (overallScore >= 40) return { text: 'text-yellow-600', color: '#eab308', label: 'FAIR' };
            if (overallScore >= 20) return { text: 'text-orange-600', color: '#f97316', label: 'POOR' };
            return { text: 'text-rose-600', color: '#e11d48', label: 'CRITICAL' };
        };

        return {
            aqiImpact: Math.round(aqiImpact),
            hotspotScore: Math.round(hotspotScore),
            anomalyScore: Math.round(anomalyScore),
            overallScore,
            statusTheme: getStatusTheme()
        };
    }, [currentAQI, hotspotCount, anomalyCount]);

    const circumference = 2 * Math.PI * 40;
    const strokeDashoffset = circumference - (healthMetrics.overallScore / 100) * circumference;

    return (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                    <div className="bg-slate-100 p-2 rounded-lg text-slate-500">
                        <Heart size={18} />
                    </div>
                    <div>
                        <h3 className="text-sm font-black text-slate-900 tracking-tight uppercase">Environmental Health Index</h3>
                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Composite Bio-Impact Score</p>
                    </div>
                </div>
                <Info size={16} className="text-slate-300 cursor-help" />
            </div>

            <div className="flex items-center justify-between bg-slate-50/50 rounded-2xl p-8 border border-slate-100">
                <div className="space-y-1">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Overall Score</p>
                    <div className="flex items-baseline gap-2">
                        <span className="text-6xl font-black text-slate-900 tracking-tighter">{healthMetrics.overallScore}</span>
                        <span className="text-sm font-bold text-slate-400">/ 100</span>
                    </div>
                    <p className={`text-xs font-black tracking-widest mt-2 ${healthMetrics.statusTheme.text}`}>
                        {healthMetrics.statusTheme.label}
                    </p>
                </div>

                <div className="relative w-32 h-32 flex items-center justify-center">
                    <svg className="w-full h-full transform -rotate-90">
                        <circle
                            cx="64"
                            cy="64"
                            r="40"
                            stroke="currentColor"
                            strokeWidth="8"
                            fill="transparent"
                            className="text-slate-200"
                        />
                        <circle
                            cx="64"
                            cy="64"
                            r="40"
                            stroke="currentColor"
                            strokeWidth="8"
                            fill="transparent"
                            strokeDasharray={circumference}
                            style={{ strokeDashoffset, strokeLinecap: 'round' }}
                            className={`${healthMetrics.statusTheme.text} transition-all duration-1000 ease-out`}
                        />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                        <Activity size={24} className={healthMetrics.statusTheme.text} />
                    </div>
                </div>
            </div>

            <div className="mt-8 grid grid-cols-3 gap-4">
                {[
                    { label: 'AQI Impact', val: healthMetrics.aqiImpact, color: 'text-blue-600' },
                    { label: 'Spatial Risk', val: healthMetrics.hotspotScore, color: 'text-orange-600' },
                    { label: 'Stability', val: healthMetrics.anomalyScore, color: 'text-rose-600' }
                ].map((item, i) => (
                    <div key={i} className="text-center">
                        <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">{item.label}</p>
                        <p className={`text-sm font-black ${item.color}`}>{item.val}%</p>
                        <div className="w-full bg-slate-100 h-1 rounded-full mt-2">
                            <div
                                className={`h-full rounded-full ${item.color.replace('text-', 'bg-')}`}
                                style={{ width: `${item.val}%` }}
                            />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default EnvironmentalHealthIndex;
