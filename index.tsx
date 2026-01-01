
/**
 * CRITICAL VITE POLYFILL
 * This block must run before ANY other imports.
 * It maps Vite's import.meta.env to process.env for Gemini SDK compatibility.
 */
(function() {
  const windowObj = window as any;
  
  // Initialize process.env structure
  if (typeof windowObj.process === 'undefined') {
    windowObj.process = { env: {} };
  } else if (!windowObj.process.env) {
    windowObj.process.env = {};
  }

  // Explicitly grab the key from Vite's environment
  // Vite requires VITE_ prefix to expose variables to the client
  // @ts-ignore
  const viteEnv = (import.meta as any).env || {};
  const apiKey = viteEnv.VITE_API_KEY || viteEnv.API_KEY || '';

  // Set the API_KEY where the Gemini SDK expects it
  if (apiKey) {
    windowObj.process.env.API_KEY = apiKey;
    console.log("ATS Auditor: API Key detected and mapped.");
  } else {
    console.warn("ATS Auditor: No API Key found in VITE_API_KEY. Check Vercel settings.");
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
