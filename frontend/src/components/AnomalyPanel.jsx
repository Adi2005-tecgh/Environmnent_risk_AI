import React from 'react';
import { AlertCircle, History, Info, ChevronRight, Binary, Clock } from 'lucide-react';

const AnomalyPanel = ({ data, loading, detailLevel = 'basic' }) => {
    const isGov = detailLevel === 'advanced';

    if (loading) {
        return (
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200 animate-pulse">
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
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200 h-full">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">Active Alerts</h3>
                    <p className="text-sm font-black text-slate-800 tracking-tight">System Anomalies</p>
                </div>
                <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-tighter ${anomaly_count > 0 ? 'bg-rose-100 text-rose-600' : 'bg-emerald-100 text-emerald-600'}`}>
                    {anomaly_count} Detected
                </span>
            </div>

            {!alerts || alerts.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10 text-center bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
                    <div className="bg-emerald-50 p-4 rounded-full text-emerald-500 mb-4 ring-8 ring-emerald-50/50">
                        <History size={32} />
                    </div>
                    <p className="font-black text-slate-800 text-sm uppercase tracking-tight">Normal Operations</p>
                    <p className="text-slate-400 text-[10px] font-bold mt-1 uppercase tracking-widest">No deviations detected in current cycle.</p>
                </div>
            ) : (
                <div className="space-y-4 overflow-y-auto max-h-[350px] pr-2 custom-scrollbar">
                    {alerts.map((alert, idx) => (
                        <div key={idx} className={`group p-4 rounded-2xl transition-all duration-300 border ${isGov ? 'bg-slate-50 hover:bg-white hover:shadow-xl border-slate-100 hover:border-slate-300' : 'bg-rose-50/30 border-rose-100/50 hover:bg-rose-50'
                            }`}>
                            <div className="flex justify-between items-start mb-3">
                                <div className="flex items-center space-x-2">
                                    <div className={`p-1.5 rounded-lg ${isGov ? 'bg-slate-900 text-white' : 'bg-rose-500 text-white'}`}>
                                        <AlertCircle size={14} />
                                    </div>
                                    <div>
                                        <span className="text-[10px] font-black uppercase tracking-tighter text-slate-400">System ID: {idx.toString().padStart(3, '0')}</span>
                                        <p className={`text-xs font-black uppercase tracking-tight ${isGov ? 'text-slate-800' : 'text-rose-600'}`}>
                                            {isGov ? 'Metric Deviation' : 'Environmental Alert'}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-1 text-[9px] text-slate-400 font-bold uppercase">
                                    <Clock size={10} />
                                    {alert.timestamp}
                                </div>
                            </div>

                            <p className="text-xs font-bold text-slate-700 mb-4 leading-relaxed line-clamp-2">
                                {isGov ? alert.message : "Unusual pollution levels detected. Exercise caution in this area."}
                            </p>

                            {isGov && (
                                <div className="grid grid-cols-3 gap-2 border-t border-slate-200 pt-3">
                                    {Object.entries(alert.pollutants).map(([key, val]) => (
                                        <div key={key} className="bg-white p-2 rounded-xl border border-slate-100 shadow-sm">
                                            <p className="text-[8px] text-slate-400 font-black uppercase tracking-widest mb-0.5">{key}</p>
                                            <p className="text-[10px] font-black text-slate-900">{val}</p>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {!isGov && (
                                <div className="flex items-center text-[10px] font-black text-rose-500 uppercase tracking-widest gap-1 group-hover:gap-2 transition-all">
                                    Check Health Advisory <ChevronRight size={14} />
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}

            {isGov && (
                <div className="mt-6 flex items-center justify-between p-3 bg-slate-900 rounded-2xl text-white">
                    <div className="flex items-center gap-2">
                        <Binary size={16} className="text-blue-400" />
                        <span className="text-[10px] font-black uppercase tracking-widest">Model Consensus</span>
                    </div>
                    <span className="text-[10px] font-black text-blue-400">92%</span>
                </div>
            )}
        </div>
    );
};

export default AnomalyPanel;
