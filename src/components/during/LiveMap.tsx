import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { useApp } from '../../context/AppContext';
import { HelpRequest, SafeCheckin, Shelter, USGSQuake } from '../../types';
import {
  Layers,
  Filter,
  Maximize2,
  Locate,
  AlertTriangle,
  CheckCircle2,
  Home,
  Activity,
  Phone,
  Clock,
  User,
  Compass
} from 'lucide-react';

export const LiveMap: React.FC = () => {
  const {
    selectedLocation,
    helpRequests,
    safeCheckins,
    shelters,
    usgsQuakes,
    userCoords,
    detectUserLocation,
    filterDisasterType,
    setFilterDisasterType,
    filterUrgency,
    setFilterUrgency,
    filterCategory,
    setFilterCategory,
    updateHelpStatus,
    setIsSosModalOpen
  } = useApp();

  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersGroupRef = useRef<L.LayerGroup | null>(null);

  const googleApiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || 'AIzaSyBbS8AIl6V4uK4wPU6s3RHOv8UKAVaWkII';
  const [activeTile, setActiveTile] = useState<'google-roadmap' | 'google-satellite' | 'google-terrain' | 'voyager'>('google-satellite');
  const [showSosLayer, setShowSosLayer] = useState(true);
  const [showSafeLayer, setShowSafeLayer] = useState(true);
  const [showShelterLayer, setShowShelterLayer] = useState(true);
  const [showQuakeLayer, setShowQuakeLayer] = useState(true);

  // Selected Pin for Popup Drawer
  const [selectedPinData, setSelectedPinData] = useState<
    | { type: 'sos'; data: HelpRequest }
    | { type: 'safe'; data: SafeCheckin }
    | { type: 'shelter'; data: Shelter }
    | { type: 'quake'; data: USGSQuake }
    | null
  >(null);

  // Filter logic
  const filteredSos = helpRequests.filter((r) => {
    if (filterUrgency !== 'all' && r.urgency !== filterUrgency) return false;
    if (filterCategory !== 'all' && r.category !== filterCategory) return false;
    return true;
  });

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      // Create map instance
      const map = L.map(mapContainerRef.current, {
        center: selectedLocation.coordinates,
        zoom: 11,
        zoomControl: false
      });

      L.control.zoom({ position: 'bottomright' }).addTo(map);

      // CartoDB Voyager Light tile layer
      L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; <a href="https://carto.com/">CARTO</a> & OpenStreetMap',
        maxZoom: 19
      }).addTo(map);

      const layerGroup = L.layerGroup().addTo(map);
      markersGroupRef.current = layerGroup;
      mapInstanceRef.current = map;
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Update Tile Layer
  useEffect(() => {
    if (!mapInstanceRef.current) return;
    const map = mapInstanceRef.current;

    // Remove existing tile layers
    map.eachLayer((layer) => {
      if (layer instanceof L.TileLayer) {
        map.removeLayer(layer);
      }
    });

    let tileUrl = 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png';
    let subdomains: string | string[] = 'abc';

    if (activeTile === 'google-satellite') {
      tileUrl = `https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}&key=${googleApiKey}`;
      subdomains = [];
    } else if (activeTile === 'google-roadmap') {
      tileUrl = `https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}&key=${googleApiKey}`;
      subdomains = [];
    } else if (activeTile === 'google-terrain') {
      tileUrl = `https://mt1.google.com/vt/lyrs=p&x={x}&y={y}&z={z}&key=${googleApiKey}`;
      subdomains = [];
    }

    L.tileLayer(tileUrl, { maxZoom: 20, subdomains }).addTo(map);
  }, [activeTile, googleApiKey]);

  // Recenter map when selectedLocation changes
  useEffect(() => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.flyTo(selectedLocation.coordinates, 11, { duration: 1.2 });
    }
  }, [selectedLocation]);

  // Render Markers
  useEffect(() => {
    if (!mapInstanceRef.current || !markersGroupRef.current) return;
    const layerGroup = markersGroupRef.current;
    layerGroup.clearLayers();

    // 1. Render SOS Help Markers (Pulsing Red)
    if (showSosLayer) {
      filteredSos.forEach((sos) => {
        const iconHtml = `
          <div class="custom-leaflet-marker marker-sos w-9 h-9 ${
            sos.urgency === 'CRITICAL' ? 'sos-pulse-ring' : ''
          }">
            <span class="text-xs font-extrabold font-mono">SOS</span>
          </div>
        `;
        const customIcon = L.divIcon({
          html: iconHtml,
          className: 'bg-transparent',
          iconSize: [36, 36],
          iconAnchor: [18, 18]
        });

        const marker = L.marker(sos.coordinates, { icon: customIcon });
        marker.on('click', () => {
          setSelectedPinData({ type: 'sos', data: sos });
        });
        layerGroup.addLayer(marker);
      });
    }

    // 2. Render Safe Checkin Markers (Green)
    if (showSafeLayer) {
      safeCheckins.forEach((chk) => {
        const iconHtml = `
          <div class="custom-leaflet-marker marker-safe w-7 h-7">
            <span class="text-[10px] font-bold">✓</span>
          </div>
        `;
        const customIcon = L.divIcon({
          html: iconHtml,
          className: 'bg-transparent',
          iconSize: [28, 28],
          iconAnchor: [14, 14]
        });

        const marker = L.marker(chk.coordinates, { icon: customIcon });
        marker.on('click', () => {
          setSelectedPinData({ type: 'safe', data: chk });
        });
        layerGroup.addLayer(marker);
      });
    }

    // 3. Render Shelter Markers (Blue)
    if (showShelterLayer) {
      shelters.forEach((sh) => {
        const iconHtml = `
          <div class="custom-leaflet-marker marker-shelter w-8 h-8">
            <span class="text-[10px] font-extrabold">⛺</span>
          </div>
        `;
        const customIcon = L.divIcon({
          html: iconHtml,
          className: 'bg-transparent',
          iconSize: [32, 32],
          iconAnchor: [16, 16]
        });

        const marker = L.marker(sh.coordinates, { icon: customIcon });
        marker.on('click', () => {
          setSelectedPinData({ type: 'shelter', data: sh });
        });
        layerGroup.addLayer(marker);
      });
    }

    // 4. Render Live USGS Quake Markers (Orange)
    if (showQuakeLayer) {
      usgsQuakes.forEach((q) => {
        const iconHtml = `
          <div class="custom-leaflet-marker marker-quake w-9 h-9">
            <span class="text-[10px] font-black">M${q.magnitude.toFixed(1)}</span>
          </div>
        `;
        const customIcon = L.divIcon({
          html: iconHtml,
          className: 'bg-transparent',
          iconSize: [36, 36],
          iconAnchor: [18, 18]
        });

        const marker = L.marker(q.coordinates, { icon: customIcon });
        marker.on('click', () => {
          setSelectedPinData({ type: 'quake', data: q });
        });
        layerGroup.addLayer(marker);
      });
    }

    // 5. User GPS Pin
    if (userCoords) {
      const userIcon = L.divIcon({
        html: `
          <div class="w-5 h-5 rounded-full bg-blue-600 border-2 border-white shadow-lg animate-pulse"></div>
        `,
        className: 'bg-transparent',
        iconSize: [20, 20],
        iconAnchor: [10, 10]
      });
      const userMarker = L.marker(userCoords, { icon: userIcon });
      layerGroup.addLayer(userMarker);
    }
  }, [
    filteredSos,
    safeCheckins,
    shelters,
    usgsQuakes,
    userCoords,
    showSosLayer,
    showSafeLayer,
    showShelterLayer,
    showQuakeLayer
  ]);

  return (
    <div className="relative w-full h-[650px] rounded-2xl overflow-hidden border border-slate-200 shadow-lg glass-panel">
      {/* The Leaflet Map Container */}
      <div ref={mapContainerRef} className="w-full h-full z-0" />

      {/* Top Floating Control Bar & Layer Filters */}
      <div className="absolute top-4 left-4 right-4 z-10 flex flex-wrap items-center justify-between gap-3 pointer-events-none">
        {/* Layer Toggles */}
        <div className="flex flex-wrap items-center gap-1.5 p-1.5 rounded-xl bg-white/95 border border-slate-200 shadow-md backdrop-blur-md pointer-events-auto">
          <button
            onClick={() => setShowSosLayer(!showSosLayer)}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold transition ${
              showSosLayer
                ? 'bg-rose-600 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>SOS Signals ({filteredSos.length})</span>
          </button>

          <button
            onClick={() => setShowSafeLayer(!showSafeLayer)}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold transition ${
              showSafeLayer
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Safe ({safeCheckins.length})</span>
          </button>

          <button
            onClick={() => setShowShelterLayer(!showShelterLayer)}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold transition ${
              showShelterLayer
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Home className="w-3.5 h-3.5" />
            <span>Shelters ({shelters.length})</span>
          </button>

          <button
            onClick={() => setShowQuakeLayer(!showQuakeLayer)}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold transition ${
              showQuakeLayer
                ? 'bg-amber-500 text-slate-950 shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            <span>USGS Quakes ({usgsQuakes.length})</span>
          </button>
        </div>

        {/* Map View Mode Switcher */}
        <div className="flex items-center gap-1 p-1 rounded-xl bg-white/95 border border-slate-200 shadow-md backdrop-blur-md pointer-events-auto">
          <button
            onClick={() => setActiveTile('google-satellite')}
            className={`px-2.5 py-1 rounded-lg text-xs font-bold transition ${
              activeTile === 'google-satellite' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Google Hybrid
          </button>
          <button
            onClick={() => setActiveTile('google-roadmap')}
            className={`px-2.5 py-1 rounded-lg text-xs font-bold transition ${
              activeTile === 'google-roadmap' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Google Map
          </button>
          <button
            onClick={() => setActiveTile('google-terrain')}
            className={`px-2.5 py-1 rounded-lg text-xs font-bold transition ${
              activeTile === 'google-terrain' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Terrain
          </button>
          <button
            onClick={() => setActiveTile('voyager')}
            className={`px-2.5 py-1 rounded-lg text-xs font-bold transition ${
              activeTile === 'voyager' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Light
          </button>
        </div>
      </div>

      {/* Bottom Floating Trigger SOS bar */}
      <div className="absolute bottom-4 left-4 z-10 pointer-events-auto">
        <button
          onClick={() => setIsSosModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-rose-600 to-red-600 text-white font-extrabold text-xs shadow-xl shadow-rose-600/30 hover:brightness-110 transition sos-pulse-ring"
        >
          <AlertTriangle className="w-4 h-4 animate-bounce" />
          <span>BROADCAST SOS HELP SIGNAL</span>
        </button>
      </div>

      {/* Selected Marker Detail Slide-up Card */}
      {selectedPinData && (
        <div className="absolute bottom-4 right-4 max-w-sm w-full z-20 bg-white p-5 rounded-2xl border border-slate-200 shadow-2xl space-y-3 animate-in fade-in slide-in-from-bottom-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <span className="text-xs font-black tracking-wider uppercase font-heading text-slate-800">
              {selectedPinData.type === 'sos' && '🚨 Emergency SOS Signal'}
              {selectedPinData.type === 'safe' && '✅ Safe Check-In'}
              {selectedPinData.type === 'shelter' && '⛺ Relief Shelter'}
              {selectedPinData.type === 'quake' && '🌋 USGS Seismic Alert'}
            </span>
            <button
              onClick={() => setSelectedPinData(null)}
              className="text-slate-400 hover:text-slate-800 text-xs font-bold px-1.5 py-0.5 rounded bg-slate-100"
            >
              ✕
            </button>
          </div>

          {/* SOS Pin Detail */}
          {selectedPinData.type === 'sos' && (
            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-900 text-sm">{selectedPinData.data.name}</span>
                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-extrabold ${
                    selectedPinData.data.urgency === 'CRITICAL'
                      ? 'bg-rose-600 text-white'
                      : 'bg-amber-500 text-slate-950'
                  }`}
                >
                  {selectedPinData.data.urgency}
                </span>
              </div>
              <div className="text-slate-600 flex items-center gap-1">
                <Compass className="w-3.5 h-3.5 text-rose-600" />
                <span>{selectedPinData.data.locationName}</span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 italic">
                "{selectedPinData.data.note}"
              </div>
              <div className="flex items-center justify-between text-slate-600 font-mono text-[11px] pt-1">
                <span>People Impacted: {selectedPinData.data.peopleCount}</span>
                <span>Category: {selectedPinData.data.category}</span>
              </div>
              <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
                <a
                  href={`tel:${selectedPinData.data.phone}`}
                  className="flex-1 text-center py-2 rounded-xl bg-emerald-50 text-emerald-700 font-bold border border-emerald-200 hover:bg-emerald-100 transition flex items-center justify-center gap-1.5"
                >
                  <Phone className="w-3.5 h-3.5" />
                  <span>Call {selectedPinData.data.phone}</span>
                </a>
                <button
                  onClick={() => {
                    updateHelpStatus(selectedPinData.data.id, 'DISPATCHED');
                    setSelectedPinData(null);
                  }}
                  className="px-3 py-2 rounded-xl bg-rose-600 text-white font-bold hover:bg-rose-700 transition"
                >
                  Dispatch Rescue
                </button>
              </div>
            </div>
          )}

          {/* Safe Pin Detail */}
          {selectedPinData.type === 'safe' && (
            <div className="space-y-2 text-xs">
              <div className="font-bold text-slate-900 text-sm">{selectedPinData.data.name}</div>
              <div className="text-slate-600 flex items-center gap-1">
                <Compass className="w-3.5 h-3.5 text-emerald-600" />
                <span>{selectedPinData.data.locationName}</span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-800">
                "{selectedPinData.data.message}"
              </div>
              <div className="text-[10px] text-slate-500 font-mono">{selectedPinData.data.timestamp}</div>
            </div>
          )}

          {/* Shelter Pin Detail */}
          {selectedPinData.type === 'shelter' && (
            <div className="space-y-2 text-xs">
              <div className="font-bold text-slate-900 text-sm">{selectedPinData.data.name}</div>
              <div className="text-slate-600">{selectedPinData.data.locationName}</div>

              <div className="space-y-1">
                <div className="flex justify-between text-[11px] font-semibold text-slate-700">
                  <span>Occupancy Capacity</span>
                  <span>
                    {selectedPinData.data.currentOccupancy} / {selectedPinData.data.capacity} Bed Units
                  </span>
                </div>
                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-600 rounded-full"
                    style={{
                      width: `${Math.round(
                        (selectedPinData.data.currentOccupancy / selectedPinData.data.capacity) * 100
                      )}%`
                    }}
                  ></div>
                </div>
              </div>

              <div className="flex flex-wrap gap-1 pt-1">
                {selectedPinData.data.facilities.map((fac) => (
                  <span key={fac} className="px-2 py-0.5 rounded text-[10px] bg-slate-100 text-slate-700">
                    ✓ {fac}
                  </span>
                ))}
              </div>
              <a
                href={`tel:${selectedPinData.data.phone}`}
                className="block text-center py-2 mt-2 rounded-xl bg-blue-50 text-blue-700 font-bold border border-blue-200 hover:bg-blue-100 transition"
              >
                Contact Shelter: {selectedPinData.data.phone}
              </a>
            </div>
          )}

          {/* Quake Pin Detail */}
          {selectedPinData.type === 'quake' && (
            <div className="space-y-2 text-xs">
              <div className="font-bold text-amber-700 text-sm">Magnitude {selectedPinData.data.magnitude} Quake</div>
              <div className="text-slate-800">{selectedPinData.data.place}</div>
              <div className="text-slate-600 font-mono text-[11px]">
                Depth: {selectedPinData.data.depthKm} km | Tsunami Warning: {selectedPinData.data.tsunami ? 'YES' : 'NO'}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
