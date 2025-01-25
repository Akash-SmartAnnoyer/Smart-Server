// import React, { useState, useEffect } from 'react';
// import { useLocation, useNavigate } from 'react-router-dom';
// import { motion, AnimatePresence } from 'framer-motion';
// import { CloseOutlined, MenuOutlined } from '@ant-design/icons';

// const CategoryNavigator = () => {
//   const [isOpen, setIsOpen] = useState(false);
//   const [categories, setCategories] = useState([]);
//   const [subcategories, setSubcategories] = useState([]);
//   const [menuItems, setMenuItems] = useState([]);
//   const location = useLocation();
//   const navigate = useNavigate();
//   const orgId = localStorage.getItem('orgId');

//   useEffect(() => {
//     setIsOpen(false);
//   }, [location]);

//   useEffect(() => {
//     if (orgId) {
//       // Fetch categories
//       fetch('https://smart-server-menu-database.firebaseio.com/categories.json')
//         .then((res) => res.json())
//         .then((data) => {
//           if (data) {
//             const matchedCategories = Object.entries(data)
//               .map(([id, category]) => ({ id, ...category }))
//               .filter(category => category.orgId === parseInt(orgId));
//             setCategories(matchedCategories);
//           }
//         });

//       // Fetch subcategories
//       fetch('https://smart-server-menu-database.firebaseio.com/subcategories.json')
//         .then((res) => res.json())
//         .then((data) => {
//           if (data) {
//             const matchedSubcategories = Object.entries(data)
//               .map(([id, subcategory]) => ({ id, ...subcategory }))
//               .filter(subcategory => subcategory.orgId === parseInt(orgId));
//             setSubcategories(matchedSubcategories);
//           }
//         });

//       // Fetch menu items
//       fetch('https://smart-server-menu-database.firebaseio.com/menu_items.json')
//         .then((res) => res.json())
//         .then((data) => {
//           if (data) {
//             const matchedMenuItems = Object.entries(data)
//               .map(([id, item]) => ({ id, ...item }))
//               .filter(item => item.orgId === parseInt(orgId));
//             setMenuItems(matchedMenuItems);
//           }
//         });
//     }
//   }, [orgId]);

//   const getCountsForCategory = (categoryId) => {
//     const subCount = subcategories.filter(sub => sub.categoryId === categoryId).length;
//     const subIds = subcategories
//       .filter(sub => sub.categoryId === categoryId)
//       .map(sub => sub.id);
//     const itemCount = menuItems.filter(item => 
//       subIds.includes(item.subcategoryId)
//     ).length;
    
//     return { subCount, itemCount };
//   };

//   const handleCategoryClick = (categoryId) => {
//     // You might need to modify this based on your routing structure
//     navigate('/home', { state: { selectedCategoryId: categoryId } });
//     setIsOpen(false);
//   };

//   if (location.pathname !== '/home') return null;

//   return (
//     <>
//       {/* Navigation Icon */}
//       <motion.div
//         className="nav-icon"
//         whileHover={{ scale: 1.1 }}
//         whileTap={{ scale: 0.95 }}
//         onClick={() => setIsOpen(!isOpen)}
//         style={{
//           position: 'fixed',
//           bottom: '20px',
//           right: '20px',
//           backgroundColor: isOpen ? '#f44336' : 'black',
//           color: 'white',
//           borderRadius: '50%',
//           width: '60px',
//           height: '60px',
//           display: 'flex',
//           justifyContent: 'center',
//           alignItems: 'center',
//           cursor: 'pointer',
//           boxShadow: '0px 10px 15px rgba(0, 0, 0, 0.3)',
//           zIndex: 1000,
//         }}
//       >
//         {isOpen ? (
//           <CloseOutlined style={{ fontSize: '24px' }} />
//         ) : (
//           <MenuOutlined style={{ fontSize: '24px' }} />
//         )}
//       </motion.div>

