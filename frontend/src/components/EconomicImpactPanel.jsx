import React, { useMemo } from 'react';
import { DollarSign, TrendingDown } from 'lucide-react';

const EconomicImpactPanel = ({ currentAQI = 100 }) => {
    const impacts = useMemo(() => {
        const productivityLoss = Math.min(100, (currentAQI / 300) * 100);
        const healthcareBurden = Math.min(100, (currentAQI / 250) * 100);
        const riskScore = ((productivityLoss + healthcareBurden) / 2);

        const getEconomicRiskLevel = () => {
            if (riskScore <= 20) return 'Low';
            if (riskScore <= 40) return 'Moderate';
            if (riskScore <= 60) return 'High';
            return 'Extreme';
        };

        return {
            productivityLoss: Math.round(productivityLoss),
            healthcareBurden: Math.round(healthcareBurden),
            riskScore: Math.round(riskScore),
            economicRiskLevel: getEconomicRiskLevel()
        };
    }, [currentAQI]);

    const getRiskTheme = (level) => {
        const themes = {
            'Low': { text: 'text-emerald-700', bg: 'bg-emerald-50', border: 'border-emerald-200' },
            'Moderate': { text: 'text-blue-700', bg: 'bg-blue-50', border: 'border-blue-200' },
            'High': { text: 'text-orange-700', bg: 'bg-orange-50', border: 'border-orange-200' },
            'Extreme': { text: 'text-rose-700', bg: 'bg-rose-50', border: 'border-rose-200' }
        };
        return themes[level] || themes['Low'];
    };

    const riskTheme = getRiskTheme(impacts.economicRiskLevel);

    return (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
            <div>
                <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Economic Impact Assessment</h3>
                <div className="flex items-center space-x-2 mb-6">
                    <DollarSign size={16} className="text-slate-600" />
                    <span className="text-sm font-black text-slate-800 uppercase tracking-tight">Financial Risk Index</span>
                </div>
            </div>

            {/* Impact Cards */}
            <div className="space-y-3 mb-4">
                {/* Productivity Loss */}
                <div className="bg-slate-50 border border-slate-100 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-2">
                        <label className="text-xs font-black text-slate-600 uppercase tracking-widest">Productivity Loss</label>
                        <span className="text-lg font-black text-slate-900">{impacts.productivityLoss}%</span>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-2">
                        <div
                            className="bg-blue-600 h-2 rounded-full transition-all"
                            style={{ width: `${impacts.productivityLoss}%` }}
                        ></div>
                    </div>
                    <p className="text-[9px] text-slate-500 mt-2">(AQI / 300) × 100</p>
                </div>

                {/* Healthcare Burden */}
                <div className="bg-slate-50 border border-slate-100 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-2">
                        <label className="text-xs font-black text-slate-600 uppercase tracking-widest">Healthcare Burden</label>
                        <span className="text-lg font-black text-slate-900">{impacts.healthcareBurden}%</span>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-2">
                        <div
                            className="bg-rose-600 h-2 rounded-full transition-all"
                            style={{ width: `${impacts.healthcareBurden}%` }}
                        ></div>
                    </div>
                    <p className="text-[9px] text-slate-500 mt-2">(AQI / 250) × 100</p>
                </div>
            </div>

            {/* Risk Score & Level */}
            <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="bg-slate-50 border border-slate-100 rounded-xl p-4">
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">Overall Risk</p>
                    <div className="flex items-baseline gap-1">
                        <p className="text-2xl font-black text-slate-900">{impacts.riskScore}</p>
                        <p className="text-xs text-slate-500">/100</p>
                    </div>
                </div>

                <div className={`${riskTheme.bg} border ${riskTheme.border} rounded-xl p-4`}>
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">Risk Level</p>
                    <p className={`text-base font-black ${riskTheme.text}`}>{impacts.economicRiskLevel}</p>
                </div>
            </div>

            {/* Impact Summary */}
            <div className="pt-4 border-t border-slate-100">
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">Status</p>
                <div className="space-y-2">
                    {impacts.productivityLoss > 50 && (
                        <div className="flex items-start gap-2 bg-orange-50 border border-orange-200 rounded-lg p-2">
                            <TrendingDown size={14} className="text-orange-600 mt-0.5 shrink-0" />
                            <p className="text-xs text-orange-700">Significant productivity impact</p>
                        </div>
                    )}
                    {impacts.healthcareBurden > 60 && (
                        <div className="flex items-start gap-2 bg-rose-50 border border-rose-200 rounded-lg p-2">
                            <TrendingDown size={14} className="text-rose-600 mt-0.5 shrink-0" />
                            <p className="text-xs text-rose-700">Critical healthcare demand</p>
                        </div>
                    )}
                    {impacts.riskScore <= 20 && (
                        <div className="flex items-start gap-2 bg-emerald-50 border border-emerald-200 rounded-lg p-2">
                            <span className="text-xs text-emerald-700 font-bold">✓ Favorable conditions</span>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default EconomicImpactPanel;
