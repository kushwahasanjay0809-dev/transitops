import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute({ children, roles }) {
  const { isAuthenticated, loading, user } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="loading-overlay" style={{ minHeight: '100vh' }}>
        <div className="spinner" style={{ width: 40, height: 40 }}></div>
        <span>Loading...</span>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Role-based access check
  if (roles && roles.length > 0 && !roles.includes(user?.role?.name)) {
    return (
      <div className="loading-overlay" style={{ minHeight: '60vh' }}>
        <div style={{ fontSize: '3rem' }}>🚫</div>
        <h2>Access Denied</h2>
        <p style={{ color: 'var(--text-secondary)' }}>
          You don't have permission to access this page.
        </p>
        <button className="btn btn-primary" onClick={() => window.history.back()}>
          Go Back
        </button>
      </div>
    );
  }

  return children;
}
