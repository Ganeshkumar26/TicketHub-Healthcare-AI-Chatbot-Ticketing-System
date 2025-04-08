import React, { createContext, useState, useEffect } from 'react';
import jwt_decode from 'jwt-decode';
import api from '../utils/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Set auth token in localStorage
  const setAuthToken = (token) => {
    if (token) {
      localStorage.setItem('token', token);
    } else {
      localStorage.removeItem('token');
    }
  };

  // Load user from token
  const loadUser = async () => {
    if (token) {
      setAuthToken(token);
      try {
        const res = await api.get('/auth/me');
        setUser(res.data);
        setIsAuthenticated(true);
      } catch (err) {
        console.error('Error loading user:', err.response?.data || err.message);
        setToken(null);
        setUser(null);
        setIsAuthenticated(false);
        setAuthToken(null);
      }
    }
    setLoading(false);
  };

  // Register user
  const register = async (formData) => {
    try {
      setLoading(true);
      setError(null);
      console.log('Sending registration data:', formData);
      const res = await api.post('/auth/register', formData);
      console.log('Registration response:', res.data);
      setToken(res.data.token);
      setAuthToken(res.data.token);
      await loadUser();
      return true;
    } catch (err) {
      console.error('Registration error:', err);
      if (err.response) {
        console.error('Error response:', err.response.data);
        setError(err.response.data.msg || 'Registration failed');
      } else if (err.request) {
        console.error('Error request:', err.request);
        // Check if the error is related to MongoDB connection
        if (err.message && err.message.includes('ECONNREFUSED')) {
          setError('Database connection error. Please make sure MongoDB is installed and running.');
        } else {
          setError('Network error. Please check if the server is running.');
        }
      } else {
        console.error('Error message:', err.message);
        setError('Registration failed: ' + err.message);
      }
      setLoading(false);
      return false;
    }
  };

  // Login user
  const login = async (formData) => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.post('/auth/login', formData);
      setToken(res.data.token);
      setAuthToken(res.data.token);
      await loadUser();
      return true;
    } catch (err) {
      setError(err.response?.data?.msg || 'Login failed');
      setLoading(false);
      return false;
    }
  };

  // Logout user
  const logout = () => {
    setToken(null);
    setUser(null);
    setIsAuthenticated(false);
    setAuthToken(null);
  };

  // Check if token is expired
  const isTokenExpired = (token) => {
    try {
      const decoded = jwt_decode(token);
      return decoded.exp < Date.now() / 1000;
    } catch (err) {
      return true;
    }
  };

  // Initialize auth state
  useEffect(() => {
    if (token && !isTokenExpired(token)) {
      loadUser();
    } else {
      setToken(null);
      setUser(null);
      setIsAuthenticated(false);
      setAuthToken(null);
      setLoading(false);
    }
  }, []);

  return (
    <AuthContext.Provider
      value={{
        token,
        isAuthenticated,
        loading,
        user,
        error,
        register,
        login,
        logout,
        loadUser
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;