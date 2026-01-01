
/**
 * Initialize process polyfill.
 * This ensures that 'process.env.API_KEY' works correctly in the browser
 * when deployed on Vercel or similar platforms.
 */
if (typeof (window as any).process === 'undefined') {
  (window as any).process = { env: {} };
} else if (!(window as any).process.env) {
  (window as any).process.env = {};
}

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
