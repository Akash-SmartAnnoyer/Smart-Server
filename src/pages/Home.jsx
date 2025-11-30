import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import CategoryCard from '../components/CategoryCard';
import SubcategoryCard from '../components/SubcategoryCard';
import MenuItem from '../components/MenuItem';
import FoodLoader from '../components/FoodLoader';
import CategoryNavigator from '../components/BillSummary';
import CartFooter from '../components/CartFooter';
import FoodTypeFilter from '../components/FoodTypeFilter';
import HomeCarousel from '../components/HomeCarousel';
import WelcomeSection from '../components/WelcomeSection';
import { useMenu } from '../contexts/MenuProvider';

function Home({ cartIconRef, onItemAdded, searchTerm }) {
  const { 
    categories, 
    subcategories, 
    menuItems, 
    recommendations,
    loading,
    dataInitialized  
  } = useMenu();

  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedSubcategory, setSelectedSubcategory] = useState(null);
  const [searchResults, setSearchResults] = useState([]);
  const [filters, setFilters] = useState({ veg: true, nonVeg: true });
  
  const location = useLocation();
  const navigate = useNavigate();

  // Search functionality
  useEffect(() => {
    if (searchTerm) {
      const filteredItems = menuItems.filter((item) =>
        item.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setSearchResults(filteredItems.sort((a, b) => a.name.localeCompare(b.name)));
      setSelectedCategory(null);
      setSelectedSubcategory(null);
    } else {
      setSearchResults([]);
    }
  }, [searchTerm, menuItems]);
  
  useEffect(() => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  }, [selectedCategory, selectedSubcategory]);
  
