import React from 'react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

const ForecastChart = ({ data, loading, mini = false }) => {
    if (loading) return <div className="h-40 bg-slate-50 rounded-lg animate-pulse border border-slate-100" />;
    if (!data || !data.forecast) return null;

    const chartData = data.forecast.map(item => ({
        name: `D${item.day}`,
        aqi: item.aqi
    }));

    const getColor = (aqi) => {
        if (aqi <= 50) return '#10b981';
        if (aqi <= 100) return '#fbbf24';
        if (aqi <= 200) return '#f97316';
        return '#e11d48';
    };

    const avgAqi = chartData.reduce((acc, curr) => acc + curr.aqi, 0) / chartData.length;
    const currentAqi = data.current_aqi || 135;
    const percentChange = ((avgAqi - currentAqi) / currentAqi) * 100;

    const getTrend = () => {
        if (percentChange > 5) return { label: 'Worsening', color: 'text-rose-500', icon: TrendingUp };
        if (percentChange < -5) return { label: 'Improving', color: 'text-emerald-500', icon: TrendingDown };
        return { label: 'Stable', color: 'text-amber-500', icon: Minus };
    };

    const trend = getTrend();
    const TrendIcon = trend.icon;

    return (
        <div className={`h-full flex flex-col ${mini ? '' : 'bg-white p-5 rounded-xl border border-slate-200'}`}>
            {!mini && (
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Projection</h3>
                    <div className="flex items-center gap-1.5">
                        <TrendIcon size={12} className={trend.color} />
                        <span className={`text-[10px] font-black uppercase tracking-tight ${trend.color}`}>{trend.label}</span>
                    </div>
                </div>
            )}

            <div className="flex-grow h-[180px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData} margin={{ top: 5, right: 5, left: -30, bottom: 0 }}>
                        <defs>
                            <linearGradient id="colorAqiMini" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor={getColor(avgAqi)} stopOpacity={0.15} />
                                <stop offset="95%" stopColor={getColor(avgAqi)} stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 9, fontWeight: 800 }} dy={5} />
                        <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 9, fontWeight: 800 }} />
                        <Tooltip
                            contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', padding: '8px' }}
                            itemStyle={{ fontWeight: 900, fontSize: '12px', color: '#0f172a' }}
                            labelStyle={{ color: '#94a3b8', fontSize: '8px', textTransform: 'uppercase', marginBottom: '2px', fontWeight: 900 }}
                        />
                        <Area
                            type="monotone"
                            dataKey="aqi"
                            stroke={getColor(avgAqi)}
                            strokeWidth={3}
                            fillOpacity={1}
                            fill="url(#colorAqiMini)"
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

export default ForecastChart;
