import React from 'react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ReferenceLine } from 'recharts';
import { TrendingUp, TrendingDown, Minus, AlertTriangle } from 'lucide-react';

const ForecastChart = ({ data, loading, showMetadata = false }) => {
    if (loading) {
        return (
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 animate-pulse">
                <div className="h-4 bg-slate-200 rounded w-1/4 mb-4"></div>
                <div className="h-[250px] bg-slate-100 rounded w-full"></div>
            </div>
        );
    }

    if (!data || !data.forecast) return null;

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

    // Calculate trend
    const first = chartData[0].aqi;
    const last = chartData[chartData.length - 1].aqi;
    const percentChange = ((last - first) / first) * 100;

    const getTrend = () => {
        if (percentChange > 5) return { label: 'Worsening', color: 'text-rose-500', icon: TrendingUp };
        if (percentChange < -5) return { label: 'Improving', color: 'text-emerald-500', icon: TrendingDown };
        return { label: 'Stable', color: 'text-amber-500', icon: Minus };
    };

    const trend = getTrend();

    return (
        <div className={`bg-white p-6 rounded-2xl shadow-sm border border-slate-200 ${showMetadata ? 'bg-slate-50/50' : ''}`}>
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">3-Day Forecast</h3>
                    <div className="flex items-center space-x-2">
                        <trend.icon size={16} className={trend.color} />
                        <span className={`text-sm font-black uppercase tracking-tight ${trend.color}`}>{trend.label}</span>
                    </div>
                </div>

                {showMetadata && (
                    <div className="text-right">
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Var. Index</p>
                        <p className={`text-sm font-black ${percentChange > 0 ? 'text-rose-500' : 'text-emerald-500'}`}>
                            {percentChange > 0 ? '+' : ''}{percentChange.toFixed(1)}%
                        </p>
                    </div>
                )}
            </div>

            <div className="h-[220px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                        <defs>
                            <linearGradient id="colorAqi" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor={getColor(avgAqi)} stopOpacity={0.2} />
                                <stop offset="95%" stopColor={getColor(avgAqi)} stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                        <XAxis
                            dataKey="name"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 800 }}
                            dy={10}
                        />
                        <YAxis
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 800 }}
                        />
                        <Tooltip
                            contentStyle={{ borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', padding: '12px' }}
                            itemStyle={{ fontWeight: 900, color: '#0f172a' }}
                            labelStyle={{ color: '#64748b', fontSize: '9px', textTransform: 'uppercase', marginBottom: '4px', fontWeight: 900 }}
                        />
                        <Area
                            type="monotone"
                            dataKey="aqi"
                            stroke={getColor(avgAqi)}
                            strokeWidth={4}
                            fillOpacity={1}
                            fill="url(#colorAqi)"
                            animationDuration={2000}
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>

            {showMetadata && Math.abs(percentChange) > 10 && (
                <div className="mt-4 p-3 bg-white border border-slate-200 rounded-xl flex items-center gap-3">
                    <div className="bg-rose-100 p-1.5 rounded-lg text-rose-500 shrink-0">
                        <AlertTriangle size={16} />
                    </div>
                    <p className="text-[10px] font-bold text-slate-700 leading-tight">
                        Significant fluctuation detected. System suggests industrial audit for {data.city} sector.
                    </p>
                </div>
            )}
        </div>
    );
};

export default ForecastChart;
