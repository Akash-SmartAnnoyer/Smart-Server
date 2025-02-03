// src/context/AdminOrderContext.jsx
import React, { createContext, useState, useContext, useEffect, useRef } from 'react';
import { 
  collection, 
  query, 
  orderBy, 
  limit, 
  getDocs, 
  where, 
  startAfter,
  doc,
  updateDoc,
  setDoc
} from 'firebase/firestore';
import { db } from '../pages/fireBaseConfig';

const AdminOrderContext = createContext();

export const useAdminOrders = () => useContext(AdminOrderContext);

export const AdminOrderProvider = ({ children }) => {
  const [cachedOrders, setCachedOrders] = useState(() => {
    try {
      const stored = localStorage.getItem('cachedOrders');
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Error loading cached orders:', error);
      return [];
    }
  });

  const ws = useRef(null);

  // Function to clean up old orders
  const cleanupOldOrders = (orders) => {
    // Keep only orders from the last 24 hours
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    return orders.filter(order => new Date(order.timestamp) > oneDayAgo);
  };

  // Function to safely store orders
  const safelyStoreOrders = (orders) => {
    try {
      // Clean up old orders first
      const cleanedOrders = cleanupOldOrders(orders);
      
      // Try to store the cleaned orders
      const ordersString = JSON.stringify(cleanedOrders);
      
      try {
        localStorage.setItem('cachedOrders', ordersString);
      } catch (storageError) {
        // If storage fails, try storing fewer orders
        if (cleanedOrders.length > 10) {
          // Keep only the 10 most recent orders
          const reducedOrders = cleanedOrders.slice(-10);
          localStorage.setItem('cachedOrders', JSON.stringify(reducedOrders));
          return reducedOrders;
        }
        console.error('Storage failed even with reduced orders:', storageError);
      }
      
      return cleanedOrders;
    } catch (error) {
      console.error('Error storing orders:', error);
      return [];
    }
  };

  useEffect(() => {
    // Update storage whenever cachedOrders changes
    const updatedOrders = safelyStoreOrders(cachedOrders);
    if (updatedOrders.length !== cachedOrders.length) {
      setCachedOrders(updatedOrders);
    }
  }, [cachedOrders]);

  const addOrder = (newOrder) => {
    setCachedOrders(prevOrders => {
      const updatedOrders = [...prevOrders, newOrder];
      return safelyStoreOrders(updatedOrders);
    });

    // Send WebSocket message for new order
    if (ws.current?.readyState === WebSocket.OPEN) {
      ws.current.send(JSON.stringify({
        type: 'newOrder',
        order: newOrder
      }));
    }
  };

  const updateOrder = (orderId, updates) => {
    setCachedOrders(prevOrders => {
      const updatedOrders = prevOrders.map(order => 
        order.id === orderId ? { ...order, ...updates } : order
      );
      return safelyStoreOrders(updatedOrders);
    });

    // Send WebSocket message for order update
    if (ws.current?.readyState === WebSocket.OPEN) {
      ws.current.send(JSON.stringify({
        type: 'updateOrder',
        order: { id: orderId, ...updates }
      }));
    }
  };

  const removeOrder = (orderId) => {
    setCachedOrders(prevOrders => {
      const updatedOrders = prevOrders.filter(order => order.id !== orderId);
      return safelyStoreOrders(updatedOrders);
    });
  };

  const clearOrders = () => {
    setCachedOrders([]);
    localStorage.removeItem('cachedOrders');
  };

  const orgId = localStorage.getItem('orgId');
  const [loading, setLoading] = useState(true);

  const fetchOrders = async (endAt = null, limit = null) => {
    try {
      setLoading(true);
      const historyRef = collection(db, 'history');
      let q;

      if (endAt) {
        q = query(
          historyRef,
          where('orgId', '==', orgId),
          orderBy('timestamp', 'desc'),
          startAfter(endAt),
          ...(limit ? [limit(limit + 1)] : [])
        );
      } else {
        q = query(
          historyRef,
          where('orgId', '==', orgId),
          orderBy('timestamp', 'desc'),
          limit(50) // Limit initial fetch to 50 orders
        );
      }

      const querySnapshot = await getDocs(q);
      const ordersArray = querySnapshot.docs.map(doc => ({
        ...doc.data(),
        id: doc.id
      }));

      if (endAt) {
        ordersArray.pop();
      }

      setCachedOrders(prevOrders => {
        // If we're not loading more (no endAt), replace all orders
        if (!endAt) {
          try {
            // Only cache the most recent orders and essential data
            const ordersToCache = ordersArray.slice(0, 50).map(order => ({
              id: order.id,
              status: order.status,
              tableNumber: order.tableNumber,
              timestamp: order.timestamp,
              items: order.items?.map(item => ({
                name: item.name,
                quantity: item.quantity,
                price: item.price
              }))
            }));
            localStorage.setItem('cachedOrders', JSON.stringify(ordersToCache));
          } catch (storageError) {
            console.warn('Failed to cache orders:', storageError);
            // Clear existing cache if we hit quota
            localStorage.removeItem('cachedOrders');
          }
          return ordersArray;
        }
        
        // If loading more, append new orders
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

  // Helper function to standardize order ID format
  const standardizeOrderId = (orderId) => {
    if (!orderId) return '';
    // If it starts with 'ORD-', keep it as is
    if (orderId.startsWith('ORD-')) return orderId;
    // If it's a pure numeric string, add the 'ORD-' prefix
    if (/^\d+$/.test(orderId)) {
      return `ORD-${orderId}`;
    }
    // If it's already in the correct format, return as is
    if (/^ORD-\d+$/.test(orderId)) return orderId;
    // For any other format, extract numbers and add prefix
    const numbers = orderId.replace(/\D/g, '');
    return `ORD-${numbers}`;
  };

  // Update the storeOrderInHistory function
  const storeOrderInHistory = async (order) => {
    try {
      const standardId = standardizeOrderId(order.id);
      const orderRef = doc(db, 'history', standardId);
      await setDoc(orderRef, {
        ...order,
        id: standardId, // Ensure the ID in the document data is also standardized
        timestamp: new Date().toISOString(),
        status: 'pending'
      });
    } catch (error) {
      console.error('Failed to store order in history:', error);
    }
  };

  // Update the initial useEffect for loading orders
  useEffect(() => {
    if (orgId) {
      // Try to load cached orders first
      const cachedOrders = localStorage.getItem('cachedOrders');
      if (cachedOrders) {
        setCachedOrders(JSON.parse(cachedOrders));
        setLoading(false); // Set loading to false after loading cached orders
      }
      
      // Then fetch fresh orders
      fetchOrders();
    }
  }, [orgId]);

  // Add a cleanup effect to handle page refresh
  useEffect(() => {
    // Check if page needs refresh
    const needRefresh = localStorage.getItem('needRefresh');
    if (needRefresh !== 'no') {
      // Set flag to 'no' before refreshing to prevent refresh loop
      localStorage.setItem('needRefresh', 'no');
      window.location.reload();
    }
  }, []); // Empty dependency array ensures this runs only once on mount

  return (
    <AdminOrderContext.Provider value={{
      orders: cachedOrders,
      addOrder,
      updateOrder,
      removeOrder,
      clearOrders,
      loading,
      fetchOrders
    }}>
      {children}
    </AdminOrderContext.Provider>
  );
};
