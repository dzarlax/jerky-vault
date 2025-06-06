import { SWRConfiguration } from 'swr';

// Standard SWR configuration with auth error handling
export const createSWRConfig = (customConfig: SWRConfiguration = {}): SWRConfiguration => {
  return {
    // Don't revalidate on focus to avoid unnecessary API calls
    revalidateOnFocus: false,
    // Don't revalidate on reconnect by default
    revalidateOnReconnect: true,
    // Retry configuration
    shouldRetryOnError: (err) => {
      // Don't retry on authentication errors as they're handled globally
      if (err.name === 'FetchError' && (err.status === 401 || err.status === 403)) {
        return false;
      }
      // Don't retry on 4xx errors (except auth errors which are handled above)
      if (err.status >= 400 && err.status < 500) {
        return false;
      }
      // Retry on 5xx errors and network errors
      return true;
    },
    // Error handling
    onError: (err) => {
      // Don't log authentication errors as they're handled globally
      if (err.name !== 'FetchError' || (err.status !== 401 && err.status !== 403)) {
        console.error('SWR fetch error:', err);
      }
    },
    // Merge with custom configuration
    ...customConfig,
  };
};

// Predefined configurations for common use cases
export const swrConfigs = {
  // For dashboard and critical data
  dashboard: createSWRConfig({
    refreshInterval: 30000, // Refresh every 30 seconds
    dedupingInterval: 10000, // Dedupe requests within 10 seconds
  }),
  
  // For lists and tables
  list: createSWRConfig({
    refreshInterval: 60000, // Refresh every minute
    dedupingInterval: 5000, // Dedupe requests within 5 seconds
  }),
  
  // For static/rarely changing data
  static: createSWRConfig({
    revalidateOnReconnect: false,
    refreshInterval: 0, // No automatic refresh
    dedupingInterval: 60000, // Dedupe requests within 1 minute
  }),
  
  // For real-time data
  realtime: createSWRConfig({
    refreshInterval: 5000, // Refresh every 5 seconds
    dedupingInterval: 1000, // Dedupe requests within 1 second
    revalidateOnFocus: true,
  }),
}; 