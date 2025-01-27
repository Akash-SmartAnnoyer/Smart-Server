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
<<<<<<< Updated upstream
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
=======
        const processedCategories = await fetchCollectionData('categories');
        setMenuData(prev => ({ ...prev, categories: processedCategories }));
        setLoading(prev => ({ ...prev, categories: false }));

        // Fetch other data in parallel
        const [processedSubcategories, menuItemsArray] = await Promise.all([
          fetchCollectionData('subcategories'),
          fetchCollectionData('menu_items')
>>>>>>> Stashed changes
        ]);

        // Fetch suggestions
        const suggestionsRef = doc(db, 'menu_suggestions', 'suggestions');
        const suggestionsDoc = await getDoc(suggestionsRef);
        const sugData = suggestionsDoc.exists() ? suggestionsDoc.data() : {};

        const processedRecommendations = {};
        if (Object.keys(sugData).length > 0 && menuItemsArray.length > 0) {
          Object.entries(sugData).forEach(([itemId, suggestionIds]) => {
            const suggestedItems = menuItemsArray.filter(menuItem => 
              suggestionIds.some(suggestion => 
                suggestion.name === menuItem.name && 
                suggestion.orgId === orgId
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
<<<<<<< Updated upstream
      const response = await fetch('https://smart-server-menu-database.firebaseio.com/menu_suggestions.json', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedSuggestions),
      });

      if (!response.ok) throw new Error('Failed to save suggestions');
=======
      const suggestionsRef = doc(db, 'menu_suggestions', 'suggestions');
      await setDoc(suggestionsRef, updatedSuggestions);
      
>>>>>>> Stashed changes
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