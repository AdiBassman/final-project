import { useAuth } from '../auth/useAuth'

// Phase 2: confirms auth + profile load. Role-specific request views (tutor:
// requests received; student: requests sent) arrive in Phase 6.
export default function Dashboard() {
  const { user, profile } = useAuth()

  return (
    <section className="py-8">
      <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
      <div className="mt-4 rounded-lg border border-slate-200 bg-white p-4 text-sm text-slate-700">
        <p>
          Signed in as <span className="font-medium">{profile?.full_name || user?.email}</span>
        </p>
        <p className="mt-1">
          Role: <span className="font-medium capitalize">{profile?.role ?? 'unknown'}</span>
        </p>
      </div>
      <span className="mt-4 inline-block rounded-full bg-amber-100 px-3 py-1 text-xs font-medium text-amber-800">
        Requests view coming in Phase 6
      </span>
    </section>
  )
}
