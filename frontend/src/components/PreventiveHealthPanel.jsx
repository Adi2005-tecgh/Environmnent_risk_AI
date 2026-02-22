import React, { useState } from 'react';
import {
    Wind,
    Heart,
    Thermometer,
    Accessibility,
    AlertCircle,
    CheckCircle2,
    XCircle
} from 'lucide-react';

const HEALTH_CONDITIONS = [
    {
        id: 'asthma',
        label: 'Asthma',
        icon: Wind,
        description: 'Risk of Asthma symptoms is {risk} when AQI is {category} ({range})',
        symptoms: 'Severe symptoms including intense wheezing, severe shortness of breath, significant chest tightness, and persistent coughing that may disrupt daily activities.',
        dos: [
            'Avoid going outside and keep windows closed.',
            'Take prescribed medications as directed.'
        ],
        donts: [
            'Smoke or expose yourself to secondhand smoke.',
            'Engage in physical exertion outdoors.'
        ],
        riskLevel: (aqi) => aqi > 200 ? 'Critical' : aqi > 100 ? 'High' : 'Moderate'
    },
    {
        id: 'heart',
        label: 'Heart Issues',
        icon: Heart,
        description: 'Risk of Cardiac stress is {risk} when AQI is {category} ({range})',
        symptoms: 'Increased heart rate, palpitations, chest pain, and fatigue. Pollution triggers inflammatory responses.',
        dos: [
            'Stay in air-filtered environments.',
            'Monitor blood pressure and heart rate.'
        ],
        donts: [
            'Ignore sudden discomfort or shortness of breath.',
            'Perform heavy lifting outdoors.'
        ],
        riskLevel: (aqi) => aqi > 200 ? 'Extreme' : aqi > 100 ? 'High' : 'Low'
    },
    {
        id: 'allergies',
        label: 'Allergies',
        icon: Thermometer,
        description: 'Allergic reactivity is {risk} when AQI is {category} ({range})',
        symptoms: 'Nasal congestion, itchy eyes, sneezing. High PM exacerbates sensitivity.',
        dos: [
            'Use HEPA filters indoors.',
            'Shower after being outdoors.'
        ],
        donts: [
            'Dry clothes outdoors.',
            'Keep windows open during peak hours.'
        ],
        riskLevel: (aqi) => aqi > 150 ? 'High' : 'Moderate'
    },
    {
        id: 'sinus',
        label: 'Sinus',
        icon: Accessibility,
        description: 'Sinus inflammation risk is {risk} when AQI is {category} ({range})',
        symptoms: 'Facial pain, pressure, headaches. Stagnant air allows pollutants to irritate membranes.',
        dos: [
            'Use saline rinses to clear passages.',
            'Stay well-hydrated.'
        ],
        donts: [
            'Overuse decongestant sprays.',
            'Stay in dry, dusty environments.'
        ],
        riskLevel: (aqi) => aqi > 150 ? 'High' : 'Moderate'
    }
];

const PreventiveHealthPanel = ({ aqi = 100, city = "Your Location" }) => {
    const [selectedId, setSelectedId] = useState('asthma');

    const activeCondition = HEALTH_CONDITIONS.find(c => c.id === selectedId) || HEALTH_CONDITIONS[0];

    const getAQICategory = (val) => {
        if (val <= 50) return { label: "Good", range: "0-50" };
        if (val <= 100) return { label: "Satisfactory", range: "51-100" };
        if (val <= 200) return { label: "Severe", range: "150-301" };
        return { label: "Hazardous", range: "301+" };
    };

    const cat = getAQICategory(aqi);
    const currentRisk = activeCondition.riskLevel(aqi);

    return (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 space-y-6">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-2 border-b border-slate-100 pb-4">
                <div>
                    <h2 className="text-lg font-black text-slate-900 tracking-tight">Prevent Health Problems</h2>
                    <p className="text-blue-600 font-bold text-[10px] uppercase tracking-widest">{city} Monitoring</p>
                </div>
            </div>

            <div className="flex overflow-x-auto gap-2 pb-1 no-scrollbar">
                {HEALTH_CONDITIONS.map((condition) => (
                    <button
                        key={condition.id}
                        onClick={() => setSelectedId(condition.id)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg font-black text-[10px] uppercase tracking-widest transition-all shrink-0 ${selectedId === condition.id
                            ? 'bg-blue-600 text-white shadow-md'
                            : 'bg-slate-50 text-slate-500 hover:bg-slate-100'
                            }`}
                    >
                        <condition.icon size={14} />
                        {condition.label}
                    </button>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 bg-slate-50/50 rounded-lg border border-slate-100 p-5">
                <div className="lg:col-span-12 flex flex-col gap-4">
                    <div>
                        <h3 className="text-sm font-black text-slate-900 mb-2 flex items-center gap-2">
                            {activeCondition.label}
                            <span className="bg-rose-100 text-rose-600 px-2 py-0.5 rounded text-[8px] uppercase">{currentRisk} Risk</span>
                        </h3>
                        <p className="text-xs text-slate-600 font-medium leading-relaxed">
                            {activeCondition.symptoms}
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-slate-200/50">
                        <div>
                            <h4 className="flex items-center gap-1.5 text-[9px] font-black text-emerald-600 uppercase tracking-widest mb-2">
                                <CheckCircle2 size={12} />
                                Do's
                            </h4>
                            <ul className="space-y-1.5">
                                {activeCondition.dos.map((doItem, k) => (
                                    <li key={k} className="flex gap-1.5 text-[10px] font-bold text-slate-600 leading-tight">
                                        <div className="text-emerald-500 shrink-0 mt-0.5">✓</div>
                                        {doItem}
                                    </li>
                                ))}
                            </ul>
                        </div>
                        <div>
                            <h4 className="flex items-center gap-1.5 text-[9px] font-black text-rose-600 uppercase tracking-widest mb-2">
                                <XCircle size={12} />
                                Don'ts
                            </h4>
                            <ul className="space-y-1.5">
                                {activeCondition.donts.map((dontItem, k) => (
                                    <li key={k} className="flex gap-1.5 text-[10px] font-bold text-slate-600 leading-tight">
                                        <div className="text-rose-500 shrink-0 mt-0.5">✕</div>
                                        {dontItem}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>
            </div>

            <p className="text-[8px] text-slate-400 font-bold italic text-center uppercase tracking-tighter opacity-70">
                Precautionary suggestions based on current {cat.label} ({cat.range}) conditions.
            </p>
        </div>
    );
};

export default PreventiveHealthPanel;
