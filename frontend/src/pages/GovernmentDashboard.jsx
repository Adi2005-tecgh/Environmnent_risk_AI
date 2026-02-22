import React, { useState, useEffect, useCallback } from 'react';
import { getForecast, getRisk, getAnomalies, getHotspots, getEconomicImpact } from '../api/api';
import CitySelector from '../components/CitySelector';
import RiskCard from '../components/RiskCard';
import ForecastChart from '../components/ForecastChart';
import HotspotMap from '../components/HotspotMap';
import AnomalyPanel from '../components/AnomalyPanel';
import GovernmentAnalyticsPanel from '../components/GovernmentAnalyticsPanel';
import ClusterTable from '../components/ClusterTable';
import ViolationMonitoring from '../components/ViolationMonitoring';
import PolicySimulator from '../components/PolicySimulator';
import EscalationTimeline from '../components/EscalationTimeline';
import EconomicImpactPanel from '../components/EconomicImpactPanel';
import EnvironmentalHealthIndex from '../components/EnvironmentalHealthIndex';
import StatusHeader from '../components/StatusHeader';
import LiveAlertMarquee from '../components/LiveAlertMarquee';
import SituationSummary from '../components/SituationSummary';
import RecommendedActions from '../components/RecommendedActions';
import { Shield, RefreshCw, AlertCircle, TrendingUp, Activity, MapPin, DollarSign, ClipboardList } from 'lucide-react';

