import { createContext, useContext, useEffect, useRef, useState } from 'react';
import { supabase, db } from '../lib/supabase';
import { queryClient } from '../lib/queryClient';
import { useOnboardingStore } from '../store/onboardingStore';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const activeUserId = useRef(null);

  const fetchProfile = async (userId) => {
    const { data, error } = await db.profiles()
      .select('*')
      .eq('id', userId)
      .single();
    if (!error && data) setProfile(data);
    return data;
  };

  useEffect(() => {
    // Safety net: if session check hangs (e.g. network hiccup), unblock the UI after 6 s
    const loadingTimeout = setTimeout(() => setLoading(false), 6000);

    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      clearTimeout(loadingTimeout);
      setUser(session?.user ?? null);
      if (session?.user) {
        activeUserId.current = session.user.id;
        fetchProfile(session.user.id).finally(() => setLoading(false));
      } else {
        setLoading(false);
      }
    }).catch(() => {
      clearTimeout(loadingTimeout);
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      const nextUserId = session?.user?.id ?? null;

      // If user changed (different account or signed out) clear onboarding store
      if (nextUserId !== activeUserId.current) {
        useOnboardingStore.getState().reset();
      }
      activeUserId.current = nextUserId;

      setUser(session?.user ?? null);
      if (session?.user) {
        await fetchProfile(session.user.id);
      } else {
        setProfile(null);
        queryClient.clear();
      }
      setLoading(false);
    });

    return () => {
      clearTimeout(loadingTimeout);
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    return data;
  };

  const signUp = async ({ email, password, fullName, companyName, role = 'originator' }) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName, company_name: companyName, role },
      },
    });
    if (error) throw error;
    return data;
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    useOnboardingStore.getState().reset();
    setUser(null);
    setProfile(null);
    queryClient.clear();
  };

  const refreshProfile = () => {
    if (user?.id) return fetchProfile(user.id);
  };

  const isAdmin = profile?.role === 'admin';
  const isOriginator = profile?.role === 'originator';
  const isCustomer = profile?.role === 'customer';
  const onboardingStatus = profile?.onboarding_status;
  const isApproved = onboardingStatus === 'approved';
  const needsOnboarding = isOriginator && !isApproved;

  return (
    <AuthContext.Provider value={{
      user,
      profile,
      loading,
      signIn,
      signUp,
      signOut,
      refreshProfile,
      isAdmin,
      isOriginator,
      isCustomer,
      isApproved,
      needsOnboarding,
      onboardingStatus,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be inside AuthProvider');
  return ctx;
}
