import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Wind, Droplets, Thermometer, Info, Loader2 } from 'lucide-react';

// ─── Sub-components ────────────────────────────────────────────────────────

// Smoothly pans the map when the city changes
const ChangeView = ({ center }) => {
    const map = useMap();
    useEffect(() => {
        if (center && Array.isArray(center) && typeof center[0] === 'number') {
            map.setView(center, map.getZoom());
        }
    }, [center, map]);
    return null;
};

// Custom zoom buttons rendered inside the Leaflet canvas
const ZoomControls = () => {
    const map = useMap();
    const btnClass =
        'w-10 h-10 flex items-center justify-center text-slate-600 hover:bg-slate-50 font-bold text-xl';

    return (
        <div className="leaflet-top leaflet-right" style={{ zIndex: 1000, margin: '6px 6px 0 0' }}>
            <div className="leaflet-control bg-white border border-slate-200 rounded-lg overflow-hidden flex flex-col shadow-lg">
                <button className={`${btnClass} border-b border-slate-100`} onClick={() => map.zoomIn()}>
                    +
                </button>
                <button className={btnClass} onClick={() => map.zoomOut()}>
                    −
                </button>
            </div>
        </div>
    );
};

// Single pollutant stat cell
const PollutantStat = ({ icon: Icon, label, value, unit = '', loading }) => (
    <div className="flex items-center gap-3">
        <div className="bg-slate-100 p-1.5 rounded-lg text-slate-400 shrink-0">
            <Icon size={12} />
        </div>
        <div className="min-w-0">
            <p className="text-[8px] font-black text-slate-400 uppercase">{label}</p>
            {loading ? (
                <div className="h-4 w-10 bg-slate-100 animate-pulse rounded mt-0.5" />
            ) : (
                <p className="text-sm font-black text-slate-800 truncate">
                    {value !== undefined && value !== null ? `${value}${unit}` : '--'}
                </p>
            )}
        </div>
    </div>
);

// ─── AQI helpers ────────────────────────────────────────────────────────────

const CITY_COORDS = {
    Delhi: [28.6139, 77.209], Mumbai: [19.076, 72.8777], Kolkata: [22.5726, 88.3639],
    Chennai: [13.0827, 80.2707], Bengaluru: [12.9716, 77.5946], Hyderabad: [17.385, 78.4867],
    Ahmedabad: [23.0225, 72.5714], Pune: [18.5204, 73.8567], Jaipur: [26.9124, 75.7873],
    Lucknow: [26.8467, 80.9462],
};

const getAQIColor = (aqi) => {
    if (!aqi || aqi <= 50) return '#10b981';
    if (aqi <= 100) return '#fbbf24';
    if (aqi <= 150) return '#f97316';
    if (aqi <= 200) return '#e11d48';
    return '#7c3aed';
};

const makeMarkerIcon = (score) => {
    const color = getAQIColor(score);
    const val = Math.round(score || 0);
    return L.divIcon({
        className: '',
        html: `<div style="
            background:${color};width:32px;height:32px;border-radius:50%;
            border:2px solid white;display:flex;align-items:center;
            justify-content:center;color:white;font-weight:900;font-size:11px;
            box-shadow:0 4px 6px -1px rgba(0,0,0,.15);">${val}</div>`,
        iconSize: [32, 32],
        iconAnchor: [16, 16],
    });
};

// ─── Main component ─────────────────────────────────────────────────────────

