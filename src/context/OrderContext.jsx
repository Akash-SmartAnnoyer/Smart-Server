import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';

console.log('OrderContext is being loaded');

const OrderContext = createContext();

export const OrderProvider = ({ children }) => {
  console.log('OrderProvider is being rendered');
  const [orders, setOrders] = useState([]);
  const [restaurantDetails, setRestaurantDetails] = useState(null);
  const [charges, setCharges] = useState([]);
  const orgId = localStorage.getItem('orgId');

  // Fetch restaurant details and charges once when provider mounts
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        // Fetch restaurant details
        const restaurantResponse = await fetch('https://smartdb-175f4-default-rtdb.firebaseio.com/restaurants.json');
        const restaurantData = await restaurantResponse.json();
        const restaurant = Object.values(restaurantData).find(r => r.orgId === orgId);
        setRestaurantDetails(restaurant);

        // Fetch charges
        const chargesResponse = await fetch(`https://smartdb-175f4-default-rtdb.firebaseio.com/restaurants/${orgId}/charges.json`);
        const chargesData = await chargesResponse.json();
        if (chargesData) {
          const chargesArray = Object.entries(chargesData).map(([id, charge]) => ({
            id,
            ...charge
          }));
          setCharges(chargesArray);
        }
      } catch (error) {
        console.error('Error fetching initial data:', error);
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
      loading: false
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