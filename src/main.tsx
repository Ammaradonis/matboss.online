import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import App from './App';
import './index.css';

// Stripe.js fires fraud/telemetry beacons to r.stripe.com that are routinely
// blocked by ad-blockers, DNS filters, or corporate firewalls (ERR_NAME_NOT_RESOLVED,
// "Failed to fetch"). The beacon failure is harmless — payments still work — but
// the SDK lets the rejection bubble up as an uncaught promise. Swallow only those.
window.addEventListener('unhandledrejection', (event) => {
  const reason = event.reason;
  const message = typeof reason === 'string' ? reason : reason?.message ?? '';
  const stack = reason?.stack ?? '';
  if (
    message.includes('r.stripe.com') ||
    message.includes('m.stripe.com') ||
    (message === 'Failed to fetch' && /stripe\.com/.test(stack))
  ) {
    event.preventDefault();
  }
});

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <HelmetProvider>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </HelmetProvider>
  </React.StrictMode>
);
