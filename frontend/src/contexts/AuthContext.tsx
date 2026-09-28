import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, ActorRole } from '@/lib/types';
import { authApi } from '@/lib/api';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password?: string) => Promise<void>;
  register: (name: string, email: string, password?: string) => Promise<void>;
  submitOnboarding: (data: { role: string; location: string; government_id_type: string; government_id_number: string }) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const restoreSession = async () => {
      if (!localStorage.getItem('herbchain-token')) {
        setIsLoading(false);
        return;
      }
      try {
        const response = await authApi.me();
        const liveUser: User = { ...response };
        setUser(liveUser);
        localStorage.setItem('herbchain-user', JSON.stringify(liveUser));
      } catch {
        localStorage.removeItem('herbchain-token');
        localStorage.removeItem('herbchain-user');
      } finally {
        setIsLoading(false);
      }
    };
    restoreSession();
  }, []);

  const login = async (email: string, password?: string) => {
    setIsLoading(true);
    try {
      const response = await authApi.login({ email, password: password || 'password123' });
      localStorage.setItem('herbchain-token', response.access_token);
      
      const profile = await authApi.me();
      const loggedInUser: User = { ...profile };
      setUser(loggedInUser);
      localStorage.setItem('herbchain-user', JSON.stringify(loggedInUser));
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (name: string, email: string, password?: string) => {
    setIsLoading(true);
    try {
      await authApi.register({ name, email, password: password || 'password123' });
      await login(email, password);
    } catch (error) {
      console.error('Register error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const submitOnboarding = async (data: { role: string; location: string; government_id_type: string; government_id_number: string }) => {
    setIsLoading(true);
    try {
      const profile = await authApi.submitOnboarding(data);
      const updatedUser: User = { ...profile };
      setUser(updatedUser);
      localStorage.setItem('herbchain-user', JSON.stringify(updatedUser));
    } catch (error) {
      console.error('Onboarding error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('herbchain-user');
    localStorage.removeItem('herbchain-token');
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, isLoading, login, register, submitOnboarding, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
}
