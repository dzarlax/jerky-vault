/**
 * Runtime configuration helper
 * Reads values from window.__RUNTIME_CONFIG__ on client side
 * Falls back to process.env on server side (for SSR and backwards compatibility)
 */

interface RuntimeConfig {
  API_URL?: string;
  MAPBOX_ACCESS_TOKEN?: string;
}

declare global {
  interface Window {
    __RUNTIME_CONFIG__?: RuntimeConfig;
  }
}

/**
 * Get API URL from runtime config or environment variable
 * Priority: runtime config > env var > default
 */
export const getApiUrl = (): string => {
  if (typeof window !== 'undefined' && window.__RUNTIME_CONFIG__?.API_URL) {
    return window.__RUNTIME_CONFIG__.API_URL;
  }
  return process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
};

/**
 * Get Mapbox access token from runtime config or environment variable
 * Priority: runtime config > env var > empty string
 */
export const getMapboxToken = (): string => {
  if (typeof window !== 'undefined' && window.__RUNTIME_CONFIG__?.MAPBOX_ACCESS_TOKEN) {
    return window.__RUNTIME_CONFIG__.MAPBOX_ACCESS_TOKEN;
  }
  return process.env.MAPBOX_ACCESS_TOKEN || '';
};

// Export constants for convenience
export const API_URL = getApiUrl();
export const MAPBOX_ACCESS_TOKEN = getMapboxToken();
