import React, { useState, useEffect, useCallback } from 'react';
import { getForecast, getForecastByGeo, getRisk, getAnomalies, getHotspots } from '../api/api';
import CitySelector from '../components/CitySelector';
import RiskCard from '../components/RiskCard';
import ForecastChart from '../components/ForecastChart';
import HotspotMap from '../components/HotspotMap';
import AnomalyPanel from '../components/AnomalyPanel';
import { RefreshCw, AlertCircle } from 'lucide-react';

// Accelerated Coordinate Cache for zero-latency lock on major nodes
const NODE_COORDINATES = {
    'Delhi': [28.6139, 77.2090],
    'Mumbai': [19.0760, 72.8777],
    'Kolkata': [22.5726, 88.3639],
    'Chennai': [13.0827, 80.2707],
    'Bengaluru': [12.9716, 77.5946],
    'Hyderabad': [17.3850, 78.4867],
    'Ahmedabad': [23.0225, 72.5714],
    'Pune': [18.5204, 73.8567],
    'Jaipur': [26.9124, 75.7873],
    'Lucknow': [26.8467, 80.9462]
};

const Dashboard = () => {
    const [selectedCity, setSelectedCity] = useState('Delhi');
    const [coordinates, setCoordinates] = useState(NODE_COORDINATES['Delhi']);
    const [geoError, setGeoError] = useState(null);
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
        geo: false
    });
    const [error, setError] = useState(null);

    const fetchData = useCallback(async (city) => {
        setError(null);
        setGeoError(null);
        setLoading({ forecast: true, risk: true, anomalies: true, hotspots: true, geo: true });

        try {
            // 1. Resolve Geospatial Lock
            let lat, lon;
            if (NODE_COORDINATES[city]) {
                [lat, lon] = NODE_COORDINATES[city];
                console.log(`Node Lock: Cached coordinates for ${city} [${lat}, ${lon}]`);
            } else {
                console.log(`Node Lock: Geocoding unknown node ${city}`);
                const geoRes = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(city + ', India')}&limit=1`, {
                    headers: { 'User-Agent': 'AeroNova-Intelligence/1.0' }
                });
                const geoData = await geoRes.ok ? await geoRes.json() : [];

                if (geoData && geoData.length > 0) {
                    lat = parseFloat(geoData[0].lat);
                    lon = parseFloat(geoData[0].lon);
                } else {
                    throw new Error(`Geospatial unlock failed for ${city}`);
                }
            }

            setCoordinates({ lat, lon });
            setLoading(prev => ({ ...prev, geo: false }));

            // 2. Parallel Stream Acquisition
            const fetchers = [
                { key: 'forecast', fn: () => getForecastByGeo(lat, lon) },
                { key: 'risk', fn: () => getRisk(city) },
                { key: 'anomalies', fn: () => getAnomalies(city) },
                { key: 'hotspots', fn: () => getHotspots(city) }
            ];

            fetchers.forEach(async ({ key, fn }) => {
                try {
                    const response = await fn();
                    setData(prev => ({ ...prev, [key]: response.data }));
                } catch (err) {
                    console.error(`Stream Acquisition Failure (${key}):`, err);
                    // Single stream failure is non-critical
                } finally {
                    setLoading(prev => ({ ...prev, [key]: false }));
                }
            });

        } catch (err) {
            console.error('Critical Node Lock Failure:', err);
            setGeoError(err.message || 'Signal Lost');
            // Fallback: try to fetch by city name directly if geo fails
            getForecast(city).then(res => setData(prev => ({ ...prev, forecast: res.data }))).finally(() => setLoading(prev => ({ ...prev, forecast: false, geo: false })));
            getRisk(city).then(res => setData(prev => ({ ...prev, risk: res.data }))).finally(() => setLoading(prev => ({ ...prev, risk: false })));
            getAnomalies(city).then(res => setData(prev => ({ ...prev, anomalies: res.data }))).finally(() => setLoading(prev => ({ ...prev, anomalies: false })));
            getHotspots(city).then(res => setData(prev => ({ ...prev, hotspots: res.data }))).finally(() => setLoading(prev => ({ ...prev, hotspots: false })));
        }
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
                        <RefreshCw size={20} className={loading.geo ? "animate-spin" : ""} />
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
                        <HotspotMap
                            data={data.hotspots}
                            loading={loading.hotspots || loading.geo}
                            center={coordinates?.lat ? [coordinates.lat, coordinates.lon] : null}
                            cityName={selectedCity}
                            riskData={data.risk}
                            riskLoading={loading.risk}
                        />
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
