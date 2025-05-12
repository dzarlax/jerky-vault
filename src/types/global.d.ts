// Global type declarations

// Extend the Window interface to include our custom properties
interface Window {
  __INITIAL_AUTH_STATE__?: {
    isAuthenticated: boolean;
    user: any | null;
    token: string | null;
  };
  
  // Add React property to prevent errors during static generation
  React?: {
    createElement: (...args: any[]) => any;
    [key: string]: any;
  };
}
