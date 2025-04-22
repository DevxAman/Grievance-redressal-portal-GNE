import React, { createContext, useState, useEffect, ReactNode } from 'react';
import supabase from '../lib/supabase';
import { Session } from '@supabase/supabase-js';
import bcrypt from 'bcryptjs';
import { User } from '../types';

// User types
export type UserData = User;

interface AuthContextType {
  user: UserData | null;
  session: Session | null;
  loading: boolean;
  error: string | null;
  login: (user_id: string, password: string) => Promise<void>;
  signup: (user_id: string, email: string, password: string) => Promise<{ success: boolean; message: string }>;
  logout: () => Promise<void>;
  clearError: () => void;
  verifyEmail: (otp: string) => Promise<boolean>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<UserData | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [pendingUser, setPendingUser] = useState<{ user_id: string; email: string; hashedPassword: string; role: string } | null>(null);
  const [emailOtp, setEmailOtp] = useState<string | null>(null);

  // Check for existing session on mount
  useEffect(() => {
    const getSession = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          throw error;
        }

        setSession(data.session);
        
        if (data.session?.user) {
          await fetchUserData(data.session.user.email || '');
        }
      } catch (error: unknown) {
        console.error('Error getting session:', (error as Error).message);
      } finally {
        setLoading(false);
      }
    };

    getSession();

    // Set up auth state change listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      setSession(session);
      setLoading(true);
      
      if (session?.user) {
        await fetchUserData(session.user.email || '');
      } else {
        setUser(null);
      }
      
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Fetch user data from users table
  const fetchUserData = async (email: string) => {
    try {
      // Find the user in our custom users table
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('email', email)
        .single();

      if (error) {
        throw error;
      }

      if (data) {
        setUser(data as UserData);
      }
    } catch (error: unknown) {
      console.error('Error fetching user data:', (error as Error).message);
      setUser(null);
    }
  };

  // Login function
  const login = async (user_id: string, password: string) => {
    try {
      setLoading(true);
      setError(null);

      // Find the user in the users table
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('user_id', user_id)
        .single();

      if (userError) {
        throw new Error('User not found. Please check your credentials.');
      }

      if (!userData) {
        throw new Error('Invalid user ID or password.');
      }

      // Verify the password
      const passwordMatch = await bcrypt.compare(password, userData.password);
      
      if (!passwordMatch) {
        throw new Error('Invalid user ID or password.');
      }

      // Set the user state
      setUser(userData as UserData);

      // For Supabase auth state (optional)
      try {
        const { data: sessionData, error: sessionError } = await supabase.auth.signInWithPassword({
          email: userData.email,
          password: password, // Temporary, will be overwritten by our custom auth
        });

        if (!sessionError) {
          setSession(sessionData.session);
        }
      } catch (err) {
        // If Supabase auth fails, we still want the user to be logged in via our custom auth
        console.warn('Supabase auth error:', err);
      }
    } catch (error: unknown) {
      console.error('Login failed:', (error as Error).message);
      setError((error as Error).message);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  // Signup function
  const signup = async (user_id: string, email: string, password: string) => {
    try {
      setLoading(true);
      setError(null);

      // Validate email format
      if (!email.endsWith('@gndec.ac.in')) {
        throw new Error('Email must be a valid GNDEC email address (@gndec.ac.in)');
      }

      // Check if user_id already exists
      const { data: existingUserId } = await supabase
        .from('users')
        .select('user_id')
        .eq('user_id', user_id)
        .single();

      if (existingUserId) {
        throw new Error('User ID already exists. Please choose a different one.');
      }

      // Check if email already exists
      const { data: existingEmail } = await supabase
        .from('users')
        .select('email')
        .eq('email', email)
        .single();

      if (existingEmail) {
        throw new Error('Email already registered. Please use a different email or login.');
      }

      // Default role is student for new signups
      const role = 'student';

      // Hash the password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      // Generate OTP for email verification
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      setEmailOtp(otp);

      // Store pending user
      setPendingUser({
        user_id,
        email,
        hashedPassword,
        role
      });

      // Log the OTP to console (for demo purposes)
      console.log(`OTP for ${email}: ${otp}`);

      return { 
        success: true, 
        message: 'Verification code sent to your email. Please verify to complete registration.' 
      };
    } catch (error: unknown) {
      console.error('Signup failed:', (error as Error).message);
      setError((error as Error).message);
      return { success: false, message: (error as Error).message };
    } finally {
      setLoading(false);
    }
  };

  // Email verification with OTP
  const verifyEmail = async (otp: string) => {
    try {
      setLoading(true);
      
      if (!pendingUser) {
        throw new Error('No pending registration found.');
      }

      if (otp !== emailOtp) {
        throw new Error('Invalid verification code. Please try again.');
      }

      // Insert into users table
      const { data, error } = await supabase
        .from('users')
        .insert([
          {
            user_id: pendingUser.user_id,
            email: pendingUser.email,
            password: pendingUser.hashedPassword,
            role: pendingUser.role,
            created_at: new Date().toISOString(),
          }
        ])
        .select();

      if (error) {
        throw error;
      }

      // Optional: Register with Supabase Auth too
      try {
        await supabase.auth.signUp({
          email: pendingUser.email,
          password: pendingUser.hashedPassword,
        });
      } catch (err) {
        console.warn('Supabase auth signup error:', err);
        // Continue regardless, as we're using our custom auth
      }

      setUser(data[0] as UserData);
      setPendingUser(null);
      setEmailOtp(null);
      
      return true;
    } catch (error: unknown) {
      console.error('Email verification failed:', (error as Error).message);
      setError((error as Error).message);
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Logout function
  const logout = async () => {
    try {
      setLoading(true);
      
      // Sign out from Supabase auth if it's being used
      try {
        await supabase.auth.signOut();
      } catch (err) {
        console.warn('Supabase signout error:', err);
      }
      
      setUser(null);
      setSession(null);
    } catch (error: unknown) {
      console.error('Logout failed:', (error as Error).message);
      setError((error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  // Clear error
  const clearError = () => {
    setError(null);
  };

  const value = {
    user,
    session,
    loading,
    error,
    login,
    signup,
    logout,
    clearError,
    verifyEmail,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};