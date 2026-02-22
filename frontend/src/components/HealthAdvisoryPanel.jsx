import React, { useState, useMemo } from 'react';
import {
    Wind, Heart, Thermometer, Accessibility, ShieldAlert,
    Activity, CheckCircle2, XCircle, ChevronRight, AlertCircle
} from 'lucide-react';
import { getHealthRisk, getAQISeverity } from '../utils/healthRiskEngine';

const HEALTH_CONDITIONS = [
    { id: 'asthma', label: 'Asthma', icon: Wind },
    { id: 'heart', label: 'Heart Issues', icon: Heart },
    { id: 'allergy', label: 'Allergies', icon: Thermometer },
    { id: 'sinus', label: 'Sinus', icon: Accessibility }
];

const HealthAdvisoryPanel = ({ aqi = 0, loading = false }) => {
    const [selectedTab, setSelectedTab] = useState('asthma');

    const healthData = useMemo(() => {
        return getHealthRisk(selectedTab, aqi);
    }, [selectedTab, aqi]);

    const severity = useMemo(() => {
        return getAQISeverity(aqi);
    }, [aqi]);

    if (loading) return <div className="h-[460px] bg-slate-50 rounded-xl animate-pulse border border-slate-200" />;

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col h-full">
            {/* 1. Dynamic Tabs */}
            <div className="bg-slate-50/50 p-3 border-b border-slate-100 overflow-x-auto no-scrollbar">
                <div className="flex gap-2 min-w-max">
                    {HEALTH_CONDITIONS.map((cond) => (
                        <button
                            key={cond.id}
                            onClick={() => setSelectedTab(cond.id)}
                            className={`flex items-center gap-2 px-5 py-2 rounded-full text-[11px] font-black uppercase tracking-wider transition-all ${selectedTab === cond.id
                                    ? 'bg-blue-600 text-white shadow-lg'
                                    : 'bg-white text-slate-400 border border-slate-100 hover:text-slate-600'
                                }`}
                        >
                            <cond.icon size={14} />
                            {cond.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* 2. dynamic Grid Content */}
            <div className="flex-grow grid grid-cols-1 lg:grid-cols-12">
                {/* Visual Area */}
                <div className={`lg:col-span-4 ${severity.bg} flex flex-col items-center justify-center p-8 border-r border-slate-100`}>
                    <div className="relative mb-10">
                        <div className="absolute inset-0 bg-white rounded-full blur-2xl opacity-40" />
                        <div className="relative bg-white/60 p-8 rounded-full border border-white shadow-inner">
                            {selectedTab === 'asthma' && <Wind size={84} className={severity.theme} />}
                            {selectedTab === 'heart' && <Heart size={84} className={severity.theme} />}
                            {selectedTab === 'allergy' && <Thermometer size={84} className={severity.theme} />}
                            {selectedTab === 'sinus' && <Accessibility size={84} className={severity.theme} />}
                        </div>
                    </div>

                    <div className={`px-5 py-2.5 rounded-lg shadow-md flex items-center gap-2 ring-1 ring-white/20 ${severity.bg === 'bg-rose-50' || severity.bg === 'bg-red-50' || severity.color === 'purple' || severity.color === 'maroon' ? 'bg-red-600 text-white' : 'bg-slate-900 text-white'}`}>
                        <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                        <span className="text-[10px] font-black uppercase tracking-widest leading-none">
                            {healthData.badgeText}
                        </span>
                    </div>
                </div>

                {/* Textual Area */}
                <div className="lg:col-span-8 p-8 flex flex-col h-full bg-white">
                    <div className="mb-8">
                        <h2 className="text-2xl font-black text-slate-800 tracking-tight leading-none mb-4 capitalize">{selectedTab}</h2>

                        {/* Dynamic Description Rendering */}
                        <p className="text-sm font-bold text-slate-500 mb-6 leading-relaxed">
                            Risk of <span className="font-extrabold text-slate-800 capitalize">{selectedTab}</span> symptoms is
                            <span className={`mx-1 font-black ${healthData.severityColor}`}> {healthData.riskLevel} </span>
                            when AQI is
                            <span className={`mx-1 font-black ${healthData.severityColor}`}> {healthData.severityLabel} ({aqi})</span>
                        </p>

                        <div className="p-4 bg-slate-50/80 rounded-xl border border-slate-100">
                            <p className="text-[11px] font-medium text-slate-500 leading-relaxed italic">
                                {healthData.description}
                            </p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-auto">
                        <div>
                            <h4 className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">
                                Do's :
                            </h4>
                            <ul className="space-y-2.5">
                                {healthData.dos.map((item, idx) => (
                                    <li key={idx} className="flex gap-2.5 items-start">
                                        <CheckCircle2 size={14} className="text-emerald-500 shrink-0 mt-0.5" />
                                        <span className="text-[10px] font-bold text-slate-500 leading-tight">{item}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                        <div>
                            <h4 className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">
                                Don'ts :
                            </h4>
                            <ul className="space-y-2.5">
                                {healthData.donts.map((item, idx) => (
                                    <li key={idx} className="flex gap-2.5 items-start">
                                        <XCircle size={14} className="text-rose-500 shrink-0 mt-0.5" />
                                        <span className="text-[10px] font-bold text-slate-500 leading-tight">{item}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>
            </div>

            {/* Footer */}
            <div className="px-6 py-3 bg-slate-50/50 border-t border-slate-100 flex justify-between items-center">
                <div className="flex items-center gap-2 text-[9px] font-black uppercase text-slate-400 tracking-tight">
                    <AlertCircle size={12} />
                    <span>Real-time Health intelligence node active</span>
                </div>
                <button className="flex items-center gap-1.5 text-[9px] font-black text-blue-600 uppercase tracking-widest group">
                    View Protocol <ChevronRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
                </button>
            </div>
        </div>
    );
};

export default HealthAdvisoryPanel;
