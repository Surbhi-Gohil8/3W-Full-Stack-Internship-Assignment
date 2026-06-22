import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';

const ProtectedRoute = () => {
  const token = localStorage.getItem('token');

  // If token doesn't exist, redirect to login page
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  // Render the protected routes
  return <Outlet />;
};

export default ProtectedRoute;
