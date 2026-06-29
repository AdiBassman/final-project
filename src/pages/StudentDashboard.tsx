import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../auth/useAuth'
import { getRequestsByStudent, getFavoriteTutors, setFavorite } from '../lib/queries'
import type { StudentSentRequest, TutorListItem } from '../lib/types'
import RequestCard from '../components/RequestCard'
import TutorCard from '../components/TutorCard'
import Spinner from '../components/Spinner'
import EmptyState from '../components/EmptyState'
import ErrorMessage from '../components/ErrorMessage'

export default function StudentDashboard() {
  const { user } = useAuth()
  const [requests, setRequests] = useState<StudentSentRequest[]>([])
  const [saved, setSaved] = useState<TutorListItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!user) return
    let active = true
    Promise.all([getRequestsByStudent(user.id), getFavoriteTutors(user.id)])
      .then(([r, s]) => {
        if (!active) return
        setRequests(r)
        setSaved(s)
      })
      .catch((e) => active && setError(e instanceof Error ? e.message : 'Failed to load dashboard'))
      .finally(() => active && setLoading(false))
    return () => {
      active = false
    }
  }, [user])

  async function unsave(tutorId: string) {
    if (!user) return
    const prev = saved
    setSaved((s) => s.filter((t) => t.id !== tutorId))
    try {
      await setFavorite(user.id, tutorId, false)
    } catch {
      setSaved(prev)
    }
  }

  if (loading) return <Spinner label="Loading your requests…" />
  if (error) return <ErrorMessage message={error} />

  return (
    <section className="py-6">
      {saved.length > 0 && (
        <div className="mb-8">
          <h2 className="text-lg font-bold text-slate-900">Saved tutors</h2>
          <div className="mt-3 grid gap-4 sm:grid-cols-2">
            {saved.map((t) => (
              <TutorCard
                key={t.id}
                tutor={t}
                favorite
                onToggleFavorite={() => unsave(t.id)}
              />
            ))}
          </div>
        </div>
      )}

      <h1 className="text-2xl font-bold text-slate-900">My requests</h1>
      <p className="mt-1 text-sm text-slate-500">{requests.length} sent</p>

      <div className="mt-6 space-y-3">
        {requests.length === 0 ? (
          <EmptyState
            message="You haven't sent any requests yet. Browse tutors to get started."
          />
        ) : (
          requests.map((r) => (
            <RequestCard
              key={r.id}
              title={r.tutor.full_name}
              subtitle={r.tutor.city}
              subject={r.subject_name}
              status={r.status}
              message={r.message}
              date={r.created_at}
              linkTo={`/tutors/${r.tutor.id}`}
              footer={
                r.tutor_note ? (
                  <p className="text-sm text-slate-500">
                    Tutor's note: <span className="text-slate-700">{r.tutor_note}</span>
                  </p>
                ) : null
              }
            />
          ))
        )}
      </div>

      <Link
        to="/tutors"
        className="mt-6 inline-block rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
      >
        Find tutors
      </Link>
    </section>
  )
}
