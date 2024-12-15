import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';

const OrderContext = createContext();

export const useOrders = () => {
  const context = useContext(OrderContext);
  if (context === undefined) {
    throw new Error('useOrders must be used within an OrderProvider');
  }
  return context;
};

export const OrderProvider = ({ children }) => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lastFetchTime, setLastFetchTime] = useState(null);
  const orgId = localStorage.getItem('orgId');
  const tableNumber = localStorage.getItem('tableNumber');

  const fetchOrders = async (force = false, page = 1, limit = 10) => {
    if (!force && lastFetchTime && Date.now() - lastFetchTime < 30000) {
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(`https://smart-server-menu-database-default-rtdb.firebaseio.com/history.json?orderBy="timestamp"&limitToLast=${limit}`);
      if (!response.ok) throw new Error('Failed to fetch orders');
      
      const data = await response.json();
      const ordersArray = Object.entries(data || {})
        .map(([key, order]) => ({
          ...order,
          id: order.id || key
        }))
        .filter(order => 
          order.orgId === orgId && 
          order.tableNumber === tableNumber
        );

      const sortedOrders = ordersArray.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
      
      if (page === 1) {
        setOrders(sortedOrders);
      } else {
        setOrders(prev => [...prev, ...sortedOrders]);
      }
      
      setLastFetchTime(Date.now());
    } catch (error) {
      console.error('Failed to fetch orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateOrder = async (orderId, updates) => {
    try {
      await fetch(`https://smart-server-menu-database-default-rtdb.firebaseio.com/history/${orderId}.json`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });

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

  // Memoize helper functions to prevent unnecessary re-renders
  const getActiveOrders = useCallback(() => 
    orders.filter(order => !['completed', 'cancelled'].includes(order.status))
  , [orders]);

  const getOrderById = useCallback((orderId) => 
    orders.find(order => order.id === orderId)
  , [orders]);

  const getLastActiveOrder = useCallback(() => 
    orders.find(order => 
      order.status !== 'cancelled' && 
      order.status !== 'completed'
    )
  , [orders]);

  useEffect(() => {
    if (orgId && tableNumber) {
      fetchOrders();
    }
  }, [orgId, tableNumber]);

  const value = {
    orders,
    loading,
    setOrders,
    updateOrder,
    fetchOrders,
    getActiveOrders,
    getOrderById,
    getLastActiveOrder
  };

  return (
    <OrderContext.Provider value={value}>
      {children}
    </OrderContext.Provider>
  );
}; 