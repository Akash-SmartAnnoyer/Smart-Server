import React, { useState, useEffect } from 'react';
import { Drawer, Menu } from 'antd';
import { Link } from 'react-router-dom';
import { MdRestaurant } from "react-icons/md";
import { HomeOutlined, ShoppingCartOutlined, FileTextOutlined, UnorderedListOutlined, HistoryOutlined, UserOutlined, SettingOutlined, AppstoreOutlined, BarsOutlined } from '@ant-design/icons';
import { LuLayoutDashboard } from "react-icons/lu";
import { IoFastFoodOutline } from "react-icons/io5";

const RestaurantDrawer = ({ isOpen, onClose }) => {
  const [restaurantName, setRestaurantName] = useState('');
  const [role, setRole] = useState('');

  useEffect(() => {
    fetchRestaurantData();
    const storedRole = localStorage.getItem('role');
    setRole(storedRole || '');

    // Add event listener for storage changes
    window.addEventListener('storage', handleStorageChange);

    // Cleanup
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  const handleStorageChange = (event) => {
    if (event.key === 'role') {
      setRole(event.newValue || '');
    }
  };

  const fetchRestaurantData = async () => {
    try {
      const orgId = localStorage.getItem('orgId');
      
      if (!orgId) {
        console.error("No orgId found in localStorage");
        return;
      }
  
      // Adding `.json` at the end of the Firebase Realtime Database URL
      const response = await fetch('https://smartdb-175f4-default-rtdb.firebaseio.com/restaurants.json');
      
      if (response.ok) {
        const data = await response.json();
        
        // Check if data exists and filter by `orgId`
        if (data) {
          // Firebase stores data in a key-value format, so `data` is an object not an array
          const restaurant = Object.values(data).find(restaurant => restaurant.orgId === orgId);
          
          if (restaurant) {
            setRestaurantName(restaurant.name);
          } else {
            console.error("No restaurant found with the given orgId");
          }
        } else {
          console.error("No data available in the database");
        }
      } else {
        console.error("Error fetching restaurant data:", response.status);
      }
    } catch (error) {
      console.error("Error fetching restaurant data:", error);
    }
  };
  

  return (
    <Drawer
      title={
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <img 
            src={process.env.PUBLIC_URL + '/assets/logo-transparent-png_1.png'} 
            alt="Smart Server" 
            className="logo-image" 
            style={{ height: '50px', width: '60px' }}
          />
          <span style={{ fontSize: '24px', fontFamily: 'Nerko One, sans-serif' }}>Menu</span>
          <img 
            src={process.env.PUBLIC_URL + '/assets/close.png'} 
            alt="Close" 
            className="logo-image" 
            onClick={onClose}
            style={{ 
              height: '30px', 
              width: '40px',
              cursor: 'pointer',
              transition: 'box-shadow 0.3s ease-in-out',
              borderRadius: '50%' 
            }} 
            onMouseOver={e => e.currentTarget.style.boxShadow = '0px 8px 16px rgba(0, 0, 0, 0.3)'}
            onMouseOut={e => e.currentTarget.style.boxShadow = 'none'}
          />
        </div>
      }
      placement="left"
      onClose={onClose}
      open={isOpen}
      width={300}
      bodyStyle={{ padding: 0 }}
      headerStyle={{ background: '#f5222d', color: 'white' }}
      closeIcon={null}
    >
      <Menu
        mode="vertical"
        theme="light"
        style={{
          borderRight: 0,
          fontFamily: 'Nerko One, sans-serif',
          backgroundColor: 'white',
        }}
      >
        {role === 'customer' && (
          <>
            <Menu.Item
              key="home"
              icon={
                <img 
                src={process.env.PUBLIC_URL + '/assets/menu.png'} 
                alt="Orders Icon" 
                  style={{ width: "24px", height: "24px" }} 
                />
              }  
              className="menu-item"
              style={{ margin: "20px" }}
            >
              <Link to="/home" onClick={onClose} style={{ fontWeight: 'bold', fontSize: "20px" }}>Menu</Link>
            </Menu.Item>
            <Menu.Item
              key="cart"
              icon={<ShoppingCartOutlined style={{ fontWeight: 'bold', fontSize: "24px" }} />}
              className="menu-item"
              style={{ margin: "20px" }}
            >
              <Link to="/cart" onClick={onClose} style={{ fontSize: "20px" }}>Cart</Link>
            </Menu.Item>
            <Menu.Item
              key="summary-view"
              icon={<FileTextOutlined style={{ fontWeight: 'bold', fontSize: "24px" }} />}
              className="menu-item"
              style={{margin:"20px"}}
            >
              <Link to="/summary-view" onClick={onClose} style={{ fontSize: "20px" }}>Order Summary</Link>
            </Menu.Item>
            <Menu.Item
              key="my-orders"
              icon={<IoFastFoodOutline style={{ fontWeight: 'bold', fontSize: "24px" }} />}
              className="menu-item"
              style={{margin:"20px"}}
            >
              <Link to="/my-orders" onClick={onClose} style={{ fontSize: "20px" }}>My Orders</Link>
            </Menu.Item>
          </>
        )}



        {role === 'admin' && (
          <>
            <Menu.Item
              key="admin"
              icon={
                <img 
                src={process.env.PUBLIC_URL + '/assets/restaurant.png'} 
                alt="Orders Icon" 
                  style={{ width: "30px", height: "30px" }} 
                />
              }
              className="menu-item"
              style={{ margin: "20px" }}
            >
              <Link to="/admin" onClick={onClose} style={{ fontSize: "20px" }}>Order Management</Link>
            </Menu.Item>
            <Menu.Item
              key="menu-management"
              icon={
                <img 
                src={process.env.PUBLIC_URL + '/assets/menu.png'} 
                alt="Orders Icon" 
                  style={{ width: "30px", height: "30px" }} 
                />
              }    
              className="menu-item"
              style={{ margin: "20px" }}
            >
              <Link to="/menu-management" onClick={onClose} style={{ fontSize: "20px" }}>Menu Management</Link>
            </Menu.Item>
            <Menu.Item
              key="management"
              icon={
                <img 
                src={process.env.PUBLIC_URL + '/assets/menu-management.png'} 
                alt="Orders Icon" 
                  style={{ width: "30px", height: "30px" }} 
                />
              } 
              className="menu-item"
              style={{ margin: "20px" }}
            >
              <Link to="/management" onClick={onClose} style={{ fontSize: "20px" }}>Restaurant Management</Link>
            </Menu.Item>
            <Menu.Item
          key="dashboard"
          icon={
            <img 
            src={process.env.PUBLIC_URL + '/assets/business.png'} 
            alt="Orders Icon" 
              style={{ width: "30px", height: "30px" }} 
            />
          } 
          className="menu-item"
          style={{ margin: "20px" }}
        >
          <Link to="/dashboard" onClick={onClose} style={{ fontSize: "20px" }}>Restaurant Dashboard</Link>
        </Menu.Item>

            <Menu.Item
          key="order-history"
          icon={
            <img 
            src={process.env.PUBLIC_URL + '/assets/time.png'} 
            alt="Orders Icon" 
              style={{ width: "30px", height: "30px" }} 
            />
          } 
          className="menu-item"
          style={{ margin: "20px" }}
        >
          <Link to="/order-history" onClick={onClose} style={{ fontSize: "20px" }}>Order History</Link>
        </Menu.Item>
          </>
        )}
      </Menu>
      <div style={{ 
        position: 'absolute', 
        bottom: 0, 
        width: '100%', 
        borderTop: '1px solid #f0f0f0', 
        padding: '10px', 
        textAlign: 'center' 
      }}>
        <p style={{ margin: 0, color: 'rgba(0, 0, 0, 0.45)' }}>© 2024 {restaurantName || 'Restaurant Name'}</p>
      </div>
      <style>
        {`
          .menu-item.ant-menu-item-selected {
            background-color: #f5222d !important;
            color: white !important; 
          }
          .menu-item.ant-menu-item-selected a {
            color: white !important;
          }
        `}
      </style>
    </Drawer>
  );
};

export default RestaurantDrawer;