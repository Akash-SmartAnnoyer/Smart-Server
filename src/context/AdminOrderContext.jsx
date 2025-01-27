// src/context/AdminOrderContext.jsx
import React, { createContext, useState, useContext, useEffect } from 'react';

const AdminOrderContext = createContext();

export const AdminOrderProvider = ({ children }) => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const orgId = localStorage.getItem('orgId');


  const fetchOrders = async (endAt = null, limit = 5) => {
    try {
      setLoading(true);
      let url;
      
      if (endAt) {
        // Query orders before the endAt timestamp for the specific orgId
        url = `https://smart-server-menu-database.firebaseio.com/history.json?orderBy="timestamp"&endAt="${endAt}"&limitToLast=${limit + 1}`;
      } else {
        // Initial load - get the most recent orders
        url = `https://smart-server-menu-database.firebaseio.com/history.json?orderBy="timestamp"&limitToLast=${limit}`;
      }

      const response = await fetch(url);
      if (!response.ok) throw new Error('Failed to fetch orders');

      const data = await response.json();
      if (!data) {
        setOrders([]);
        return;
      }

      // Filter for matching orgId after fetching
      const ordersArray = Object.entries(data)
        .map(([key, order]) => ({
          ...order,
          id: order.id || key
        }))
        .filter(order => order.orgId === orgId) // Filter for matching orgId
        .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

      // Remove the duplicate order that is the same as endAt
      if (endAt) {
        ordersArray.pop();
      }

      setOrders(prevOrders => {
        const existingOrderIds = new Set(prevOrders.map(order => order.id));
        const newOrders = ordersArray.filter(order => !existingOrderIds.has(order.id));
        return [...prevOrders, ...newOrders];
      });
    } catch (error) {
      console.error('Failed to fetch orders:', error);
    } finally {
      setLoading(false);
    }
  };


  const updateOrder = async (orderId, updates) => {
    try {
      const response = await fetch(
        `https://smart-server-menu-database.firebaseio.com/history/${orderId}.json`,
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
      // const intervalId = setInterval(fetchOrders, 30000); // Refresh every 30 seconds
      // return () => clearInterval(intervalId);
    }
  }, [orgId]);

  useEffect(() => {
    if (orgId) {
      // ws.current = new WebSocket('wss://legend-sulfuric-ruby.glitch.me');

      const ws = new WebSocket('wss://smart-menu-web-socket-server.onrender.com');
      
      ws.onopen = () => {
        console.log('WebSocket connected in AdminOrderContext');
      };

      ws.onmessage = (event) => {
        const data = JSON.parse(event.data);
        if (data.type === 'newOrder' && data.order.orgId === orgId) {
          setOrders(prevOrders => {
            // Check if order already exists
            if (prevOrders.some(order => order.id === data.order.id)) {
              return prevOrders;
            }
            return [data.order, ...prevOrders];
          });
        }
      };

      return () => {
        ws.close();
      };
    }
  }, [orgId]);

  return (
    <AdminOrderContext.Provider value={{
      orders,
      setOrders,
      loading,
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