"use client";
import { useContext, useEffect } from "react";
import { useRouter } from "next/navigation";
import { AuthContext } from "../context/ProtectedContext";

const LoginProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useContext(AuthContext);
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/dashboard");
    }
  }, [isAuthenticated, router]);

  if (!isAuthenticated) return null; 

  return children;
};

export default LoginProtectedRoute;
