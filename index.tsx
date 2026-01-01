
/**
 * Initialize process polyfill immediately.
 * In production environments like Vercel, API_KEY is injected into process.env.
 * Hardcoding the provided key as a direct environment override.
 */
if (typeof (window as any).process === 'undefined') {
  (window as any).process = { env: {} };
} else if (!(window as any).process.env) {
  (window as any).process.env = {};
}

// Inject the provided API Key directly into the environment
(window as any).process.env.API_KEY = "AIzaSyA0zxxgHESUqLIPmL1qooWarXgjacDT2-s";

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
