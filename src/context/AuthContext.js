"use client";

import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  const getApiUrl = () => {
    if (typeof window !== "undefined") {
      const hostname = window.location.hostname;
      if (hostname.includes("vercel.app") || hostname.includes("cropmax-ai")) {
        return "https://cropmax-ai.onrender.com";
      }
    }
    return process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
  };

  const API_URL = getApiUrl();

  // Fetch the profile of the current logged-in user using their token
  const fetchProfile = useCallback(async (authToken) => {
    try {
      const res = await fetch(`${API_URL}/api/auth/me`, {
        headers: {
          Authorization: `Bearer ${authToken}`
        }
      });
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
        setToken(authToken);
      } else {
        // Token is invalid/expired
        localStorage.removeItem("cropmax_token");
        setUser(null);
        setToken(null);
      }
    } catch (err) {
      console.error("Error fetching user profile:", err);
    } finally {
      setIsLoading(false);
    }
  }, [API_URL]);

  // Check localStorage on mount
  useEffect(() => {
    const storedToken = localStorage.getItem("cropmax_token");
    if (storedToken) {
      fetchProfile(storedToken);
    } else {
      setIsLoading(false);
    }
  }, [fetchProfile]);

  // Login handler
  const login = async (email, password) => {
    setIsLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ email, password })
      });

      const data = await res.json();

      if (!res.ok) {
        throw { 
          status: res.status, 
          message: data.error?.message || "Login failed. Please check your credentials." 
        };
      }

      localStorage.setItem("cropmax_token", data.token);
      setToken(data.token);
      setUser(data.user);
      return data;
    } finally {
      setIsLoading(false);
    }
  };

  // Register handler
  const register = async (name, email, password, role = "Farmer") => {
    setIsLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ name, email, password, role })
      });

      const data = await res.json();

      if (!res.ok) {
        throw { 
          status: res.status, 
          message: data.error?.message || "Registration failed." 
        };
      }

      localStorage.setItem("cropmax_token", data.token);
      setToken(data.token);
      setUser(data.user);
      return data;
    } finally {
      setIsLoading(false);
    }
  };

  // Logout handler
  const logout = () => {
    localStorage.removeItem("cropmax_token");
    setToken(null);
    setUser(null);
    router.push("/login");
  };

  // OAuth success login handler
  const oauthLogin = async (oauthToken) => {
    setIsLoading(true);
    localStorage.setItem("cropmax_token", oauthToken);
    setToken(oauthToken);
    await fetchProfile(oauthToken);
    router.push("/dashboard");
  };

  const value = {
    user,
    token,
    isLoading,
    isAuthenticated: !!user,
    login,
    register,
    logout,
    oauthLogin,
    API_URL
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
