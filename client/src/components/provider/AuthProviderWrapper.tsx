"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type AuthContextType = {
  user: any;
  setUser: (user: any) => void;
  logout: () => void;
  isAuthenticated: boolean;
  isLoading: boolean;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProviderWrapper({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Decode and check token expiration
  const isTokenExpired = (token: string | null): boolean => {
    if (!token) return true;
    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      return payload.exp * 1000 < Date.now();
    } catch {
      return true;
    }
  };

  const logout = () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("user");
    document.cookie = "authToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
    setUser(null);
    router.push("/login");
  };

useEffect(() => {
  const storedUser = localStorage.getItem("user");
  const token = localStorage.getItem("authToken");

  if (token && storedUser && !isTokenExpired(token)) {
    setUser(JSON.parse(storedUser));
  }

  setIsLoading(false);
}, []);


  useEffect(() => {
    const interval = setInterval(() => {
      const token = localStorage.getItem("authToken");
      if (isTokenExpired(token)) {
        logout();
      }
    }, 60 * 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        setUser,
        logout,
        isAuthenticated: !!user,
        isLoading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProviderWrapper");
  return context;
};
