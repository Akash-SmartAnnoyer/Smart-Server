import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Card, Typography, Progress, Alert } from 'antd';
import { 
  Utensils, Coffee, Pizza, Beer, MapPin, 
  AlertTriangle, Bell, GlassWater 
} from 'lucide-react';

const { Title, Text } = Typography;
const API_URL = 'http://localhost:5000/api';

const QREntry = () => {
    const { orgId, tableNumber } = useParams();
    const [restaurant, setRestaurant] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [progress, setProgress] = useState(0);
    const [locationVerified, setLocationVerified] = useState(false);
    const [locationError, setLocationError] = useState(null);

    const MAX_DISTANCE_KM = 0.5; // Maximum allowed distance in kilometers

    // Function to calculate distance between two points using Haversine formula
    const calculateDistance = (lat1, lon1, lat2, lon2) => {
        const R = 6371; // Earth's radius in kilometers
        const dLat = (lat2 - lat1) * Math.PI / 180;
        const dLon = (lon2 - lon1) * Math.PI / 180;
        const a = 
            Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
            Math.sin(dLon/2) * Math.sin(dLon/2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
        return R * c;
    };

    // Function to verify user's location
    const verifyLocation = async (restaurantData) => {
        try {
            const position = await new Promise((resolve, reject) => {
                navigator.geolocation.getCurrentPosition(resolve, reject, {
                    enableHighAccuracy: true,
                    timeout: 5000,
                    maximumAge: 0
                });
            });

            const userLat = position.coords.latitude;
            const userLon = position.coords.longitude;
            
            // Get position from restaurant data
            const [restaurantLat, restaurantLon] = restaurantData.position;

            const distance = calculateDistance(
                userLat, userLon,
                restaurantLat, restaurantLon
            );

            if (distance <= MAX_DISTANCE_KM) {
                setLocationVerified(true);
                return true;
            } else {
                setLocationError(`You appear to be ${distance.toFixed(2)}km away from ${restaurantData.name}. Please visit the restaurant to place an order.`);
                return false;
            }
        } catch (err) {
            setLocationError("Unable to verify your location. Please enable location services and try again.");
            return false;
        }
    };

    useEffect(() => {
        const fetchRestaurantData = async () => {
            try {
                const progressInterval = setInterval(() => {
                    setProgress(prev => (prev < 90 ? prev + 10 : prev));
                }, 200);

                // Updated to use PostgreSQL API endpoint
                const response = await fetch(`${API_URL}/restaurants/org/${orgId}`);
                if (!response.ok) throw new Error('Failed to fetch restaurant data');

                const restaurantData = await response.json();
                
                clearInterval(progressInterval);
                setProgress(100);

                if (restaurantData) {
                    setRestaurant(restaurantData);
                    
                    // Verify location before proceeding
                    const isLocationVerified = await verifyLocation(restaurantData);
                    
                    if (isLocationVerified) {
                        localStorage.setItem('role', 'customer');
                        localStorage.setItem('orgId', orgId);
                        localStorage.setItem('tableNumber', tableNumber);

                        setTimeout(() => {
                            sessionStorage.setItem('justSetOrgIdAndTable', 'true');
                            window.location.href = '/home';
                        }, 1500);
                    }
                } else {
                    throw new Error('Restaurant not found');
                }
            } catch (err) {
                console.error('Error fetching restaurant data:', err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        if (orgId && tableNumber) {
            fetchRestaurantData();
        } else {
            setError('No orgId or tableNumber provided');
            setLoading(false);
        }
    }, [orgId, tableNumber]);

    // Rest of your component code remains the same...
};

export default QREntry;