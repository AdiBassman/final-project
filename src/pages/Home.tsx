import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { getTutors, getSubjects } from '../lib/queries'
import type { Subject, TutorListItem } from '../lib/types'
import TutorCard from '../components/TutorCard'

const STEPS = [
  { n: 1, title: 'Search', text: 'Filter tutors by subject, city, and online availability.' },
  { n: 2, title: 'Compare', text: 'Browse profiles, rates, and subjects side by side.' },
  { n: 3, title: 'Contact', text: 'Send a lesson request and track its status in your dashboard.' },
]

export default function Home() {
  const [tutors, setTutors] = useState<TutorListItem[]>([])
  const [subjects, setSubjects] = useState<Subject[]>([])

  useEffect(() => {
    let active = true
    Promise.all([getTutors(), getSubjects()])
      .then(([t, s]) => {
        if (!active) return
        setTutors(t)
        setSubjects(s)
      })
      .catch(() => {})
    return () => {
      active = false
    }
  }, [])

  const cityCount = useMemo(() => new Set(tutors.map((t) => t.city)).size, [tutors])
  const featured = useMemo(
    () => [...tutors].sort((a, b) => b.hourly_rate - a.hourly_rate).slice(0, 4),
    [tutors],
  )
  const topSubjects = subjects.slice(0, 8)

  return (
    <div className="space-y-16">
      {/* Hero */}
      <section className="text-center pt-8">
        <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-slate-900">
          Find the right tutor, faster.
        </h1>
        <p className="mt-4 text-lg text-slate-600 max-w-2xl mx-auto">
          TutorMatch centralizes private-tutor discovery. Search by subject, city, and online
          availability — then send a lesson request in one click.
        </p>
        <div className="mt-8 flex items-center justify-center gap-3">
          <Link
            to="/tutors"
            className="px-5 py-3 rounded-lg bg-indigo-600 text-white font-medium hover:bg-indigo-700 transition-colors"
          >
            Browse tutors
          </Link>
          <Link
            to="/signup"
            className="px-5 py-3 rounded-lg border border-slate-300 text-slate-700 font-medium hover:bg-slate-100 transition-colors"
          >
            Become a tutor
          </Link>
        </div>

        {/* Stats */}
        {tutors.length > 0 && (
          <div className="mt-10 flex items-center justify-center gap-8 text-center">
            {[
              { value: tutors.length, label: 'Tutors' },
              { value: subjects.length, label: 'Subjects' },
              { value: cityCount, label: 'Cities' },
            ].map((s) => (
              <div key={s.label}>
                <div className="text-2xl font-bold text-indigo-600">{s.value}</div>
                <div className="text-sm text-slate-500">{s.label}</div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* How it works */}
      <section>
        <h2 className="text-center text-2xl font-bold text-slate-900">How it works</h2>
        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          {STEPS.map((s) => (
            <div key={s.n} className="rounded-lg border border-slate-200 bg-white p-5 text-center">
              <div className="mx-auto flex h-9 w-9 items-center justify-center rounded-full bg-indigo-100 font-bold text-indigo-700">
                {s.n}
              </div>
              <h3 className="mt-3 font-semibold text-slate-900">{s.title}</h3>
              <p className="mt-1 text-sm text-slate-600">{s.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Browse by subject */}
      {topSubjects.length > 0 && (
        <section>
          <h2 className="text-center text-2xl font-bold text-slate-900">Browse by subject</h2>
          <div className="mt-6 flex flex-wrap justify-center gap-2">
            {topSubjects.map((s) => (
              <Link
                key={s.id}
                to={`/tutors?subject=${s.id}`}
                className="rounded-full border border-slate-300 px-4 py-1.5 text-sm text-slate-700 hover:border-indigo-400 hover:bg-indigo-50 hover:text-indigo-700 transition-colors"
              >
                {s.name}
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Featured tutors */}
      {featured.length > 0 && (
        <section>
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-slate-900">Featured tutors</h2>
            <Link to="/tutors" className="text-sm font-medium text-indigo-600 hover:underline">
              See all →
            </Link>
          </div>
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            {featured.map((t) => (
              <TutorCard key={t.id} tutor={t} />
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
