import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authApi } from '../api/authApi';
import { useToast } from './ToastContext';

const AuthContext = createContext(null);

// Safely parse JWT token payload
const parseJwt = (token) => {
  try {
    const base64Url = token.split('.')[1];
    if (!base64Url) return null;
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch {
    return null;
  }
};

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(() => localStorage.getItem('cinepass_token'));
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('cinepass_user');
      const parsed = saved ? JSON.parse(saved) : null;
      const savedToken = localStorage.getItem('cinepass_token');
      if (savedToken && parsed) {
        const decoded = parseJwt(savedToken);
        const tokenRole = decoded?.role || (Array.isArray(decoded?.roles) ? decoded.roles[0] : null);
        if (tokenRole && parsed.role !== tokenRole) {
          parsed.role = tokenRole;
        }
      }
      return parsed;
    } catch {
      return null;
    }
  });
  const [loading, setLoading] = useState(false);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);

  const { success, error: toastError, info } = useToast();

  const logout = useCallback(() => {
    localStorage.removeItem('cinepass_token');
    localStorage.removeItem('cinepass_user');
    setToken(null);
    setUser(null);
  }, []);

  // Listen for unauthorized 401 events from Axios interceptor
  useEffect(() => {
    const handleUnauthorized = () => {
      logout();
      info('Your session has expired. Please sign in again.');
      setIsLoginOpen(true);
    };

    window.addEventListener('cinepass:unauthorized', handleUnauthorized);
    return () => window.removeEventListener('cinepass:unauthorized', handleUnauthorized);
  }, [logout, info]);

  const login = async (email, password) => {
    setLoading(true);
    try {
      const data = await authApi.login({ email, password });
      const authToken = data.token;
      const decoded = parseJwt(authToken);
      const tokenRole = data.role || decoded?.role || (Array.isArray(decoded?.roles) ? decoded.roles[0] : 'ROLE_USER');

      let userData = {
        id: data.userId,
        email: data.email,
        name: data.email.split('@')[0],
        role: tokenRole,
      };

      // Attempt to load full user profile for display name and role
      try {
        localStorage.setItem('cinepass_token', authToken);
        const profile = await authApi.getMyProfile();
        if (profile) {
          if (profile.name) userData.name = profile.name;
          if (profile.role) userData.role = profile.role;
          if (profile.phone) userData.phone = profile.phone;
        }
      } catch (profileErr) {
        console.warn('Could not load detailed profile, using basic info', profileErr);
      }

      localStorage.setItem('cinepass_token', authToken);
      localStorage.setItem('cinepass_user', JSON.stringify(userData));
      setToken(authToken);
      setUser(userData);
      setIsLoginOpen(false);
      success(`Welcome back, ${userData.name}!`);
      return userData;
    } catch (err) {
      toastError(err.message || 'Login failed. Please check your credentials.');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const register = async (name, email, password) => {
    setLoading(true);
    try {
      await authApi.register({ name, email, password });
      success('Account created successfully! Logging you in...');
      // Automatically log in newly created user
      return await login(email, password);
    } catch (err) {
      toastError(err.message || 'Registration failed. Please try again.');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const openLogin = () => {
    setIsRegisterOpen(false);
    setIsLoginOpen(true);
  };

  const openRegister = () => {
    setIsLoginOpen(false);
    setIsRegisterOpen(true);
  };

  const closeAuthModals = () => {
    setIsLoginOpen(false);
    setIsRegisterOpen(false);
  };

  const updateUser = useCallback((updatedData) => {
    setUser((prev) => {
      const merged = { ...prev, ...updatedData };
      localStorage.setItem('cinepass_user', JSON.stringify(merged));
      return merged;
    });
  }, []);

  return (
    <AuthContext.Provider
      value={{
        token,
        user,
        role: user?.role || 'ROLE_USER',
        isAdmin: user?.role === 'ROLE_ADMIN',
        isAuthenticated: !!token && !!user,
        loading,
        login,
        register,
        logout,
        updateUser,
        isLoginOpen,
        isRegisterOpen,
        openLogin,
        openRegister,
        closeAuthModals,
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

