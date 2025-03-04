import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingCart, ChevronUp, ChevronDown } from 'lucide-react';

const CartFooter = () => {
  const { cart, updateQuantity, removeFromCart } = useCart();
  const navigate = useNavigate();
  const location = useLocation();
  const [showCelebration, setShowCelebration] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  // Calculate total items in cart
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);

  // Calculate total price
  const totalPrice = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const getImageUrl = (imageData) => {
    if (!imageData) return '';
    if (typeof imageData === 'string') {
      return imageData;
    }
    if (imageData.file && imageData.file.url) {
      return imageData.file.url;
    }
    return '';
  };
  // Trigger celebration when a new item is added to the cart
  useEffect(() => {
    if (location.pathname === '/home' && totalItems > 0) {
      setShowCelebration(true);
      // Hide the celebration animation after 5 seconds
      const timeout = setTimeout(() => setShowCelebration(false), 5000);
      return () => clearTimeout(timeout);
    }
  }, [totalItems, location.pathname]);

  const toggleCartExpansion = (e) => {
    e.stopPropagation(); // Prevent triggering the cart expansion/collapse when clicking on other elements
    setIsExpanded(!isExpanded);
  };

  const isImageAvailable = (url) => {
    const img = new Image();
    img.src = url;
    return img.complete && img.naturalHeight !== 0;
  };

  // Only show on home screen and when cart has items
  if (location.pathname !== '/home' || totalItems === 0) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: 100 }}
        animate={{ y: 0 }}
        exit={{ y: 100 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          padding: '16px',
          marginBottom: '60px',
          background: isExpanded ? 'white' : 'linear-gradient(90deg, red, #ef4444)',
          boxShadow: '0 -4px 24px rgba(0, 0, 0, 0.3)',
          borderTop: '1px solid #e5e7eb',
          zIndex: 50,
          borderRadius: '16px 16px 0 0',
          color: isExpanded ? 'black' : 'white',
        }}
      >
        {/* Chevron button to expand or collapse the cart */}
        <div
          onClick={toggleCartExpansion}
          style={{
            position: 'absolute',
            top: '0px',
            left: '50%',
            transform: 'translateX(-50%)',
            borderRadius: '50%',
            boxShadow: '0 2px 10px rgba(0, 0, 0, 0.2)',
            cursor: 'pointer',
            width: '32px',
            height: '32px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {isExpanded ? <ChevronDown size={20} /> : <ChevronUp size={20} />}
        </div>

        <div
          style={{
            maxWidth: '40rem',
            margin: '0 auto',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            cursor: 'pointer',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ position: 'relative' }}>
              {isImageAvailable('https://smart-server.in/assets/gif-2.gif') && (
                <img
                  src="https://smart-server.in/assets/gif-2.gif"
                  alt="Cart Icon"
                  style={{ width: '48px', height: '48px' }}
                />
              )}
              <ShoppingCart
                style={{
                  width: '28px',
                  height: '28px',
                  color: isExpanded ? 'red' : 'white',
                }}
              />
              <span
                style={{
                  position: 'absolute',
                  top: '-6px',
                  right: '-6px',
                  background: 'black',
                  color: 'white',
                  fontSize: '12px',
                  borderRadius: '50%',
                  width: '22px',
                  height: '22px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 'bold',
                }}
              >
                {totalItems}
              </span>
            </div>
            <span style={{ fontWeight: 500, fontSize: '16px' }}>
              {totalItems} {totalItems === 1 ? 'item' : 'items'}
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <span style={{ fontWeight: 700, fontSize: '18px' }}>₹{totalPrice.toFixed(2)}</span>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              style={{
                background: isExpanded ? 'red' : 'white',
                color: isExpanded ? 'white' : 'black',
                padding: '10px 28px',
                borderRadius: '9999px',
                fontSize: '15px',
                fontWeight: 600,
                transition: 'background-color 0.3s',
                border: '2px solid red',
                cursor: 'pointer',
                boxShadow: '0 4px 14px rgba(0, 0, 0, 0.2)',
              }}
              onClick={(e) => {
                e.stopPropagation();
                navigate('/order-summary');
              }}
            >
              {isExpanded ? 'Checkout' : 'View Cart'}
            </motion.button>
          </div>
        </div>

        {isExpanded && (
          <div
  className="cart-details"
  style={{
    marginTop: '16px',
    maxHeight: '300px', // limit height for scroll
    overflowY: 'auto',
    paddingRight: '8px',
    scrollbarWidth: 'thin', // for Firefox
    scrollbarColor: 'red transparent', // for Firefox
    WebkitOverflowScrolling: 'touch', // smooth scrolling for mobile
    WebkitScrollbarWidth: 'thin', // Custom width
    WebkitScrollbarTrack: {
      backgroundColor: 'transparent',
    },
    WebkitScrollbarThumb: {
      backgroundColor: 'red',
      borderRadius: '4px',
    },
  }}
>            {cart.map((item) => (
              <div
                key={item.id}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  background: '#f8f9fa',
                  padding: '10px',
                  borderRadius: '8px',
                  marginBottom: '8px',
                }}
              >
                <img
                  src={getImageUrl(item.image)}
                  alt={item.name}
                  style={{ width: '50px', height: '50px', borderRadius: '8px' }}
                />
                <div style={{ flex: 1, marginLeft: '12px' }}>
                  <h4 style={{ margin: '0 0 4px 0' }}>{item.name}</h4>
                  <p style={{ margin: 0 }}>₹{item.price} x {item.quantity}</p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      updateQuantity(item.id, item.quantity - 1);
                    }}
                    style={{
                      background: 'red',
                      color: 'white',
                      border: 'none',
                      borderRadius: '50%',
                      width: '30px',
                      height: '30px',
                      cursor: 'pointer',
                    }}
                  >
                    -
                  </button>
                  <span>{item.quantity}</span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      updateQuantity(item.id, item.quantity + 1);
                    }}
                    style={{
                      background: 'red',
                      color: 'white',
                      border: 'none',
                      borderRadius: '50%',
                      width: '30px',
                      height: '30px',
                      cursor: 'pointer',
                    }}
                  >
                    +
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Celebration GIF Animation */}
        {showCelebration && isImageAvailable('https://smart-server.in/assets/gif-1.gif') && (
          <motion.img
            src="https://smart-server.in/assets/gif-1.gif"
            alt="Celebration"
            initial={{ opacity: 0, scale: 1.0 }}
            animate={{ opacity: 1, scale: 2 }}
            exit={{ opacity: 0, scale: 1.0 }}
            style={{
              position: 'fixed',
              bottom: '60px',
              left: '50%',
              transform: 'translateX(-50%)',
              zIndex: 51,
              pointerEvents: 'none', // Allows user interaction while animation is playing
            }}
          />
        )}
      </motion.div>
    </AnimatePresence>
  );
};

export default CartFooter;
