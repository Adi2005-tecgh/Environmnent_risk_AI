import React from 'react';
import { Layers, ChevronRight, TrendingUp } from 'lucide-react';

const ClusterTable = ({ hotspots, loading }) => {
    if (loading) {
        return <div className="h-64 bg-slate-50 rounded-3xl animate-pulse border border-slate-100"></div>;
    }

    const hotspotsList = Array.isArray(hotspots) ? hotspots : [];

    // Severity breakdown (safe)
    const severityCounts = { Extreme: 0, High: 0, Moderate: 0 };
    hotspotsList.forEach(h => {
        if (h && severityCounts[h.severity] !== undefined) {
            severityCounts[h.severity]++;
        }
    });
    const totalHotspots = hotspotsList.length;
    const isExtremeMajority = totalHotspots > 0 && severityCounts.Extreme > totalHotspots * 0.5;

    // Aggregate stations into clusters
    const clustersMap = {};
    hotspotsList.forEach(h => {
        const cid = h.cluster;
        if (cid === -1) return; // Skip noise
        if (!clustersMap[cid]) {
            clustersMap[cid] = {
                id: cid,
                stations: [],
                totalPollution: 0,
                severity: h.severity
            };
        }
        clustersMap[cid].stations.push(h.station);
        clustersMap[cid].totalPollution += h.pollution_score;
    });

    const clusters = Object.values(clustersMap).map(c => ({
        ...c,
        avgPollution: Math.round(c.totalPollution / c.stations.length)
    })).sort((a, b) => b.avgPollution - a.avgPollution);

    return (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                <div>
                    <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">Regional Intelligence</h3>
                    <p className="text-sm font-black text-slate-800 tracking-tight">Active DBSCAN Clusters</p>
                </div>
                <button className="text-[10px] font-black text-gov-blue uppercase tracking-widest hover:underline flex items-center gap-1">
                    Export Report <ChevronRight size={12} />
                </button>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead>
                        <tr className="bg-slate-50/50">
                            <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Cluster ID</th>
                            <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Avg Pollution</th>
                            <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Nodes</th>
                            <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {clusters.length === 0 ? (
                            <tr>
                                <td colSpan="4" className="px-6 py-12 text-center text-slate-400 font-bold text-xs italic">
                                    No significant clusters detected in current spatial scan.
                                </td>
                            </tr>
                        ) : clusters.map((cluster) => (
                            <tr key={cluster.id} className="hover:bg-slate-50 transition-colors cursor-pointer group">
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-3">
                                        <div className="bg-slate-900 text-white p-2 rounded-lg group-hover:bg-blue-600 transition-colors">
                                            <Layers size={14} />
                                        </div>
                                        <span className="font-black text-slate-800 text-sm">C-{cluster.id.toString().padStart(3, '0')}</span>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex items-baseline gap-1">
                                        <span className="font-extrabold text-slate-800 text-base">{cluster.avgPollution}</span>
                                        <TrendingUp size={12} className="text-rose-500" />
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <span className="px-2 py-1 bg-slate-100 rounded-md text-[10px] font-black text-slate-600 uppercase">
                                        {cluster.stations.length} Stations
                                    </span>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-2">
                                        <div className={`w-2 h-2 rounded-full ${cluster.severity === 'Extreme' ? 'bg-rose-600' :
                                                cluster.severity === 'High' ? 'bg-orange-500' : 'bg-emerald-500'
                                            }`}></div>
                                        <span className={`text-[10px] font-black uppercase tracking-tight ${cluster.severity === 'Extreme' ? 'text-rose-600' : 'text-slate-600'
                                            }`}>
                                            {cluster.severity}
                                        </span>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <div className="p-4 border-t border-slate-100">
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Severity breakdown</p>
                <p className="text-xs text-slate-700">
                    Extreme: {Number(severityCounts.Extreme)} stations · High: {Number(severityCounts.High)} stations · Moderate: {Number(severityCounts.Moderate)} stations
                </p>
                {isExtremeMajority ? (
                    <p className="text-xs text-rose-600 font-bold mt-2">Majority of this cluster is classified as Extreme severity.</p>
                ) : null}
            </div>
        </div>
    );
};

export default ClusterTable;
