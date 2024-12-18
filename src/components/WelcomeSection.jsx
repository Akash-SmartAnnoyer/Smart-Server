import React, { useMemo } from 'react';
import { Typography } from 'antd';
import './WelcomeSection.css';
import { useCart } from '../contexts/CartContext';

const { Text } = Typography;

const WelcomeSection = ({ menuItems, title, caption, emojis }) => {
  const { addToCart, cart } = useCart();

  const getImageUrl = (imageData) => {
    if (!imageData) return '';
    if (typeof imageData === 'string') return imageData;
    if (imageData.file?.url) return imageData.file.url;
    return '';
  };

  // Memoize the random items so they don't change on re-renders
  const randomMenuItems = useMemo(() => {
    const getRandomItems = (items, count) => {
      const shuffled = [...items].sort(() => 0.5 - Math.random());
      return shuffled.slice(0, count);
    };
    return getRandomItems(menuItems, 10);
  }, [menuItems]); // Only re-shuffle when menuItems changes

  const handleAddToCart = (item, event) => {
    event.stopPropagation();
    addToCart(item);
  };

  const isItemInCart = (itemId) => {
    return cart.some(cartItem => cartItem.id === itemId);
  };

  return (
    <div className="welcome-section">
      <div className="welcome-header">
        <Text style={{ fontSize: 30 }}>{emojis}</Text>
        <h1 className="welcome-title">{title}😊</h1>
      </div>
      <Text className="welcome-subtitle">
        {caption}
      </Text>
      <div className="menu-scroll-container">
        <div className="menu-items">
          {randomMenuItems.map((item) => (
            <div key={item.id} className="menu-card">
              <div className="menu-card-image-container">
                <img
                  src={getImageUrl(item.image)}
                  alt={item.name}
                  className="menu-card-image"
                />
                <button 
                  className={`add-to-cart-button ${isItemInCart(item.id) ? 'added' : ''}`}
                  onClick={(e) => handleAddToCart(item, e)}
                >
                  {isItemInCart(item.id) ? 'ADDED' : 'ADD'}
                </button>
                <div className="menu-card-content">
                  <h3 className="menu-card-title">{item.name}</h3>
                  <p className="menu-card-price">₹{item.price}</p>
                </div>
                {item.isVeg && (
                  <div className="veg-badge">
                    <span className="veg-icon"></span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default WelcomeSection;