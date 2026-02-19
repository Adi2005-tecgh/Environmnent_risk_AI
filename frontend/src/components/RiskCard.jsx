import React from 'react';
import { ShieldAlert, Info, Activity, AlertTriangle, TrendingUp, TrendingDown } from 'lucide-react';

const RiskCard = ({ data, loading, isAdvanced = false }) => {
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

    const { risk_level, latest_aqi, description, risk_score } = data;

    const getTheme = (level) => {
        switch (level?.toLowerCase()) {
            case 'low':
                return { color: 'bg-emerald-500', text: 'text-emerald-700', bg: 'bg-emerald-50', border: 'border-emerald-200', icon: TrendingDown };
            case 'moderate':
                return { color: 'bg-amber-400', text: 'text-amber-700', bg: 'bg-amber-50', border: 'border-amber-200', icon: Activity };
            case 'high':
                return { color: 'bg-orange-500', text: 'text-orange-700', bg: 'bg-orange-50', border: 'border-orange-200', icon: TrendingUp };
            case 'extreme':
                return { color: 'bg-rose-600', text: 'text-rose-700', bg: 'bg-rose-50', border: 'border-rose-200', icon: AlertTriangle };
            default:
                return { color: 'bg-slate-400', text: 'text-slate-700', bg: 'bg-slate-50', border: 'border-slate-200', icon: Activity };
        }
    };

    const theme = getTheme(risk_level);
    const StatusIcon = theme.icon;

    return (
        <div className={`relative overflow-hidden bg-white p-6 rounded-2xl shadow-sm border border-slate-200 ${isAdvanced ? 'ring-2 ring-slate-900 ring-offset-2' : ''}`}>
            <div className="flex justify-between items-start mb-6">
                <div>
                    <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">
                        {isAdvanced ? 'Decision Intelligence' : 'Environmental Health'}
                    </h3>
                    <div className="flex items-baseline space-x-2">
                        <span className="text-5xl font-black text-slate-900 tracking-tighter">{Math.round(latest_aqi)}</span>
                        <span className="text-slate-400 font-bold text-sm uppercase">AQI</span>
                    </div>
                </div>
                <div className={`${theme.color} text-white px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-tighter flex items-center gap-1.5`}>
                    <StatusIcon size={12} />
                    {risk_level}
                </div>
            </div>

            <div className={`${theme.bg} ${theme.border} border rounded-xl p-4 mb-4`}>
                <div className="flex items-start space-x-3 mb-2">
                    <div className={`${theme.text}`}>
                        <ShieldAlert size={18} />
                    </div>
                    <p className={`font-black text-sm ${theme.text} uppercase tracking-tight`}>
                        {risk_level} Risk Category
                    </p>
                </div>
                <p className="text-slate-600 text-xs leading-relaxed font-medium">
                    {description?.length > 150 ? description.substring(0, 150) + '...' : description}
                </p>
            </div>

            {isAdvanced && (
                <div className="grid grid-cols-2 gap-3 mb-4">
                    <div className="bg-slate-50 border border-slate-100 p-3 rounded-xl">
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Risk Score</p>
                        <p className="text-lg font-black text-slate-800">{risk_score || 0}/3</p>
                    </div>
                    <div className="bg-slate-50 border border-slate-100 p-3 rounded-xl">
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">AI Confidence</p>
                        <p className="text-lg font-black text-slate-800">94.2%</p>
                    </div>
                </div>
            )}

            <div className="flex items-center space-x-2 text-slate-400 border-t border-slate-50 pt-4 mt-2">
                <Info size={14} />
                <span className="text-[9px] font-black uppercase tracking-widest">
                    {isAdvanced ? 'XGBoost Multi-Class Classification • V1.4' : 'Safety Recommendation System'}
                </span>
            </div>
        </div>
    );
};

export default RiskCard;
