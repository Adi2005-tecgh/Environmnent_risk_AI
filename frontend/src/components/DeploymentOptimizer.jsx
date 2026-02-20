import React, { useMemo } from 'react';
import { Truck, ShieldCheck } from 'lucide-react';

const DeploymentOptimizer = ({ hotspotCount = 0, anomalyCount = 0, riskLevel = 'Low' }) => {
    const riskMultipliers = {
        'Low': 1,
        'Moderate': 2,
        'High': 3,
        'Extreme': 4
    };

    const calculations = useMemo(() => {
        const riskMultiplier = riskMultipliers[riskLevel] || 1;
        const inspectionTeams = Math.ceil(hotspotCount * 0.8);
        const dustVehicles = Math.ceil(anomalyCount * 1.2);
        const mobileHealthUnits = riskMultiplier * 10;

        return {
            inspectionTeams: Math.max(1, inspectionTeams),
            dustVehicles: Math.max(1, dustVehicles),
            mobileHealthUnits: Math.max(1, mobileHealthUnits),
            riskMultiplier,
            totalDeployment: inspectionTeams + dustVehicles + mobileHealthUnits
        };
    }, [hotspotCount, anomalyCount, riskLevel]);

    const getDeploymentIntensity = () => {
        if (calculations.totalDeployment <= 10) return { label: 'Low', color: 'text-blue-600', bg: 'bg-blue-50' };
        if (calculations.totalDeployment <= 25) return { label: 'Moderate', color: 'text-amber-600', bg: 'bg-amber-50' };
        if (calculations.totalDeployment <= 50) return { label: 'High', color: 'text-orange-600', bg: 'bg-orange-50' };
        return { label: 'Critical', color: 'text-rose-600', bg: 'bg-rose-50' };
    };

    const intensityInfo = getDeploymentIntensity();

    return (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Resource Deployment</h3>
                    <div className="flex items-center space-x-2">
                        <Truck size={16} className="text-slate-600" />
                        <span className="text-sm font-black text-slate-800 uppercase tracking-tight">Optimizer</span>
                    </div>
                </div>
                <div className={`${intensityInfo.bg} px-3 py-1.5 rounded-lg`}>
                    <p className={`text-xs font-black uppercase tracking-tighter ${intensityInfo.color}`}>
                        {intensityInfo.label}
                    </p>
                </div>
            </div>

            {/* Deployment Cards */}
            <div className="space-y-3 mb-5">
                {/* Inspection Teams */}
                <div className="bg-slate-50 border border-slate-100 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-2">
                        <label className="text-xs font-black text-slate-600 uppercase tracking-widest">Inspection Teams</label>
                        <span className="text-lg font-black text-slate-900">{calculations.inspectionTeams}</span>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-2">
                        <div
                            className="bg-blue-600 h-2 rounded-full transition-all"
                            style={{ width: `${Math.min(100, (calculations.inspectionTeams / 20) * 100)}%` }}
                        ></div>
                    </div>
                    <p className="text-[9px] text-slate-500 mt-2">From {hotspotCount} hotspots × 0.8</p>
                </div>

                {/* Dust Control Vehicles */}
                <div className="bg-slate-50 border border-slate-100 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-2">
                        <label className="text-xs font-black text-slate-600 uppercase tracking-widest">Dust Vehicles</label>
                        <span className="text-lg font-black text-slate-900">{calculations.dustVehicles}</span>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-2">
                        <div
                            className="bg-orange-600 h-2 rounded-full transition-all"
                            style={{ width: `${Math.min(100, (calculations.dustVehicles / 20) * 100)}%` }}
                        ></div>
                    </div>
                    <p className="text-[9px] text-slate-500 mt-2">From {anomalyCount} anomalies × 1.2</p>
                </div>

                {/* Mobile Health Units */}
                <div className="bg-slate-50 border border-slate-100 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-2">
                        <label className="text-xs font-black text-slate-600 uppercase tracking-widest">Mobile Health Units</label>
                        <span className="text-lg font-black text-slate-900">{calculations.mobileHealthUnits}</span>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-2">
                        <div
                            className="bg-emerald-600 h-2 rounded-full transition-all"
                            style={{ width: `${Math.min(100, (calculations.mobileHealthUnits / 30) * 100)}%` }}
                        ></div>
                    </div>
                    <p className="text-[9px] text-slate-500 mt-2">Risk ×{calculations.riskMultiplier} ({riskLevel}) × 10</p>
                </div>
            </div>

            {/* Total Deployment & AI Recommendation */}
            <div className="grid grid-cols-2 gap-3">
                <div className="bg-slate-50 border border-slate-100 rounded-xl p-4">
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">Total Units</p>
                    <p className="text-2xl font-black text-slate-900">{calculations.totalDeployment}</p>
                </div>
                <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-4 flex items-center justify-center">
                    <div className="text-center">
                        <ShieldCheck size={16} className="text-indigo-600 mx-auto mb-1" />
                        <p className="text-[9px] font-black text-indigo-600 uppercase tracking-widest">AI Recommended</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DeploymentOptimizer;
