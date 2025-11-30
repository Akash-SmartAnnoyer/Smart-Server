import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(() => localStorage.getItem('token'));
  const [user, setUser] = useState(null);
  const [status, setStatus] = useState(token ? 'loading' : 'ready');
  const [guestOrgId, setGuestOrgIdState] = useState(
    () => localStorage.getItem('orgId') || null
  );

  const bootstrapUser = useCallback(async () => {
    if (!token) {
      setUser(null);
      setStatus('ready');
      return;
    }

    setStatus('loading');
    try {
      const response = await api.getCurrentUser();
      setUser(response.user || response);
    } catch (error) {
      console.error('Failed to verify current session:', error);
      // Only clear session if token is invalid (401/403), not on network errors
      if (error.message && (error.message.includes('401') || error.message.includes('403') || error.message.includes('Invalid token'))) {
        localStorage.removeItem('token');
        setToken(null);
        setUser(null);
      }
    } finally {
      setStatus('ready');
    }
  }, [token]);

  useEffect(() => {
    // Only bootstrap if we have a token but no user
    // If user is already set (from login), skip bootstrap
    if (token && !user) {
      bootstrapUser();
    }
  }, [token, user, bootstrapUser]);

  const setSession = useCallback(({ token: nextToken, user: nextUser }) => {
    if (nextToken) {
      localStorage.setItem('token', nextToken);
      setToken(nextToken);
    }
    if (nextUser) {
      setUser(nextUser);
      // Store orgId in localStorage if available
      if (nextUser.orgId) {
        localStorage.setItem('orgId', nextUser.orgId);
        setGuestOrgIdState(nextUser.orgId);
      }
      setStatus('ready'); // Set status to ready when user is provided directly from login
      // Don't trigger bootstrapUser when user is provided directly
      return;
    }
    // If only token is provided, trigger bootstrapUser to fetch user
    if (nextToken && !nextUser) {
      // bootstrapUser will be triggered by the token change in useEffect
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
    setGuestOrgIdState(null);
    localStorage.removeItem('orgId');
  }, []);

  const setGuestOrgId = useCallback((orgId) => {
    if (orgId) {
      localStorage.setItem('orgId', orgId);
    } else {
      localStorage.removeItem('orgId');
    }
    setGuestOrgIdState(orgId || null);
  }, []);

  const orgId = user?.orgId || guestOrgId || null;
  const authenticatedRole = user?.role || null;

  return (
    <AuthContext.Provider
      value={{
        token,
        user,
        role: authenticatedRole,
        orgId,
        status,
        isAuthenticated: Boolean(user),
        setSession,
        logout,
        refreshUser: bootstrapUser,
        setGuestOrgId,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};


