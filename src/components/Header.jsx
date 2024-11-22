import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Input, Badge, Tooltip, Modal, Rate } from 'antd';
import { FaUtensils } from "react-icons/fa";
import { AiOutlineShoppingCart, AiOutlineFileText, AiFillPhone, AiFillMail, AiFillEnvironment, AiOutlineAudio } from 'react-icons/ai';
import { 
  Search, 
  MapPin, 
  ShoppingCart, 
  FileText, 
  ChevronDown, 
  LogOut, 
  MapPinned
} from 'lucide-react';
import { useCart } from '../contexts/CartContext';
import './Header.css';

function Header({ onSearch }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { cart } = useCart();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPlaceholder, setCurrentPlaceholder] = useState(0);
  const [restaurantLogo, setRestaurantLogo] = useState('');
  const [isLogoModalVisible, setIsLogoModalVisible] = useState(false);
  const [role, setRole] = useState(localStorage.getItem('role'));
  const [restaurantDetails, setRestaurantDetails] = useState(null);

  const searchPlaceholders = [
    "Search for your favorite dishes...",
    "Craving something specific?",
    "Explore our menu",
    "What would you like to eat?",
  ];

  useEffect(() => {
    const handleScroll = () => {
      setIsCollapsed(window.scrollY > 80);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentPlaceholder(prev => (prev + 1) % searchPlaceholders.length);
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    // Fetch restaurant details
    fetchRestaurantDetails();
  }, []);

  const fetchRestaurantDetails = async () => {
    try {
      const orgId = localStorage.getItem('orgId');
      // Your existing fetch logic here
      // This is just a placeholder
      const response = await fetch('https://smart-server-menu-database-default-rtdb.firebaseio.com/restaurants.json');
      const data = await response.json();
      setRestaurantDetails(data);
      if (data) {
        const restaurant = Object.values(data).find(restaurant => restaurant.orgId === orgId);
        
        if (restaurant) {
          setRestaurantDetails(restaurant);
          setRestaurantLogo(restaurant.logo);
        } else {
          console.error("No restaurant found with the given orgId");
        }
      } else {
        console.error("No data available in the database");
      }
    } catch (error) {
      console.error('Error fetching restaurant details:', error);
    }
  };

  const handleSearch = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    if (onSearch) {
      onSearch(value);
    }
  };
  const handleLogoClick = () => {
    setIsLogoModalVisible(true);
  };

  const handleSignOut = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('role');
    navigate('/');
  };

  return (
    <header className={`header ${isCollapsed ? 'header--collapsed' : 'header--expanded'}`}>
      <div className="header__container">
        <div className="header__content">
          <div className="header__top-row">
            <div className="header__left">
              <Link to="/home" className="header__logo">
                <img 
                  src="/assets/logo-transparent-png.png" 
                  alt="Smart Server" 
                  className="header__logo-image" 
                />
                <span className="header__logo-text">Smart Server</span>
              </Link>
            </div>

            {role === 'customer' && (
              <div className="header__location">
                <MapPin size={20} />
                <div>
                  <div className="header__location-text">
                    {restaurantDetails?.name || 'Restaurant Name'}
                  </div>
                  <div className="header__location-subtext">
                    {restaurantDetails?.address || 'Loading address...'}
                  </div>
                </div>
                {/* <ChevronDown size={16} /> */}
              </div>
            )}
                      <div className="header__right">
          {restaurantLogo && (
              <div className="header__restaurant-logo-container">
                <img 
                  src={restaurantLogo}
                  alt="Restaurant Logo"
                  className="header__restaurant-logo"
                  onClick={handleLogoClick}
                />
              </div>
            )}
            </div>

            <div className="header__actions">
              {/* {role === 'customer' && (
                <>
                  <FileText 
                    className="header__icon" 
                    onClick={() => navigate('/summary-view')} 
                  />
                  <Link to="/cart" className="header__cart-badge">
                    <ShoppingCart className="header__icon" />
                    {cart.length > 0 && (
                      <span className="cart-count">{cart.length}</span>
                    )}
                  </Link>
                </>
              )} */}
              {role !== 'customer' && (
                <LogOut 
                  className="header__icon" 
                  onClick={handleSignOut} 
                />
              )}
            </div>
          </div>

          {role !== 'admin' && (
            <div className="header__search-row">
              <div className="search-container">
                <Search className="search-icon" size={20} />
                <input
                  type="text"
                  className="search-input"
                  placeholder={searchPlaceholders[currentPlaceholder]}
                  value={searchTerm}
                  onChange={handleSearch}
                />
              </div>
            </div>
          )}
        </div>
      </div>
      <Modal
        visible={isLogoModalVisible}
        onCancel={() => setIsLogoModalVisible(false)}
        footer={null}
        width="90%"
        style={{
          maxWidth: '600px',
        }}
        bodyStyle={{
          padding: '20px',
          background: 'linear-gradient(135deg, #ffffff, #fff0f0)',
          borderRadius: '1rem',
        }}
      >
        {restaurantDetails && (
          <div className="restaurant-details">
            <img 
              src={restaurantDetails.logo}
              alt={`${restaurantDetails.name} Logo`}
              style={{
                width: '100%',
                maxHeight: '200px',
                objectFit: 'contain',
                borderRadius: '10px',
                marginBottom: '20px',
              }}
            />
            <h2 style={{ fontSize: '24px', marginBottom: '10px', color: '#333' }}>{restaurantDetails.name}</h2>
            <Rate disabled defaultValue={4} style={{ marginBottom: '15px' }} />
            <p style={{ display: 'flex', alignItems: 'center', marginBottom: '10px' }}>
              <AiFillPhone style={{ marginRight: '10px', color: '#ff4d4f' }} />
              {restaurantDetails.phone}
            </p>
            <p style={{ display: 'flex', alignItems: 'center', marginBottom: '10px' }}>
              <AiFillMail style={{ marginRight: '10px', color: '#ff4d4f' }} />
              {restaurantDetails.email}
            </p>
            <p style={{ display: 'flex', alignItems: 'flex-start', marginBottom: '10px' }}>
              <AiFillEnvironment 
                size={64}  // Increased size significantly
                style={{ 
                  marginRight: '10px', 
                  marginTop: '4px', 
                  color: '#ff4d4f' 
                }} 
              />
              <span>{restaurantDetails.address}</span>
            </p>
            {/* <p style={{ display: 'flex', alignItems: 'center', marginBottom: '10px' }}>
              <FaUtensils style={{ marginRight: '10px', color: '#ff4d4f' }} />
              Cuisine: {restaurantDetails.peopleCount}
            </p> */}
            {/* <p style={{ display: 'flex', alignItems: 'center' }}>
              <AiOutlineShoppingCart style={{ marginRight: '10px', color: '#ff4d4f' }} />
              Seating Capacity: {restaurantDetails.seatingCapacity}
            </p> */}
          </div>
        )}
      </Modal>
    </header>
  );
}

export default Header;