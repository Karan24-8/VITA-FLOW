import React from 'react';
import { Navigate } from 'react-router-dom';

// ── Decode JWT to check expiry ──
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

// ── Gets role from localStorage user object ──
const getUserRole = () => {
  try {
    const user = JSON.parse(localStorage.getItem('user'));
    return user?.role || null;
  } catch {
    return null;
  }
};

// ✅ ProtectedRoute — any logged-in user can access
// Redirects to /login if token is missing or expired
export const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  return isTokenValid(token) ? children : <Navigate to="/login" replace />;
};

// ✅ RoleRoute — only specific roles can access
// allowedRoles: array of role strings e.g. ['consultant', 'dba']
// Redirects unauthorized roles to their correct home
export const RoleRoute = ({ children, allowedRoles }) => {
  const token = localStorage.getItem('token');

  if (!isTokenValid(token)) {
    return <Navigate to="/login" replace />;
  }

  const role = getUserRole();

  if (!allowedRoles.includes(role)) {
    // Redirect each role to their correct landing page
    if (role === 'consultant') return <Navigate to="/consultant-dashboard" replace />;
    if (role === 'dba')        return <Navigate to="/dba-dashboard"        replace />;
    return <Navigate to="/planner" replace />;
  }

  return children;
};

// Keep default export for backward compatibility with any existing imports
export default ProtectedRoute;
