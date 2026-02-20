import React, { useMemo } from 'react';
import { TrendingUp, TrendingDown, Minus, Info } from 'lucide-react';

const SituationSummary = ({ forecast = [], currentAQI = 100, riskLevel = 'Low', escalationProbability = 5 }) => {
    const trend = useMemo(() => {
        if (!forecast || forecast.length < 2) {
            return { direction: 'stable', icon: Minus, color: 'text-amber-600', bg: 'bg-amber-50', label: 'No Trend' };
        }

        const first = forecast[0]?.aqi || currentAQI;
        const last = forecast[forecast.length - 1]?.aqi || currentAQI;
        const percentChange = ((last - first) / first) * 100;

        if (percentChange > 5) {
            return { direction: 'worsening', icon: TrendingUp, color: 'text-rose-600', bg: 'bg-rose-50', label: 'Worsening', change: percentChange.toFixed(1) };
        }
        if (percentChange < -5) {
            return { direction: 'improving', icon: TrendingDown, color: 'text-emerald-600', bg: 'bg-emerald-50', label: 'Improving', change: Math.abs(percentChange).toFixed(1) };
        }
        return { direction: 'stable', icon: Minus, color: 'text-amber-600', bg: 'bg-amber-50', label: 'Stable', change: '0' };
    }, [forecast, currentAQI]);

    const TrendIcon = trend.icon;

    const getAQITheme = (aqi) => {
        if (aqi <= 50) return { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200' };
        if (aqi <= 100) return { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' };
        if (aqi <= 200) return { bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-200' };
        return { bg: 'bg-rose-50', text: 'text-rose-700', border: 'border-rose-200' };
    };

    const aqiTheme = getAQITheme(currentAQI);

    const getRiskBadgeTheme = (level) => {
        const themes = {
            'Low': { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200' },
            'Moderate': { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200' },
            'High': { bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-200' },
            'Extreme': { bg: 'bg-rose-50', text: 'text-rose-700', border: 'border-rose-200' }
        };
        return themes[level] || themes['Low'];
    };

    const riskTheme = getRiskBadgeTheme(riskLevel);

    // Pulsing glow for extreme conditions
    const isPulsing = currentAQI > 250 || riskLevel === 'Extreme';

    return (
        <div className={`relative bg-white p-8 rounded-2xl shadow-sm border border-slate-200 mb-6 animate-in fade-in slide-in-from-bottom-4 duration-700 ${isPulsing ? 'ring-2 ring-rose-500/50' : ''}`}
            style={isPulsing ? { animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite' } : {}}
        >
            {/* Pulsing glow background */}
            {isPulsing && (
                <div className="absolute inset-0 bg-rose-500/5 rounded-2xl animate-pulse"></div>
            )}

            <div className="relative z-10 grid grid-cols-1 md:grid-cols-4 gap-6">
                {/* AQI Section */}
                <div className={`${aqiTheme.bg} border ${aqiTheme.border} rounded-xl p-6`}>
                    <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-2">Current AQI</p>
                    <div className="mb-3">
                        <p className={`text-4xl font-black ${aqiTheme.text} animate-in fade-in duration-500`}>
                            {Math.round(currentAQI)}
                        </p>
                    </div>
                    <p className={`text-xs font-bold ${aqiTheme.text}`}>
                        {currentAQI <= 50 ? '✓ Good' : currentAQI <= 100 ? '✓ Satisfactory' : currentAQI <= 200 ? '⚠ Poor' : '🔴 Very Poor'}
                    </p>
                </div>

                {/* Risk Level Section */}
                <div className={`${riskTheme.bg} border ${riskTheme.border} rounded-xl p-6`}>
                    <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-2">Risk Level</p>
                    <div className="mb-3">
                        <p className={`text-2xl font-black ${riskTheme.text}`}>{riskLevel}</p>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-2">
                        <div
                            className={`h-2 rounded-full transition-all ${riskLevel === 'Low' ? 'bg-emerald-600 w-1/4' : riskLevel === 'Moderate' ? 'bg-amber-600 w-1/2' : riskLevel === 'High' ? 'bg-orange-600 w-3/4' : 'bg-rose-600 w-full'}`}
                        ></div>
                    </div>
                </div>

                {/* Escalation Probability Section */}
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-6">
                    <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-2">Escalation Risk</p>
                    <div className="mb-3 flex items-baseline gap-2">
                        <p className="text-3xl font-black text-slate-900">{escalationProbability}%</p>
                        <p className="text-xs text-slate-600">Next 72h</p>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-2">
                        <div
                            className="bg-slate-900 h-2 rounded-full transition-all"
                            style={{ width: `${escalationProbability}%` }}
                        ></div>
                    </div>
                </div>

                {/* 3-Day Trend Section */}
                <div className={`${trend.bg} border border-slate-200 rounded-xl p-6`}>
                    <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-2">3-Day Forecast</p>
                    <div className="flex items-center gap-3 mb-3">
                        <TrendIcon size={24} className={trend.color} />
                        <div>
                            <p className={`text-xl font-black ${trend.color}`}>{trend.label}</p>
                            {trend.change && <p className="text-xs text-slate-600">{trend.change}% change</p>}
                        </div>
                    </div>
                </div>
            </div>

            {/* Additional Info Footer */}
            <div className="mt-6 pt-4 border-t border-slate-100 flex items-center gap-2 text-slate-600">
                <Info size={14} />
                <p className="text-xs font-medium">Real-time data from {forecast?.length || 0} monitoring stations • Updated continuously</p>
            </div>

            <style>{`
                @keyframes pulse {
                    0%, 100% { opacity: 1; }
                    50% { opacity: 0.5; }
                }
            `}</style>
        </div>
    );
};

export default SituationSummary;
