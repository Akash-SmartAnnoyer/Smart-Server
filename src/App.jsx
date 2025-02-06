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
import NotificationHandler from './components/NotificationHandler';
import ActivityLog from './components/ActivityLog';

const App = () => {
  const [searchTerm, setSearchTerm] = useState('');

  const handleSearch = (value) => {
    setSearchTerm(value);
  };

  const handleItemAdded = () => {
    // Logic for item added animation
  };

  return (
    <Router>
      <OrderProvider>
        <MenuProvider>
          <CartProvider>
            <CartIconProvider>
              <AdminOrderProvider>
                <div className="App">
                  {/* <NotificationHandler /> */}
                  <Routes>
                    <Route path="/" element={<LandingPage />} />
                    <Route path="/qr-entry/:orgId/:tableNumber" element={<QREntry />} />
                    <Route
                      path="*"
                      element={
                        <>
                          <Header onSearch={handleSearch} />
                          <div className="container pb-16">
                            <Routes>
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
                              <Route path="/admin" element={<NewAdminPage />} />
                              <Route path="/order-summary" element={<OrderSummary />} />
                              <Route path="/summary-view" element={<SummaryView />} />
                              <Route path="/order-history" element={<NewOrderHistory />} />
                              <Route path="/order-confirmation" element={<OrderConfirmation />} />
                              <Route path="/menu-management" element={<MenuManagement />} />
                              <Route path="/waiting/:orderId" element={<WaitingScreen />} /> 
                              <Route path="/management" element={<RestaurantManagement />} /> 
                              <Route path="/dashboard" element={<RestaurantDashBoard />} />
                              <Route path="/my-orders" element={<MyOrders />} />
                              <Route path="/menu-suggestion" element={<MenuSuggestionManager />} />
                              <Route path='/charges-management' element={<ChargesManagement />} />
                              <Route path="/all-orders-summary" element={<AllOrdersSummary />} />
                              <Route path="/activity-log" element={<ActivityLog />} />
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
  );
}

export default App;