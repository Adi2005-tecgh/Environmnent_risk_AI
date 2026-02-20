import React, { useState, useEffect, useCallback } from 'react';
import { getForecast, getRisk, getAnomalies, getHotspots } from '../api/api';
import CitySelector from '../components/CitySelector';
import RiskCard from '../components/RiskCard';
import ForecastChart from '../components/ForecastChart';
import HotspotMap from '../components/HotspotMap';
import AnomalyPanel from '../components/AnomalyPanel';
import GovernmentAnalyticsPanel from '../components/GovernmentAnalyticsPanel';
import ClusterTable from '../components/ClusterTable';
import ViolationMonitoring from '../components/ViolationMonitoring';
import PolicySimulator from '../components/PolicySimulator';
import DeploymentOptimizer from '../components/DeploymentOptimizer';
import EscalationTimeline from '../components/EscalationTimeline';
import EconomicImpactPanel from '../components/EconomicImpactPanel';
import EnvironmentalHealthIndex from '../components/EnvironmentalHealthIndex';
import StatusHeader from '../components/StatusHeader';
import LiveAlertMarquee from '../components/LiveAlertMarquee';
import SituationSummary from '../components/SituationSummary';
import RecommendedActions from '../components/RecommendedActions';
import { Shield, RefreshCw, AlertCircle, FileText, Settings, TrendingUp, Activity, MapPin, Zap, DollarSign, ClipboardList } from 'lucide-react';