//       {/* Category Navigation Menu */}
//       <AnimatePresence>
//         {isOpen && (
//           <motion.div
//             initial={{ width: '0px', opacity: 0 }}
//             animate={{ width: '300px', opacity: 1 }}
//             exit={{ width: '0px', opacity: 0 }}
//             transition={{ type: 'spring', stiffness: 200, damping: 25 }}
//             style={{
//               position: 'fixed',
//               bottom: '20px',
//               right: '90px',
//               backgroundColor: 'white',
//               borderRadius: '12px',
//               padding: '20px',
//               boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
//               zIndex: 1000,
//               maxHeight: '80vh',
//               overflowY: 'auto',
//             }}
//           >
//             <h3 style={{ margin: '0 0 15px 0', color: '#333', fontWeight: 'bold' }}>
//               Menu Navigation
//             </h3>
//             {categories.map((category) => {
//               const { subCount, itemCount } = getCountsForCategory(category.id);
//               return (
//                 <motion.div
//                   key={category.id}
//                   onClick={() => handleCategoryClick(category.id)}
//                   whileHover={{ backgroundColor: '#f5f5f5' }}
//                   style={{
//                     padding: '12px',
//                     borderRadius: '8px',
//                     marginBottom: '8px',
//                     cursor: 'pointer',
//                     border: '1px solid #eee',
//                   }}
//                 >
//                   <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
//                     <span style={{ fontSize: '16px', fontWeight: '500' }}>{category.name}</span>
//                     <div style={{ display: 'flex', gap: '10px' }}>
//                       <span style={{ 
//                         fontSize: '12px', 
//                         backgroundColor: '#e0e0e0', 
//                         padding: '4px 8px', 
//                         borderRadius: '12px' 
//                       }}>
//                         {subCount} Subcategories
//                       </span>
//                       <span style={{ 
//                         fontSize: '12px', 
//                         backgroundColor: '#e0e0e0', 
//                         padding: '4px 8px', 
//                         borderRadius: '12px' 
//                       }}>
//                         {itemCount} Items
//                       </span>
//                     </div>
//                   </div>
//                 </motion.div>
//               );
//             })}
//           </motion.div>
//         )}
//       </AnimatePresence>
//     </>
//   );
// };

// export default CategoryNavigator;

// import React, { useState, useEffect } from 'react';
// import { useLocation } from 'react-router-dom';
// import { motion, AnimatePresence } from 'framer-motion';
// import { CloseOutlined, MenuOutlined } from '@ant-design/icons';


// const CategoryNavigator = ({ onCategorySelect, onSubcategorySelect }) => {
//   const [isOpen, setIsOpen] = useState(false);
//   const [categories, setCategories] = useState([]);
//   const [subcategories, setSubcategories] = useState([]);
//   const [menuItems, setMenuItems] = useState([]);
//   const [selectedCategory, setSelectedCategory] = useState(null);
//   const location = useLocation();
//   const orgId = localStorage.getItem('orgId');

//   useEffect(() => {
//     setIsOpen(false);
//   }, [location]);

//   useEffect(() => {
//     if (orgId) {
//       // Fetch categories
//       fetch('https://smart-server-menu-database.firebaseio.com/categories.json')
//         .then((res) => res.json())
//         .then((data) => {
//           if (data) {
//             const matchedCategories = Object.entries(data)
//               .map(([id, category]) => ({ id, ...category }))
//               .filter(category => category.orgId === parseInt(orgId));
//             setCategories(matchedCategories);
//           }
//         });

//       // Fetch subcategories
//       fetch('https://smart-server-menu-database.firebaseio.com/subcategories.json')
//         .then((res) => res.json())
//         .then((data) => {
//           if (data) {
//             const matchedSubcategories = Object.entries(data)
//               .map(([id, subcategory]) => ({ id, ...subcategory }))
//               .filter(subcategory => subcategory.orgId === parseInt(orgId));
//             setSubcategories(matchedSubcategories);
//           }
//         });

//       // Fetch menu items
//       fetch('https://smart-server-menu-database.firebaseio.com/menu_items.json')
//         .then((res) => res.json())
//         .then((data) => {
//           if (data) {
//             const matchedMenuItems = Object.entries(data)
//               .map(([id, item]) => ({ id, ...item }))
//               .filter(item => item.orgId === parseInt(orgId));
//             setMenuItems(matchedMenuItems);
//           }
//         });
//     }
//   }, [orgId]);

