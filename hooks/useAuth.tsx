import { useState, useEffect, useCallback, createContext, useContext, ReactNode } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase, getCurrentSession, signIn, signOut } from '@/lib/supabase';
import { signUpWithProfile, getProfile } from '@/lib/auth';
import { Profile, UserRole } from '@/types/database.types';

interface AuthState {
  user: User | null;
  profile: Profile | null;
  session: Session | null;
  loading: boolean;
  initialized: boolean;
}

interface AuthContextType extends AuthState {
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signUp: (data: {
    email: string;
    password: string;
    fullName: string;
    role: UserRole;
    phone?: string;
  }) => Promise<{ error: any }>;
  signOut: () => Promise<{ error: any }>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    profile: null,
    session: null,
    loading: true,
    initialized: false,
  });

  const loadProfile = useCallback(async (userId: string) => {
    const { data: profile } = await getProfile(userId);
    return profile;
  }, []);

  const initialize = useCallback(async () => {
    try {
      const { session } = await getCurrentSession();
      
      if (session?.user) {
        const profile = await loadProfile(session.user.id);
        setState({
          user: session.user,
          profile,
          session,
          loading: false,
          initialized: true,
        });
      } else {
        setState({
          user: null,
          profile: null,
          session: null,
          loading: false,
          initialized: true,
        });
      }
    } catch (error) {
      console.error('Auth initialization error:', error);
      setState(prev => ({ ...prev, loading: false, initialized: true }));
    }
  }, [loadProfile]);

  useEffect(() => {
    initialize();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' && session?.user) {
          const profile = await loadProfile(session.user.id);
          setState({
            user: session.user,
            profile,
            session,
            loading: false,
            initialized: true,
          });
        } else if (event === 'SIGNED_OUT') {
          setState({
            user: null,
            profile: null,
            session: null,
            loading: false,
            initialized: true,
          });
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, [initialize, loadProfile]);

  const handleSignIn = async (email: string, password: string) => {
    setState(prev => ({ ...prev, loading: true }));
    const { error } = await signIn(email, password);
    if (error) {
      setState(prev => ({ ...prev, loading: false }));
    }
    return { error };
  };

  const handleSignUp = async (data: {
    email: string;
    password: string;
    fullName: string;
    role: UserRole;
    phone?: string;
  }) => {
    setState(prev => ({ ...prev, loading: true }));
    const { error } = await signUpWithProfile(data);
    if (error) {
      setState(prev => ({ ...prev, loading: false }));
    }
    return { error };
  };

  const handleSignOut = async () => {
    setState(prev => ({ ...prev, loading: true }));
    const { error } = await signOut();
    return { error };
  };

  const refreshProfile = async () => {
    if (state.user) {
      const profile = await loadProfile(state.user.id);
      setState(prev => ({ ...prev, profile }));
    }
  };

  return (
    <AuthContext.Provider
      value={{
        ...state,
        signIn: handleSignIn,
        signUp: handleSignUp,
        signOut: handleSignOut,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export default useAuth;
