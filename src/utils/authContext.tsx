import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { setAuthErrorHandler } from './fetcher';

interface AuthContextType {
  auth: {
    isAuthenticated: boolean;
    user: any | null;
    token: string | null;
  };
  login: (token: string, user: any) => void;
  logout: () => void;
  isInitialized: boolean;
}

const defaultAuthContext: AuthContextType = {
  auth: {
    isAuthenticated: false,
    user: null,
    token: null,
  },
  login: () => {},
  logout: () => {},
  isInitialized: false,
};

const AuthContext = createContext<AuthContextType>(defaultAuthContext);

export const useAuth = () => useContext(AuthContext);

interface AuthProviderProps {
  children: ReactNode;
  initialState?: {
    isAuthenticated: boolean;
    user: any | null;
    token: string | null;
  };
}

// Get initial auth state from window if available (set in _document.tsx)
const getInitialAuthState = () => {
  if (typeof window !== 'undefined' && window.__INITIAL_AUTH_STATE__) {
    return window.__INITIAL_AUTH_STATE__;
  }
  return {
    isAuthenticated: false,
    user: null,
    token: null,
  };
};

export const AuthProvider: React.FC<AuthProviderProps> = ({ children, initialState }) => {
  const [auth, setAuth] = useState(initialState || getInitialAuthState());
  const [isInitialized, setIsInitialized] = useState(false);

  // Memoized logout function to prevent unnecessary re-renders
  const logout = useCallback(() => {
    console.log('Logging out user...');
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
    
    setAuth({
      isAuthenticated: false,
      user: null,
      token: null,
    });
  }, []);

  // Validate token format and expiration (basic check)
  const isValidToken = useCallback((token: string): boolean => {
    if (!token) return false;
    
    try {
      // Basic JWT structure check (should have 3 parts separated by dots)
      const parts = token.split('.');
      if (parts.length !== 3) return false;
      
      // Try to decode the payload to check expiration
      const payload = JSON.parse(atob(parts[1]));
      const currentTime = Math.floor(Date.now() / 1000);
      
      // Check if token is expired (with 5 minute buffer)
      if (payload.exp && payload.exp < (currentTime + 300)) {
        console.warn('Token is expired or about to expire');
        return false;
      }
      
      return true;
    } catch (error) {
      console.error('Invalid token format:', error);
      return false;
    }
  }, []);

  useEffect(() => {
    // Set up the global auth error handler
    setAuthErrorHandler(logout);
    
    // Check if we're in a browser environment
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token');
      const userStr = localStorage.getItem('user');
      
      if (token && userStr) {
        // Validate token before using it
        if (isValidToken(token)) {
          try {
            const user = JSON.parse(userStr);
            setAuth({
              isAuthenticated: true,
              user,
              token,
            });
          } catch (error) {
            console.error('Failed to parse user data from localStorage', error);
            // Clear invalid data
            localStorage.removeItem('token');
            localStorage.removeItem('user');
          }
        } else {
          console.warn('Invalid or expired token found, clearing localStorage');
          localStorage.removeItem('token');
          localStorage.removeItem('user');
        }
      }
      
      setIsInitialized(true);
    }
  }, [logout, isValidToken]);

  const login = (token: string, user: any) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
    }
    
    setAuth({
      isAuthenticated: true,
      user,
      token,
    });
  };

  return (
    <AuthContext.Provider value={{ auth, login, logout, isInitialized }}>
      {children}
    </AuthContext.Provider>
  );
};

// Higher-order component to protect routes that require authentication
export const withAuth = (Component: React.ComponentType<any>) => {
  const WithAuth = (props: any) => {
    const { auth, isInitialized } = useAuth();
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
      setIsClient(true);
    }, []);

    // During SSR or static generation, just render the component
    // This prevents errors during build time
    if (!isClient || typeof window === 'undefined') {
      return <Component {...props} />;
    }

    // Show loading while auth is initializing
    if (!isInitialized) {
      return (
        <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '200px' }}>
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      );
    }

    // On the client side, check authentication after initialization
    if (!auth.isAuthenticated) {
      // If we're in a browser environment, redirect to login
      window.location.href = '/auth/signin';
      return null;
    }

    return <Component {...props} />;
  };

  // Add getInitialProps to disable automatic static optimization
  // This ensures the component is always rendered on the server
  WithAuth.getInitialProps = async (ctx: any) => {
    // Get the existing getInitialProps from the component if it exists
    const componentProps = (Component as any).getInitialProps 
      ? await (Component as any).getInitialProps(ctx) 
      : {};
    
    return { ...componentProps };
  };

  return WithAuth;
};
