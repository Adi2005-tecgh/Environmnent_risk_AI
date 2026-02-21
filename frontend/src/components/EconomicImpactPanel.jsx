import React, { useMemo, useState, useEffect } from 'react';
import { DollarSign, TrendingDown, Info, X, ChevronDown, ChevronUp, HelpCircle } from 'lucide-react';

const EconomicImpactPanel = ({ currentAQI = 100 }) => {
    const [modalProductivity, setModalProductivity] = useState(false);
    const [modalHealthcare, setModalHealthcare] = useState(false);
    const [overallRiskExpanded, setOverallRiskExpanded] = useState(false);
    const [whyMattersOpen, setWhyMattersOpen] = useState(false);
    const [displayProductivity, setDisplayProductivity] = useState(0);
    const [displayHealthcare, setDisplayHealthcare] = useState(0);
    const [displayRiskScore, setDisplayRiskScore] = useState(0);

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

    useEffect(() => {
        const duration = 600;
        const steps = 20;
        const stepMs = duration / steps;
        let step = 0;
        const startP = displayProductivity;
        const startH = displayHealthcare;
        const startR = displayRiskScore;
        const endP = impacts.productivityLoss;
        const endH = impacts.healthcareBurden;
        const endR = impacts.riskScore;
        const timer = setInterval(() => {
            step++;
            const t = step / steps;
            const ease = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
            setDisplayProductivity(Math.round(startP + (endP - startP) * ease));
            setDisplayHealthcare(Math.round(startH + (endH - startH) * ease));
            setDisplayRiskScore(Math.round(startR + (endR - startR) * ease));
            if (step >= steps) clearInterval(timer);
        }, stepMs);
        return () => clearInterval(timer);
    }, [impacts.productivityLoss, impacts.healthcareBurden, impacts.riskScore]);

    const getRiskTheme = (level) => {
        const themes = {
            'Low': { text: 'text-emerald-700', bg: 'bg-emerald-50', border: 'border-emerald-200' },
            'Moderate': { text: 'text-blue-700', bg: 'bg-blue-50', border: 'border-blue-200' },
            'High': { text: 'text-orange-700', bg: 'bg-orange-50', border: 'border-orange-200' },
            'Extreme': { text: 'text-rose-700', bg: 'bg-rose-50', border: 'border-rose-200' }
        };
        return themes[level] || themes['Low'];
    };

    const getProductivityInterpretation = (pct) => {
        if (pct >= 80) return 'Severe economic impact';
        if (pct >= 60) return 'Major operational disruption';
        if (pct >= 30) return 'Noticeable slowdown';
        if (pct > 0) return 'Mild impact';
        return null;
    };

    const getHealthcareInterpretation = (pct) => {
        if (pct >= 80) return 'Severe strain on healthcare systems';
        if (pct >= 60) return 'Major pressure on hospitals and respiratory care';
        if (pct >= 30) return 'Noticeable increase in demand';
        if (pct > 0) return 'Mild impact';
        return null;
    };

    const getGaugeColor = (score) => {
        if (score <= 30) return '#10b981';
        if (score <= 60) return '#eab308';
        if (score <= 80) return '#f97316';
        return '#e11d48';
    };

    const riskTheme = getRiskTheme(impacts.economicRiskLevel);
    const productivityContribution = impacts.riskScore > 0 ? Math.round((impacts.productivityLoss / (impacts.productivityLoss + impacts.healthcareBurden)) * 100) : 50;
    const healthcareContribution = impacts.riskScore > 0 ? 100 - productivityContribution : 50;

    const Modal = ({ open, onClose, title, children }) => {
        if (!open) return null;
        return (
            <div
                className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200"
                onClick={onClose}
            >
                <div
                    className="bg-white rounded-2xl shadow-xl border border-slate-200 max-w-lg w-full max-h-[85vh] overflow-hidden flex flex-col animate-in zoom-in-95 duration-200"
                    onClick={(e) => e.stopPropagation()}
                >
                    <div className="flex items-center justify-between p-4 border-b border-slate-100">
                        <h4 className="text-sm font-black text-slate-800 uppercase tracking-tight">{title}</h4>
                        <button onClick={onClose} className="p-2 rounded-lg hover:bg-slate-100 transition-colors" aria-label="Close">
                            <X size={18} className="text-slate-500" />
                        </button>
                    </div>
                    <div className="p-4 overflow-y-auto text-sm text-slate-600 space-y-3">{children}</div>
                </div>
            </div>
        );
    };

    return (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
            <div className="mb-6">
                <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Economic Impact Assessment</h3>
                <div className="flex items-center space-x-2 mb-1">
                    <DollarSign size={16} className="text-slate-600" />
                    <span className="text-sm font-black text-slate-800 uppercase tracking-tight">Economic & Public Health Impact Analysis</span>
                </div>
                <p className="text-xs text-slate-600">How current AQI levels impact workforce productivity and healthcare systems.</p>
            </div>

            {/* Impact Cards - Clickable with hover */}
            <div className="space-y-3 mb-4">
                {/* Productivity Loss - Clickable */}
                <button
                    type="button"
                    onClick={() => setModalProductivity(true)}
                    className="group w-full text-left bg-slate-50 border border-slate-100 rounded-xl p-4 transition-all duration-200 hover:shadow-md hover:scale-[1.02] hover:border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400"
                >
                    <div className="flex items-center justify-between gap-2 mb-1">
                        <div className="flex items-center gap-1.5">
                            <label className="text-xs font-black text-slate-600 uppercase tracking-widest">Productivity Loss</label>
                            <span className="text-slate-400 shrink-0" title="Calculated as (AQI / 300) × 100. AQI 300 represents severe pollution conditions where outdoor work becomes heavily restricted.">
                                <Info size={14} />
                            </span>
                        </div>
                        <span className="text-lg font-black text-slate-900 tabular-nums transition-all duration-300">{displayProductivity}%</span>
                    </div>
                    <p className="text-[10px] text-slate-500 mb-2">Estimated reduction in workforce efficiency due to current air pollution levels.</p>
                    <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                        <div
                            className="h-2 rounded-full transition-all duration-500 ease-out bg-blue-600 group-hover:shadow-[0_0_10px_rgba(37,99,235,0.6)]"
                            style={{ width: `${impacts.productivityLoss}%` }}
                        />
                    </div>
                    <p className="text-[9px] text-slate-500 mt-2">(AQI / 300) × 100</p>
                    {getProductivityInterpretation(impacts.productivityLoss) && (
                        <p className="text-[10px] text-slate-600 mt-1.5 font-medium">{getProductivityInterpretation(impacts.productivityLoss)}</p>
                    )}
                    <p className="text-[10px] text-blue-600 mt-2 font-medium">Click for details →</p>
                </button>

                {/* Healthcare Burden - Clickable */}
                <button
                    type="button"
                    onClick={() => setModalHealthcare(true)}
                    className="group w-full text-left bg-slate-50 border border-slate-100 rounded-xl p-4 transition-all duration-200 hover:shadow-md hover:scale-[1.02] hover:border-slate-200 focus:outline-none focus:ring-2 focus:ring-rose-500/30 focus:border-rose-400"
                >
                    <div className="flex items-center justify-between gap-2 mb-1">
                        <div className="flex items-center gap-1.5">
                            <label className="text-xs font-black text-slate-600 uppercase tracking-widest">Healthcare Burden</label>
                            <span className="text-slate-400 shrink-0" title="Calculated as (AQI / 250) × 100. Healthcare systems experience pressure earlier than economic systems during pollution spikes.">
                                <Info size={14} />
                            </span>
                        </div>
                        <span className="text-lg font-black text-slate-900 tabular-nums transition-all duration-300">{displayHealthcare}%</span>
                    </div>
                    <p className="text-[10px] text-slate-500 mb-2">Estimated strain on hospitals and respiratory care services due to pollution exposure.</p>
                    <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                        <div
                            className="h-2 rounded-full transition-all duration-500 ease-out bg-rose-600 group-hover:shadow-[0_0_10px_rgba(225,29,72,0.5)]"
                            style={{ width: `${impacts.healthcareBurden}%` }}
                        />
                    </div>
                    <p className="text-[9px] text-slate-500 mt-2">(AQI / 250) × 100</p>
                    {getHealthcareInterpretation(impacts.healthcareBurden) && (
                        <p className="text-[10px] text-slate-600 mt-1.5 font-medium">{getHealthcareInterpretation(impacts.healthcareBurden)}</p>
                    )}
                    <p className="text-[10px] text-rose-600 mt-2 font-medium">Click for details →</p>
                </button>
            </div>

            {/* Risk Score & Level + Gauge + Expandable */}
            <div className="grid grid-cols-2 gap-3 mb-4">
                <button
                    type="button"
                    onClick={() => setOverallRiskExpanded(!overallRiskExpanded)}
                    className="text-left bg-slate-50 border border-slate-100 rounded-xl p-4 transition-all duration-200 hover:shadow-md hover:border-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-400/30"
                >
                    <div className="flex items-center justify-between mb-2">
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Overall Risk</p>
                        {overallRiskExpanded ? <ChevronUp size={14} className="text-slate-400" /> : <ChevronDown size={14} className="text-slate-400" />}
                    </div>
                    <div className="flex items-baseline gap-1">
                        <p className="text-2xl font-black text-slate-900 tabular-nums">{displayRiskScore}</p>
                        <p className="text-xs text-slate-500">/100</p>
                    </div>
                    <p className="text-[10px] text-slate-500 mt-1.5">Combined impact score based on productivity loss and healthcare burden.</p>
                    {overallRiskExpanded && (
                        <div className="mt-3 pt-3 border-t border-slate-200 space-y-1.5 animate-in slide-in-from-top-2 duration-200">
                            <p className="text-[10px] text-slate-600">Productivity contribution: <span className="font-black text-slate-800">{productivityContribution}%</span></p>
                            <p className="text-[10px] text-slate-600">Healthcare contribution: <span className="font-black text-slate-800">{healthcareContribution}%</span></p>
                            <p className="text-[10px] text-slate-500 italic">Overall risk represents combined economic and healthcare system stress.</p>
                        </div>
                    )}
                </button>

                <div className="flex flex-col items-center justify-center gap-2">
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest w-full">Risk Level</p>
                    <svg className="w-full h-16" viewBox="0 0 120 60" preserveAspectRatio="xMidYMax meet">
                        <path d="M 10 50 A 50 50 0 0 1 110 50" fill="none" stroke="#e2e8f0" strokeWidth="8" strokeLinecap="round" />
                        <path
                            d="M 10 50 A 50 50 0 0 1 110 50"
                            fill="none"
                            stroke={getGaugeColor(impacts.riskScore)}
                            strokeWidth="8"
                            strokeLinecap="round"
                            strokeDasharray={`${(impacts.riskScore / 100) * 157} 157`}
                            className="transition-all duration-700 ease-out"
                        />
                    </svg>
                    <p className={`text-base font-black ${riskTheme.text}`}>{impacts.economicRiskLevel}</p>
                    {impacts.economicRiskLevel === 'Extreme' && (
                        <p className="text-[10px] text-slate-600 mt-0.5 text-center">Immediate intervention recommended to prevent economic slowdown and hospital overload.</p>
                    )}
                    {impacts.economicRiskLevel === 'High' && (
                        <p className="text-[10px] text-slate-600 mt-0.5 text-center">Action recommended to reduce productivity loss and healthcare pressure.</p>
                    )}
                    {impacts.economicRiskLevel === 'Moderate' && (
                        <p className="text-[10px] text-slate-600 mt-0.5 text-center">Monitor conditions and plan for possible escalation.</p>
                    )}
                    {impacts.economicRiskLevel === 'Low' && (
                        <p className="text-[10px] text-slate-600 mt-0.5 text-center">Conditions within acceptable range; maintain routine monitoring.</p>
                    )}
                </div>
            </div>

            {/* Impact Summary */}
            <div className="pt-4 border-t border-slate-100">
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">Status</p>
                <div className="space-y-2">
                    {impacts.productivityLoss > 50 && (
                        <div className="flex items-start gap-2 bg-orange-50 border border-orange-200 rounded-lg p-2">
                            <TrendingDown size={14} className="text-orange-600 mt-0.5 shrink-0" />
                            <p className="text-xs text-orange-700">Significant productivity slowdown expected across outdoor and industrial sectors.</p>
                        </div>
                    )}
                    {impacts.healthcareBurden > 60 && (
                        <div className="flex items-start gap-2 bg-rose-50 border border-rose-200 rounded-lg p-2">
                            <TrendingDown size={14} className="text-rose-600 mt-0.5 shrink-0" />
                            <p className="text-xs text-rose-700">High probability of increased respiratory and emergency hospital visits.</p>
                        </div>
                    )}
                    {impacts.riskScore <= 20 && (
                        <div className="flex items-start gap-2 bg-emerald-50 border border-emerald-200 rounded-lg p-2">
                            <span className="text-xs text-emerald-700 font-bold">✓ Favorable conditions</span>
                        </div>
                    )}
                </div>
            </div>

            {/* How to Interpret This Section */}
            <div className="mt-6 pt-4 border-t border-slate-100 bg-slate-50/80 border border-slate-100 rounded-xl p-4">
                <p className="text-xs font-black text-slate-600 uppercase tracking-widest mb-2">How to Interpret This Section</p>
                <ul className="text-[11px] text-slate-600 space-y-1.5 list-disc list-inside">
                    <li>AQI measures air pollution severity.</li>
                    <li>Higher AQI increases economic slowdown.</li>
                    <li>Healthcare burden rises faster than productivity impact.</li>
                    <li>These values help policymakers plan resource allocation.</li>
                </ul>
            </div>

            {/* Why This Matters - Button + Slide-down panel */}
            <div className="mt-6">
                <button
                    type="button"
                    onClick={() => setWhyMattersOpen(!whyMattersOpen)}
                    className="flex items-center gap-2 w-full justify-center py-3 px-4 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 transition-colors duration-200 text-sm font-bold text-slate-700"
                >
                    <HelpCircle size={18} className="text-slate-500" />
                    Why Does This Matter?
                    {whyMattersOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </button>
                <div
                    className={`grid transition-all duration-300 ease-out overflow-hidden ${whyMattersOpen ? 'grid-rows-[1fr] opacity-100 mt-3' : 'grid-rows-[0fr] opacity-0'}`}
                >
                    <div className="min-h-0">
                        <div className="bg-slate-50 border border-slate-100 rounded-xl p-4 space-y-2 text-xs text-slate-600">
                            <p><span className="font-black text-slate-700">Economic slowdown</span> costs cities revenue and reduces workforce output.</p>
                            <p><span className="font-black text-slate-700">Healthcare overload</span> increases mortality risk and stretches emergency capacity.</p>
                            <p><span className="font-black text-slate-700">Early intervention</span> reduces long-term impact and recovery costs.</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Modals */}
            <Modal open={modalProductivity} onClose={() => setModalProductivity(false)} title="Productivity Loss — What It Means">
                <p className="font-medium text-slate-800">What it means in simple language</p>
                <p>Productivity loss is the estimated drop in how much work can be done safely and effectively when air quality is poor. It reflects reduced efficiency, more breaks, and restrictions on outdoor work.</p>
                <p className="font-medium text-slate-800 mt-3">Real-world effects</p>
                <ul className="list-disc list-inside space-y-1">
                    <li>Industry slowdown (delays, absenteeism)</li>
                    <li>Outdoor work impact (construction, delivery, fieldwork)</li>
                    <li>Transport delays and logistics disruption</li>
                </ul>
                <p className="font-medium text-slate-800 mt-3">Sector examples</p>
                <ul className="list-disc list-inside space-y-1">
                    <li><strong>Construction</strong> — Site work restricted; projects delayed</li>
                    <li><strong>Logistics</strong> — Delivery and warehouse efficiency drop</li>
                    <li><strong>Manufacturing</strong> — Ventilation and worker health limits output</li>
                </ul>
                <p className="font-medium text-slate-800 mt-3">Why AQI affects productivity</p>
                <p>High AQI means more fine particles and gases. Workers need more breaks, wear masks, or stay indoors. Outdoor and physically demanding jobs are hit hardest.</p>
                <p className="font-medium text-slate-800 mt-3">How government can respond</p>
                <p>Governments can issue work-from-home guidance, restrict non-essential outdoor work, deploy air purifiers in critical workplaces, and coordinate with industry to stagger shifts during peak pollution.</p>
            </Modal>

            <Modal open={modalHealthcare} onClose={() => setModalHealthcare(false)} title="Healthcare Burden — What It Means">
                <p className="font-medium text-slate-800">What hospital strain means</p>
                <p>Healthcare burden is the extra pressure on hospitals and clinics when more people need care for breathing problems, heart issues, and other pollution-related conditions.</p>
                <p className="font-medium text-slate-800 mt-3">Expected rise in respiratory cases</p>
                <ul className="list-disc list-inside space-y-1">
                    <li>Asthma exacerbations and COPD flare-ups</li>
                    <li>Bronchitis and respiratory infections</li>
                    <li>Increased emergency visits and hospital admissions</li>
                </ul>
                <p className="font-medium text-slate-800 mt-3">Impact on children &amp; elderly</p>
                <ul className="list-disc list-inside space-y-1">
                    <li><strong>Children</strong> — Developing lungs more vulnerable; school absenteeism rises</li>
                    <li><strong>Elderly</strong> — Higher risk of heart and lung complications</li>
                </ul>
                <p className="font-medium text-slate-800 mt-3">ICU &amp; emergency load increase</p>
                <p>Severe pollution events can push emergency departments and ICU beds to capacity, affecting both pollution-related cases and other emergencies.</p>
                <p className="font-medium text-slate-800 mt-3">Preventive measures</p>
                <ul className="list-disc list-inside space-y-1">
                    <li>Public health advisories (stay indoors, limit exercise)</li>
                    <li>Stocking inhalers and respiratory meds at clinics</li>
                    <li>Prioritizing vulnerable groups for outreach and shelter</li>
                </ul>
            </Modal>
        </div>
    );
};

export default EconomicImpactPanel;
