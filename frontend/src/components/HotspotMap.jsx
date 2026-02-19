import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default marker icon in Leaflet + React/Vite
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconUrl: markerIcon,
    iconRetinaUrl: markerIcon2x,
    shadowUrl: markerShadow,
});

// Component to handle map centering
const ChangeView = ({ center }) => {
    const map = useMap();
    useEffect(() => {
        if (center) map.setView(center, map.getZoom());
    }, [center, map]);
    return null;
};

const HotspotMap = ({ data, loading }) => {
    if (loading) {
        return (
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 animate-pulse h-[400px]">
                <div className="h-4 bg-slate-200 rounded w-1/4 mb-4"></div>
                <div className="h-full bg-slate-100 rounded-xl w-full"></div>
            </div>
        );
    }

    const hotspots = data?.hotspots || [];
    const initialCenter = hotspots.length > 0
        ? [hotspots[0].latitude, hotspots[0].longitude]
        : [28.6139, 77.2090]; // Default Delhi

    const getMarkerIcon = (severity) => {
        let color = '#94a3b8'; // default
        if (severity === 'Low') color = '#10b981';
        if (severity === 'Moderate') color = '#fbbf24';
        if (severity === 'High') color = '#f97316';
        if (severity === 'Extreme') color = '#e11d48';

        return L.divIcon({
            className: "custom-marker",
            html: `<div style="background-color: ${color}; width: 14px; height: 14px; border-radius: 50%; border: 2px solid white; box-shadow: 0 0 10px rgba(0,0,0,0.2);"></div>`,
            iconSize: [14, 14],
            iconAnchor: [7, 7]
        });
    };

    return (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
            <h3 className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-4">Localized Hotspots</h3>
            <div className="h-[350px] w-full rounded-xl overflow-hidden border border-slate-100 shadow-inner relative z-0">
                <MapContainer center={initialCenter} zoom={11} className="h-full w-full">
                    <ChangeView center={initialCenter} />
                    <TileLayer
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
                    {hotspots.map((station, idx) => (
                        <Marker
                            key={idx}
                            position={[station.latitude, station.longitude]}
                            icon={getMarkerIcon(station.severity)}
                        >
                            <Popup className="custom-popup">
                                <div className="p-1">
                                    <p className="font-black text-slate-800 text-xs uppercase mb-1">{station.station}</p>
                                    <div className="space-y-1">
                                        <div className="flex justify-between text-[10px]">
                                            <span className="text-slate-400 font-bold uppercase">Pollution Index</span>
                                            <span className="font-extrabold text-slate-700">{station.pollution_score}</span>
                                        </div>
                                        <div className="flex justify-between text-[10px]">
                                            <span className="text-slate-400 font-bold uppercase">Severity</span>
                                            <span className={`font-extrabold ${station.severity === 'Extreme' ? 'text-rose-600' :
                                                    station.severity === 'High' ? 'text-orange-600' : 'text-emerald-600'
                                                }`}>{station.severity}</span>
                                        </div>
                                    </div>
                                </div>
                            </Popup>
                        </Marker>
                    ))}
                </MapContainer>
            </div>
        </div>
    );
};

export default HotspotMap;
