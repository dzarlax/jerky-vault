import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface AuthContextType {
  auth: {
    isAuthenticated: boolean;
    user: any | null;
    token: string | null;
  };
  login: (token: string, user: any) => void;
  logout: () => void;
}

const defaultAuthContext: AuthContextType = {
  auth: {
    isAuthenticated: false,
    user: null,
    token: null,
  },
  login: () => {},
  logout: () => {},
};

const AuthContext = createContext<AuthContextType>(defaultAuthContext);

export const useAuth = () => useContext(AuthContext);

interface AuthProviderProps {
  children: ReactNode;
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

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [auth, setAuth] = useState(getInitialAuthState());

  useEffect(() => {
    // Check if we're in a browser environment
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token');
      const userStr = localStorage.getItem('user');
      
      if (token && userStr) {
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
      }
    }
  }, []);

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

  const logout = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
    
    setAuth({
      isAuthenticated: false,
      user: null,
      token: null,
    });
  };

  return (
    <AuthContext.Provider value={{ auth, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// Higher-order component to protect routes that require authentication
export const withAuth = (Component: React.ComponentType<any>) => {
  const WithAuth = (props: any) => {
    const { auth } = useAuth();
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
      setIsClient(true);
    }, []);

    // During SSR or static generation, just render the component
    // This prevents errors during build time
    if (!isClient) {
      return <Component {...props} />;
    }

    // On the client side, check authentication
    if (!auth.isAuthenticated) {
      // If we're in a browser environment, redirect to login
      if (typeof window !== 'undefined') {
        window.location.href = '/auth/signin';
        return null;
      }
    }

    return <Component {...props} />;
  };

  // Copy getInitialProps so data fetching works
  if ((Component as any).getInitialProps) {
    (WithAuth as any).getInitialProps = (Component as any).getInitialProps;
  }

  return WithAuth;
};
