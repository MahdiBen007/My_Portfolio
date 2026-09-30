import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

type UserRole = 'admin' | 'editor' | null;

interface AuthContextType {
  user: User | null;
  session: Session | null;
  role: UserRole;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signUp: (email: string, password: string, fullName: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  isAdmin: boolean;
  isEditor: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [role, setRole] = useState<UserRole>(null);
  const [loading, setLoading] = useState(true);

  const fetchUserRole = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('role')
        .eq('user_id', userId)
        .single();
      
      if (error) {
        return null;
      }
      
      return data?.role as UserRole;
    } catch {
      return null;
    }
  };

  useEffect(() => {
    let isMounted = true;

    // Check offline/local demo admin authentication
    if (localStorage.getItem('local_mock_auth') === 'true') {
      const mockUser = {
        id: '00000000-0000-0000-0000-000000000000',
        app_metadata: { provider: 'email', providers: ['email'] },
        user_metadata: { full_name: 'Admin' },
        aud: 'authenticated',
        confirmation_sent_at: '',
        recovery_sent_at: '',
        email_change_sent_at: '',
        new_email: '',
        invited_at: '',
        action_link: '',
        email: 'admin@local.test',
        phone: '',
        created_at: new Date().toISOString(),
        confirmed_at: new Date().toISOString(),
        email_confirmed_at: new Date().toISOString(),
        phone_confirmed_at: '',
        last_sign_in_at: new Date().toISOString(),
        role: 'authenticated',
        updated_at: new Date().toISOString(),
        identities: [],
        factors: [],
      } as unknown as User;

      const mockSession = {
        access_token: 'mock-token',
        refresh_token: 'mock-refresh',
        expires_in: 3600,
        token_type: 'bearer',
        user: mockUser,
      } as unknown as Session;

      setUser(mockUser);
      setSession(mockSession);
      setRole('admin');
      setLoading(false);
      return;
    }

    const setAuthState = async (nextSession: Session | null) => {
      if (!isMounted) return;
      setSession(nextSession);
      setUser(nextSession?.user ?? null);

      if (!nextSession?.user) {
        setRole(null);
        setLoading(false);
        return;
      }

      setLoading(true);
      const nextRole = await fetchUserRole(nextSession.user.id);
      if (!isMounted) return;
      setRole(nextRole);
      setLoading(false);
    };

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      void setAuthState(nextSession);
    });

    supabase.auth.getSession().then(({ data: { session: nextSession } }) => {
      void setAuthState(nextSession);
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    // Offline seed admin check
    if (email === 'admin@local.test' && password === '123456') {
      const mockUser = {
        id: '00000000-0000-0000-0000-000000000000',
        app_metadata: { provider: 'email', providers: ['email'] },
        user_metadata: { full_name: 'Admin' },
        aud: 'authenticated',
        confirmation_sent_at: '',
        recovery_sent_at: '',
        email_change_sent_at: '',
        new_email: '',
        invited_at: '',
        action_link: '',
        email: 'admin@local.test',
        phone: '',
        created_at: new Date().toISOString(),
        confirmed_at: new Date().toISOString(),
        email_confirmed_at: new Date().toISOString(),
        phone_confirmed_at: '',
        last_sign_in_at: new Date().toISOString(),
        role: 'authenticated',
        updated_at: new Date().toISOString(),
        identities: [],
        factors: [],
      } as unknown as User;

      const mockSession = {
        access_token: 'mock-token',
        refresh_token: 'mock-refresh',
        expires_in: 3600,
        token_type: 'bearer',
        user: mockUser,
      } as unknown as Session;

      localStorage.setItem('local_mock_auth', 'true');
      setUser(mockUser);
      setSession(mockSession);
      setRole('admin');
      return { error: null };
    }

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { error: error as Error | null };
  };

  const signUp = async (email: string, password: string, fullName: string) => {
    const redirectUrl = `${window.location.origin}/`;
    
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: {
          full_name: fullName,
        },
      },
    });
    return { error: error as Error | null };
  };

  const signOut = async () => {
    localStorage.removeItem('local_mock_auth');
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    setRole(null);
  };

  const value = {
    user,
    session,
    role,
    loading,
    signIn,
    signUp,
    signOut,
    isAdmin: role === 'admin',
    isEditor: role === 'editor',
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
