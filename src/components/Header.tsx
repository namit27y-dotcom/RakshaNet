import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { AuthModal } from './AuthModal';
import {
  ShieldAlert,
  MapPin,
  Locate,
  AlertTriangle,
  CheckCircle2,
  Radio,
  ChevronDown,
  Activity,
  Layers,
  HeartHandshake,
  Sparkles,
  X,
  LogIn,
  LogOut,
  UserCheck
} from 'lucide-react';

export const Header: React.FC = () => {
  const {
    activeModule,
    setActiveModule,
    selectedLocation,
    setSelectedLocation,
    allDistricts,
    detectUserLocation,
    isLocating,
    setIsSosModalOpen,
    setIsSafeModalOpen,
    isDemoSimulating,
    toggleDemoSimulation,
    generateBrief,
    isGeneratingBrief
  } = useApp();

  const {
    user,
    profile,
    role,
    isAuthenticated,
    isDemoUser,
    demoRole,
    signOut,
    exitDemoMode
  } = useAuth();


  const [isLocationDropdownOpen, setIsLocationDropdownOpen] = useState(false);
  const [districtSearch, setDistrictSearch] = useState('');
  const [isBriefModalOpen, setIsBriefModalOpen] = useState(false);
  const [aiBriefText, setAiBriefText] = useState('');
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  const handleOpenAiBrief = async () => {
    setIsBriefModalOpen(true);
    const text = await generateBrief();
    setAiBriefText(text);
  };

  const filteredDistricts = allDistricts.filter(
    (d) =>
      d.district.toLowerCase().includes(districtSearch.toLowerCase()) ||
      d.state.toLowerCase().includes(districtSearch.toLowerCase())
  );

  return (
    <header className="sticky top-0 z-50 glass-panel border-b border-slate-200 shadow-sm">
      {/* Top Banner Alert Bar */}
      <div className="bg-gradient-to-r from-rose-50 via-slate-50 to-amber-50 border-b border-slate-200 px-3 py-1.5 text-xs text-slate-700 flex items-center justify-between overflow-x-auto">
        <div className="flex items-center gap-2 font-medium shrink-0">
          <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-600"></span>
          </span>
          <span className="text-rose-700 font-bold tracking-wider">RAKSHAK DISASTER WATCH:</span>
          <span>SACHET Warning System Sync Active</span>
          <span className="hidden md:inline text-slate-400">•</span>
          <span className="hidden md:inline text-slate-600">NDRF Helplines: 1070 | SDMA: 1078 | Emergency: 112</span>
        </div>

        <div className="flex items-center gap-2 shrink-0 ml-4">
          <button
            onClick={handleOpenAiBrief}
            className="flex items-center gap-1.5 px-3 py-0.5 rounded-full text-xs font-bold bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 hover:brightness-110 transition shadow-sm"
          >
            <Sparkles className={`w-3.5 h-3.5 ${isGeneratingBrief ? 'animate-spin' : ''}`} />
            <span>{isGeneratingBrief ? 'Generating AI Brief...' : 'AI Situation Brief'}</span>
          </button>

          <button
            onClick={toggleDemoSimulation}
            className={`flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold transition-all ${
              isDemoSimulating
                ? 'bg-rose-600 text-white animate-pulse shadow-md shadow-rose-600/30'
                : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-300'
            }`}
          >
            <Radio className="w-3 h-3" />
            <span>{isDemoSimulating ? 'Demo Signal Active' : 'Enable Demo Signal'}</span>
          </button>
        </div>
      </div>

      {/* Main Nav Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Brand Logo */}
        <div className="flex items-center gap-3">
          <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-rose-600 via-amber-500 to-rose-600 shadow-md shadow-rose-600/20 text-white">
            <ShieldAlert className="w-6 h-6" />
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-500 rounded-full border-2 border-white"></div>
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-xl font-black tracking-tight text-slate-900 font-heading">Rakshak</span>
              <span className="text-[10px] uppercase font-bold tracking-widest px-1.5 py-0.5 rounded bg-rose-100 text-rose-700 border border-rose-200">
                INDIA
              </span>
            </div>
            <p className="text-[11px] text-slate-500 font-medium hidden sm:block">
              Unified Disaster Management Platform
            </p>
          </div>
        </div>

        {/* 3 Disaster Lifecycle Module Tabs */}
        <nav className="hidden md:flex items-center p-1 rounded-xl bg-slate-100 border border-slate-200">
          <button
            onClick={() => setActiveModule('before')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
              activeModule === 'before'
                ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>1. BEFORE</span>
            <span className="text-[10px] font-normal opacity-80">(Preparedness)</span>
          </button>

          <button
            onClick={() => setActiveModule('during')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
              activeModule === 'during'
                ? 'bg-gradient-to-r from-rose-600 to-red-600 text-white shadow-md shadow-rose-600/20'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            <Activity className="w-4 h-4" />
            <span>2. DURING</span>
            <span className="text-[10px] font-normal opacity-80">(Live SOS)</span>
          </button>

          <button
            onClick={() => setActiveModule('after')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
              activeModule === 'after'
                ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            <HeartHandshake className="w-4 h-4" />
            <span>3. AFTER</span>
            <span className="text-[10px] font-normal opacity-80">(Recovery & Aid)</span>
          </button>
        </nav>

        {/* Location Picker & Quick SOS Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Auth Trigger Indicator */}
          {isDemoUser ? (
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-50 border border-amber-300 text-amber-900 text-xs font-semibold shadow-sm">
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse shrink-0"></span>
              <span className="max-w-[80px] sm:max-w-[120px] truncate">{profile?.full_name}</span>
              <span className="text-[8px] uppercase px-1.5 py-0.5 bg-amber-200 text-amber-900 rounded font-black tracking-wider">
                DEMO: {demoRole}
              </span>
              <button 
                onClick={exitDemoMode} 
                className="text-amber-800 hover:text-rose-700 font-bold ml-1 hover:underline text-[10px]"
                title="Exit Hackathon Demo Mode"
              >
                Exit Demo
              </button>
            </div>
          ) : user ? (
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 border border-slate-200 text-slate-800 text-xs font-semibold">
              <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0"></span>
              <span className="max-w-[70px] sm:max-w-[110px] truncate">{profile?.full_name || user.email?.split('@')[0]}</span>
              <span className="text-[8px] uppercase px-1.5 py-0.5 bg-emerald-100 text-emerald-800 border border-emerald-200 rounded font-bold">
                {role || 'citizen'}
              </span>
              <button 
                onClick={signOut} 
                className="text-slate-400 hover:text-rose-600 font-bold ml-1 hover:underline text-[10px]"
                title="Sign out of Rakshak"
              >
                Sign Out
              </button>
            </div>
          ) : (
            <button
              onClick={() => setIsAuthModalOpen(true)}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold transition shadow-sm"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Sign In</span>
            </button>
          )}


          {/* Location Selector */}
          <div className="relative">
            <button
              onClick={() => setIsLocationDropdownOpen(!isLocationDropdownOpen)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 border border-slate-200 text-slate-800 hover:border-slate-300 text-xs font-medium transition"
            >
              <MapPin className="w-3.5 h-3.5 text-rose-600 shrink-0" />
              <span className="max-w-[100px] sm:max-w-[140px] truncate font-semibold">
                {selectedLocation.district}, {selectedLocation.state}
              </span>
              <ChevronDown className="w-3 h-3 text-slate-400 shrink-0" />
            </button>

            {/* Dropdown Menu */}
            {isLocationDropdownOpen && (
              <div className="absolute right-0 mt-2 w-72 rounded-xl bg-white border border-slate-200 shadow-2xl p-2 z-50">
                <div className="p-2 border-b border-slate-100 flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800">Select Disaster Zone</span>
                  <button
                    onClick={() => {
                      detectUserLocation();
                      setIsLocationDropdownOpen(false);
                    }}
                    disabled={isLocating}
                    className="flex items-center gap-1 text-[11px] text-rose-600 hover:text-rose-700 font-semibold"
                  >
                    <Locate className={`w-3 h-3 ${isLocating ? 'animate-spin' : ''}`} />
                    <span>Auto-GPS</span>
                  </button>
                </div>

                <div className="p-2">
                  <input
                    type="text"
                    placeholder="Search district or state..."
                    value={districtSearch}
                    onChange={(e) => setDistrictSearch(e.target.value)}
                    className="w-full px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:border-rose-500"
                  />
                </div>

                <div className="max-h-48 overflow-y-auto space-y-1 p-1">
                  {filteredDistricts.map((d) => (
                    <button
                      key={d.id}
                      onClick={() => {
                        setSelectedLocation(d);
                        setIsLocationDropdownOpen(false);
                      }}
                      className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs flex items-center justify-between transition ${
                        selectedLocation.id === d.id
                          ? 'bg-rose-50 text-rose-700 font-bold border border-rose-200'
                          : 'hover:bg-slate-100 text-slate-700'
                      }`}
                    >
                      <div>
                        <div>{d.district}</div>
                        <div className="text-[10px] text-slate-500">{d.state}</div>
                      </div>
                      <span
                        className={`text-[9px] px-1.5 py-0.5 rounded uppercase font-bold ${
                          d.riskLevel === 'CRITICAL'
                            ? 'bg-rose-100 text-rose-700'
                            : d.riskLevel === 'HIGH'
                            ? 'bg-amber-100 text-amber-700'
                            : 'bg-emerald-100 text-emerald-700'
                        }`}
                      >
                        {d.riskLevel}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Quick Safe Checkin */}
          <button
            onClick={() => setIsSafeModalOpen(true)}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-700 hover:bg-emerald-100 text-xs font-bold transition"
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>I'm Safe</span>
          </button>

          {/* Emergency SOS Button */}
          <button
            onClick={() => setIsSosModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-rose-600 to-red-600 text-white font-bold text-xs shadow-md shadow-rose-600/30 hover:from-rose-500 hover:to-red-500 transition sos-pulse-ring"
          >
            <AlertTriangle className="w-4 h-4 animate-bounce" />
            <span>SOS HELP</span>
          </button>
        </div>
      </div>

      {/* Mobile Tab Bar */}
      <div className="md:hidden flex items-center justify-around bg-white border-t border-slate-200 p-1">
        <button
          onClick={() => setActiveModule('before')}
          className={`flex-1 text-center py-2 text-xs font-bold border-b-2 transition ${
            activeModule === 'before'
              ? 'border-amber-500 text-amber-700 bg-amber-50'
              : 'border-transparent text-slate-600'
          }`}
        >
          1. BEFORE
        </button>
        <button
          onClick={() => setActiveModule('during')}
          className={`flex-1 text-center py-2 text-xs font-bold border-b-2 transition ${
            activeModule === 'during'
              ? 'border-rose-600 text-rose-700 bg-rose-50'
              : 'border-transparent text-slate-600'
          }`}
        >
          2. DURING
        </button>
        <button
          onClick={() => setActiveModule('after')}
          className={`flex-1 text-center py-2 text-xs font-bold border-b-2 transition ${
            activeModule === 'after'
              ? 'border-emerald-600 text-emerald-700 bg-emerald-50'
              : 'border-transparent text-slate-600'
          }`}
        >
          3. AFTER
        </button>
      </div>

      {/* AI Situation Brief Modal */}
      {isBriefModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white max-w-xl w-full rounded-2xl border border-amber-200 shadow-2xl p-6 space-y-4 relative">
            <button
              onClick={() => setIsBriefModalOpen(false)}
              className="absolute top-4 right-4 p-1.5 rounded-lg bg-slate-100 text-slate-500 hover:text-slate-900 transition"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-100 border border-amber-200 text-amber-700 flex items-center justify-center shrink-0">
                <Sparkles className="w-5 h-5 animate-spin" />
              </div>
              <div>
                <h3 className="text-lg font-black font-heading text-slate-900">
                  Rakshak AI Operational Situation Brief
                </h3>
                <p className="text-xs text-amber-700 font-semibold">
                  Synthesized from active Supabase database signals & Gemini AI
                </p>
              </div>
            </div>

            {isGeneratingBrief ? (
              <div className="py-8 text-center space-y-2">
                <Sparkles className="w-8 h-8 text-amber-500 animate-spin mx-auto" />
                <p className="text-xs font-bold text-slate-700">Synthesizing live incident streams & shelter metrics...</p>
              </div>
            ) : (
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 space-y-2 whitespace-pre-line leading-relaxed font-medium">
                {aiBriefText}
              </div>
            )}

            <div className="flex justify-end pt-2 border-t border-slate-100">
              <button
                onClick={() => setIsBriefModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 transition"
              >
                Dismiss Brief
              </button>
            </div>
          </div>
        </div>
      )}
      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
    </header>
  );
};
