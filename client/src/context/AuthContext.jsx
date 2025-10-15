import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from '../api/axios';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const clearError = () => setError(null);

  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const response = await axios.get('/auth/user');
        setUser(response.data);
        setError(null);
      } catch (err) {
        console.error('Token verification failed:', err);
        localStorage.removeItem('token');
        setError('Session expired. Please login again.');
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  const validateInput = (data, isRegister = false) => {
    if (isRegister && !data.name) {
      throw new Error('Name is required');
    }
    if (!data.email) {
      throw new Error('Email is required');
    }
    if (!data.password) {
      throw new Error('Password is required');
    }
    if (!data.email.includes('@')) {
      throw new Error('Please enter a valid email address');
    }
    if (data.password.length < 6) {
      throw new Error('Password must be at least 6 characters long');
    }
  };

  const login = async (email, password) => {
    try {
      clearError();
      validateInput({ email, password });

      const response = await axios.post('/auth/login', { email, password });
      const { token, user } = response.data;
      
      localStorage.setItem('token', token);
      setUser(user);
      return user;
    } catch (err) {
      console.error('Login error:', err);
      const errorMessage = err.response?.data?.msg || err.message || 'Login failed';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const register = async (name, email, password, role = 'user') => {
    try {
      clearError();
      validateInput({ name, email, password }, true);

      const response = await axios.post('/auth/register', {
        name,
        email,
        password,
        role
      });
      
      const { token, user } = response.data;
      localStorage.setItem('token', token);
      setUser(user);
      return user;
    } catch (err) {
      console.error('Registration error:', err);
      const errorMessage = err.response?.data?.msg || err.message || 'Registration failed';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const logout = () => {
    try {
      localStorage.removeItem('token');
      setUser(null);
      setError(null);
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  // Update user profile
  const updateProfile = async (data) => {
    try {
      clearError();
      const response = await axios.put('/auth/profile', data);
      setUser(response.data);
      return response.data;
    } catch (err) {
      console.error('Profile update error:', err);
      const errorMessage = err.response?.data?.msg || err.message || 'Profile update failed';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, loading, error, clearError, updateProfile }}>
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

export default AuthContext;
