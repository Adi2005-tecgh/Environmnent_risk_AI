import React, { useState, useEffect, useCallback } from 'react';
import { getForecast, getRisk, getAnomalies, getHotspots } from '../api/api';
import CitySelector from '../components/CitySelector';
import RiskCard from '../components/RiskCard';
import ForecastChart from '../components/ForecastChart';
import HotspotMap from '../components/HotspotMap';
import AnomalyPanel from '../components/AnomalyPanel';
import GovernmentAnalyticsPanel from '../components/GovernmentAnalyticsPanel';
import ClusterTable from '../components/ClusterTable';
import ViolationMonitoring from '../components/ViolationMonitoring';
import { Shield, RefreshCw, AlertCircle, FileText, Settings } from 'lucide-react';

const GovernmentDashboard = () => {
    const [selectedCity, setSelectedCity] = useState('Delhi');
    const [data, setData] = useState({ forecast: null, risk: null, anomalies: null, hotspots: null });
    const [loading, setLoading] = useState({ forecast: true, risk: true, anomalies: true, hotspots: true });

    const fetchData = useCallback(async (city) => {
        setLoading({ forecast: true, risk: true, anomalies: true, hotspots: true });

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
                console.error(`Gov Data Fetch Error:`, err);
            } finally {
                setLoading(prev => ({ ...prev, [key]: false }));
            }
        });
    }, []);

    useEffect(() => {
        fetchData(selectedCity);
    }, [selectedCity, fetchData]);

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            {/* Gov Header: Shared width with App container */}
            <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6 bg-white p-6 rounded-[2.5rem] border border-slate-200 shadow-sm">
                <div className="flex items-center gap-4">
                    <div className="bg-slate-900 text-white p-3 rounded-2xl">
                        <Shield size={28} />
                    </div>
                    <div>
                        <h1 className="text-2xl font-black text-slate-900 tracking-tighter uppercase italic">
                            Authority <span className="text-blue-600">Command</span> Hub
                        </h1>
                        <div className="flex items-center gap-3">
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">AeroNova Intelligence System v2.0</span>
                            <div className="w-1 h-1 rounded-full bg-emerald-500"></div>
                            <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">Secure Link Active</span>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <CitySelector selectedCity={selectedCity} onCityChange={setSelectedCity} />
                    <button
                        onClick={() => fetchData(selectedCity)}
                        className="p-4 bg-slate-900 text-white rounded-2xl hover:bg-blue-600 transition-all shadow-lg shadow-slate-900/10"
                    >
                        <RefreshCw size={20} />
                    </button>
                </div>
            </div>

            {/* Top Stats */}
            <GovernmentAnalyticsPanel data={data} loading={loading.hotspots} />

            {/* Multi-Column Intelligence Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                {/* Column 1: Indicators (3 cols) */}
                <div className="lg:col-span-3 space-y-6">
                    <RiskCard data={data.risk} loading={loading.risk} isAdvanced={true} />
                    <AnomalyPanel data={data.anomalies} loading={loading.anomalies} detailLevel="advanced" />
                </div>

                {/* Column 2: Geospatial & Predictive (6 cols) */}
                <div className="lg:col-span-6 space-y-6">
                    <div className="min-h-[500px]">
                        <HotspotMap data={data.hotspots} loading={loading.hotspots} mode="cluster" />
                    </div>
                    <ForecastChart data={data.forecast} loading={loading.forecast} showMetadata={true} />
                </div>

                {/* Column 3: Tabular Intel & Actions (3 cols) */}
                <div className="lg:col-span-3 lg:space-y-6 flex flex-col gap-6">
                    <ViolationMonitoring />
                    <ClusterTable hotspots={data.hotspots?.hotspots || []} loading={loading.hotspots} />

                    {/* Intervention Control */}
                    <div className="bg-slate-900 rounded-[2.5rem] p-6 text-white overflow-hidden relative group shrink-0">
                        <div className="absolute -top-10 -right-10 w-32 h-32 bg-blue-500/10 rounded-full blur-2xl group-hover:bg-blue-500/20 transition-colors"></div>
                        <h4 className="text-xs font-black uppercase tracking-widest mb-4 flex items-center gap-2">
                            <Settings size={14} className="text-blue-400" /> Control Center
                        </h4>
                        <div className="space-y-3">
                            {['Initiate Filter Scan', 'Deploy Mobile Node', 'Audit Industrial Sector'].map((act, i) => (
                                <button key={i} className="w-full py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-xs font-black uppercase tracking-widest transition-all text-left px-4 flex justify-between items-center group/btn">
                                    {act}
                                    <FileText size={14} className="text-white/30 group-hover/btn:text-white" />
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="bg-rose-50 border border-rose-100 p-5 rounded-[2.5rem] flex items-start gap-4 ring-2 ring-rose-500/10 animate-pulse shrink-0 mb-8">
                        <AlertCircle className="text-rose-500 shrink-0" size={24} />
                        <div>
                            <p className="text-[10px] font-black text-rose-500 uppercase tracking-widest mb-1 italic underline">Critical Directives</p>
                            <p className="text-xs font-bold text-rose-800 leading-relaxed">
                                AI detects 18% surge in PM2.5 at CID-002. Deployment of smog tower recommended.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default GovernmentDashboard;
