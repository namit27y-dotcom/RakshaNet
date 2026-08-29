import React from 'react';
import { useApp } from '../../context/AppContext';
import { HelpRequest, SafeCheckin, Shelter, USGSQuake } from '../../types';
import {
  Activity,
  AlertTriangle,
  CheckCircle2,
  Home,
  PhoneCall,
  Clock,
  MapPin,
  Flame,
  Search,
  Filter
} from 'lucide-react';

export const LiveFeed: React.FC = () => {
  const {
    helpRequests,
    safeCheckins,
    shelters,
    usgsQuakes,
    filterUrgency,
    setFilterUrgency,
    filterCategory,
    setFilterCategory,
    updateHelpStatus,
    setSelectedLocation,
    allDistricts
  } = useApp();

  // Combine stream items chronologically
  const items = [
    ...helpRequests.map((r) => ({ type: 'sos' as const, data: r, time: r.timestamp })),
    ...safeCheckins.map((s) => ({ type: 'safe' as const, data: s, time: s.timestamp })),
    ...usgsQuakes.map((q) => ({ type: 'quake' as const, data: q, time: `${Math.round((Date.now() - q.time) / 60000)}m ago` }))
  ];

  return (
    <div className="glass-panel p-5 rounded-2xl border border-slate-200 space-y-4 h-[650px] flex flex-col bg-white">
      {/* Feed Title & Live Pulse */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <div className="flex items-center gap-2">
          <Activity className="w-5 h-5 text-rose-600 animate-pulse" />
          <h3 className="text-base font-bold font-heading text-slate-900">Live Ground Feed</h3>
        </div>
        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-100 text-rose-700 border border-rose-200 flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-rose-600 live-dot-glow"></span>
          REAL-TIME STREAM
        </span>
      </div>

      {/* Quick Filters Bar */}
      <div className="grid grid-cols-2 gap-2 text-xs">
        <div>
          <select
            value={filterUrgency}
            onChange={(e) => setFilterUrgency(e.target.value)}
            className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-xs focus:outline-none"
          >
            <option value="all">⚡ All Urgencies</option>
            <option value="CRITICAL">🔴 Critical Only</option>
            <option value="HIGH">🟠 High Only</option>
            <option value="MEDIUM">🟡 Medium Only</option>
          </select>
        </div>

        <div>
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-xs focus:outline-none"
          >
            <option value="all">🏷️ All Categories</option>
            <option value="Trapped">🌊 Trapped</option>
            <option value="Medical">🚑 Medical</option>
            <option value="Food & Water">🍲 Food & Water</option>
            <option value="Evacuation">🚤 Evacuation</option>
          </select>
        </div>
      </div>

      {/* Stream Items List */}
      <div className="flex-1 overflow-y-auto space-y-3 pr-1">
        {items.map((item, index) => {
          if (item.type === 'sos') {
            const sos = item.data as HelpRequest;
            return (
              <div
                key={sos.id}
                className="p-3.5 rounded-xl bg-slate-50 border border-rose-200 space-y-2 hover:border-rose-400 transition group shadow-sm"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-1.5">
                    <span className="p-1 rounded bg-rose-100 text-rose-600">
                      <AlertTriangle className="w-3.5 h-3.5" />
                    </span>
                    <span className="font-bold text-slate-900 text-xs">{sos.name}</span>
                    <span className="text-[10px] text-slate-400 font-mono">#{sos.id.slice(-4)}</span>
                  </div>

                  <span
                    className={`text-[9px] font-extrabold px-1.5 py-0.5 rounded uppercase ${
                      sos.urgency === 'CRITICAL'
                        ? 'bg-rose-600 text-white animate-pulse'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {sos.urgency}
                  </span>
                </div>

                <p className="text-xs text-slate-700 italic font-medium">"{sos.note}"</p>

                <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1 border-t border-slate-200/80">
                  <div className="flex items-center gap-1 text-rose-700 font-semibold">
                    <MapPin className="w-3 h-3" />
                    <span className="truncate max-w-[140px]">{sos.locationName}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <a
                      href={`tel:${sos.phone}`}
                      className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold hover:bg-emerald-200"
                    >
                      Call
                    </a>
                    {sos.status === 'PENDING' ? (
                      <button
                        onClick={() => updateHelpStatus(sos.id, 'DISPATCHED')}
                        className="px-2 py-0.5 rounded bg-rose-600 text-white font-bold hover:bg-rose-700"
                      >
                        Dispatch
                      </button>
                    ) : (
                      <span className="px-2 py-0.5 rounded bg-blue-100 text-blue-800 font-bold">
                        {sos.status}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          }

          if (item.type === 'safe') {
            const safe = item.data as SafeCheckin;
            return (
              <div
                key={safe.id}
                className="p-3 rounded-xl bg-slate-50 border border-emerald-200 space-y-1 text-xs shadow-sm"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-emerald-700 font-bold">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>{safe.name}</span>
                  </div>
                  <span className="text-[10px] text-slate-400 font-mono">{safe.timestamp}</span>
                </div>
                <p className="text-slate-700">{safe.message}</p>
                <div className="text-[10px] text-slate-500">{safe.locationName}</div>
              </div>
            );
          }

          if (item.type === 'quake') {
            const quake = item.data as USGSQuake;
            return (
              <div
                key={quake.id}
                className="p-3 rounded-xl bg-amber-50 border border-amber-200 space-y-1 text-xs shadow-sm"
              >
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-amber-800">🌋 USGS Quake M{quake.magnitude.toFixed(1)}</span>
                  <span className="text-[10px] text-slate-500 font-mono">{item.time}</span>
                </div>
                <div className="text-slate-700">{quake.place}</div>
              </div>
            );
          }

          return null;
        })}
      </div>
    </div>
  );
};
