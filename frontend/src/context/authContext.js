import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

const AuthProvider = ({ children }) => {
  const [authState, setAuthState] = useState({
    token: localStorage.getItem('token'),
    isAuthenticated: null,
    user: null,
    loading: true
  });

  const setAuthToken = (token) => {
    if (token) {
      axios.defaults.headers.common['x-auth-token'] = token;
      localStorage.setItem('token', token);
    } else {
      delete axios.defaults.headers.common['x-auth-token'];
      localStorage.removeItem('token');
    }
  };

  const loadUser = async () => {
    if (localStorage.token) {
      setAuthToken(localStorage.token);
    }

    try {
      const res = await axios.get('/api/v1/auth/user');
      setAuthState({
        token: localStorage.token,
        isAuthenticated: true,
        user: res.data,
        loading: false
      });
    } catch (err) {
      setAuthState({
        token: null,
        isAuthenticated: false,
        user: null,
        loading: false
      });
    }
  };

  useEffect(() => {
    loadUser();
  }, []);

  const register = async (formData) => {
    try {
      const res = await axios.post('/api/v1/auth/register', formData);
      setAuthToken(res.data.token);
      await loadUser();
      return { success: true };
    } catch (err) {
      return { success: false, message: err.response.data.message };
    }
  };

  const login = async (formData) => {
    try {
      const res = await axios.post('/api/v1/auth/login', formData);
      setAuthToken(res.data.token);
      await loadUser();
      return { success: true };
    } catch (err) {
      return { success: false, message: err.response.data.message };
    }
  };

  const logout = () => {
    setAuthToken(null);
    setAuthState({
      token: null,
      isAuthenticated: false,
      user: null,
      loading: false
    });
  };

  return (
    <AuthContext.Provider
      value={{
        authState,
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

export { AuthContext, AuthProvider };