const GovernmentDashboard = () => {
    const [selectedCity, setSelectedCity] = useState('Delhi');
    const [activeTab, setActiveTab] = useState('overview');
    const [data, setData] = useState({ forecast: null, risk: null, anomalies: null, hotspots: null, economicImpact: null });
    const [loading, setLoading] = useState({ forecast: true, risk: true, anomalies: true, hotspots: true, economicImpact: true });

    const fetchData = useCallback(async (city) => {
        setLoading({ forecast: true, risk: true, anomalies: true, hotspots: true, economicImpact: true });

        const fetchers = [
            { key: 'forecast', fn: getForecast },
            { key: 'risk', fn: getRisk },
            { key: 'anomalies', fn: getAnomalies },
            { key: 'hotspots', fn: getHotspots },
            { key: 'economicImpact', fn: getEconomicImpact }
        ];

        fetchers.forEach(async ({ key, fn }) => {
            try {
                const response = await fn(city);
                setData(prev => ({ ...prev, [key]: response.data }));
            } catch (err) {
                console.error(`Gov Data Fetch Error [${key}]:`, err);
                setData(prev => ({ ...prev, [key]: null }));
            } finally {
                setLoading(prev => ({ ...prev, [key]: false }));
            }
        });
    }, []);

    useEffect(() => {
        fetchData(selectedCity);
    }, [selectedCity, fetchData]);

    const baseProb = 5;
    let escalationProbability = baseProb;
    const aqiVal = data.risk?.latest_aqi || 100;
    if (aqiVal > 200) escalationProbability += 40;
    else if (aqiVal > 150) escalationProbability += 20;

    const tabs = [
        { id: 'overview', label: 'Overview', icon: Activity },
        { id: 'risk', label: 'Risk & Forecast', icon: TrendingUp },
        { id: 'hotspots', label: 'Hotspot Intelligence', icon: MapPin },
        { id: 'economic', label: 'Economic Impact', icon: DollarSign },
        { id: 'violations', label: 'Violation Monitoring', icon: ClipboardList }
    ];

    const SectionHeader = ({ title, description, aiInsight, icon: Icon }) => (
        <div className="mb-6">
            <div className="flex items-start gap-4">
                {Icon && (
                    <div className="bg-blue-600/10 p-2.5 rounded-xl text-blue-600 shrink-0 mt-1 shadow-sm">
                        <Icon size={24} />
                    </div>
                )}
                <div>
                    <h2 className="text-xl font-black text-slate-900 uppercase tracking-tighter mb-1 font-mono">
                        {title}
                    </h2>
                    <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">{description}</p>
                </div>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-gray-50/50 p-6 lg:p-8 space-y-6">
            {/* 1. Main Authority Header */}
            <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6 bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                <div className="flex items-center gap-5">
                    <div className="bg-slate-900 text-white p-3.5 rounded-xl shadow-lg ring-4 ring-slate-900/5">
                        <Shield size={24} />
                    </div>
                    <div>
                        <h1 className="text-xl font-black text-slate-900 tracking-tighter uppercase italic leading-none">
                            Authority <span className="text-blue-600">Command</span> Hub
                        </h1>
                        <div className="flex items-center gap-2.5 mt-2">
                            <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-emerald-50 text-[9px] font-black text-emerald-600 border border-emerald-100 uppercase tracking-widest">
                                <div className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse"></div>
                                Live Sync
                            </div>
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Grid Node: {selectedCity}</span>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <CitySelector selectedCity={selectedCity} onCityChange={setSelectedCity} />
                    <button
                        onClick={() => fetchData(selectedCity)}
                        className="p-3 bg-slate-900 text-white rounded-xl hover:bg-blue-600 transition-all shadow-md group"
                    >
                        <RefreshCw size={18} className="group-hover:rotate-180 transition-transform duration-500" />
                    </button>
                </div>
            </div>

            {/* 2. Global Alert Stream */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                <div className="md:col-span-12">
                    {!loading.risk && (
                        <LiveAlertMarquee
                            hotspots={data.hotspots?.hotspots || []}
                            riskLevel={data.risk?.risk_level || 'Low'}
                            currentAQI={data.risk?.latest_aqi || 100}
                        />
                    )}
                </div>
            </div>

            {/* 3. Navigation Controls (Sticky) */}
            <div className="sticky top-6 z-50 bg-white/80 backdrop-blur-md border border-slate-200 rounded-xl shadow-sm p-1.5 flex gap-1.5 overflow-x-auto no-scrollbar">
                {tabs.map((tab) => {
                    const Icon = tab.icon;
                    const isActive = activeTab === tab.id;
                    return (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex-1 flex items-center justify-center gap-3 px-6 py-2.5 rounded-lg font-black text-[10px] uppercase tracking-widest transition-all min-w-fit ${isActive
                                ? 'bg-slate-900 text-white shadow-md'
                                : 'text-slate-500 hover:bg-slate-50'
                                }`}
                        >
                            <Icon size={14} />
                            {tab.label}
                        </button>
                    );
                })}
            </div>

            {/* 4. Dynamic Content Area */}
            <div className="mt-8 space-y-8">
                {activeTab === 'overview' && (
                    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
                        <SectionHeader
                            title="Operational Overview"
                            description="Global Environment Monitoring System"
                        />

                        {!loading.risk && (
                            <SituationSummary
                                forecast={data.forecast?.forecast || []}
                                currentAQI={data.risk?.latest_aqi || 100}
                                riskLevel={data.risk?.risk_level || 'Low'}
                                escalationProbability={escalationProbability}
                                pollutants={data.risk?.pollutants || {}}
                                city={selectedCity}
                                dominantSource={data?.hotspots?.city_pollution_source ?? 'Unknown'}
                                hotspotCoverage={(() => {
                                    const total = Number(data?.hotspots?.total_stations ?? 0);
                                    const hot = Number(data?.hotspots?.hotspot_stations_count ?? 0);
                                    return total > 0 ? Math.round((hot / total) * 100) : 0;
                                })()}
                            />
                        )}

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            <EnvironmentalHealthIndex
                                currentAQI={data.risk?.latest_aqi || 100}
                                hotspotCount={data.hotspots?.hotspot_stations_count || 0}
                                anomalyCount={data.anomalies?.anomaly_count || 0}
                                pollutants={data.risk?.pollutants || {}}
                            />
                            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 border-t-4 border-t-slate-900">
                                <div className="flex items-center gap-2 mb-8">
                                    <div className="bg-slate-900 p-2 rounded-lg text-white">
                                        <Shield size={16} />
                                    </div>
                                    <h3 className="text-sm font-black text-slate-900 uppercase tracking-tight">System Infrastructure Health</h3>
                                </div>
                                <GovernmentAnalyticsPanel data={data} loading={loading.hotspots} />

                                <div className="mt-8 p-4 bg-emerald-50 rounded-lg border border-emerald-100">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-[10px] font-black text-emerald-800 uppercase tracking-widest">AI Integrity Status</span>
                                        <span className="text-[10px] font-black text-emerald-600">94.2%</span>
                                    </div>
                                    <div className="w-full bg-emerald-100 rounded-full h-1">
                                        <div className="bg-emerald-500 h-1 rounded-full w-[94%]" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'risk' && (
                    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
                        <SectionHeader title="Risk Intelligence" description="Predictive Forecasting & Modeling" />
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <ForecastChart data={data.forecast} loading={loading.forecast} showMetadata={true} />
                            <EscalationTimeline forecast={data.forecast?.forecast || []} currentAQI={data.risk?.latest_aqi || 100} />
                        </div>
                        <PolicySimulator currentAQI={data.risk?.latest_aqi ?? 100} pollutants={data.risk?.pollutants ?? {}} />
                    </div>
                )}

                {activeTab === 'hotspots' && (
                    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
                        <SectionHeader title="Hotspot Intelligence" description="Regional Pollution Cluster Analysis" />
                        <div className="min-h-[500px] bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                            <HotspotMap
                                data={data.hotspots}
                                loading={loading.hotspots}
                                mode="cluster"
                                riskData={data.risk}
                                riskLoading={loading.risk}
                                cityName={selectedCity}
                            />
                        </div>
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <ClusterTable hotspots={Array.isArray(data?.hotspots?.hotspots) ? data.hotspots.hotspots : []} loading={loading.hotspots} />
                            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                                <h3 className="text-sm font-black text-slate-900 uppercase tracking-tight mb-6">Regional Node Health</h3>
                                <GovernmentAnalyticsPanel data={data} loading={loading.hotspots} />
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'economic' && (
                    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
                        <SectionHeader title="Economic Burden" description="Financial Impact of Environmental States" />
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <EconomicImpactPanel currentAQI={data.risk?.latest_aqi || 100} />
                            {!loading.risk && (
                                <RecommendedActions
                                    currentAQI={data.risk?.latest_aqi || 100}
                                    riskLevel={data.risk?.risk_level || 'Low'}
                                    hotspotCount={data.hotspots?.hotspot_stations_count || 0}
                                    anomalyCount={data.anomalies?.anomaly_count || 0}
                                    pollutants={data.risk?.pollutants || {}}
                                    hotspots={Array.isArray(data?.hotspots?.hotspots) ? data.hotspots.hotspots : []}
                                />
                            )}
                        </div>
                    </div>
                )}

                {activeTab === 'violations' && (
                    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
                        <SectionHeader title="Compliance Oversight" description="Citizen Reports & System Violations" />
                        <ViolationMonitoring />
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <RiskCard data={data.risk} loading={loading.risk} isAdvanced={true} />
                            <AnomalyPanel data={data.anomalies} loading={loading.anomalies} detailLevel="advanced" />
                        </div>
                    </div>
                )}
            </div>

            <footer className="text-center pt-16 pb-8">
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] opacity-50">
                    Sovereign Environmental Intelligence Network • Node Sync {new Date().toLocaleTimeString()}
                </p>
            </footer>
        </div>
    );
};

export default GovernmentDashboard;
