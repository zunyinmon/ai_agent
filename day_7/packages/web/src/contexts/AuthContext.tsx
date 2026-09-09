import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import type { PublicUser, Role } from '@property-portal/shared';

interface AuthContextType {
  user: PublicUser | null;
  token: string | null;
  isAuthenticated: boolean;
  role: Role | null;
  login: (token: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function decodeJwtPayload(token: string): PublicUser | null {
  try {
    const payload = token.split('.')[1];
    const decoded = JSON.parse(atob(payload));
    return {
      id: decoded.id,
      email: decoded.email,
      role: decoded.role,
      created_at: decoded.created_at ?? '',
    };
  } catch {
    return null;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(() =>
    localStorage.getItem('portal_token'),
  );
  const [user, setUser] = useState<PublicUser | null>(() => {
    const stored = localStorage.getItem('portal_token');
    return stored ? decodeJwtPayload(stored) : null;
  });

  const login = (newToken: string) => {
    localStorage.setItem('portal_token', newToken);
    setToken(newToken);
    setUser(decodeJwtPayload(newToken));
  };

  const logout = () => {
    localStorage.removeItem('portal_token');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!token,
        role: user?.role ?? null,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
