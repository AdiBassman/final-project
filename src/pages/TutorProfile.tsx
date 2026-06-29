import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { getTutor, hasContactedTutor, getFavoriteTutorIds, setFavorite } from '../lib/queries'
import type { TutorListItem } from '../lib/types'
import { useAuth } from '../auth/useAuth'
import Avatar from '../components/Avatar'
import Spinner from '../components/Spinner'
import ErrorMessage from '../components/ErrorMessage'
import ContactModal from '../components/ContactModal'
import FavoriteButton from '../components/FavoriteButton'

export default function TutorProfile() {
  const { id } = useParams<{ id: string }>()
  const { session, user } = useAuth()
  const navigate = useNavigate()
  const [tutor, setTutor] = useState<TutorListItem | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [contactOpen, setContactOpen] = useState(false)
  const [alreadyContacted, setAlreadyContacted] = useState(false)
  const [isFavorite, setIsFavorite] = useState(false)

  function handleContact() {
    if (!session) {
      navigate('/login', { state: { from: `/tutors/${id}` } })
      return
    }
    setContactOpen(true)
  }

  useEffect(() => {
    if (!id) return
    let active = true
    async function load() {
      try {
        const t = await getTutor(id!)
        if (active) setTutor(t)
      } catch (e) {
        if (active) setError(e instanceof Error ? e.message : 'Failed to load tutor')
      } finally {
        if (active) setLoading(false)
      }
    }
    load()
    return () => {
      active = false
    }
  }, [id])

  // Has this logged-in user already contacted / favorited this tutor?
  useEffect(() => {
    if (!id || !user) {
      setAlreadyContacted(false)
      setIsFavorite(false)
      return
    }
    let active = true
    hasContactedTutor(user.id, id)
      .then((c) => active && setAlreadyContacted(c))
      .catch(() => {})
    getFavoriteTutorIds(user.id)
      .then((ids) => active && setIsFavorite(ids.includes(id)))
      .catch(() => {})
    return () => {
      active = false
    }
  }, [id, user, contactOpen])

  async function toggleFavorite() {
    if (!user || !id) return
    const next = !isFavorite
    setIsFavorite(next)
    try {
      await setFavorite(user.id, id, next)
    } catch {
      setIsFavorite(!next)
    }
  }

  if (loading) return <Spinner />
  if (error) return <ErrorMessage message={error} />
  if (!tutor) {
    return (
      <div className="py-12 text-center">
        <p className="text-slate-600">Tutor not found.</p>
        <Link to="/tutors" className="mt-4 inline-block font-medium text-indigo-600 hover:underline">
          Back to directory
        </Link>
      </div>
    )
  }

  return (
    <section className="max-w-2xl mx-auto py-6">
      <Link to="/tutors" className="text-sm text-indigo-600 hover:underline">
        ← Back to directory
      </Link>

      <div className="mt-4 flex items-start gap-4">
        <Avatar name={tutor.full_name} size={72} />
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-slate-900">{tutor.full_name}</h1>
          <p className="mt-1 text-slate-500">
            {tutor.city}
            {tutor.online_available && (
              <span className="ml-2 rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-700">
                Online available
              </span>
            )}
          </p>
          <p className="mt-2 text-lg font-semibold text-slate-800">₪{tutor.hourly_rate}/hr</p>
          <p className="mt-1 text-xs text-slate-400">
            Member since{' '}
            {new Date(tutor.created_at).toLocaleDateString(undefined, {
              month: 'long',
              year: 'numeric',
            })}
          </p>
        </div>
      </div>

      {tutor.subjects.length > 0 && (
        <div className="mt-6">
          <h2 className="text-sm font-medium text-slate-700">Subjects</h2>
          <div className="mt-2 flex flex-wrap gap-2">
            {tutor.subjects.map((s) => (
              <span
                key={s.id}
                className="rounded-full bg-slate-100 px-3 py-1 text-sm text-slate-700"
              >
                {s.name}
              </span>
            ))}
          </div>
        </div>
      )}

      {tutor.bio && (
        <div className="mt-6">
          <h2 className="text-sm font-medium text-slate-700">About</h2>
          <p className="mt-2 whitespace-pre-line text-slate-700">{tutor.bio}</p>
        </div>
      )}

      <div className="mt-8">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleContact}
            className="rounded-md bg-indigo-600 px-5 py-2.5 font-medium text-white hover:bg-indigo-700"
          >
            Contact tutor
          </button>
          {session && (
            <FavoriteButton active={isFavorite} onToggle={toggleFavorite} className="text-2xl" />
          )}
        </div>
        {!session && (
          <p className="mt-2 text-sm text-slate-500">You'll be asked to log in first.</p>
        )}
        {alreadyContacted && (
          <p className="mt-2 text-sm text-emerald-700">
            You've already contacted this tutor. You can send another message if you like.
          </p>
        )}
      </div>

      {contactOpen && (
        <ContactModal
          tutorId={tutor.id}
          tutorName={tutor.full_name}
          subjects={tutor.subjects}
          onClose={() => setContactOpen(false)}
        />
      )}
    </section>
  )
}
