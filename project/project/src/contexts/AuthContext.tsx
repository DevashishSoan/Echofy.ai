import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase, handleSupabaseError } from '../lib/supabase';
import type { User as SupabaseUser, Session } from '@supabase/supabase-js';

interface User {
  id: string;
  email: string;
  name: string;
  plan: 'free' | 'pro' | 'enterprise';
  emailVerified: boolean;
  createdAt: Date;
  lastLogin: Date;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, name: string) => Promise<void>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updateUser: (updates: Partial<User>) => Promise<void>;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Convert Supabase user to our User type with enhanced error handling
  const convertSupabaseUser = async (supabaseUser: SupabaseUser): Promise<User | null> => {
    try {
      // Get user profile from profiles table with retry logic and better error handling
      let profile = null;
      let retryCount = 0;
      const maxRetries = 3;

      while (!profile && retryCount < maxRetries) {
        try {
          const { data: profileData, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', supabaseUser.id)
            .maybeSingle();

          if (profileError) {
            if (profileError.code === 'PGRST116') {
              // No profile found - this might be a new user
              console.log('No profile found for user, will be created by trigger');
              break;
            }
            throw profileError;
          }

          if (profileData) {
            profile = profileData;
            break;
          }

          // Wait before retry with exponential backoff
          await new Promise(resolve => setTimeout(resolve, 500 * Math.pow(2, retryCount)));
          retryCount++;
        } catch (err) {
          console.error(`Profile fetch attempt ${retryCount + 1} failed:`, err);
          if (retryCount === maxRetries - 1) {
            console.warn('Max retries reached, proceeding with basic user data');
            break;
          }
          retryCount++;
        }
      }

      // Return user data with profile info if available, fallback to basic info
      return {
        id: supabaseUser.id,
        email: supabaseUser.email || '',
        name: profile?.name || supabaseUser.user_metadata?.name || supabaseUser.email?.split('@')[0] || 'User',
        plan: profile?.plan || 'free',
        emailVerified: supabaseUser.email_confirmed_at !== null,
        createdAt: new Date(supabaseUser.created_at),
        lastLogin: new Date(supabaseUser.last_sign_in_at || supabaseUser.created_at)
      };
    } catch (error) {
      console.error('Error converting user:', error);
      // Return basic user info as fallback
      return {
        id: supabaseUser.id,
        email: supabaseUser.email || '',
        name: supabaseUser.user_metadata?.name || supabaseUser.email?.split('@')[0] || 'User',
        plan: 'free',
        emailVerified: supabaseUser.email_confirmed_at !== null,
        createdAt: new Date(supabaseUser.created_at),
        lastLogin: new Date(supabaseUser.last_sign_in_at || supabaseUser.created_at)
      };
    }
  };

  // Initialize auth state with better error handling
  useEffect(() => {
    let mounted = true;

    const initializeAuth = async () => {
      try {
        setIsLoading(true);
        
        // Get initial session
        const { data: { session: initialSession }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error('Session error:', sessionError);
          setError(handleSupabaseError(sessionError, 'get session'));
          return;
        }

        if (initialSession?.user && mounted) {
          try {
            const userData = await convertSupabaseUser(initialSession.user);
            setSession(initialSession);
            setUser(userData);
          } catch (userError) {
            console.error('User conversion error:', userError);
            setError('Failed to load user profile');
          }
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        if (mounted) {
          setError('Failed to initialize authentication');
        }
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    };

    initializeAuth();

    // Listen for auth changes with enhanced error handling
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mounted) return;

        console.log('Auth state change:', event, session?.user?.id);
        
        try {
          setSession(session);
          
          if (session?.user) {
            const userData = await convertSupabaseUser(session.user);
            setUser(userData);
            setError(null); // Clear any previous errors on successful auth
          } else {
            setUser(null);
          }
        } catch (error) {
          console.error('Auth state change error:', error);
          setError('Failed to update authentication state');
        }
        
        setIsLoading(false);
      }
    );

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password
      });

      if (signInError) {
        throw signInError;
      }

      if (data.user) {
        const userData = await convertSupabaseUser(data.user);
        setUser(userData);
        setSession(data.session);
      }
    } catch (error: any) {
      const errorMessage = handleSupabaseError(error, 'sign in');
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const signup = async (email: string, password: string, name: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      console.log('Starting signup process...');
      
      // Sign up the user - profile will be created automatically by database trigger
      const { data, error: signUpError } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          data: {
            name: name.trim()
          }
        }
      });

      if (signUpError) {
        console.error('Signup error:', signUpError);
        throw signUpError;
      }

      if (!data.user) {
        throw new Error('User creation failed');
      }

      console.log('User created successfully:', data.user.id);

      // Wait a moment for the trigger to create the profile
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Convert user data - profile should be available via trigger
      const userData = await convertSupabaseUser(data.user);
      setUser(userData);
      setSession(data.session);

      console.log('Signup completed successfully');
    } catch (error: any) {
      console.error('Signup process error:', error);
      const errorMessage = handleSupabaseError(error, 'sign up');
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        throw error;
      }
      
      setUser(null);
      setSession(null);
      setError(null);
    } catch (error: any) {
      console.error('Logout error:', error);
      const errorMessage = handleSupabaseError(error, 'sign out');
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const resetPassword = async (email: string) => {
    setError(null);
    
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`
      });

      if (error) {
        throw error;
      }
    } catch (error: any) {
      const errorMessage = handleSupabaseError(error, 'reset password');
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const updateUser = async (updates: Partial<User>) => {
    if (!user || !session) {
      throw new Error('No authenticated user');
    }

    try {
      // Update profile in database
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          name: updates.name,
          plan: updates.plan,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);

      if (profileError) {
        throw profileError;
      }

      // Update auth metadata if name changed
      if (updates.name && updates.name !== user.name) {
        const { error: authError } = await supabase.auth.updateUser({
          data: { name: updates.name }
        });

        if (authError) {
          console.error('Auth metadata update error:', authError);
        }
      }

      // Update local state
      setUser(prev => prev ? { ...prev, ...updates } : null);
    } catch (error: any) {
      const errorMessage = handleSupabaseError(error, 'update profile');
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const clearError = () => {
    setError(null);
  };

  return (
    <AuthContext.Provider value={{
      user,
      session,
      login,
      signup,
      logout,
      resetPassword,
      updateUser,
      isAuthenticated: !!user,
      isLoading,
      error,
      clearError
    }}>
      {children}
    </AuthContext.Provider>
  );
};