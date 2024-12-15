// import React, { useEffect, useState } from 'react';
// import { Spin, Typography, Card } from 'antd';
// import { LoadingOutlined } from '@ant-design/icons';

// const { Title, Text } = Typography;

// const SplashScreen = ({ orgId, tableNumber }) => {
//     const [restaurant, setRestaurant] = useState(null);
//     const [loading, setLoading] = useState(true);
//     const [error, setError] = useState(null);
//     const [animationPhase, setAnimationPhase] = useState('initial');
//     const API_URL = 'https://smart-server-stage-database-default-rtdb.firebaseio.com/restaurants';

//     // Define keyframes as a string
//     const keyframes = `
//         @keyframes fadeIn {
//             from { opacity: 0; }
//             to { opacity: 1; }
//         }
//         @keyframes scaleIn {
//             from { transform: scale(0); }
//             to { transform: scale(1); }
//         }
//         @keyframes expandLogo {
//             from { transform: scale(1); }
//             to { transform: scale(2.5); }
//         }
//         @keyframes letterSlideIn {
//             0% { opacity: 0; transform: translateY(20px); }
//             100% { opacity: 1; transform: translateY(0); }
//         }
//         @keyframes glowText {
//             0% { text-shadow: 0 0 10px rgba(255,255,255,0.8); }
//             50% { text-shadow: 0 0 20px #ff4444, 0 0 30px #ff4444; }
//             100% { text-shadow: 0 0 10px rgba(255,255,255,0.8); }
//         }
//     `;

//     useEffect(() => {
//         const fetchRestaurantData = async () => {
//             try {
//                 const response = await fetch(`${API_URL}.json`);
//                 if (!response.ok) throw new Error('Failed to fetch restaurant data');

//                 const data = await response.json();
//                 const restaurantData = Object.values(data).find(r => r.orgId === orgId);

//                 if (restaurantData) {
//                     setRestaurant(restaurantData);
//                     localStorage.setItem('role', 'customer');
//                     localStorage.setItem('orgId', orgId);
//                     localStorage.setItem('tableNumber', tableNumber);

//                     // Animation sequence
//                     const sequence = async () => {
//                         setAnimationPhase('logoEnter');
//                         await new Promise(r => setTimeout(r, 1500));
//                         setAnimationPhase('logoExpand');
//                         await new Promise(r => setTimeout(r, 1000));
//                         setAnimationPhase('logoShrink');
//                         await new Promise(r => setTimeout(r, 800));
//                         setAnimationPhase('appNameEnter');
//                         await new Promise(r => setTimeout(r, 1000));
//                         setAnimationPhase('restaurantEnter');
//                         await new Promise(r => setTimeout(r, 2000));
                        
//                         sessionStorage.setItem('justSetOrgIdAndTable', 'true');
//                         window.location.href = '/home';
//                     };
//                     sequence();
//                 } else {
//                     throw new Error('Restaurant not found');
//                 }
//             } catch (err) {
//                 setError(err.message);
//             } finally {
//                 setLoading(false);
//             }
//         };

//         if (orgId && tableNumber) {
//             fetchRestaurantData();
//         }
//     }, [orgId, tableNumber]);

//     const containerStyle = {
//         position: 'fixed',
//         top: 0,
//         left: 0,
//         right: 0,
//         bottom: 0,
//         background: 'linear-gradient(135deg, #ff4d4f 0%, #ff7875 100%)',
//         display: 'flex',
//         alignItems: 'center',
//         justifyContent: 'center',
//         overflow: 'hidden',
//     };

//     const contentStyle = {
//         display: 'flex',
//         flexDirection: 'column',
//         alignItems: 'center',
//         justifyContent: 'center',
//         padding: '20px',
//         textAlign: 'center',
//     };

//     const logoStyle = {
//         width: '120px',
//         height: 'auto',
//         transition: 'all 0.7s ease-in-out',
//         opacity: animationPhase === 'initial' ? 0 : 1,
//         transform: 
//             animationPhase === 'initial' ? 'scale(0)' :
//             animationPhase === 'logoExpand' ? 'scale(2.5)' :
//             animationPhase === 'logoShrink' ? 'scale(0.8) translateY(-100px)' :
//             animationPhase === 'appNameEnter' || animationPhase === 'restaurantEnter' ? 'scale(0.8) translateY(-100px)' :
//             'scale(1)',
//     };

//     const appNameStyle = {
//         color: '#ffffff',
//         fontSize: '48px',
//         fontWeight: 'bold',
//         margin: '20px 0',
//         opacity: animationPhase === 'appNameEnter' || animationPhase === 'restaurantEnter' ? 1 : 0,
//         animation: animationPhase === 'appNameEnter' ? 'glowText 2s infinite' : 'none',
//         transition: 'opacity 0.5s ease-in-out',
//     };

//     const restaurantContainerStyle = {
//         marginTop: '20px',
//         opacity: animationPhase === 'restaurantEnter' ? 1 : 0,
//         transform: `translateY(${animationPhase === 'restaurantEnter' ? '0' : '20px'})`,
//         transition: 'all 0.5s ease-in-out',
//     };

//     const restaurantLogoStyle = {
//         width: '100px',
//         height: 'auto',
//         marginBottom: '15px',
//     };

//     if (loading) {
//         return (
//             <div style={containerStyle}>
//                 <div style={contentStyle}>
//                     <Spin
//                         indicator={
//                             <LoadingOutlined
//                                 style={{ fontSize: 50, color: '#fff' }}
//                                 spin
//                             />
//                         }
//                     />
//                     <Text style={{ marginTop: '20px', color: '#fff', fontSize: '16px' }}>
//                         Loading, please wait...
//                     </Text>
//                 </div>
//             </div>
//         );
//     }

//     if (error) {
//         return (
//             <div style={containerStyle}>
//                 <Card style={{ padding: '20px', borderRadius: '8px', background: 'rgba(255, 255, 255, 0.9)' }}>
//                     <Text type="danger" style={{ fontSize: '16px' }}>{error}</Text>
//                 </Card>
//             </div>
//         );
//     }

//     return (
//         <div style={containerStyle}>
//             <style>{keyframes}</style>
//             <div style={contentStyle}>
//                 <img
//                     src="/assets/logo-png_1.png"
//                     alt="App Logo"
//                     style={logoStyle}
//                 />
                
//                 <Title style={appNameStyle}>
//                     {animationPhase === 'appNameEnter' || animationPhase === 'restaurantEnter' 
//                         ? "SmartDine".split('').map((letter, i) => (
//                             <span
//                                 key={i}
//                                 style={{
//                                     display: 'inline-block',
//                                     animation: `letterSlideIn 0.5s forwards ${i * 0.1}s`,
//                                     opacity: 0,
//                                 }}
//                             >
//                                 {letter}
//                             </span>
//                         ))
//                         : null
//                     }
//                 </Title>

//                 {restaurant && animationPhase === 'restaurantEnter' && (
//                     <div style={restaurantContainerStyle}>
//                         <img
//                             src={restaurant.logo}
//                             alt={restaurant.name}
//                             style={restaurantLogoStyle}
//                         />
//                         <Title level={3} style={{ color: '#fff', margin: '10px 0' }}>
//                             Welcome to {restaurant.name}
//                         </Title>
//                         <Text style={{ color: '#fff', fontSize: '20px' }}>
//                             Table {tableNumber}
//                         </Text>
//                     </div>
//                 )}
//             </div>
//         </div>
//     );
// };

// export default SplashScreen;

