
import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';

// Polyfill process for environments where it's not defined at runtime to prevent ReferenceError.
// This is common in browser-based ESM deployments without a thick build layer.
if (typeof (window as any).process === 'undefined') {
  (window as any).process = { env: {} };
}

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
