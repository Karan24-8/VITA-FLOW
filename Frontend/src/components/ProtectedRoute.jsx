import React from 'react';
import { Navigate } from 'react-router-dom';

const isTokenValid = (token) => {
  if (!token) return false;
  try {
    const payloadBase64 = token.split('.')[1];
    if (!payloadBase64) return false;
    const payload = JSON.parse(atob(payloadBase64));
    if (!payload?.exp) return true;
    return Date.now() < payload.exp * 1000;
  } catch {
    return false;
  }
};

const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem("token");
  return isTokenValid(token) ? children : <Navigate to="/login" replace />;
};

export default ProtectedRoute;