//   const getCountsForCategory = (categoryId) => {
//     const subCount = subcategories.filter(sub => sub.categoryId === categoryId).length;
//     const subIds = subcategories
//       .filter(sub => sub.categoryId === categoryId)
//       .map(sub => sub.id);
//     const itemCount = menuItems.filter(item => 
//       subIds.includes(item.subcategoryId)
//     ).length;
    
//     return { subCount, itemCount };
//   };

//   const handleCategoryClick = (category) => {
//     setSelectedCategory(category);
//     onCategorySelect(category);
//     setIsOpen(false);
//   };

//   const handleSubcategoryClick = (subcategory) => {
//     onSubcategorySelect(subcategory);
//     setIsOpen(false);
//   };

//   const renderSubcategories = (categoryId) => {
//     const filteredSubs = subcategories.filter(sub => sub.categoryId === categoryId);
//     return filteredSubs.map(sub => (
//       <motion.div
//         key={sub.id}
//         onClick={() => handleSubcategoryClick(sub)}
//         whileHover={{ backgroundColor: '#f5f5f5' }}
//         style={{
//           padding: '8px 12px 8px 24px',
//           marginTop: '4px',
//           borderRadius: '6px',
//           cursor: 'pointer',
//           fontSize: '14px',
//           backgroundColor: '#f9f9f9',
//         }}
//       >
//         {sub.name}
//       </motion.div>
//     ));
//   };

//   if (location.pathname !== '/home') return null;

//   return (
//     <>
//       {/* Navigation Icon */}
//       <motion.div
//         className="nav-icon"
//         whileHover={{ scale: 1.1 }}
//         whileTap={{ scale: 0.95 }}
//         onClick={() => setIsOpen(!isOpen)}
//         style={{
//           position: 'fixed',
//           bottom: '20px',
//           right: '20px',
//           backgroundColor: isOpen ? '#f44336' : 'black',
//           color: 'white',
//           borderRadius: '50%',
//           width: '60px',
//           height: '60px',
//           display: 'flex',
//           justifyContent: 'center',
//           alignItems: 'center',
//           cursor: 'pointer',
//           boxShadow: '0px 10px 15px rgba(0, 0, 0, 0.3)',
//           zIndex: 1000,
//         }}
//       >
//         {isOpen ? (
//           <CloseOutlined style={{ fontSize: '24px' }} />
//         ) : (
//           <MenuOutlined style={{ fontSize: '24px' }} />
//         )}
//       </motion.div>

//       {/* Category Navigation Menu */}
//       <AnimatePresence>
//         {isOpen && (
//           <motion.div
//             initial={{ width: '0px', opacity: 0 }}
//             animate={{ width: '300px', opacity: 1 }}
//             exit={{ width: '0px', opacity: 0 }}
//             transition={{ type: 'spring', stiffness: 200, damping: 25 }}
//             style={{
//               position: 'fixed',
//               bottom: '20px',
//               right: '90px',
//               backgroundColor: 'white',
//               borderRadius: '12px',
//               padding: '20px',
//               boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
//               zIndex: 1000,
//               maxHeight: '80vh',
//               overflowY: 'auto',
//             }}
//           >
//             <h3 style={{ margin: '0 0 15px 0', color: '#333', fontWeight: 'bold' }}>
//               Menu Navigation
//             </h3>
//             {categories.map((category) => {
//               const { subCount, itemCount } = getCountsForCategory(category.id);
//               return (
//                 <div key={category.id}>
//                   <motion.div
//                     onClick={() => handleCategoryClick(category)}
//                     whileHover={{ backgroundColor: '#f5f5f5' }}
//                     style={{
//                       padding: '12px',
//                       borderRadius: '8px',
//                       marginBottom: '4px',
//                       cursor: 'pointer',
//                       border: '1px solid #eee',
//                       backgroundColor: selectedCategory?.id === category.id ? '#f0f0f0' : 'white',
//                     }}
//                   >
//                     <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
//                       <span style={{ fontSize: '16px', fontWeight: '500' }}>{category.name}</span>
//                       <div style={{ display: 'flex', gap: '10px' }}>
//                         <span style={{ 
//                           fontSize: '12px', 
//                           backgroundColor: '#e0e0e0', 
//                           padding: '4px 8px', 
//                           borderRadius: '12px' 
//                         }}>
//                           {subCount} Subcategories
//                         </span>
//                         <span style={{ 
//                           fontSize: '12px', 
//                           backgroundColor: '#e0e0e0', 
//                           padding: '4px 8px', 
//                           borderRadius: '12px' 
//                         }}>
//                           {itemCount} Items
//                         </span>
//                       </div>
//                     </div>
//                   </motion.div>
//                   {selectedCategory?.id === category.id && renderSubcategories(category.id)}
//                 </div>
//               );
//             })}
//           </motion.div>
//         )}
//       </AnimatePresence>
//     </>
//   );
// };

