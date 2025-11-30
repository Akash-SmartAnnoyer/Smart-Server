import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../services/api';
import { useAuth } from './AuthContext';

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
  const { orgId } = useAuth();

  useEffect(() => {
    if (!orgId || dataInitialized) return;

    const loadData = async () => {
      setLoading(prev => ({
        ...prev,
        overall: true
      }));

      try {
        // Fetch categories
        setLoading(prev => ({ ...prev, categories: true }));
        const categories = await api.getCategories(orgId);
        const processedCategories = categories.map(cat => ({
          ...cat,
          id: cat._id || cat.id,
          firebaseId: cat._id || cat.id // Keep for backward compatibility
        }));
        setMenuData(prev => ({ ...prev, categories: processedCategories }));
        setLoading(prev => ({ ...prev, categories: false }));

        // Fetch menu items and suggestions in parallel
        const [menuItemsArray, suggestionsData] = await Promise.all([
          api.getMenuItems(orgId),
          api.getMenuSuggestions(orgId).catch(() => ({ suggestions: {} })) // Fallback if no suggestions
        ]);

        const processedMenuItems = menuItemsArray.map(item => ({
          ...item,
          id: item._id || item.id,
          firebaseId: item._id || item.id, // Keep for backward compatibility
          categoryId: item.categoryId ? String(item.categoryId) : item.categoryId,
          subcategoryId: item.subcategoryId ? String(item.subcategoryId) : item.subcategoryId // Ensure subcategoryId is a string
        }));

        // Extract subcategories from categories (if they exist as nested data)
        const subcategories = processedCategories.flatMap(cat => 
          (cat.subcategories || []).map(sub => ({
            ...sub,
            id: String(sub.id || sub._id || ''), // Ensure it's a string and use id (not _id) for subcategories
            firebaseId: String(sub.id || sub._id || ''),
            categoryId: String(cat.id || cat._id || '')
          }))
        );

        setMenuData(prev => ({
          ...prev,
          subcategories: subcategories,
          menuItems: processedMenuItems,
          recommendations: suggestionsData.suggestions || {}
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
      await api.updateMenuSuggestions(orgId, updatedSuggestions);
      
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
    
    await new Promise(resolve => setTimeout(resolve, 100));
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