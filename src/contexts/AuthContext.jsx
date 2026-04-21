import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';

const AuthContext = createContext(undefined);

export const AuthProvider = ({ children }) => {
  const [customer, setCustomer] = useState(null);
  const [token, setToken] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const storedCustomer = window.localStorage.getItem('supplychain_customer');
    const storedToken = window.localStorage.getItem('supplychain_token');
    const storedAdmin = window.localStorage.getItem('supplychain_isAdmin');
    if (storedCustomer && storedToken) {
      setCustomer(JSON.parse(storedCustomer));
      setToken(storedToken);
      setIsAdmin(storedAdmin === 'true');
    }
  }, []);

  const login = (customerData, authToken) => {
    setCustomer(customerData);
    setToken(authToken);
    const admin = customerData.email.toLowerCase().includes('@admin');
    setIsAdmin(admin);
    window.localStorage.setItem('supplychain_customer', JSON.stringify(customerData));
    window.localStorage.setItem('supplychain_token', authToken);
    window.localStorage.setItem('supplychain_isAdmin', String(admin));
  };

  const logout = () => {
    setCustomer(null);
    setToken(null);
    setIsAdmin(false);
    window.localStorage.removeItem('supplychain_customer');
    window.localStorage.removeItem('supplychain_token');
    window.localStorage.removeItem('supplychain_isAdmin');
  };

  const value = useMemo(
    () => ({ customer, token, isAdmin, login, logout }),
    [customer, token, isAdmin]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
