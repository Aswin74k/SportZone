import React, { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return !!(localStorage.getItem("access") || localStorage.getItem("token"));
  });
  const [user, setUser] = useState(() => {
    const token = localStorage.getItem("access") || localStorage.getItem("token");
    if (token) {
      const storedUser = localStorage.getItem("user");
      if (storedUser) {
        try {
          return JSON.parse(storedUser);
        } catch {
          return { name: localStorage.getItem("user_name") || "User" };
        }
      }
      return { name: localStorage.getItem("user_name") || "User" };
    }
    return null;
  });

  useEffect(() => {
    // Sync via storage event (cross-tab) and custom event
    const handleStorageChange = () => {
      const newToken = localStorage.getItem("access") || localStorage.getItem("token");
      if (newToken) {
        setIsAuthenticated(true);
        const u = localStorage.getItem("user");
        try {
          setUser(u ? JSON.parse(u) : { name: localStorage.getItem("user_name") || "User" });
        } catch {
          setUser({ name: localStorage.getItem("user_name") || "User" });
        }
      } else {
        setIsAuthenticated(false);
        setUser(null);
      }
    };

    window.addEventListener("storage", handleStorageChange);
    window.addEventListener("authChange", handleStorageChange);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("authChange", handleStorageChange);
    };
  }, []);

  const login = (userData) => {
    if (userData) {
      localStorage.setItem("user", JSON.stringify(userData));
      if (userData.name) localStorage.setItem("user_name", userData.name);
      else if (userData.username) localStorage.setItem("user_name", userData.username);
      setUser(userData);
    } else {
      setUser({ name: "User" });
    }
    setIsAuthenticated(true);
    // Fire event so same window updates immediately if not using context natively in some spots
    window.dispatchEvent(new Event("authChange"));
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("access");
    localStorage.removeItem("refresh");
    localStorage.removeItem("user");
    localStorage.removeItem("user_name");
    setIsAuthenticated(false);
    setUser(null);
    window.dispatchEvent(new Event("authChange"));
    window.dispatchEvent(new Event("logoutSuccess"));
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
