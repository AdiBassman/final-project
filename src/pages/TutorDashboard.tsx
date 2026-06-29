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
  const [notes, setNotes] = useState<Record<string, string>>({})
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
    const note = notes[id]
    const prev = requests
    setRequests((rs) =>
      rs.map((r) => (r.id === id ? { ...r, status, tutor_note: note?.trim() || null } : r)),
    )
    try {
      await updateRequestStatus(id, status, note)
    } catch (e) {
      setRequests(prev)
      setError(e instanceof Error ? e.message : 'Failed to update request')
    }
  }

  if (loading) return <Spinner label="Loading requests…" />
  if (error) return <ErrorMessage message={error} />

  const pending = requests.filter((r) => r.status === 'pending').length

  return (
    <section className="py-6">
      <h1 className="text-2xl font-bold text-slate-900">Lesson requests</h1>
      <p className="mt-1 text-sm text-slate-500">
        {requests.length} received
        {pending > 0 && (
          <span className="ml-2 rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-800">
            {pending} pending
          </span>
        )}
      </p>

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
                  <div className="w-full space-y-2">
                    <input
                      type="text"
                      maxLength={300}
                      placeholder="Optional note to the student…"
                      value={notes[r.id] ?? ''}
                      onChange={(e) => setNotes((n) => ({ ...n, [r.id]: e.target.value }))}
                      className="w-full rounded-md border border-slate-300 px-3 py-1.5 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                    <div className="flex gap-2">
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
                    </div>
                  </div>
                ) : r.tutor_note ? (
                  <p className="text-sm text-slate-500">
                    Your note: <span className="text-slate-700">{r.tutor_note}</span>
                  </p>
                ) : null
              }
            />
          ))
        )}
      </div>
    </section>
  )
}
