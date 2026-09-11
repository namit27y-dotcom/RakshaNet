import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { User, Session, AuthError } from '@supabase/supabase-js';
import { supabase, isSupabaseConfigured } from '../services/supabaseClient';
import { UserRole, UserProfile } from '../types';

export interface SignUpParams {
  email: string;
  password: string;
  fullName: string;
  role: 'citizen' | 'volunteer' | 'ngo' | 'responder';
  phone?: string;
  organizationName?: string;
}

export interface AuthResponse {
  success: boolean;
  unconfirmed?: boolean;
  error?: string;
  message?: string;
  session?: Session | null;
  profile?: UserProfile | null;
}

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  role: UserRole | null;
  session: Session | null;
  loading: boolean;
  isAuthenticated: boolean;
  isDemoUser: boolean;
  demoRole: UserRole | null;
  authError: string | null;

  // Real Supabase Auth methods
  signIn: (email: string, password: string) => Promise<AuthResponse>;
  signUp: (params: SignUpParams) => Promise<AuthResponse>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<UserProfile | null>;

  // Hackathon Isolated Demo Mode
  activateDemoMode: (role: 'citizen' | 'volunteer' | 'ngo' | 'responder', displayName?: string) => void;
  exitDemoMode: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [role, setRole] = useState<UserRole | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [authError, setAuthError] = useState<string | null>(null);

  // Isolated Demo State
  const [isDemoUser, setIsDemoUser] = useState<boolean>(false);
  const [demoRole, setDemoRole] = useState<UserRole | null>(null);

  // Helper: Fetch user profile from public.profiles
  const fetchProfile = useCallback(async (userId: string): Promise<UserProfile | null> => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (error) {
        console.warn('[Rakshak Auth] Profile fetch query error:', error.message);
        return null;
      }

      if (data) {
        const loadedProfile: UserProfile = {
          id: data.id,
          full_name: data.full_name || 'Citizen',
          email: data.email || '',
          role: (data.role as UserRole) || 'citizen',
          phone: data.phone || undefined,
          organization_name: data.organization_name || undefined,
          created_at: data.created_at,
          updated_at: data.updated_at
        };
        setProfile(loadedProfile);
        setRole(loadedProfile.role);
        return loadedProfile;
      }

      // Safe recovery: If auth user exists but profile row is delayed or missing
      const { data: userData } = await supabase.auth.getUser();
      if (userData?.user && userData.user.id === userId) {
        const meta = userData.user.user_metadata || {};
        const fallbackRole = (meta.role as UserRole) || 'citizen';
        const fallbackProfile: UserProfile = {
          id: userId,
          full_name: meta.full_name || meta.name || 'Citizen',
          email: userData.user.email || '',
          role: fallbackRole,
          phone: meta.phone || undefined,
          organization_name: meta.organization_name || undefined
        };
        setProfile(fallbackProfile);
        setRole(fallbackRole);
        return fallbackProfile;
      }

      return null;
    } catch (err: any) {
      console.warn('[Rakshak Auth] Unexpected error fetching profile:', err);
      return null;
    }
  }, []);

  // Initialize session and auth listener
  useEffect(() => {
    let isMounted = true;

    const initAuth = async () => {
      try {
        const { data: { session: initialSession }, error } = await supabase.auth.getSession();
        if (error) throw error;

        if (initialSession?.user && isMounted) {
          setSession(initialSession);
          setUser(initialSession.user);
          await fetchProfile(initialSession.user.id);
        }
      } catch (err: any) {
        console.warn('[Rakshak Auth] Initial session resolution warning:', err?.message || err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    initAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, newSession) => {
      if (!isMounted) return;

      if (newSession?.user) {
        setSession(newSession);
        setUser(newSession.user);
        setIsDemoUser(false);
        setDemoRole(null);
        await fetchProfile(newSession.user.id);
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
        setSession(null);
        setProfile(null);
        setRole(null);
        setIsDemoUser(false);
        setDemoRole(null);
      }
      setLoading(false);
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [fetchProfile]);

  // Sign in method
  const signIn = async (email: string, password: string): Promise<AuthResponse> => {
    setAuthError(null);
    if (!isSupabaseConfigured) {
      const msg = 'Authentication service is not configured. Please add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to your deployment settings.';
      setAuthError(msg);
      return { success: false, error: msg };
    }

    if (!email || !password) {
      return { success: false, error: 'Email and password are required.' };
    }

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password
      });

      if (error) {
        if (error.message.includes('Email not confirmed')) {
          const msg = 'Please verify your email before signing in. Check your inbox for the confirmation link.';
          setAuthError(msg);
          return { success: false, unconfirmed: true, error: msg };
        }
        if (error.message.includes('Invalid login credentials')) {
          const msg = 'Invalid email or password.';
          setAuthError(msg);
          return { success: false, error: msg };
        }
        setAuthError(error.message);
        return { success: false, error: error.message };
      }

      if (data.user && data.session) {
        setUser(data.user);
        setSession(data.session);
        setIsDemoUser(false);
        setDemoRole(null);
        const userProfile = await fetchProfile(data.user.id);
        return { success: true, session: data.session, profile: userProfile };
      }

      return { success: false, error: 'Unable to authenticate session.' };
    } catch (err: any) {
      let msg = err?.message || 'Authentication service error. Please try again.';
      if (msg.includes('Failed to fetch') || msg.includes('NetworkError') || msg.includes('fetch')) {
        msg = 'Unable to connect to the authentication server. Please check your internet connection or verify that your Supabase backend is reachable.';
      }
      setAuthError(msg);
      return { success: false, error: msg };
    }
  };

  // Sign up method
  const signUp = async ({
    email,
    password,
    fullName,
    role: assignedRole,
    phone,
    organizationName
  }: SignUpParams): Promise<AuthResponse> => {
    setAuthError(null);

    if (!isSupabaseConfigured) {
      const msg = 'Authentication service is not configured. Please add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to your deployment settings.';
      setAuthError(msg);
      return { success: false, error: msg };
    }

    // Validation
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail || !password) {
      return { success: false, error: 'Email and password are required.' };
    }
    if (password.length < 6) {
      return { success: false, error: 'Password must be at least 6 characters.' };
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(cleanEmail)) {
      return { success: false, error: 'Please enter a valid email address.' };
    }

    const validRoles = ['citizen', 'volunteer', 'ngo', 'responder'];
    const sanitizedRole = validRoles.includes(assignedRole) ? assignedRole : 'citizen';

    try {
      const { data, error } = await supabase.auth.signUp({
        email: cleanEmail,
        password,
        options: {
          data: {
            full_name: fullName.trim() || 'Citizen',
            role: sanitizedRole,
            phone: phone ? phone.trim() : undefined,
            organization_name: organizationName ? organizationName.trim() : undefined
          }
        }
      });

      if (error) {
        if (error.message.includes('User already registered') || error.message.includes('already exists')) {
          const msg = 'An account with this email already exists. Please sign in instead.';
          setAuthError(msg);
          return { success: false, error: msg };
        }
        setAuthError(error.message);
        return { success: false, error: error.message };
      }

      // Check if email confirmation is required (session is null)
      if (data.user && !data.session) {
        return {
          success: true,
          unconfirmed: true,
          message: 'Account created! Please verify your email before signing in.'
        };
      }

      // If email confirmation is disabled and session is immediately available
      if (data.user && data.session) {
        setUser(data.user);
        setSession(data.session);
        setIsDemoUser(false);
        setDemoRole(null);
        const userProfile = await fetchProfile(data.user.id);
        return {
          success: true,
          unconfirmed: false,
          session: data.session,
          profile: userProfile,
          message: 'Account created and authenticated successfully!'
        };
      }

      return {
        success: true,
        unconfirmed: true,
        message: 'Account created! Please check your email to complete verification.'
      };
    } catch (err: any) {
      let msg = err?.message || 'Registration service error. Please try again.';
      if (msg.includes('Failed to fetch') || msg.includes('NetworkError') || msg.includes('fetch')) {
        msg = 'Unable to connect to the authentication server. Please check your internet connection or verify that your Supabase backend is reachable.';
      }
      setAuthError(msg);
      return { success: false, error: msg };
    }
  };

  // Sign out method
  const signOut = async () => {
    try {
      await supabase.auth.signOut();
    } catch (err) {
      console.warn('[Rakshak Auth] Sign out error:', err);
    } finally {
      setUser(null);
      setSession(null);
      setProfile(null);
      setRole(null);
      setIsDemoUser(false);
      setDemoRole(null);
      setAuthError(null);
    }
  };

  // Profile refresh
  const refreshProfile = async (): Promise<UserProfile | null> => {
    if (user) {
      return await fetchProfile(user.id);
    }
    return null;
  };

  // Hackathon Isolated Demo Mode
  const activateDemoMode = (demoSelectedRole: 'citizen' | 'volunteer' | 'ngo' | 'responder', displayName?: string) => {
    const roleLabels: Record<string, string> = {
      citizen: 'Aarav Sharma (Citizen Demo)',
      volunteer: 'Priya Patel (Volunteer Demo)',
      ngo: 'Red Cross India (NGO Demo)',
      responder: 'Commander Kumar (NDRF Demo)'
    };

    const mockProfile: UserProfile = {
      id: `demo-${demoSelectedRole}-${Date.now()}`,
      full_name: displayName || roleLabels[demoSelectedRole] || 'Demo User',
      email: `${demoSelectedRole}@demo.rakshak.org`,
      role: demoSelectedRole,
      phone: '+91 98765 00000',
      organization_name: demoSelectedRole === 'ngo' ? 'Red Cross Relief Division' : undefined,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    setIsDemoUser(true);
    setDemoRole(demoSelectedRole);
    setProfile(mockProfile);
    setRole(demoSelectedRole);
  };

  const exitDemoMode = () => {
    setIsDemoUser(false);
    setDemoRole(null);
    if (!user) {
      setProfile(null);
      setRole(null);
    } else {
      fetchProfile(user.id);
    }
  };

  const isAuthenticated = Boolean(user || isDemoUser);

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        role: isDemoUser ? demoRole : role,
        session,
        loading,
        isAuthenticated,
        isDemoUser,
        demoRole,
        authError,
        signIn,
        signUp,
        signOut,
        refreshProfile,
        activateDemoMode,
        exitDemoMode
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
