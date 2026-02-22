/**
 * ProtectedRoute — wraps the Government Dashboard route.
 * Reads the session from localStorage synchronously to prevent a flash of
 * unauthenticated content on first render.
 */

import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { readSession } from '../hooks/useAuth';

const ProtectedRoute = ({ children, requiredRole = 'government' }) => {
    const session = readSession();
    const location = useLocation();

    if (!session?.token) {
        // Not logged in → government login page
        return <Navigate to="/government-login" state={{ from: location }} replace />;
    }

    if (session.role !== requiredRole) {
        // Logged in but wrong role
        return <Navigate to="/unauthorized" replace />;
    }

    return children;
};

export default ProtectedRoute;
