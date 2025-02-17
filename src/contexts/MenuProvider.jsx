import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { db } from '../pages/fireBaseConfig';
import { 
  collection, 
  query, 
  where, 
  getDocs,
  doc,
  setDoc,
  getDoc
} from 'firebase/firestore';

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

  const fetchCollectionData = async (collectionName) => {
    try {
      const collectionRef = collection(db, collectionName);
      const q = query(collectionRef, where('orgId', '==', parseInt(orgId)));
      const querySnapshot = await getDocs(q);
      
      return querySnapshot.docs.map(doc => ({
        ...doc.data(),
        id: doc.id,
        firebaseId: doc.id
      }));
    } catch (error) {
      console.error(`Error fetching ${collectionName}:`, error);
      throw error;
    }
  };

  const fetchSuggestions = async () => {
    try {
      const orgId = parseInt(localStorage.getItem('orgId'));
      const suggestionsRef = collection(db, 'menu_suggestions', orgId.toString(), 'items');
      const querySnapshot = await getDocs(suggestionsRef);

      const suggestionsData = {};
      querySnapshot.forEach(doc => {
        suggestionsData[doc.id] = doc.data().suggestions || [];
      });

      return suggestionsData;
    } catch (error) {
      console.error('Error fetching suggestions:', error);
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
        // Fetch categories
        setLoading(prev => ({ ...prev, categories: true }));
        const processedCategories = await fetchCollectionData('categories');
        setMenuData(prev => ({ ...prev, categories: processedCategories }));
        setLoading(prev => ({ ...prev, categories: false }));

        // Fetch other data in parallel
        const [processedSubcategories, menuItemsArray, suggestionsData] = await Promise.all([
          fetchCollectionData('subcategories'),
          fetchCollectionData('menu_items'),
          fetchSuggestions()
        ]);

        setMenuData(prev => ({
          ...prev,
          subcategories: processedSubcategories,
          menuItems: menuItemsArray,
          recommendations: suggestionsData
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
      const orgId = parseInt(localStorage.getItem('orgId'));

      // Iterate over each menu item and store its suggestions in a separate document
      for (const [itemId, suggestions] of Object.entries(updatedSuggestions)) {
        const suggestionsRef = doc(db, 'menu_suggestions', orgId.toString(), 'items', itemId);
        await setDoc(suggestionsRef, { suggestions }, { merge: true });
      }

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