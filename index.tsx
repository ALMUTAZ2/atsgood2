
/**
 * Advanced Process Polyfill for Vite/Vercel Environments.
 * Detects variables from both traditional process.env and Vite's import.meta.env.
 */
(function() {
  const windowObj = window as any;
  
  // 1. Initialize process.env if it doesn't exist
  if (typeof windowObj.process === 'undefined') {
    windowObj.process = { env: {} };
  } else if (!windowObj.process.env) {
    windowObj.process.env = {};
  }

  // 2. Try to grab variables from Vite's import.meta.env (if present)
  try {
    // @ts-ignore - import.meta is a Vite-specific feature
    const viteEnv = (import.meta as any).env || {};
    Object.keys(viteEnv).forEach(key => {
      windowObj.process.env[key] = viteEnv[key];
    });
    
    // 3. Bridge the prefix gap: Map VITE_API_KEY to API_KEY if needed
    if (!windowObj.process.env.API_KEY && windowObj.process.env.VITE_API_KEY) {
      windowObj.process.env.API_KEY = windowObj.process.env.VITE_API_KEY;
    }
  } catch (e) {
    // Fail silently if import.meta is not supported in this specific bundle context
  }
})();

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
