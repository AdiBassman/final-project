import { useEffect, useState, type FormEvent } from 'react'
import { useAuth } from '../auth/useAuth'
import { getSubjects, getMyTutorProfile, saveTutorProfile } from '../lib/queries'
import type { Subject } from '../lib/types'
import SubjectMultiSelect from '../components/SubjectMultiSelect'
import Avatar from '../components/Avatar'

const inputClass =
  'w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500'

const CITIES = [
  'Tel Aviv', 'Jerusalem', 'Haifa', "Be'er Sheva", 'Rishon LeZion',
  'Petah Tikva', 'Netanya', 'Ramat Gan', 'Herzliya', "Be'er Ya'akov",
]

export default function EditTutorProfile() {
  const { user, profile } = useAuth()

  const [subjects, setSubjects] = useState<Subject[]>([])
  const [bio, setBio] = useState('')
  const [city, setCity] = useState('')
  const [hourlyRate, setHourlyRate] = useState('')
  const [onlineAvailable, setOnlineAvailable] = useState(false)
  const [selectedSubjects, setSelectedSubjects] = useState<number[]>([])

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    if (!user) return
    let active = true
    async function load() {
      try {
        const [allSubjects, mine] = await Promise.all([
          getSubjects(),
          getMyTutorProfile(user!.id),
        ])
        if (!active) return
        setSubjects(allSubjects)
        if (mine.profile) {
          setBio(mine.profile.bio ?? '')
          setCity(mine.profile.city)
          setHourlyRate(String(mine.profile.hourly_rate))
          setOnlineAvailable(mine.profile.online_available)
          setSelectedSubjects(mine.subjectIds)
        }
      } catch (e) {
        if (active) setError(e instanceof Error ? e.message : 'Failed to load profile')
      } finally {
        if (active) setLoading(false)
      }
    }
    load()
    return () => {
      active = false
    }
  }, [user])

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!user) return
    setError(null)
    setSaved(false)
    setSaving(true)
    try {
      await saveTutorProfile(user.id, {
        bio,
        city,
        hourly_rate: Number(hourlyRate),
        online_available: onlineAvailable,
        subject_ids: selectedSubjects,
      })
      setSaved(true)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to save profile')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return <p className="py-12 text-center text-slate-500">Loading…</p>
  }

  return (
    <section className="max-w-xl mx-auto py-8">
      <div className="flex items-center gap-3">
        <Avatar name={profile?.full_name || ''} />
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Edit tutor profile</h1>
          <p className="text-sm text-slate-500">{profile?.full_name}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-700">Bio</label>
          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            rows={4}
            className={`mt-1 ${inputClass}`}
            placeholder="Tell students about your experience and teaching style."
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700">City</label>
            <input
              type="text"
              required
              list="cities"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              className={`mt-1 ${inputClass}`}
            />
            <datalist id="cities">
              {CITIES.map((c) => (
                <option key={c} value={c} />
              ))}
            </datalist>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700">
              Hourly rate (₪)
            </label>
            <input
              type="number"
              required
              min={0}
              value={hourlyRate}
              onChange={(e) => setHourlyRate(e.target.value)}
              className={`mt-1 ${inputClass}`}
            />
          </div>
        </div>

        <label className="flex items-center gap-2 text-sm text-slate-700">
          <input
            type="checkbox"
            checked={onlineAvailable}
            onChange={(e) => setOnlineAvailable(e.target.checked)}
            className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
          />
          Available for online lessons
        </label>

        <div>
          <label className="block text-sm font-medium text-slate-700">Subjects</label>
          <div className="mt-2">
            <SubjectMultiSelect
              subjects={subjects}
              selected={selectedSubjects}
              onChange={setSelectedSubjects}
            />
          </div>
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}
        {saved && <p className="text-sm text-green-700">Profile saved.</p>}

        <button
          type="submit"
          disabled={saving}
          className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
        >
          {saving ? 'Saving…' : 'Save profile'}
        </button>
      </form>
    </section>
  )
}
