import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { CheckCircle2, Locate, X, ShieldCheck } from 'lucide-react';

export const SafeModal: React.FC = () => {
  const { isSafeModalOpen, setIsSafeModalOpen, addSafeCheckin, selectedLocation, userCoords, detectUserLocation } =
    useApp();

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState('Evacuated safely with my family. All good!');
  const [locationName, setLocationName] = useState(
    `${selectedLocation.district}, ${selectedLocation.state}`
  );

  if (!isSafeModalOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !phone) return;

    const coords: [number, number] = userCoords || selectedLocation.coordinates;

    addSafeCheckin({
      name,
      phone,
      coordinates: coords,
      locationName: locationName || `${selectedLocation.district}, ${selectedLocation.state}`,
      message
    });

    setIsSafeModalOpen(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white max-w-md w-full rounded-2xl border border-emerald-200 shadow-2xl p-6 space-y-4 relative">
        <button
          onClick={() => setIsSafeModalOpen(false)}
          className="absolute top-4 right-4 p-1.5 rounded-lg bg-slate-100 text-slate-500 hover:text-slate-900 transition"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-100 border border-emerald-200 text-emerald-700 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-xl font-black font-heading text-slate-900">"I'm Safe" Status Check-In</h3>
            <p className="text-xs text-emerald-700 font-semibold">
              Broadcast green pin to reassure relatives & disaster response teams
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="text-xs font-bold text-slate-700">Your Full Name</label>
            <input
              type="text"
              placeholder="e.g. Siddharth Nair"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full mt-1 px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:border-emerald-500 focus:outline-none"
              required
            />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700">Phone Number</label>
            <input
              type="tel"
              placeholder="+91 98765 43210"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full mt-1 px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-mono focus:border-emerald-500 focus:outline-none"
              required
            />
          </div>

          <div>
            <div className="flex items-center justify-between text-xs font-bold text-slate-700 mb-1">
              <span>Current Safe Location</span>
              <button
                type="button"
                onClick={detectUserLocation}
                className="text-emerald-700 hover:text-emerald-800 flex items-center gap-1 font-semibold text-[11px]"
              >
                <Locate className="w-3 h-3" />
                <span>GPS Location</span>
              </button>
            </div>
            <input
              type="text"
              placeholder="e.g. Govt Relief Camp #2, Silchar"
              value={locationName}
              onChange={(e) => setLocationName(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:border-emerald-500 focus:outline-none"
              required
            />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700">Message / Note</label>
            <input
              type="text"
              placeholder="e.g. We have food & clean water here."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full mt-1 px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:border-emerald-500 focus:outline-none"
            />
          </div>

          <button
            type="submit"
            className="w-full py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-bold text-xs shadow-md hover:brightness-110 transition flex items-center justify-center gap-2"
          >
            <ShieldCheck className="w-4 h-4" />
            <span>POST SAFE STATUS TO LIVE MAP</span>
          </button>
        </form>
      </div>
    </div>
  );
};
