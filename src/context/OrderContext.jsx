import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import { db } from '../pages/fireBaseConfig';
import { 
  collection, 
  query, 
  where, 
  getDocs,
  doc,
  getDoc
} from 'firebase/firestore';

console.log('OrderContext is being loaded');

const OrderContext = createContext();

export const OrderProvider = ({ children }) => {
  console.log('OrderProvider is being rendered');
  const [orders, setOrders] = useState([]);
  const [restaurantDetails, setRestaurantDetails] = useState(null);
  const [charges, setCharges] = useState([]);
  const [loading, setLoading] = useState(true);
  const orgId = localStorage.getItem('orgId');

  // Fetch restaurant details and charges once when provider mounts
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        setLoading(true);
<<<<<<< Updated upstream
        // Fetch restaurant details with query parameter
        const restaurantResponse = await fetch(
          `https://smart-server-menu-database.firebaseio.com/restaurants.json?orderBy="orgId"&equalTo="${orgId}"`
        );
        const restaurantData = await restaurantResponse.json();
=======
>>>>>>> Stashed changes
        
        // Fetch restaurant details
        const restaurantsRef = collection(db, 'restaurants');
        const q = query(restaurantsRef, where('orgId', '==', orgId));
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
          // Get the first document since we're filtering by orgId
          const restaurantDoc = querySnapshot.docs[0];
          const restaurant = restaurantDoc.data();
          setRestaurantDetails(restaurant);

<<<<<<< Updated upstream
          // Fetch charges directly using the restaurant key
          const restaurantKey = Object.keys(restaurantData)[0];
          const chargesResponse = await fetch(
            `https://smart-server-menu-database.firebaseio.com/restaurants/${restaurantKey}/charges.json`
          );
          const chargesData = await chargesResponse.json();
=======
          // Fetch charges from the restaurant's charges subcollection
          const chargesRef = collection(db, 'restaurants', restaurantDoc.id, 'charges');
          const chargesSnapshot = await getDocs(chargesRef);
>>>>>>> Stashed changes
          
          const chargesArray = chargesSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          }));
          setCharges(chargesArray);
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