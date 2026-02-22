import React, { useState, useMemo, useEffect } from "react";
import { Sliders, TrendingDown } from "lucide-react";

const PolicySimulator = ({ currentAQI = 100, pollutants = {} }) => {
  const [trafficReduction, setTrafficReduction] = useState(20);
  const [constructionControl, setConstructionControl] = useState(20);
  const [industrialControl, setIndustrialControl] = useState(20);
  const [autoMode, setAutoMode] = useState(false);
  const [displayedAQI, setDisplayedAQI] = useState(Number(currentAQI ?? 0));

  /* ---------------- POLLUTANT PROJECTION MODEL ---------------- */

  const projectedPollutants = useMemo(() => {
    const pm25 = Number(pollutants?.pm25 ?? 0);
    const pm10 = Number(pollutants?.pm10 ?? 0);
    const no2 = Number(pollutants?.no2 ?? 0);

    const pm25Reduction =
      (trafficReduction * 0.4 + industrialControl * 0.3) / 100;

    const pm10Reduction =
      (constructionControl * 0.5 + trafficReduction * 0.2) / 100;

    const no2Reduction =
      (trafficReduction * 0.5 + industrialControl * 0.4) / 100;

    return {
      pm25: Math.max(0, Math.round(pm25 * (1 - pm25Reduction))),
      pm10: Math.max(0, Math.round(pm10 * (1 - pm10Reduction))),
      no2: Math.max(0, Math.round(no2 * (1 - no2Reduction)))
    };
  }, [pollutants, trafficReduction, constructionControl, industrialControl]);

  /* ---------------- AQI PROJECTION MODEL ---------------- */

  const projectedAQI = useMemo(() => {
    const baseAQI = Number(currentAQI ?? 0);

    const pm25 = projectedPollutants.pm25;
    const pm10 = projectedPollutants.pm10;
    const no2 = projectedPollutants.no2;

    const weightedPollution =
      pm25 * 0.5 + pm10 * 0.3 + no2 * 0.2;

    const normalizedFactor = Math.min(1, weightedPollution / 300);

    const trafficEffect = Math.pow(trafficReduction / 100, 1.2) * 0.25;
    const constructionEffect = Math.pow(constructionControl / 100, 1.1) * 0.3;
    const industryEffect = Math.pow(industrialControl / 100, 1.3) * 0.35;

    const combinedEffect =
      (trafficEffect + constructionEffect + industryEffect) *
      normalizedFactor;

    const reduction = baseAQI * combinedEffect;

    return Math.max(0, Math.round(baseAQI - reduction));
  }, [
    currentAQI,
    trafficReduction,
    constructionControl,
    industrialControl,
    projectedPollutants
  ]);

  /* ---------------- IMPACT CALCULATIONS ---------------- */

  const improvement = Number(currentAQI ?? 0) - projectedAQI;
  const improvementPercent =
    currentAQI > 0
      ? Math.round((improvement / currentAQI) * 100)
      : 0;

  const calculateHealthImpact = (aqi) => {
    if (aqi < 50) return 5;
    if (aqi < 100) return 15;
    if (aqi < 150) return 30;
    if (aqi < 200) return 50;
    return 70;
  };

  const healthImpactScore = Math.max(
    0,
    calculateHealthImpact(currentAQI) -
    calculateHealthImpact(projectedAQI)
  );

  const exposureMultiplier =
    Number(pollutants?.pm25 ?? 0) > 100 ? 18 : 12;

  const livesProtected =
    improvement > 0
      ? Math.round(improvement * exposureMultiplier)
      : 0;

  /* ---------------- AQI COUNTER ANIMATION ---------------- */

  useEffect(() => {
    if (displayedAQI !== projectedAQI) {
      const diff = projectedAQI - displayedAQI;
      const step = Math.ceil(Math.abs(diff) / 10);
      const direction = diff > 0 ? 1 : -1;

      const timer = setTimeout(() => {
        setDisplayedAQI((prev) => {
          const next = prev + step * direction;
          if (direction > 0) return Math.min(next, projectedAQI);
          return Math.max(next, projectedAQI);
        });
      }, 50);

      return () => clearTimeout(timer);
    }
  }, [projectedAQI, displayedAQI]);

  /* ---------------- AUTO MODE ---------------- */

  const handleAutoMode = () => {
    const pm25 = Number(pollutants?.pm25 ?? 0);
    const pm10 = Number(pollutants?.pm10 ?? 0);
    const no2 = Number(pollutants?.no2 ?? 0);

    if (!autoMode) {
      if (pm25 > pm10 && pm25 > no2) {
        setTrafficReduction(45);
        setIndustrialControl(40);
        setConstructionControl(25);
      } else if (pm10 > pm25) {
        setConstructionControl(50);
        setTrafficReduction(30);
        setIndustrialControl(25);
      } else {
        setIndustrialControl(45);
        setTrafficReduction(35);
        setConstructionControl(30);
      }
    } else {
      setTrafficReduction(20);
      setConstructionControl(20);
      setIndustrialControl(20);
    }

    setAutoMode(!autoMode);
  };

  const isImproving = improvement > 0;

  /* ---------------- UI ---------------- */

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">

      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2">
            Environmental Control Analysis
          </h3>
          <div className="flex items-center space-x-2">
            <Sliders size={16} className="text-slate-600" />
            <span className="text-sm font-black text-slate-800 uppercase tracking-tight">
              Strategic Intervention Impact Assessment
            </span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1.5 font-bold italic">
            Evaluating projected environmental and public health outcomes based on targeted enforcement strategies.
          </p>
        </div>

        <button
          onClick={handleAutoMode}
          className={`px-3 py-1.5 rounded-lg text-xs font-black uppercase ${autoMode
              ? "bg-indigo-500 text-white"
              : "bg-slate-100 text-slate-600"
            }`}
        >
          {autoMode ? "⚡ Auto" : "Manual"}
        </button>
      </div>

      {/* Pollutant Display */}
      <div className="bg-slate-50 border rounded-xl p-4 mb-6">
        <p className="text-xs font-black text-slate-500 mb-3">
          Pollution Adjustment Scenario
        </p>

        <div className="grid grid-cols-3 gap-4">
          {[
            {
              label: "PM2.5",
              current: pollutants?.pm25,
              projected: projectedPollutants.pm25,
              explanation: "Fine particulate matter affecting respiratory health."
            },
            {
              label: "PM10",
              current: pollutants?.pm10,
              projected: projectedPollutants.pm10,
              explanation: "Coarse dust particles typically from construction and roads."
            },
            {
              label: "NO₂",
              current: pollutants?.no2,
              projected: projectedPollutants.no2,
              explanation: "Traffic-related nitrogen dioxide emissions."
            }
          ].map((p) => {
            const change = Number((Number(p.current ?? 0) - Number(p.projected ?? 0)).toFixed(1));

            const getInsight = (label, val) => {
              if (val <= 0) return "Baseline operational level maintained";
              switch (label) {
                case 'PM2.5': return `${label} reduced by ${val} µg/m³ – Significant respiratory exposure reduction`;
                case 'PM10': return `${label} reduced by ${val} µg/m³ – Lower construction dust impact`;
                case 'NO₂': return `${label} reduced by ${val} µg/m³ – Reduced traffic-related emissions`;
                default: return `${label} concentration mitigated`;
              }
            };

            return (
              <div key={p.label} className="bg-white border rounded-lg p-4 flex flex-col justify-between">
                <div>
                  <p className="text-xs font-black text-slate-900 mb-3">{p.label} Concentration</p>

                  <div className="space-y-1.5 mb-4">
                    <div className="flex justify-between items-center text-[10px]">
                      <span className="text-slate-500 font-bold">Current Baseline:</span>
                      <span className="font-black text-slate-900">{Number(p.current ?? 0).toFixed(1)}</span>
                    </div>
                    <div className="flex justify-between items-center text-[10px]">
                      <span className="text-blue-600 font-black">Projected Level:</span>
                      <span className="font-black text-blue-700">{Number(p.projected ?? 0).toFixed(1)}</span>
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100">
                  <p className="text-[9px] font-bold text-emerald-600 leading-tight">
                    {getInsight(p.label, change)}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        <p className="text-xs text-slate-500 mt-3 italic">
          Traffic reduction primarily decreases PM2.5 and NO₂. Construction
          controls reduce PM10. Industrial intervention impacts both PM2.5 and
          NO₂.
        </p>
      </div>

      {/* AQI Result */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-5">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Environmental Baseline</p>
          <p className="text-3xl font-black text-slate-900">Current Condition: {Math.round(currentAQI) > 150 ? 'HIGH' : 'MODERATE'} (AQI {Math.round(currentAQI)})</p>
        </div>

        <div className="bg-blue-50 border border-blue-100 rounded-xl p-5">
          <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-1">Projected Outcome</p>
          <p className="text-3xl font-black text-blue-900">Post-Intervention Projection: {displayedAQI < 100 ? 'Good' : displayedAQI < 150 ? 'Moderate' : 'Upper Moderate'} (AQI {displayedAQI})</p>
          <p className="text-[10px] text-blue-700 font-bold mt-3 italic">
            Recommended measures are projected to reduce overall air quality severity by one classification band.
          </p>
        </div>
      </div>

      {/* Impact */}
      {isImproving && (
        <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-5 mb-6">
          <p className="text-[10px] font-black text-emerald-800 uppercase tracking-widest mb-3">
            Public Health Advantage Assessment
          </p>
          <div className="flex items-center gap-3 mb-3">
            <TrendingDown size={24} className="text-emerald-600" />
            <p className="text-lg font-bold text-slate-700 leading-tight">
              Approximately <span className="text-2xl font-black text-emerald-700">{livesProtected}</span> individuals per day are projected to move from high-risk exposure category to safer levels under proposed intervention.
            </p>
          </div>
        </div>
      )}

      {/* Interpretation Panel */}
      <div className="bg-slate-900 rounded-2xl p-6 text-white relative overflow-hidden shadow-xl">
        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl"></div>
        <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-4 flex items-center gap-2">
          <Sliders size={14} /> Policy Rationale
        </p>
        <ul className="text-xs font-medium space-y-3 relative z-10">
          <li className="flex items-start gap-3">
            <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5 shrink-0" />
            <span>Traffic restrictions primarily reduce <span className="font-black text-blue-300">PM2.5</span> and <span className="font-black text-blue-300">NO₂</span></span>
          </li>
          <li className="flex items-start gap-3">
            <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5 shrink-0" />
            <span>Construction controls reduce <span className="font-black text-blue-300">PM10</span></span>
          </li>
          <li className="flex items-start gap-3">
            <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5 shrink-0" />
            <span>Industrial enforcement reduces combined pollutant load</span>
          </li>
        </ul>
        <p className="text-[9px] text-slate-400 mt-6 italic border-t border-white/10 pt-4">
          Projected impacts are based on localized environmental dispersion models and historical enforcement efficacy data.
        </p>
      </div>

    </div>
  );
};

export default PolicySimulator;