import React, { createContext, useState, useContext } from 'react';

const MenuContext = createContext();

export const MenuProvider = ({ children }) => {
  console.log('MenuProvider rendered');
  const [menuItems, setMenuItems] = useState([]);
  const [suggestions, setSuggestions] = useState({});
  const [loading, setLoading] = useState(true);

  const fetchMenuData = async () => {
    setLoading(true);
    try {
      const [menuResponse, suggestionsResponse] = await Promise.all([
        fetch('https://smartdb-175f4-default-rtdb.firebaseio.com/menu_items.json'),
        fetch('https://smartdb-175f4-default-rtdb.firebaseio.com/menu_suggestions.json')
      ]);
      const menuData = await menuResponse.json();
      const suggestionsData = await suggestionsResponse.json();

      if (menuData) {
        const orgId = parseInt(localStorage.getItem('orgId'));
        const matchedMenuItems = Object.entries(menuData)
          .map(([id, item]) => ({ id, ...item }))
          .filter(item => item.orgId === orgId);
        setMenuItems(matchedMenuItems);
      }

      if (suggestionsData) {
        setSuggestions(suggestionsData);
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
      const response = await fetch('https://smartdb-175f4-default-rtdb.firebaseio.com/menu_suggestions.json', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedSuggestions),
      });

      if (!response.ok) throw new Error('Failed to save suggestions');
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