// export default CategoryNavigator;

// import React, { useState, useEffect } from 'react';
// import { useLocation } from 'react-router-dom';
// import { motion, AnimatePresence } from 'framer-motion';
// import { CloseOutlined, MenuOutlined } from '@ant-design/icons';
// import './categoryNavigator.css'; // Added for custom styles

// const CategoryNavigator = ({ onCategorySelect, onSubcategorySelect }) => {
//   const [isOpen, setIsOpen] = useState(false);
//   const [categories, setCategories] = useState([]);
//   const [subcategories, setSubcategories] = useState([]);
//   const [menuItems, setMenuItems] = useState([]);
//   const [selectedCategory, setSelectedCategory] = useState(null);
//   const location = useLocation();
//   const orgId = localStorage.getItem('orgId');

//   useEffect(() => {
//     setIsOpen(false);
//   }, [location]);

//   useEffect(() => {
//     if (orgId) {
//       // Fetch categories
//       fetch('https://smart-server-menu-database.firebaseio.com/categories.json')
//         .then((res) => res.json())
//         .then((data) => {
//           if (data) {
//             const matchedCategories = Object.entries(data)
//               .map(([id, category]) => ({ id, ...category }))
//               .filter(category => category.orgId === parseInt(orgId));
//             setCategories(matchedCategories);
//           }
//         });

//       // Fetch subcategories
//       fetch('https://smart-server-menu-database.firebaseio.com/subcategories.json')
//         .then((res) => res.json())
//         .then((data) => {
//           if (data) {
//             const matchedSubcategories = Object.entries(data)
//               .map(([id, subcategory]) => ({ id, ...subcategory }))
//               .filter(subcategory => subcategory.orgId === parseInt(orgId));
//             setSubcategories(matchedSubcategories);
//           }
//         });

//       // Fetch menu items
//       fetch('https://smart-server-menu-database.firebaseio.com/menu_items.json')
//         .then((res) => res.json())
//         .then((data) => {
//           if (data) {
//             const matchedMenuItems = Object.entries(data)
//               .map(([id, item]) => ({ id, ...item }))
//               .filter(item => item.orgId === parseInt(orgId));
//             setMenuItems(matchedMenuItems);
//           }
//         });
//     }
//   }, [orgId]);

//   const handleCategoryClick = (category) => {
//     setSelectedCategory(category);
//     onCategorySelect(category);
//   };

//   const handleSubcategoryClick = (subcategory) => {
//     onSubcategorySelect(subcategory);
//   };

//   const renderSubcategories = (categoryId) => {
//     const filteredSubs = subcategories.filter(sub => sub.categoryId === categoryId);
//     return filteredSubs.map(sub => (
//       <motion.div
//         key={sub.id}
//         onClick={() => handleSubcategoryClick(sub)}
//         whileHover={{ backgroundColor: '#fff5f5' }}
//         style={{
//           padding: '8px 12px',
//           margin: '4px 0',
//           borderRadius: '6px',
//           cursor: 'pointer',
//           backgroundColor: '#ffebeb',
//           color: 'black',
//         }}
//       >
//         {sub.name} - {menuItems.filter(item => item.subcategoryId === sub.id).length} Items
//       </motion.div>
//     ));
//   };

//   if (location.pathname !== '/home') return null;

