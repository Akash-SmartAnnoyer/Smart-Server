import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence, useDragControls } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBars, faTimes, faUtensils } from '@fortawesome/free-solid-svg-icons';
import { useMenu } from '../contexts/MenuProvider';

const CategoryNavigator = ({ onCategorySelect, onSubcategorySelect }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [expandedCategories, setExpandedCategories] = useState({});
  const [viewportSize, setViewportSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight
  });

  const { categories, subcategories, menuItems, loading } = useMenu();

  const [position, setPosition] = useState(() => {
    const saved = localStorage.getItem('categoryNavigatorPosition');
    if (saved) {
      const parsedPosition = JSON.parse(saved);
      return {
        x: Math.min(parsedPosition.x, window.innerWidth - 70),
        y: Math.min(parsedPosition.y, window.innerHeight - 70)
      };
    }
    return {
      x: window.innerWidth - 80,
      y: window.innerHeight - 300 // Adjusted higher
    };
  });

  const dragControls = useDragControls();
  const buttonRef = useRef(null);
  const location = useLocation();
  const navigate = useNavigate();

  const resetToDefault = () => {
    setPosition({
      x: window.innerWidth - 80,
      y: window.innerHeight - 300 // Adjusted higher
    });
  };

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      setViewportSize({ width, height });
      setPosition(prev => ({
        x: width - (viewportSize.width - prev.x),
        y: height - (viewportSize.height - prev.y)
      }));
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [viewportSize]);

  useEffect(() => {
    setIsOpen(false);
  }, [location]);

  useEffect(() => {
    localStorage.setItem('categoryNavigatorPosition', JSON.stringify(position));
  }, [position]);

  const handleDragEnd = (event, info) => {
    const newPosition = {
      x: info.point.x,
      y: info.point.y
    };

    const buttonSize = 56;
    const minX = 0;
    const maxX = viewportSize.width - buttonSize;
    const minY = 0;
    const maxY = viewportSize.height - buttonSize;

    newPosition.x = Math.min(Math.max(minX, newPosition.x), maxX);
    newPosition.y = Math.min(Math.max(minY, newPosition.y), maxY);

    setPosition(newPosition);
  };

  const getMenuPosition = () => {
    const menuWidth = 350;
    const menuHeight = 400;
    
    let x = position.x < viewportSize.width / 2 
      ? position.x 
      : Math.max(0, position.x - menuWidth + 56);
    
    let y = position.y > menuHeight
      ? position.y - menuHeight
      : position.y + 56;

    x = Math.min(Math.max(0, x), viewportSize.width - menuWidth);
    y = Math.min(Math.max(0, y), viewportSize.height - menuHeight);

    return { x, y };
  };

  const toggleCategoryExpansion = (categoryId) => {
    setExpandedCategories((prev) => ({
      ...prev,
      [categoryId]: !prev[categoryId],
    }));
  };

  const handleCategoryClick = (category) => {
    if (onCategorySelect) {
      onCategorySelect(category);
    }
  };

  const handleSubcategoryClick = (subcategory) => {
    navigate(`/home?subcategoryId=${subcategory.id}`);
    setIsOpen(false);
    
    if (onSubcategorySelect) {
      onSubcategorySelect(subcategory);
    }
  };
  
  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const subcategoryId = queryParams.get('subcategoryId');
    
    if (subcategoryId) {
      const subcategory = subcategories.find(sub => sub.id === subcategoryId);
      if (subcategory) {
        setExpandedCategories(prev => ({
          ...prev,
          [subcategory.categoryId]: true
        }));
      }
    }
  }, [location.search, subcategories]);

  const menuVariants = {
    closed: {
      width: 0,
      opacity: 0,
      x: 100,
    },
    open: {
      width: "350px",
      opacity: 1,
      x: 0,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 30,
      }
    }
  };

  const categoryVariants = {
    closed: {
      height: 0,
      opacity: 0,
    },
    open: {
      height: "auto",
      opacity: 1,
      transition: {
        duration: 0.4,
        ease: "easeOut"
      }
    }
  };

  const renderSubcategories = (categoryId) => {
    const filteredSubs = subcategories.filter(sub => sub.categoryId === categoryId);
    return (
      <motion.div
        initial={{ height: 0, opacity: 0 }}
        animate={{ height: "auto", opacity: 1 }}
        exit={{ height: 0, opacity: 0 }}
        transition={{ duration: 0.3 }}
        style={{
          marginTop: '8px',
          marginLeft: '24px',
          borderLeft: '2px solid #fecdd3',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px'
        }}
      >
        {filteredSubs.map(sub => (
          <motion.div
            key={sub.id}
            onClick={() => handleSubcategoryClick(sub)}
            style={{
              position: 'relative',
              paddingLeft: '16px',
              paddingRight: '12px',
              paddingTop: '8px',
              paddingBottom: '8px',
              cursor: 'pointer',
              borderRadius: '0 8px 8px 0',
              transition: 'all 0.2s ease'
            }}
            whileHover={{
              backgroundColor: '#fff1f2',
              x: 4
            }}
          >
            <div style={{
              position: 'absolute',
              left: '-5px',
              top: '50%',
              width: '8px',
              height: '8px',
              backgroundColor: '#ef4444',
              borderRadius: '50%',
              transform: 'translateY(-50%)'
            }} />
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2">
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                  <path d="M7 8h10"/>
                  <path d="M7 12h10"/>
                  <path d="M7 16h10"/>
                </svg>
                <span style={{ color: '#374151' }}>{sub.name}</span>
              </div>
              <span style={{
                padding: '4px 8px',
                fontSize: '12px',
                backgroundColor: '#fff1f2',
                color: '#ef4444',
                borderRadius: '9999px'
              }}>
                {menuItems.filter(item => item.subcategoryId === sub.id).length}
              </span>
            </div>
          </motion.div>
        ))}
      </motion.div>
    );
  };

  const menuPosition = getMenuPosition();
  
  if (location.pathname !== '/home' || loading.overall) return null;

  return (
    <>
      <motion.button
        ref={buttonRef}
        drag
        dragControls={dragControls}
        dragMomentum={false}
        dragElastic={0}
        onDragStart={(e) => {
          e.preventDefault();
          if (isOpen) setIsOpen(false);
        }}
        onDragEnd={handleDragEnd}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          zIndex: 50,
          border: 'none',
          padding: 0,
          background: 'none',
          cursor: 'grab',
          x: position.x,
          y: position.y,
          touchAction: 'none',
          userSelect: 'none',
          WebkitTouchCallout: 'none',
          WebkitUserSelect: 'none'
        }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95, cursor: 'grabbing' }}
        onDoubleClick={resetToDefault}
        onClick={(e) => {
          if (e.detail === 0) return;
          setIsOpen(!isOpen);
        }}
      >
        <div style={{
          background: 'linear-gradient(to right top, #ef4444, red)',
          color: 'white',
          padding: '16px',
          borderRadius: '50%',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
          width: '56px',
          height: '56px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <FontAwesomeIcon icon={isOpen ? faTimes : faUtensils} size="lg" />
        </div>
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              zIndex: 40,
              backgroundColor: 'white',
              borderRadius: '12px',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06), 0 0 10px 3px rgba(255, 68, 68, 0.5)',
              border: '2px solid #ff4444',
              height: '400px',
              width: '350px',
              maxWidth: '90vw',
              maxHeight: '80vh',
              overflow: 'hidden',
              x: menuPosition.x,
              y: menuPosition.y
            }}
          >
            <div style={{
              padding: '16px',
              height: '100%',
              display: 'flex',
              flexDirection: 'column'
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                marginBottom: '24px'
              }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 6h18v12H3z"/>
                  <path d="M3 10h18"/>
                  <path d="M12 6v12"/>
                  <circle cx="8" cy="16" r="1"/>
                  <circle cx="16" cy="16" r="1"/>
                </svg>
                <h3 style={{
                  fontSize: '20px',
                  fontWeight: 600,
                  color: '#1f2937',
                  margin: 0
                }}>
                  Menu Categories
                </h3>
              </div>
              
              <div style={{
                overflowY: 'auto',
                flex: 1,
                paddingRight: '8px'
              }}>
                {categories.map((category) => (
                  <div key={category.id} style={{ marginBottom: '16px' }}>
                    <motion.div
                      onClick={() => toggleCategoryExpansion(category.id)}
                      style={{
                        padding: '12px',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        backgroundColor: expandedCategories[category.id] ? '#fff1f2' : 'white',
                        transition: 'all 0.2s ease'
                      }}
                      whileHover={{ backgroundColor: expandedCategories[category.id] ? '#ffe4e6' : '#f3f4f6' }}
                    >
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                      }}>
                        <svg
                          width="18"
                          height="18"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          style={{
                            transform: `rotate(${expandedCategories[category.id] ? '90deg' : '0deg'})`,
                            transition: 'transform 0.2s ease'
                          }}
                        >
                          <path d="M9 18l6-6-6-6"/>
                        </svg>
                        <span style={{
                          fontWeight: 500,
                          color: '#374151'
                        }}>
                          {category.name}
                        </span>
                      </div>
                    </motion.div>
                    <AnimatePresence>
                      {expandedCategories[category.id] && renderSubcategories(category.id)}
                    </AnimatePresence>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default CategoryNavigator;