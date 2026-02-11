import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

interface Profile {
  id: string;
  full_name: string;
  designation: string;
  post_name: string;
  railway_zone: string;
  phone: string | null;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signUp: (email: string, password: string, profileData: Omit<Profile, 'id'>, autoSignIn?: boolean) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
      
      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching profile:', error);
      }
      setProfile(data);
    } catch (err) {
      console.error('Error fetching profile:', err);
    }
  };

  const refreshProfile = async () => {
    if (user) {
      await fetchProfile(user.id);
    }
  };

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          // Use setTimeout to avoid potential race conditions
          setTimeout(() => {
            fetchProfile(session.user.id);
          }, 0);
        } else {
          setProfile(null);
        }
        setLoading(false);
      }
    );

    // THEN check current session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user.id);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { error };
  };

  const signUp = async (
    email: string,
    password: string,
    profileData: Omit<Profile, 'id'>,
    autoSignIn: boolean = true
  ) => {
    // Step 1: Create the auth user in Supabase Auth
    // Pass profile data in user metadata so the database trigger can create the profile
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: window.location.origin,
        data: {
          full_name: profileData.full_name,
          designation: profileData.designation,
          post_name: profileData.post_name,
          railway_zone: profileData.railway_zone,
          phone: profileData.phone,
        },
      },
    });

    if (error) return { error };
    if (!data.user) return { error: new Error('No user returned from signup') };

    // Step 2: Handle profile creation based on whether email confirmation is enabled
    // If no session is returned, email confirmation is enabled and profile will be created by trigger
    if (!data.session) {
      console.log('Email confirmation required. Profile will be created by database trigger.');
      return { error: null };
    }

    // Step 3: If session exists, create profile directly (legacy support)
    // This handles the case when email confirmation is disabled
    let currentSession = null;
    
    if (!autoSignIn) {
      // For admin-created officers, save the admin's current session
      const { data: sessionData } = await supabase.auth.getSession();
      currentSession = sessionData.session;
      
      if (!currentSession) {
        return { error: new Error('No active session found. Admin must be logged in to create officers.') };
      }
    }
    
    // Set the new user's session temporarily (needed for RLS check)
    await supabase.auth.setSession({
      access_token: data.session.access_token,
      refresh_token: data.session.refresh_token,
    });
    
    // Insert profile (this may fail if trigger already created it, which is fine)
    const { error: profileError } = await supabase
      .from('profiles')
      .insert({
        id: data.user.id,
        ...profileData,
      });
    
    // Restore admin's session if this was an admin-created officer
    if (!autoSignIn && currentSession) {
      await supabase.auth.setSession({
        access_token: currentSession.access_token,
        refresh_token: currentSession.refresh_token,
      });
    }
    
    // Ignore duplicate key errors (profile already created by trigger)
    if (profileError && profileError.code !== '23505') {
      console.error('Error creating profile:', profileError);
      return { error: profileError as unknown as Error };
    }

    return { error: null };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    setProfile(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        profile,
        loading,
        signIn,
        signUp,
        signOut,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
