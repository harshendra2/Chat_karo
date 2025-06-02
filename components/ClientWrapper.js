// components/ClientWrapper.js
'use client';

import { PageProvider } from '../context/PageContext';
import { ToastProvider } from '../context/ToastContext';
import { AuthProvider } from "../context/AuthContext"; 

export default function ClientWrapper({ children }) {
  return (
    <AuthProvider>
    <PageProvider>
      <ToastProvider>
        {children}
      </ToastProvider>
    </PageProvider>
    </AuthProvider>
  );
}

