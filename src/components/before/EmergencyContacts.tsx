import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { PhoneCall, UserPlus, Trash2, ShieldAlert, Heart, Star } from 'lucide-react';

export const EmergencyContacts: React.FC = () => {
  const { emergencyContacts, addEmergencyContact, removeEmergencyContact } = useApp();

  const [name, setName] = useState('');
  const [relation, setRelation] = useState('');
  const [phone, setPhone] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !phone) return;
    addEmergencyContact({
      name,
      relationOrRole: relation || 'Personal Contact',
      phone
    });
    setName('');
    setRelation('');
    setPhone('');
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-200 bg-white space-y-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <PhoneCall className="w-4 h-4 text-blue-600" />
            <span className="text-xs font-bold text-blue-700 uppercase">FR1.4 Speed Dial Vault</span>
          </div>
          <h3 className="text-2xl font-bold font-heading text-slate-900">Emergency Contacts & SOS Speed Dial</h3>
          <p className="text-xs text-slate-600 mt-0.5">
            Store critical personal contacts locally on your device for instant offline access during connectivity outages.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Contact List */}
        <div className="md:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Saved Helplines & Contacts ({emergencyContacts.length})
            </h4>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {emergencyContacts.map((c) => (
              <div
                key={c.id}
                className="glass-panel p-4 rounded-xl border border-slate-200 bg-white flex items-center justify-between gap-3 group hover:border-slate-300 shadow-sm transition"
              >
                <div className="space-y-0.5 overflow-hidden">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold text-slate-900 truncate">{c.name}</span>
                    {c.isPrimary && (
                      <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
                        OFFICIAL
                      </span>
                    )}
                  </div>
                  <div className="text-[10px] text-slate-500">{c.relationOrRole}</div>
                  <div className="text-xs font-mono font-bold text-emerald-700 pt-1">{c.phone}</div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <a
                    href={`tel:${c.phone}`}
                    className="p-2 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 transition"
                    title="Call Now"
                  >
                    <PhoneCall className="w-4 h-4" />
                  </a>
                  {!c.isPrimary && (
                    <button
                      onClick={() => removeEmergencyContact(c.id)}
                      className="p-2 rounded-lg bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 transition"
                      title="Remove"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Add New Contact Form */}
        <div className="glass-panel p-6 rounded-2xl border border-slate-200 bg-white space-y-4">
          <div className="flex items-center gap-2 text-sm font-bold text-slate-900 font-heading">
            <UserPlus className="w-4 h-4 text-amber-600" />
            <span>Add Personal Emergency Contact</span>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <label className="text-[11px] font-bold text-slate-700">Contact Name</label>
              <input
                type="text"
                placeholder="e.g. Ramesh (Brother)"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full mt-1 px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:border-amber-500 focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="text-[11px] font-bold text-slate-700">Relationship / Role</label>
              <input
                type="text"
                placeholder="e.g. Neighbor, Doctor, Family"
                value={relation}
                onChange={(e) => setRelation(e.target.value)}
                className="w-full mt-1 px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:border-amber-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="text-[11px] font-bold text-slate-700">Phone Number</label>
              <input
                type="tel"
                placeholder="+91 98765 43210"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full mt-1 px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-mono focus:border-amber-500 focus:outline-none"
                required
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs transition shadow-sm"
            >
              Save Contact
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
