import React from 'react';
import { Database, Zap, Users, ShieldCheck, Globe, Cpu } from 'lucide-react';

const GovernmentAnalyticsPanel = ({ data, loading }) => {
    if (loading) {
        return <div className="h-32 bg-slate-100 rounded-3xl animate-pulse"></div>;
    }

    const hotspotsArray = data?.hotspots?.hotspots || [];

    // Derived stats
    const stationCount = hotspotsArray.length;
    const extremeCount = hotspotsArray.filter(h => h.severity === 'Extreme').length;
    const sysConfidence = 94;

    const stats = [
        { label: 'Active Sensors', value: stationCount, icon: Globe, color: 'text-blue-600', bg: 'bg-blue-50' },
        { label: 'Critical Zones', value: extremeCount, icon: Zap, color: 'text-rose-600', bg: 'bg-rose-50' },
        { label: 'System Health', value: '98.2%', icon: ShieldCheck, color: 'text-emerald-600', bg: 'bg-emerald-50' },
        { label: 'AI Confidence', value: `${sysConfidence}%`, icon: Cpu, color: 'text-gov-blue', bg: 'bg-indigo-50' }
    ];

    return (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {stats.map((stat, i) => (
                <div key={i} className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                    <div className={`${stat.bg} ${stat.color} p-2 rounded-xl w-fit mb-3`}>
                        <stat.icon size={20} />
                    </div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{stat.label}</p>
                    <p className="text-2xl font-black text-slate-900 tracking-tighter">{stat.value}</p>
                </div>
            ))}
        </div>
    );
};

export default GovernmentAnalyticsPanel;
