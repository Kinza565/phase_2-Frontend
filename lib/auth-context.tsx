'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import Cookies from 'js-cookie';
import { authApi } from './api';

interface User {
  id: string;
  email: string;
  createdAt?: string;
  updatedAt?: string;
  created_at?: string;
  updated_at?: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const storedToken = Cookies.get('token');
    if (storedToken) {
      setToken(storedToken);
      // Validate token and fetch user info
      const validateToken = async () => {
        try {
          const response = await authApi.session();
          if (response.data.user) {
            setUser(response.data.user);
          } else {
            // Token invalid, clear it
            Cookies.remove('token');
            setToken(null);
          }
        } catch (error) {
          console.error('Token validation failed:', error);
          Cookies.remove('token');
          setToken(null);
        }
      };
      validateToken();
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const response = await authApi.signin({ email, password });

      if (response.data.user && response.data.access_token) {
        setUser(response.data.user);
        Cookies.set('token', response.data.access_token, { expires: 7 });
        setToken(response.data.access_token);
      } else {
        throw new Error('Login failed');
      }
    } catch (error) {
      console.error('Login error:', error);
      throw new Error('Invalid email or password');
    } finally {
      setIsLoading(false);
    }
  };

  const signup = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const response = await authApi.signup({ email, password });
      if (response.data.user && response.data.access_token) {
        setUser(response.data.user);
        Cookies.set('token', response.data.access_token, { expires: 7 });
        setToken(response.data.access_token);
      } else {
        // Fallback: attempt login if backend doesn't return token
        await login(email, password);
      }
    } catch (error) {
      console.error('Signup error:', error);
      throw new Error('Signup failed');
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      await authApi.signout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      Cookies.remove('token');
      setToken(null);
      setUser(null);
    }
  };

  const value: AuthContextType = {
    user,
    token,
    login,
    signup,
    logout,
    isLoading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
