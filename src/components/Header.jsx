import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Input, Badge, Tooltip, Modal, Rate, message } from 'antd';
import { FaUtensils } from "react-icons/fa";
import { AiOutlineShoppingCart, AiOutlineFileText, AiFillPhone, AiFillMail, AiFillEnvironment } from 'react-icons/ai';
import { 
  Search, 
  MapPin, 
  LogOut
} from 'lucide-react';
import { useCart } from '../contexts/CartContext';
import './Header.css';
import { Modal as AntModal } from 'antd';

const API_URL = 'http://localhost:5000/api';

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
  const [isSignOutModalVisible, setIsSignOutModalVisible] = useState(false);
  const [loading, setLoading] = useState(true);

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
    fetchRestaurantDetails();
  }, []);

  const fetchRestaurantDetails = async () => {
    try {
      setLoading(true);
      const orgId = localStorage.getItem('orgId');
      
      if (!orgId) {
        console.error("No orgId found in localStorage");
        return;
      }

      const response = await fetch(`${API_URL}/restaurants/org/${orgId}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch restaurant details');
      }

      const data = await response.json();
      
      if (data) {
        setRestaurantDetails(data);
        setRestaurantLogo(data.logo);
      } else {
        message.error("No restaurant found for this organization");
      }
    } catch (error) {
      console.error('Error fetching restaurant details:', error);
      message.error('Failed to load restaurant details');
    } finally {
      setLoading(false);
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
    setIsSignOutModalVisible(true);
  };

  const confirmSignOut = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('role');
    localStorage.removeItem('orgId');
    setIsSignOutModalVisible(false);
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

            <div className="header__right">
              {role === 'customer' && restaurantDetails && (
                <>
                  <div className="header__location">
                    <MapPin size={20} />
                    <div>
                      <div className="header__location-text">
                        {restaurantDetails.name}
                      </div>
                      <div className="header__location-subtext">
                        {restaurantDetails.address}
                      </div>
                    </div>
                  </div>
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
                </>
              )}
              {role === 'admin' && (
                <div className="header__admin-actions">
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
                  <LogOut 
                    className="header__icon" 
                    onClick={handleSignOut}
                  />
                </div>
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

      {/* Sign Out Modal */}
      <AntModal
        title="Confirm Sign Out"
        open={isSignOutModalVisible}
        onOk={confirmSignOut}
        onCancel={() => setIsSignOutModalVisible(false)}
        okText="Yes, Sign Out"
        cancelText="Cancel"
        className="signout-confirmation-modal"
        okButtonProps={{ 
          style: { 
            background: '#ff4b2b',
            borderColor: '#ff4b2b'
          } 
        }}
        cancelButtonProps={{ 
          style: { 
            borderColor: '#ff4b2b',
            color: '#ff4b2b'
          } 
        }}
      >
        <p>Are you sure you want to sign out?</p>
      </AntModal>

      {/* Restaurant Details Modal */}
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
            <h2 style={{ fontSize: '24px', marginBottom: '10px', color: '#333' }}>
              {restaurantDetails.name}
            </h2>
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
                size={64}
                style={{ 
                  marginRight: '10px', 
                  marginTop: '4px', 
                  color: '#ff4d4f' 
                }} 
              />
              <span>{restaurantDetails.address}</span>
            </p>
          </div>
        )}
      </Modal>
    </header>
  );
}

export default Header;