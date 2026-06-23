import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import type { ReactNode } from 'react';
import { login as loginService, register as registerService, logout as logoutService, subscribeToAuth } from '@/services/auth.service';
import type { User } from '@/types';

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, displayName: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = subscribeToAuth(setUser, setLoading);
    return unsubscribe;
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const loggedInUser = await loginService(email, password);
    setUser(loggedInUser);
  }, []);

  const register = useCallback(
    async (email: string, password: string, displayName: string) => {
      const newUser = await registerService(email, password, displayName);
      setUser(newUser);
    },
    [],
  );

  const logout = useCallback(async () => {
    await logoutService();
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
