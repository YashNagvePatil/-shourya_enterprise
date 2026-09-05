import React from 'react'
import { useSelector } from 'react-redux'
import { Navigate, useLocation } from 'react-router'

/**
 * Multi-Model Route Protection Guard
 * @param {Array<string>} allowedRoles - Allowed roles/entity types (e.g. ['Admin', 'Agent', 'Franchise'])
 * @param {ReactNode} children - Child components/routes to render
 */
const Protected = ({ children, allowedRoles = [] }) => {
  const location = useLocation()

  // 1. Standard User Auth (Admin / Agent)
  const { user, loading: authLoading } = useSelector((state) => state.auth)

  // 2. Franchise Auth (Franchise Schema / Store)
  const { currentFranchise, isAuthenticated: isFranchiseAuth, loading: franchiseLoading } = useSelector(
    (state) => state.franchise
  )

  // Loading State
  if (authLoading || franchiseLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black text-white">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-red-500"></div>
      </div>
    )
  }

  // --- Franchise Route Protection Guard ---
  if (allowedRoles.includes('Franchise')) {
    const isFranchiseLoggedIn = Boolean(currentFranchise || isFranchiseAuth)

    if (!isFranchiseLoggedIn) {
      return <Navigate to="/loginFranchise" state={{ from: location }} replace />
    }

    return children
  }

  // --- Standard User Route Protection Guard (Admin / Agent) ---
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    if (user.role === 'Agent') {
      return <Navigate to="/agent/dashboard" replace />
    }
    if (user.role === 'Admin') {
      return <Navigate to="/admin/dashboard" replace />;
    }
    return <Navigate to="/" replace />
  }

  return children
}

export default Protected