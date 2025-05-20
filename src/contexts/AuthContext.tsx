import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';
import { useGoogleLogin } from '@react-oauth/google';
import { supabase } from '../lib/supabase';
import { ADMIN_EMAIL } from '../lib/constants';

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<User>;
  register: (email: string, name: string, password: string) => Promise<User>;
  logout: () => Promise<void>;
  googleSignIn: () => Promise<User>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const fetchUserData = async (userId: string, email: string) => {
      try {
        const { data: userData, error } = await supabase
          .from('users')
          .select('*')
          .eq('id', userId)
          .maybeSingle();

        if (error) throw error;

        if (userData) {
          setUser({
            id: userId,
            email: email,
            name: userData.name || 'User',
            isAdmin: userData.is_admin || email === ADMIN_EMAIL,
          });
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
        setUser(null);
      }
    };

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        fetchUserData(session.user.id, session.user.email!);
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        fetchUserData(session.user.id, session.user.email!);
      } else {
        setUser(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const login = async (email: string, password: string): Promise<User> => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        throw new Error('Invalid login credentials');
      }

      if (!data.user) {
        throw new Error('No user data returned');
      }

      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('id', data.user.id)
        .single();

      if (userError) {
        throw new Error('Failed to fetch user data');
      }

      const user: User = {
        id: data.user.id,
        email: data.user.email!,
        name: userData?.name || data.user.user_metadata.name || 'User',
        isAdmin: userData?.is_admin || email === ADMIN_EMAIL,
      };

      setUser(user);
      return user;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const register = async (email: string, name: string, password: string): Promise<User> => {
    try {
      // Check if user exists first
      const { data: existingUser } = await supabase
        .from('users')
        .select('id')
        .eq('email', email)
        .maybeSingle();

      if (existingUser) {
        throw new Error('An account with this email already exists');
      }

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
          },
        },
      });

      if (error) {
        throw new Error(error.message);
      }

      if (!data.user) {
        throw new Error('Registration failed');
      }

      const { error: userError } = await supabase
        .from('users')
        .insert([
          {
            id: data.user.id,
            email: data.user.email,
            name,
            is_admin: email === ADMIN_EMAIL,
          },
        ]);

      if (userError) {
        throw new Error('Failed to create user record');
      }

      const user: User = {
        id: data.user.id,
        email: data.user.email!,
        name,
        isAdmin: email === ADMIN_EMAIL,
      };

      return user;
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  };

  const logout = async (): Promise<void> => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('Logout error:', error.message);
      }
      setUser(null);
    } catch (error) {
      console.error('Unexpected error during logout:', error);
    }
  };

  const googleLogin = useGoogleLogin({
    onSuccess: async (response) => {
      try {
        const res = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
          headers: {
            Authorization: `Bearer ${response.access_token}`,
          },
        });
        
        const data = await res.json();
        
        const { data: authData, error } = await supabase.auth.signInWithOAuth({
          provider: 'google',
          options: {
            queryParams: {
              access_token: response.access_token,
            },
          },
        });

        if (error) throw error;
        if (!authData.user) throw new Error('No user data returned');

        const { data: userData, error: userError } = await supabase
          .from('users')
          .upsert({
            id: authData.user.id,
            email: authData.user.email,
            name: data.name,
            is_admin: authData.user.email === ADMIN_EMAIL,
          })
          .select()
          .single();

        if (userError) throw userError;

        return {
          id: authData.user.id,
          email: authData.user.email!,
          name: userData.name,
          isAdmin: userData.is_admin,
        };
      } catch (err) {
        console.error('Error fetching Google user info:', err);
        throw new Error('Failed to sign in with Google');
      }
    },
    onError: () => {
      throw new Error('Google sign in failed');
    },
  });

  const googleSignIn = async (): Promise<User> => {
    return new Promise((resolve, reject) => {
      googleLogin();
      const checkUser = setInterval(() => {
        if (user) {
          clearInterval(checkUser);
          resolve(user);
        }
      }, 100);

      setTimeout(() => {
        clearInterval(checkUser);
        reject(new Error('Google sign in timeout'));
      }, 30000);
    });
  };

  const value = {
    user,
    login,
    register,
    logout,
    googleSignIn,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};