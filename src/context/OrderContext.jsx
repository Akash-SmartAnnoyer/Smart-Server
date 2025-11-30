import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import api from '../services/api';
import { useAuth } from '../contexts/AuthContext';

console.log('OrderContext is being loaded');

const OrderContext = createContext();

export const OrderProvider = ({ children }) => {
  console.log('OrderProvider is being rendered');
  const [orders, setOrders] = useState([]);
  const [restaurantDetails, setRestaurantDetails] = useState(null);
  const [charges, setCharges] = useState([]);
  const [loading, setLoading] = useState(true);
  const { orgId } = useAuth();

  // Fetch restaurant details and charges once when provider mounts
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        setLoading(true);
        
        // Check if user is authenticated (has token) or is a guest customer
        const token = localStorage.getItem('token');
        const isPublic = !token || token === 'null' || token === ''; // Use public endpoint if no token (customer access)
        
        console.log('OrderContext: Fetching data with isPublic:', isPublic, 'orgId:', orgId, 'hasToken:', !!token);
        
        // Fetch restaurant details and charges in parallel
        const [restaurant, chargesData] = await Promise.all([
          api.getRestaurant(orgId, isPublic).catch((err) => {
            console.error('OrderContext: Error fetching restaurant:', err);
            return null;
          }),
          api.getCharges(orgId, isPublic).catch((err) => {
            console.error('OrderContext: Error fetching charges:', err);
            return [];
          })
        ]);

        if (restaurant) {
          setRestaurantDetails(restaurant);
        }

        if (chargesData && Array.isArray(chargesData)) {
          setCharges(chargesData);
        }
      } catch (error) {
        console.error('Error fetching initial data:', error);
      } finally {
        setLoading(false);
      }
    };

    if (orgId) {
      fetchInitialData();
    }
  }, [orgId]);

  // Add new order to context immediately
  const addOrder = (order) => {
    setOrders(prev => [order, ...prev]);
  };

  const getLastActiveOrder = useCallback(() => {
    return orders.find(order => order.status !== 'completed' && order.status !== 'cancelled') || null;
  }, [orders]);

  // Add this new function to get all active orders
  const getActiveOrders = useCallback(() => {
    return orders.filter(order => 
      order.status !== 'completed' && 
      order.status !== 'cancelled'
    ) || [];
  }, [orders]);

  return (
    <OrderContext.Provider value={{
      orders,
      setOrders,
      restaurantDetails,
      charges,
      addOrder,
      getLastActiveOrder,
      getActiveOrders,
      loading: loading
    }}>
      {children}
    </OrderContext.Provider>
  );
};

export const useOrders = () => {
  const context = useContext(OrderContext);
  if (!context) {
    throw new Error('useOrders must be used within an OrderProvider');
  }
  return context;
}; 