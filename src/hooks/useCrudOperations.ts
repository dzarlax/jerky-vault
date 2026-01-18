import { useCallback } from 'react';
import { useRouter } from 'next/router';
import fetcher from '../utils/fetcher';
import { useNotification } from './useNotification';
import { useAuth } from '../utils/authContext';

/**
 * Universal CRUD operations hook with automatic notifications
 * Eliminates code duplication across all pages
 */
export const useCrudOperations = () => {
  const router = useRouter();
  const { success, error: showError } = useNotification();
  const { auth } = useAuth();

  const create = useCallback(async (
    endpoint: string,
    data: any,
    successMessage: string,
    errorMessage: string
  ) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/auth/signin');
        return null;
      }

      const response = await fetcher(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });

      success(successMessage);
      return response;
    } catch (error) {
      showError(errorMessage);
      return null;
    }
  }, [router, success, showError]);

  const update = useCallback(async (
    endpoint: string,
    data: any,
    successMessage: string,
    errorMessage: string
  ) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/auth/signin');
        return null;
      }

      const response = await fetcher(endpoint, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });

      success(successMessage);
      return response;
    } catch (error) {
      showError(errorMessage);
      return null;
    }
  }, [router, success, showError]);

  const remove = useCallback(async (
    endpoint: string,
    successMessage: string,
    errorMessage: string,
    confirmMessage?: string
  ) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/auth/signin');
        return false;
      }

      if (confirmMessage && !window.confirm(confirmMessage)) {
        return false;
      }

      await fetcher(endpoint, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      success(successMessage);
      return true;
    } catch (error) {
      showError(errorMessage);
      return false;
    }
  }, [router, success, showError]);

  return {
    create,
    update,
    remove,
  };
};
