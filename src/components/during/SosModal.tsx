import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { HelpCategory, UrgencyLevel } from '../../types';
import { AlertTriangle, Locate, Camera, Users, Phone, X, ShieldAlert } from 'lucide-react';

export const SosModal: React.FC = () => {
  const { isSosModalOpen, setIsSosModalOpen, addHelpRequest, selectedLocation, userCoords, detectUserLocation } =
    useApp();

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [category, setCategory] = useState<HelpCategory>('Trapped');
  const [urgency, setUrgency] = useState<UrgencyLevel>('CRITICAL');
  const [peopleCount, setPeopleCount] = useState(2);
  const [note, setNote] = useState('');
  const [locationName, setLocationName] = useState(
    `${selectedLocation.district}, ${selectedLocation.state}`
  );
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);

  if (!isSosModalOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !phone || !note) return;

    const coords: [number, number] = userCoords || selectedLocation.coordinates;

    addHelpRequest({
      name,
      phone,
      coordinates: coords,
      locationName: locationName || `${selectedLocation.district}, ${selectedLocation.state}`,
      category,
      urgency,
      peopleCount,
      note,
      photoUrl: photoPreview || undefined
    });

    setIsSosModalOpen(false);
  };

  const handleSimulatePhoto = () => {
    setPhotoPreview('https://images.unsplash.com/photo-1547683905-f686c993aae5?w=500&auto=format&fit=crop&q=60');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white max-w-lg w-full rounded-2xl border border-rose-200 shadow-2xl p-6 space-y-5 relative max-h-[90vh] overflow-y-auto">
        {/* Close Button */}
        <button
          onClick={() => setIsSosModalOpen(false)}
          className="absolute top-4 right-4 p-1.5 rounded-lg bg-slate-100 text-slate-500 hover:text-slate-900 transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Title Header */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-rose-100 border border-rose-200 text-rose-600 flex items-center justify-center shrink-0 sos-pulse-ring">
            <AlertTriangle className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <h3 className="text-xl font-black font-heading text-slate-900">Emergency SOS Help Signal</h3>
            <p className="text-xs text-rose-700 font-semibold">
              Broadcast immediate request to NDRF, SDMA & Local First Responders
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Category & Urgency Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-slate-700">Help Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as HelpCategory)}
                className="w-full mt-1 px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-medium focus:border-rose-500 focus:outline-none"
              >
                <option value="Trapped">🌊 Trapped in Water / Debris</option>
                <option value="Medical">🚑 Medical Emergency</option>
                <option value="Food & Water">🍲 Food & Water Supply Needed</option>
                <option value="Evacuation">🚤 Immediate Evacuation</option>
                <option value="Elderly / Child Assistance">👶 Child / Elderly Critical Need</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700">Urgency Level</label>
              <select
                value={urgency}
                onChange={(e) => setUrgency(e.target.value as UrgencyLevel)}
                className="w-full mt-1 px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-bold focus:border-rose-500 focus:outline-none"
              >
                <option value="CRITICAL">🔴 CRITICAL (Life Threatening)</option>
                <option value="HIGH">🟠 HIGH (Urgent Within 2-4 Hours)</option>
                <option value="MEDIUM">🟡 MEDIUM (Moderate Relief Need)</option>
              </select>
            </div>
          </div>

          {/* Name & Phone */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-slate-700">Your Full Name</label>
              <input
                type="text"
                placeholder="e.g. Arjun Sharma"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full mt-1 px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:border-rose-500 focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700">Contact Phone Number</label>
              <input
                type="tel"
                placeholder="+91 98765 43210"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full mt-1 px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-mono focus:border-rose-500 focus:outline-none"
                required
              />
            </div>
          </div>

          {/* Location & GPS Lock */}
          <div>
            <div className="flex items-center justify-between text-xs font-bold text-slate-700 mb-1">
              <span>Location Landmark / Address</span>
              <button
                type="button"
                onClick={detectUserLocation}
                className="text-rose-600 hover:text-rose-700 flex items-center gap-1 font-semibold text-[11px]"
              >
                <Locate className="w-3 h-3" />
                <span>Update GPS Pin</span>
              </button>
            </div>
            <input
              type="text"
              placeholder="e.g. Near Big Bazaar, Ward 14, Silchar"
              value={locationName}
              onChange={(e) => setLocationName(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:border-rose-500 focus:outline-none"
              required
            />
          </div>

          {/* People Count & Situation Note */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="text-xs font-bold text-slate-700">People Impacted</label>
              <input
                type="number"
                min={1}
                max={50}
                value={peopleCount}
                onChange={(e) => setPeopleCount(Number(e.target.value))}
                className="w-full mt-1 px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-mono text-center focus:border-rose-500 focus:outline-none"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="text-xs font-bold text-slate-700">Situation Brief / Details</label>
              <input
                type="text"
                placeholder="e.g. Water reached ceiling level. 2 infants inside."
                value={note}
                onChange={(e) => setNote(e.target.value)}
                className="w-full mt-1 px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:border-rose-500 focus:outline-none"
                required
              />
            </div>
          </div>

          {/* Photo Simulation */}
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-700">Ground Situation Photo (Optional)</label>
              <button
                type="button"
                onClick={handleSimulatePhoto}
                className="text-[11px] text-amber-700 hover:text-amber-800 font-bold flex items-center gap-1"
              >
                <Camera className="w-3 h-3" />
                <span>Simulate Camera Photo</span>
              </button>
            </div>
            {photoPreview && (
              <div className="relative rounded-xl overflow-hidden h-28 border border-slate-200 mt-1">
                <img src={photoPreview} alt="Situation preview" className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={() => setPhotoPreview(null)}
                  className="absolute top-2 right-2 bg-slate-900/80 text-white text-xs px-2 py-0.5 rounded"
                >
                  Remove
                </button>
              </div>
            )}
          </div>

          {/* Broadcast Action Button */}
          <button
            type="submit"
            className="w-full py-3 rounded-xl bg-gradient-to-r from-rose-600 to-red-600 text-white font-extrabold text-xs shadow-md shadow-rose-600/30 hover:brightness-110 transition flex items-center justify-center gap-2 sos-pulse-ring"
          >
            <ShieldAlert className="w-4 h-4" />
            <span>TRANSMIT SOS SIGNAL TO MAP</span>
          </button>
        </form>
      </div>
    </div>
  );
};
