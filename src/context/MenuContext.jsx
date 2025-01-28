import React, { createContext, useState, useContext } from 'react';
import { db } from '../pages/fireBaseConfig';
import { collection, getDocs, query, where, doc, setDoc } from 'firebase/firestore';

const MenuContext = createContext();

export const MenuProvider = ({ children }) => {
  console.log('MenuProvider rendered');
  const [menuItems, setMenuItems] = useState([]);
  const [suggestions, setSuggestions] = useState({});
  const [loading, setLoading] = useState(true);

  const fetchMenuData = async () => {
    setLoading(true);
    try {
      const orgId = parseInt(localStorage.getItem('orgId'));
      
      // Fetch menu items
      const menuQuery = query(
        collection(db, 'menu_items'),
        where('orgId', '==', orgId)
      );
      const menuSnapshot = await getDocs(menuQuery);
      const menuData = menuSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setMenuItems(menuData);

      // Fetch suggestions
      const suggestionsDoc = doc(db, 'menu_suggestions', 'current');
      const suggestionsSnapshot = await getDocs(suggestionsDoc);
      if (suggestionsSnapshot.exists()) {
        setSuggestions(suggestionsSnapshot.data());
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const updateSuggestions = async (updatedSuggestions) => {
    try {
      const suggestionsRef = doc(db, 'menu_suggestions', 'current');
      await setDoc(suggestionsRef, updatedSuggestions);
      setSuggestions(updatedSuggestions);
      return true;
    } catch (error) {
      console.error('Error saving suggestions:', error);
      throw error;
    }
  };

  return (
    <MenuContext.Provider value={{
      menuItems,
      suggestions,
      loading,
      fetchMenuData,
      updateSuggestions
    }}>
      {children}
    </MenuContext.Provider>
  );
};

export const useMenu = () => {
  const context = useContext(MenuContext);
  if (!context) {
    throw new Error('useMenu must be used within a MenuProvider');
  }
  return context;
}; 