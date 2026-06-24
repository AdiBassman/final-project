import { useEffect, useMemo, useState } from 'react'
import { getTutors, getSubjects } from '../lib/queries'
import type { Subject, TutorListItem } from '../lib/types'
import TutorCard from '../components/TutorCard'
import FilterBar, { type Filters } from '../components/FilterBar'
import Spinner from '../components/Spinner'
import EmptyState from '../components/EmptyState'
import ErrorMessage from '../components/ErrorMessage'

const EMPTY_FILTERS: Filters = { search: '', subjectId: null, city: '', onlineOnly: false }

export default function TutorDirectory() {
  const [tutors, setTutors] = useState<TutorListItem[]>([])
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [filters, setFilters] = useState<Filters>(EMPTY_FILTERS)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let active = true
    async function load() {
      try {
        const [t, s] = await Promise.all([getTutors(), getSubjects()])
        if (!active) return
        setTutors(t)
        setSubjects(s)
      } catch (e) {
        if (active) setError(e instanceof Error ? e.message : 'Failed to load tutors')
      } finally {
        if (active) setLoading(false)
      }
    }
    load()
    return () => {
      active = false
    }
  }, [])

  const cities = useMemo(
    () => Array.from(new Set(tutors.map((t) => t.city))).sort(),
    [tutors],
  )

  const visible = useMemo(() => {
    return tutors.filter((t) => {
      if (filters.search && !t.full_name.toLowerCase().includes(filters.search.toLowerCase()))
        return false
      if (filters.subjectId && !t.subjects.some((s) => s.id === filters.subjectId)) return false
      if (filters.city && t.city !== filters.city) return false
      if (filters.onlineOnly && !t.online_available) return false
      return true
    })
  }, [tutors, filters])

  if (loading) return <Spinner label="Loading tutors…" />
  if (error) return <ErrorMessage message={error} />

  return (
    <section className="py-4">
      <h1 className="text-2xl font-bold text-slate-900">Find a tutor</h1>
      <p className="mt-1 text-sm text-slate-500">
        {visible.length} of {tutors.length} tutors
      </p>

      <div className="mt-4">
        <FilterBar
          subjects={subjects}
          cities={cities}
          filters={filters}
          onChange={setFilters}
        />
      </div>

      <div className="mt-6">
        {visible.length === 0 ? (
          <EmptyState message="No tutors match your filters." />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {visible.map((t) => (
              <TutorCard key={t.id} tutor={t} />
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
