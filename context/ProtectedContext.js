"use client";
import { createContext, useState, useEffect } from "react";
import Cookies from "js-cookie";

const AuthContext = createContext({
  isAuthenticated: "",
  setIsAuthenticated: () => {},
});

const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  
  useEffect(() => {
    const getCookies = Cookies.get("currentUser");
    if (getCookies) {
      setIsAuthenticated(true);
    }
  }, []);

  return (
    <AuthContext.Provider value={{ isAuthenticated, setIsAuthenticated }}>
      {children}
    </AuthContext.Provider>
  );
};

export { AuthContext, AuthProvider };