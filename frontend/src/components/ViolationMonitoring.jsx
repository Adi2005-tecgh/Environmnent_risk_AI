import React from 'react';
import { Eye, Clock, CheckCircle, AlertCircle, Trash2 } from 'lucide-react';

const ViolationMonitoring = () => {
    // Mock data for complaints
    const complaints = [
        { id: 'AN-882', type: 'Industrial Smoke', loc: 'Okhla Phase 3', confidence: '94%', status: 'Reviewed', severity: 'High' },
        { id: 'AN-885', type: 'Waste Burning', loc: 'Rohini Sec 14', confidence: '88%', status: 'Pending', severity: 'Moderate' },
        { id: 'AN-889', type: 'Illegal Discharge', loc: 'Najafgarh Drain', confidence: '96%', status: 'Pending', severity: 'Extreme' }
    ];

    return (
        <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden flex flex-col">
            <div className="p-6 border-b border-slate-100">
                <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">Citizen Reports</h3>
                <p className="text-sm font-black text-slate-800 tracking-tight">Violation Monitoring</p>
            </div>

            <div className="flex-grow overflow-y-auto max-h-[400px] custom-scrollbar">
                <div className="divide-y divide-slate-100">
                    {complaints.map((c) => (
                        <div key={c.id} className="p-5 hover:bg-slate-50 transition-colors group">
                            <div className="flex justify-between items-start mb-2">
                                <span className="text-[10px] font-black text-blue-600 bg-blue-50 px-2 py-0.5 rounded uppercase">{c.id}</span>
                                <span className={`text-[10px] font-black uppercase tracking-tighter flex items-center gap-1 ${c.status === 'Pending' ? 'text-amber-500' : 'text-emerald-500'}`}>
                                    {c.status === 'Pending' ? <Clock size={10} /> : <CheckCircle size={10} />}
                                    {c.status}
                                </span>
                            </div>
                            <h4 className="text-xs font-black text-slate-800 uppercase tracking-tight mb-1">{c.type}</h4>
                            <p className="text-[10px] text-slate-400 font-medium mb-3">{c.loc}</p>

                            <div className="flex items-center justify-between border-t border-slate-50 pt-3">
                                <div className="flex items-center gap-3">
                                    <div className="bg-slate-100 px-2 py-1 rounded text-[9px] font-black text-slate-500 uppercase">
                                        AI: {c.confidence}
                                    </div>
                                    <span className={`text-[9px] font-black uppercase tracking-widest ${c.severity === 'Extreme' ? 'text-rose-500' :
                                        c.severity === 'High' ? 'text-orange-500' : 'text-emerald-500'
                                        }`}>
                                        {c.severity}
                                    </span>
                                </div>
                                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button className="p-1.5 bg-slate-100 text-slate-400 hover:text-gov-blue rounded-lg transition-colors">
                                        <Eye size={14} />
                                    </button>
                                    <button className="p-1.5 bg-slate-100 text-slate-400 hover:text-rose-500 rounded-lg transition-colors">
                                        <Trash2 size={14} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-100">
                <button className="w-full py-3 bg-white border border-slate-200 text-slate-600 font-bold rounded-2xl hover:bg-slate-100 transition-colors text-[10px] uppercase tracking-[0.2em]">
                    View Unified Registry
                </button>
            </div>
        </div>
    );
};

export default ViolationMonitoring;
