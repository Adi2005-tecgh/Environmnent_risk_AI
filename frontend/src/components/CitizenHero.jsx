import React, { useState, useEffect } from 'react';
import { Thermometer, Droplets, Wind, Activity, Info } from 'lucide-react';

const CitizenHero = ({ aqi = 0, city = "", pollutants = {}, weather = {}, loading = false }) => {
    const [count, setCount] = useState(0);

    // AQI Count-up animation
    useEffect(() => {
        if (loading) return;
        let start = 0;
        const end = Math.round(aqi);
        if (start === end) return;

        let totalDuration = 1000;
        let increment = end / (totalDuration / 16);

        const timer = setInterval(() => {
            start += increment;
            if (start >= end) {
                setCount(end);
                clearInterval(timer);
            } else {
                setCount(Math.floor(start));
            }
        }, 16);

        return () => clearInterval(timer);
    }, [aqi, loading]);

    const getAQICategory = (val) => {
        if (val <= 50) return { label: "Good", desc: "Air quality is ideal for all.", theme: "from-emerald-500 to-teal-600", color: "text-emerald-500", shadow: "shadow-emerald-500/20" };
        if (val <= 100) return { label: "Satisfactory", desc: "Air quality is acceptable.", theme: "from-green-400 to-emerald-500", color: "text-green-500", shadow: "shadow-green-500/20" };
        if (val <= 200) return { label: "Moderate", desc: "Unhealthy for sensitive groups.", theme: "from-orange-400 to-amber-600", color: "text-orange-500", shadow: "shadow-orange-500/20" };
        if (val <= 300) return { label: "Severe", desc: "Health alert: everyone may experience effects.", theme: "from-rose-500 to-red-700", color: "text-rose-600", shadow: "shadow-rose-600/20" };
        return { label: "Hazardous", desc: "Health warnings of emergency conditions.", theme: "from-purple-600 to-indigo-900", color: "text-purple-600", shadow: "shadow-purple-600/20" };
    };

    const category = getAQICategory(aqi);

    // Scale position calculation
    const getScalePosition = (val) => {
        const capped = Math.min(val, 400);
        return (capped / 400) * 100;
    };

    if (loading) {
        return <div className="h-80 bg-slate-100 rounded-[2.5rem] animate-pulse"></div>;
    }

    return (
        <div className={`relative overflow-hidden p-6 md:p-8 rounded-xl bg-gradient-to-br ${category.theme} text-white shadow-lg transition-all duration-1000`}>
            {/* Minimal Gloss Overlay */}
            <div className="absolute top-0 right-0 w-full h-full bg-white/5 pointer-events-none"></div>

            <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">

                {/* Left: AQI */}
                <div className="lg:col-span-7">
                    <div className="flex items-center gap-2 mb-3">
                        <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                        <span className="text-[10px] font-black uppercase tracking-widest opacity-80">Live Stream • {city}</span>
                    </div>

                    <div className="flex items-center gap-6 mb-4">
                        <h2 className="text-7xl font-black tracking-tighter leading-none">
                            {count}
                        </h2>
                        <div className="flex flex-col">
                            <span className="text-xl font-black opacity-90 uppercase tracking-tighter">AQI</span>
                            <div className="flex items-center gap-2 bg-white/20 px-2 py-0.5 rounded-lg backdrop-blur-md mt-1 w-fit">
                                <span className="text-[10px] font-black uppercase tracking-widest">{category.label}</span>
                            </div>
                        </div>
                    </div>

                    {/* Summary */}
                    <p className="text-sm font-bold opacity-90 max-w-md leading-relaxed mb-6">
                        {category.desc}
                    </p>

                    {/* Compact Severity Scale */}
                    <div className="relative mt-8">
                        <div className="h-1.5 w-full bg-black/20 rounded-full overflow-hidden flex relative">
                            <div className="h-full bg-emerald-400" style={{ width: '25%' }}></div>
                            <div className="h-full bg-orange-400" style={{ width: '25%' }}></div>
                            <div className="h-full bg-rose-500" style={{ width: '25%' }}></div>
                            <div className="h-full bg-purple-700" style={{ width: '25%' }}></div>

                            <div
                                className="absolute top-1/2 -mt-1.5 w-3 h-3 bg-white rounded-full border-2 border-slate-900 shadow-md transition-all duration-1000 ease-out"
                                style={{ left: `${getScalePosition(aqi)}%`, transform: 'translateX(-50%)' }}
                            ></div>
                        </div>
                    </div>
                </div>

                {/* Right: Stats Grid */}
                <div className="lg:col-span-5 grid grid-cols-2 gap-3">
                    {[
                        { label: "PM2.5", value: pollutants?.pm25, unit: "µg/m³", icon: Wind },
                        { label: "PM10", value: pollutants?.pm10, unit: "µg/m³", icon: Wind },
                        { label: "Temp", value: weather?.temperature, unit: "°C", icon: Thermometer },
                        { label: "Humidity", value: weather?.humidity, unit: "%", icon: Droplets }
                    ].map((stat, i) => (
                        <div key={i} className="bg-white/10 border border-white/5 p-4 rounded-xl hover:bg-white/20 transition-all">
                            <div className="flex items-center gap-2 mb-1">
                                <stat.icon size={14} className="opacity-70" />
                                <span className="text-[9px] font-black uppercase tracking-widest opacity-60">{stat.label}</span>
                            </div>
                            <div className="flex items-baseline gap-1">
                                <span className="text-xl font-black">{stat.value || '--'}</span>
                                <span className="text-[9px] font-bold opacity-50">{stat.unit}</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default CitizenHero;
