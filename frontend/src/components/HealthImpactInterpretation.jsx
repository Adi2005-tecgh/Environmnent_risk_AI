import React from 'react';
import { ShieldCheck, Info, Home, XCircle, Activity, Wind, AlertCircle, AlertTriangle } from 'lucide-react';

const HealthImpactInterpretation = ({ aqi = 0, pm25 = 0, loading = false }) => {
    if (loading) {
        return <div className="h-64 bg-slate-50 rounded-[2.5rem] animate-pulse"></div>;
    }

    const dailyCigarettes = Number((pm25 / 22).toFixed(1));
    const weeklyCigarettes = Number((dailyCigarettes * 7).toFixed(1));
    const monthlyCigarettes = Number((dailyCigarettes * 30).toFixed(1));

    const getTheme = (aqiValue) => {
        if (aqiValue > 200) return { bg: 'bg-rose-50', border: 'border-rose-100', text: 'text-rose-700', accent: 'text-rose-600', sub: 'text-rose-500/70', card: 'bg-white shadow-rose-200/20' };
        if (aqiValue >= 100) return { bg: 'bg-orange-50', border: 'border-orange-100', text: 'text-orange-700', accent: 'text-orange-600', sub: 'text-orange-500/70', card: 'bg-white shadow-orange-200/20' };
        return { bg: 'bg-emerald-50', border: 'border-emerald-100', text: 'text-emerald-700', accent: 'text-emerald-600', sub: 'text-emerald-500/70', card: 'bg-white shadow-emerald-200/20' };
    };

    const theme = getTheme(aqi);

    const getInterpretation = (val) => {
        if (val > 200) return "Air quality is at a high-risk level. Prolonged exposure may cause respiratory distress and permanent health impact.";
        if (val >= 100) return "Air quality is moderate to unhealthy. Vulnerable groups and sensitive individuals should minimize exposure.";
        return "Air quality is acceptable for outdoor activities. Risk levels are minimal for the general population.";
    };

    const getRecommendations = (val) => {
        if (val > 200) {
            return [
                { icon: XCircle, label: "Avoid outdoor activity", level: "Critical" },
                { icon: AlertCircle, label: "Use N95 mask", level: "Required" },
                { icon: Activity, label: "Run air purifier", level: "Recommended" },
                { icon: Home, label: "Keep windows closed", level: "Mandatory" }
            ];
        } else if (val >= 100) {
            return [
                { icon: Wind, label: "Limit outdoor exertion", level: "Caution" },
                { icon: AlertCircle, label: "Sensitive wear mask", level: "Advised" },
                { icon: Info, label: "Monitor child activities", level: "Alert" },
                { icon: Home, label: "Limit ventilation", level: "Optional" }
            ];
        } else {
            return [
                { icon: ShieldCheck, label: "Outdoor activity safe", level: "Safe" },
                { icon: Activity, label: "Exercise safe", level: "Safe" },
                { icon: Info, label: "Ventilation safe", level: "Safe" }
            ];
        }
    };

    return (
        <div className="space-y-8">
            {/* Interpretation Card */}
            <div className={`p-8 rounded-[2.5rem] ${theme.bg} border ${theme.border} relative overflow-hidden`}>
                <div className="absolute top-0 right-0 p-8 opacity-5 text-slate-900">
                    <AlertTriangle size={120} />
                </div>
                <div className="relative z-10">
                    <h3 className="text-[10px] font-black tracking-[0.3em] uppercase opacity-60 mb-4">What This Means For You Today</h3>
                    <p className={`text-2xl font-black ${theme.text} leading-tight mb-8 max-w-2xl`}>
                        "{getInterpretation(aqi)}"
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Summary Card */}
                        <div className={`p-6 rounded-3xl ${theme.card} border ${theme.border} flex items-center gap-6 shadow-xl`}>
                            <div className={`p-4 rounded-2xl ${theme.bg} ${theme.accent}`}>
                                <AlertTriangle size={32} />
                            </div>
                            <div>
                                <div className="flex items-baseline gap-1">
                                    <span className="text-4xl font-black text-slate-900">{dailyCigarettes}</span>
                                    <span className="text-[10px] font-black uppercase text-slate-400">Cigarettes/Day</span>
                                </div>
                                <p className="text-[10px] font-bold text-slate-500 leading-tight mt-1 max-w-[150px]">
                                    Equivalent respiratory stress from current PM2.5 levels.
                                </p>
                            </div>
                        </div>

                        {/* Accumulative Stats */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className={`p-6 rounded-3xl ${theme.card} border ${theme.border} text-center shadow-lg transition-transform hover:scale-105`}>
                                <p className="text-[9px] font-black uppercase text-slate-400 mb-1">Weekly</p>
                                <p className={`text-2xl font-black ${theme.text}`}>{weeklyCigarettes}</p>
                            </div>
                            <div className={`p-6 rounded-3xl ${theme.card} border ${theme.border} text-center shadow-lg transition-transform hover:scale-105`}>
                                <p className="text-[9px] font-black uppercase text-slate-400 mb-1">Monthly</p>
                                <p className={`text-2xl font-black ${theme.text}`}>{monthlyCigarettes}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Recommendations Block */}
            <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-xl">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h3 className="text-xs font-black tracking-[0.3em] uppercase text-slate-400 mb-2">Health Response Strategy</h3>
                        <p className="text-xl font-black text-slate-900">Protect Yourself Today</p>
                    </div>
                    <ShieldCheck size={28} className="text-blue-600 opacity-20" />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {getRecommendations(aqi).map((rec, i) => (
                        <div key={i} className="group p-5 rounded-3xl bg-slate-50 border border-slate-100 hover:border-blue-200 hover:bg-blue-50/50 transition-all duration-300">
                            <div className="bg-white p-3 rounded-2xl border border-slate-100 group-hover:bg-blue-600 group-hover:text-white transition-all w-fit mb-4 shadow-sm">
                                <rec.icon size={20} />
                            </div>
                            <p className="text-xs font-black text-slate-800 uppercase tracking-tight mb-1">{rec.label}</p>
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{rec.level}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default HealthImpactInterpretation;
