// import React, { useState } from 'react';
// import { useNavigate } from 'react-router-dom';
// import { Eye, EyeOff } from 'lucide-react';
// import { Modal, Card } from 'antd';
// import FoodLoader from './FoodLoader';
// import './landing-page.css';

// const API_URL = process.env.REACT_APP_API_URL || 'https://www.py-server.smart-server.in';

// const restaurants = [
//   { id: 1, name: 'Yati Restaurant', image: '/assets/yati-restaurant.jpg', orgId: 1 },
//   { id: 2, name: 'Ammamma Gari Illu', image: '/assets/ammamma-gari-illu.jpg', orgId: 2 },
//   { id: 3, name: 'Biryanis and More', image: '/assets/biryanis-and-more.jpg', orgId: 3 },
// ];

// const LandingPage = () => {
//     const [isAdminLogin, setIsAdminLogin] = useState(false);
//     const [username, setUsername] = useState('');
//     const [password, setPassword] = useState('');
//     const [showPassword, setShowPassword] = useState(false);
//     const [error, setError] = useState('');
//     const [isLoading, setIsLoading] = useState(false);
//     const [isRestaurantModalVisible, setIsRestaurantModalVisible] = useState(false);
//     const navigate = useNavigate();

//     const handleLogin = async (e) => {
//         e.preventDefault();
//         setIsLoading(true);
//         setError('');

//         try {
//             if (isAdminLogin) {
//                 const response = await fetch(`${API_URL}/api/admin/login`, {
//                     method: 'POST',
//                     headers: { 'Content-Type': 'application/json' },
//                     body: JSON.stringify({ username, password }),
//                 });

//                 if (response.ok) {
//                     const data = await response.json();
//                     localStorage.setItem('adminToken', data.token);
//                     localStorage.setItem('role', 'admin');
//                     localStorage.setItem('orgId', data.orgId);
//                     navigate('/admin');
//                 } else {
//                     const errorData = await response.json();
//                     setError(errorData.message || 'Invalid credentials. Please try again.');
//                 }
//             } else {
//                 setIsRestaurantModalVisible(true);
//             }
//         } catch (error) {
//             setError('An error occurred. Please try again.');
//             console.error('Login error:', error);
//         } finally {
//             setIsLoading(false);
//         }
//     };

//     const handleRestaurantSelection = (orgId) => {
//         localStorage.setItem('role', 'customer');
//         localStorage.setItem('orgId', orgId.toString());
//         setIsRestaurantModalVisible(false);
//         navigate('/home');
//     };

//     const togglePasswordVisibility = () => {
//         setShowPassword(!showPassword);
//     };

//     return (
//         <div className="landing-container">
//             <img
//                 src={process.env.PUBLIC_URL + '/assets/logo-transparent-png - Copy.png'}
//                 alt="Logo"
//                 className="logo"
//             />

//             <div className="login-container">
//                 <h1 className="login-title">Welcome to Our Food Service</h1>

//                 {isAdminLogin ? (
//                     <form onSubmit={handleLogin}>
//                         <div className="input-group">
//                             <input
//                                 type="text"
//                                 className="input-field"
//                                 placeholder="Username"
//                                 value={username}
//                                 onChange={(e) => setUsername(e.target.value)}
//                                 required
//                             />
//                         </div>
//                         <div className="input-group">
//                             <input
//                                 type={showPassword ? "text" : "password"}
//                                 className="input-field"
//                                 placeholder="Password"
//                                 value={password}
//                                 onChange={(e) => setPassword(e.target.value)}
//                                 required
//                             />
//                             <button
//                                 type="button"
//                                 className="password-toggle"
//                                 onClick={togglePasswordVisibility}
//                             >
//                                 {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
//                             </button>
//                         </div>
//                         <button type="submit" className="btn">
//                             Admin Login
//                         </button>
//                     </form>
//                 ) : (
//                     <button onClick={handleLogin} className="btn">
//                         Enter as Customer
//                     </button>
//                 )}

//                 <button
//                     onClick={() => setIsAdminLogin(!isAdminLogin)}
//                     className="btn btn-outline"
//                     style={{ marginTop: '1rem' }}
//                 >
//                     {isAdminLogin ? 'Switch to Customer' : 'Switch to Admin Login'}
//                 </button>

//                 {error && <div className="error-message">{error}</div>}

//                 {isLoading && <FoodLoader />}

//                 <div className="food-emojis">
//                     <span className="food-emoji">🍔</span>
//                     <span className="food-emoji">🍕</span>
//                     <span className="food-emoji">🌮</span>
//                     <span className="food-emoji">🍣</span>
//                     <span className="food-emoji">🍜</span>
//                 </div>
//             </div>

