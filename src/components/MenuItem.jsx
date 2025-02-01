import React, { useState, useEffect, useRef } from 'react';
import { Button, Tooltip, Input, Tag, Drawer } from 'antd';
import { MinusOutlined, PlusOutlined, CloseOutlined, EditOutlined } from '@ant-design/icons';
import { useCart } from '../contexts/CartContext';
import { useCartIcon } from '../contexts/CartIconContext';
import FlyingItemAnimation from './FlyingItemAnimation';
import FoodLoader from './FoodLoader';
import RecommendationSection from './RecommendationSection';
import CookingRequestDrawer from './CookingRequestDrawer';

const MenuItem = ({ item, onItemAdded, recommendations }) => {
  const [showRecommendations, setShowRecommendations] = useState(false);
  const [showCookingRequest, setShowCookingRequest] = useState(false);
  const [cookingRequest, setCookingRequest] = useState('');
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
    foodTypeIcon: {
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
    cookingRequestDrawer: {
      background: '#f8f8f8',
      padding: 0,
      borderRadius: '20px 20px 0 0',
      boxShadow: '0 -4px 12px rgba(0, 0, 0, 0.15)',
      overflow: 'hidden',
    },
    selectedItemHeader: {
      backgroundColor: '#fff',
      padding: '20px',
      borderBottom: '1px solid #eee',
      display: 'flex',
      alignItems: 'center',
      gap: '16px',
    },
    selectedItemImage: {
      width: '80px',
      height: '80px',
      borderRadius: '12px',
      objectFit: 'cover',
    },
    selectedItemDetails: {
      flex: 1,
    },
    selectedItemName: {
      fontSize: '18px',
      fontWeight: 'bold',
      color: '#333',
      marginBottom: '4px',
    },
    selectedItemPrice: {
      fontSize: '16px',
      color: '#e5004b',
      fontWeight: 'bold',
    },
    cookingRequestContent: {
      padding: '24px',
    },
    cookingRequestTitle: {
      fontSize: '20px',
      fontWeight: 'bold',
      marginBottom: '20px',
      color: '#333',
    },
    cookingRequestTextarea: {
      marginBottom: '24px',
      borderRadius: '12px',
      padding: '16px',
      fontSize: '16px',
      resize: 'none',
      border: '2px solid #eee',
      transition: 'border-color 0.3s',
      '&:focus': {
        borderColor: '#e5004b',
        boxShadow: 'none',
      },
    },
    cookingRequestTags: {
      display: 'flex',
      flexWrap: 'wrap',
      gap: '12px',
      marginBottom: '24px',
    },
    cookingRequestTagItem: {
      backgroundColor: '#fff',
      border: '2px solid #eee',
      borderRadius: '20px',
      padding: '8px 16px',
      fontSize: '14px',
      fontWeight: '500',
      cursor: 'pointer',
      transition: 'all 0.3s',
      color: '#666',
      '&:hover': {
        backgroundColor: '#e5004b',
        color: '#fff',
        borderColor: '#e5004b',
      },
    },
    selectedTagItem: {
      backgroundColor: '#e5004b',
      color: '#fff',
      borderColor: '#e5004b',
    },
    cookingRequestActions: {
      display: 'flex',
      justifyContent: 'flex-end',
      gap: '16px',
      borderTop: '1px solid #eee',
      padding: '20px',
      backgroundColor: '#fff',
    },
    submitButton: {
      backgroundColor: '#e5004b',
      color: '#fff',
      border: 'none',
      borderRadius: '8px',
      padding: '12px 32px',
      fontSize: '16px',
      fontWeight: 'bold',
      cursor: 'pointer',
      transition: 'background-color 0.3s',
      '&:hover': {
        backgroundColor: '#c80041',
      },
    },
    cancelButton: {
      backgroundColor: '#f5f5f5',
      color: '#666',
      border: 'none',
      borderRadius: '8px',
      padding: '12px 32px',
      fontSize: '16px',
      fontWeight: 'bold',
      cursor: 'pointer',
      transition: 'background-color 0.3s',
      '&:hover': {
        backgroundColor: '#e5e5e5',
      },
    },
    commonSpiceOptions: [
      { id: 1, label: 'Extra Spicy' },
      { id: 2, label: 'Less Spicy' },
      { id: 3, label: 'Double Spicy' },
      { id: 4, label: 'Non Spicy' },
    ],
  };

  // Function to check if description needs truncation
  const needsTruncation = () => {
    if (descriptionRef.current) {
      return descriptionRef.current.scrollHeight > 40;
    }
    return false;
  };

  const toggleDescription = (e) => {
    e.stopPropagation();
    setIsDescriptionExpanded(!isDescriptionExpanded);
  };

  // Rest of your existing functions...
  const getFoodTypeIcon = (type) => {
    switch (type) {
      case 'veg':
        return <img src="https://img.icons8.com/?size=100&id=61083&format=png&color=000000" alt="Veg" style={styles.foodTypeIcon} />;
      case 'nonveg':
        return <img src="https://img.icons8.com/?size=100&id=61082&format=png&color=000000" alt="Non-Veg" style={styles.foodTypeIcon} />;
      default:
        return null;
    }
  };


  const getTruncatedDescription = (text) => {
    return text.length > 50 ? `${text.substring(0, 50)}...` : text;
  };

  const getImageUrl = (imageData) => {
    if (!imageData) return '';
    if (typeof imageData === 'string') return imageData;
    if (imageData.file?.url) return imageData.file.url;
    return '';
  };

  useEffect(() => {
    const cartItem = cart.find((cartItem) => cartItem.id === item.id);
    setQuantity(cartItem?.quantity || 0);
  }, [cart, item.id]);

  const triggerAnimation = () => {
    const itemRect = itemRef.current.getBoundingClientRect();
    setAnimationStartPosition({ x: itemRect.left, y: itemRect.top });
    setShowAnimation(true);
  };

  const handleAddToCart = () => {
    if (quantity === 0) {
      addToCart(item);
    } else {
      updateQuantity(item.id, quantity + 1);
    }
    setQuantity(quantity + 1);
    // Only show recommendations if they exist for this item
    if (recommendations?.length > 0) {
      setShowRecommendations(true);
    }
    // triggerAnimation();
    if (onItemAdded) onItemAdded();
  };

  const handleDecreaseQuantity = () => {
    if (quantity > 1) {
      updateQuantity(item.id, quantity - 1);
      setQuantity(quantity - 1);
    } else if (quantity === 1) {
      removeFromCart(item.id);
      setQuantity(0);
      setShowRecommendations(false);
    }
  };

  const handleImageClick = () => {
    // Remove this function and update the image onClick handler below
  };

  const handleEditIconClick = () => {
    setShowCookingRequest(true);
  };

  const handleAnimationComplete = () => {
    setShowAnimation(false);
  };

  const handleTagClick = (tagId) => {
    setSelectedTags((prev) => {
      if (prev.includes(tagId)) {
        return prev.filter((id) => id !== tagId);
      }
      return [...prev, tagId];
    });
  };

  const getCartIconPosition = () => {
    if (cartIconRef?.current) {
      const rect = cartIconRef.current.getBoundingClientRect();
      return { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
    }
    return { x: window.innerWidth - 60, y: 40 };
  };

  const handleCookingRequestChange = (e) => {
    setCookingRequest(e.target.value);
  };

  const handleCookingRequestSubmit = () => {
    // Save the cooking request to state or send it to the server
    if (quantity === 0) {
      addToCart(item);
    } else {
      updateQuantity(item.id, quantity + 1);
    }
    setQuantity(quantity + 1);
    // Only show recommendations if they exist for this item
    if (recommendations?.length > 0) {
      setShowRecommendations(true);
    }
    // triggerAnimation();
    if (onItemAdded) onItemAdded();
    console.log('Cooking request:', cookingRequest);
    setShowCookingRequest(false);
  };

  const imageUrl = getImageUrl(item.image);
  return (
    <>
      <div style={styles.card} ref={itemRef}>
        <div style={styles.contentSection}>
          <div>
            {getFoodTypeIcon(item.foodType)}
            <h3 style={styles.title}>{item.name}</h3>
            <div style={styles.price}>₹{item.price}</div>
          </div>
          <div>
            <div style={styles.description} ref={descriptionRef}>
              {item.description}
            </div>
            {needsTruncation() && (
              <span onClick={toggleDescription} style={styles.readMore}>
                {isDescriptionExpanded ? 'Show less' : 'Show more'}
              </span>
            )}
          </div>
        </div>

        <div style={styles.imageSection}>
          <img
            src={imageUrl}
            alt={item.name}
            style={styles.image}
            onLoad={() => setImageLoaded(true)}
          />
          {quantity > 0 ? (
            <div style={styles.quantityControls}>
              <button
                style={styles.quantityButton}
                onClick={handleDecreaseQuantity}
              >
                <MinusOutlined />
              </button>
              <span style={styles.quantityDisplay}>{quantity}</span>
              <button
                style={styles.quantityButton}
                onClick={handleAddToCart}
              >
                <PlusOutlined />
              </button>
            </div>
          ) : (
            <button
              onClick={item.isAvailable ? handleAddToCart : undefined}
              disabled={!item.isAvailable}
              style={styles.addButton}
            >
              ADD
            </button>
          )}
          {quantity > 0 && (
            <Tooltip title="Customize your order">
              <div style={styles.editIcon} onClick={handleEditIconClick}>
                <EditOutlined style={{ fontSize: '20px', color: '#e5004b' }} />
              </div>
            </Tooltip>
          )}
        </div>
      </div>

      <CookingRequestDrawer
        visible={showCookingRequest}
        onClose={() => setShowCookingRequest(false)}
        onSubmit={handleCookingRequestSubmit}
        onTagClick={setSelectedTags}
        selectedTags={selectedTags}
        cookingRequest={cookingRequest}
        onCookingRequestChange={handleCookingRequestChange}
        item={item}
      />

      <RecommendationSection
        isVisible={showRecommendations}
        recommendations={recommendations}
        onAddToCart={(recommendedItem) => {
          addToCart(recommendedItem);
          if (onItemAdded) onItemAdded();
        }}
      />
    </>
  );
};

export default MenuItem;
