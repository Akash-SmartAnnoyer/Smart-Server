import React, { useState, useEffect, useRef } from 'react';
import { Button, Tooltip, Input, Tag, Drawer } from 'antd';
import { MinusOutlined, PlusOutlined, CloseOutlined, EditOutlined } from '@ant-design/icons';
import { useCart } from '../contexts/CartContext';
import { useCartIcon } from '../contexts/CartIconContext';
import FlyingItemAnimation from './FlyingItemAnimation';
import ClothingLoader from './ClothingLoader';
import RecommendationSection from './RecommendationSection';
import './ClothingItem.css';

const ClothingItem = ({ item, onItemAdded, recommendations }) => {
  const [showRecommendations, setShowRecommendations] = useState(false);
  const { cart, addToCart, updateQuantity, removeFromCart } = useCart();
  const cartIconRef = useCartIcon();
  const [quantity, setQuantity] = useState(0);
  const [showAnimation, setShowAnimation] = useState(false);
  const [animationStartPosition, setAnimationStartPosition] = useState({ x: 0, y: 0 });
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [selectedTags, setSelectedTags] = useState([]);
  const itemRef = useRef(null);
  const descriptionRef = useRef(null);
  const unavailableGif = process.env.PUBLIC_URL + "/assets/unavailableGif.gif";

  const styles = {
    editIcon: {
      position: 'absolute',
      top: 12,
      right: 12,
      backgroundColor: '#fff',
      borderRadius: '50%',
      padding: 8,
      cursor: 'pointer',
      boxShadow: '0 2px 6px rgba(0, 0, 0, 0.15)',
      zIndex: 2,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      width: 36,
      height: 36,
      transition: 'all 0.3s ease',
      '&:hover': {
        transform: 'scale(1.1)',
        boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
      },
    },
    card: {
      display: 'flex',
      background: '#fff',
      borderRadius: '12px',
      padding: '16px',
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
      marginBottom: '24px',
      border: '1px solid #f0f0f0',
      position: 'relative',
      gap: '16px',
      minHeight: '156px',
    },
    contentSection: {
      flex: 1,
      display: 'flex',
      flexDirection: 'column',
      gap: '8px',
    },
    title: {
      fontSize: '17px',
      fontWeight: '500',
      color: '#282c3f',
      marginBottom: '4px',
    },
    price: {
      fontSize: '15px',
      fontWeight: '400',
      color: '#282c3f',
      marginBottom: '8px',
    },
    description: {
      fontSize: '13px',
      color: 'rgba(40,44,63,.45)',
      lineHeight: '1.3',
      marginTop: '4px',
      position: 'relative',
      maxHeight: isDescriptionExpanded ? 'none' : '34px',
      overflow: 'hidden',
      WebkitLineClamp: isDescriptionExpanded ? 'unset' : '2',
      display: '-webkit-box',
      WebkitBoxOrient: 'vertical',
    },
    imageSection: {
      position: 'relative',
      width: '118px',
      height: '120px',
      flexShrink: 0,
    },
    image: {
      width: '100%',
      height: '100%',
      objectFit: 'cover',
      borderRadius: '8px',
    },
    addButton: {
      position: 'absolute',
      bottom: '8px',
      left: '50%',
      transform: 'translateX(-50%)',
      backgroundColor: 'white',
      color: '#e5004b',
      border: '1px solid #e5004b',
      borderRadius: '6px',
      padding: '6px 24px',
      fontSize: '12px',
      fontWeight: '600',
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      '&:hover': {
        backgroundColor: '#e5004b',
        color: 'white',
      },
    },
    quantityControls: {
      position: 'absolute',
      bottom: '8px',
      left: '50%',
      transform: 'translateX(-50%)',
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      backgroundColor: 'white',
      border: '1px solid #e5004b',
      borderRadius: '6px',
      padding: '2px',
    },
    quantityButton: {
      minWidth: '28px',
      height: '28px',
      padding: 0,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: '#e5004b',
      border: 'none',
      background: 'transparent',
    },
    quantityDisplay: {
      width: '24px',
      textAlign: 'center',
      fontSize: '14px',
      color: '#e5004b',
      fontWeight: '500',
    },
    readMore: {
      color: '#e5004b',
      fontSize: '13px',
      cursor: 'pointer',
      fontWeight: '500',
      marginTop: '4px',
    },
    clothingTypeIcon: {
      width: '28px',
      marginRight: '12px',
    },
    titleWrapper: {
      display: 'flex',
      alignItems: 'center',
      marginBottom: '12px',
    },
    title: {
      fontSize: '18px',
      fontWeight: 'bold',
      margin: 0,
    },
    bottomSection: {
      marginTop: '12px',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      flexShrink: 0,
    },
    disabledAddToCartButton: {
      background: '#d9d9d9',
      cursor: 'not-allowed',
    },
    loaderContainer: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#f5f5f5',
    },
  };

  useEffect(() => {
    const cartItem = cart.find(cartItem => cartItem.id === item.id);
    setQuantity(cartItem ? cartItem.quantity : 0);
  }, [cart, item.id]);

  const needsTruncation = () => {
    if (!descriptionRef.current) return false;
    return descriptionRef.current.scrollHeight > descriptionRef.current.clientHeight;
  };

  const toggleDescription = (e) => {
    e.stopPropagation();
    setIsDescriptionExpanded(!isDescriptionExpanded);
  };

  const getClothingTypeIcon = (type) => {
    switch (type) {
      case 'men':
        return '👔';
      case 'women':
        return '👗';
      case 'kids':
        return '👶';
      case 'accessories':
        return '👜';
      default:
        return '👕';
    }
  };

  const getTruncatedDescription = (text) => {
    return text;
  };

  const getImageUrl = (imageData) => {
    if (!imageData) return '';
    if (typeof imageData === 'string') return imageData;
    if (imageData.url) return imageData.url;
    return '';
  };

  const triggerAnimation = () => {
    if (itemRef.current) {
      const rect = itemRef.current.getBoundingClientRect();
      setAnimationStartPosition({
        x: rect.left + rect.width / 2,
        y: rect.top + rect.height / 2
      });
      setShowAnimation(true);
    }
  };

  const handleAddToCart = () => {
    if (item.available) {
      addToCart(item);
      triggerAnimation();
      if (onItemAdded) onItemAdded();
    }
  };

  const handleDecreaseQuantity = () => {
    if (quantity > 1) {
      updateQuantity(item.id, quantity - 1);
    } else {
      removeFromCart(item.id);
    }
  };

  const handleImageClick = () => {
    // Handle image click (e.g., show larger image)
  };

  const handleEditIconClick = () => {
    // Handle edit icon click
  };

  const handleAnimationComplete = () => {
    setShowAnimation(false);
  };

  const handleTagClick = (tagId) => {
    setSelectedTags(prev => 
      prev.includes(tagId) 
        ? prev.filter(id => id !== tagId)
        : [...prev, tagId]
    );
  };

  const getCartIconPosition = () => {
    if (cartIconRef.current) {
      const rect = cartIconRef.current.getBoundingClientRect();
      return {
        x: rect.left + rect.width / 2,
        y: rect.top + rect.height / 2
      };
    }
    return { x: 0, y: 0 };
  };

  return (
    <div ref={itemRef} style={styles.card}>
      {showAnimation && (
        <FlyingItemAnimation
          startPosition={animationStartPosition}
          endPosition={getCartIconPosition()}
          onComplete={handleAnimationComplete}
        />
      )}
      
      <div style={styles.imageSection}>
        {!imageLoaded && (
          <div style={styles.loaderContainer}>
            <ClothingLoader />
          </div>
        )}
        <img
          src={getImageUrl(item.image)}
          alt={item.name}
          style={styles.image}
          onLoad={() => setImageLoaded(true)}
          onClick={handleImageClick}
        />
      </div>

      <div style={styles.contentSection}>
        <div style={styles.titleWrapper}>
          <span style={styles.clothingTypeIcon}>
            {getClothingTypeIcon(item.type)}
          </span>
          <h3 style={styles.title}>{item.name}</h3>
        </div>

        <div style={styles.price}>₹{item.price}</div>

        <div
          ref={descriptionRef}
          style={styles.description}
          onClick={toggleDescription}
        >
          {getTruncatedDescription(item.description)}
        </div>

        {needsTruncation() && (
          <span style={styles.readMore} onClick={toggleDescription}>
            {isDescriptionExpanded ? 'Show Less' : 'Read More'}
          </span>
        )}

        <div style={styles.bottomSection}>
          {item.tags && item.tags.map(tag => (
            <Tag
              key={tag.id}
              color={selectedTags.includes(tag.id) ? '#e5004b' : 'default'}
              onClick={() => handleTagClick(tag.id)}
              style={{ cursor: 'pointer' }}
            >
              {tag.name}
            </Tag>
          ))}
        </div>
      </div>

      {item.available ? (
        quantity > 0 ? (
          <div style={styles.quantityControls}>
            <Button
              type="text"
              icon={<MinusOutlined />}
              onClick={handleDecreaseQuantity}
              style={styles.quantityButton}
            />
            <span style={styles.quantityDisplay}>{quantity}</span>
            <Button
              type="text"
              icon={<PlusOutlined />}
              onClick={handleAddToCart}
              style={styles.quantityButton}
            />
          </div>
        ) : (
          <Button
            type="primary"
            onClick={handleAddToCart}
            style={styles.addButton}
          >
            Add to Cart
          </Button>
        )
      ) : (
        <div style={{ ...styles.addButton, ...styles.disabledAddToCartButton }}>
          Out of Stock
        </div>
      )}

      {recommendations && recommendations.length > 0 && (
        <RecommendationSection
          recommendations={recommendations}
          onItemAdded={onItemAdded}
        />
      )}
    </div>
  );
};

export default ClothingItem; 