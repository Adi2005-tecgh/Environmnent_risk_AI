import React, { useMemo } from 'react';
import { TrendingUp, AlertTriangle } from 'lucide-react';

const EscalationTimeline = ({ forecast = [], currentAQI = 100 }) => {
    const escalationData = useMemo(() => {
        const baseProb = 5;

        return forecast.map((day, idx) => {
            let probability = baseProb;
            const aqi = day.aqi || 0;

            if (aqi > 200) {
                probability += 40;
            } else if (aqi > 150) {
                probability += 20;
            }

            const getRiskTheme = () => {
                if (probability <= 10) return { label: 'Low', color: 'text-emerald-700', bg: 'bg-emerald-50', border: 'border-emerald-200' };
                if (probability <= 25) return { label: 'Moderate', color: 'text-blue-700', bg: 'bg-blue-50', border: 'border-blue-200' };
                if (probability <= 40) return { label: 'High', color: 'text-orange-700', bg: 'bg-orange-50', border: 'border-orange-200' };
                return { label: 'Critical', color: 'text-rose-700', bg: 'bg-rose-50', border: 'border-rose-200' };
            };

            const riskInfo = getRiskTheme();

            return {
                day: idx + 1,
                aqi,
                probability,
                riskInfo
            };
        });
    }, [forecast, currentAQI]);

    const maxProb = Math.max(...escalationData.map(d => d.probability), 50);

    return (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
            <div>
                <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2">3-Day Escalation Risk</h3>
                <div className="flex items-center space-x-2 mb-6">
                    <TrendingUp size={16} className="text-slate-600" />
                    <span className="text-sm font-black text-slate-800 uppercase tracking-tight">Probability Forecast</span>
                </div>
            </div>

            {/* Timeline Cards */}
            <div className="space-y-3">
                {escalationData.length > 0 ? (
                    escalationData.map((item) => (
                        <div
                            key={item.day}
                            className={`${item.riskInfo.bg} border ${item.riskInfo.border} rounded-xl p-4`}
                        >
                            {/* Day Header */}
                            <div className="flex items-center justify-between mb-3">
                                <div>
                                    <p className="text-xs font-bold text-slate-600 uppercase tracking-wide">Day {item.day}</p>
                                    <p className={`text-sm font-black ${item.riskInfo.color}`}>{item.riskInfo.label}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-[9px] text-slate-500 uppercase tracking-wide">AQI</p>
                                    <p className="text-lg font-black text-slate-900">{item.aqi}</p>
                                </div>
                            </div>

                            {/* Probability Bar */}
                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <p className="text-xs font-black text-slate-600 uppercase tracking-widest">Escalation Risk</p>
                                    <span className={`text-sm font-black ${item.riskInfo.color}`}>{item.probability}%</span>
                                </div>
                                <div className="w-full bg-slate-200 rounded-full h-2">
                                    <div
                                        className={`h-2 rounded-full transition-all ${item.riskInfo.color.replace('text-', 'bg-')}`}
                                        style={{ width: `${(item.probability / maxProb) * 100}%` }}
                                    ></div>
                                </div>
                            </div>

                            {/* Alert Indicator */}
                            {item.probability > 30 && (
                                <div className="mt-3 flex items-center gap-2 bg-white/40 rounded-lg p-2">
                                    <AlertTriangle size={14} className={item.riskInfo.color} />
                                    <p className="text-xs text-slate-700 font-medium">
                                        {item.probability > 40
                                            ? 'Immediate precautions recommended'
                                            : 'Monitor closely'}
                                    </p>
                                </div>
                            )}
                        </div>
                    ))
                ) : (
                    <div className="text-center py-8 text-slate-500">
                        <p className="text-sm">Loading forecast data...</p>
                    </div>
                )}
            </div>

            {/* Legend */}
            <div className="mt-5 pt-4 border-t border-slate-100">
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">Calculation</p>
                <p className="text-[9px] text-slate-600 leading-relaxed">Base: 5% + AQI >150: +20% | AQI >200: +40%</p>
            </div>
        </div>
    );
};

export default EscalationTimeline;
