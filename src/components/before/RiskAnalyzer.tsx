import React from 'react';
import { useApp } from '../../context/AppContext';
import {
  AlertOctagon,
  ShieldAlert,
  Users,
  MapPin,
  History,
  CloudRain,
  Flame,
  Wind,
  Activity,
  Mountain,
  Locate
} from 'lucide-react';
import { DisasterType } from '../../types';

export const RiskAnalyzer: React.FC = () => {
  const { selectedLocation, setSelectedLocation, allDistricts, detectUserLocation, isLocating, currentWeather } = useApp();

  const getDisasterIcon = (type: DisasterType) => {
    switch (type) {
      case 'flood':
        return <CloudRain className="w-5 h-5 text-blue-600" />;
      case 'cyclone':
        return <Wind className="w-5 h-5 text-teal-600" />;
      case 'earthquake':
        return <Activity className="w-5 h-5 text-amber-600" />;
      case 'heatwave':
        return <Flame className="w-5 h-5 text-orange-600" />;
      case 'landslide':
        return <Mountain className="w-5 h-5 text-emerald-600" />;
      default:
        return <ShieldAlert className="w-5 h-5 text-rose-600" />;
    }
  };

  const getRiskBadgeColor = (level: string) => {
    switch (level) {
      case 'CRITICAL':
        return 'bg-rose-100 text-rose-700 border-rose-300 animate-pulse';
      case 'HIGH':
        return 'bg-amber-100 text-amber-800 border-amber-300';
      case 'MODERATE':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      default:
        return 'bg-emerald-100 text-emerald-800 border-emerald-300';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-200 bg-gradient-to-br from-amber-50/70 via-white to-rose-50/50 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
          <AlertOctagon className="w-48 h-48 text-amber-600" />
        </div>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-200 uppercase tracking-wide">
                Module 1: Before Disaster
              </span>
              <span className="text-slate-400">•</span>
              <span className="text-xs text-slate-600">Risk Assessment Engine</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black font-heading text-slate-900">
              Locality Risk & Hazard Vulnerability
            </h2>
            <p className="text-slate-600 text-xs sm:text-sm mt-1 max-w-2xl">
              Static rule-based hazard classification synced with Indian District Disaster Vulnerability Index. Know your area's risks before an emergency strikes.
            </p>
          </div>

          <button
            onClick={detectUserLocation}
            disabled={isLocating}
            className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs shadow-md transition shrink-0"
          >
            <Locate className={`w-4 h-4 ${isLocating ? 'animate-spin' : ''}`} />
            <span>{isLocating ? 'Locking GPS...' : 'Auto-Detect My Risk Zone'}</span>
          </button>
        </div>
      </div>

      {/* Selected District Card + Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main District Risk Profile */}
        <div className="lg:col-span-2 glass-panel p-6 rounded-2xl border border-slate-200 bg-white space-y-6">
          <div className="flex items-start justify-between gap-4 border-b border-slate-100 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <MapPin className="w-5 h-5 text-rose-600" />
                <h3 className="text-2xl font-bold font-heading text-slate-900">
                  {selectedLocation.district}, {selectedLocation.state}
                </h3>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                GPS Center Coordinates: {selectedLocation.coordinates[0]}° N, {selectedLocation.coordinates[1]}° E
              </p>
            </div>

            <span
              className={`px-3 py-1 rounded-lg text-xs font-black uppercase tracking-wider border ${getRiskBadgeColor(
                selectedLocation.riskLevel
              )}`}
            >
              {selectedLocation.riskLevel} RISK ZONE
            </span>
          </div>

          {/* Key Metrics Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
              <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
                <span>Primary Threat</span>
                {getDisasterIcon(selectedLocation.primaryRisk)}
              </div>
              <div className="text-lg font-black text-slate-900 capitalize font-heading">
                {selectedLocation.primaryRisk}
              </div>
              <div className="text-[10px] text-slate-500 mt-0.5">High recurrence frequency</div>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
              <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
                <span>Exposed Population</span>
                <Users className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="text-lg font-black text-emerald-700 font-heading">
                {selectedLocation.populationExposed}
              </div>
              <div className="text-[10px] text-slate-500 mt-0.5">Citizens in vulnerability zone</div>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
              <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
                <span>Secondary Threats</span>
                <ShieldAlert className="w-4 h-4 text-amber-600" />
              </div>
              <div className="flex flex-wrap gap-1 mt-1">
                {selectedLocation.secondaryRisks.map((sec) => (
                  <span
                    key={sec}
                    className="text-[10px] font-semibold px-2 py-0.5 rounded bg-slate-200 text-slate-800 capitalize"
                  >
                    {sec}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Live Weather Observation Widget */}
          {currentWeather && (
            <div className="p-4 rounded-xl bg-blue-50/70 border border-blue-200 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold text-blue-900 uppercase tracking-wide">
                  🌤️ Live Weather Observation (Synced via Weather API)
                </span>
                <span className="text-[10px] font-mono text-blue-700 font-bold">{currentWeather.weather_condition}</span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 font-mono text-xs">
                <div className="p-2 rounded-lg bg-white/80 border border-blue-100">
                  <div className="text-[10px] text-slate-500">Temp</div>
                  <div className="font-bold text-slate-900">{currentWeather.temperature}°C</div>
                </div>
                <div className="p-2 rounded-lg bg-white/80 border border-blue-100">
                  <div className="text-[10px] text-slate-500">Humidity</div>
                  <div className="font-bold text-slate-900">{currentWeather.humidity}%</div>
                </div>
                <div className="p-2 rounded-lg bg-white/80 border border-blue-100">
                  <div className="text-[10px] text-slate-500">Precipitation</div>
                  <div className="font-bold text-blue-700">{currentWeather.rainfall} mm/h</div>
                </div>
                <div className="p-2 rounded-lg bg-white/80 border border-blue-100">
                  <div className="text-[10px] text-slate-500">Wind Speed</div>
                  <div className="font-bold text-slate-900">{currentWeather.wind_speed} km/h</div>
                </div>
              </div>
            </div>
          )}

          {/* Official Advisory Box */}
          <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 space-y-1">
            <div className="flex items-center gap-2 text-xs font-bold text-amber-800 uppercase tracking-wide">
              <AlertOctagon className="w-4 h-4" />
              <span>Official Vulnerability Advisory</span>
            </div>
            <p className="text-xs text-slate-800 leading-relaxed font-medium">
              {selectedLocation.advisoryText}
            </p>
          </div>

          {/* Historical Record */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-600 uppercase">
              <History className="w-4 h-4 text-blue-600" />
              <span>Historical Disaster Benchmark</span>
            </div>
            <p className="text-xs text-slate-700">{selectedLocation.historicalNote}</p>
          </div>
        </div>

        {/* Quick Select District List */}
        <div className="glass-panel p-6 rounded-2xl border border-slate-200 bg-white space-y-4">
          <h3 className="text-sm font-bold text-slate-900 font-heading uppercase tracking-wider">
            High-Risk Indian Districts
          </h3>
          <p className="text-xs text-slate-500">Select any region to inspect its risk profile:</p>

          <div className="space-y-2 max-h-[380px] overflow-y-auto pr-1">
            {allDistricts.map((d) => (
              <button
                key={d.id}
                onClick={() => setSelectedLocation(d)}
                className={`w-full p-3 rounded-xl border text-left transition flex items-center justify-between ${
                  selectedLocation.id === d.id
                    ? 'bg-amber-50 border-amber-300 text-slate-900 shadow-sm font-bold'
                    : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                }`}
              >
                <div>
                  <div className="text-xs font-bold">{d.district}</div>
                  <div className="text-[10px] text-slate-500">{d.state}</div>
                </div>
                <div className="text-right">
                  <span
                    className={`text-[9px] font-bold px-1.5 py-0.5 rounded uppercase border ${getRiskBadgeColor(
                      d.riskLevel
                    )}`}
                  >
                    {d.riskLevel}
                  </span>
                  <div className="text-[9px] text-slate-500 capitalize mt-1">{d.primaryRisk}</div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
