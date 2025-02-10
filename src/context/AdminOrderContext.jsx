// src/context/AdminOrderContext.jsx
import React, { createContext, useState, useContext, useEffect, useRef, useCallback } from 'react';
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
  setDoc,
  serverTimestamp,
  addDoc
} from 'firebase/firestore';
import { db } from '../pages/fireBaseConfig';

const AdminOrderContext = createContext();

export const AdminOrderProvider = ({ children }) => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [initialLoading, setInitialLoading] = useState(true);
  const orgId = localStorage.getItem('orgId');
  const BATCH_SIZE = 20;
  const loadingRef = useRef(false);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      loadingRef.current = true;

      const historyRef = collection(db, 'history');
      let q = query(
        historyRef,
        where('orgId', '==', orgId),
        orderBy('timestamp', 'desc')
      );

      const querySnapshot = await getDocs(q);
      const ordersArray = querySnapshot.docs.map(doc => ({
        ...doc.data(),
        id: doc.id
      }));

      setOrders(ordersArray);
      setHasMore(false); // No longer needed with pagination

      return ordersArray;
    } catch (error) {
      console.error('Failed to fetch orders:', error);
    } finally {
      setLoading(false);
      setInitialLoading(false);
      loadingRef.current = false;
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
        id: standardId,
        timestamp: new Date().toISOString(),
        status: 'pending'
      });

      // Log the order creation
      await logActivity('order_created', {
        orderId: standardId,
        tableNumber: order.tableNumber,
        items: order.items.length,
        total: order.total
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
      
      // Log the status update
      await logActivity('status_update', {
        orderId: standardId,
        oldStatus: orders.find(o => standardizeOrderId(o.id) === standardId)?.status,
        newStatus: updates.status,
        tableNumber: orders.find(o => standardizeOrderId(o.id) === standardId)?.tableNumber
      });

      setOrders(prevOrders =>
        prevOrders.map(order =>
          standardizeOrderId(order.id) === standardId ? { ...order, ...updatedData } : order
        )
      );
      
      return true;
    } catch (error) {
      console.error('Failed to update order:', error);
      throw error;
    }
  };

  // Initial load
  useEffect(() => {
    if (orgId) {
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
          await storeOrderInHistory(data.order);
          
          setOrders(prevOrders => {
            if (prevOrders.some(order => order.id === data.order.id)) {
              return prevOrders;
            }
            const updatedOrders = [data.order, ...prevOrders].slice(0, 50); // Limit to 50 orders
            return updatedOrders;
          });
        }
      };

      return () => {
        ws.close();
      };
    }
  }, [orgId]);

  const logActivity = async (action, details) => {
    try {
      const chronicleRef = collection(db, 'chronicle');
      const entry = {
        timestamp: serverTimestamp(),
        orgId,
        action,
        details,
        userId: localStorage.getItem('userId') || 'system'
      };
      await addDoc(chronicleRef, entry);
    } catch (error) {
      console.error('Failed to log activity:', error);
    }
  };

  return (
    <AdminOrderContext.Provider value={{
      orders,
      setOrders,
      loading,
      initialLoading,
      hasMore,
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