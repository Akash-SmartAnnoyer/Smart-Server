// src/context/AdminOrderContext.jsx
import React, { createContext, useState, useContext, useEffect } from 'react';
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

export const AdminOrderProvider = ({ children }) => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const orgId = localStorage.getItem('orgId');


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
          ...(limit ? [limit(limit)] : [])
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

      setOrders(prevOrders => {
        // If we're not loading more (no endAt), replace all orders
        if (!endAt) {
          localStorage.setItem('cachedOrders', JSON.stringify(ordersArray));
          return ordersArray;
        }
        
        // If loading more, append new orders
        const existingOrderIds = new Set(prevOrders.map(order => order.id));
        const newOrders = ordersArray.filter(order => !existingOrderIds.has(order.id));
        const updatedOrders = [...prevOrders, ...newOrders];
        
        // Cache the updated orders
        localStorage.setItem('cachedOrders', JSON.stringify(updatedOrders));
        
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

  // Update the updateOrder function
  const updateOrder = async (orderId, updates) => {
    try {
      const standardId = standardizeOrderId(orderId);
      const orderRef = doc(db, 'history', standardId);
      
      const updatedData = {
        ...updates,
        lastUpdated: new Date().toISOString()
      };

      await updateDoc(orderRef, updatedData);
      
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
      localStorage.setItem('cachedOrders', JSON.stringify(updatedOrders));
      
      return true;
    } catch (error) {
      console.error('Failed to update order:', error);
      throw error;
    }
  };

  // Update the initial useEffect for loading orders
  useEffect(() => {
    if (orgId) {
      // Try to load cached orders first
      const cachedOrders = localStorage.getItem('cachedOrders');
      if (cachedOrders) {
        setOrders(JSON.parse(cachedOrders));
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

  // Update the WebSocket effect to handle new orders better
  useEffect(() => {
    if (orgId) {
      const ws = new WebSocket('wss://smart-menu-web-socket-server.onrender.com');
      
      ws.onopen = () => {
        console.log('WebSocket connected in AdminOrderContext');
      };

      ws.onmessage = async (event) => {
        const data = JSON.parse(event.data);
        if (data.type === 'newOrder' && data.order.orgId === orgId) {
          // Store the new order in history collection
          await storeOrderInHistory(data.order);
          
          setOrders(prevOrders => {
            if (prevOrders.some(order => order.id === data.order.id)) {
              return prevOrders;
            }
            const updatedOrders = [data.order, ...prevOrders];
            // Update localStorage with new order
            localStorage.setItem('cachedOrders', JSON.stringify(updatedOrders));
            return updatedOrders;
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