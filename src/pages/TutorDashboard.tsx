import { useEffect, useState } from 'react'
import { useAuth } from '../auth/useAuth'
import { getRequestsForTutor, updateRequestStatus } from '../lib/queries'
import type { TutorInboxRequest } from '../lib/types'
import RequestCard from '../components/RequestCard'
import Spinner from '../components/Spinner'
import EmptyState from '../components/EmptyState'
import ErrorMessage from '../components/ErrorMessage'

const btn = 'rounded-md px-3 py-1 text-sm font-medium'

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

  async function setStatus(id: string, status: 'accepted' | 'declined') {
    // Optimistic update; revert on failure.
    const prev = requests
    setRequests((rs) => rs.map((r) => (r.id === id ? { ...r, status } : r)))
    try {
      await updateRequestStatus(id, status)
    } catch (e) {
      setRequests(prev)
      setError(e instanceof Error ? e.message : 'Failed to update request')
    }
  }

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
              subject={r.subject_name}
              status={r.status}
              message={r.message}
              date={r.created_at}
              footer={
                r.status === 'pending' ? (
                  <>
                    <button
                      onClick={() => setStatus(r.id, 'accepted')}
                      className={`${btn} bg-emerald-600 text-white hover:bg-emerald-700`}
                    >
                      Accept
                    </button>
                    <button
                      onClick={() => setStatus(r.id, 'declined')}
                      className={`${btn} border border-slate-300 text-slate-700 hover:bg-slate-100`}
                    >
                      Decline
                    </button>
                  </>
                ) : null
              }
            />
          ))
        )}
      </div>
    </section>
  )
}
