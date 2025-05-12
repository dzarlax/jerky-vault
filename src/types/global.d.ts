// Global type declarations

// Extend the Window interface to include our custom properties
interface Window {
  __INITIAL_AUTH_STATE__?: {
    isAuthenticated: boolean;
    user: any | null;
    token: string | null;
  };
}
