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
  updateDoc 
} from 'firebase/firestore';
import { db } from '../pages/fireBaseConfig';

const AdminOrderContext = createContext();

export const AdminOrderProvider = ({ children }) => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const orgId = localStorage.getItem('orgId');


  const fetchOrders = async (endAt = null, limit = 5) => {
    try {
      setLoading(true);
      const historyRef = collection(db, 'history');
      let q;

      if (endAt) {
        // Query orders before the endAt timestamp for the specific orgId
<<<<<<< Updated upstream
        url = `https://smart-server-menu-database.firebaseio.com/history.json?orderBy="timestamp"&endAt="${endAt}"&limitToLast=${limit + 1}`;
      } else {
        // Initial load - get the most recent orders
        url = `https://smart-server-menu-database.firebaseio.com/history.json?orderBy="timestamp"&limitToLast=${limit}`;
=======
        q = query(
          historyRef,
          where('orgId', '==', orgId),
          orderBy('timestamp', 'desc'),
          startAfter(endAt),
          limit(limit + 1)
        );
      } else {
        // Initial load - get the most recent orders
        q = query(
          historyRef,
          where('orgId', '==', orgId),
          orderBy('timestamp', 'desc'),
          limit(limit)
        );
>>>>>>> Stashed changes
      }

      const querySnapshot = await getDocs(q);
      const ordersArray = querySnapshot.docs.map(doc => ({
        ...doc.data(),
        id: doc.id
      }));

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
<<<<<<< Updated upstream
      const response = await fetch(
        `https://smart-server-menu-database.firebaseio.com/history/${orderId}.json`,
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updates),
        }
      );

      if (!response.ok) throw new Error('Failed to update order');
=======
      const orderRef = doc(db, 'history', orderId);
      await updateDoc(orderRef, updates);
>>>>>>> Stashed changes

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