const HotspotMap = ({ data, loading, center: propCenter, cityName: propCityName, riskData, riskLoading }) => {
    const cityName = propCityName || data?.city || 'Selected Node';
    const hotspots = Array.isArray(data?.hotspots) ? data.hotspots : [];
    const initialCenter = (Array.isArray(propCenter) && propCenter[0]) ? propCenter : (CITY_COORDS[cityName] || [28.6139, 77.209]);

    const currentAQI = riskData?.latest_aqi ?? 0;
    const severity = riskLoading ? 'Live…' : (riskData?.risk_level ?? 'Unknown');
    const pollutants = riskData?.pollutants ?? {};
    const weather = riskData?.environmental_context ?? {};

    if (loading) {
        return (
            <div className="h-[520px] w-full bg-slate-100 animate-pulse rounded-xl border border-slate-200" />
        );
    }

    return (
        <div className="relative h-[520px] w-full rounded-xl overflow-hidden border border-slate-200 shadow-xl">
            {/* ── Map Canvas ── */}
            <MapContainer
                key={`${cityName}-${initialCenter[0]}`}
                center={initialCenter}
                zoom={11}
                className="h-full w-full"
                zoomControl={false}
                scrollWheelZoom
            >
                <TileLayer
                    url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
                    attribution='&copy; OpenStreetMap contributors &copy; CARTO'
                />
                <ChangeView center={initialCenter} />
                <ZoomControls />

                {hotspots.map((spot, idx) => (
                    <Marker
                        key={`${idx}-${spot.station}`}
                        position={[spot.latitude, spot.longitude]}
                        icon={makeMarkerIcon(spot.pollution_score)}
                    >
                        <Popup>
                            <div className="p-1">
                                <p className="text-[9px] font-black text-slate-400 uppercase mb-0.5">Station</p>
                                <p className="text-xs font-black text-slate-900">{spot.station}</p>
                                <p className="text-[9px] font-black text-slate-400 uppercase mt-1.5">Score</p>
                                <p className="text-base font-black" style={{ color: getAQIColor(spot.pollution_score) }}>
                                    {Math.round(spot.pollution_score)}
                                </p>
                            </div>
                        </Popup>
                    </Marker>
                ))}
            </MapContainer>

            {/* ── Floating Info Panel ── */}
            <div className="absolute top-4 left-4 z-[1000] w-72 bg-white/90 backdrop-blur-md border border-slate-200 rounded-xl shadow-2xl p-4 pointer-events-auto">
                {/* Header */}
                <div className="flex justify-between items-start mb-3">
                    <div>
                        <h2 className="text-lg font-black text-slate-900 tracking-tight leading-none">{cityName}</h2>
                        <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">Real-time Environmental Node</span>
                    </div>
                    <div
                        className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest text-white"
                        style={{ backgroundColor: riskLoading ? '#94a3b8' : getAQIColor(currentAQI) }}
                    >
                        {severity}
                    </div>
                </div>

                {/* AQI Value */}
                <div className="flex items-center gap-3 mb-4 relative">
                    {riskLoading && (
                        <div className="absolute inset-0 bg-white/60 z-10 flex items-center justify-center rounded-lg">
                            <Loader2 size={20} className="text-blue-600 animate-spin" />
                        </div>
                    )}
                    <span className={`text-5xl font-black tracking-tighter text-slate-900 leading-none ${riskLoading ? 'opacity-10' : ''}`}>
                        {Math.round(currentAQI)}
                    </span>
                    <div className="flex flex-col">
                        <span className="text-xs font-black text-slate-700 uppercase tracking-tighter italic">AQI Index</span>
                        <div className="flex items-center gap-1 mt-0.5">
                            <Info size={9} className="text-slate-300" />
                            <span className="text-[8px] font-bold text-slate-400 uppercase">
                                {riskLoading ? 'Fetching live data…' : 'Updated 1m ago'}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Pollutant Grid */}
                <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-1 mb-3">
                    Pollutant Breakdown (µg/m³)
                </p>
                <div className="grid grid-cols-2 gap-3 mb-4">
                    <PollutantStat icon={Wind} label="PM2.5" value={pollutants.pm25} loading={riskLoading} />
                    <PollutantStat icon={Wind} label="PM10" value={pollutants.pm10} loading={riskLoading} />
                    <PollutantStat icon={Thermometer} label="Temp" value={weather.temperature} unit="°C" loading={riskLoading} />
                    <PollutantStat icon={Droplets} label="Humid" value={weather.humidity} unit="%" loading={riskLoading} />
                </div>

                {/* Scale Bar */}
                <div>
                    <div className="flex justify-between text-[7px] font-black text-slate-300 uppercase tracking-widest mb-1">
                        <span>Good</span><span>Poor</span>
                    </div>
                    <div className="h-1.5 w-full rounded-full overflow-hidden flex">
                        {['#10b981', '#fbbf24', '#f97316', '#e11d48', '#7c3aed'].map((c) => (
                            <div key={c} className="h-full flex-1" style={{ background: c }} />
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default HotspotMap;
