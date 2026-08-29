import { USGSQuake } from '../types';

export const FALLBACK_QUAKES: USGSQuake[] = [
  {
    id: 'usgs-q1',
    magnitude: 5.4,
    place: ' Hindukush Region, Afghanistan-India Border',
    time: Date.now() - 1000 * 60 * 45, // 45m ago
    coordinates: [36.42, 70.91],
    depthKm: 190,
    tsunami: 0,
    url: 'https://earthquake.usgs.gov'
  },
  {
    id: 'usgs-q2',
    magnitude: 4.8,
    place: ' 42km ESE of Gangtok, Sikkim, India',
    time: Date.now() - 1000 * 60 * 180, // 3h ago
    coordinates: [27.28, 88.94],
    depthKm: 10,
    tsunami: 0,
    url: 'https://earthquake.usgs.gov'
  },
  {
    id: 'usgs-q3',
    magnitude: 6.1,
    place: ' Nicobar Islands Region, India',
    time: Date.now() - 1000 * 60 * 360, // 6h ago
    coordinates: [7.52, 93.88],
    depthKm: 33,
    tsunami: 1,
    url: 'https://earthquake.usgs.gov'
  },
  {
    id: 'usgs-q4',
    magnitude: 4.2,
    place: ' 18km NW of Chamoli, Uttarakhand, India',
    time: Date.now() - 1000 * 60 * 520, // 8.6h ago
    coordinates: [30.48, 79.22],
    depthKm: 12,
    tsunami: 0,
    url: 'https://earthquake.usgs.gov'
  }
];

export async function fetchLiveUSGSQuakes(): Promise<USGSQuake[]> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000); // 4s timeout

    // Query USGS GeoJSON for M2.5+ events globally in past 24 hours
    const res = await fetch(
      'https://earthquake.usgs.gov/fdsnws/event/1/query?format=geojson&minmagnitude=2.5&limit=25',
      { signal: controller.signal }
    );
    clearTimeout(timeoutId);

    if (!res.ok) throw new Error('USGS fetch non-200 status');
    const data = await res.json();

    if (!data.features || !Array.isArray(data.features)) {
      return FALLBACK_QUAKES;
    }

    const quakes: USGSQuake[] = data.features.map((item: any) => ({
      id: item.id,
      magnitude: item.properties.mag,
      place: item.properties.place || 'Unknown Location',
      time: item.properties.time,
      // GeoJSON geometry: [longitude, latitude, depth]
      coordinates: [item.geometry.coordinates[1], item.geometry.coordinates[0]],
      depthKm: item.geometry.coordinates[2],
      tsunami: item.properties.tsunami || 0,
      url: item.properties.url
    }));

    return quakes.length > 0 ? quakes : FALLBACK_QUAKES;
  } catch (err) {
    console.warn('Live USGS feed unavailable, switching to cached seismic data:', err);
    return FALLBACK_QUAKES;
  }
}
