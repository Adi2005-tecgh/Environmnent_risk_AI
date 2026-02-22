import React, { useState, useEffect } from 'react';
import { getAcknowledgements } from '../api/api';
import { CheckCircle, Award, Clock } from 'lucide-react';

const AcknowledgementsPanel = ({ reporterName }) => {
    const [acks, setAcks] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAcks = async () => {
            try {
                const res = await getAcknowledgements(reporterName);
                setAcks(res.data?.acknowledgements || []);
            } catch (err) {
                console.error('Acknowledgements fetch error:', err);
            } finally { setLoading(false); }
        };
        fetchAcks();
    }, [reporterName]);

    if (loading || !acks.length) return null;

    return (
        <div className="mt-8 pt-8 border-t border-slate-100">
            <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-6 px-1">Officer Acknowledgements</h3>
            <div className="space-y-4">
                {acks.slice(0, 2).map((a) => (
                    <div key={a.report_id} className="bg-emerald-50/30 p-5 rounded-xl border border-emerald-100 shadow-sm relative overflow-hidden group">
                        {/* Decorative background icon */}
                        <Award size={64} className="absolute -right-4 -bottom-4 text-emerald-500/5 rotate-12 group-hover:rotate-0 transition-transform duration-700" />

                        <div className="relative z-10">
                            <div className="flex items-center gap-2 mb-3">
                                <div className="bg-emerald-500 text-white p-1 rounded-md">
                                    <CheckCircle size={14} />
                                </div>
                                <span className="text-[10px] font-black text-emerald-700 uppercase tracking-widest">Verified Contribution</span>
                            </div>

                            <p className="text-[11px] font-bold text-slate-700 leading-relaxed italic mb-4">
                                "{a.acknowledgement?.message}"
                            </p>

                            <div className="flex items-center justify-between pt-3 border-t border-emerald-100/50">
                                <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-100/50 text-[8px] font-black uppercase text-emerald-700">
                                    <Clock size={10} />
                                    {a.acknowledgement?.sent_at || 'Recently'}
                                </div>
                                <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Case ID: {a.report_id}</span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default AcknowledgementsPanel;
