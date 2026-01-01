
/**
 * Initialize process polyfill immediately.
 * In production environments like Vercel, API_KEY is injected into process.env.
 */
if (typeof (window as any).process === 'undefined') {
  (window as any).process = { env: {} };
} else if (!(window as any).process.env) {
  (window as any).process.env = {};
}

// The API_KEY should be set in your Vercel/System Environment Variables.
// We no longer hardcode it here to keep your account secure.

import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
