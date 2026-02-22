import React, { useState, useEffect } from 'react';
import { Shield, TrendingUp, TrendingDown, Info, CheckCircle, MapPin, Calendar } from 'lucide-react';
import { getTransparencyHistory } from '../api/api';

const GovernmentTransparencyPanel = () => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await getTransparencyHistory();
                if (response.data.status === 'success') setData(response.data.data);
            } catch (err) {
                console.error('Transparency fetch node error:', err);
            } finally { setLoading(false); }
        };
        fetchData();
    }, []);

    if (loading) return <div className="h-64 bg-slate-50 rounded-xl animate-pulse border border-slate-200"></div>;

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-3">
                <div className="bg-slate-900 p-2 rounded-lg text-white shadow-lg">
                    <Shield size={20} />
                </div>
                <div>
                    <h2 className="text-xl font-black text-slate-900 tracking-tight leading-none">Public Accountability</h2>
                    <p className="text-slate-400 font-bold text-[10px] uppercase tracking-widest mt-1">Monitoring verified environmental actions</p>
                </div>
            </div>

            <div className="space-y-4">
                {data.length === 0 ? (
                    <div className="bg-emerald-50/50 p-5 rounded-xl border border-emerald-100 flex items-center gap-4">
                        <CheckCircle size={20} className="text-emerald-500" />
                        <div>
                            <p className="text-[11px] font-black text-emerald-800 uppercase tracking-tight">System Compliance Node</p>
                            <p className="text-[10px] font-bold text-emerald-600/70 uppercase">No active violations or recent divergences detected.</p>
                        </div>
                    </div>
                ) : (
                    data.map((record, index) => (
                        <div key={index} className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-all group border-l-4 border-l-blue-600">
                            <div className="flex justify-between items-start mb-3">
                                <div className="flex items-center gap-1.5 text-[9px] font-black text-slate-400 uppercase tracking-widest">
                                    <Calendar size={10} />
                                    {record.date}
                                </div>
                                <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[8px] font-black uppercase tracking-tighter ${record.effectiveness > 70 ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-orange-50 text-orange-600 border border-orange-100'
                                    }`}>
                                    {record.effectiveness > 70 ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
                                    {record.effectiveness}% Effectiveness
                                </div>
                            </div>

                            <h3 className="text-sm font-black text-slate-900 mb-1 group-hover:text-blue-600 transition-colors capitalize leading-tight">
                                {record.gov_action}
                            </h3>

                            <div className="flex items-center gap-2 mb-4">
                                <MapPin size={10} className="text-slate-400" />
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">Regional Node Center</span>
                            </div>

                            <div className="grid grid-cols-2 gap-3 pt-3 border-t border-slate-100">
                                <div className="flex items-center gap-2">
                                    <div className="bg-emerald-50 p-1 rounded text-emerald-600">
                                        <CheckCircle size={10} />
                                    </div>
                                    <div>
                                        <p className="text-[8px] font-black text-slate-400 uppercase leading-none mb-0.5">Compliance</p>
                                        <p className="text-[10px] font-black text-slate-900">{record.compliance}%</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="bg-blue-50 p-1 rounded text-blue-600">
                                        <Info size={10} />
                                    </div>
                                    <div>
                                        <p className="text-[8px] font-black text-slate-400 uppercase leading-none mb-0.5">Resultant</p>
                                        <div className="flex items-center gap-1">
                                            <p className="text-[10px] font-black text-slate-900">{record.final_aqi} AQI</p>
                                            <span className={`text-[8px] font-black ${record.final_aqi < 100 ? 'text-emerald-500' : 'text-rose-500'}`}>
                                                {record.final_aqi < 100 ? '↓' : '↑'}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default GovernmentTransparencyPanel;
