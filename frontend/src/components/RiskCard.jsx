import React from 'react';
import { ShieldAlert, TrendingUp, Info } from 'lucide-react';

const RiskCard = ({ data, loading }) => {
    if (loading) {
        return (
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 animate-pulse">
                <div className="h-4 bg-slate-200 rounded w-1/4 mb-4"></div>
                <div className="h-10 bg-slate-200 rounded w-1/2 mb-6"></div>
                <div className="h-20 bg-slate-200 rounded w-full"></div>
            </div>
        );
    }

    if (!data) return null;

    const { risk_level, latest_aqi, description } = data;

    const getTheme = (level) => {
        switch (level?.toLowerCase()) {
            case 'low':
                return { color: 'bg-emerald-500', text: 'text-emerald-700', bg: 'bg-emerald-50', border: 'border-emerald-200' };
            case 'moderate':
                return { color: 'bg-amber-400', text: 'text-amber-700', bg: 'bg-amber-50', border: 'border-amber-200' };
            case 'high':
                return { color: 'bg-orange-500', text: 'text-orange-700', bg: 'bg-orange-50', border: 'border-orange-200' };
            case 'extreme':
                return { color: 'bg-rose-600', text: 'text-rose-700', bg: 'bg-rose-50', border: 'border-rose-200' };
            default:
                return { color: 'bg-slate-400', text: 'text-slate-700', bg: 'bg-slate-50', border: 'border-slate-200' };
        }
    };

    const theme = getTheme(risk_level);

    return (
        <div className={`relative overflow-hidden bg-white p-6 rounded-2xl shadow-sm border border-slate-200`}>
            <div className="flex justify-between items-start mb-6">
                <div>
                    <h3 className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-1">Environmental Risk</h3>
                    <div className="flex items-baseline space-x-2">
                        <span className="text-4xl font-extrabold text-slate-800">{Math.round(latest_aqi)}</span>
                        <span className="text-slate-400 font-medium">AQI Index</span>
                    </div>
                </div>
                <div className={`${theme.color} text-white px-3 py-1 rounded-full text-xs font-black uppercase tracking-tighter`}>
                    Live Status
                </div>
            </div>

            <div className={`${theme.bg} ${theme.border} border rounded-xl p-4 mb-4 flex items-start space-x-3`}>
                <div className={`${theme.text}`}>
                    <ShieldAlert size={20} />
                </div>
                <div>
                    <p className={`font-bold text-sm ${theme.text} uppercase tracking-tight`}>
                        {risk_level} Risk Category
                    </p>
                    <p className="text-slate-600 text-xs mt-1 leading-relaxed">
                        {description}
                    </p>
                </div>
            </div>

            <div className="flex items-center space-x-2 text-slate-400">
                <Info size={14} />
                <span className="text-[10px] font-medium uppercase tracking-widest">A-Grade AI Confidence: 94%</span>
            </div>
        </div>
    );
};

export default RiskCard;
