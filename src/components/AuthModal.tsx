import React, { useState } from 'react';
import { supabase } from '../services/supabaseClient';
import { useApp } from '../context/AppContext';
import { X, ShieldAlert, Sparkles, LogIn, UserPlus, Lock } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const { showToast } = useApp();
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [selectedRole, setSelectedRole] = useState<'citizen' | 'volunteer' | 'ngo' | 'responder' | 'admin'>('citizen');
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    setIsLoading(true);

    try {
      if (isSignUp) {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: fullName || 'Anonymous Citizen',
              role: selectedRole
            }
          }
        });
        if (error) throw error;
        showToast('✅ Account registered! Verification email sent or auto-logged in.');
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password
        });
        if (error) throw error;
        showToast('🔑 Successfully signed in.');
      }
      onClose();
    } catch (err: any) {
      showToast(`❌ Auth failed: ${err.message || err}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoLogin = async (role: 'citizen' | 'volunteer' | 'ngo' | 'responder' | 'admin', name: string) => {
    setIsLoading(true);
    const demoEmail = `${role}@rakshanet.org`;
    const demoPassword = `raksha123`;

    try {
      // Attempt sign in
      const { error: signInErr } = await supabase.auth.signInWithPassword({
        email: demoEmail,
        password: demoPassword
      });

      if (signInErr) {
        // If user does not exist, sign them up
        if (signInErr.message.includes('Invalid login credentials') || signInErr.message.includes('Email not confirmed')) {
          const { error: signUpErr } = await supabase.auth.signUp({
            email: demoEmail,
            password: demoPassword,
            options: {
              data: {
                full_name: name,
                role: role
              }
            }
          });
          if (signUpErr) throw signUpErr;
          showToast(`✅ Demo User Created & Signed In: ${name} (${role.toUpperCase()})`);
        } else {
          throw signInErr;
        }
      } else {
        showToast(`🔑 Demo User Signed In: ${name} (${role.toUpperCase()})`);
      }
      onClose();
    } catch (err: any) {
      showToast(`❌ Demo login error: ${err.message || err}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white max-w-md w-full rounded-2xl border border-slate-200 shadow-2xl p-6 space-y-4 relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-rose-600 via-amber-500 to-emerald-600"></div>

        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg bg-slate-100 text-slate-500 hover:text-slate-900 transition"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center shrink-0 border border-rose-200">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-black font-heading text-slate-900">
              RakshaNet Command Center Access
            </h3>
            <p className="text-xs text-slate-500">
              {isSignUp ? 'Create new platform credentials' : 'Authenticate to gain operational clearance'}
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3 pt-2">
          {isSignUp && (
            <div>
              <label className="text-[11px] font-bold text-slate-700 uppercase">Full Name</label>
              <input
                type="text"
                placeholder="e.g. Suresh Menon"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full mt-1 px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-rose-500"
                required={isSignUp}
              />
            </div>
          )}

          <div>
            <label className="text-[11px] font-bold text-slate-700 uppercase">Email Address</label>
            <input
              type="email"
              placeholder="operator@rakshanet.org"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full mt-1 px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-rose-500"
              required
            />
          </div>

          <div>
            <label className="text-[11px] font-bold text-slate-700 uppercase">Password</label>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full mt-1 px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-rose-500"
              required
            />
          </div>

          {isSignUp && (
            <div>
              <label className="text-[11px] font-bold text-slate-700 uppercase">Platform Role Assignment</label>
              <select
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value as any)}
                className="w-full mt-1 px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-bold focus:outline-none focus:border-rose-500"
              >
                <option value="citizen">Citizen (General Public)</option>
                <option value="volunteer">Volunteer (Field Force)</option>
                <option value="ngo">NGO Relief Coordinator</option>
                <option value="responder">Responder (NDRF / SDRF / Police)</option>
                <option value="admin">Administrator (Command Headquarters)</option>
              </select>
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-2.5 rounded-xl bg-slate-900 text-white font-extrabold text-xs hover:bg-slate-800 transition flex items-center justify-center gap-1.5"
          >
            {isSignUp ? <UserPlus className="w-4 h-4" /> : <LogIn className="w-4 h-4" />}
            <span>{isLoading ? 'Processing...' : isSignUp ? 'REGISTER PLATFORM ACCOUNT' : 'SECURE SIGN IN'}</span>
          </button>
        </form>

        <div className="text-center text-xs text-slate-600">
          <button
            onClick={() => setIsSignUp(!isSignUp)}
            className="font-bold text-rose-600 hover:text-rose-700 underline"
          >
            {isSignUp ? 'Already have an account? Sign In' : "Don't have an account? Sign Up"}
          </button>
        </div>

        {/* Preset Demo Login Panel */}
        <div className="border-t border-slate-100 pt-4 space-y-3">
          <div className="flex items-center gap-1.5 text-xs text-amber-700 font-bold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Preset Hackathon Demo Clearances</span>
          </div>
          <p className="text-[10px] text-slate-500 leading-normal">
            Select a role to automatically register/log in via Supabase Auth and test role-based row level security (RLS) policies.
          </p>

          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => handleDemoLogin('citizen', 'Aarav Sharma (Citizen)')}
              className="px-2.5 py-1.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-[10px] font-bold text-left flex flex-col"
            >
              <span className="text-slate-900">Citizen</span>
              <span className="text-[8px] text-slate-500">Report Damage, View Aid</span>
            </button>

            <button
              onClick={() => handleDemoLogin('volunteer', 'Priya Patel (Volunteer)')}
              className="px-2.5 py-1.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-[10px] font-bold text-left flex flex-col"
            >
              <span className="text-slate-900">Volunteer</span>
              <span className="text-[8px] text-slate-500">Field audits & inventories</span>
            </button>

            <button
              onClick={() => handleDemoLogin('ngo', 'Red Cross India (NGO)')}
              className="px-2.5 py-1.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-[10px] font-bold text-left flex flex-col"
            >
              <span className="text-slate-900">NGO Representative</span>
              <span className="text-[8px] text-slate-500">Offer HAVE resources & match</span>
            </button>

            <button
              onClick={() => handleDemoLogin('responder', 'Commander Kumar (NDRF)')}
              className="px-2.5 py-1.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-[10px] font-bold text-left flex flex-col"
            >
              <span className="text-slate-900">Rescue Responder</span>
              <span className="text-[8px] text-slate-500">Verify Damage, Assign dispatches</span>
            </button>
          </div>

          <button
            onClick={() => handleDemoLogin('admin', 'Command HQs Administrator')}
            className="w-full px-2.5 py-2 rounded-lg border border-rose-200 bg-rose-50 hover:bg-rose-100 text-[10px] font-bold text-slate-900 flex items-center justify-center gap-1.5"
          >
            <Lock className="w-3 h-3 text-rose-600" />
            <span>COMMAND ADMIN ACCESS (Full Clearance)</span>
          </button>
        </div>
      </div>
    </div>
  );
};
