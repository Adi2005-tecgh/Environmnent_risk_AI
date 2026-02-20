import React, { useMemo } from 'react';
import { AlertCircle, AlertTriangle, Clock } from 'lucide-react';

const StatusHeader = ({ currentAQI = 100, anomalyCount = 0 }) => {
    const statusInfo = useMemo(() => {
        if (currentAQI <= 100 && anomalyCount < 3) {
            return { 
                status: 'STABLE', 
                color: 'bg-emerald-500', 
                textColor: 'text-emerald-700',
                emoji: '🟢',
                description: 'All monitored regions within acceptable parameters'
            };
        }
        if (currentAQI <= 200 && anomalyCount < 6) {
            return { 
                status: 'MODERATE ALERT', 
                color: 'bg-amber-500', 
                textColor: 'text-amber-700',
                emoji: '🟡',
                description: 'Elevated readings detected in select areas'
            };
        }
        if (currentAQI <= 300 || anomalyCount < 12) {
            return { 
                status: 'HIGH ALERT', 
                color: 'bg-orange-500', 
                textColor: 'text-orange-700',
                emoji: '🟠',
                description: 'Multiple hotspots require immediate attention'
            };
        }
        return { 
            status: 'CRITICAL CONDITION', 
            color: 'bg-rose-600', 
            textColor: 'text-rose-700',
            emoji: '🔴',
            description: 'Emergency response protocols activated'
        };
    }, [currentAQI, anomalyCount]);

    const now = new Date().toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit', 
        second: '2-digit',
        hour12: true 
    });

    return (
        <div className={`${statusInfo.color} text-white p-4 rounded-2xl shadow-lg mb-6 animate-in fade-in duration-500`}>
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <div className="text-3xl">{statusInfo.emoji}</div>
                    <div>
                        <h2 className="text-2xl font-black uppercase tracking-tighter">{statusInfo.status}</h2>
                        <p className="text-sm font-medium text-white/90 mt-1">{statusInfo.description}</p>
                    </div>
                </div>
                <div className="text-right">
                    <div className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-white/80 mb-2">
                        <Clock size={14} />
                        <span>Live</span>
                    </div>
                    <p className="text-lg font-black">{now}</p>
                    <p className="text-xs font-bold text-white/70 mt-1">Last synced now</p>
                </div>
            </div>

            {/* Status Indicators */}
            <div className="grid grid-cols-3 gap-4 mt-4 pt-4 border-t border-white/20">
                <div>
                    <p className="text-[9px] font-black uppercase tracking-widest text-white/70">AQI</p>
                    <p className="text-xl font-black mt-1">{Math.round(currentAQI)}</p>
                </div>
                <div>
                    <p className="text-[9px] font-black uppercase tracking-widest text-white/70">Anomalies (24h)</p>
                    <p className="text-xl font-black mt-1">{anomalyCount}</p>
                </div>
                <div>
                    <p className="text-[9px] font-black uppercase tracking-widest text-white/70">Status</p>
                    <p className="text-xl font-black mt-1">Active</p>
                </div>
            </div>
        </div>
    );
};

export default StatusHeader;