//             <Modal
//                 title="Choose Your Restaurant"
//                 visible={isRestaurantModalVisible}
//                 onCancel={() => setIsRestaurantModalVisible(false)}
//                 footer={null}
//                 width={800}
//             >
//                 <div style={{ display: 'flex', justifyContent: 'space-around', flexWrap: 'wrap' }}>
//                     {restaurants.map((restaurant) => (
//                         <Card
//                             key={restaurant.id}
//                             hoverable
//                             style={{ width: 240, marginBottom: 16 }}
//                             cover={<img alt={restaurant.name} src={process.env.PUBLIC_URL + restaurant.image} />}
//                             onClick={() => handleRestaurantSelection(restaurant.orgId)}
//                         >
//                             <Card.Meta title={restaurant.name} description="Click to select" />
//                         </Card>
//                     ))}
//                 </div>
//             </Modal>
//         </div>
//     );
// };

// export default LandingPage;

// import React, { useState, useEffect } from 'react';
// import { useNavigate, Route, Routes } from 'react-router-dom';
// import { Eye, EyeOff } from 'lucide-react';
// import { Modal, Card, Spin } from 'antd';
// import FoodLoader from './FoodLoader';
// import QREntry from './QREntry ';
// import './landing-page.css';

// const API_URL = process.env.REACT_APP_API_URL || 'https://www.py-server.smart-server.in';

// const LandingPage = () => {
//     const [isAdminLogin, setIsAdminLogin] = useState(false);
//     const [username, setUsername] = useState('');
//     const [password, setPassword] = useState('');
//     const [showPassword, setShowPassword] = useState(false);
//     const [error, setError] = useState('');
//     const [isLoading, setIsLoading] = useState(false);
//     const [isRestaurantModalVisible, setIsRestaurantModalVisible] = useState(false);
//     const [restaurants, setRestaurants] = useState([]);
//     const [isLoadingRestaurants, setIsLoadingRestaurants] = useState(false);
//     const navigate = useNavigate();

//     useEffect(() => {
//         fetchRestaurants();
//     }, []);

//     const fetchRestaurants = async () => {
//         setIsLoadingRestaurants(true);
//         try {
//           const response = await fetch('https://smart-server-stage-database-default-rtdb.firebaseio.com/restaurants.json');
//           if (!response.ok) {
//             throw new Error('Failed to fetch restaurants');
//           }
//           const data = await response.json();
//             setRestaurants(data);
//         } catch (error) {
//           console.error('Error fetching restaurants:', error);
//           setError('Failed to load restaurants. Please try again.');
//         } finally {
//           setIsLoadingRestaurants(false);
//         }
//       };

//     const handleLogin = async (e) => {
//         e.preventDefault();
//         setIsLoading(true);
//         setError('');

//         try {
//             if (isAdminLogin) {
//                 const response = await fetch(`${API_URL}/api/admin/login`, {
//                     method: 'POST',
//                     headers: { 'Content-Type': 'application/json' },
//                     body: JSON.stringify({ username, password }),
//                 });

//                 if (response.ok) {
//                     const data = await response.json();
//                     localStorage.setItem('adminToken', data.token);
//                     localStorage.setItem('role', 'admin');
//                     localStorage.setItem('orgId', data.orgId);
//                     navigate('/admin');
//                 } else {
//                     const errorData = await response.json();
//                     setError(errorData.message || 'Invalid credentials. Please try again.');
//                 }
//             } else {
//                 setIsRestaurantModalVisible(true);
//             }
//         } catch (error) {
//             setError('An error occurred. Please try again.');
//             console.error('Login error:', error);
//         } finally {
//             setIsLoading(false);
//         }
//     };

//     const handleRestaurantSelection = (orgId) => {
//         localStorage.setItem('role', 'customer');
//         localStorage.setItem('orgId', orgId.toString());
//         setIsRestaurantModalVisible(false);
//         navigate('/home');
//     };

//     const togglePasswordVisibility = () => {
//         setShowPassword(!showPassword);
//     };

//     return (
//         <Routes>
//             <Route path="/" element={
//                  <div className="landing-container">
//                  <img
//                      src={process.env.PUBLIC_URL + '/assets/logo-transparent-png - Copy.png'}
//                      alt="Logo"
//                      className="logo"
//                  />

//                  <div className="login-container">
//                      <h1 className="login-title">Welcome to Our Food Service</h1>

