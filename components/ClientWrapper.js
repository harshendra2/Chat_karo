// components/ClientWrapper.js
'use client';

import { PageProvider } from '../context/PageContext';
import { ToastProvider } from '../context/ToastContext';

export default function ClientWrapper({ children }) {
  return (
    <PageProvider>
      <ToastProvider>
        {children}
      </ToastProvider>
    </PageProvider>
  );
}

