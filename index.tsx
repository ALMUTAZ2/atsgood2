
/**
 * ATS AUDITOR - ENTRY POINT
 * This file initializes the React application and ensures that the Google Gemini SDK
 * has access to the required API_KEY via the process.env polyfill.
 */

// Establish the process.env bridge for the @google/genai SDK
(function() {
  const win = window as any;
  
  // Initialize the process.env object if it doesn't exist
  win.process = win.process || {};
  win.process.env = win.process.env || {};

  try {
    /**
     * VITE ENVIRONMENT BRIDGE
     * We use optional chaining and a fallback check to prevent the 
     * "Cannot read properties of undefined (reading 'VITE_API_KEY')" error.
     */
    const meta = import.meta as any;
    const env = meta?.env || {};
    
    // Attempt to prioritize VITE_API_KEY (recommended for Vite/Vercel)
    const key = env.VITE_API_KEY || env.API_KEY || win.process.env.API_KEY;
    
    if (key && key !== 'undefined') {
      win.process.env.API_KEY = key;
      console.log("ATS Auditor: System environment initialized.");
    }
  } catch (e) {
    // Fail gracefully if environment metadata is inaccessible
    console.warn("ATS Auditor: Environment metadata check skipped.");
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