//                      {isAdminLogin ? (
//                          <form onSubmit={handleLogin}>
//                              <div className="input-group">
//                                  <input
//                                      type="text"
//                                      className="input-field"
//                                      placeholder="Username"
//                                      value={username}
//                                      onChange={(e) => setUsername(e.target.value)}
//                                      required
//                                  />
//                              </div>
//                              <div className="input-group">
//                                  <input
//                                      type={showPassword ? "text" : "password"}
//                                      className="input-field"
//                                      placeholder="Password"
//                                      value={password}
//                                      onChange={(e) => setPassword(e.target.value)}
//                                      required
//                                  />
//                                  <button
//                                      type="button"
//                                      className="password-toggle"
//                                      onClick={togglePasswordVisibility}
//                                  >
//                                      {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
//                                  </button>
//                              </div>
//                              <button type="submit" className="btn">
//                                  Admin Login
//                              </button>
//                          </form>
//                      )
//                      : (
//                          <button onClick={handleLogin} className="btn">
//                              Enter as Customer
//                          </button>
//                      )
//                      }

//                      <button
//                          onClick={() => setIsAdminLogin(!isAdminLogin)}
//                          className="btn btn-outline"
//                          style={{ marginTop: '1rem' }}
//                      >
//                          {isAdminLogin ? 'Switch to Customer' : 'Switch to Admin Login'}
//                      </button>

//                      {error && <div className="error-message">{error}</div>}

//                      {isLoading && <FoodLoader />}

//                      <div className="food-emojis">
//                          <span className="food-emoji">🍔</span>
//                          <span className="food-emoji">🍕</span>
//                          <span className="food-emoji">🌮</span>
//                          <span className="food-emoji">🍣</span>
//                          <span className="food-emoji">🍜</span>
//                      </div>
//                  </div>

//                  <Modal
//                      title="Choose Your Restaurant"
//                      visible={isRestaurantModalVisible}
//                      onCancel={() => setIsRestaurantModalVisible(false)}
//                      footer={null}
//                      width={800}
//                  >
//                      {isLoadingRestaurants ? (
//                          <div style={{ textAlign: 'center', padding: '20px' }}>
//                              <Spin size="large" />
//                              <p>Loading restaurants...</p>
//                          </div>
//                      ) : (
//                          <div style={{ display: 'flex', justifyContent: 'space-around', flexWrap: 'wrap' }}>
//                              {restaurants.map((restaurant) => (
//                                  <Card
//                                      key={restaurant.id}
//                                      hoverable
//                                      style={{ width: 240, marginBottom: 16 }}
//                                      cover={<img alt={restaurant.name} src={restaurant.logo} />}
//                                      onClick={() => handleRestaurantSelection(restaurant.orgId)}
//                                  >
//                                      <Card.Meta
//                                          title={restaurant.name}
//                                          description={`Count: ${restaurant.peopleCount}`}
//                                      />
//                                  </Card>
//                              ))}
//                          </div>
//                      )}
//                  </Modal>
//              </div>

//             } />
//             <Route path="/qr-entry/:orgId" element={<QREntry />} />
//         </Routes>
//     );
// };

// export default LandingPage;
import React, { useState, useEffect } from "react";
import { useNavigate, Route, Routes } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import { Spin } from "antd";
import FoodLoader from "./giftLoader";
import "./landing-page.css";
import QREntry from "./QREntry ";

const API_URL =
  process.env.REACT_APP_API_URL || "https://www.py-server.smart-server.in";

const LandingPage = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const response = await fetch(`${API_URL}/api/admin/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      if (response.ok) {
        const data = await response.json();
        localStorage.setItem("adminToken", data.token);
        localStorage.setItem("role", "admin");
        localStorage.setItem("orgId", data.orgId);
        navigate("/admin");
      } else {
        const errorData = await response.json();
        setError(errorData.message || "Invalid credentials. Please try again.");
      }
    } catch (error) {
      setError("An error occurred. Please try again.");
      console.error("Login error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <Routes>
      <Route
        path="/"
        element={
          <div className="landing-container">
            <img
              src={
                process.env.PUBLIC_URL +
                "/assets/logo-transparent-png - Copy.png"
              }
              alt="Logo"
              className="logo"
            />

            <div className="login-container">
              <h1 className="login-title">Welcome to Our Food Service</h1>

              <form onSubmit={handleLogin}>
                <div className="input-group">
                  <input
                    type="text"
                    className="input-field"
                    placeholder="Username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                  />
                </div>
                <div className="input-group">
                  <input
                    type={showPassword ? "text" : "password"}
                    className="input-field"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    className="password-toggle"
                    onClick={togglePasswordVisibility}
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
                <button type="submit" className="btn">
                  Admin Login
                </button>
              </form>

              {error && <div className="error-message">{error}</div>}

              {isLoading && <FoodLoader />}
            </div>

            <div className="food-emojis">
              <span className="food-emoji">🍔</span>
              <span className="food-emoji">🍕</span>
              <span className="food-emoji">🌮</span>
              <span className="food-emoji">🍣</span>
              <span className="food-emoji">🍜</span>
            </div>
          </div>
        }
      />
      <Route path="/qr-entry/:orgId" element={<QREntry />} />
    </Routes>
  );
};

export default LandingPage;
