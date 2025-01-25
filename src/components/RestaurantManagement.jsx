import React, { useState, useRef, useEffect } from 'react';
import { 
  Store, 
  Settings2, 
  MapPin, 
  Phone, 
  Mail, 
  Clock, 
  Users, 
  ChefHat, 
  DollarSign, 
  Camera, 
  Loader2, 
  PlusCircle, 
  MapIcon, 
  Crosshair, 
  Search, 
  Settings, 
  Shield, 
  RefreshCcw, 
  Info, 
  ChevronRight, 
  ChevronLeft, 
  Package, 
  Save 
} from 'lucide-react';
import { MapContainer, TileLayer, Marker, useMap, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';
import FoodLoader from './FoodLoader';

const versionInfo = {
  version: "1.0.0",
  buildNumber: "2024.03.1",
  environment: "production"
};

// Add this near the top of the file, outside the component
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes in milliseconds
let cachedData = null;
let cacheTimestamp = null;

const RestaurantManagement = () => {
  const [loading, setLoading] = useState(false);
  const [restaurant, setRestaurant] = useState(null);
  const [showMap, setShowMap] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const fileInputRef = useRef(null);
  const mapRef = useRef(null);
  const [activeSection, setActiveSection] = useState(null);
 
  const customIcon = new L.Icon({
    iconUrl: markerIcon,
    iconRetinaUrl: markerIcon2x,
    shadowUrl: markerShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
  });

  useEffect(() => {
    const isCacheValid = cachedData && cacheTimestamp && (Date.now() - cacheTimestamp < CACHE_DURATION);
    
    if (isCacheValid) {
      setRestaurant(cachedData);
    } else {
      fetchRestaurantData();
    }
  }, []);
  
  const fetchRestaurantData = async () => {
    try {
      setLoading(true);
      const orgId = localStorage.getItem('orgId');
      const response = await fetch(
        `https://smart-server-menu-database.firebaseio.com/restaurants.json?orderBy="orgId"&equalTo="${orgId}"`
      );
  
      if (response.ok) {
        const data = await response.json();
        
        if (data) {
          // Get the first (and should be only) restaurant
          const restaurantId = Object.keys(data)[0];
          const restaurantData = data[restaurantId];
  
          if (restaurantData) {
            const restaurantWithId = { ...restaurantData, id: restaurantId };
            setRestaurant(restaurantWithId);
            // Cache the data
            cachedData = restaurantWithId;
            cacheTimestamp = Date.now();
          } else {
            console.error("No restaurant found for this orgId");
          }
        }
      } else {
        console.error("Failed to fetch restaurant data:", response.status);
      }
    } catch (error) {
      console.error("Error fetching restaurant data:", error);
    } finally {
      setLoading(false);
    }
  };
  
  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const { id, ...restaurantData } = restaurant;
      const response = await fetch(`https://smart-server-menu-database.firebaseio.com/restaurants/${id}.json`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(restaurantData),
      });
  
      if (response.ok) {
        console.log("Restaurant information updated successfully");
        // Update cache with new data
        cachedData = restaurant;
        cacheTimestamp = Date.now();
      } else {
        console.error("Failed to update restaurant information");
      }
    } catch (error) {
      console.error("Error updating restaurant information:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setRestaurant(prev => ({ ...prev, [name]: value }));
  };

  const handleLogoChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setLoading(true); // Add loading state while reading file
      const reader = new FileReader();
      
      reader.onloadend = () => {
        setRestaurant(prev => ({ ...prev, logo: reader.result }));
        setLoading(false); // Remove loading state after file is read
      };
      
      reader.onerror = () => {
        setLoading(false); // Remove loading state if there's an error
        // You might want to add error handling here
        console.error('Error reading file');
      };
      
      reader.readAsDataURL(file);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current.click();
  };

  const getCurrentLocation = async () => {
    if (navigator.geolocation) {
      try {
        setLoading(true);
        const position = await new Promise((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject);
        });
        
        const { latitude, longitude } = position.coords;
        
        // Update restaurant position
        setRestaurant(prev => ({ ...prev, position: [latitude, longitude] }));
        
        // Fetch and update address
        const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
        const data = await response.json();
        
        // Update restaurant data in state
        setRestaurant(prev => ({ ...prev, address: data.display_name }));
        
        // Save to database
        const { id, ...restaurantData } = restaurant;
        await fetch(`https://smart-server-menu-database.firebaseio.com/restaurants/${id}.json`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            position: [latitude, longitude],
            address: data.display_name
          }),
        });

        // Show success message (you can implement your own toast/notification system)
        console.log("Location updated successfully");
        
      } catch (error) {
        console.error("Error getting or saving location:", error);
      } finally {
        setLoading(false);
      }
    } else {
      console.error("Geolocation is not supported by this browser.");
    }
  };

  const searchLocation = async () => {
    try {
      const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}`);
      const data = await response.json();
      setSearchResults(data);
    } catch (error) {
      console.error("Error searching for location:", error);
    }
  };

  const selectSearchResult = (result) => {
    setRestaurant(prev => ({
      ...prev,
      position: [parseFloat(result.lat), parseFloat(result.lon)],
      address: result.display_name
    }));
    setSearchResults([]);
    setSearchQuery('');
  };

  const fetchAddress = async (lat, lng) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`
      );
      const data = await response.json();
      
      if (data.display_name) {
        setRestaurant(prev => ({
          ...prev,
          address: data.display_name
        }));
      }
    } catch (error) {
      console.error("Error fetching address:", error);
    }
  };

  const MapEvents = () => {
    const map = useMap();
    
    React.useEffect(() => {
      if (restaurant?.position) {
        map.setView(restaurant.position, 13);
      }
    }, [restaurant?.position, map]);

    map.on('click', (e) => {
      setRestaurant(prev => ({ ...prev, position: [e.latlng.lat, e.latlng.lng] }));
      fetchAddress(e.latlng.lat, e.latlng.lng);
    });

    return null;
  };

  // Styles remain the same as in the original component

  const searchContainerStyle = {
    position: 'relative',
    marginBottom: '1rem',
  };

  const searchResultsStyle = {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    backgroundColor: 'white',
    border: '1px solid #FFB3B3',
    borderRadius: '0.25rem',
    maxHeight: '200px',
    overflowY: 'auto',
    zIndex: 1000,
  };

  const searchResultItemStyle = {
    padding: '0.5rem',
    cursor: 'pointer',
    '&:hover': {
      backgroundColor: '#FFE5E5',
    },
  };
 
  // Add a style for the back button container
  const backButtonContainerStyle = {
    position: 'sticky',
    top: '60px',
    backgroundColor: 'white',
    borderBottom: '1px solid #FFE5E5',
    zIndex: 100,
    padding: '0.75rem',
    display: 'flex',
    alignItems: 'center',
  };

  const backButtonStyle = {
    display: 'flex',
    alignItems: 'center',
    color: '#666',
    backgroundColor: 'transparent',
    border: 'none',
    cursor: 'pointer',
    padding: '0rem',
    marginRight: '0.5rem',
    borderRadius: '0.25rem',
    fontSize: '1rem',
    fontWeight: '500',
    transition: 'background-color 0.2s ease',
  };

  const sectionTitleStyle = {
    margin: 0,
    color: '#333',
    fontSize: '1.1rem',
    fontWeight: '600',
    flex: 1,
    textAlign: 'center',
    marginRight: '2.5rem',
  };

  // Add this function to get the section title
  const getSectionTitle = (section) => {
    switch (section) {
      case 'basic':
        return 'Basic Information';
      case 'location':
        return 'Location Settings';
      case 'privacy':
        return 'Privacy Policy';
      case 'refund':
        return 'Refund Policy';
      case 'terms':
        return 'Terms & Conditions';
      case 'about':
        return 'About Us';
      default:
        return '';
    }
  };

  // Modify your section rendering to include the back button
  const RestaurantLoader = () => (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: 'rgba(255, 255, 255, 0.8)',
      zIndex: 1000,
    }}>
      <FoodLoader />
      <div style={{
        marginTop: '1rem',
        color: '#FF0000',
        fontWeight: 'bold',
        fontSize: '1.2rem',
      }}>
        Updating restaurant information...
      </div>
    </div>
  );

  const containerStyle = {
    maxWidth: '100%',
    margin: '0 auto',
    // padding: '1rem',
    // backgroundColor: '#f5f5f5',
    minHeight: '100vh',
    marginTop: '60px',
    paddingBottom: '100px',
    '@media (min-width: 768px)': {
      maxWidth: '800px',
      // padding: '2rem',
      paddingBottom: '100px',
    },
  };

  const headerStyle = {
    textAlign: 'center',
    color: '#FF0000',
    marginBottom: '2rem',
    fontSize: '2.5rem',
    fontWeight: 'bold',
  };

  const sectionStyle = {
    backgroundColor: 'white',
    padding: '1.5rem',
    borderRadius: '0.5rem',
    marginBottom: '1.5rem',
    border: '2px solid #FFE5E5',
  };

  const labelStyle = {
    display: 'block',
    marginBottom: '0.5rem',
    color: '#FF0000',
    fontWeight: 'bold',
  };

  const inputStyle = {
    width: '100%',
    padding: '0.75rem',
    border: '1px solid #FFB3B3',
    borderRadius: '0.25rem',
    fontSize: '1rem',
    transition: 'border-color 0.3s ease',
  };

  const buttonStyle = {
    backgroundColor: '#FF0000',
    color: 'white',
    border: 'none',
    padding: '0.75rem 1.5rem',
    borderRadius: '0.25rem',
    fontSize: '1rem',
    fontWeight: 'bold',
    cursor: 'pointer',
    transition: 'background-color 0.3s ease',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  };

  const logoContainerStyle = {
    position: 'relative',
    width: '120px',
    height: '120px',
    marginBottom: '1.5rem',
    '@media (max-width: 768px)': {
      width: '100px',
      height: '100px',
    },
  };

  const logoStyle = {
    width: '100%',
    height: '100%',
    borderRadius: '16px',
    backgroundColor: '#f8f9fa',
    border: '1px solid #eee',
    overflow: 'hidden',
    position: 'relative',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    '&:hover': {
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
    },
  };

  const profileHeaderStyle = {
    position: 'relative',
    width: '100%',
    padding: '2rem 1rem',
    backgroundColor: '#fff',
    borderBottom: '1px solid #eee',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  };

  const ProfileCard = ({ title, icon: Icon, onClick }) => (
    <div 
      onClick={onClick}
      style={{
        backgroundColor: 'white',
        padding: '1rem',
        borderRadius: '0.5rem',
        marginBottom: '1rem',
        border: '1px solid #FFE5E5',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <Icon size={24} color="#FF0000" />
        <span style={{ color: '#333', fontWeight: 'bold' }}>{title}</span>
      </div>
      <ChevronRight size={20} color="#666" />
    </div>
  );

  const handleLogoSave = async () => {
    setLoading(true);
    try {
      const { id } = restaurant;
      const response = await fetch(`https://smart-server-menu-database.firebaseio.com/restaurants/${id}.json`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ logo: restaurant.logo }),
      });

      if (response.ok) {
        console.log("Logo updated successfully");
      } else {
        console.error("Failed to update logo");
      }
    } catch (error) {
      console.error("Error updating logo:", error);
    } finally {
      setLoading(false);
    }
  };

  const renderSection = () => {
    switch (activeSection) {
      case 'basic':
        return (
          <form onSubmit={onSubmit}>
            <div style={{
              background: 'white',
              borderRadius: '1.5rem',
              padding: '1.5rem',
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.05)',
            }}>
              <h2 style={{ 
                color: '#FF0000',
                fontSize: '1.5rem',
                fontWeight: '600',
                marginBottom: '1.5rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}>
                <Settings2 size={24} />
                Basic Information
              </h2>
  
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '1.5rem'
              }}>
                {/* Restaurant Name Field */}
                <div style={{
                  background: '#F8F9FA',
                  padding: '1rem',
                  borderRadius: '1rem',
                }}>
                  <label style={{
                    display: 'block',
                    color: '#666',
                    fontSize: '0.9rem',
                    marginBottom: '0.5rem'
                  }}>
                    Restaurant Name
                  </label>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    background: 'white',
                    border: '2px solid #FFE5E5',
                    borderRadius: '0.75rem',
                    padding: '0.75rem',
                  }}>
                    <Store size={18} color="#FF0000" style={{ marginRight: '0.5rem' }} />
                    <input
                      type="text"
                      name="name"
                      value={restaurant?.name || ''}
                      onChange={handleInputChange}
                      style={{
                        border: 'none',
                        outline: 'none',
                        width: '100%',
                        fontSize: '1rem'
                      }}
                      placeholder="Enter restaurant name"
                    />
                  </div>
                </div>
  
                {/* Contact Information */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                  gap: '1rem',
                }}>
                  {/* Phone Field */}
                  <div style={{
                    background: '#F8F9FA',
                    padding: '1rem',
                    borderRadius: '1rem',
                  }}>
                    <label style={{
                      display: 'block',
                      color: '#666',
                      fontSize: '0.9rem',
                      marginBottom: '0.5rem'
                    }}>
                      Phone Number
                    </label>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      background: 'white',
                      border: '2px solid #FFE5E5',
                      borderRadius: '0.75rem',
                      padding: '0.75rem',
                    }}>
                      <Phone size={18} color="#FF0000" style={{ marginRight: '0.5rem' }} />
                      <input
                        type="tel"
                        name="phone"
                        value={restaurant?.phone || ''}
                        onChange={handleInputChange}
                        style={{
                          border: 'none',
                          outline: 'none',
                          width: '100%',
                          fontSize: '1rem'
                        }}
                        placeholder="Enter phone number"
                      />
                    </div>
                  </div>
  
                  {/* Email Field */}
                  <div style={{
                    background: '#F8F9FA',
                    padding: '1rem',
                    borderRadius: '1rem',
                  }}>
                    <label style={{
                      display: 'block',
                      color: '#666',
                      fontSize: '0.9rem',
                      marginBottom: '0.5rem'
                    }}>
                      Email Address
                    </label>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      background: 'white',
                      border: '2px solid #FFE5E5',
                      borderRadius: '0.75rem',
                      padding: '0.75rem',
                    }}>
                      <Mail size={18} color="#FF0000" style={{ marginRight: '0.5rem' }} />
                      <input
                        type="email"
                        name="email"
                        value={restaurant?.email || ''}
                        onChange={handleInputChange}
                        style={{
                          border: 'none',
                          outline: 'none',
                          width: '100%',
                          fontSize: '1rem'
                        }}
                        placeholder="Enter email address"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
  
            {/* Save Button */}
            <button
              type="submit"
              style={{
                background: 'linear-gradient(135deg, #FF0000, #FF4444)',
                color: 'white',
                border: 'none',
                padding: '1rem',
                borderRadius: '0.75rem',
                width: '100%',
                marginTop: '1.5rem',
                fontSize: '1rem',
                fontWeight: '500',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                cursor: 'pointer',
              }}
            >
              {loading ? (
                <Loader2 size={24} className="animate-spin" />
              ) : (
                <>
                  <Save size={18} />
                  Save Changes
                </>
              )}
            </button>
          </form>
        );
      case 'location':
        return (
          <form onSubmit={onSubmit}>
            <div style={{
              background: 'white',
              borderRadius: '1.5rem',
              padding: '1.5rem',
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.05)',
            }}>
              {!showMap ? (
                // Regular Location View
                <>
                  <h2 style={{ 
                    color: '#FF0000',
                    fontSize: '1.5rem',
                    fontWeight: '600',
                    marginBottom: '1.5rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                  }}>
                    <MapPin size={24} />
                    Location Settings
                  </h2>

                  {/* Address Preview Card */}
                  <div style={{
                    background: '#F8F9FA',
                    padding: '1.25rem',
                    borderRadius: '1rem',
                    marginBottom: '1.5rem',
                    border: '1px solid #FFE5E5',
                  }}>
                    <div style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '1rem',
                    }}>
                      <div style={{
                        background: '#FFE5E5',
                        padding: '0.75rem',
                        borderRadius: '0.75rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}>
                        <MapPin size={24} color="#FF0000" />
                      </div>
                      <div style={{ flex: 1 }}>
                        <h3 style={{
                          fontSize: '1.1rem',
                          fontWeight: '600',
                          marginBottom: '0.5rem',
                          color: '#333',
                        }}>Current Location</h3>
                        <p style={{
                          fontSize: '0.9rem',
                          color: '#666',
                          lineHeight: '1.4',
                        }}>{restaurant?.address || 'No address set'}</p>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div style={{
                    display: 'grid',
                    gap: '1rem',
                    gridTemplateColumns: '1fr',
                  }}>
                    <button
                      type="button"
                      onClick={getCurrentLocation}
                      style={{
                        background: 'white',
                        color: '#FF0000',
                        border: '2px solid #FFE5E5',
                        padding: '1rem',
                        borderRadius: '0.75rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.75rem',
                        fontSize: '1rem',
                        fontWeight: '500',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                      }}
                      disabled={loading}
                    >
                      {loading ? (
                        <>
                          <Loader2 size={20} className="animate-spin" />
                          Updating Location...
                        </>
                      ) : (
                        <>
                          <Crosshair size={20} />
                          Use Current Location
                        </>
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={() => setShowMap(true)}
                      style={{
                        background: 'white',
                        color: '#FF0000',
                        border: '2px solid #FFE5E5',
                        padding: '1rem',
                        borderRadius: '0.75rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.75rem',
                        fontSize: '1rem',
                        fontWeight: '500',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                      }}
                      disabled={loading}
                    >
                      <MapIcon size={20} />
                      Choose on Map
                    </button>

                    <button
                      type="submit"
                      style={{
                        background: 'linear-gradient(135deg, #FF0000, #FF4444)',
                        color: 'white',
                        border: 'none',
                        padding: '1rem',
                        borderRadius: '0.75rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.75rem',
                        fontSize: '1rem',
                        fontWeight: '500',
                        cursor: 'pointer',
                        transition: 'transform 0.2s ease',
                      }}
                      disabled={loading}
                    >
                      {loading ? (
                        <>
                          <Loader2 size={20} className="animate-spin" />
                          Saving Changes...
                        </>
                      ) : (
                        <>
                    <Save size={18} />
                    Save Changes
                        </>
                      )}
                    </button>
                  </div>
                </>
              ) : (
                // Full Screen Map View
                <div style={{
                  position: 'fixed',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  backgroundColor: 'white',
                  zIndex: 1000,
                }}>
                  {/* Top Bar */}
                  <div style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    padding: '1rem',
                    background: 'white',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                    zIndex: 1001,
                  }}>
                    <div style={{
                      display: 'flex',
                      gap: '0.75rem',
                      alignItems: 'center',
                    }}>
                      <button
                        type="button"
                        onClick={() => setShowMap(false)}
                        style={{
                          background: '#F8F9FA',
                          border: 'none',
                          borderRadius: '0.75rem',
                          padding: '0.75rem',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          cursor: 'pointer',
                        }}
                      >
                        <ChevronRight size={20} color="#666" style={{ transform: 'rotate(180deg)' }} />
                      </button>

                      <div style={{
                        flex: 1,
                        position: 'relative',
                      }}>
                        <input
                          type="text"
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          placeholder="Search location"
                          style={{
                            width: '100%',
                            padding: '0.75rem',
                            paddingLeft: '2.5rem',
                            border: '2px solid #FFE5E5',
                            borderRadius: '0.75rem',
                            fontSize: '1rem',
                            backgroundColor: 'white',
                          }}
                        />
                        <Search 
                          size={18} 
                          color="#666" 
                          style={{
                            position: 'absolute',
                            left: '0.75rem',
                            top: '50%',
                            transform: 'translateY(-50%)',
                          }}
                        />
                      </div>

                      <button
                        type="button"
                        onClick={searchLocation}
                        style={{
                          background: 'linear-gradient(135deg, #FF0000, #FF4444)',
                          color: 'white',
                          border: 'none',
                          borderRadius: '0.75rem',
                          padding: '0.75rem',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          cursor: 'pointer',
                        }}
                      >
                        <Search size={20} />
                      </button>
                    </div>

                    {/* Search Results */}
                    {searchResults.length > 0 && (
                      <div style={{
                        background: 'white',
                        borderRadius: '0.75rem',
                        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                        maxHeight: '200px',
                        overflowY: 'auto',
                        marginTop: '0.75rem',
                      }}>
                        {searchResults.map((result, index) => (
                          <div
                            key={index}
                            onClick={() => selectSearchResult(result)}
                            style={{
                              padding: '0.75rem 1rem',
                              cursor: 'pointer',
                              borderBottom: index !== searchResults.length - 1 ? '1px solid #FFE5E5' : 'none',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '0.75rem',
                              transition: 'background-color 0.2s ease',
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#FFE5E5'}
                            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'white'}
                          >
                            <MapPin size={16} color="#FF0000" />
                            <span style={{ fontSize: '0.9rem' }}>{result.display_name}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Map Container */}
                  <div style={{
                    position: 'absolute',
                    top: searchResults.length > 0 ? '120px' : '80px',
                    left: 0,
                    right: 0,
                    bottom: '80px',
                  }}>
                    <MapContainer
                      center={restaurant.position || [0, 0]}
                      zoom={13}
                      style={{ height: '100%', width: '100%' }}
                      ref={mapRef}
                    >
                      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                      {restaurant.position && (
                        <Marker position={restaurant.position} icon={customIcon}>
                          <Popup>
                            <div style={{
                              padding: '0.5rem',
                              textAlign: 'center',
                            }}>
                              <h3 style={{ 
                                color: '#FF0000', 
                                marginBottom: '0.25rem',
                                fontSize: '1rem',
                              }}>
                                {restaurant.name}
                              </h3>
                              <p style={{
                                fontSize: '0.875rem',
                                color: '#666',
                              }}>
                                {restaurant.address}
                              </p>
                            </div>
                          </Popup>
                        </Marker>
                      )}
                      <MapEvents />
                    </MapContainer>
                  </div>

                  {/* Bottom Action Bar */}
                  <div style={{
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    right: 0,
                    padding: '1rem',
                    background: 'white',
                    boxShadow: '0 -2px 8px rgba(0,0,0,0.1)',
                    display: 'flex',
                    gap: '1rem',
                    zIndex: 1001,
                  }}>
                    <button
                      type="button"
                      onClick={getCurrentLocation}
                      style={{
                        flex: 1,
                        background: 'white',
                        color: '#FF0000',
                        border: '2px solid #FFE5E5',
                        padding: '0.75rem',
                        borderRadius: '0.75rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.5rem',
                        fontSize: '0.9rem',
                        fontWeight: '500',
                        cursor: 'pointer',
                      }}
                    >
                      <Crosshair size={18} />
                      Current Location
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setShowMap(false);
                        onSubmit(new Event('submit'));
                      }}
                      style={{
                        flex: 1,
                        background: 'linear-gradient(135deg, #FF0000, #FF4444)',
                        color: 'white',
                        border: 'none',
                        padding: '0.75rem',
                        borderRadius: '0.75rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.5rem',
                        fontSize: '0.9rem',
                        fontWeight: '500',
                        cursor: 'pointer',
                      }}
                    >
                      <RefreshCcw size={18} />
                      Save Location
                    </button>
                  </div>
                </div>
              )}
            </div>
          </form>
        );

      case 'privacy':
        return (
          <div style={sectionStyle}>
            <h2 style={{ color: '#FF0000', marginBottom: '1.5rem' }}>Privacy Policy</h2>
            <div style={{ color: '#333', lineHeight: '1.6' }}>
              <p style={{ marginBottom: '1.5rem' }}>
                At Smart Server, we take your privacy seriously. This policy outlines how we collect, use, and protect your personal information.
              </p>

              <h3 style={{ color: '#FF0000', marginBottom: '1rem', fontSize: '1.2rem' }}>Information We Collect</h3>
              <ul style={{ marginBottom: '1.5rem', paddingLeft: '1.5rem' }}>
                <li style={{ marginBottom: '0.5rem' }}>Basic contact information (name, email, phone number and location)</li>
                <li style={{ marginBottom: '0.5rem' }}>Restaurant details and preferences</li>
                <li style={{ marginBottom: '0.5rem' }}>Order history and transaction data</li>
                <li style={{ marginBottom: '0.5rem' }}>Device information and usage statistics</li>
              </ul>

              <h3 style={{ color: '#FF0000', marginBottom: '1rem', fontSize: '1.2rem' }}>How We Use Your Information</h3>
              <ul style={{ marginBottom: '1.5rem', paddingLeft: '1.5rem' }}>
                <li style={{ marginBottom: '0.5rem' }}>Provide and improve our services</li>
                <li style={{ marginBottom: '0.5rem' }}>Process transactions and orders</li>
                <li style={{ marginBottom: '0.5rem' }}>Send important updates and notifications</li>
                <li style={{ marginBottom: '0.5rem' }}>Enhance platform security and prevent fraud</li>
              </ul>

              <h3 style={{ color: '#FF0000', marginBottom: '1rem', fontSize: '1.2rem' }}>Data Security</h3>
              <p style={{ marginBottom: '1.5rem' }}>
                We implement industry-standard security measures to protect your data. This includes encryption, secure servers, and regular security audits.
              </p>

              <h3 style={{ color: '#FF0000', marginBottom: '1rem', fontSize: '1.2rem' }}>Contact Us</h3>
              <p>For privacy-related inquiries, please contact us at:</p>
              <p style={{ marginBottom: '0.5rem' }}><strong>Email:</strong> support@smartserver.in</p>
              <p style={{ marginBottom: '1.5rem' }}><strong>Phone:</strong> +91 955 331 3334</p>

              <div style={{ 
                borderTop: '1px solid #FFE5E5', 
                paddingTop: '1.5rem', 
                marginTop: '1.5rem',
                fontSize: '0.9rem',
                color: '#666' 
              }}>
                <p>Last updated: {new Date().toLocaleDateString()}</p>
              </div>
            </div>
          </div>
        );

      case 'refund':
        return (
          <div style={sectionStyle}>
            <h2 style={{ color: '#FF0000', marginBottom: '1.5rem' }}>Refund Policy</h2>
            <div style={{ color: '#333', lineHeight: '1.6' }}>
              <p style={{ marginBottom: '1.5rem' }}>
                Smart Server is committed to ensuring customer satisfaction. This policy outlines our refund procedures for our services.
              </p>

              <h3 style={{ color: '#FF0000', marginBottom: '1rem', fontSize: '1.2rem' }}>Subscription Refunds</h3>
              <p style={{ marginBottom: '1.5rem' }}>
                We offer a 7-day money-back guarantee on new subscriptions. Refund requests must be submitted within 7 days of the initial purchase.
              </p>

              <h3 style={{ color: '#FF0000', marginBottom: '1rem', fontSize: '1.2rem' }}>Eligible Refunds</h3>
              <ul style={{ marginBottom: '1.5rem', paddingLeft: '1.5rem' }}>
                <li style={{ marginBottom: '0.5rem' }}>Service unavailability due to technical issues</li>
                <li style={{ marginBottom: '0.5rem' }}>Incorrect subscription charges</li>
                <li style={{ marginBottom: '0.5rem' }}>Duplicate transactions</li>
              </ul>

              <h3 style={{ color: '#FF0000', marginBottom: '1rem', fontSize: '1.2rem' }}>Refund Process</h3>
              <ol style={{ marginBottom: '1.5rem', paddingLeft: '1.5rem' }}>
                <li style={{ marginBottom: '0.5rem' }}>Submit a refund request via email</li>
                <li style={{ marginBottom: '0.5rem' }}>Include order details and reason for refund</li>
                <li style={{ marginBottom: '0.5rem' }}>Receive confirmation within 48 hours</li>
                <li style={{ marginBottom: '0.5rem' }}>Refund processed within 5-7 business days</li>
              </ol>

              <h3 style={{ color: '#FF0000', marginBottom: '1rem', fontSize: '1.2rem' }}>Contact Information</h3>
              <p style={{ marginBottom: '0.5rem' }}><strong>Email:</strong> support@smartserver.in</p>
              <p style={{ marginBottom: '1.5rem' }}><strong>Phone:</strong> +91 955 331 3334</p>

              <div style={{ 
                borderTop: '1px solid #FFE5E5', 
                paddingTop: '1.5rem', 
                marginTop: '1.5rem',
                fontSize: '0.9rem',
                color: '#666' 
              }}>
                <p>Last updated: {new Date().toLocaleDateString()}</p>
              </div>
            </div>
          </div>
        );

      case 'terms':
        return (
          <div style={sectionStyle}>
            <h2 style={{ color: '#FF0000', marginBottom: '1.5rem' }}>Terms & Conditions</h2>
            <div style={{ color: '#333', lineHeight: '1.6' }}>
              <p style={{ marginBottom: '1.5rem' }}>
                By using Smart Server's platform and services, you agree to comply with and be bound by the following terms and conditions.
              </p>

              <h3 style={{ color: '#FF0000', marginBottom: '1rem', fontSize: '1.2rem' }}>Service Usage</h3>
              <ul style={{ marginBottom: '1.5rem', paddingLeft: '1.5rem' }}>
                <li style={{ marginBottom: '0.5rem' }}>Users must be 18 years or older</li>
                <li style={{ marginBottom: '0.5rem' }}>Accurate information must be provided during registration</li>
                <li style={{ marginBottom: '0.5rem' }}>Account credentials must not be shared</li>
                <li style={{ marginBottom: '0.5rem' }}>Platform must be used in compliance with local laws</li>
              </ul>

              <h3 style={{ color: '#FF0000', marginBottom: '1rem', fontSize: '1.2rem' }}>Subscription Terms</h3>
              <ul style={{ marginBottom: '1.5rem', paddingLeft: '1.5rem' }}>
                <li style={{ marginBottom: '0.5rem' }}>Subscription fees are billed in advance</li>
                <li style={{ marginBottom: '0.5rem' }}>Automatic renewal unless cancelled</li>
                <li style={{ marginBottom: '0.5rem' }}>30-day notice required for cancellation</li>
              </ul>

              <h3 style={{ color: '#FF0000', marginBottom: '1rem', fontSize: '1.2rem' }}>Intellectual Property</h3>
              <p style={{ marginBottom: '1.5rem' }}>
                All content, features, and functionality are owned by Smart Server and protected by international copyright laws.
              </p>

              <h3 style={{ color: '#FF0000', marginBottom: '1rem', fontSize: '1.2rem' }}>Limitation of Liability</h3>
              <p style={{ marginBottom: '1.5rem' }}>
                Smart Server shall not be liable for any indirect, incidental, special, consequential, or punitive damages resulting from your use of the service.
              </p>

              <h3 style={{ color: '#FF0000', marginBottom: '1rem', fontSize: '1.2rem' }}>Contact Information</h3>
              <p style={{ marginBottom: '0.5rem' }}><strong>Email:</strong> support@smartserver.in</p>
              <p style={{ marginBottom: '1.5rem' }}><strong>Phone:</strong> +91 955 331 3334</p>

              <div style={{ 
                borderTop: '1px solid #FFE5E5', 
                paddingTop: '1.5rem', 
                marginTop: '1.5rem',
                fontSize: '0.9rem',
                color: '#666' 
              }}>
                <p>Last updated: {new Date().toLocaleDateString()}</p>
              </div>
            </div>
          </div>
        );

      case 'about':
        return (
          <div style={sectionStyle}>
            <h2 style={{ color: '#FF0000', marginBottom: '1.5rem' }}>About Us</h2>
            <div style={{ color: '#333', lineHeight: '1.6' }}>
              <p style={{ marginBottom: '1.5rem' }}>
                Smart Server is a cutting-edge digital restaurant management platform that transforms traditional dining experiences through innovative technology solutions. As industry leaders in restaurant digitization, we specialize in providing seamless QR-based ordering systems that enhance both customer satisfaction and operational efficiency.
              </p>

              <h3 style={{ color: '#FF0000', marginBottom: '1rem', fontSize: '1.2rem' }}>Our Mission</h3>
              <p style={{ marginBottom: '1.5rem' }}>
                We are dedicated to revolutionizing the restaurant industry by providing state-of-the-art digital solutions that streamline operations, reduce wait times, and create exceptional dining experiences. Our platform empowers restaurants to embrace digital transformation while maintaining their unique identity and service quality.
              </p>

              <h3 style={{ color: '#FF0000', marginBottom: '1rem', fontSize: '1.2rem' }}>Key Features</h3>
              <ul style={{ marginBottom: '1.5rem', paddingLeft: '1.5rem' }}>
                <li style={{ marginBottom: '0.5rem' }}>Dynamic QR-based digital menu system</li>
                <li style={{ marginBottom: '0.5rem' }}>Real-time order management</li>
                <li style={{ marginBottom: '0.5rem' }}>Seamless payment integration</li>
                <li style={{ marginBottom: '0.5rem' }}>Comprehensive analytics and reporting</li>
                <li style={{ marginBottom: '0.5rem' }}>Custom branding solutions</li>
              </ul>

              <h3 style={{ color: '#FF0000', marginBottom: '1rem', fontSize: '1.2rem' }}>Contact Information</h3>
              <p style={{ marginBottom: '0.5rem' }}>
                <strong>Customer Support:</strong> +91 955 331 3334
              </p>
              <p style={{ marginBottom: '1.5rem' }}>
                <strong>Email:</strong> support@smartserver.in
              </p>

              <div style={{ 
                borderTop: '1px solid #FFE5E5', 
                paddingTop: '1.5rem', 
                marginTop: '1.5rem',
                fontSize: '0.9rem',
                color: '#666' 
              }}>
                <p>
                  © {new Date().getFullYear()} Smart Server. All rights reserved.
                </p>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  // Add useEffect to handle browser back button
  useEffect(() => {
    const handlePopState = () => {
      setActiveSection(null);
    };

    window.addEventListener('popstate', handlePopState);

    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, []);

  // Modify the section selection to add to browser history
  const handleSectionClick = (section) => {
    setActiveSection(section);
    window.history.pushState({ section }, '');
  };

  return (
    <div style={containerStyle}>
      {loading && <RestaurantLoader />}
      {restaurant ? (
        <>
          {!activeSection && (
            <div style={{ backgroundColor: '#fff' }}>
              <div style={profileHeaderStyle}>
                {/* Logo Section */}
                <div style={logoContainerStyle}>
                  <div
                    style={logoStyle}
                    onClick={() => fileInputRef.current?.click()}
                  >
                    {restaurant?.logo ? (
                      <img
                        src={restaurant.logo}
                        alt={restaurant.name}
                        style={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover',
                        }}
                      />
                    ) : (
                      <div style={{
                        width: '100%',
                        height: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.5rem',
                      }}>
                        <Camera size={24} color="#666" />
                        <span style={{
                          fontSize: '0.75rem',
                          color: '#666',
                          textAlign: 'center',
                        }}>
                          Add Logo
                        </span>
                      </div>
                    )}
                    
                    {/* Edit Badge */}
                    <div style={{
                      position: 'absolute',
                      bottom: '8px',
                      right: '8px',
                      backgroundColor: 'rgba(0, 0, 0, 0.75)',
                      color: 'white',
                      width: '28px',
                      height: '28px',
                      borderRadius: '8px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}>
                      <Camera size={14} />
                    </div>
                  </div>
                </div>

                {/* Restaurant Info */}
                <div style={{
                  textAlign: 'center',
                  marginBottom: '1rem',
                }}>
                  <h1 style={{
                    fontSize: '1.25rem',
                    fontWeight: '600',
                    color: '#1a1a1a',
                    marginBottom: '0.25rem',
                  }}>
                    {restaurant?.name}
                  </h1>
                  <p style={{
                    fontSize: '0.875rem',
                    color: '#666',
                  }}>
                    {restaurant?.email}
                  </p>
                </div>

                {/* Update Logo Button */}
                {restaurant?.logo && (
                  <button
                    onClick={handleLogoSave}
                    disabled={loading}
                    style={{
                      backgroundColor: 'transparent',
                      color: '#FF0000',
                      border: '1px solid #FF0000',
                      padding: '0.5rem 1rem',
                      borderRadius: '8px',
                      fontSize: '0.875rem',
                      fontWeight: '500',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      cursor: loading ? 'not-allowed' : 'pointer',
                      opacity: loading ? 0.7 : 1,
                      transition: 'all 0.2s ease',
                      '&:hover': {
                        backgroundColor: 'rgba(255, 0, 0, 0.05)',
                      },
                    }}
                  >
                    {loading ? (
                      <>
                        <Loader2 size={16} className="animate-spin" />
                        <span>Updating...</span>
                      </>
                    ) : (
                      <>
                        <RefreshCcw size={16} />
                        <span>Update Logo</span>
                      </>
                    )}
                  </button>
                )}

                {/* Hidden File Input */}
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleLogoChange}
                  accept="image/*"
                  style={{ display: 'none' }}
                />
              </div>

              {/* Rest of your profile content */}
              {/* ... */}
            </div>
          )}

          {activeSection ? (
            <div>
              <div style={backButtonContainerStyle}>
                <button
                  onClick={() => handleSectionClick(null)}
                  style={backButtonStyle}
                >
                  <ChevronLeft size={24} />
                  <span>Back</span>
                </button>
                <h2 style={sectionTitleStyle}>
                  {getSectionTitle(activeSection)}
                </h2>
              </div>
              <div style={{ padding: '0rem' }}>
                {renderSection()}
              </div>
            </div>
          ) : (
            /* Profile menu cards */
            <div>
              <ProfileCard 
                title="Basic Information" 
                icon={Settings2} 
                onClick={() => handleSectionClick('basic')} 
              />
              <ProfileCard 
                title="Location Settings" 
                icon={MapPin} 
                onClick={() => handleSectionClick('location')} 
              />
              <ProfileCard 
                title="Privacy Policy" 
                icon={Shield} 
                onClick={() => handleSectionClick('privacy')} 
              />
              <ProfileCard 
                title="Refund Policy" 
                icon={RefreshCcw} 
                onClick={() => handleSectionClick('refund')} 
              />
              <ProfileCard 
                title="Terms & Conditions" 
                icon={Settings} 
                onClick={() => handleSectionClick('terms')} 
              />
              <ProfileCard 
                title="About Us" 
                icon={Info} 
                onClick={() => handleSectionClick('about')} 
              />
            </div>
          )}
          
          {!activeSection && (
            <div style={{
              textAlign: 'center',
              padding: '2rem',
              marginTop: '2rem',
              background: 'linear-gradient(135deg, #FFF5F5 0%, #FFFFFF 100%)',
              borderRadius: '1rem',
              boxShadow: '0 4px 6px rgba(255, 0, 0, 0.1)',
            }}>
              <div style={{
                width: '100px',
                height: '100px',
                margin: '0 auto 1.5rem',
                position: 'relative',
              }}>
                <div style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  background: 'linear-gradient(45deg, #FF0000 0%, #FF6B6B 100%)',
                  borderRadius: '1rem',
                  transform: 'rotate(45deg)',
                  opacity: 0.1,
                }} />
                <div style={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                }}>
                  <Package size={48} color="#FF0000" />
                </div>
              </div>

              <h3 style={{
                color: '#FF0000',
                marginBottom: '0.75rem',
                fontSize: '1.5rem',
                fontWeight: 'bold',
              }}>
                Smart Server
              </h3>

              <div style={{
                display: 'inline-block',
                padding: '0.5rem 1rem',
                backgroundColor: '#FFF',
                borderRadius: '2rem',
                boxShadow: '0 2px 4px rgba(255, 0, 0, 0.1)',
                marginBottom: '1rem',
              }}>
                <span style={{
                  color: '#FF0000',
                  fontWeight: 'bold',
                }}>
                  v{versionInfo.version}
                </span>
              </div>

              <div style={{
                fontSize: '0.9rem',
                color: '#666',
                marginBottom: '0.5rem',
              }}>
                Build {versionInfo.buildNumber}
              </div>

              <div style={{
                marginTop: '1.5rem',
                padding: '1rem',
                borderTop: '1px solid rgba(255, 0, 0, 0.1)',
                fontSize: '0.8rem',
                color: '#999',
              }}>
                © {new Date().getFullYear()} Smart Server
                <br />
                All rights reserved.
              </div>
            </div>
          )}
        </>
      ) : (
        <div style={{ textAlign: 'center', color: '#FF0000' }}>
          <h2>No restaurant data found for this organization.</h2>
          <p>Please check your login or contact support.</p>
        </div>
      )}
      <style jsx>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        input:focus, textarea:focus, select:focus {
          outline: none;
          border-color: #FF0000;
        }
        button:hover {
          background-color: #E60000;
        }
      `}</style>
    </div>
  );
};

export default RestaurantManagement;
