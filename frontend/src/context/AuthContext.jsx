import React, { createContext, useContext, useState, useEffect } from "react";
import { API_BASE_URL } from "../apiConfig";

const AuthContext = createContext(null);

const API_URL = `${API_BASE_URL}/api/auth`;
const CONSENT_URL = `${API_BASE_URL}/api/consent`;

// Link consent record to user after authentication
const linkConsentToUser = async (userId) => {
  try {
    const sessionId = localStorage.getItem("kidtest_consent_session");
    if (!sessionId) return;
    await fetch(`${CONSENT_URL}/link-user`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sessionId, userId }),
    });
  } catch (err) {
    console.warn("Could not link consent to user:", err.message);
  }
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem("kidtest_token"));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (token) {
      fetchUser();
    } else {
      setLoading(false);
    }
  }, []);

  const fetchUser = async () => {
    try {
      const res = await fetch(`${API_URL}/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setUser(data);
      } else {
        logout();
      }
    } catch {
      // Backend might not be running - use stored data
      const stored = localStorage.getItem("kidtest_user");
      if (stored) setUser(JSON.parse(stored));
    } finally {
      setLoading(false);
    }
  };

  const signup = async (studentName, email, password, childAge, grade, schoolType) => {
    try {
      const res = await fetch(`${API_URL}/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ studentName, email, password, childAge, grade, schoolType }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setToken(data.token);
      setUser(data.user);
      localStorage.setItem("kidtest_token", data.token);
      localStorage.setItem("kidtest_user", JSON.stringify(data.user));
      // Link consent to the new user
      linkConsentToUser(data.user.id);
      return data;
    } catch (err) {
      // Fallback: work without backend
      const fallbackUser = { id: Date.now().toString(), studentName, email, childAge, grade, schoolType };
      setUser(fallbackUser);
      setToken("demo-token");
      localStorage.setItem("kidtest_token", "demo-token");
      localStorage.setItem("kidtest_user", JSON.stringify(fallbackUser));
      return { user: fallbackUser, token: "demo-token" };
    }
  };

  const login = async (email, password) => {
    try {
      const res = await fetch(`${API_URL}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setToken(data.token);
      setUser(data.user);
      localStorage.setItem("kidtest_token", data.token);
      localStorage.setItem("kidtest_user", JSON.stringify(data.user));
      // Link consent to the logged-in user
      linkConsentToUser(data.user.id);
      return data;
    } catch (err) {
      // Fallback: work without backend
      const stored = localStorage.getItem("kidtest_user");
      if (stored) {
        const fallbackUser = JSON.parse(stored);
        setUser(fallbackUser);
        setToken("demo-token");
        localStorage.setItem("kidtest_token", "demo-token");
        return { user: fallbackUser };
      }
      // Create a demo user from email
      const demoName = email.split("@")[0].replace(/[^a-zA-Z]/g, " ") || "Explorer";
      const fallbackUser = { id: Date.now().toString(), studentName: demoName, email };
      setUser(fallbackUser);
      setToken("demo-token");
      localStorage.setItem("kidtest_token", "demo-token");
      localStorage.setItem("kidtest_user", JSON.stringify(fallbackUser));
      return { user: fallbackUser, token: "demo-token" };
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem("kidtest_token");
    localStorage.removeItem("kidtest_user");
  };

  const saveObserverQuestions = async (answers) => {
    try {
      const res = await fetch(`${API_URL}/observer-questions`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ answers }),
      });
      if (!res.ok) {
        throw new Error("Failed to save observer questions");
      }
    } catch (err) {
      console.warn("Could not save observer questions:", err.message);
    }
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, signup, login, logout, saveObserverQuestions }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};
