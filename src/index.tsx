/**
 * Copyright (c) 2025 Hanish. All rights reserved.
 * Licensed under the MIT License.
 */

import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './app';
import { AuthProvider } from './context/AuthContext';
import './styles/globals.css';

// Mocked API by default in dev, so contributors without backend access get a
// working app out of the box (see src/mocks). Opt out with VITE_USE_REAL_API=true
// in .env.local if you have a real backend running and want live data.
async function enableMocksIfNeeded() {
  if (!import.meta.env.DEV || import.meta.env.VITE_USE_REAL_API === 'true')
    return;
  const { worker } = await import('./mocks/browser');
  await worker.start({ onUnhandledRequest: 'bypass' });
}

async function bootstrap() {
  await enableMocksIfNeeded();

  const root = ReactDOM.createRoot(
    document.getElementById('root') as HTMLElement
  );

  root.render(
    <React.StrictMode>
      <BrowserRouter>
        <AuthProvider>
          <App />
        </AuthProvider>
      </BrowserRouter>
    </React.StrictMode>
  );
}

bootstrap();
