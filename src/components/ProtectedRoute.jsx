import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import FoodLoader from './FoodLoader';

const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const { isAuthenticated, role, status } = useAuth();

  if (status === 'loading') {
    return (
      <div style={{ minHeight: '50vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <FoodLoader />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  if (allowedRoles.length > 0 && (!role || !allowedRoles.includes(role))) {
    if (role === 'super_admin') {
      return <Navigate to="/super-admin" replace />;
    }
    return <Navigate to="/admin" replace />;
  }

  return children;
};

export default ProtectedRoute;

