import React from 'react'
import { useSelector } from 'react-redux'
import { Navigate, useLocation } from 'react-router'

/**
 * Professional Role-Based Route Protection Guard
 * @param {Array<string>} allowedRoles - Allowed user roles for this route (e.g. ['Admin', 'Agent'])
 * @param {ReactNode} children - Child components/routes to render
 */
const Protected = ({ children, allowedRoles = [] }) => {
  const { user, loading } = useSelector((state) => state.auth)
  const location = useLocation()

  // 1. Loading State - API call in progress
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black text-white">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-red-500"></div>
      </div>
    )
  }

  // 2. Unauthenticated User - Redirection to Login with previous path history
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  // 3. Unauthorized User Role - Block Access and Redirect to their default dashboard
  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    // If agent tries to access admin or franchise, send them to agent dashboard
    if (user.role === 'Agent') {
      return <Navigate to="/agent/dashboard" replace />
    }
    // If franchise tries to access admin, send them to franchise dashboard
    if (user.role === 'Franchise') {
      return <Navigate to="/franchise/dashboard" replace />
    }
    // If admin tries to access other routes or generic fallbacks
    if (user.role === 'Admin') {
      return <Navigate to="/admin/dashboard" replace />
    }

    return <Navigate to="/" replace />
  }

  // Authorized Access Granted
  return children
}

export default Protected