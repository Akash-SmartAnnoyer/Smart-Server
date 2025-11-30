import React, { useState } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Header from './components/Header';
import FooterNavigation from './components/FooterNavigation';
import Home from './pages/Home';
import Cart from './pages/Cart';
import OrderSummary from './pages/OrderSummary';
import { CartProvider } from './contexts/CartContext';
import { CartIconProvider } from './contexts/CartIconContext';
import './styles/main.css';
import AdminPage from './components/AdminPage';
import OrderHistory from './components/OrderHistory';
import OrderConfirmation from './components/OrderConfirmation';
import MenuManagement from './components/MenuManagement';
import WaitingScreen from './components/WaitingScreen';
import LandingPage from './components/LandingPage';
import RestaurantManagement from './components/RestaurantManagement';
import RestaurantDashBoard from './components/RestaurantDashboard';
import SummaryView from './components/SummaryView';
import MyOrders from './components/MyOrders';
import MenuItem from './components/MenuItem';
import QREntry from './components/QREntry ';
import MenuSuggestionManager from './components/MenuSuggestionManager';
import { MenuProvider } from './contexts/MenuProvider';
import ChargesManagement from './components/ChargesManagement';
import { OrderProvider } from './context/OrderContext';
import { AdminOrderProvider } from './context/AdminOrderContext';
import NewAdminPage from './components/NewAdminPage';
import { NewOrderHistory } from './components/NewOrderHistory';
import AllOrdersSummary from './components/AllOrdersSummary';
import SuperAdminDashboard from './components/SuperAdminDashboard';
import ProtectedRoute from './components/ProtectedRoute';
import { AuthProvider } from './contexts/AuthContext';

const App = () => {
  const [searchTerm, setSearchTerm] = useState('');

  const handleSearch = (value) => {
    setSearchTerm(value);
  };

  const handleItemAdded = () => {
    // Logic for item added animation
  };

  return (
    <AuthProvider>
      <Router>
        <OrderProvider>
          <MenuProvider>
            <CartProvider>
              <CartIconProvider>
                <AdminOrderProvider>
                  <div className="App">
                  <Routes>
                    <Route path="/" element={<LandingPage />} />
                    <Route path="/qr-entry/:orgId/:tableNumber" element={<QREntry />} />
                    
                    {/* Super Admin Routes - Standalone (no header/footer) */}
                    <Route 
                      path="/super-admin" 
                      element={
                        <ProtectedRoute allowedRoles={['super_admin']}>
                          <SuperAdminDashboard />
                        </ProtectedRoute>
                      } 
                    />
                    
                    {/* Routes with Header & Footer */}
                    <Route
                      path="*"
                      element={
                        <>
                          <Header onSearch={handleSearch} />
                          <div className="container pb-16">
                            <Routes>
                              {/* Customer Routes */}
                              <Route 
                                path="/home" 
                                element={
                                  <Home 
                                    onItemAdded={handleItemAdded}
                                    searchTerm={searchTerm}
                                  />
                                } 
                              />
                              <Route 
                                path="/home/menu/:subcategoryId" 
                                element={
                                  <MenuItem 
                                    onItemAdded={handleItemAdded}
                                    searchTerm={searchTerm}
                                  />
                                }
                              />
                              <Route path="/cart" element={<Cart />} />
                              <Route path="/order-summary" element={<OrderSummary />} />
                              <Route path="/order-confirmation" element={<OrderConfirmation />} />
                              <Route path="/waiting/:orderId" element={<WaitingScreen />} /> 
                              <Route path="/my-orders" element={<MyOrders />} />
                              
                              {/* Organization Admin & Staff Routes */}
                              <Route 
                                path="/admin" 
                                element={
                                  <ProtectedRoute allowedRoles={['org_admin', 'admin', 'captain']}>
                                    <NewAdminPage />
                                  </ProtectedRoute>
                                } 
                              />
                              <Route 
                                path="/menu-management" 
                                element={
                                  <ProtectedRoute allowedRoles={['org_admin']}>
                                    <MenuManagement />
                                  </ProtectedRoute>
                                } 
                              />
                              <Route 
                                path="/charges-management" 
                                element={
                                  <ProtectedRoute allowedRoles={['org_admin']}>
                                    <ChargesManagement />
                                  </ProtectedRoute>
                                } 
                              />
                              <Route 
                                path="/order-history" 
                                element={
                                  <ProtectedRoute allowedRoles={['org_admin', 'admin', 'captain']}>
                                    <NewOrderHistory />
                                  </ProtectedRoute>
                                } 
                              />
                              <Route 
                                path="/all-orders-summary" 
                                element={
                                  <ProtectedRoute allowedRoles={['org_admin', 'admin', 'captain']}>
                                    <AllOrdersSummary />
                                  </ProtectedRoute>
                                } 
                              />
                              <Route 
                                path="/dashboard" 
                                element={
                                  <ProtectedRoute allowedRoles={['org_admin']}>
                                    <RestaurantDashBoard />
                                  </ProtectedRoute>
                                } 
                              />
                              <Route 
                                path="/menu-suggestion" 
                                element={
                                  <ProtectedRoute allowedRoles={['org_admin']}>
                                    <MenuSuggestionManager />
                                  </ProtectedRoute>
                                } 
                              />
                              
                              {/* Organization Admin Only - Restaurant Management */}
                              <Route 
                                path="/management" 
                                element={
                                  <ProtectedRoute allowedRoles={['org_admin']}>
                                    <RestaurantManagement />
                                  </ProtectedRoute>
                                } 
                              />
                              
                              <Route path="/summary-view" element={<SummaryView />} />
                            </Routes>
                          </div>
                          <FooterNavigation />
                        </>
                      }
                    />
                  </Routes>
                  </div>
                </AdminOrderProvider>
              </CartIconProvider>
            </CartProvider>
          </MenuProvider>
        </OrderProvider>
      </Router>
    </AuthProvider>
  );
}

export default App;