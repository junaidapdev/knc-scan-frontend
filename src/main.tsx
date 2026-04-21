import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { Toaster } from 'sonner';

import App from './App';
import { AppErrorBoundary } from '@/components/common';
import { TOAST_DURATION_MS } from '@/constants/ui';
import { AdminAuthProvider } from '@/contexts/AdminAuthContext';
import { CustomerAuthProvider } from '@/contexts/CustomerAuthContext';
import { initSentry } from '@/lib/sentry';
import './lib/i18n';
import './index.css';

initSentry();

const rootEl = document.getElementById('root');
if (!rootEl) {
  throw new Error('Root element #root not found in index.html');
}

ReactDOM.createRoot(rootEl).render(
  <React.StrictMode>
    <AppErrorBoundary>
      <BrowserRouter>
        <CustomerAuthProvider>
          <AdminAuthProvider>
            <App />
            <Toaster
              position="top-center"
              richColors
              duration={TOAST_DURATION_MS}
              toastOptions={{
                style: {
                  fontFamily:
                    '"DM Sans", system-ui, "Noto Sans Arabic", sans-serif',
                },
              }}
            />
          </AdminAuthProvider>
        </CustomerAuthProvider>
      </BrowserRouter>
    </AppErrorBoundary>
  </React.StrictMode>,
);
