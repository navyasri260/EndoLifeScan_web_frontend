import React, { createContext, useState, useEffect } from 'react';
import api from '../services/api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is stored in local storage
    const storedUser = localStorage.getItem('endoman_user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    try {
      const cleanEmail = email.trim().toLowerCase();
      const response = await api.post('/login', { email: cleanEmail, password });
      if (response.data.status === 'success') {
        setUser(response.data.user);
        localStorage.setItem('endoman_user', JSON.stringify(response.data.user));
        return { success: true };
      }
      return { success: false, message: response.data.message };
    } catch (error) {
      if (!error.response) {
        return { success: false, message: 'Network error. Is the Python backend server running?' };
      }
      return { 
        success: false, 
        message: error.response?.data?.message || 'Login failed. Please check your credentials.' 
      };
    }
  };

  const signup = async (fullName, email, password) => {
    try {
      const cleanEmail = email.trim().toLowerCase();
      const response = await api.post('/signup', { full_name: fullName, email: cleanEmail, password });
      if (response.data.status === 'success') {
        // After signup, we log them in automatically or just return success
        return { success: true };
      }
      return { success: false, message: response.data.message };
    } catch (error) {
      if (!error.response) {
        return { success: false, message: 'Network error. Is the Python backend server running?' };
      }
      return {
        success: false,
        message: error.response?.data?.message || 'Signup failed. Please try again.'
      };
    }
  }

  const logout = () => {
    setUser(null);
    localStorage.removeItem('endoman_user');
  };

  return (
    <AuthContext.Provider value={{ user, login, signup, logout, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
