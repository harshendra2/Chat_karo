"use client";
import { createContext, useState, useEffect } from "react";
import Cookies from "js-cookie";

const AuthContext = createContext({
  isAuthenticated: "",
  setIsAuthenticated: () => {},
});

const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState("");
  
  useEffect(() => {
    localStorage.getItem("isAuthenticated");
    const getCookies = Cookies.get("currentUser");
    if (getCookies) {
      setIsAuthenticated("true");
    }
    localStorage.removeItem("isAuthenticated");
    localStorage.removeItem("username");
  }, []);

  useEffect(() => {
    localStorage.setItem("isAuthenticated", isAuthenticated);
  }, [isAuthenticated]);

  return (
    <AuthContext.Provider value={{ isAuthenticated, setIsAuthenticated }}>
      {children}
    </AuthContext.Provider>
  );
};

export { AuthContext, AuthProvider };