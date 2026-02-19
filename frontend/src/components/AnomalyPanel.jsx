import React from 'react';
import { AlertCircle, History, ExternalLink } from 'lucide-react';

const AnomalyPanel = ({ data, loading }) => {
    if (loading) {
        return (
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 animate-pulse">
                <div className="h-4 bg-slate-200 rounded w-1/4 mb-4"></div>
                <div className="space-y-3">
                    {[1, 2].map(i => <div key={i} className="h-16 bg-slate-100 rounded-xl w-full"></div>)}
                </div>
            </div>
        );
    }

    if (!data) return null;

    const { anomaly_count, alerts } = data;

    return (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 h-full">
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-sm font-bold text-slate-500 uppercase tracking-widest">Active Anomalies</h3>
                <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${anomaly_count > 0 ? 'bg-rose-100 text-rose-600' : 'bg-emerald-100 text-emerald-600'}`}>
                    {anomaly_count} Found
                </span>
            </div>

            {anomaly_count === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                    <div className="bg-emerald-50 p-4 rounded-full text-emerald-500 mb-3">
                        <History size={32} />
                    </div>
                    <p className="font-bold text-slate-700 text-sm">System Normal</p>
                    <p className="text-slate-400 text-xs mt-1">No deviations detected in last 24h.</p>
                </div>
            ) : (
                <div className="space-y-3 overflow-y-auto max-h-[300px] pr-2 custom-scrollbar">
                    {alerts.map((alert, idx) => (
                        <div key={idx} className="group p-4 bg-slate-50 hover:bg-rose-50 border border-slate-100 hover:border-rose-100 rounded-xl transition-all duration-200">
                            <div className="flex justify-between items-start mb-2">
                                <div className="flex items-center space-x-2 text-rose-500">
                                    <AlertCircle size={16} />
                                    <span className="text-[10px] font-black uppercase tracking-tight">System Alert</span>
                                </div>
                                <span className="text-[10px] text-slate-400 font-bold">{alert.timestamp}</span>
                            </div>
                            <p className="text-xs font-bold text-slate-800 mb-2 truncate">{alert.message}</p>
                            <div className="grid grid-cols-3 gap-2">
                                {Object.entries(alert.pollutants).slice(0, 3).map(([key, val]) => (
                                    <div key={key} className="bg-white px-2 py-1 rounded border border-slate-100 group-hover:border-rose-100">
                                        <p className="text-[8px] text-slate-400 font-black uppercase tracking-tighter">{key}</p>
                                        <p className="text-[10px] font-extrabold text-slate-700">{val}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default AnomalyPanel;
