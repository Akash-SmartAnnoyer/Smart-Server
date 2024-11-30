import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import CategoryCard from "../components/CategoryCard";
import SubcategoryCard from "../components/SubcategoryCard";
import MenuItem from "../components/MenuItem";
import FoodLoader from "../components/FoodLoader";
import CategoryNavigator from "../components/BillSummary";
import CartFooter from "../components/CartFooter";
import FoodTypeFilter from "../components/FoodTypeFilter";
import HomeCarousel from "../components/HomeCarousel";
import WelcomeSection from "../components/WelcomeSection";
import { useMenu } from "../contexts/MenuProvider";
//test commit
function Home({ cartIconRef, onItemAdded, searchTerm }) {
  const {
    categories,
    subcategories,
    menuItems,
    recommendations,
    loading,
    dataInitialized,
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
      setSearchResults(filteredItems);
      setSelectedCategory(null);
      setSelectedSubcategory(null);
    } else {
      setSearchResults([]);
    }
  }, [searchTerm, menuItems]);

  useEffect(() => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
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
        navigate("/home", { replace: true });
      } else {
        // If on the main categories screen, let the app close
        if (window.history.length > 1) {
          window.history.back();
        }
      }
    };

    // Add event listener for popstate
    window.addEventListener("popstate", handleBrowserBack);

    // Cleanup listener
    return () => {
      window.removeEventListener("popstate", handleBrowserBack);
    };
  }, [selectedCategory, selectedSubcategory, navigate]);

  // Restore state from URL
  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const categoryId = queryParams.get("categoryId");
    const subcategoryId = queryParams.get("subcategoryId");

    if (subcategoryId && subcategories.length > 0 && categories.length > 0) {
      const subcategory = subcategories.find((sub) => sub.id === subcategoryId);
      if (subcategory) {
        const category = categories.find(
          (cat) => cat.id === subcategory.categoryId
        );
        setSelectedCategory(category);
        setSelectedSubcategory(subcategory);
      }
    } else if (categoryId && categories.length > 0) {
      const category = categories.find((cat) => cat.id === categoryId);
      if (category) {
        setSelectedCategory(category);
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
    const category = categories.find(
      (cat) => cat.id === subcategory.categoryId
    );
    setSelectedCategory(category);
    setSelectedSubcategory(subcategory);
    navigate(`/home?categoryId=${category.id}&subcategoryId=${subcategory.id}`);
  };

  const handleBackToCategories = () => {
    setSelectedCategory(null);
    setSelectedSubcategory(null);
    navigate("/home");
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
        .filter((item) => item.subcategoryId === selectedSubcategory.id)
        .filter(
          (item) =>
            (filters.veg && item.foodType === "veg") ||
            (filters.nonVeg && item.foodType === "nonveg")
        )
    : [];

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
    const subcategoryId = queryParams.get("subcategoryId");
    if (subcategoryId) {
      const subcategory = subcategories.find((sub) => sub.id === subcategoryId);
      if (subcategory) {
        setSelectedSubcategory(subcategory);
        setSelectedCategory(
          categories.find((cat) => cat.id === subcategory.categoryId)
        ); // Set selected category based on subcategory
      }
    }
  }, [subcategories, categories]);
  return (
    <div
      className="home-container"
      style={{
        marginBottom: "150px",
        paddingBottom: "70px",
        minHeight: "100vh",
        position: "relative",
      }}
    >
      <CategoryNavigator
        onCategorySelect={setSelectedCategory}
        onSubcategorySelect={(subcategory) => {
          const category = categories.find(
            (cat) => cat.id === subcategory.categoryId
          );
          setSelectedCategory(category);
          setSelectedSubcategory(subcategory);
        }}
      />
      <CartFooter />
      {!searchTerm && !selectedCategory && (
        <HomeCarousel
          bannerImage={
            "https://static.wixstatic.com/media/4430b8_c48862f5dd9645d6b0f868e50e85cea4~mv2.jpg/v1/fill/w_640,h_440,fp_0.50_0.50,q_80,usm_0.66_1.00_0.01,enc_auto/4430b8_c48862f5dd9645d6b0f868e50e85cea4~mv2.jpg"
          }
        />
      )}
      {!searchTerm && !selectedCategory && (
        <WelcomeSection
          menuItems={menuItems}
          title="ENJOY YOUR DINING!"
          caption={"checkout for top recommended dishes"}
          emojis={"✨🎯"}
        />
      )}
      {/* { !selectedCategory && <WelcomeSection menuItems={menuItems} title="TOP RATED FOR YOU!" caption={"Get flat discount on these top selled!"} emojis={"🍽️🔝"}/>} */}
      {searchTerm ? (
        <>
          <h2
            className="section-title"
            style={{
              fontFamily: "Nerko One, sans-serif",
              fontSize: "30px",
              textAlign: "center",
              marginTop: "55px",
            }}
          >
            Search Results for "{searchTerm}"
          </h2>
          {searchResults.length > 0 ? (
            <div className="menu-items-grid">
              {searchResults.map(renderMenuItem)}
            </div>
          ) : (
            <p style={{ textAlign: "center" }}>No items found.</p>
          )}
        </>
      ) : (
        <>
          {!selectedCategory && (
            <div>
              <h2
                className="section-title"
                style={{
                  fontFamily: "Nerko One, sans-serif",
                  fontSize: "30px",
                  textAlign: "center",
                  marginTop: "20px",
                }}
              >
                Menu Categories
              </h2>
              {loading.categories && (
                <div
                  style={{
                    position: "fixed",
                    top: 0,
                    left: 0,
                    width: "100%",
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                    alignItems: "center",
                    backgroundColor: "rgba(255, 255, 255, 0.8)",
                    zIndex: 1000,
                  }}
                >
                  <FoodLoader />
                  <div
                    style={{
                      marginTop: "1rem",
                      color: "#FF0000",
                      fontWeight: "bold",
                      fontSize: "1.2rem",
                    }}
                  >
                    Loading categories...
                  </div>
                </div>
              )}
              {dataInitialized && categories.length === 0 ? (
                <p style={{ textAlign: "center" }}>No categories available.</p>
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
              <button
                className="back-button"
                onClick={handleBackToCategories}
                style={{
                  marginTop: "64px",
                  marginBottom: "0px",
                  position: "sticky",
                }}
              >
                ← Back to Categories
              </button>
              <h2 className="section-title">{selectedCategory.name}</h2>
              {loading.subcategories ? (
                <>
                  <div
                    className="loading-animation"
                    style={{
                      display: "flex",
                      justifyContent: "center",
                      flexDirection: "column",
                      alignItems: "center",
                      height: "200px",
                    }}
                  >
                    <img
                      src="/assets/LoadingMenuItems.gif"
                      alt="Loading menu items..."
                    />
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

              <h2 className="section-title" style={{ marginTop: "70px" }}>
                {selectedSubcategory.name}
              </h2>
              {loading.menuItems ? (
                <div
                  className="loading-animation"
                  style={{
                    display: "flex",
                    justifyContent: "center",
                    flexDirection: "column",
                    alignItems: "center",
                    height: "200px",
                  }}
                >
                  <img
                    src="/assets/LoadingMenuItems.gif"
                    alt="Loading menu items..."
                  />
                  <h1>Loading Menu Items</h1>
                </div>
              ) : (
                <div className="menu-items-grid" style={{ marginTop: "10px" }}>
                  {filteredMenuItems.map(renderMenuItem)}
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
