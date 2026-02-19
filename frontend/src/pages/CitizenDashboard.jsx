import React, { useState, useEffect, useCallback } from 'react';
import { getForecast, getRisk, getAnomalies, getHotspots } from '../api/api';
import CitySelector from '../components/CitySelector';
import RiskCard from '../components/RiskCard';
import ForecastChart from '../components/ForecastChart';
import HotspotMap from '../components/HotspotMap';
import AnomalyPanel from '../components/AnomalyPanel';
import ViolationUpload from '../components/ViolationUpload';
import { Leaf, Info } from 'lucide-react';

const CitizenDashboard = () => {
    const [selectedCity, setSelectedCity] = useState('Delhi');
    const [data, setData] = useState({ forecast: null, risk: null, anomalies: null, hotspots: null });
    const [loading, setLoading] = useState({ forecast: true, risk: true, anomalies: true, hotspots: true });

    const fetchData = useCallback(async (city) => {
        setLoading({ forecast: true, risk: true, anomalies: true, hotspots: true });

        // Define loaders
        const fetchers = [
            { key: 'forecast', fn: getForecast },
            { key: 'risk', fn: getRisk },
            { key: 'anomalies', fn: getAnomalies },
            { key: 'hotspots', fn: getHotspots }
        ];

        fetchers.forEach(async ({ key, fn }) => {
            try {
                const response = await fn(city);
                setData(prev => ({ ...prev, [key]: response.data }));
            } catch (err) {
                console.error(`Error:`, err);
            } finally {
                setLoading(prev => ({ ...prev, [key]: false }));
            }
        });
    }, []);

    useEffect(() => {
        fetchData(selectedCity);
    }, [selectedCity, fetchData]);

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <div className="flex items-center gap-2 text-emerald-600 mb-1">
                        <Leaf size={20} />
                        <span className="text-[10px] font-black uppercase tracking-[0.2em]">Public Awareness Portal</span>
                    </div>
                    <h1 className="text-4xl font-black text-slate-800 tracking-tighter">Your Air Quality</h1>
                </div>
                <CitySelector selectedCity={selectedCity} onCityChange={setSelectedCity} />
            </div>

            {/* Main Grid: Awareness Focus */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                {/* Left Side: Risk & Alerts */}
                <div className="lg:col-span-4 space-y-6 lg:sticky lg:top-24">
                    <RiskCard data={data.risk} loading={loading.risk} />
                    <AnomalyPanel data={data.anomalies} loading={loading.anomalies} detailLevel="basic" />

                    <div className="bg-blue-600 p-6 rounded-3xl text-white shadow-xl shadow-blue-500/20">
                        <div className="flex items-center gap-2 mb-3">
                            <Info size={18} />
                            <span className="text-[10px] font-black uppercase tracking-widest">Health Tip</span>
                        </div>
                        <p className="text-sm font-bold leading-relaxed mb-4 italic">
                            "{data.risk?.description || 'Loading safety data for your health...'}"
                        </p>
                        <div className="text-[9px] font-black uppercase text-blue-200">
                            AI GUIDANCE • SYNCED LIVE
                        </div>
                    </div>
                </div>

                {/* Right Side: Visuals */}
                <div className="lg:col-span-8 space-y-8 h-full">
                    <ForecastChart data={data.forecast} loading={loading.forecast} />
                    <HotspotMap data={data.hotspots} loading={loading.hotspots} mode="station" />
                </div>
            </div>

            {/* SPACER */}
            <div className="h-12"></div>

            {/* Action Zone: Violation Reporting */}
            <div className="pt-20 border-t border-slate-200 block w-full">
                <div className="max-w-3xl mx-auto pb-12">
                    <div className="text-center mb-10">
                        <h2 className="text-3xl font-black text-slate-800 tracking-tight mb-2">Notice a Violation?</h2>
                        <p className="text-slate-500 font-medium">Use our AI-powered reporting tool to notify authorities immediately.</p>
                    </div>
                    <ViolationUpload hideHeader={true} />
                </div>
            </div>
        </div>
    );
};

export default CitizenDashboard;
