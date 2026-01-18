// Custom hook for order operations
// Reduces duplication and centralizes order logic

import { useCallback } from 'react';
import { useRouter } from 'next/router';
import fetcher from '../utils/fetcher';
import { Order, OrderItem } from '../types/api';

export const useOrderActions = () => {
  const router = useRouter();

  const getToken = useCallback(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/auth/signin');
      return null;
    }
    return token;
  }, [router]);

  const createOrder = useCallback(async (orderData: Partial<Order>): Promise<void> => {
    const token = getToken();
    if (!token) return;

    await fetcher('/api/orders', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(orderData),
    });
  }, [getToken]);

  const updateOrder = useCallback(async (orderId: number, orderData: Partial<Order>): Promise<void> => {
    const token = getToken();
    if (!token) return;

    await fetcher(`/api/orders/${orderId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(orderData),
    });
  }, [getToken]);

  const updateOrderStatus = useCallback(async (orderId: number, status: string): Promise<void> => {
    const token = getToken();
    if (!token) return;

    await fetcher(`/api/orders/${orderId}/status`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ status }),
    });
  }, [getToken]);

  const deleteOrder = useCallback(async (orderId: number): Promise<void> => {
    const token = getToken();
    if (!token) return;

    await fetcher(`/api/orders/${orderId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });
  }, [getToken]);

  return {
    createOrder,
    updateOrder,
    updateOrderStatus,
    deleteOrder,
  };
};
