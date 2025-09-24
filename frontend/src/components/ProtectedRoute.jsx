import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const ProtectedRoute = ({ children, requireAdmin = false, requireStudent = false }) => {
  const { isAuthenticated, user, loading } = useAuth();
  const location = useLocation();

  // Show loading spinner while checking authentication
  if (loading) {
    return (
      <div className="loading">
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
          <div className="animate-spin" style={{ 
            width: '40px', 
            height: '40px', 
            border: '4px solid #f3f3f3',
            borderTop: '4px solid #667eea',
            borderRadius: '50%'
          }}></div>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check role requirements
  if (requireAdmin && user?.role !== 'admin') {
    return (
      <div className="container">
        <div className="card">
          <div style={{ textAlign: 'center', padding: '2rem' }}>
            <h2 style={{ color: '#dc3545', marginBottom: '1rem' }}>Access Denied</h2>
            <p>You need admin privileges to access this page.</p>
          </div>
        </div>
      </div>
    );
  }

  if (requireStudent && user?.role !== 'student') {
    return (
      <div className="container">
        <div className="card">
          <div style={{ textAlign: 'center', padding: '2rem' }}>
            <h2 style={{ color: '#dc3545', marginBottom: '1rem' }}>Access Denied</h2>
            <p>This page is only accessible to students.</p>
          </div>
        </div>
      </div>
    );
  }

  return children;
};

export default ProtectedRoute;

