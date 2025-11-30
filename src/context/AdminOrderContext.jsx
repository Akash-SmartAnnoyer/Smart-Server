// src/context/AdminOrderContext.jsx
import React, { createContext, useState, useContext, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../contexts/AuthContext';

const AdminOrderContext = createContext();

export const AdminOrderProvider = ({ children }) => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hasMore, setHasMore] = useState(true);
  const { orgId } = useAuth();
  const BATCH_SIZE = 50; // Number of orders to fetch per batch

  // Helper function to safely store data in localStorage with a limit
  const safeSetLocalStorage = (key, data, maxItems = 50) => {
    try {
      // If data is an array, limit the number of items
      const limitedData = Array.isArray(data) 
        ? data.slice(0, maxItems) 
        : data;
      
      localStorage.setItem(key, JSON.stringify(limitedData));
    } catch (error) {
      console.warn('localStorage quota exceeded, clearing orders cache and retrying');
      try {
        // Only clear specific cache keys
        const keysToPreserve = ['orgId', 'userId', 'soundEnabled', 'theme', 'customerId', 'tableNumber', 'role', 'categoryNavigatorPosition'];
        const preservedData = {};
        
        // Save important data
        keysToPreserve.forEach(k => {
          const value = localStorage.getItem(k);
          if (value) preservedData[k] = value;
        });

        // Clear only order-related items
        localStorage.removeItem('cachedOrders');
        localStorage.removeItem('lastOrderTimestamp');
        
        // Restore preserved data
        Object.entries(preservedData).forEach(([k, v]) => {
          localStorage.setItem(k, v);
        });

        // Try setting the data again
        localStorage.setItem(key, JSON.stringify(
          Array.isArray(data) ? data.slice(0, maxItems) : data
        ));
      } catch (retryError) {
        console.error('Failed to store data even after clearing cache:', retryError);
      }
    }
  };

  const fetchOrders = async (endAt = null, batchSize = BATCH_SIZE) => {
    try {
      setLoading(true);
      if (!orgId) {
        setOrders([]);
        setHasMore(false);
        return;
      }

      // Fetch orders from MongoDB API
      const ordersArray = await api.getHistory(orgId, {
        limit: batchSize + 1 // Fetch one extra to check if there are more
      });

      // Process orders to match expected format
      const processedOrders = ordersArray.map(order => ({
        ...order,
        id: order.orderId || order._id,
        timestamp: order.createdAt || order.timestamp
      }));

      // Check if there are more orders
      const hasMoreOrders = processedOrders.length > batchSize;
      if (hasMoreOrders) {
        processedOrders.pop(); // Remove the extra item we used to check for more
      }
      setHasMore(hasMoreOrders);

      setOrders(prevOrders => {
        if (!endAt) {
          // For initial load, just set the orders
          safeSetLocalStorage('cachedOrders', processedOrders);
          return processedOrders;
        }
        
        // For subsequent loads, append new orders
        const existingOrderIds = new Set(prevOrders.map(order => order.id));
        const newOrders = processedOrders.filter(order => !existingOrderIds.has(order.id));
        const updatedOrders = [...prevOrders, ...newOrders];
        
        // Only cache the most recent orders to avoid storage issues
        safeSetLocalStorage('cachedOrders', updatedOrders.slice(0, BATCH_SIZE));
        return updatedOrders;
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

  // Store order in history (orders are automatically stored when created)
  const storeOrderInHistory = async (order) => {
    try {
      // Orders are automatically stored in history when created via API
      // This function is kept for backward compatibility
      console.log('Order stored in history:', order.id);
    } catch (error) {
      console.error('Failed to store order in history:', error);
    }
  };

  // Update the updateOrder function
  const updateOrder = async (orderId, updates) => {
    try {
      const standardId = standardizeOrderId(orderId);
      
      // Update order status via API
      if (updates.status) {
        await api.updateOrderStatus(orgId, standardId, updates.status);
      }
      
      const updatedData = {
        ...updates,
        lastUpdated: new Date().toISOString()
      };
      
      // Update local state using the standardized ID
      setOrders(prevOrders =>
        prevOrders.map(order =>
          standardizeOrderId(order.id) === standardId ? { ...order, ...updatedData, id: standardId } : order
        )
      );

      // Update localStorage
      const updatedOrders = orders.map(order =>
        standardizeOrderId(order.id) === standardId ? { ...order, ...updatedData, id: standardId } : order
      );
      safeSetLocalStorage('cachedOrders', updatedOrders);
      
      return true;
    } catch (error) {
      console.error('Failed to update order:', error);
      throw error;
    }
  };

  // Update the initial useEffect for loading orders
  useEffect(() => {
    if (orgId) {
      try {
        const cachedOrders = localStorage.getItem('cachedOrders');
        if (cachedOrders) {
          const parsedOrders = JSON.parse(cachedOrders);
          setOrders(parsedOrders);
          setLoading(false);
        }
      } catch (error) {
        console.warn('Error loading cached orders:', error);
        localStorage.removeItem('cachedOrders'); // Clear corrupted cache
      }
      
      // Then fetch fresh orders
      fetchOrders();
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