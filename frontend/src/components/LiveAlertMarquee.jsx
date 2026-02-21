import React, { useMemo, useState } from 'react';
import { AlertCircle } from 'lucide-react';

const LiveAlertMarquee = ({ hotspots = [], riskLevel = 'Low', currentAQI = 100 }) => {
    const [isPaused, setIsPaused] = useState(false);

    const alerts = useMemo(() => {
        const alertList = [];

        // Add AQI alert
        if (currentAQI > 200) {
            alertList.push({
                id: 'aqi-critical',
                text: `⚠ CRITICAL AQI ${Math.round(currentAQI)} - EXTREME POLLUTION LEVELS`,
                severity: 'critical'
            });
        } else if (currentAQI > 150) {
            alertList.push({
                id: 'aqi-high',
                text: `⚠ AQI ELEVATED TO ${Math.round(currentAQI)} - HIGH POLLUTION WARNING`,
                severity: 'high'
            });
        }

        // Add hotspot alerts (top 3 most severe)
        const severeHotspots = hotspots
            .filter(h => h.severity === 'Extreme' || h.severity === 'High')
            .slice(0, 3);

        severeHotspots.forEach((hotspot, idx) => {
            alertList.push({
                id: `hotspot-${idx}`,
                text: `⚠ ${hotspot.station} - ${hotspot.severity.toUpperCase()} - Score ${Number(hotspot.pollution_score || 0).toFixed(1)}`,
                severity: hotspot.severity === 'Extreme' ? 'critical' : 'high'
            });
        });

        // Risk level alert
        if (riskLevel === 'High' || riskLevel === 'Extreme') {
            alertList.push({
                id: 'risk-alert',
                text: `⚠ RISK LEVEL: ${riskLevel.toUpperCase()} - HEIGHTENED HEALTH THREAT`,
                severity: riskLevel === 'Extreme' ? 'critical' : 'high'
            });
        }

        // Default message if no alerts
        if (alertList.length === 0) {
            alertList.push({
                id: 'stable',
                text: '✓ All monitored regions stable - Environmental conditions normal',
                severity: 'stable'
            });
        }

        return alertList;
    }, [hotspots, riskLevel, currentAQI]);

    // Duplicate alerts for seamless loop
    const displayAlerts = [...alerts, ...alerts];

    return (
        <div className="relative mb-6 overflow-hidden">
            {/* Alert Background */}
            <div
                className={`${alerts[0]?.severity === 'critical'
                    ? 'bg-gradient-to-r from-rose-600 to-rose-500'
                    : alerts[0]?.severity === 'high'
                        ? 'bg-gradient-to-r from-orange-500 to-orange-400'
                        : 'bg-gradient-to-r from-slate-700 to-slate-600'
                    } py-3 px-4 rounded-xl shadow-lg relative overflow-hidden`}
            >
                {/* Glow effect */}
                <div className={`absolute inset-0 ${alerts[0]?.severity === 'critical'
                    ? 'bg-rose-400/20'
                    : alerts[0]?.severity === 'high'
                        ? 'bg-orange-400/20'
                        : 'bg-slate-500/10'
                    } blur-xl`}></div>

                {/* Marquee Container */}
                <div
                    className="relative z-10 flex whitespace-nowrap"
                    onMouseEnter={() => setIsPaused(true)}
                    onMouseLeave={() => setIsPaused(false)}
                    style={{
                        animation: isPaused ? 'none' : 'scrollLeft 45s linear infinite',
                    }}
                >
                    {displayAlerts.map((alert, idx) => (
                        <div
                            key={`${alert.id}-${idx}`}
                            className="flex items-center gap-4 px-8 text-white font-bold text-sm uppercase tracking-wide"
                        >
                            <AlertCircle size={18} className="shrink-0" />
                            <span>{alert.text}</span>
                            <span className="text-white/40">•</span>
                        </div>
                    ))}
                </div>

                {/* Fade edges */}
                <div className="absolute left-0 top-0 bottom-0 w-12 bg-gradient-to-r from-current to-transparent z-20 pointer-events-none"></div>
                <div className="absolute right-0 top-0 bottom-0 w-12 bg-gradient-to-l from-current to-transparent z-20 pointer-events-none"></div>

                {/* Pause indicator */}
                <div className="absolute bottom-1 right-4 text-white/50 text-[9px] font-black tracking-widest pointer-events-none">
                    {isPaused && 'PAUSED'}
                </div>
            </div>

            <style>{`
                @keyframes scrollLeft {
                    0% {
                        transform: translateX(0);
                    }
                    100% {
                        transform: translateX(-50%);
                    }
                }
            `}</style>
        </div>
    );
};

export default LiveAlertMarquee;
