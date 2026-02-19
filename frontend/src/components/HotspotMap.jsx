import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Layers, Map as MapIcon, Target } from 'lucide-react';

// Fix icons
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconUrl: markerIcon,
    iconRetinaUrl: markerIcon2x,
    shadowUrl: markerShadow,
});

const ChangeView = ({ center }) => {
    const map = useMap();
    useEffect(() => {
        if (center) map.setView(center, map.getZoom());
    }, [center, map]);
    return null;
};

const HotspotMap = ({ data, loading, mode = 'station' }) => {
    const isGov = mode === 'cluster';

    if (loading) {
        return (
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200 animate-pulse h-[450px]">
                <div className="h-4 bg-slate-200 rounded w-1/4 mb-4"></div>
                <div className="h-full bg-slate-100 rounded-2xl w-full"></div>
            </div>
        );
    }

    const hotspots = data?.hotspots || [];
    const initialCenter = hotspots.length > 0
        ? [hotspots[0].latitude, hotspots[0].longitude]
        : [28.6139, 77.2090];

    const getMarkerIcon = (severity, clusterId) => {
        let color = '#94a3b8';
        if (severity === 'Low') color = '#10b981';
        if (severity === 'Moderate') color = '#fbbf24';
        if (severity === 'High') color = '#f97316';
        if (severity === 'Extreme') color = '#e11d48';

        const size = isGov ? 24 : 16;

        return L.divIcon({
            className: "custom-marker",
            html: `
        <div style="background-color: ${color}; width: ${size}px; height: ${size}px; border-radius: 50%; border: 3px solid white; box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1); display: flex; align-items: center; justify-content: center;">
            ${isGov ? `<span style="color: white; font-size: 8px; font-weight: 900;">${clusterId !== -1 ? 'C' + clusterId : 'S'}</span>` : ''}
        </div>`,
            iconSize: [size, size],
            iconAnchor: [size / 2, size / 2]
        });
    };

    return (
        <div className={`bg-white p-6 rounded-3xl shadow-sm border border-slate-200 relative ${isGov ? 'ring-2 ring-slate-900 ring-offset-2' : ''}`}>
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">
                        {isGov ? 'Geospatial Cluster Analysis' : 'Regional Hotspots'}
                    </h3>
                    <p className="text-sm font-black text-slate-800 tracking-tight">
                        {hotspots.length} Passive Nodes Active
                    </p>
                </div>
                <div className="flex bg-slate-100 p-1 rounded-xl">
                    <div className={`p-2 rounded-lg ${!isGov ? 'bg-white shadow-sm text-gov-blue' : 'text-slate-400'}`}>
                        <MapIcon size={16} />
                    </div>
                    <div className={`p-2 rounded-lg ${isGov ? 'bg-white shadow-sm text-gov-blue' : 'text-slate-400'}`}>
                        <Target size={16} />
                    </div>
                </div>
            </div>

            <div className="h-[350px] w-full rounded-2xl overflow-hidden border border-slate-100 shadow-inner relative z-0">
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
                            icon={getMarkerIcon(station.severity, station.cluster)}
                        >
                            <Popup className="custom-popup">
                                <div className="p-2 min-w-[150px]">
                                    <p className="font-black text-slate-900 text-xs uppercase mb-2 border-b border-slate-100 pb-1">{station.station}</p>
                                    <div className="space-y-2">
                                        <div className="flex justify-between items-center">
                                            <span className="text-[9px] text-slate-400 font-black uppercase tracking-widest italic">Pollution Index</span>
                                            <span className="font-black text-slate-900 text-xs">{station.pollution_score}</span>
                                        </div>
                                        {isGov && (
                                            <div className="flex justify-between items-center bg-slate-50 p-1 rounded">
                                                <span className="text-[9px] text-slate-400 font-black uppercase tracking-widest italic">ID Cluster</span>
                                                <span className="font-black text-blue-600 text-xs">{station.cluster === -1 ? 'None' : 'CID-' + station.cluster}</span>
                                            </div>
                                        )}
                                        <div className="flex items-center gap-2">
                                            <div className={`w-2 h-2 rounded-full ${station.severity === 'Extreme' ? 'bg-rose-600' :
                                                    station.severity === 'High' ? 'bg-orange-600' : 'bg-emerald-600'
                                                }`}></div>
                                            <span className="text-[10px] font-black uppercase tracking-tight text-slate-600">{station.severity} Risk</span>
                                        </div>
                                    </div>
                                </div>
                            </Popup>
                        </Marker>
                    ))}
                </MapContainer>

                {/* Map Legend */}
                <div className="absolute bottom-4 right-4 bg-white/90 backdrop-blur p-3 rounded-2xl shadow-xl border border-white/20 z-[1000] hidden md:block">
                    <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-2 border-b pb-1">Legend</p>
                    <div className="space-y-1.5">
                        {[
                            { label: 'Extreme', color: 'bg-rose-600' },
                            { label: 'High', color: 'bg-orange-500' },
                            { label: 'Moderate', color: 'bg-amber-400' },
                            { label: 'Low', color: 'bg-emerald-500' }
                        ].map(item => (
                            <div key={item.label} className="flex items-center gap-2">
                                <div className={`w-2 h-2 rounded-full ${item.color}`}></div>
                                <span className="text-[9px] font-bold text-slate-600 uppercase">{item.label}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default HotspotMap;