// Mobile Back Navigation Handler
useEffect(() => {
  const handleBrowserBack = (event) => {
    event.preventDefault();

    if (selectedSubcategory) {
      // Going back from subcategory to category view
      setSelectedSubcategory(null);
      navigate(`/home?categoryId=${selectedCategory.id}`, { replace: true });
    } else if (selectedCategory) {
      // Going back from category to main categories view
      setSelectedCategory(null);
      navigate('/home', { replace: true });
    } else {
      // If on the main categories screen, let the app close
      if (window.history.length > 1) {
        window.history.back();
      }
    }
  };

  // Add event listener for popstate
  window.addEventListener('popstate', handleBrowserBack);

  // Cleanup listener
  return () => {
    window.removeEventListener('popstate', handleBrowserBack);
  };
}, [selectedCategory, selectedSubcategory, navigate]);


  // Restore state from URL
  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const categoryId = queryParams.get('categoryId');
    const subcategoryId = queryParams.get('subcategoryId');
    
    if (subcategoryId && subcategories.length > 0 && categories.length > 0) {
      // Try to find subcategory with string comparison
      let subcategory = subcategories.find(sub => {
        const subId = String(sub.id || '').trim();
        const targetId = String(subcategoryId || '').trim();
        return subId === targetId;
      });
      
      // If exact match not found, try flexible matching
      if (!subcategory) {
        console.log('Exact subcategory match not found, trying flexible match');
        
        // Try matching by first 20 characters (prefix match)
        subcategory = subcategories.find(sub => {
          const subId = String(sub.id || '').trim();
          const targetId = String(subcategoryId || '').trim();
          if (subId.length >= 20 && targetId.length >= 20) {
            return subId.slice(0, 20) === targetId.slice(0, 20);
          }
          return false;
        });
        
        // If prefix match not found, try matching without last 1-3 characters
        if (!subcategory && subcategories.length > 0) {
          const targetId = String(subcategoryId || '').trim();
          for (let i = 1; i <= 3 && i < targetId.length; i++) {
            const targetIdBase = targetId.slice(0, -i);
            subcategory = subcategories.find(sub => {
              const subId = String(sub.id || '').trim();
              if (subId.length === targetId.length) {
                return subId.slice(0, -i) === targetIdBase && targetIdBase.length >= 20;
              }
              return false;
            });
            if (subcategory) break;
          }
        }
        
        if (subcategory) {
          console.log('Found subcategory with flexible matching:', {
            requested: subcategoryId,
            found: subcategory.id,
            name: subcategory.name
          });
        }
      }
      
      if (subcategory) {
        const category = categories.find(cat => {
          const catId = String(cat.id || '').trim();
          const targetCatId = String(subcategory.categoryId || '').trim();
          return catId === targetCatId;
        });
        if (category) {
          setSelectedCategory(category);
          setSelectedSubcategory(subcategory);
        } else {
          console.log('Category not found for subcategory:', subcategory.categoryId);
        }
      } else {
        console.log('Subcategory not found:', subcategoryId);
        console.log('Available subcategories:', subcategories.map(s => ({ 
          id: s.id, 
          name: s.name,
          idBase: String(s.id || '').slice(0, -1)
        })));
      }
    } else if (categoryId && categories.length > 0) {
      const category = categories.find(cat => {
        const catId = String(cat.id || '');
        const targetId = String(categoryId || '');
        return catId === targetId;
      });
      if (category) {
        setSelectedCategory(category);
      } else {
        console.log('Category not found:', categoryId);
      }
    }
  }, [location.search, subcategories, categories]);

  // Category and Subcategory Selection Handlers
  const handleCategoryClick = (category) => {
    setSelectedCategory(category);
    setSelectedSubcategory(null);
    navigate(`/home?categoryId=${category.id}`);
  };

  const handleSubcategoryClick = (subcategory) => {
    const category = categories.find(cat => cat.id === subcategory.categoryId);
    setSelectedCategory(category);
    setSelectedSubcategory(subcategory);
    navigate(`/home?categoryId=${category.id}&subcategoryId=${subcategory.id}`);
  };

  const handleBackToCategories = () => {
    setSelectedCategory(null);
    setSelectedSubcategory(null);
    navigate('/home');
  };

  const handleBackToSubcategories = () => {
    setSelectedSubcategory(null);
    navigate(`/home?categoryId=${selectedCategory.id}`);
  };

  // Filter and render logic (keep existing logic)
  const filteredSubcategories = selectedCategory
    ? subcategories.filter((sub) => sub.categoryId === selectedCategory.id)
    : [];

  const filteredMenuItems = selectedSubcategory
    ? menuItems
        .filter((item) => {
          // Ensure both IDs are strings for comparison
          const itemSubId = String(item.subcategoryId || '').trim();
          const selectedSubId = String(selectedSubcategory.id || '').trim();
          
          // Exact match
          if (itemSubId === selectedSubId) {
            return true;
          }
          
          // Try matching with progressively more characters removed from the end
          // This handles cases where IDs differ by 1-3 characters at the end
          if (itemSubId.length > 0 && selectedSubId.length > 0 && itemSubId.length === selectedSubId.length) {
            // Try matching without last 1, 2, or 3 characters
            for (let i = 1; i <= 3 && i < itemSubId.length; i++) {
              const itemSubIdBase = itemSubId.slice(0, -i);
              const selectedSubIdBase = selectedSubId.slice(0, -i);
              if (itemSubIdBase === selectedSubIdBase && itemSubIdBase.length >= 20) {
                console.log(`Matched subcategory ID with last ${i} character(s) difference:`, {
                  itemName: item.name,
                  itemSubId,
                  selectedSubId,
                  base: itemSubIdBase
                });
                return true;
              }
            }
          }
          
          // Also try matching the first 20 characters (most of the ID)
          if (itemSubId.length >= 20 && selectedSubId.length >= 20) {
            const itemSubIdPrefix = itemSubId.slice(0, 20);
            const selectedSubIdPrefix = selectedSubId.slice(0, 20);
            if (itemSubIdPrefix === selectedSubIdPrefix) {
              console.log('Matched subcategory ID by prefix (first 20 chars):', {
                itemName: item.name,
                itemSubId,
                selectedSubId,
                prefix: itemSubIdPrefix
              });
              return true;
            }
          }
          
          // Debug logging for mismatches
          if (itemSubId && selectedSubId && itemSubId !== selectedSubId) {
            console.log('Subcategory ID mismatch:', {
              itemName: item.name,
              itemSubId,
              selectedSubId,
              itemSubIdLength: itemSubId.length,
              selectedSubIdLength: selectedSubId.length
            });
          }
          
          return false;
        })
        .filter(
          (item) => {
            // Handle both foodType (string) and isVeg (boolean) properties
            let itemFoodType = item.foodType;
            
            // If foodType is not set but isVeg is set, convert it
            if (!itemFoodType && item.isVeg !== undefined) {
              itemFoodType = item.isVeg ? 'veg' : 'nonveg';
            }
            
            // If foodType is still not set, show the item (don't filter it out)
            if (!itemFoodType) {
              return true;
            }
            
            // Otherwise, apply the veg/non-veg filter
            return (filters.veg && itemFoodType === 'veg') ||
                   (filters.nonVeg && itemFoodType === 'nonveg');
          }
        )
    : [];
  
  // Debug logging for filtered menu items
  useEffect(() => {
    if (selectedSubcategory) {
      const itemsMatchingSubcategory = menuItems.filter((item) => {
        const itemSubId = String(item.subcategoryId || '').trim();
        const selectedSubId = String(selectedSubcategory.id || '').trim();
        
        if (itemSubId === selectedSubId) return true;
        
        if (itemSubId.length > 0 && selectedSubId.length > 0 && itemSubId.length === selectedSubId.length) {
          for (let i = 1; i <= 3 && i < itemSubId.length; i++) {
            const itemSubIdBase = itemSubId.slice(0, -i);
            const selectedSubIdBase = selectedSubId.slice(0, -i);
            if (itemSubIdBase === selectedSubIdBase && itemSubIdBase.length >= 20) {
              return true;
            }
          }
        }
        
        if (itemSubId.length >= 20 && selectedSubId.length >= 20) {
          return itemSubId.slice(0, 20) === selectedSubId.slice(0, 20);
        }
        
        return false;
      });
      
      const afterVegFilter = itemsMatchingSubcategory.filter((item) => {
        let itemFoodType = item.foodType;
        if (!itemFoodType && item.isVeg !== undefined) {
          itemFoodType = item.isVeg ? 'veg' : 'nonveg';
        }
        if (!itemFoodType) return true;
        return (filters.veg && itemFoodType === 'veg') ||
               (filters.nonVeg && itemFoodType === 'nonveg');
      });
      
      console.log('Filtering menu items for subcategory:', {
        subcategoryId: selectedSubcategory.id,
        subcategoryName: selectedSubcategory.name,
        totalMenuItems: menuItems.length,
        itemsWithSubcategoryId: menuItems.filter(item => item.subcategoryId).length,
        itemsMatchingSubcategory: itemsMatchingSubcategory.length,
        afterVegFilter: afterVegFilter.length,
        filteredCount: filteredMenuItems.length,
        filters: filters,
        menuItemSubcategoryIds: menuItems
          .filter(item => item.subcategoryId)
          .map(item => ({ 
            name: item.name, 
            subcategoryId: String(item.subcategoryId),
            foodType: item.foodType || (item.isVeg !== undefined ? (item.isVeg ? 'veg' : 'nonveg') : 'not set'),
            isVeg: item.isVeg
          }))
      });
    }
  }, [selectedSubcategory, menuItems, filteredMenuItems, filters]);

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
  };

  const renderMenuItem = (item) => (
    <MenuItem 
      key={item.id} 
      item={item} 
      cartIconRef={cartIconRef} 
      onItemAdded={onItemAdded}
      recommendations={recommendations[item.id] || []}
    />
  );

  // Add this useEffect to handle changes in URL
  useEffect(() => {
    const queryParams = new URLSearchParams(window.location.search);
    const subcategoryId = queryParams.get('subcategoryId');
    if (subcategoryId) {
      const subcategory = subcategories.find((sub) => sub.id === subcategoryId);
      if (subcategory) {
        setSelectedSubcategory(subcategory);
        setSelectedCategory(categories.find((cat) => cat.id === subcategory.categoryId)); // Set selected category based on subcategory
      }
    }
  }, [subcategories, categories]);
  return (
    <div className="home-container" style={{  marginBottom: '150px',
      paddingBottom: '70px',
      minHeight: '100vh',
      position: 'relative'  }}>
 <CategoryNavigator
        onCategorySelect={setSelectedCategory}
        onSubcategorySelect={(subcategory) => {
          const category = categories.find(cat => cat.id === subcategory.categoryId);
          setSelectedCategory(category);
          setSelectedSubcategory(subcategory);
        }}
      />
      <CartFooter />
      {!searchTerm && !selectedCategory && <HomeCarousel bannerImage = {"https://static.wixstatic.com/media/4430b8_c48862f5dd9645d6b0f868e50e85cea4~mv2.jpg/v1/fill/w_640,h_440,fp_0.50_0.50,q_80,usm_0.66_1.00_0.01,enc_auto/4430b8_c48862f5dd9645d6b0f868e50e85cea4~mv2.jpg"} />}
      {!searchTerm && !selectedCategory && <WelcomeSection menuItems={menuItems} title="ENJOY YOUR DINING!" caption={"checkout for top recommended dishes"} emojis={"✨🎯"}/>}
      {/* { !selectedCategory && <WelcomeSection menuItems={menuItems} title="TOP RATED FOR YOU!" caption={"Get flat discount on these top selled!"} emojis={"🍽️🔝"}/>} */}
      {searchTerm ? (
        <>
          <h2 className="section-title" style={{ fontFamily: 'Nerko One, sans-serif', fontSize: '30px', textAlign: 'center', marginTop: '55px' }}>
            Search Results for "{searchTerm}"
          </h2>
          {searchResults.length > 0 ? (
            <div className="menu-items-grid">
              {searchResults.map(renderMenuItem)}
            </div>
          ) : (
            <p style={{ textAlign: 'center' }}>No items found.</p>
          )}
        </>
      ) : (
        <>
          {!selectedCategory && (
            <div>
              <h2 className="section-title" style={{ fontFamily: 'Nerko One, sans-serif', fontSize: '30px', textAlign: 'center', marginTop: '20px' }}>Menu Categories</h2>
              {loading.categories && (
                <div style={{
                  position: 'fixed',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  alignItems: 'center',
                  backgroundColor: 'rgba(255, 255, 255, 0.8)',
                  zIndex: 1000,
                }}>
                  <FoodLoader />
                  <div style={{
                    marginTop: '1rem',
                    color: '#FF0000',
                    fontWeight: 'bold',
                    fontSize: '1.2rem',
                  }}>
                    Loading categories...
                  </div>
                </div>
              )}
              {dataInitialized && categories.length === 0 ? (
                <p style={{ textAlign: 'center' }}>No categories available.</p>
              ) : (
                <div className="card-grid">
                  {categories.map((category) => (
                    <CategoryCard
                      key={category.id}
                      category={category}
                      onClick={() => handleCategoryClick(category)}
                    />
                  ))}
                </div>
              )}
            </div>
          )}

          {selectedCategory && !selectedSubcategory && (
            <>
              <button className="back-button" onClick={handleBackToCategories} style={{ marginTop: '64px', marginBottom: '0px', position: 'sticky',
 }}>
                ← Back to Categories
              </button>
              <h2 className="section-title">{selectedCategory.name}</h2>
              {loading.subcategories ? (
                <>
                <div className="loading-animation"
                style={{
          display: 'flex',
          justifyContent: 'center',
          flexDirection: 'column',
          alignItems: 'center',
          height: '200px',
        }}
      >
        <img src="/assets/LoadingMenuItems.gif" alt="Loading menu items..." />
        <h1>Loading Sub Categories</h1>
      </div>
                </>
              ) : (
                <div className="card-grid">
                  {filteredSubcategories?.map((subcategory) => (
                    <SubcategoryCard
                      key={subcategory.id}
                      subcategory={subcategory}
                      onClick={() => handleSubcategoryClick(subcategory)}
                    />
                  ))}
                </div>
              )}
            </>
          )}

{selectedSubcategory && (
  <>
    {/* <div
      style={{
        position: 'sticky',
        top: 90,
        backgroundColor: '#fff',
        zIndex: 1000,
        // padding: '10px 0',
        // boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
        borderRadius: '10px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}
    >
      <button
        className="back-button"
        onClick={handleBackToSubcategories}
        style={{ margin: '0 10px' }}
      >
        ← {selectedCategory.name}
      </button>
      <FoodTypeFilter onFilterChange={handleFilterChange} />
    </div> */}
    
    <h2 className="section-title" style={{marginTop : '70px'}}>{selectedSubcategory.name}</h2>
    {loading.menuItems ? (
                <div className="loading-animation"
                style={{
          display: 'flex',
          justifyContent: 'center',
          flexDirection: 'column',
          alignItems: 'center',
          height: '200px',
        }}
      >
        <img src="/assets/LoadingMenuItems.gif" alt="Loading menu items..." />
        <h1>Loading Menu Items</h1>
      </div>
    ) : (
      <div className="menu-items-grid" style={{marginTop : "10px"}}>
        {filteredMenuItems.sort((a, b) => a.name.localeCompare(b.name)).map(renderMenuItem)}
      </div>
    )}
  </>
)}
        </>
      )}
    </div>
  );
}

export default Home;