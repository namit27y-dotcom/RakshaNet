import React from 'react';
import { ShieldCheck, Phone, Info, Globe, AlertTriangle } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-slate-100 border-t border-slate-200 text-slate-600 text-xs py-8 px-4 sm:px-6 lg:px-8 mt-12">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
        {/* Col 1 */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-slate-900 font-bold font-heading text-sm">
            <ShieldCheck className="w-5 h-5 text-rose-600" />
            <span>Rakshak Platform</span>
          </div>
          <p className="text-slate-600 text-[11px] leading-relaxed">
            A unified disaster management platform connecting citizens, emergency responders, and NGOs across India during all three disaster phases.
          </p>
          <div className="flex items-center gap-2 text-[10px] text-slate-500">
            <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
            <span>SACHET Warning System Benchmark Sync</span>
          </div>
        </div>

        {/* Col 2 */}
        <div className="space-y-2">
          <h4 className="font-bold text-slate-900 font-heading text-xs uppercase tracking-wider text-rose-700">
            National Helplines
          </h4>
          <ul className="space-y-1.5 font-mono text-[11px]">
            <li className="flex items-center justify-between text-slate-700">
              <span>National Emergency Number:</span>
              <span className="font-bold text-rose-600">112</span>
            </li>
            <li className="flex items-center justify-between text-slate-700">
              <span>NDRF Control Room:</span>
              <span className="font-bold text-amber-600">1070</span>
            </li>
            <li className="flex items-center justify-between text-slate-700">
              <span>State Disaster Authority:</span>
              <span className="font-bold text-blue-600">1078</span>
            </li>
            <li className="flex items-center justify-between text-slate-700">
              <span>Ambulance Services:</span>
              <span className="font-bold text-emerald-600">108</span>
            </li>
          </ul>
        </div>

        {/* Col 3 */}
        <div className="space-y-2">
          <h4 className="font-bold text-slate-900 font-heading text-xs uppercase tracking-wider text-blue-700">
            Key Integrations & Data Feeds
          </h4>
          <ul className="space-y-1 text-[11px]">
            <li className="flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5 text-blue-600 shrink-0" />
              <span>USGS Real-time GeoJSON Earthquake API</span>
            </li>
            <li className="flex items-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
              <span>District Hazard Vulnerability Index (India)</span>
            </li>
            <li className="flex items-center gap-1.5">
              <Info className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span>NDMA Guidelines Dos & Don'ts Library</span>
            </li>
          </ul>
        </div>

        {/* Col 4 */}
        <div className="space-y-2">
          <h4 className="font-bold text-slate-900 font-heading text-xs uppercase tracking-wider text-amber-700">
            Hackathon Positioning
          </h4>
          <blockquote className="p-3 bg-white rounded-lg border border-slate-200 text-[11px] italic text-slate-700 leading-normal shadow-sm">
            "SACHET broadcasts warnings down. Rakshak closes the loop — enabling citizen reporting, live rescue tracking, and recovery resource matching in one place."
          </blockquote>
        </div>
      </div>

      <div className="max-w-7xl mx-auto pt-4 border-t border-slate-200 text-center text-[10px] text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-2">
        <p>© 2026 Rakshak — Built for Student Innovation Hackathon (Disaster Management Track).</p>
        <p className="text-slate-500">Built with React, Leaflet.js & Open Emergency Data.</p>
      </div>
    </footer>
  );
};
