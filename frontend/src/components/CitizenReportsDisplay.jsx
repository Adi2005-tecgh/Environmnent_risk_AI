import React, { useState, useEffect } from 'react';
import { getCitizenReports, updateReportStatus } from '../api/api';
import { AlertTriangle, CheckCircle, Clock, MapPin, Calendar, Eye, ArrowUp, CheckSquare, Loader2, Info, XCircle } from 'lucide-react';

const CitizenReportsDisplay = () => {
    const [reports, setReports] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [actionLoading, setActionLoading] = useState({}); // {reportId-actionType: true}
    const [toasts, setToasts] = useState([]);
    const [confirmModal, setConfirmModal] = useState(null); // {reportId, onConfirm}

    useEffect(() => {
        fetchReports();
    }, []);

    const showToast = (message, type = 'success') => {
        const id = Math.random().toString(36).substr(2, 9);
        setToasts(prev => [...prev, { id, message, type }]);
        setTimeout(() => {
            setToasts(prev => prev.filter(t => t.id !== id));
        }, 3000);
    };

    const fetchReports = async () => {
        try {
            setLoading(true);
            const response = await getCitizenReports();
            const reportsData = response.data?.reports || response.data || [];

            // Initialize history if missing
            const enrichedReports = reportsData.map(r => ({
                ...r,
                actionHistory: r.actionHistory || []
            }));

            setReports(enrichedReports);
            setError(null);
        } catch (err) {
            console.error('Error fetching reports:', err);
            setError(`Failed to load reports: ${err.message}`);
        } finally {
            setLoading(false);
        }
    };

    const handleAction = async (reportId, actionType, status) => {
        const actionKey = `${reportId}-${actionType}`;
        try {
            setActionLoading(prev => ({ ...prev, [actionKey]: true }));
            await updateReportStatus(reportId, status);

            const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ' IST';
            const actionLabel = actionType.charAt(0).toUpperCase() + actionType.slice(1);

            setReports(prev => prev.map(report =>
                report.id === reportId ? {
                    ...report,
                    status: status,
                    priority: actionType === 'escalate' ? 'Escalated' : report.priority,
                    severity: actionType === 'escalate' ? 'Severe' : report.severity,
                    actionHistory: [...(report.actionHistory || []), { label: actionLabel, time: timestamp }]
                } : report
            ));

            showToast(`Report ${actionLabel} Successfully`);
        } catch (err) {
            showToast(`Action Failed: ${err.message}`, 'error');
        } finally {
            setActionLoading(prev => ({ ...prev, [actionKey]: false }));
        }
    };



    const getSeverityColor = (severity) => {
        switch (severity?.toLowerCase()) {
            case 'low': return 'bg-green-100 text-green-700 border-green-200';
            case 'moderate': return 'bg-amber-100 text-amber-700 border-amber-200';
            case 'high': return 'bg-orange-100 text-orange-700 border-orange-200';
            case 'severe': case 'escalated': return 'bg-red-100 text-red-700 border-red-200';
            default: return 'bg-gray-100 text-gray-700 border-gray-200';
        }
    };

    const getStatusColor = (status) => {
        switch (status?.toLowerCase()) {
            case 'pending': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
            case 'reviewed': return 'bg-blue-100 text-blue-700 border-blue-200';
            case 'approved': case 'action_taken': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
            case 'escalated': return 'bg-rose-100 text-rose-700 border-rose-200';
            default: return 'bg-gray-100 text-gray-700 border-gray-200';
        }
    };

    if (loading) return (
        <div className="space-y-4">
            {[1, 2].map(i => (
                <div key={i} className="bg-white p-6 rounded-2xl border border-slate-200 animate-pulse h-48"></div>
            ))}
        </div>
    );

    return (
        <div className="space-y-4 relative">
            {/* Toast System */}
            <div className="fixed bottom-8 right-8 z-[100] space-y-3">
                {toasts.map(toast => (
                    <div key={toast.id} className={`${toast.type === 'error' ? 'bg-rose-600' : 'bg-slate-900'} text-white px-6 py-3 rounded-xl shadow-2xl flex items-center gap-3 animate-in fade-in slide-in-from-right-4 duration-300`}>
                        {toast.type === 'error' ? <XCircle size={18} /> : <CheckCircle size={18} className="text-emerald-400" />}
                        <span className="text-sm font-bold uppercase tracking-tight">{toast.message}</span>
                    </div>
                ))}
            </div>

            {/* Confirmation Modal */}
            {confirmModal && (
                <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[200] flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl border border-slate-200 animate-in zoom-in-95 duration-200">
                        <AlertTriangle className="text-orange-500 mb-4" size={32} />
                        <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight">Confirm Escalation</h3>
                        <p className="text-slate-600 text-sm mt-2 mb-6">Are you sure you want to escalate this case to the regional authority? This action will trigger high-priority alerts.</p>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setConfirmModal(null)}
                                className="flex-1 py-2 text-slate-600 font-bold bg-slate-100 rounded-lg"
                            >Cancel</button>
                            <button
                                onClick={() => { confirmModal.onConfirm(); setConfirmModal(null); }}
                                className="flex-1 py-2 text-white font-bold bg-rose-600 rounded-lg"
                            >Yes, Escalate</button>
                        </div>
                    </div>
                </div>
            )}

            {reports.map((report) => (
                <div key={report.id} className={`bg-white p-6 rounded-2xl border transition-all duration-300 ${report.status === 'approved' ? 'border-emerald-200 shadow-emerald-50' : 'border-slate-200 shadow-sm'}`}>
                    <div className="flex gap-6">
                        <div className="flex-shrink-0">
                            <img
                                src={`http://localhost:5000${report.image_url}`}
                                alt="Violation"
                                className="w-32 h-32 object-cover rounded-xl border border-slate-200"
                                onError={(e) => { e.target.src = "https://images.unsplash.com/photo-1542343606-444f910411ed?q=80&w=200"; }}
                            />
                        </div>

                        <div className="flex-1 space-y-3">
                            <div className="flex items-start justify-between">
                                <div>
                                    <h3 className="text-lg font-black text-slate-900 uppercase tracking-tighter mb-1 border-b border-transparent group-hover:border-slate-300">
                                        {report.violation_type || 'Unknown Violation'}
                                        {report.status === 'approved' && <CheckCircle size={16} className="inline ml-2 text-emerald-500" />}
                                    </h3>
                                    <div className="flex items-center gap-3 mb-2">
                                        <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-widest border transition-colors duration-500 ${getSeverityColor(report.severity)}`}>
                                            {report.severity || 'Moderate'}
                                        </span>
                                        <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-widest border transition-colors duration-500 ${getStatusColor(report.status)}`}>
                                            {report.status || 'Pending'}
                                        </span>
                                    </div>
                                </div>
                                <div className="text-right flex flex-col items-end">
                                    <div className="flex items-center gap-1 text-slate-400 text-[10px] font-black uppercase tracking-widest">
                                        <Clock size={10} />
                                        <span>AI Confidence Score: {report.confidence ? `${Math.round(report.confidence * 100)}%` : '80%'}</span>
                                    </div>
                                    <div className="text-[10px] text-slate-300 font-mono mt-1">ID: #{report.id}</div>
                                </div>
                            </div>

                            <p className="text-slate-600 text-[13px] leading-relaxed">
                                <span className="font-black text-slate-900 uppercase text-[11px] tracking-tight">AI Recommendation:</span> {report.ai_recommendation || 'Immediate inspection required for smoke'}
                            </p>

                            <div className="flex items-center gap-4 text-[11px] text-slate-500 font-bold uppercase tracking-wide">
                                <div className="flex items-center gap-1"><MapPin size={12} className="text-blue-500" /> {report.location || 'Pune'}</div>
                                <div className="flex items-center gap-1"><Calendar size={12} className="text-blue-500" /> {report.created_at ? new Date(report.created_at).toLocaleDateString() : '22/2/2026'}</div>
                            </div>

                            <div className="flex items-center gap-2 pt-4">
                                <button
                                    disabled={report.status === 'approved' || actionLoading[`${report.id}-approve`]}
                                    onClick={() => handleAction(report.id, 'approve', 'action_taken')}
                                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-black uppercase tracking-wider transition-all ${report.status === 'approved' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-emerald-500 text-white hover:bg-emerald-600'
                                        }`}
                                >
                                    {actionLoading[`${report.id}-approve`] ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle size={14} />}
                                    {report.status === 'approved' ? 'Approved' : 'Approve'}
                                </button>

                                <button
                                    disabled={report.status === 'reviewed' || actionLoading[`${report.id}-review`]}
                                    onClick={() => handleAction(report.id, 'review', 'reviewed')}
                                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-black uppercase tracking-wider transition-all ${report.status === 'reviewed' ? 'bg-blue-50 text-blue-600 border border-blue-100' : 'bg-blue-500 text-white hover:bg-blue-600'
                                        }`}
                                >
                                    {actionLoading[`${report.id}-review`] ? <Loader2 size={14} className="animate-spin" /> : <CheckSquare size={14} />}
                                    {report.status === 'reviewed' ? 'Reviewed' : 'Mark as Reviewed'}
                                </button>

                                <button
                                    disabled={report.status === 'escalated' || actionLoading[`${report.id}-escalate`]}
                                    onClick={() => setConfirmModal({ reportId: report.id, onConfirm: () => handleAction(report.id, 'escalate', 'escalated') })}
                                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-black uppercase tracking-wider transition-all ${report.status === 'escalated' ? 'bg-rose-50 text-rose-600 border border-rose-100' : 'bg-rose-500 text-white hover:bg-rose-600'
                                        }`}
                                >
                                    {actionLoading[`${report.id}-escalate`] ? <Loader2 size={14} className="animate-spin" /> : <ArrowUp size={14} />}
                                    {report.status === 'escalated' ? 'Escalated' : 'Escalate'}
                                </button>

                            </div>

                            {/* Action History Log */}
                            {report.actionHistory && report.actionHistory.length > 0 && (
                                <div className="pt-3 flex flex-wrap gap-x-4 gap-y-1">
                                    {report.actionHistory.map((log, idx) => (
                                        <div key={idx} className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                            <div className="w-1 h-1 bg-emerald-500 rounded-full"></div>
                                            <span>{log.label}</span>
                                            <span className="text-slate-300">—</span>
                                            <span>{log.time}</span>
                                        </div>
                                    ))}
                                </div>
                            )}

                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default CitizenReportsDisplay;
