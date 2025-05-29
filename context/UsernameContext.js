"use client";
import { createContext, useState, useEffect } from "react";

const UserNameContext = createContext({
  username: "",
  setUsername: () => {},
});

const UsernameProvider = ({ children }) => {
  const [username, setUsername] = useState("");
  
  useEffect(() => {
    const storedUsername = localStorage.getItem("username");
    if (storedUsername) {
      setUsername(storedUsername);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("username", username);
  }, [username]);

  return (
    <UserNameContext.Provider value={{ username, setUsername }}>
      {children}
    </UserNameContext.Provider>
  );
};

export { UserNameContext, UsernameProvider };