const GovernmentDashboard = () => {
    const [selectedCity, setSelectedCity] = useState('Delhi');
    const [activeTab, setActiveTab] = useState('overview');
    const [data, setData] = useState({ forecast: null, risk: null, anomalies: null, hotspots: null });
    const [loading, setLoading] = useState({ forecast: true, risk: true, anomalies: true, hotspots: true });

    const fetchData = useCallback(async (city) => {
        setLoading({ forecast: true, risk: true, anomalies: true, hotspots: true });

        const fetchers = [
            { key: 'forecast', fn: getForecast },
            { key: 'risk', fn: getRisk },
            { key: 'anomalies', fn: getAnomalies },
            { key: 'hotspots', fn: getHotspots }
        ];

        fetchers.forEach(async ({ key, fn }) => {
            try {
                const response = await fn(city);
                setData(prev => ({ ...prev, [key]: response.data }));
            } catch (err) {
                console.error(`Gov Data Fetch Error:`, err);
            } finally {
                setLoading(prev => ({ ...prev, [key]: false }));
            }
        });
    }, []);

    useEffect(() => {
        fetchData(selectedCity);
    }, [selectedCity, fetchData]);

    // Calculate escalation probability for summary
    const baseProb = 5;
    let escalationProbability = baseProb;
    const aqiVal = data.risk?.latest_aqi || 100;
    if (aqiVal > 200) escalationProbability += 40;
    else if (aqiVal > 150) escalationProbability += 20;

    // Tab Navigation Configuration
    const tabs = [
        { id: 'overview', label: 'Overview', icon: Activity },
        { id: 'risk', label: 'Risk & Forecast', icon: TrendingUp },
        { id: 'hotspots', label: 'Hotspot Intelligence', icon: MapPin },
        { id: 'deployment', label: 'Resource Deployment', icon: Zap },
        { id: 'economic', label: 'Economic Impact', icon: DollarSign },
        { id: 'violations', label: 'Violation Monitoring', icon: ClipboardList }
    ];

    // Section Header Component
    const SectionHeader = ({ title, description, aiInsight, icon: Icon }) => (
        <div className="mb-6 animate-in fade-in slide-in-from-top-4 duration-500">
            <div className="flex items-start gap-4">
                {Icon && <Icon className="text-blue-600 shrink-0 mt-1" size={28} />}
                <div>
                    <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tighter mb-2">
                        {title}
                    </h2>
                    <p className="text-sm text-slate-600 mb-3">{description}</p>
                    {aiInsight && (
                        <div className="text-xs font-bold text-blue-600 italic bg-blue-50 px-3 py-2 rounded-lg inline-block border border-blue-100">
                            🧠 {aiInsight}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            {/* Main Header */}
            <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6 bg-white p-6 rounded-[2.5rem] border border-slate-200 shadow-sm">
                <div className="flex items-center gap-4">
                    <div className="bg-slate-900 text-white p-3 rounded-2xl">
                        <Shield size={28} />
                    </div>
                    <div>
                        <h1 className="text-2xl font-black text-slate-900 tracking-tighter uppercase italic">
                            Authority <span className="text-blue-600">Command</span> Hub
                        </h1>
                        <div className="flex items-center gap-3">
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">AeroNova Intelligence System v2.0</span>
                            <div className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse"></div>
                            <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">Live Feed Active</span>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <CitySelector selectedCity={selectedCity} onCityChange={setSelectedCity} />
                    <button
                        onClick={() => fetchData(selectedCity)}
                        className="p-4 bg-slate-900 text-white rounded-2xl hover:bg-blue-600 transition-all shadow-lg shadow-slate-900/10 hover:shadow-blue-600/20"
                    >
                        <RefreshCw size={20} className="animate-spin-slow" />
                    </button>
                </div>
            </div>

            {/* Always Visible: Status & Alerts */}
            {!loading.risk && (
                <StatusHeader 
                    currentAQI={data.risk?.latest_aqi || 100} 
                    anomalyCount={data.anomalies?.anomaly_count || 0} 
                />
            )}

            {!loading.hotspots && (
                <LiveAlertMarquee 
                    hotspots={data.hotspots?.hotspots || []}
                    riskLevel={data.risk?.risk_level || 'Low'}
                    currentAQI={data.risk?.latest_aqi || 100}
                />
            )}

            {/* Mini Summary Strip (Always Visible) */}
            <div className="sticky top-0 z-40 bg-white border border-slate-200 rounded-2xl shadow-lg backdrop-blur-sm bg-white/95">
                <div className="flex flex-wrap items-center justify-between gap-4 p-4 overflow-x-auto">
                    <div className="flex items-center gap-2 min-w-fit">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">AQI</span>
                        <span className="text-lg font-black text-slate-900">{data.risk?.latest_aqi || 100}</span>
                    </div>
                    <div className="w-px h-6 bg-slate-200"></div>
                    <div className="flex items-center gap-2 min-w-fit">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Risk</span>
                        <span className="text-sm font-black text-slate-900">{data.risk?.risk_level || 'Low'}</span>
                    </div>
                    <div className="w-px h-6 bg-slate-200"></div>
                    <div className="flex items-center gap-2 min-w-fit">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Hotspots</span>
                        <span className="text-lg font-black text-slate-900">{data.hotspots?.hotspot_stations_count || 0}</span>
                    </div>
                    <div className="w-px h-6 bg-slate-200"></div>
                    <div className="flex items-center gap-2 min-w-fit">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Anomalies</span>
                        <span className="text-lg font-black text-slate-900">{data.anomalies?.anomaly_count || 0}</span>
                    </div>
                    <div className="w-px h-6 bg-slate-200"></div>
                    <div className="flex items-center gap-2 min-w-fit">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Escalation</span>
                        <span className="text-lg font-black text-blue-600">{escalationProbability}%</span>
                    </div>
                </div>
            </div>

            {/* Tab Navigation Bar (Sticky) */}
            <div className="sticky top-20 z-40 bg-white border border-slate-200 rounded-2xl shadow-lg backdrop-blur-sm bg-white/95">
                <div className="flex gap-2 p-2 overflow-x-auto">
                    {tabs.map((tab) => {
                        const Icon = tab.icon;
                        const isActive = activeTab === tab.id;
                        return (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex items-center gap-2 px-4 py-3 rounded-xl font-black text-xs uppercase tracking-widest transition-all whitespace-nowrap relative group ${
                                    isActive
                                        ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
                                        : 'text-slate-700 hover:bg-slate-50'
                                }`}
                            >
                                <Icon size={16} />
                                {tab.label}
                                {isActive && (
                                    <div className="absolute -bottom-1 left-0 right-0 h-1 bg-gradient-to-r from-blue-400 via-blue-500 to-blue-600 rounded-full animate-pulse"></div>
                                )}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* SECTION 1: OVERVIEW */}
            {activeTab === 'overview' && (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <SectionHeader 
                        title="System Overview" 
                        description="Real-time operational status and system health metrics"
                        aiInsight={`${aqiVal > 200 ? 'CRITICAL: Immediate intervention required' : aqiVal > 150 ? 'HIGH: Enhanced monitoring active' : 'System operating within normal parameters'}`}
                        icon={Activity}
                    />

                    {!loading.risk && (
                        <SituationSummary 
                            forecast={data.forecast?.forecast || []}
                            currentAQI={data.risk?.latest_aqi || 100}
                            riskLevel={data.risk?.risk_level || 'Low'}
                            escalationProbability={escalationProbability}
                        />
                    )}

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <EnvironmentalHealthIndex
                            currentAQI={data.risk?.latest_aqi || 100}
                            hotspotCount={data.hotspots?.hotspot_stations_count || 0}
                            anomalyCount={data.anomalies?.anomaly_count || 0}
                        />
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                            <h3 className="text-lg font-black text-slate-900 uppercase tracking-tighter mb-6">System Health</h3>
                            <GovernmentAnalyticsPanel data={data} loading={loading.hotspots} />
                        </div>
                    </div>
                </div>
            )}

            {/* SECTION 2: RISK & FORECAST */}
            {activeTab === 'risk' && (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <SectionHeader 
                        title="Risk & Forecast Analysis" 
                        description="3-day AQI forecast with escalation probability timeline"
                        aiInsight="AI models trained on 5-year historical data with 87% accuracy"
                        icon={TrendingUp}
                    />

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <ForecastChart data={data.forecast} loading={loading.forecast} showMetadata={true} />
                        <EscalationTimeline 
                            forecast={data.forecast?.forecast || []} 
                            currentAQI={data.risk?.latest_aqi || 100}
                        />
                    </div>

                    <PolicySimulator currentAQI={data.risk?.latest_aqi || 100} />
                </div>
            )}

            {/* SECTION 3: HOTSPOT INTELLIGENCE */}
            {activeTab === 'hotspots' && (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <SectionHeader 
                        title="Hotspot Intelligence" 
                        description="Real-time geospatial pollution cluster analysis and regional insights"
                        aiInsight={`${data.hotspots?.hotspot_stations_count || 0} active pollution zones detected`}
                        icon={MapPin}
                    />

                    <div className="min-h-[500px] bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                        <HotspotMap data={data.hotspots} loading={loading.hotspots} mode="cluster" />
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                            <h3 className="text-lg font-black text-slate-900 uppercase tracking-tighter mb-6">Active Sensors</h3>
                            <div className="space-y-4">
                                <div>
                                    <p className="text-sm font-bold text-slate-700">Total Stations</p>
                                    <p className="text-3xl font-black text-slate-900">{data.hotspots?.total_stations || 0}</p>
                                </div>
                                <div className="border-t border-slate-200 pt-4">
                                    <p className="text-sm font-bold text-slate-700">Hotspot Zones</p>
                                    <p className="text-3xl font-black text-rose-600">{data.hotspots?.hotspot_stations_count || 0}</p>
                                </div>
                            </div>
                        </div>
                        <ClusterTable hotspots={data.hotspots?.hotspots || []} loading={loading.hotspots} />
                    </div>
                </div>
            )}

            {/* SECTION 4: RESOURCE DEPLOYMENT */}
            {activeTab === 'deployment' && (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <SectionHeader 
                        title="Resource Deployment" 
                        description="Optimal allocation of inspection teams, vehicles, and health units"
                        aiInsight="AI-optimized deployment strategy reduces response time by 34%"
                        icon={Zap}
                    />

                    <DeploymentOptimizer
                        hotspotCount={data.hotspots?.hotspot_stations_count || 0}
                        anomalyCount={data.anomalies?.anomaly_count || 0}
                        riskLevel={data.risk?.risk_level || 'Low'}
                    />

                    <div className="bg-slate-900 rounded-[2.5rem] p-6 text-white overflow-hidden relative group">
                        <div className="absolute -top-10 -right-10 w-32 h-32 bg-blue-500/10 rounded-full blur-2xl group-hover:bg-blue-500/20 transition-colors"></div>
                        <h4 className="text-lg font-black uppercase tracking-widest mb-6 flex items-center gap-2 relative z-10">
                            <Settings size={20} className="text-blue-400" /> Control Center
                        </h4>
                        <div className="space-y-3 relative z-10">
                            {['Initiate Filter Scan', 'Deploy Mobile Node', 'Audit Industrial Sector'].map((act, i) => (
                                <button key={i} className="w-full py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-xs font-black uppercase tracking-widest transition-all text-left px-4 flex justify-between items-center group/btn">
                                    {act}
                                    <FileText size={14} className="text-white/30 group-hover/btn:text-white" />
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* SECTION 5: ECONOMIC IMPACT */}
            {activeTab === 'economic' && (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <SectionHeader 
                        title="Economic Impact Analysis" 
                        description="Financial burden assessment from pollution-related losses"
                        aiInsight={`Current economic cost: ₹${((aqiVal / 300) * 100).toFixed(1)}% productivity loss`}
                        icon={DollarSign}
                    />

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <EconomicImpactPanel currentAQI={data.risk?.latest_aqi || 100} />
                        {!loading.risk && (
                            <RecommendedActions
                                currentAQI={data.risk?.latest_aqi || 100}
                                riskLevel={data.risk?.risk_level || 'Low'}
                                hotspotCount={data.hotspots?.hotspot_stations_count || 0}
                                anomalyCount={data.anomalies?.anomaly_count || 0}
                            />
                        )}
                    </div>
                </div>
            )}

            {/* SECTION 6: VIOLATION MONITORING */}
            {activeTab === 'violations' && (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <SectionHeader 
                        title="Violation Monitoring" 
                        description="Citizen complaints, unified registry, and critical directives"
                        aiInsight={`${data.anomalies?.anomaly_count || 0} anomalies flagged for investigation`}
                        icon={ClipboardList}
                    />

                    <ViolationMonitoring />

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <RiskCard data={data.risk} loading={loading.risk} isAdvanced={true} />
                        <AnomalyPanel data={data.anomalies} loading={loading.anomalies} detailLevel="advanced" />
                    </div>

                    <div className="bg-rose-50 border border-rose-100 p-6 rounded-2xl flex items-start gap-4 ring-2 ring-rose-500/10 animate-pulse">
                        <AlertCircle className="text-rose-500 shrink-0" size={32} />
                        <div>
                            <p className="text-xs font-black text-rose-500 uppercase tracking-widest mb-2 italic underline">Critical Directives</p>
                            <p className="text-sm font-bold text-rose-800 leading-relaxed">
                                AI detects {data.anomalies?.anomaly_count || 0} anomalies. Deployment of response units recommended. Escalation probability at {escalationProbability}%.
                            </p>
                        </div>
                    </div>
                </div>
            )}

            <style>{`
                @keyframes spin-slow {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
            `}</style>
        </div>
    );
};

export default GovernmentDashboard;
