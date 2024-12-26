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
        `https://smartdb-175f4-default-rtdb.firebaseio.com/history.json?${queryParams}`
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
        // .filter(order => !['cancelled', 'completed'].includes(order.status))
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
        `https://smartdb-175f4-default-rtdb.firebaseio.com/history/${orderId}.json`,
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
      const ws = new WebSocket('wss://legend-sulfuric-ruby.glitch.me');
      
      ws.onopen = () => {
        console.log('WebSocket connected in AdminOrderContext');
      };

      ws.onmessage = (event) => {
        const data = JSON.parse(event.data);
        
        // Handle new orders
        if (data.type === 'newOrder' && data.order.orgId === orgId) {
          setOrders(prevOrders => {
            // Check if order already exists
            if (prevOrders.some(order => order.id === data.order.id)) {
              return prevOrders;
            }
            return [data.order, ...prevOrders];
          });
        }
        
        // Handle status updates
        else if (data.type === 'statusUpdate' && data.orgId === orgId) {
          setOrders(prevOrders =>
            prevOrders.map(order =>
              order.id === data.orderId
                ? { ...order, status: data.status, statusMessage: data.statusMessage }
                : order
            )
          );
        }
      };

      ws.onclose = () => {
        console.log('WebSocket disconnected in AdminOrderContext');
        // Attempt to reconnect after a delay
        setTimeout(() => {
          console.log('Attempting to reconnect...');
          fetchOrders(); // Refresh orders when reconnecting
        }, 3000);
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