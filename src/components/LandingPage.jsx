import React, { useState, useEffect } from 'react';
import { useNavigate, Route, Routes } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import FoodLoader from './FoodLoader';
import './landing-page.css';
import QREntry from './QREntry ';
import api from '../services/api';
import { useAuth } from '../contexts/AuthContext';

const LandingPage = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();
    const { user, setSession, status } = useAuth();

    useEffect(() => {
        if (!user?.role) return;
        if (user.role === 'super_admin') {
            navigate('/super-admin');
        } else if (['org_admin', 'admin', 'captain'].includes(user.role)) {
            navigate('/admin');
        }
    }, [user, navigate]);

    const handleLogin = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        try {
            let response = null;
            let loginSuccess = false;

            // Try Super Admin login first
            try {
                response = await api.superAdminLogin(username, password);
                if (response && response.token) {
                    loginSuccess = true;
                }
            } catch (err) {
                // Not super admin, continue to other login types
            }

            // If not super admin, try Organization Admin
            if (!loginSuccess) {
                try {
                    response = await api.orgAdminLogin(username, password);
                    if (response && response.token) {
                        loginSuccess = true;
                    }
                } catch (err) {
                    // Not org admin, continue
                }
            }

            // If still not successful, try Staff login
            if (!loginSuccess) {
                try {
                    response = await api.staffLogin(username, password);
                    if (response && response.token) {
                        loginSuccess = true;
                    }
                } catch (err) {
                    // Not staff either
                }
            }

            if (!loginSuccess || !response) {
                setError('Invalid credentials. Please check your username and password.');
                setIsLoading(false);
                return;
            }

            // Store authentication data
            setSession({ token: response.token, user: response.user });
            
            // Navigate based on role
            if (response.user.role === 'super_admin') {
                navigate('/super-admin');
            } else if (response.user.role === 'org_admin' || response.user.role === 'admin' || response.user.role === 'captain') {
                navigate('/admin');
            } else {
                navigate('/home');
            }
        } catch (error) {
            setError(error.message || 'Invalid credentials. Please try again.');
            console.error('Login error:', error);   
        } finally {
            setIsLoading(false);
        }
    };

    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

    return (
        <Routes>
            <Route path="/" element={
                <div className="landing-container">
                    <img
                        src={process.env.PUBLIC_URL + '/assets/logo-transparent-png - Copy.png'}
                        alt="Logo"
                        className="logo"
                    />

                    <div className="login-container">
                        <h1 className="login-title">Welcome to Smart Server</h1>

                        <form onSubmit={handleLogin}>
                            <div className="input-group">
                                <input
                                    type="text"
                                    className="input-field"
                                    placeholder="Username"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    required
                                    autoFocus
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
                            <button type="submit" className="btn" disabled={isLoading}>
                                {isLoading ? 'Logging in...' : 'Login'}
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
            } />
                <Route path="/qr-entry/:orgId/:tableNumber" element={<QREntry />} />
        </Routes>
    );
};

export default LandingPage;
