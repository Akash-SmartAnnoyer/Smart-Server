// src/context/AdminOrderContext.jsx
import React, { createContext, useState, useContext, useEffect } from 'react';

const AdminOrderContext = createContext();

export const AdminOrderProvider = ({ children }) => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const orgId = localStorage.getItem('orgId');

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams({
        orderBy: '"orgId"',
        equalTo: `"${orgId}"`,
      }).toString();

      const response = await fetch(
        `https://smart-server-stage-database-default-rtdb.firebaseio.com/history.json?${queryParams}`
      );

      if (!response.ok) throw new Error('Failed to fetch orders');

      const data = await response.json();
      
      if (!data) {
        setOrders([]);
        return;
      }

      const ordersArray = Object.entries(data)
        .map(([key, order]) => ({
          ...order,
          id: order.id || key
        }))
        .filter(order => !['cancelled', 'completed'].includes(order.status))
        .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

      setOrders(ordersArray);
    } catch (error) {
      console.error('Failed to fetch orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateOrder = async (orderId, updates) => {
    try {
      const response = await fetch(
        `https://smart-server-stage-database-default-rtdb.firebaseio.com/history/${orderId}.json`,
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updates),
        }
      );

      if (!response.ok) throw new Error('Failed to update order');

      setOrders(prevOrders =>
        prevOrders.map(order =>
          order.id === orderId ? { ...order, ...updates } : order
        )
      );
      return true;
    } catch (error) {
      console.error('Failed to update order:', error);
      return false;
    }
  };

  useEffect(() => {
    if (orgId) {
      fetchOrders();
      // Set up periodic refresh
      const intervalId = setInterval(fetchOrders, 30000); // Refresh every 30 seconds
      return () => clearInterval(intervalId);
    }
  }, [orgId]);

  return (
    <AdminOrderContext.Provider value={{
      orders,
      loading,
      setOrders,
      updateOrder,
      fetchOrders
    }}>
      {children}
    </AdminOrderContext.Provider>
  );
};

export const useAdminOrders = () => {
  const context = useContext(AdminOrderContext);
  if (!context) {
    throw new Error('useAdminOrders must be used within an AdminOrderProvider');
  }
  return context;
};