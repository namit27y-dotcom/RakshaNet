import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useApp } from '../context/AppContext';
import {
  X,
  ShieldAlert,
  Sparkles,
  LogIn,
  UserPlus,
  CheckCircle2,
  AlertCircle,
  Building,
  Phone,
  Mail,
  Lock,
  UserCheck,
  Radio
} from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const { signIn, signUp, activateDemoMode } = useAuth();
  const { showToast } = useApp();

  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [organizationName, setOrganizationName] = useState('');
  const [selectedRole, setSelectedRole] = useState<'citizen' | 'volunteer' | 'ngo' | 'responder'>('citizen');
  const [isLoading, setIsLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);

  if (!isOpen) return null;

  const handleClose = () => {
    setStatusMessage(null);
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatusMessage(null);

    const cleanEmail = email.trim();
    if (!cleanEmail || !password) {
      setStatusMessage({ type: 'error', text: 'Please provide both email and password.' });
      return;
    }

    if (password.length < 6) {
      setStatusMessage({ type: 'error', text: 'Password must be at least 6 characters.' });
      return;
    }

    setIsLoading(true);

    try {
      if (isSignUp) {
        const res = await signUp({
          email: cleanEmail,
          password,
          fullName: fullName.trim(),
          role: selectedRole,
          phone: phone.trim() || undefined,
          organizationName: organizationName.trim() || undefined
        });

        if (!res.success) {
          setStatusMessage({ type: 'error', text: res.error || 'Registration failed. Please try again.' });
          return;
        }

        if (res.unconfirmed) {
          setStatusMessage({
            type: 'info',
            text: '✅ Account registered! Please check your inbox and verify your email before signing in.'
          });
          showToast('📧 Verification email sent. Please verify before signing in.');
        } else {
          showToast(`✅ Welcome to Rakshak! Logged in as ${selectedRole.toUpperCase()}.`);
          handleClose();
        }
      } else {
        const res = await signIn(cleanEmail, password);

        if (!res.success) {
          setStatusMessage({
            type: 'error',
            text: res.error || 'Invalid credentials. Please verify and try again.'
          });
          return;
        }

        const activeRole = res.profile?.role || 'user';
        showToast(`🔑 Successfully signed in (${activeRole.toUpperCase()}).`);
        handleClose();
      }
    } catch (err: any) {
      setStatusMessage({
        type: 'error',
        text: err?.message || 'Authentication error. Please check your network connection.'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoClearance = (
    role: 'citizen' | 'volunteer' | 'ngo' | 'responder',
    displayName: string
  ) => {
    activateDemoMode(role, displayName);
    showToast(`🚀 Activated Hackathon Demo Mode: ${displayName}`);
    handleClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white max-w-md w-full rounded-2xl border border-slate-200 shadow-2xl p-6 space-y-4 relative overflow-hidden max-h-[92vh] overflow-y-auto">
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-rose-600 via-amber-500 to-emerald-600"></div>

        <button
          onClick={handleClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg bg-slate-100 text-slate-500 hover:text-slate-900 transition"
          aria-label="Close authentication modal"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center shrink-0 border border-rose-200">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-black font-heading text-slate-900">
              Rakshak Command Center Access
            </h3>
            <p className="text-xs text-slate-500">
              {isSignUp ? 'Create new platform credentials' : 'Authenticate to gain operational clearance'}
            </p>
          </div>
        </div>

        {/* Status / Error Banner */}
        {statusMessage && (
          <div
            className={`p-3 rounded-xl border text-xs font-semibold flex items-start gap-2 animate-in fade-in ${
              statusMessage.type === 'error'
                ? 'bg-rose-50 border-rose-200 text-rose-800'
                : statusMessage.type === 'info'
                ? 'bg-amber-50 border-amber-200 text-amber-900'
                : 'bg-emerald-50 border-emerald-200 text-emerald-800'
            }`}
          >
            {statusMessage.type === 'error' && <AlertCircle className="w-4 h-4 shrink-0 text-rose-600 mt-0.5" />}
            {statusMessage.type === 'info' && <Mail className="w-4 h-4 shrink-0 text-amber-600 mt-0.5" />}
            {statusMessage.type === 'success' && <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600 mt-0.5" />}
            <span className="leading-relaxed">{statusMessage.text}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3 pt-1">
          {isSignUp && (
            <div>
              <label className="text-[11px] font-bold text-slate-700 uppercase">Full Name</label>
              <div className="relative mt-1">
                <input
                  type="text"
                  placeholder="e.g. Suresh Menon"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full pl-3 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-rose-500"
                  required={isSignUp}
                />
              </div>
            </div>
          )}

          <div>
            <label className="text-[11px] font-bold text-slate-700 uppercase">Email Address</label>
            <div className="relative mt-1">
              <input
                type="email"
                placeholder="operator@rakshak.org"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-3 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-rose-500"
                required
              />
            </div>
          </div>

          <div>
            <label className="text-[11px] font-bold text-slate-700 uppercase">Password</label>
            <div className="relative mt-1">
              <input
                type="password"
                placeholder="•••••••• (min 6 characters)"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-3 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-rose-500"
                required
                minLength={6}
              />
            </div>
          </div>

          {isSignUp && (
            <>
              <div>
                <label className="text-[11px] font-bold text-slate-700 uppercase">
                  Platform Role Domain
                </label>
                <select
                  value={selectedRole}
                  onChange={(e) => setSelectedRole(e.target.value as any)}
                  className="w-full mt-1 px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-bold focus:outline-none focus:border-rose-500"
                >
                  <option value="citizen">Citizen (General Public & Incident Reporter)</option>
                  <option value="volunteer">Volunteer (Field Force & Relief Helper)</option>
                  <option value="ngo">NGO Representative (Supply & Resource Matcher)</option>
                  <option value="responder">Rescue Responder (NDRF / SDRF / Police Dispatches)</option>
                </select>
              </div>

              {(selectedRole === 'ngo' || selectedRole === 'volunteer') && (
                <div>
                  <label className="text-[11px] font-bold text-slate-700 uppercase">
                    Organization / Agency Name <span className="text-slate-400 font-normal">(Optional)</span>
                  </label>
                  <div className="relative mt-1">
                    <input
                      type="text"
                      placeholder="e.g. Red Cross India / Relief Foundation"
                      value={organizationName}
                      onChange={(e) => setOrganizationName(e.target.value)}
                      className="w-full pl-3 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-rose-500"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="text-[11px] font-bold text-slate-700 uppercase">
                  Phone Number <span className="text-slate-400 font-normal">(Optional)</span>
                </label>
                <div className="relative mt-1">
                  <input
                    type="tel"
                    placeholder="+91 98765 43210"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full pl-3 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-rose-500"
                  />
                </div>
              </div>
            </>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-2.5 rounded-xl bg-slate-900 text-white font-extrabold text-xs hover:bg-slate-800 transition flex items-center justify-center gap-1.5 shadow-sm mt-2"
          >
            {isSignUp ? <UserPlus className="w-4 h-4" /> : <LogIn className="w-4 h-4" />}
            <span>{isLoading ? 'Processing...' : isSignUp ? 'REGISTER PLATFORM ACCOUNT' : 'SECURE SIGN IN'}</span>
          </button>
        </form>

        <div className="text-center text-xs text-slate-600">
          <button
            onClick={() => {
              setIsSignUp(!isSignUp);
              setStatusMessage(null);
            }}
            className="font-bold text-rose-600 hover:text-rose-700 underline"
          >
            {isSignUp ? 'Already have an account? Sign In' : "Don't have an account? Sign Up"}
          </button>
        </div>

        {/* Preset Demo Clearances Panel (Isolated Simulation Mode) */}
        <div className="border-t border-slate-100 pt-4 space-y-2.5">
          <div className="flex items-center gap-1.5 text-xs text-amber-700 font-bold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Preset Hackathon Demo Clearances</span>
          </div>
          <p className="text-[10px] text-slate-500 leading-normal">
            Instantly simulate domain access clearances to preview role-specific features. Demo mode operates client-side without altering live database records.
          </p>

          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => handleDemoClearance('citizen', 'Aarav Sharma (Citizen Demo)')}
              className="px-2.5 py-2 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-[10px] font-bold text-left flex flex-col transition"
            >
              <span className="text-slate-900 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> Citizen
              </span>
              <span className="text-[8px] text-slate-500 font-normal">SOS Signals, Damage Reports, Aid View</span>
            </button>

            <button
              onClick={() => handleDemoClearance('volunteer', 'Priya Patel (Volunteer Demo)')}
              className="px-2.5 py-2 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-[10px] font-bold text-left flex flex-col transition"
            >
              <span className="text-slate-900 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span> Volunteer
              </span>
              <span className="text-[8px] text-slate-500 font-normal">Field Operations, Audits & Aid Task</span>
            </button>

            <button
              onClick={() => handleDemoClearance('ngo', 'Red Cross India (NGO Demo)')}
              className="px-2.5 py-2 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-[10px] font-bold text-left flex flex-col transition"
            >
              <span className="text-slate-900 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span> NGO Coordinator
              </span>
              <span className="text-[8px] text-slate-500 font-normal">Post HAVE supplies, AI Proximity Match</span>
            </button>

            <button
              onClick={() => handleDemoClearance('responder', 'Commander Kumar (NDRF Demo)')}
              className="px-2.5 py-2 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-[10px] font-bold text-left flex flex-col transition"
            >
              <span className="text-slate-900 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span> Rescue Responder
              </span>
              <span className="text-[8px] text-slate-500 font-normal">Verify Reports, Dispatch Rescues</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
