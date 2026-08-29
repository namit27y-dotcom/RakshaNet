import { DistrictZone } from '../types';

export const INDIAN_DISTRICT_ZONES: DistrictZone[] = [
  {
    id: 'dist-1',
    district: 'Puri',
    state: 'Odisha',
    coordinates: [19.8135, 85.8312],
    riskLevel: 'CRITICAL',
    primaryRisk: 'cyclone',
    secondaryRisks: ['flood'],
    populationExposed: '1.7 Million',
    advisoryText: 'High vulnerability to Category 4+ Bay of Bengal Tropical Cyclones & storm surges up to 4m.',
    historicalNote: 'Impacted by Cyclone Fani (2019) & Cyclone Phailin (2013).'
  },
  {
    id: 'dist-2',
    district: 'Cachar (Silchar)',
    state: 'Assam',
    coordinates: [24.8333, 92.7789],
    riskLevel: 'CRITICAL',
    primaryRisk: 'flood',
    secondaryRisks: ['landslide', 'earthquake'],
    populationExposed: '2.4 Million',
    advisoryText: 'Barak Valley severe riverine flooding zone. Annual waterlogging & embankment threat.',
    historicalNote: 'Major inundation in 2022 affecting 80% of Silchar township.'
  },
  {
    id: 'dist-3',
    district: 'Wayanad',
    state: 'Kerala',
    coordinates: [11.6854, 76.132],
    riskLevel: 'CRITICAL',
    primaryRisk: 'landslide',
    secondaryRisks: ['flood'],
    populationExposed: '817,000',
    advisoryText: 'Fragile Western Ghats eco-zone with high risk of catastrophic cloudburst landslides.',
    historicalNote: 'Devastating Chooralmala & Mundakkai landslide event (2024).'
  },
  {
    id: 'dist-4',
    district: 'Chennai',
    state: 'Tamil Nadu',
    coordinates: [13.0827, 80.2707],
    riskLevel: 'HIGH',
    primaryRisk: 'flood',
    secondaryRisks: ['cyclone', 'heatwave'],
    populationExposed: '11.5 Million',
    advisoryText: 'Urban flooding vulnerability due to North-East monsoon intense rain spells.',
    historicalNote: 'Severe urban deluge in Nov 2015 & Cyclone Michaung 2023.'
  },
  {
    id: 'dist-5',
    district: 'Chamoli',
    state: 'Uttarakhand',
    coordinates: [30.4042, 79.3308],
    riskLevel: 'CRITICAL',
    primaryRisk: 'earthquake',
    secondaryRisks: ['landslide', 'flood'],
    populationExposed: '391,000',
    advisoryText: 'Seismic Zone V (Highest hazard). High flash flood & glacial lake outburst hazard.',
    historicalNote: '1999 Chamoli quake & 2021 Rishi Ganga flash floods.'
  },
  {
    id: 'dist-6',
    district: 'Barmer',
    state: 'Rajasthan',
    coordinates: [25.7532, 71.4181],
    riskLevel: 'HIGH',
    primaryRisk: 'heatwave',
    secondaryRisks: ['flood'],
    populationExposed: '2.6 Million',
    advisoryText: 'Extreme Thar summer temperatures reaching >49°C. Flash flood vulnerability.',
    historicalNote: 'Severe heatwaves annual peak May-June.'
  },
  {
    id: 'dist-7',
    district: 'Kutch',
    state: 'Gujarat',
    coordinates: [23.242, 69.6669],
    riskLevel: 'CRITICAL',
    primaryRisk: 'earthquake',
    secondaryRisks: ['cyclone'],
    populationExposed: '2.1 Million',
    advisoryText: 'Seismic Zone V active fault lines. Coastal storm surge vulnerability.',
    historicalNote: 'Historic 2001 Bhuj Earthquake (M7.7).'
  },
  {
    id: 'dist-8',
    district: 'Patna',
    state: 'Bihar',
    coordinates: [25.5941, 85.1376],
    riskLevel: 'HIGH',
    primaryRisk: 'flood',
    secondaryRisks: ['heatwave'],
    populationExposed: '5.8 Million',
    advisoryText: 'Ganga river basin flooding during South-West monsoon peak discharge.',
    historicalNote: '2019 Bihar urban inundation crisis.'
  },
  {
    id: 'dist-9',
    district: 'Shimla',
    state: 'Himachal Pradesh',
    coordinates: [31.1048, 77.1734],
    riskLevel: 'HIGH',
    primaryRisk: 'landslide',
    secondaryRisks: ['earthquake', 'flood'],
    populationExposed: '814,000',
    advisoryText: 'Himalayan slope instability, flash floods during intense monsoon downpours.',
    historicalNote: '2023 Monsoon landslides & road connectivity cutoffs.'
  },
  {
    id: 'dist-10',
    district: 'Mumbai',
    state: 'Maharashtra',
    coordinates: [19.076, 72.8777],
    riskLevel: 'HIGH',
    primaryRisk: 'flood',
    secondaryRisks: ['cyclone'],
    populationExposed: '21.3 Million',
    advisoryText: 'High tidal surge flooding combined with high-intensity urban rainfall spells.',
    historicalNote: 'Historic July 26, 2005 deluge & Cyclone Nisarga 2020 warning.'
  }
];