//   return (
//     <>
//       <motion.div
//         className="nav-icon"
//         whileHover={{ scale: 1.1 }}
//         whileTap={{ scale: 0.95 }}
//         onClick={() => setIsOpen(!isOpen)}
//         style={{
//           position: 'fixed',
//           bottom: '20px',
//           right: '20px',
//           backgroundColor: isOpen ? '#f44336' : 'black',
//           color: 'white',
//           borderRadius: '50%',
//           width: '60px',
//           height: '60px',
//           display: 'flex',
//           justifyContent: 'center',
//           alignItems: 'center',
//           cursor: 'pointer',
//           boxShadow: '0px 10px 15px rgba(0, 0, 0, 0.3)',
//           zIndex: 1000,
//         }}
//       >
//         {isOpen ? <CloseOutlined style={{ fontSize: '24px' }} /> : <MenuOutlined style={{ fontSize: '24px' }} />}
//       </motion.div>

//       <AnimatePresence>
//         {isOpen && (
//           <motion.div
//             initial={{ width: '0px', opacity: 0 }}
//             animate={{ width: '300px', opacity: 1 }}
//             exit={{ width: '0px', opacity: 0 }}
//             transition={{ type: 'spring', stiffness: 200, damping: 25 }}
//             className="category-navigator"
//           >
//             <h3 style={{ margin: '0 0 15px 0', color: 'black', fontWeight: 'bold' }}>
//               Quick Navigation
//             </h3>
//             {categories.map((category) => (
//               <div key={category.id} className="category-item">
//                 <motion.div
//                   onClick={() => handleCategoryClick(category)}
//                   whileHover={{ backgroundColor: '#ffe0e0' }}
//                   style={{
//                     padding: '12px',
//                     borderRadius: '8px',
//                     cursor: 'pointer',
//                     border: '1px solid #eee',
//                     backgroundColor: selectedCategory?.id === category.id ? '#ffcccc' : '#ffffff',
//                   }}
//                 >
//                   <span style={{ fontSize: '16px', fontWeight: '500' }}>{category.name}</span>
//                   <span style={{ fontSize: '12px', marginLeft: '10px', color: '#888' }}>
//                     {subcategories.filter(sub => sub.categoryId === category.id).length} Subcategories
//                   </span>
//                 </motion.div>
//                 {selectedCategory?.id === category.id && renderSubcategories(category.id)}
//               </div>
//             ))}
//           </motion.div>
//         )}
//       </AnimatePresence>
//     </>
//   );
// };

// export default CategoryNavigator;
// CategoryNavigator.jsx
// import React, { useState, useEffect } from 'react';
// import { useLocation, useNavigate } from 'react-router-dom';
// import { motion, AnimatePresence } from 'framer-motion';

// const CategoryNavigator = ({ onCategorySelect, onSubcategorySelect }) => {
//   const [isOpen, setIsOpen] = useState(false);
//   const [categories, setCategories] = useState([]);
//   const [subcategories, setSubcategories] = useState([]);
//   const [menuItems, setMenuItems] = useState([]);
//   const [expandedCategories, setExpandedCategories] = useState({});
//   const [position, setPosition] = useState(() => {
//     const saved = localStorage.getItem('categoryNavigatorPosition');
//     return saved ? JSON.parse(saved) : { x: window.innerWidth - 100, y: window.innerHeight - 150 };
//   });
  
//   const location = useLocation();
//   const navigate = useNavigate();
//   const orgId = localStorage.getItem('orgId');

//   // Save position to localStorage whenever it changes
//   useEffect(() => {
//     localStorage.setItem('categoryNavigatorPosition', JSON.stringify(position));
//   }, [position]);

//   useEffect(() => {
//     setIsOpen(false);
//   }, [location]);

  

//   const handleDragEnd = (event, info) => {
//     const newPosition = {
//       x: info.point.x,
//       y: info.point.y
//     };

//     // Ensure the button stays within viewport bounds
//     const buttonSize = 56; // Approximate size of the button
//     newPosition.x = Math.min(Math.max(newPosition.x, buttonSize/2), window.innerWidth - buttonSize/2);
//     newPosition.y = Math.min(Math.max(newPosition.y, buttonSize/2), window.innerHeight - buttonSize/2);

