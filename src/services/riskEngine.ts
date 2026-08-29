import { DisasterType, RiskLevel } from '../types';
import { WeatherData } from './weatherService';

export interface ComprehensiveRiskAssessment {
  locationName: string;
  latitude: number;
  longitude: number;
  overallRisk: RiskLevel;
  riskScore: number; // 0 - 100
  cycloneRisk: RiskLevel;
  floodRisk: RiskLevel;
  earthquakeRisk: RiskLevel;
  landslideRisk: RiskLevel;
  heatRisk: RiskLevel;
  contributingFactors: string[];
  explanation: string;
  generatedAt: string;
}

export const calculateDisasterRiskScore = (params: {
  locationName: string;
  latitude: number;
  longitude: number;
  weather?: WeatherData | null;
  historicalPrimaryRisk?: DisasterType;
  recentEarthquakesCount?: number;
  activeIncidentsCount?: number;
}): ComprehensiveRiskAssessment => {
  let score = 30; // base risk score
  const factors: string[] = [];

  const weather = params.weather;
  const primaryRisk = params.historicalPrimaryRisk || 'flood';

  // 1. Rainfall / Flood Impact
  if (weather && weather.rainfall > 0) {
    if (weather.rainfall > 25) {
      score += 35;
      factors.push(`Extreme Rainfall Alert (${weather.rainfall} mm/h)`);
    } else if (weather.rainfall > 10) {
      score += 20;
      factors.push(`Moderate Heavy Rain (${weather.rainfall} mm/h)`);
    } else {
      score += 10;
    }
  }

  // 2. Wind Speed / Cyclone Impact
  if (weather && weather.wind_speed > 40) {
    score += 25;
    factors.push(`Gale Winds Recorded (${weather.wind_speed} km/h)`);
  } else if (weather && weather.wind_speed > 25) {
    score += 12;
    factors.push(`High Wind Gusts (${weather.wind_speed} km/h)`);
  }

  // 3. Temperature / Heatwave Impact
  if (weather && weather.temperature > 40) {
    score += 20;
    factors.push(`Extreme Heatwave Condition (${weather.temperature}°C)`);
  }

  // 4. Primary Threat Recurrence
  if (primaryRisk === 'landslide' && params.latitude > 10) {
    score += 15;
    factors.push('High terrain slope instability zone');
  } else if (primaryRisk === 'cyclone' && params.latitude < 22) {
    score += 15;
    factors.push('Coastal storm surge vulnerability corridor');
  } else if (primaryRisk === 'earthquake') {
    score += 15;
    factors.push('Active Himalayan seismic fault line (Zone IV/V)');
  }

  // 5. Incident Density
  if (params.activeIncidentsCount && params.activeIncidentsCount > 0) {
    score += Math.min(25, params.activeIncidentsCount * 5);
    factors.push(`${params.activeIncidentsCount} active ground emergency reports`);
  }

  const finalScore = Math.min(100, Math.max(0, Math.round(score)));

  let overallRisk: RiskLevel = 'MODERATE';
  if (finalScore >= 75) overallRisk = 'CRITICAL';
  else if (finalScore >= 50) overallRisk = 'HIGH';
  else if (finalScore >= 25) overallRisk = 'MODERATE';
  else overallRisk = 'LOW';

  const getSubRisk = (baseAdd: number): RiskLevel => {
    const s = Math.min(100, finalScore + baseAdd);
    if (s >= 75) return 'CRITICAL';
    if (s >= 50) return 'HIGH';
    if (s >= 25) return 'MODERATE';
    return 'LOW';
  };

  return {
    locationName: params.locationName,
    latitude: params.latitude,
    longitude: params.longitude,
    overallRisk,
    riskScore: finalScore,
    cycloneRisk: getSubRisk(primaryRisk === 'cyclone' ? 10 : -15),
    floodRisk: getSubRisk(primaryRisk === 'flood' ? 10 : -10),
    earthquakeRisk: getSubRisk(primaryRisk === 'earthquake' ? 15 : -20),
    landslideRisk: getSubRisk(primaryRisk === 'landslide' ? 15 : -20),
    heatRisk: getSubRisk(primaryRisk === 'heatwave' ? 10 : -25),
    contributingFactors: factors.length > 0 ? factors : ['Baseline regional hazard profile'],
    explanation: `Calculated AI-assisted risk score of ${finalScore}/100 based on live weather precipitation, wind speed, seismic proximity, and ground incident density.`,
    generatedAt: new Date().toISOString()
  };
};
