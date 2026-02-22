import React from 'react';
import { Globe, Zap, Cpu, Server, Radio, ShieldCheck } from 'lucide-react';

const GovernmentAnalyticsPanel = ({ data, loading }) => {
    if (loading) {
        return (
            <div className="grid grid-cols-2 gap-4">
                {[1, 2].map(i => (
                    <div key={i} className="h-24 bg-slate-50 rounded-xl animate-pulse border border-slate-100" />
                ))}
            </div>
        );
    }

    const hotspotsArray = data?.hotspots?.hotspots || [];
    const stationCount = hotspotsArray.length;
    const extremeCount = hotspotsArray.filter(h => h.severity === 'Extreme').length;

    const healthStats = [
        {
            label: 'Active Sensors',
            value: data?.hotspots?.total_stations || stationCount,
            status: 'Nominal',
            icon: Radio,
            color: 'text-blue-600',
            bg: 'bg-blue-50'
        },
        {
            label: 'Critical Zones',
            value: extremeCount,
            status: extremeCount > 0 ? 'Action Required' : 'Optimal',
            icon: Zap,
            color: extremeCount > 0 ? 'text-rose-600' : 'text-emerald-600',
            bg: extremeCount > 0 ? 'bg-rose-50' : 'bg-emerald-50'
        }
    ];

    return (
        <div className="grid grid-cols-2 gap-4">
            {healthStats.map((stat, i) => (
                <div key={i} className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm group hover:border-blue-300 transition-all">
                    <div className="flex items-center gap-3 mb-4">
                        <div className={`${stat.bg} ${stat.color} p-2 rounded-lg`}>
                            <stat.icon size={18} />
                        </div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">{stat.label}</p>
                    </div>

                    <div className="flex items-baseline gap-2 mb-1">
                        <p className="text-3xl font-black text-slate-900 tracking-tight">{stat.value}</p>
                        <span className={`text-[8px] font-black uppercase tracking-widest ${stat.color}`}>Nodes</span>
                    </div>

                    <div className="flex items-center gap-1.5 pt-3 border-t border-slate-50">
                        <div className={`w-1 h-1 rounded-full ${stat.color.replace('text-', 'bg-')} animate-pulse`} />
                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-tight">Status: <span className={stat.color}>{stat.status}</span></span>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default GovernmentAnalyticsPanel;