//     setPosition(newPosition);
//   };

//   const menuPosition = {
//     x: position.x < window.innerWidth / 2 ? position.x : position.x - 350,
//     y: position.y < window.innerHeight / 2 ? position.y : position.y - 400
//   };
//   useEffect(() => {
//     if (orgId) {
//       // Fetch categories
//       fetch('https://smart-server-menu-database.firebaseio.com/categories.json')
//         .then((res) => res.json())
//         .then((data) => {
//           if (data) {
//             const matchedCategories = Object.entries(data)
//               .map(([id, category]) => ({ id, ...category }))
//               .filter(category => category.orgId === parseInt(orgId));
//             setCategories(matchedCategories);
//           }
//         });

//       // Fetch subcategories
//       fetch('https://smart-server-menu-database.firebaseio.com/subcategories.json')
//         .then((res) => res.json())
//         .then((data) => {
//           if (data) {
//             const matchedSubcategories = Object.entries(data)
//               .map(([id, subcategory]) => ({ id, ...subcategory }))
//               .filter(subcategory => subcategory.orgId === parseInt(orgId));
//             setSubcategories(matchedSubcategories);
//           }
//         });

//       // Fetch menu items
//       fetch('https://smart-server-menu-database.firebaseio.com/menu_items.json')
//         .then((res) => res.json())
//         .then((data) => {
//           if (data) {
//             const matchedMenuItems = Object.entries(data)
//               .map(([id, item]) => ({ id, ...item }))
//               .filter(item => item.orgId === parseInt(orgId));
//             setMenuItems(matchedMenuItems);
//           }
//         });
//     }
//   }, [orgId]);

//   const toggleCategoryExpansion = (categoryId) => {
//     setExpandedCategories((prev) => ({
//       ...prev,
//       [categoryId]: !prev[categoryId],
//     }));
//   };

//   const handleCategoryClick = (category) => {
//     if (onCategorySelect) {
//       onCategorySelect(category);
//     }
//   };

//   const handleSubcategoryClick = (subcategory) => {
//     // Update URL and close navigator
//     navigate(`/home?subcategoryId=${subcategory.id}`);
//     setIsOpen(false);
    
//     // Call the callback if provided
//     if (onSubcategorySelect) {
//       onSubcategorySelect(subcategory);
//     }
//   };

//   // Add this useEffect to handle URL params
//   useEffect(() => {
//     const queryParams = new URLSearchParams(location.search);
//     const subcategoryId = queryParams.get('subcategoryId');
    
//     if (subcategoryId) {
//       const subcategory = subcategories.find(sub => sub.id === subcategoryId);
//       if (subcategory) {
//         // Expand the parent category
//         setExpandedCategories(prev => ({
//           ...prev,
//           [subcategory.categoryId]: true
//         }));
//       }
//     }
//   }, [location.search, subcategories]);

//   const menuVariants = {
//     closed: {
//       width: 0,
//       opacity: 0,
//       x: 100,
//     },
//     open: {
//       width: "350px",
//       opacity: 1,
//       x: 0,
//       transition: {
//         type: "spring",
//         stiffness: 300,
//         damping: 30,
//       }
//     }
//   };

//   const categoryVariants = {
//     closed: {
//       height: 0,
//       opacity: 0,
//     },
//     open: {
//       height: "auto",
//       opacity: 1,
//       transition: {
//         duration: 0.4,
//         ease: "easeOut"
//       }
//     }
//   };

