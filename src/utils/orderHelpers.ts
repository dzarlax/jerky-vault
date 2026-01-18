// Helper functions for order calculations and formatting
// Pure functions that can be easily tested

import { OrderItem } from '../types/api';

/**
 * Calculate total price for order items
 */
export const calculateTotalPrice = (items: OrderItem[]): number => {
  return items.reduce((total, item) => total + item.quantity * item.price, 0);
};

/**
 * Calculate total cost price for order items
 */
export const calculateTotalCostPrice = (items: OrderItem[]): number => {
  return items.reduce((total, item) => total + item.quantity * item.cost_price, 0);
};

/**
 * Calculate profit (revenue - cost)
 */
export const calculateProfit = (items: OrderItem[]): number => {
  return calculateTotalPrice(items) - calculateTotalCostPrice(items);
};

/**
 * Group order items by product_id and sum quantities
 */
export const groupOrderItems = (items: OrderItem[]): OrderItem[] => {
  const itemMap: { [key: number]: OrderItem } = {};

  items.forEach((item) => {
    if (!itemMap[item.product_id]) {
      itemMap[item.product_id] = { ...item, quantity: 0 };
    }
    itemMap[item.product_id].quantity += item.quantity;
  });

  return Object.values(itemMap);
};

/**
 * Format currency with proper decimal places
 */
export const formatCurrency = (amount: number): string => {
  return amount.toFixed(2);
};

/**
 * Create empty order item
 */
export const createEmptyOrderItem = (): OrderItem => {
  return {
    product_id: 0,
    quantity: 1,
    price: 0,
    cost_price: 0,
  };
};

/**
 * Create order item from product
 */
export const createOrderItemFromProduct = (
  product: { id: number; price: number; cost: number }
): OrderItem => {
  return {
    product_id: product.id,
    quantity: 1,
    price: product.price,
    cost_price: product.cost,
  };
};

/**
 * Update order item field
 */
export const updateOrderItem = (
  items: OrderItem[],
  index: number,
  field: keyof OrderItem,
  value: string | number
): OrderItem[] => {
  const updatedItems = [...items];
  updatedItems[index] = { ...updatedItems[index], [field]: value };
  return updatedItems;
};

/**
 * Remove order item by index
 */
export const removeOrderItem = (items: OrderItem[], index: number): OrderItem[] => {
  const updatedItems = [...items];
  updatedItems.splice(index, 1);
  return updatedItems;
};

/**
 * Add new order item
 */
export const addOrderItem = (items: OrderItem[]): OrderItem[] => {
  return [...items, createEmptyOrderItem()];
};
