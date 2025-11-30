import React, { createContext, useState, useContext } from 'react';
import api from '../services/api';
import { useAuth } from '../contexts/AuthContext';

const MenuContext = createContext();

export const MenuProvider = ({ children }) => {
  console.log('MenuProvider rendered');
  const [menuItems, setMenuItems] = useState([]);
  const [suggestions, setSuggestions] = useState({});
  const [loading, setLoading] = useState(true);
  const { orgId } = useAuth();

  const fetchMenuData = async () => {
    setLoading(true);
    try {
      if (!orgId) {
        throw new Error('Organization ID not available');
      }
      
      // Fetch menu items and suggestions in parallel
      const [menuData, suggestionsData] = await Promise.all([
        api.getMenuItems(orgId).catch(() => []),
        api.getMenuSuggestions(orgId).catch(() => ({ suggestions: {} }))
      ]);
      
      const processedMenuData = menuData.map(item => ({
        ...item,
        id: item._id || item.id
      }));
      setMenuItems(processedMenuData);

      if (suggestionsData && suggestionsData.suggestions) {
        setSuggestions(suggestionsData.suggestions);
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
      if (!orgId) {
        throw new Error('Organization ID not available');
      }
      await api.updateMenuSuggestions(orgId, updatedSuggestions);
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