import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from './useAuth'
import type { Role } from '../lib/types'

// Gate for role-specific routes (e.g. tutor-only profile editor). Assumes it
// sits inside a ProtectedRoute, so a session already exists.
export default function RoleRoute({ role }: { role: Role }) {
  const { profile, loading } = useAuth()

  if (loading) {
    return <p className="py-12 text-center text-slate-500">Loading…</p>
  }
  if (!profile) {
    return <Navigate to="/login" replace />
  }
  if (profile.role !== role) {
    return <Navigate to="/dashboard" replace />
  }
  return <Outlet />
}