//   const renderSubcategories = (categoryId) => {
//     const filteredSubs = subcategories.filter(sub => sub.categoryId === categoryId);
//     return (
//       <motion.div
//         initial="closed"
//         animate="open"
//         exit="closed"
//         variants={categoryVariants}
//         style={{
//           marginTop: '8px',
//           marginLeft: '24px',
//           borderLeft: '2px solid #fecdd3',
//           display: 'flex',
//           flexDirection: 'column',
//           gap: '8px'
//         }}
//       >
//         {filteredSubs.map(sub => (
//           <motion.div
//             key={sub.id}
//             onClick={() => handleSubcategoryClick(sub)}
//             style={{
//               position: 'relative',
//               paddingLeft: '16px',
//               paddingRight: '12px',
//               paddingTop: '8px',
//               paddingBottom: '8px',
//               cursor: 'pointer',
//               borderRadius: '0 8px 8px 0',
//               transition: 'all 0.2s ease'
//             }}
//             whileHover={{
//               backgroundColor: '#fff1f2',
//               x: 4
//             }}
//           >
//             <div style={{
//               position: 'absolute',
//               left: '-5px',
//               top: '50%',
//               width: '8px',
//               height: '8px',
//               backgroundColor: 'red',
//               borderRadius: '50%',
//               transform: 'translateY(-50%)'
//             }} />
//             <div style={{
//               display: 'flex',
//               justifyContent: 'space-between',
//               alignItems: 'center'
//             }}>
//               <div style={{
//                 display: 'flex',
//                 alignItems: 'center',
//                 gap: '8px'
//               }}>
//                 <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="red" strokeWidth="2">
//                   <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/>
//                   <line x1="7" y1="7" x2="7.01" y2="7"/>
//                 </svg>
//                 <span style={{ color: '#374151' }}>{sub.name}</span>
//               </div>
//               <span style={{
//                 padding: '4px 8px',
//                 fontSize: '12px',
//                 backgroundColor: '#fff1f2',
//                 color: 'red',
//                 borderRadius: '9999px'
//               }}>
//                 {menuItems.filter(item => item.subcategoryId === sub.id).length}
//               </span>
//             </div>
//           </motion.div>
//         ))}
//       </motion.div>
//     );
//   };

//   if (location.pathname !== '/home') return null;

//   return (
//     <>
//       <motion.button
//         drag
//         dragMomentum={false}
//         onDragEnd={handleDragEnd}
//         style={{
//           position: 'fixed',
//           top: 0,
//           left: 0,
//           zIndex: 50,
//           border: 'none',
//           padding: 0,
//           background: 'none',
//           cursor: 'grab',
//           x: position.x,
//           y: position.y,
//           touchAction: 'none'
//         }}
//         whileHover={{ scale: 1.05 }}
//         whileTap={{ scale: 0.95, cursor: 'grabbing' }}
//         onClick={() => setIsOpen(!isOpen)}
//       >
//         <div style={{
//           background: 'linear-gradient(to right top, #ef4444, red)',
//           color: 'white',
//           padding: '16px',
//           borderRadius: '50%',
//           boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
//         }}>
//           <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
//             {isOpen ? (
//               <path d="M18 6L6 18M6 6l12 12"/>
//             ) : (
//               <path d="M3 12h18M3 6h18M3 18h18"/>
//             )}
//           </svg>
//         </div>
//       </motion.button>

//       <AnimatePresence>
//         {isOpen && (
//           <motion.div
//             initial="closed"
//             animate="open"
//             exit="closed"
//             variants={menuVariants}
//             style={{
//               position: 'fixed',
//               top: 0,
//               left: 0,
//               zIndex: 40,
//               backgroundColor: 'white',
//               borderRadius: '12px',
//               boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
//               height: '50vh',
//               width: '150px',
//               overflow: 'hidden',
//               x: menuPosition.x,
//               y: menuPosition.y
//             }}
//           >
//             <div style={{
//               padding: '16px',
//               height: '100%',
//               display: 'flex',
//               flexDirection: 'column'
//             }}>
//               <div style={{
//                 display: 'flex',
//                 alignItems: 'center',
//                 gap: '8px',
//                 marginBottom: '24px'
//               }}>
//                 <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="red" strokeWidth="2">
//                   <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
//                 </svg>
//                 <h3 style={{
//                   fontSize: '20px',
//                   fontWeight: 600,
//                   color: '#1f2937',
//                   margin: 0
//                 }}>
//                   Quick Navigation
//                 </h3>
//               </div>
              
