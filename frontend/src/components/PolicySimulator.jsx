import React, { useState, useMemo, useEffect } from 'react';
import { Sliders, TrendingDown, Zap } from 'lucide-react';

const PolicySimulator = ({ currentAQI = 100 }) => {
    const [trafficReduction, setTrafficReduction] = useState(20);
    const [constructionControl, setConstructionControl] = useState(20);
    const [industrialControl, setIndustrialControl] = useState(20);
    const [autoMode, setAutoMode] = useState(false);
    const [displayedAQI, setDisplayedAQI] = useState(currentAQI);

    const projectedAQI = useMemo(() => {
        const baseAQI = currentAQI;
        const trafficImpact = (trafficReduction / 100) * 0.4;
        const constructionImpact = (constructionControl / 100) * 0.3;
        const industrialImpact = (industrialControl / 100) * 0.3;
        const totalReduction = trafficImpact + constructionImpact + industrialImpact;
        return Math.max(0, Math.round(baseAQI * (1 - totalReduction)));
    }, [currentAQI, trafficReduction, constructionControl, industrialControl]);

    // Animate AQI display number
    useEffect(() => {
        if (displayedAQI !== projectedAQI) {
            const diff = projectedAQI - displayedAQI;
            const step = Math.ceil(Math.abs(diff) / 10);
            const direction = diff > 0 ? 1 : -1;
            const timer = setTimeout(() => {
                setDisplayedAQI(prev => {
                    const next = prev + (step * direction);
                    if (direction > 0) return Math.min(next, projectedAQI);
                    return Math.max(next, projectedAQI);
                });
            }, 50);
            return () => clearTimeout(timer);
        }
    }, [projectedAQI, displayedAQI]);

    const improvement = currentAQI - projectedAQI;
    const improvementPercent = currentAQI > 0 ? Math.round((improvement / currentAQI) * 100) : 0;

    // Lives Protected Estimate
    const livesProtected = Math.floor(improvement * 10);
    const healthImpactScore = Math.round((improvement / currentAQI) * 100);

    const handleAutoMode = () => {
        if (!autoMode) {
            setTrafficReduction(35);
            setConstructionControl(40);
            setIndustrialControl(35);
        } else {
            setTrafficReduction(20);
            setConstructionControl(20);
            setIndustrialControl(20);
        }
        setAutoMode(!autoMode);
    };

    const getAQITheme = (aqi) => {
        if (aqi <= 50) return { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200' };
        if (aqi <= 100) return { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' };
        if (aqi <= 200) return { bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-200' };
        return { bg: 'bg-rose-50', text: 'text-rose-700', border: 'border-rose-200' };
    };

    const currentTheme = getAQITheme(currentAQI);
    const projectedTheme = getAQITheme(projectedAQI);
    const isImproving = improvement > 0;

    return (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-300">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Policy Scenario Modeling</h3>
                    <div className="flex items-center space-x-2">
                        <Sliders size={16} className="text-slate-600" />
                        <span className="text-sm font-black text-slate-800 uppercase tracking-tight">"What If" Simulator</span>
                    </div>
                </div>
                <button
                    onClick={handleAutoMode}
                    className={`px-3 py-1.5 rounded-lg text-xs font-black uppercase tracking-tighter transition-all ${autoMode
                        ? 'bg-indigo-500 text-white'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                >
                    {autoMode ? '⚡ Auto' : 'Manual'}
                </button>
            </div>

            {/* Slider Controls */}
            <div className="space-y-4 mb-6">
                {/* Traffic Reduction */}
                <div>
                    <div className="flex justify-between items-center mb-2">
                        <label className="text-xs font-black text-slate-700 uppercase tracking-widest">🚗 Traffic Reduction</label>
                        <span className="text-sm font-black text-slate-800">{trafficReduction}%</span>
                    </div>
                    <input
                        type="range"
                        min="0"
                        max="100"
                        value={trafficReduction}
                        onChange={(e) => setTrafficReduction(Number(e.target.value))}
                        className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                    />
                </div>

                {/* Construction Control */}
                <div>
                    <div className="flex justify-between items-center mb-2">
                        <label className="text-xs font-black text-slate-700 uppercase tracking-widest">🏗️ Construction Control</label>
                        <span className="text-sm font-black text-slate-800">{constructionControl}%</span>
                    </div>
                    <input
                        type="range"
                        min="0"
                        max="100"
                        value={constructionControl}
                        onChange={(e) => setConstructionControl(Number(e.target.value))}
                        className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                    />
                </div>

                {/* Industrial Control */}
                <div>
                    <div className="flex justify-between items-center mb-2">
                        <label className="text-xs font-black text-slate-700 uppercase tracking-widest">🏭 Industrial Control</label>
                        <span className="text-sm font-black text-slate-800">{industrialControl}%</span>
                    </div>
                    <input
                        type="range"
                        min="0"
                        max="100"
                        value={industrialControl}
                        onChange={(e) => setIndustrialControl(Number(e.target.value))}
                        className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                    />
                </div>
            </div>

            {/* Results Grid */}
            <div className="grid grid-cols-2 gap-3 mb-4">
                <div className={`${currentTheme.bg} border ${currentTheme.border} rounded-xl p-4`}>
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Current AQI</p>
                    <p className={`text-3xl font-black ${currentTheme.text} tabular-nums`}>{Math.round(currentAQI)}</p>
                </div>

                <div className={`${projectedTheme.bg} border ${projectedTheme.border} rounded-xl p-4 relative overflow-hidden`}>
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Projected AQI</p>
                    <p className={`text-3xl font-black ${projectedTheme.text} tabular-nums animate-in fade-in duration-300`}>
                        {displayedAQI}
                    </p>
                    {isImproving && (
                        <div className="absolute top-2 right-2 text-lg">↓</div>
                    )}
                </div>
            </div>

            {/* Improvement Impact */}
            <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
                    <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-2">Improvement Value</p>
                    <div className="flex items-baseline gap-2">
                        <p className={`text-2xl font-black ${isImproving ? 'text-emerald-600' : 'text-slate-600'}`}>
                            {isImproving ? '−' : '+ '}{improvement}
                        </p>
                        <p className="text-sm text-slate-600">({improvementPercent}%)</p>
                    </div>
                </div>

                <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4">
                    <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-2">Health Impact Index</p>
                    <div className="flex items-baseline gap-2">
                        <p className="text-2xl font-black text-emerald-700">{healthImpactScore}%</p>
                        <p className="text-xs text-emerald-600 font-bold">Improvement</p>
                    </div>
                </div>
            </div>

            {/* Lives Protected Badge */}
            {improvement > 0 && (
                <div className="bg-gradient-to-r from-emerald-50 to-green-50 border border-emerald-200 rounded-xl p-4 mb-4 animate-in slide-in-from-bottom-2 fade-in duration-500">
                    <div className="flex items-center gap-3">
                        <TrendingDown size={24} className="text-emerald-600" />
                        <div>
                            <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Lives Potentially Protected</p>
                            <div className="flex items-baseline gap-2 mt-1">
                                <p className="text-3xl font-black text-emerald-700">~{livesProtected}</p>
                                <p className="text-sm text-emerald-600 font-bold">people daily</p>
                            </div>
                        </div>
                    </div>
                    <p className="text-[9px] text-emerald-700 mt-3 italic">Current policy scenario reduces health burden significantly</p>
                </div>
            )}

            {/* Control Room Feel */}
            <div className="bg-slate-900 text-white rounded-lg p-4 font-mono text-xs">
                <p className="text-slate-400 mb-2">〉 CONTROL ROOM STATUS</p>
                <div className="space-y-1 text-slate-300">
                    <p>Traffic: {trafficReduction}% | Construction: {constructionControl}% | Industrial: {industrialControl}%</p>
                    <p>→ Projected Improvement: {improvement} points ({improvementPercent}%)</p>
                    <p className={improvement > 20 ? 'text-emerald-400' : improvement > 0 ? 'text-amber-400' : 'text-slate-400'}>
                        {improvement > 20 ? '✓ EXCELLENT IMPACT' : improvement > 0 ? '◐ MODERATE IMPACT' : '- NO CHANGE'}
                    </p>
                </div>
            </div>
        </div>
    );
};

export default PolicySimulator;
