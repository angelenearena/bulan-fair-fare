import React, { createContext, useContext, ReactNode } from "react";
import { useAuth } from "../hooks/useAuth";
import { useNotifications } from "../hooks/useNotifications";
import { AppUser, UserRole } from "../types";

interface AuthContextValue {
  user: AppUser | null;
  loading: boolean;
  isGuest: boolean;
  isCommuter: boolean;
  isAdmin: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const { user, loading, signIn, register, signOut } = useAuth();

  // Register Expo push token whenever user logs in/out
  useNotifications(user);

  const isGuest = !user;
  const isCommuter = user?.role === "commuter";
  const isAdmin = user?.role === "admin";

  return (
    <AuthContext.Provider value={{ user, loading, isGuest, isCommuter, isAdmin, signIn, register, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuthContext(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuthContext must be used within AuthProvider");
  return ctx;
}