//               <div style={{
//                 overflowY: 'auto',
//                 flex: 1,
//                 paddingRight: '8px'
//               }}>
//                 {categories.map((category) => (
//                   <div key={category.id} style={{ marginBottom: '16px' }}>
//                     <motion.div
//                       onClick={() => toggleCategoryExpansion(category.id)}
//                       style={{
//                         padding: '12px',
//                         borderRadius: '8px',
//                         cursor: 'pointer',
//                         backgroundColor: expandedCategories[category.id] ? '#fff1f2' : 'white',
//                         transition: 'all 0.2s ease'
//                       }}
//                       whileHover={{ backgroundColor: expandedCategories[category.id] ? '#ffe4e6' : '#f3f4f6' }}
//                     >
//                       <div style={{
//                         display: 'flex',
//                         alignItems: 'center',
//                         gap: '8px'
//                       }}>
//                         <svg
//                           width="18"
//                           height="18"
//                           viewBox="0 0 24 24"
//                           fill="none"
//                           stroke="currentColor"
//                           strokeWidth="2"
//                           style={{
//                             transform: `rotate(${expandedCategories[category.id] ? '90deg' : '0deg'})`,
//                             transition: 'transform 0.2s ease'
//                           }}
//                         >
//                           <path d="M9 18l6-6-6-6"/>
//                         </svg>
//                         <span style={{
//                           fontWeight: 500,
//                           color: '#374151'
//                         }}>
//                           {category.name}
//                         </span>
//                       </div>
//                     </motion.div>
//                     <AnimatePresence>
//                       {expandedCategories[category.id] && renderSubcategories(category.id)}
//                     </AnimatePresence>
//                   </div>
//                 ))}
//               </div>
//             </div>
//           </motion.div>
//         )}
//       </AnimatePresence>
//     </>
//   );
// };

// export default CategoryNavigator;
import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence, useDragControls } from 'framer-motion';
// Import FontAwesome icons
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBars, faTimes, faUtensils } from '@fortawesome/free-solid-svg-icons';

const CategoryNavigator = ({ onCategorySelect, onSubcategorySelect }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [menuItems, setMenuItems] = useState([]);
  const [expandedCategories, setExpandedCategories] = useState({});
  const [viewportSize, setViewportSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight
  });

  // Default position closer to the top
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
  const orgId = localStorage.getItem('orgId');

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

  useEffect(() => {
    if (orgId) {
      // Fetch categories
      fetch('https://smart-server-menu-database.firebaseio.com/categories.json')
        .then((res) => res.json())
        .then((data) => {
          if (data) {
            const matchedCategories = Object.entries(data)
              .map(([id, category]) => ({ id, ...category }))
              .filter(category => category.orgId === parseInt(orgId));
            setCategories(matchedCategories);
          }
        });

      // Fetch subcategories
      fetch('https://smart-server-menu-database.firebaseio.com/subcategories.json')
        .then((res) => res.json())
        .then((data) => {
          if (data) {
            const matchedSubcategories = Object.entries(data)
              .map(([id, subcategory]) => ({ id, ...subcategory }))
              .filter(subcategory => subcategory.orgId === parseInt(orgId));
            setSubcategories(matchedSubcategories);
          }
        });

      // Fetch menu items
      fetch('https://smart-server-menu-database.firebaseio.com/menu_items.json')
        .then((res) => res.json())
        .then((data) => {
          if (data) {
            const matchedMenuItems = Object.entries(data)
              .map(([id, item]) => ({ id, ...item }))
              .filter(item => item.orgId === parseInt(orgId));
            setMenuItems(matchedMenuItems);
          }
        });
    }
  }, [orgId]);

  const handleDragEnd = (event, info) => {
    const newPosition = {
      x: info.point.x,
      y: info.point.y
    };

    // Ensure the button stays within viewport bounds
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
  
  // Add this useEffect to handle URL params
  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const subcategoryId = queryParams.get('subcategoryId');
    
    if (subcategoryId) {
      const subcategory = subcategories.find(sub => sub.id === subcategoryId);
      if (subcategory) {
        // Expand the parent category
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
  
  if (location.pathname !== '/home') return null;

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
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06), 0 0 10px 3px rgba(255, 68, 68, 0.5)', // Added glow effect
        border: '2px solid #ff4444', // Added red border
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