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
      } else if (pm10ForCalc > pm25ForCalc) {
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
            Policy Scenario Modeling
          </h3>
          <div className="flex items-center space-x-2">
            <Sliders size={16} className="text-slate-600" />
            <span className="text-sm font-black text-slate-800 uppercase tracking-tight">
              "What If" Simulator
            </span>
          </div>
        </div>

        <button
          onClick={handleAutoMode}
          className={`px-3 py-1.5 rounded-lg text-xs font-black uppercase ${
            autoMode
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
          Pollutant Response Simulation
        </p>

        <div className="grid grid-cols-3 gap-4 text-center">
          {[
            { label: "PM2.5", current: pollutants?.pm25, projected: projectedPollutants.pm25 },
            { label: "PM10", current: pollutants?.pm10, projected: projectedPollutants.pm10 },
            { label: "NO₂", current: pollutants?.no2, projected: projectedPollutants.no2 }
          ].map((p) => {
            const change =
              Number(p.current ?? 0) - Number(p.projected ?? 0);

            return (
              <div key={p.label} className="bg-white border rounded-lg p-3">
                <p className="text-xs font-bold text-slate-600">{p.label}</p>
                <p className="text-lg font-black">{Math.round(p.current ?? 0)}</p>
                <p className="text-xs text-slate-400">→ {p.projected}</p>
                <p className={`text-xs font-bold ${change > 0 ? "text-emerald-600" : "text-slate-500"}`}>
                  {change > 0 ? `↓ ${change}` : "No change"}
                </p>
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
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-orange-50 border rounded-xl p-4">
          <p className="text-xs font-black text-slate-500">Current AQI</p>
          <p className="text-3xl font-black">{Math.round(currentAQI)}</p>
        </div>

        <div className="bg-emerald-50 border rounded-xl p-4">
          <p className="text-xs font-black text-slate-500">Projected AQI</p>
          <p className="text-3xl font-black">{displayedAQI}</p>
        </div>
      </div>

      {/* Impact */}
      {isImproving && (
        <div className="bg-emerald-50 border rounded-xl p-4 mt-6">
          <p className="text-xs font-black text-slate-500">
            Lives Potentially Protected
          </p>
          <div className="flex items-center gap-2">
            <TrendingDown size={20} className="text-emerald-600" />
            <p className="text-2xl font-black text-emerald-700">
              ~{livesProtected} people/day
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default PolicySimulator;