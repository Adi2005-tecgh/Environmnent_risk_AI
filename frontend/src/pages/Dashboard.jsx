import React, { useState, useEffect, useCallback } from 'react';
import { getForecast, getRisk, getAnomalies, getHotspots } from '../api/api';
import CitySelector from '../components/CitySelector';
import RiskCard from '../components/RiskCard';
import ForecastChart from '../components/ForecastChart';
import HotspotMap from '../components/HotspotMap';
import AnomalyPanel from '../components/AnomalyPanel';
import { RefreshCw, AlertCircle } from 'lucide-react';

const Dashboard = () => {
    const [selectedCity, setSelectedCity] = useState('Delhi');
    const [data, setData] = useState({
        forecast: null,
        risk: null,
        anomalies: null,
        hotspots: null,
    });
    const [loading, setLoading] = useState({
        forecast: true,
        risk: true,
        anomalies: true,
        hotspots: true,
    });
    const [error, setError] = useState(null);

    const fetchData = useCallback(async (city) => {
        setError(null);
        setLoading({ forecast: true, risk: true, anomalies: true, hotspots: true });

        // Parallel fetching
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
                console.error(`Error fetching ${key}:`, err);
                // We don't fail the whole dashboard for one component failure
            } finally {
                setLoading(prev => ({ ...prev, [key]: false }));
            }
        });

        // Check if everything failed
        // (This is a simplified check, ideally we'd use Promise.allSettled)
    }, []);

    useEffect(() => {
        fetchData(selectedCity);
    }, [selectedCity, fetchData]);

    const handleRefresh = () => fetchData(selectedCity);

    return (
        <div className="space-y-6 animate-in fade-in duration-700">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-black text-slate-800 tracking-tight">Environmental Dashboard</h1>
                    <p className="text-slate-500 font-medium">EcoGuard AI Decision Support Hub</p>
                </div>
                <div className="flex items-center space-x-3">
                    <CitySelector selectedCity={selectedCity} onCityChange={setSelectedCity} />
                    <button
                        onClick={handleRefresh}
                        className="p-3 bg-white border border-slate-200 rounded-xl text-slate-400 hover:text-blue-600 hover:border-blue-200 transition-all shadow-sm"
                    >
                        <RefreshCw size={20} />
                    </button>
                </div>
            </div>

            {error && (
                <div className="bg-rose-50 border border-rose-100 p-4 rounded-xl flex items-center space-x-3 text-rose-600">
                    <AlertCircle size={20} />
                    <p className="font-bold text-sm tracking-tight">{error}</p>
                </div>
            )}

            {/* Grid Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Risk Assessment - 4 cols */}
                <div className="lg:col-span-4 h-full">
                    <RiskCard data={data.risk} loading={loading.risk} />
                    <div className="mt-6">
                        <AnomalyPanel data={data.anomalies} loading={loading.anomalies} />
                    </div>
                </div>

                {/* Analytics Section - 8 cols */}
                <div className="lg:col-span-8 space-y-6">
                    <div className="grid grid-cols-1 gap-6 h-full">
                        <ForecastChart data={data.forecast} loading={loading.forecast} />
                        <HotspotMap data={data.hotspots} loading={loading.hotspots} />
                    </div>
                </div>
            </div>

            {/* Bottom Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
                {[
                    { label: 'AI Confidence', value: 'High (94%)', detail: 'MLP Ensemble' },
                    { label: 'Sensor Network', value: 'Active', detail: '64 Stations' },
                    { label: 'Last Sync', value: 'Live', detail: new Date().toLocaleTimeString() }
                ].map((stat, i) => (
                    <div key={i} className="bg-slate-50 border border-slate-100 rounded-2xl p-5 flex flex-col justify-center">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{stat.label}</p>
                        <div className="flex items-baseline space-x-2">
                            <span className="text-lg font-black text-slate-800">{stat.value}</span>
                            <span className="text-xs text-slate-400 font-medium tracking-tight">/ {stat.detail}</span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Dashboard;
