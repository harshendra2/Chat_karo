"use client";
import { createContext, useState, useEffect } from "react";
import Cookies from "js-cookie";

const AuthContext = createContext({
  isAuthenticated: false,
  setIsAuthenticated: () => {},
  isLoading: true,
});

const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    const checkAuth = () => {
      const currentUser = Cookies.get("currentUser");
      const userId = Cookies.get("UserId");
      
      if (currentUser && userId) {
        setIsAuthenticated(true);
      } else {
        setIsAuthenticated(false);
      }
      setIsLoading(false);
    };

    checkAuth();
  }, []);

  return (
    <AuthContext.Provider value={{ isAuthenticated, setIsAuthenticated, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

export { AuthContext, AuthProvider };