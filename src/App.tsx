import React, { useState } from 'react';
import { useApp } from './context/AppContext';
import { Header } from './components/Header';
import { Footer } from './components/Footer';

// Before Module Components
import { RiskAnalyzer } from './components/before/RiskAnalyzer';
import { ChecklistGenerator } from './components/before/ChecklistGenerator';
import { DosAndDonts } from './components/before/DosAndDonts';
import { EmergencyContacts } from './components/before/EmergencyContacts';

// During Module Components
import { LiveMap } from './components/during/LiveMap';
import { LiveFeed } from './components/during/LiveFeed';
import { SosModal } from './components/during/SosModal';
import { SafeModal } from './components/during/SafeModal';

// After Module Components
import { DamageReporter } from './components/after/DamageReporter';
import { ResourceBoard } from './components/after/ResourceBoard';
import { RecoveryDashboard } from './components/after/RecoveryDashboard';

import { Layers, Activity, HeartHandshake, ShieldAlert, Sparkles, Bell } from 'lucide-react';

export const AppContent: React.FC = () => {
  const { activeModule, activeToast } = useApp();

  // Sub-tabs for Before Module
  const [beforeSubTab, setBeforeSubTab] = useState<'risk' | 'checklist' | 'dos' | 'contacts'>('risk');

  // Sub-tabs for After Module
  const [afterSubTab, setAfterSubTab] = useState<'dashboard' | 'damage' | 'resources'>('dashboard');

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 font-sans relative">
      {/* Toast Notification Banner */}
      {activeToast && (
        <div className="fixed top-20 right-4 z-50 max-w-sm w-full p-4 rounded-xl bg-slate-900 border border-amber-500/50 shadow-2xl text-xs font-bold text-white flex items-center gap-3 animate-in fade-in slide-in-from-top-4">
          <Bell className="w-5 h-5 text-amber-400 shrink-0 animate-bounce" />
          <span className="leading-normal">{activeToast}</span>
        </div>
      )}

      {/* Header */}
      <Header />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* ================= MODULE 1: BEFORE DISASTER ================= */}
        {activeModule === 'before' && (
          <div className="space-y-6">
            {/* Sub Nav */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-slate-200">
              <button
                onClick={() => setBeforeSubTab('risk')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition shrink-0 ${
                  beforeSubTab === 'risk'
                    ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                    : 'bg-white text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200 shadow-sm'
                }`}
              >
                1. Locality Risk Profile
              </button>

              <button
                onClick={() => setBeforeSubTab('checklist')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition shrink-0 ${
                  beforeSubTab === 'checklist'
                    ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                    : 'bg-white text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200 shadow-sm'
                }`}
              >
                2. 72-Hour "Go-Bag" Generator
              </button>

              <button
                onClick={() => setBeforeSubTab('dos')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition shrink-0 ${
                  beforeSubTab === 'dos'
                    ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                    : 'bg-white text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200 shadow-sm'
                }`}
              >
                3. NDMA Dos & Don'ts Guide
              </button>

              <button
                onClick={() => setBeforeSubTab('contacts')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition shrink-0 ${
                  beforeSubTab === 'contacts'
                    ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                    : 'bg-white text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200 shadow-sm'
                }`}
              >
                4. Emergency Contacts Vault
              </button>
            </div>

            {beforeSubTab === 'risk' && <RiskAnalyzer />}
            {beforeSubTab === 'checklist' && <ChecklistGenerator />}
            {beforeSubTab === 'dos' && <DosAndDonts />}
            {beforeSubTab === 'contacts' && <EmergencyContacts />}
          </div>
        )}

        {/* ================= MODULE 2: DURING DISASTER (Centerpiece) ================= */}
        {activeModule === 'during' && (
          <div className="space-y-6">
            {/* Header Banner */}
            <div className="glass-panel p-5 rounded-2xl border border-rose-200 bg-gradient-to-r from-rose-50 via-white to-amber-50 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-100 text-rose-700 border border-rose-200 uppercase tracking-wide">
                    Module 2: During Disaster Response
                  </span>
                  <span className="text-slate-400">•</span>
                  <span className="text-xs text-slate-600 font-medium">Live Crowdsourced Incident Map</span>
                </div>
                <h2 className="text-xl sm:text-2xl font-black font-heading text-slate-900">
                  Real-Time SOS Signals & Shelter Radar
                </h2>
              </div>
            </div>

            {/* Main Grid: Interactive Map + Live Ground Stream */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <LiveMap />
              </div>
              <div className="lg:col-span-1">
                <LiveFeed />
              </div>
            </div>
          </div>
        )}

        {/* ================= MODULE 3: AFTER DISASTER ================= */}
        {activeModule === 'after' && (
          <div className="space-y-6">
            {/* Sub Nav */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-slate-200">
              <button
                onClick={() => setAfterSubTab('dashboard')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition shrink-0 ${
                  afterSubTab === 'dashboard'
                    ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                    : 'bg-white text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200 shadow-sm'
                }`}
              >
                1. Recovery Analytics Dashboard
              </button>

              <button
                onClick={() => setAfterSubTab('damage')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition shrink-0 ${
                  afterSubTab === 'damage'
                    ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                    : 'bg-white text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200 shadow-sm'
                }`}
              >
                2. Damage Audit Reporting
              </button>

              <button
                onClick={() => setAfterSubTab('resources')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition shrink-0 ${
                  afterSubTab === 'resources'
                    ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                    : 'bg-white text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200 shadow-sm'
                }`}
              >
                3. NGO Relief Resource Matcher
              </button>
            </div>

            {afterSubTab === 'dashboard' && <RecoveryDashboard />}
            {afterSubTab === 'damage' && <DamageReporter />}
            {afterSubTab === 'resources' && <ResourceBoard />}
          </div>
        )}
      </main>

      {/* Modals */}
      <SosModal />
      <SafeModal />

      {/* Footer */}
      <Footer />
    </div>
  );
};
