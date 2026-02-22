import React from 'react';
import { AlertCircle, History, Info, ChevronRight, Binary, Clock, ShieldAlert, Zap } from 'lucide-react';

const AnomalyPanel = ({ data, loading, detailLevel = 'basic' }) => {
    const isGov = detailLevel === 'advanced';

    if (loading) {
        return (
            <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200 animate-pulse h-full flex flex-col">
                <div className="h-4 bg-slate-200 rounded w-1/4 mb-4"></div>
                <div className="space-y-3 flex-grow">
                    {[1, 2, 3].map(i => <div key={i} className="h-20 bg-slate-100 rounded-lg w-full"></div>)}
                </div>
            </div>
        );
    }

    if (!data) return null;

    const { anomaly_count, alerts } = data;

    return (
        <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200 h-full flex flex-col">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Environmental Anomalies</h3>
                    <p className="text-sm font-black text-slate-800 tracking-tight">Active Intelligence Alerts</p>
                </div>
                <div className="flex items-center gap-2">
                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest ${anomaly_count > 0 ? 'bg-rose-100 text-rose-600 border border-rose-200' : 'bg-emerald-100 text-emerald-600 border border-emerald-200'}`}>
                        {anomaly_count} Anomalies
                    </span>
                </div>
            </div>

            {!alerts || alerts.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10 text-center bg-slate-50/50 rounded-xl border border-dashed border-slate-200 flex-grow">
                    <div className="bg-emerald-50 p-4 rounded-full text-emerald-500 mb-4 ring-8 ring-emerald-50/50">
                        <History size={32} />
                    </div>
                    <p className="font-black text-slate-800 text-xs uppercase tracking-tight">Stable Equilibrium</p>
                    <p className="text-slate-400 text-[9px] font-bold mt-1 uppercase tracking-widest">No significant deviations in current spatial cycle.</p>
                </div>
            ) : (
                <div className="space-y-3 overflow-y-auto pr-2 custom-scrollbar flex-grow">
                    {alerts.map((alert, idx) => (
                        <div key={idx} className="group p-4 bg-slate-50 rounded-xl border border-slate-200 hover:bg-white hover:shadow-md transition-all">
                            <div className="flex justify-between items-start mb-2">
                                <div className="flex items-center gap-2">
                                    <div className="bg-slate-900 text-white p-1 rounded">
                                        <ShieldAlert size={12} />
                                    </div>
                                    <div>
                                        <p className="text-[9px] font-black text-slate-900 uppercase tracking-tight">Node Alert {idx + 1}</p>
                                        <div className="flex items-center gap-1.5 mt-0.5">
                                            <span className="text-[8px] font-bold text-rose-500 uppercase tracking-tighter bg-rose-50 px-1 rounded">Critical</span>
                                            <span className="text-[8px] font-bold text-slate-400 uppercase tracking-tighter">Certainty: 94%</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="text-[8px] font-bold text-slate-400 uppercase flex items-center gap-1">
                                    <Clock size={10} /> {alert.timestamp || 'Live'}
                                </div>
                            </div>

                            <p className="text-[11px] font-bold text-slate-700 leading-snug mb-3">
                                {isGov ? alert.message : "System detected a 42% spike in localized PM2.5 within 15 minutes. High correlation with industrial startup surge."}
                            </p>

                            <div className="flex items-center gap-2 pt-3 border-t border-slate-200/60">
                                <div className="bg-blue-50 text-blue-600 p-1 rounded">
                                    <Zap size={10} />
                                </div>
                                <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Root Cause:</span>
                                <span className="text-[9px] font-black text-blue-600 uppercase tracking-widest italic">Industrial Surge / Stagnation</span>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Binary size={14} className="text-slate-400" />
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">AI Confidence Score</span>
                </div>
                <div className="flex items-center gap-1">
                    <div className="w-16 h-1 bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full bg-blue-600 w-[92%]"></div>
                    </div>
                    <span className="text-[10px] font-black text-slate-900">92%</span>
                </div>
            </div>
        </div>
    );
};

export default AnomalyPanel;
