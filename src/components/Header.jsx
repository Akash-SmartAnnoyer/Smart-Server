import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Input, Badge, Tooltip, Modal, Rate } from 'antd';
import { TiThMenu } from 'react-icons/ti';
import { AiOutlineShoppingCart, AiOutlineFileText, AiFillPhone, AiFillMail, AiFillEnvironment } from 'react-icons/ai';
import { IoPowerSharp } from "react-icons/io5";
import { FaUtensils } from "react-icons/fa";
import { useCart } from '../contexts/CartContext';
import { useCartIcon } from '../contexts/CartIconContext';
import './Header.css';
import CartHitEffect from './CartHitEffect';

const { Search } = Input;

function Header({ toggleDrawer, onSearch }) {
  const { cart } = useCart();
  const cartIconRef = useCartIcon();
  const navigate = useNavigate();
  const location = useLocation();
  const [showHitEffect, setShowHitEffect] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isSignOutModalVisible, setIsSignOutModalVisible] = useState(false);
  const [restaurantLogo, setRestaurantLogo] = useState('');
  const [isLogoModalVisible, setIsLogoModalVisible] = useState(false);
  
  // Add state to track the roles
  const [role, setRole] = useState(localStorage.getItem('role'));  const [restaurantDetails, setRestaurantDetails] = useState(null);
// test commit
  useEffect(() => {
    fetchRestaurantDetails();
  }, []);

  const fetchRestaurantDetails = async () => {
    try {
      const orgId = localStorage.getItem('orgId');
      if (!orgId) {
        console.error("No orgId found in localStorage");
        return;
      }
      const response = await fetch('https://smartserver-json-server.onrender.com/restaurants');
      if (response.ok) {
        const data = await response.json();
        const restaurant = data.find(restaurant => restaurant.orgId === orgId);
        if (restaurant) {
          setRestaurantDetails(restaurant);
          setRestaurantLogo(restaurant.logo);
        } else {
          console.error("No restaurant found with the given orgId");
        }
      } else {
        console.error("Error fetching restaurant data:", response.status);
      }
    } catch (error) {
      console.error("Error fetching restaurant details:", error);
    }
  };

  // Detect role change and navigate when logged out
  useEffect(() => {
    if (!role) {
      navigate('/');
    }
  }, [role, navigate]);

  const handleOrderSummaryClick = () => {
    navigate('/summary-view');
  };

  const handleSignOut = () => {
    setIsSignOutModalVisible(true);
  };

  const handleConfirmSignOut = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('role');
    setRole(null); // Update the role state to null
    setIsSignOutModalVisible(false);
  };

  const handleCancelSignOut = () => {
    setIsSignOutModalVisible(false);
  };

  const triggerHitEffect = () => {
    setShowHitEffect(true);
    setTimeout(() => setShowHitEffect(false), 300);
  };

  const handleSearch = (value) => {
    setSearchTerm(value);
    if (onSearch) {
      onSearch(value);
    }
    if (location.pathname !== '/home') {
      navigate('/home');
    }
  };

  const handleLogoClick = () => {
    setIsLogoModalVisible(true);
  };

  return (
    <header className="header">
      {/* ... (previous header content) */}

      <div className="header__container">
        <div className="header__content">
          <div className="header__left">
            <TiThMenu className="header__menu-button" onClick={toggleDrawer} />
            <Link to="/home" className="header__logo">
              <img 
                src={process.env.PUBLIC_URL + '/assets/logo-transparent-png.png'} 
                alt="Smart Server" 
                className="header__logo-image" 
              />
              <span className="header__logo-text">Smart Server</span>
            </Link>
          </div>
          <div className="header__center">
            <Search
              placeholder="Search menu..."
              className="header__search-input"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onSearch={handleSearch}
            />
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

          <div className="header__right">
            {role === 'customer' && (
              <>
                <Tooltip title="Order Summary">
                  <AiOutlineFileText 
                    onClick={handleOrderSummaryClick} 
                    className="header__icon"
                  />
                </Tooltip>
                <Tooltip title="Cart">
                  <Link to="/cart" className="header__cart-icon">
                    <Badge count={cart.length} offset={[10, 0]}>
                      <div ref={cartIconRef} style={{ position: 'relative' }}>
                        <AiOutlineShoppingCart className="header__icon" style={{marginTop: "8px"}} />
                        {showHitEffect && <CartHitEffect />}
                      </div>
                    </Badge>
                  </Link>
                </Tooltip>
              </>
            )}
            <Tooltip title="Sign Out">
              <IoPowerSharp
                onClick={handleSignOut} 
                className="header__icon"
              />
            </Tooltip>
          </div>
        </div>
      </div>

      {/* Sign Out Confirmation Modal */}
      <Modal
        title="Confirm Sign Out"
        visible={isSignOutModalVisible}
        onOk={handleConfirmSignOut}
        onCancel={handleCancelSignOut}
        okText="Yes, Sign Out"
        cancelText="Cancel"
        style={{
          content: {
            background: 'linear-gradient(135deg, #ffffff, #fff0f0)',
            borderRadius: '1rem',
            overflow: 'hidden',
            boxShadow: '0 10px 25px rgba(255, 0, 0, 0.1)',
          }
        }}
        bodyStyle={{
          padding: '12px',
          fontSize: '1rem',
          color: '#333333',
        }}
        headStyle={{
          background: '#ff0000',
          borderBottom: 'none',
          padding: '8px 12px',
        }}
        titleStyle={{
          color: '#ffffff',
          fontSize: '1.5rem',
          fontWeight: 'bold',
        }}
        footerStyle={{
          borderTop: 'none',
          padding: '8px 12px',
        }}
        okButtonProps={{
          style: {
            backgroundColor: '#ff0000',
            borderColor: '#ff0000',
            color: '#ffffff',
            borderRadius: '0.5rem',
            fontWeight: 'bold',
            height: '30px',
            padding: '0 20px',
            transition: 'all 0.3s ease',
          }
        }}
        cancelButtonProps={{
          style: {
            borderColor: '#ff0000',
            color: '#ff0000',
            borderRadius: '0.5rem',
            fontWeight: 'bold',
            height: '30px',
            padding: '0 20px',
            transition: 'all 0.3s ease',
          }
        }}
      >
        <p>Are you sure you want to sign out?</p>
      </Modal>

      {/* Enhanced Restaurant Logo Modal */}
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
              <AiFillEnvironment style={{ marginRight: '10px', marginTop: '4px', color: '#ff4d4f' }} />
              <span>{restaurantDetails.address}</span>
            </p>
            <p style={{ display: 'flex', alignItems: 'center', marginBottom: '10px' }}>
              <FaUtensils style={{ marginRight: '10px', color: '#ff4d4f' }} />
              Cuisine: {restaurantDetails.peopleCount}
            </p>
            <p style={{ display: 'flex', alignItems: 'center' }}>
              <AiOutlineShoppingCart style={{ marginRight: '10px', color: '#ff4d4f' }} />
              Seating Capacity: {restaurantDetails.seatingCapacity}
            </p>
          </div>
        )}
      </Modal>
    </header>
  );
}

export default Header;