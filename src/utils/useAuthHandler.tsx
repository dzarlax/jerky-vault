import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from './authContext';

// Custom hook to handle authentication errors and automatic redirects
export const useAuthHandler = () => {
  const { auth, logout } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Listen for storage events to sync auth state across tabs
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'token' && !e.newValue) {
        // Token was removed in another tab, logout in this tab too
        console.log('Token removed in another tab, logging out...');
        logout();
        if (router.pathname !== '/auth/signin') {
          router.push('/auth/signin');
        }
      }
    };

    // Listen for beforeunload to clean up if needed
    const handleBeforeUnload = () => {
      // This could be used for cleanup if needed
      // For now, we'll just ensure the token is still valid
      const token = localStorage.getItem('token');
      if (!token && auth.isAuthenticated) {
        logout();
      }
    };

    // Only add listeners if we're on the client side
    if (typeof window !== 'undefined') {
      window.addEventListener('storage', handleStorageChange);
      window.addEventListener('beforeunload', handleBeforeUnload);

      return () => {
        window.removeEventListener('storage', handleStorageChange);
        window.removeEventListener('beforeunload', handleBeforeUnload);
      };
    }
  }, [auth.isAuthenticated, logout, router]);

  // Return auth state and helper functions
  return {
    isAuthenticated: auth.isAuthenticated,
    user: auth.user,
    token: auth.token,
    logout,
  };
}; 