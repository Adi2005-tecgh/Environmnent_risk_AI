import React, { useMemo } from 'react';
import { TrendingUp, TrendingDown, Minus, Info, AlertCircle, Wind } from 'lucide-react';
import { getPollutantStatus } from '../utils/pollutantSeverity';

const SituationSummary = ({ forecast = [], currentAQI = 100, riskLevel = 'Low', escalationProbability = 5, pollutants = {}, city, dominantSource, sourceDescription, hotspotCoverage }) => {
    const trend = useMemo(() => {
        if (!forecast || forecast.length < 2) {
            return { direction: 'stable', icon: Minus, color: 'text-amber-600', bg: 'bg-amber-50', label: 'No Trend', percent: 0 };
        }

        const first = forecast[0]?.aqi || currentAQI;
        const last = forecast[forecast.length - 1]?.aqi || currentAQI;
        const percentChange = ((last - first) / first) * 100;

        if (percentChange > 5) {
            return { direction: 'worsening', icon: TrendingUp, color: 'text-rose-600', bg: 'bg-rose-50', label: 'Worsening', change: Number(percentChange || 0).toFixed(1), percent: percentChange };
        }
        if (percentChange < -5) {
            return { direction: 'improving', icon: TrendingDown, color: 'text-emerald-600', bg: 'bg-green-50/50', label: 'Improving', change: Number(Math.abs(percentChange || 0)).toFixed(1), percent: percentChange };
        }
        return { direction: 'stable', icon: Minus, color: 'text-amber-600', bg: 'bg-amber-50', label: 'Stable', change: '0', percent: 0 };
    }, [forecast, currentAQI]);

    const TrendIcon = trend.icon;

    const getAQITheme = (aqi) => {
        if (aqi <= 50) return { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200', pill: 'bg-emerald-500', label: 'GOOD' };
        if (aqi <= 100) return { bg: 'bg-yellow-50', text: 'text-yellow-700', border: 'border-yellow-200', pill: 'bg-yellow-500', label: 'MODERATE' };
        if (aqi <= 150) return { bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-200', pill: 'bg-orange-500', label: 'UNHEALTHY' };
        if (aqi <= 200) return { bg: 'bg-rose-50', text: 'text-rose-700', border: 'border-rose-200', pill: 'bg-rose-600', label: 'POOR' };
        return { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200', pill: 'bg-purple-600', label: 'SEVERE' };
    };

    const aqiTheme = getAQITheme(currentAQI);

    const getRiskBadgeTheme = (level) => {
        const themes = {
            'Low': { color: 'bg-emerald-500', text: 'text-emerald-600' },
            'Moderate': { color: 'bg-yellow-500', text: 'text-yellow-600' },
            'High': { color: 'bg-orange-500', text: 'text-orange-600' },
            'Extreme': { color: 'bg-rose-600', text: 'text-rose-600' }
        };
        return themes[level] || themes['Low'];
    };

    const riskTheme = getRiskBadgeTheme(riskLevel);

    const aiSummary = `${city} is currently experiencing a ${dominantSource || 'mixed'} pollution episode affecting ${hotspotCoverage}% of monitoring stations.`;

    return (
        <div className="space-y-6">
            {/* 1. Top KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {/* AQI Section */}
                <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm border-l-[4px]" style={{ borderLeftColor: aqiTheme.pill.replace('bg-', '') === 'rose-600' ? '#e11d48' : aqiTheme.pill.replace('bg-', '') === 'emerald-500' ? '#10b981' : aqiTheme.pill.replace('bg-', '') === 'yellow-500' ? '#eab308' : aqiTheme.pill.replace('bg-', '') === 'orange-500' ? '#f97316' : '#9333ea' }}>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Current AQI</p>
                    <div className="flex items-center justify-between">
                        <p className="text-5xl font-black text-slate-900 tracking-tighter">
                            {Math.round(currentAQI)}
                        </p>
                        <span className={`${aqiTheme.pill} text-white text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest`}>
                            {aqiTheme.label}
                        </span>
                    </div>
                </div>

                {/* Risk Level Section */}
                <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
                    <div className="flex justify-between items-center mb-3">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Risk Level</p>
                        <span className={`text-[10px] font-black uppercase ${riskTheme.text}`}>18% Confidence</span>
                    </div>
                    <p className="text-2xl font-black text-slate-900 mb-4">{riskLevel}</p>
                    <div className="w-full bg-slate-100 rounded-full h-1.5">
                        <div
                            className={`h-1.5 rounded-full transition-all ${riskTheme.color}`}
                            style={{ width: riskLevel === 'Low' ? '25%' : riskLevel === 'Moderate' ? '50%' : riskLevel === 'High' ? '75%' : '100%' }}
                        ></div>
                    </div>
                </div>

                {/* Escalation Risk Section */}
                <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
                    <div className="flex justify-between items-end mb-1">
                        <div>
                            <p className="text-2xl font-black text-slate-900">{escalationProbability}%</p>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">Next 72 Hours</p>
                        </div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Escalation</p>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-1.5 mt-3">
                        <div
                            className="bg-slate-900 h-1.5 rounded-full transition-all"
                            style={{ width: `${escalationProbability}%` }}
                        ></div>
                    </div>
                </div>

                {/* 3-Day Forecast Section */}
                <div className={`${trend.direction === 'improving' ? 'bg-green-50/50' : 'bg-white'} border border-slate-200 rounded-xl p-6 shadow-sm`}>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">3-Day Forecast</p>
                    <div className="flex items-center justify-between">
                        <div>
                            <div className="flex items-center gap-2">
                                <TrendIcon size={18} className={trend.color} />
                                <p className={`text-lg font-black ${trend.color}`}>{trend.label}</p>
                            </div>
                            {trend.change && <p className="text-[11px] font-bold text-slate-500 mt-1">+{trend.change}% change</p>}
                        </div>
                    </div>
                </div>
            </div>

            {/* 2. System Insight Banner */}
            <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 flex items-center gap-4">
                <div className="bg-blue-600 rounded-md p-1.5 text-white">
                    <AlertCircle size={16} />
                </div>
                <p className="text-sm font-bold text-blue-900 leading-none">
                    System Insight: <span className="font-normal text-blue-700">{aiSummary}</span>
                </p>
            </div>

            {/* 3. Live Pollutant Levels */}
            <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Live Pollutant Matrix (µg/m³)</p>
                <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
                    {[
                        { key: 'pm25', label: 'PM2.5' },
                        { key: 'pm10', label: 'PM10' },
                        { key: 'no2', label: 'NO2' },
                        { key: 'so2', label: 'SO2' },
                        { key: 'co', label: 'CO' },
                        { key: 'o3', label: 'O3' },
                    ].map(({ key, label }) => {
                        const val = pollutants?.[key] ?? null;
                        const status = getPollutantStatus(key, val);
                        const display = val !== null && val !== undefined ? Number(val).toFixed(1) : '—';

                        let dotColor = 'bg-slate-300';
                        if (status === 'Good') dotColor = 'bg-emerald-500';
                        else if (status === 'Moderate') dotColor = 'bg-yellow-500';
                        else if (status === 'Poor' || status === 'Unhealthy') dotColor = 'bg-orange-500';
                        else if (status === 'Severe' || status === 'Hazardous') dotColor = 'bg-rose-600';

                        return (
                            <div key={key} className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm text-center relative overflow-hidden group hover:border-blue-400 transition-colors">
                                <div className="absolute top-2 right-2">
                                    <div className={`w-1.5 h-1.5 rounded-full ${dotColor}`} />
                                </div>
                                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">{label}</p>
                                <p className="text-xl font-black text-slate-900">{display}</p>
                                <p className="text-[8px] font-black text-slate-400 uppercase mt-1">{status}</p>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default SituationSummary;
