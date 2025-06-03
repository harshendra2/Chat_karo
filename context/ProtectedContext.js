// context/AuthContext.js (no changes needed)
"use client";
import { createContext, useState, useEffect } from "react";
import Cookies from "js-cookie";

const LoginAuthContext = createContext({
  isAuthenticated: "",
  setIsAuthenticated: () => {},
});

const AuthProvider = ({ children }) => {
  const [isAuthenticated, LoginsetIsAuthenticated] = useState(false);
  
  useEffect(() => {
    const getCookies = Cookies.get("currentUser");
    if (getCookies) {
      LoginsetIsAuthenticated(true);
    }
  }, []);

  return (
    <LoginAuthContext.Provider value={{ isAuthenticated, LoginsetIsAuthenticated }}>
      {children}
    </LoginAuthContext.Provider>
  );
};

export { LoginAuthContext, AuthProvider };