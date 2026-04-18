/**
 * Centralized API configuration.
 * Automatically switches between local development URL and production URL.
 */

// If we are in production mode (e.g. npm run build), use the live Render URL.
// In development mode (npm run dev), use the local VITE_API_URL or fallback to localhost.
export const API_BASE_URL = import.meta.env.MODE === 'production'
  ? 'https://testkid-backend.onrender.com'
  : (import.meta.env.VITE_API_URL || 'http://localhost:5000');
