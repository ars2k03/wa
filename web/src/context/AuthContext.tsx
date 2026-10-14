'use client';

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';
import { api } from '@/lib/api';
import type { User } from '@/types/types';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password?: string) => Promise<any>;
  register: (name: string, email: string, password?: string) => Promise<any>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const TOKEN_KEY = 'telegraph_auth_token';
const USER_KEY = 'telegraph_auth_user';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Restore and validate authentication on boot
  useEffect(() => {
    let isCancelled = false;

    const initAuth = async () => {
      try {
        const savedToken = localStorage.getItem(TOKEN_KEY);
        const savedUserStr = localStorage.getItem(USER_KEY);

        if (!savedToken) {
          if (!isCancelled) {
            setToken(null);
            setUser(null);
            setIsLoading(false);
          }
          return;
        }

        // Optimistically set cached user so UI doesn't flicker while checking
        if (savedUserStr) {
          try {
            const parsedUser = JSON.parse(savedUserStr);
            if (!isCancelled) {
              setToken(savedToken);
              setUser(parsedUser);
            }
          } catch {
            // ignore JSON parse error
          }
        }

        // Validate token with backend /auth/me
        const res = await api.getMe();
        if (res.success && res.data) {
          if (!isCancelled) {
            setUser(res.data);
            setToken(savedToken);
            localStorage.setItem(USER_KEY, JSON.stringify(res.data));
          }
        } else {
          throw new Error('Invalid authentication session');
        }
      } catch (err) {
        console.warn('Session expired or invalid, logging out:', err);
        if (!isCancelled) {
          setToken(null);
          setUser(null);
          localStorage.removeItem(TOKEN_KEY);
          localStorage.removeItem(USER_KEY);
        }
      } finally {
        if (!isCancelled) {
          setIsLoading(false);
        }
      }
    };

    void initAuth();

    // Listen to token expired events from api.ts (401 interceptor)
    const handleAuthExpired = () => {
      setToken(null);
      setUser(null);
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
    };

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === TOKEN_KEY || e.key === USER_KEY) {
        const currToken = localStorage.getItem(TOKEN_KEY);
        const currUserStr = localStorage.getItem(USER_KEY);
        if (currToken && currUserStr) {
          try {
            setToken(currToken);
            setUser(JSON.parse(currUserStr));
          } catch {
            setToken(null);
            setUser(null);
          }
        } else {
          setToken(null);
          setUser(null);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('telegraph_auth_expired', handleAuthExpired);

    return () => {
      isCancelled = true;
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('telegraph_auth_expired', handleAuthExpired);
    };
  }, []);

  const login = useCallback(
    async (email: string, password?: string) => {
      setIsLoading(true);
      try {
        const res = await api.login({ email, password });
        if (res.success && res.data?.token) {
          const authUser = res.data.user;
          const authToken = res.data.token;
          setUser(authUser);
          setToken(authToken);
          localStorage.setItem(TOKEN_KEY, authToken);
          localStorage.setItem(USER_KEY, JSON.stringify(authUser));
        }
        return res;
      } finally {
        setIsLoading(false);
      }
    },
    [],
  );

  const register = useCallback(
    async (name: string, email: string, password?: string) => {
      setIsLoading(true);
      try {
        const res = await api.register({ name, email, password });
        if (!res.success) {
          throw new Error(res.message || 'Registration failed');
        }
        return res;
      } finally {
        setIsLoading(false);
      }
    },
    [],
  );

  const logout = useCallback(() => {
    setUser(null);
    setToken(null);
    try {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
      localStorage.clear();
      sessionStorage.clear();
    } catch (err) {
      console.warn('Error clearing storage on logout:', err);
    }
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        isAuthenticated: !!user && !!token,
        login,
        register,
        logout,
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
