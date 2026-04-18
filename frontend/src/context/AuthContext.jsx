import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const userInfo = sessionStorage.getItem('userInfo');
    if (userInfo) {
       const parsedUser = JSON.parse(userInfo);
       axios.defaults.headers.common['Authorization'] = `Bearer ${parsedUser.token}`;
       return parsedUser;
    }
    return null;
  });
  const [loading, setLoading] = useState(false);

  const login = (userData) => {
    sessionStorage.setItem('userInfo', JSON.stringify(userData));
    setUser(userData);
    
    // Set axios auth header
    axios.defaults.headers.common['Authorization'] = `Bearer ${userData.token}`;
  };

  const logout = () => {
    sessionStorage.removeItem('userInfo');
    setUser(null);
    delete axios.defaults.headers.common['Authorization'];
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};
