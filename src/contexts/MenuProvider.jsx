import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

console.log('MenuProvider is being loaded');

const MenuContext = createContext();

export function MenuProvider({ children }) {
  const [dataInitialized, setDataInitialized] = useState(false);
  
  const [menuData, setMenuData] = useState({
    categories: [],
    subcategories: [],
    menuItems: [],
    recommendations: {},
  });
  
  const [loading, setLoading] = useState({
    categories: true,
    subcategories: true,
    menuItems: true,
    overall: true
  });
  
  const [error, setError] = useState(null);
  const orgId = localStorage.getItem('orgId');

  const fetchData = async (url, queryParams = null) => {
    try {
      const finalUrl = queryParams 
        ? `${url}?orderBy="orgId"&equalTo=${orgId}`
        : url;
      const response = await fetch(finalUrl);
      const data = await response.json();
      return data;
    } catch (error) {
      console.error(`Error fetching from ${url}:`, error);
      throw error;
    }
  };

  useEffect(() => {
    if (!orgId || dataInitialized) return;

    const loadData = async () => {
      setLoading(prev => ({
        ...prev,
        overall: true
      }));

      try {
        // Fetch categories with query parameter
        setLoading(prev => ({ ...prev, categories: true }));
        const catData = await fetchData('https://smart-server-menu-database.firebaseio.com/categories.json', true);
        const processedCategories = catData ? 
          Object.entries(catData)
            .map(([id, category]) => ({ id, ...category })) : 
          [];
        
        setMenuData(prev => ({ ...prev, categories: processedCategories }));
        setLoading(prev => ({ ...prev, categories: false }));

        // Fetch other data in parallel with query parameters
        const [subData, menuData, sugData] = await Promise.all([
          fetchData('https://smart-server-menu-database.firebaseio.com/subcategories.json', true),
          fetchData('https://smart-server-menu-database.firebaseio.com/menu_items.json', true),
          fetchData('https://smart-server-menu-database.firebaseio.com/menu_suggestions.json') // No filter for suggestions
        ]);

        const processedSubcategories = subData ?
          Object.entries(subData)
            .map(([id, subcategory]) => ({ id, ...subcategory })) :
          [];

        const menuItemsArray = menuData ?
          Object.entries(menuData)
            .map(([id, item]) => ({ id, ...item })) :
          [];

        const processedRecommendations = {};
        if (sugData && menuItemsArray.length > 0) {
          Object.entries(sugData).forEach(([itemId, suggestionIds]) => {
            const suggestedItems = menuItemsArray.filter(menuItem => 
              suggestionIds.some(suggestion => 
                suggestion.name === menuItem.name && 
                suggestion.orgId.toString() === orgId
              )
            );
            if (suggestedItems.length > 0) {
              processedRecommendations[itemId] = suggestedItems;
            }
          });
        }

        setMenuData(prev => ({
          ...prev,
          subcategories: processedSubcategories,
          menuItems: menuItemsArray,
          recommendations: processedRecommendations
        }));

        setLoading({
          categories: false,
          subcategories: false,
          menuItems: false,
          overall: false
        });
        
        setDataInitialized(true);
      } catch (error) {
        console.error('Error fetching menu data:', error);
        setError(error);
        setLoading({
          categories: false,
          subcategories: false,
          menuItems: false,
          overall: false
        });
      }
    };

    loadData();
  }, [orgId, dataInitialized]);

  const updateSuggestions = async (updatedSuggestions) => {
    try {
      const response = await fetch('https://smart-server-menu-database.firebaseio.com/menu_suggestions.json', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedSuggestions),
      });

      if (!response.ok) throw new Error('Failed to save suggestions');
      setMenuData(prev => ({
        ...prev,
        recommendations: updatedSuggestions
      }));
      return true;
    } catch (error) {
      console.error('Error saving suggestions:', error);
      throw error;
    }
  };

  const refreshData = useCallback(async () => {
    setDataInitialized(false);
    setLoading({
      categories: true,
      subcategories: true,
      menuItems: true,
      overall: true
    });
    
    // Force a small delay to ensure state updates properly
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // This will trigger the useEffect to fetch fresh data
    setDataInitialized(false);
  }, []);

  const value = {
    ...menuData,
    loading,
    error,
    dataInitialized,
    refreshData,
    updateSuggestions,
    suggestions: menuData.recommendations
  };

  return (
    <MenuContext.Provider value={value}>
      {children}
    </MenuContext.Provider>
  );
}

export function useMenu() {
  const context = useContext(MenuContext);
  if (context === undefined) {
    throw new Error('useMenu must be used within a MenuProvider');
  }
  return context;
}