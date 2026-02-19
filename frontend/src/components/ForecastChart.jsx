import React from 'react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ReferenceLine } from 'recharts';

const ForecastChart = ({ data, loading }) => {
    if (loading) {
        return (
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 animate-pulse">
                <div className="h-4 bg-slate-200 rounded w-1/4 mb-4"></div>
                <div className="h-[250px] bg-slate-100 rounded w-full"></div>
            </div>
        );
    }

    if (!data || !data.forecast) return null;

    // Chart data formatting
    const chartData = data.forecast.map(item => ({
        name: `Day ${item.day}`,
        aqi: item.aqi
    }));

    const getColor = (aqi) => {
        if (aqi <= 50) return '#10b981'; // Emerald
        if (aqi <= 100) return '#fbbf24'; // Amber
        if (aqi <= 200) return '#f97316'; // Orange
        return '#e11d48'; // Rose
    };

    const avgAqi = chartData.reduce((acc, curr) => acc + curr.aqi, 0) / chartData.length;

    return (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-sm font-bold text-slate-500 uppercase tracking-widest">3-Day AI Forecast</h3>
                <div className="flex space-x-2 shrink-0">
                    <div className="flex items-center space-x-1">
                        <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                        <span className="text-[10px] text-slate-400 font-bold uppercase">Safe</span>
                    </div>
                    <div className="flex items-center space-x-1">
                        <div className="w-2 h-2 rounded-full bg-rose-500"></div>
                        <span className="text-[10px] text-slate-400 font-bold uppercase">Danger</span>
                    </div>
                </div>
            </div>

            <div className="h-[250px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <defs>
                            <linearGradient id="colorAqi" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor={getColor(avgAqi)} stopOpacity={0.1} />
                                <stop offset="95%" stopColor={getColor(avgAqi)} stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis
                            dataKey="name"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 600 }}
                            dy={10}
                        />
                        <YAxis
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 600 }}
                        />
                        <Tooltip
                            contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', padding: '12px' }}
                            itemStyle={{ fontWeight: 800, color: '#1e293b' }}
                            labelStyle={{ color: '#64748b', fontSize: '10px', textTransform: 'uppercase', marginBottom: '4px', fontWeight: 700 }}
                        />
                        <Area
                            type="monotone"
                            dataKey="aqi"
                            stroke={getColor(avgAqi)}
                            strokeWidth={3}
                            fillOpacity={1}
                            fill="url(#colorAqi)"
                            animationDuration={1500}
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

export default ForecastChart;
