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
  Locate,
  Droplets,
  Eye,
  Gauge,
  Sun,
  CloudSun,
  CloudLightning,
  Cloud,
  AlertTriangle,
  CheckCircle,
  RefreshCw
} from 'lucide-react';
import { DisasterType } from '../../types';
import { calculateWeatherRisk } from '../../services/riskEngine';

export const RiskAnalyzer: React.FC = () => {
  const {
    selectedLocation,
    setSelectedLocation,
    allDistricts,
    detectUserLocation,
    isLocating,
    currentWeather,
    isWeatherLoading,
    weatherError,
    refreshWeather,
    userCoords
  } = useApp();

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

          {/* Real-time Weather & Disaster Assessment Dashboard */}
          <div className="border-t border-slate-100 pt-6 space-y-6">
            <div className="flex items-center justify-between">
              <h4 className="text-md font-bold font-heading text-slate-900 flex items-center gap-2">
                <CloudRain className="w-5 h-5 text-blue-600 animate-bounce" />
                <span>Real-Time Weather & Disaster Risk Assessment</span>
              </h4>
              <button
                onClick={() => refreshWeather(true)}
                disabled={isWeatherLoading}
                className="flex items-center gap-1 px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 text-[10px] font-bold rounded-lg border border-slate-200 transition"
              >
                <RefreshCw className={`w-3 h-3 ${isWeatherLoading ? 'animate-spin' : ''}`} />
                <span>{isWeatherLoading ? 'Refreshing...' : 'Refresh'}</span>
              </button>
            </div>

            {/* Config/API Warning */}
            {!(import.meta as any).env?.VITE_WEATHER_API_KEY && (
              <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0 text-amber-600" />
                <span>Weather service is not configured (VITE_WEATHER_API_KEY missing). Displaying simulated weather data.</span>
              </div>
            )}

            {/* Error States */}
            {weatherError && (
              <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 space-y-2">
                <div className="text-xs font-bold flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600" />
                  <span>{weatherError}</span>
                </div>
                <button
                  onClick={() => refreshWeather(true)}
                  className="flex items-center gap-1 px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-bold transition"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Retry</span>
                </button>
              </div>
            )}

            {/* Geolocation Info Banner */}
            {!userCoords && (
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-600 text-xs flex items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                  <Locate className="w-4 h-4 text-slate-400 shrink-0" />
                  <span>Location access unavailable (GPS not locked). Using regional preset location.</span>
                </div>
                <button
                  onClick={detectUserLocation}
                  className="px-2.5 py-1 bg-white hover:bg-slate-100 text-slate-800 text-[10px] font-extrabold border border-slate-300 rounded-lg transition"
                >
                  Select Location / Lock GPS
                </button>
              </div>
            )}

            {/* Loading Skeleton */}
            {isWeatherLoading && !currentWeather && (
              <div className="animate-pulse space-y-6">
                {/* Weather Grid skeleton */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="h-16 bg-slate-200 rounded-xl"></div>
                  ))}
                </div>
                {/* Risk assessment skeleton */}
                <div className="h-24 bg-slate-200 rounded-xl"></div>
                {/* Forecast skeleton */}
                <div className="h-32 bg-slate-200 rounded-xl"></div>
              </div>
            )}

            {/* Weather Content */}
            {!isWeatherLoading && currentWeather && (() => {
              const risk = calculateWeatherRisk(currentWeather);
              const getRiskColor = (level: string) => {
                switch (level) {
                  case 'CRITICAL': return 'text-rose-600 bg-rose-50 border-rose-200';
                  case 'HIGH': return 'text-amber-600 bg-amber-50 border-amber-200';
                  case 'MODERATE': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
                  default: return 'text-emerald-600 bg-emerald-50 border-emerald-200';
                }
              };
              const getProgressColor = (level: string) => {
                switch (level) {
                  case 'CRITICAL': return 'bg-rose-600';
                  case 'HIGH': return 'bg-amber-500';
                  case 'MODERATE': return 'bg-yellow-500';
                  default: return 'bg-emerald-500';
                }
              };

              const getWeatherIcon = (condition: string, size = "w-6 h-6") => {
                const cond = condition.toLowerCase();
                if (cond.includes('storm') || cond.includes('lightning') || cond.includes('thunder')) {
                  return <CloudLightning className={`${size} text-amber-600`} />;
                }
                if (cond.includes('rain') || cond.includes('shower') || cond.includes('drizzle') || cond.includes('precipitation')) {
                  return <CloudRain className={`${size} text-blue-500`} />;
                }
                if (cond.includes('cloud') || cond.includes('overcast') || cond.includes('gloomy')) {
                  return <CloudSun className={`${size} text-slate-500`} />;
                }
                if (cond.includes('hot') || cond.includes('heat') || cond.includes('sunny') || cond.includes('clear')) {
                  return <Sun className={`${size} text-orange-500`} />;
                }
                return <Cloud className={`${size} text-slate-400`} />;
              };

              // Local Dynamic Weather Alert calculation (if no official alert)
              const dynamicAlerts = [];
              if (currentWeather.rainfall > 25) {
                dynamicAlerts.push({
                  title: 'HIGH RAINFALL WARNING',
                  message: `Heavy torrential rainfall of ${currentWeather.rainfall} mm/h detected. Potential waterlogging, drain overflows, and localized flash floods in lowlands.`,
                  severity: 'HIGH'
                });
              }
              if (currentWeather.wind_speed > 40) {
                dynamicAlerts.push({
                  title: 'STRONG WIND ADVISORY',
                  message: `High velocity winds recorded at ${currentWeather.wind_speed} km/h. Avoid standing near weak hoardings, tall trees, or electrical wires.`,
                  severity: 'WARNING'
                });
              }
              if (currentWeather.temperature > 40) {
                dynamicAlerts.push({
                  title: 'EXTREME HEAT WARNING',
                  message: `Dangerous heat condition recorded (${currentWeather.temperature}°C). Avoid physical activity outdoors between 11 AM - 3 PM. Drink fluids.`,
                  severity: 'HIGH'
                });
              }
              const conditionLower = currentWeather.weather_condition.toLowerCase();
              if (conditionLower.includes('thunderstorm') || conditionLower.includes('lightning') || conditionLower.includes('storm')) {
                dynamicAlerts.push({
                  title: 'ELECTRICAL THUNDERSTORM THREAT',
                  message: 'Severe thunderstorms active. Unplug key electrical appliances and seek shelter inside building envelopes immediately.',
                  severity: 'HIGH'
                });
              }

              const allAlerts = [
                ...(currentWeather.alerts || []).map(a => ({ ...a, isOfficial: true })),
                ...dynamicAlerts.map(a => ({ ...a, isOfficial: false, source: 'System Engine' }))
              ];

              return (
                <div className="space-y-6">
                  {/* Current Weather details */}
                  <div className="p-5 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-4">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                      <div>
                        <div className="text-[10px] text-slate-500 font-extrabold uppercase tracking-widest">Current Weather at</div>
                        <div className="text-lg font-extrabold text-slate-900 font-heading leading-tight">{currentWeather.location_name}</div>
                        <div className="text-[10px] text-slate-400 mt-0.5">Last updated: {new Date(currentWeather.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-xl bg-white border border-slate-100 shadow-sm shrink-0">
                          {getWeatherIcon(currentWeather.weather_condition, "w-10 h-10")}
                        </div>
                        <div>
                          <div className="text-3xl font-black text-slate-900 leading-none">{Math.round(currentWeather.temperature)}°C</div>
                          <div className="text-xs text-slate-500 font-bold mt-1 capitalize">{currentWeather.weather_condition}</div>
                          {currentWeather.feels_like !== undefined && (
                            <div className="text-[10px] text-slate-400">Feels like {Math.round(currentWeather.feels_like)}°C</div>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 font-mono text-xs text-slate-700">
                      <div className="p-3 rounded-xl bg-white border border-slate-200/60 shadow-sm flex items-center gap-2.5">
                        <Droplets className="w-4 h-4 text-blue-500 shrink-0" />
                        <div>
                          <div className="text-[10px] text-slate-400 font-bold uppercase font-sans">Humidity</div>
                          <div className="font-extrabold text-slate-800">{currentWeather.humidity}%</div>
                        </div>
                      </div>

                      <div className="p-3 rounded-xl bg-white border border-slate-200/60 shadow-sm flex items-center gap-2.5">
                        <Wind className="w-4 h-4 text-slate-500 shrink-0" />
                        <div>
                          <div className="text-[10px] text-slate-400 font-bold uppercase font-sans">Wind Speed</div>
                          <div className="font-extrabold text-slate-800 leading-tight">
                            {currentWeather.wind_speed} km/h
                            {currentWeather.wind_direction && <span className="text-[10px] font-sans font-bold text-slate-400 ml-1">({currentWeather.wind_direction})</span>}
                          </div>
                        </div>
                      </div>

                      <div className="p-3 rounded-xl bg-white border border-slate-200/60 shadow-sm flex items-center gap-2.5">
                        <CloudRain className="w-4 h-4 text-blue-600 shrink-0" />
                        <div>
                          <div className="text-[10px] text-slate-400 font-bold uppercase font-sans">Precipitation</div>
                          <div className="font-extrabold text-slate-800">{currentWeather.rainfall} mm/h</div>
                        </div>
                      </div>

                      <div className="p-3 rounded-xl bg-white border border-slate-200/60 shadow-sm flex items-center gap-2.5">
                        <Gauge className="w-4 h-4 text-emerald-600 shrink-0" />
                        <div>
                          <div className="text-[10px] text-slate-400 font-bold uppercase font-sans">Pressure</div>
                          <div className="font-extrabold text-slate-800">{currentWeather.pressure} hPa</div>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 font-mono text-xs text-slate-700">
                      {currentWeather.visibility !== undefined && (
                        <div className="p-3 rounded-xl bg-white border border-slate-200/60 shadow-sm flex items-center gap-2.5">
                          <Eye className="w-4 h-4 text-slate-500 shrink-0" />
                          <div>
                            <div className="text-[10px] text-slate-400 font-bold uppercase font-sans">Visibility</div>
                            <div className="font-extrabold text-slate-800">{currentWeather.visibility} km</div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Weather Risk Card */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="p-5 rounded-2xl border border-slate-200 bg-white space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-extrabold uppercase text-slate-500 tracking-wider">Weather Risk Indicator</span>
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border ${getRiskColor(risk.level)}`}>
                          {risk.level}
                        </span>
                      </div>

                      <div className="space-y-1.5">
                        <div className="flex justify-between text-xs font-bold text-slate-700">
                          <span>Computed Score</span>
                          <span>{risk.score} / 100</span>
                        </div>
                        <div className="w-full bg-slate-100 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full transition-all duration-500 ${getProgressColor(risk.level)}`}
                            style={{ width: `${risk.score}%` }}
                          ></div>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wide">Contributing Weather Factors:</div>
                        <ul className="text-xs text-slate-700 space-y-1 list-disc list-inside leading-normal pl-1">
                          {risk.reasons.map((r, i) => (
                            <li key={i}>{r}</li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    {/* Recommended Actions */}
                    <div className="p-5 rounded-2xl border border-slate-200 bg-white space-y-4">
                      <div className="text-xs font-extrabold uppercase text-slate-500 tracking-wider flex items-center gap-1.5">
                        <CheckCircle className="w-4 h-4 text-emerald-600" />
                        <span>Recommended Actions</span>
                      </div>
                      <ul className="text-xs text-slate-700 space-y-2 list-none">
                        {risk.recommendations.map((rec, i) => (
                          <li key={i} className="flex gap-2 items-start leading-relaxed">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 shrink-0 mt-1.5"></span>
                            <span>{rec}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* Active Weather Warnings Banner List */}
                  {allAlerts.length > 0 && (
                    <div className="space-y-2">
                      <div className="text-xs font-extrabold text-slate-500 uppercase tracking-wider pl-1">Active Weather Alerts & Warnings</div>
                      <div className="space-y-2">
                        {allAlerts.map((alert, idx) => {
                          const isOfficial = alert.isOfficial;
                          const alertBg = isOfficial
                            ? alert.severity === 'CRITICAL' ? 'bg-red-50 border-red-300 text-red-900' : 'bg-orange-50 border-orange-300 text-orange-900'
                            : 'bg-amber-50 border-amber-300 text-amber-900';
                          return (
                            <div key={idx} className={`p-4 rounded-xl border ${alertBg} flex items-start gap-3 shadow-sm`}>
                              <AlertTriangle className={`w-5 h-5 shrink-0 ${isOfficial ? 'text-red-600' : 'text-amber-600'} ${alert.severity === 'CRITICAL' ? 'animate-bounce' : ''}`} />
                              <div className="space-y-1">
                                <div className="text-xs font-extrabold flex items-center gap-2">
                                  <span>{isOfficial ? 'OFFICIAL WEATHER ALERT' : 'WEATHER RISK WARNING'}: {alert.title}</span>
                                  <span className="px-1.5 py-0.5 rounded bg-white/70 border border-current text-[8px] font-black uppercase">{alert.source}</span>
                                </div>
                                <p className="text-xs font-medium leading-relaxed">{alert.message}</p>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* 3-Day Forecast Section */}
                  {currentWeather.forecast && currentWeather.forecast.length > 0 && (
                    <div className="space-y-3">
                      <div className="text-xs font-extrabold text-slate-500 uppercase tracking-wider pl-1">3-Day Forecast</div>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        {currentWeather.forecast.map((fc, i) => (
                          <div key={i} className="p-4 rounded-xl bg-white border border-slate-200 hover:border-slate-300 hover:shadow-md transition duration-200 flex flex-col items-center text-center space-y-2">
                            <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">{fc.dayName}</span>
                            <span className="text-xs font-bold text-slate-800">{fc.dateString}</span>
                            
                            <div className="py-1">
                              {fc.iconUrl ? (
                                <img src={fc.iconUrl} alt={fc.condition} className="w-10 h-10 object-contain" />
                              ) : (
                                getWeatherIcon(fc.condition, "w-8 h-8")
                              )}
                            </div>

                            <span className="text-xs font-black text-slate-900 leading-none">{fc.condition}</span>

                            <div className="flex items-center gap-2 text-xs pt-1 font-mono">
                              <span className="text-rose-600 font-extrabold">{fc.maxTemp}°C</span>
                              <span className="text-slate-400">/</span>
                              <span className="text-blue-500 font-extrabold">{fc.minTemp}°C</span>
                            </div>

                            <div className="grid grid-cols-2 gap-2 w-full pt-2 border-t border-slate-100 text-[10px] text-slate-500 leading-tight">
                              <div>
                                <div>Rain Prob</div>
                                <div className="font-extrabold text-blue-600">{fc.rainProbability}%</div>
                              </div>
                              <div>
                                <div>Wind</div>
                                <div className="font-extrabold text-slate-700">{fc.windSpeed} km/h</div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })()}
          </div>

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
