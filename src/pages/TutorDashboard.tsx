import { useEffect, useState } from 'react'
import { useAuth } from '../auth/useAuth'
import { getRequestsForTutor } from '../lib/queries'
import type { TutorInboxRequest } from '../lib/types'
import RequestCard from '../components/RequestCard'
import Spinner from '../components/Spinner'
import EmptyState from '../components/EmptyState'
import ErrorMessage from '../components/ErrorMessage'

export default function TutorDashboard() {
  const { user } = useAuth()
  const [requests, setRequests] = useState<TutorInboxRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!user) return
    let active = true
    getRequestsForTutor(user.id)
      .then((r) => active && setRequests(r))
      .catch((e) => active && setError(e instanceof Error ? e.message : 'Failed to load requests'))
      .finally(() => active && setLoading(false))
    return () => {
      active = false
    }
  }, [user])

  if (loading) return <Spinner label="Loading requests…" />
  if (error) return <ErrorMessage message={error} />

  return (
    <section className="py-6">
      <h1 className="text-2xl font-bold text-slate-900">Lesson requests</h1>
      <p className="mt-1 text-sm text-slate-500">{requests.length} received</p>

      <div className="mt-6 space-y-3">
        {requests.length === 0 ? (
          <EmptyState message="No lesson requests yet. They'll appear here when students contact you." />
        ) : (
          requests.map((r) => (
            <RequestCard
              key={r.id}
              title={r.student_name}
              subtitle={r.student_email}
              message={r.message}
              date={r.created_at}
            />
          ))
        )}
      </div>
    </section>
  )
}
