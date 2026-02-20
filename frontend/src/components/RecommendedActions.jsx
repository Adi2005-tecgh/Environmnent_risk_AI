import React, { useMemo } from 'react';
import { CheckCircle, AlertCircle, Zap, ShieldCheck } from 'lucide-react';

const RecommendedActions = ({ currentAQI = 100, riskLevel = 'Low', hotspotCount = 0, anomalyCount = 0 }) => {
    const recommendations = useMemo(() => {
        const actions = [];

        if (currentAQI > 200 || riskLevel === 'Extreme') {
            actions.push({
                id: 'traffic',
                title: 'Restrict Vehicle Traffic',
                description: 'Implement odd-even scheme or temporary closures on major routes',
                priority: 'critical',
                icon: '🚗'
            });
        }

        if (hotspotCount > 5) {
            actions.push({
                id: 'inspections',
                title: 'Increase Inspections',
                description: `Deploy ${Math.ceil(hotspotCount * 0.8)} inspection teams to high-severity zones`,
                priority: currentAQI > 150 ? 'critical' : 'high',
                icon: '🔍'
            });
        }

        if (riskLevel === 'Extreme' || riskLevel === 'High') {
            actions.push({
                id: 'health',
                title: 'Deploy Mobile Health Units',
                description: `Activate ${Math.ceil(riskLevel === 'Extreme' ? 40 : 20)} mobile medical response units`,
                priority: 'critical',
                icon: '🏥'
            });
        }

        if (anomalyCount > 5) {
            actions.push({
                id: 'vehicles',
                title: 'Deploy Dust Control Vehicles',
                description: `Position ${Math.ceil(anomalyCount * 1.2)} anti-pollution equipment at hotspots`,
                priority: 'high',
                icon: '🚛'
            });
        }

        if (currentAQI > 250) {
            actions.push({
                id: 'construction',
                title: 'Halt Construction Activities',
                description: 'Suspend all high-dust construction and demolition projects immediately',
                priority: 'critical',
                icon: '🏗️'
            });
        }

        if (currentAQI > 150) {
            actions.push({
                id: 'industry',
                title: 'Industrial Restrictions',
                description: 'Reduce industrial operations; encourage work-from-home policies',
                priority: 'high',
                icon: '🏭'
            });
        }

        // Default message if no critical actions
        if (actions.length === 0) {
            actions.push({
                id: 'monitor',
                title: 'Continue Monitoring',
                description: 'Environmental conditions are stable. Maintain regular monitoring protocols.',
                priority: 'info',
                icon: '✓'
            });
        }

        return actions;
    }, [currentAQI, riskLevel, hotspotCount, anomalyCount]);

    const getPriorityTheme = (priority) => {
        const themes = {
            critical: { bg: 'bg-rose-50', border: 'border-rose-200', text: 'text-rose-700', badge: 'bg-rose-200 text-rose-700' },
            high: { bg: 'bg-orange-50', border: 'border-orange-200', text: 'text-orange-700', badge: 'bg-orange-200 text-orange-700' },
            info: { bg: 'bg-emerald-50', border: 'border-emerald-200', text: 'text-emerald-700', badge: 'bg-emerald-200 text-emerald-700' }
        };
        return themes[priority] || themes['info'];
    };

    return (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 mb-6 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-200">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-1">Government Actions</h3>
                    <p className="text-base font-black text-slate-900">AI-Recommended Response Protocol</p>
                </div>
                <div className="flex items-center gap-2 bg-indigo-50 border border-indigo-200 px-4 py-2 rounded-lg">
                    <ShieldCheck size={16} className="text-indigo-600" />
                    <span className="text-xs font-black text-indigo-600 uppercase tracking-widest">AI Optimized</span>
                </div>
            </div>

            {/* Action Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {recommendations.map((action) => {
                    const theme = getPriorityTheme(action.priority);
                    const PriorityIcon = action.priority === 'critical' ? AlertCircle : action.priority === 'high' ? Zap : CheckCircle;

                    return (
                        <div
                            key={action.id}
                            className={`${theme.bg} border ${theme.border} rounded-xl p-4 transition-all hover:shadow-md animate-in fade-in duration-500`}
                        >
                            <div className="flex items-start justify-between mb-3">
                                <span className="text-2xl">{action.icon}</span>
                                <span className={`${theme.badge} text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded-lg`}>
                                    {action.priority === 'critical' ? 'Critical' : action.priority === 'high' ? 'High' : 'Monitor'}
                                </span>
                            </div>
                            <h4 className={`text-sm font-black ${theme.text} uppercase tracking-tight mb-2`}>
                                {action.title}
                            </h4>
                            <p className="text-xs text-slate-700 leading-relaxed mb-3">
                                {action.description}
                            </p>
                            <div className="flex items-center gap-2 pt-3 border-t border-current border-opacity-10">
                                <PriorityIcon size={14} className={theme.text} />
                                <span className={`text-[9px] font-bold ${theme.text} uppercase tracking-widest`}>
                                    {action.priority === 'critical' ? 'Immediate Action' : action.priority === 'high' ? 'Priority' : 'Active'}
                                </span>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Implementation Status */}
            <div className="mt-6 pt-4 border-t border-slate-100">
                <div className="grid grid-cols-3 gap-4">
                    <div className="text-center">
                        <p className="text-2xl font-black text-slate-900">{recommendations.filter(r => r.priority === 'critical').length}</p>
                        <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mt-1">Critical Actions</p>
                    </div>
                    <div className="text-center">
                        <p className="text-2xl font-black text-slate-900">{recommendations.filter(r => r.priority === 'high').length}</p>
                        <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mt-1">High Priority</p>
                    </div>
                    <div className="text-center">
                        <p className="text-2xl font-black text-slate-900">{recommendations.length}</p>
                        <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mt-1">Total Recommendations</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RecommendedActions;
