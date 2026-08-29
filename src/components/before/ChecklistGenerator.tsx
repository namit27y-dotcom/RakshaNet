import React, { useState } from 'react';
import { PREPAREDNESS_CHECKLIST_SEED } from '../../data/seedData';
import { DisasterType } from '../../types';
import {
  CheckSquare,
  Square,
  Baby,
  UserCheck,
  Dog,
  ShieldCheck,
  Sparkles,
  Printer
} from 'lucide-react';
import confetti from 'canvas-confetti';

export const ChecklistGenerator: React.FC = () => {
  const [selectedDisaster, setSelectedDisaster] = useState<DisasterType>('all');

  // Profile checkboxes
  const [includeKids, setIncludeKids] = useState(true);
  const [includeElderly, setIncludeElderly] = useState(true);
  const [includePets, setIncludePets] = useState(false);

  // Checked item IDs
  const [checkedIds, setCheckedIds] = useState<Record<string, boolean>>({
    'ck-1': true,
    'ck-6': true,
    'ck-9': true
  });

  // Filter items
  const filteredItems = PREPAREDNESS_CHECKLIST_SEED.filter((item) => {
    const matchesDisaster =
      selectedDisaster === 'all' || item.disasters.includes('all') || item.disasters.includes(selectedDisaster);

    const matchesProfile = item.forProfiles.some((p) => {
      if (p === 'general') return true;
      if (p === 'kids' && includeKids) return true;
      if (p === 'elderly' && includeElderly) return true;
      if (p === 'pets' && includePets) return true;
      return false;
    });

    return matchesDisaster && matchesProfile;
  });

  const totalCount = filteredItems.length;
  const completedCount = filteredItems.filter((i) => checkedIds[i.id]).length;
  const progressPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  const toggleCheck = (id: string) => {
    const next = !checkedIds[id];
    setCheckedIds((prev) => {
      const updated = { ...prev, [id]: next };
      const newCompleted = filteredItems.filter((i) => updated[i.id]).length;
      if (newCompleted === totalCount && totalCount > 0) {
        confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
      }
      return updated;
    });
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-200 bg-white space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Sparkles className="w-4 h-4 text-amber-600" />
              <span className="text-xs font-bold text-amber-700 uppercase">FR1.2 Dynamic Plan Engine</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-bold font-heading text-slate-900">
              72-Hour "Go-Bag" & Emergency Survival Kit
            </h3>
            <p className="text-xs text-slate-600 mt-0.5">
              Personalized preparedness checklist tailored to your specific household composition and primary local disaster risk.
            </p>
          </div>

          <button
            onClick={handlePrint}
            className="flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200 text-xs font-bold transition shrink-0"
          >
            <Printer className="w-4 h-4" />
            <span>Print / Save Checklist</span>
          </button>
        </div>

        {/* Configuration Controls */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-slate-100">
          {/* Disaster Type Filter */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700">Primary Disaster Focus:</label>
            <select
              value={selectedDisaster}
              onChange={(e) => setSelectedDisaster(e.target.value as DisasterType)}
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-medium focus:border-amber-500 focus:outline-none"
            >
              <option value="all">⚡ All-Hazard Universal Kit</option>
              <option value="flood">🌊 Flood & Waterlogging Preparedness</option>
              <option value="cyclone">🌀 Tropical Cyclone & Storm Surge</option>
              <option value="earthquake">🏚️ Earthquake & Seismic Safety</option>
              <option value="heatwave">☀️ Extreme Heatwave Protection</option>
              <option value="landslide">⛰️ Landslide & Hillside Evacuation</option>
            </select>
          </div>

          {/* Household Profile Options */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700">Household Composition & Needs:</label>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setIncludeKids(!includeKids)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition ${
                  includeKids
                    ? 'bg-amber-100 text-amber-900 border-amber-300'
                    : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                }`}
              >
                <Baby className="w-3.5 h-3.5" />
                <span>Infants / Children</span>
              </button>

              <button
                type="button"
                onClick={() => setIncludeElderly(!includeElderly)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition ${
                  includeElderly
                    ? 'bg-amber-100 text-amber-900 border-amber-300'
                    : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                }`}
              >
                <UserCheck className="w-3.5 h-3.5" />
                <span>Elderly / Medical Needs</span>
              </button>

              <button
                type="button"
                onClick={() => setIncludePets(!includePets)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition ${
                  includePets
                    ? 'bg-amber-100 text-amber-900 border-amber-300'
                    : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                }`}
              >
                <Dog className="w-3.5 h-3.5" />
                <span>Household Pets</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Progress Bar & Readiness Score */}
      <div className="glass-panel p-5 rounded-2xl border border-slate-200 bg-white flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="w-full sm:w-2/3 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-slate-800">Go-Bag Preparedness Score</span>
            <span className="font-mono font-bold text-amber-700">{progressPercent}% Ready</span>
          </div>
          <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden border border-slate-200 p-0.5">
            <div
              className="h-full bg-gradient-to-r from-amber-500 to-emerald-600 rounded-full transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            ></div>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
          <ShieldCheck className="w-5 h-5 text-emerald-600" />
          <span>
            {completedCount} of {totalCount} Essential Supplies Verified
          </span>
        </div>
      </div>

      {/* Checklist Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredItems.map((item) => {
          const isDone = !!checkedIds[item.id];
          return (
            <div
              key={item.id}
              onClick={() => toggleCheck(item.id)}
              className={`p-4 rounded-xl border cursor-pointer transition flex items-start gap-3.5 ${
                isDone
                  ? 'bg-emerald-50 border-emerald-200 text-slate-800'
                  : 'bg-white border-slate-200 text-slate-800 hover:bg-slate-50'
              }`}
            >
              <div className="mt-0.5 shrink-0">
                {isDone ? (
                  <CheckSquare className="w-5 h-5 text-emerald-600" />
                ) : (
                  <Square className="w-5 h-5 text-slate-400" />
                )}
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className={`text-xs font-bold ${isDone ? 'line-through text-slate-400' : 'text-slate-900'}`}>
                    {item.title}
                  </span>
                  <span className="text-[9px] uppercase px-1.5 py-0.2 rounded bg-slate-100 text-slate-600 font-mono">
                    {item.category}
                  </span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">{item.description}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
