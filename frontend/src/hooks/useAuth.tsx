import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';
import { User } from '../types';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  loginWithGoogle: () => void;
  loginWithEmail: (email: string, name?: string) => Promise<void>;
  devLogin: () => Promise<void>;
  logout: () => Promise<void>;
  setUserFromToken: (token: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchCurrentUser = async () => {
    try {
      const userData = await api.getCurrentUser();
      setUser(userData);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCurrentUser();
  }, []);

  const loginWithGoogle = () => {
    const backendUrl =
      import.meta.env.VITE_API_URL ||
      (typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
        ? '/api'
        : 'https://reachinbox-email-scheduler-production-d5fc.up.railway.app/api');
    window.location.href = `${backendUrl}/auth/google`;
  };

  const loginWithEmail = async (email: string, name?: string) => {
    setLoading(true);
    try {
      const { user: userData } = await api.loginWithEmail(email, name);
      setUser(userData);
    } finally {
      setLoading(false);
    }
  };

  const devLogin = async () => {
    setLoading(true);
    try {
      const { user: devUserData } = await api.devLogin();
      setUser(devUserData);
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await api.logout();
    } finally {
      setUser(null);
    }
  };

  const setUserFromToken = async (token: string) => {
    localStorage.setItem('reachinbox_token', token);
    await fetchCurrentUser();
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        loginWithGoogle,
        loginWithEmail,
        devLogin,
        logout,
        setUserFromToken,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
