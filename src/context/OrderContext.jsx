import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { message } from 'antd';

const OrderContext = createContext();
const API_URL = 'http://localhost:5000/api';

export function OrderProvider({ children }) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const orgId = localStorage.getItem('orgId');

  const fetchOrders = useCallback(async () => {
    try {
      const response = await fetch(`${API_URL}/orders?org_id=${orgId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch orders');
      }
      const data = await response.json();
      setOrders(data);
    } catch (error) {
      console.error('Error fetching orders:', error);
      message.error('Failed to fetch orders');
    } finally {
      setLoading(false);
    }
  }, [orgId]);

  const updateOrder = useCallback(async (orderId, status, statusMessage = '') => {
    try {
      const response = await fetch(`${API_URL}/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, statusMessage }),
      });

      if (!response.ok) {
        throw new Error('Failed to update order');
      }

      const updatedOrder = await response.json();
      setOrders(prevOrders =>
        prevOrders.map(order =>
          order.id === orderId ? updatedOrder : order
        )
      );

      return true;
    } catch (error) {
      console.error('Error updating order:', error);
      message.error('Failed to update order');
      return false;
    }
  }, []);

  useEffect(() => {
    if (orgId) {
      fetchOrders();
    }
  }, [orgId, fetchOrders]);

  const value = {
    orders,
    setOrders,
    loading,
    updateOrder,
    fetchOrders
  };

  return (
    <OrderContext.Provider value={value}>
      {children}
    </OrderContext.Provider>
  );
}

export const useOrders = () => {
  const context = useContext(OrderContext);
  if (!context) {
    throw new Error('useOrders must be used within an OrderProvider');
  }
  return context;
}; 