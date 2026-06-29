import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { getTutors, getSubjects } from '../lib/queries'
import type { Subject, TutorListItem } from '../lib/types'
import TutorCard from '../components/TutorCard'
import FilterBar, { type Filters } from '../components/FilterBar'
import Spinner from '../components/Spinner'
import EmptyState from '../components/EmptyState'
import ErrorMessage from '../components/ErrorMessage'

type Sort = 'name' | 'price_asc' | 'price_desc'

const SORTS: { value: Sort; label: string }[] = [
  { value: 'name', label: 'Name (A–Z)' },
  { value: 'price_asc', label: 'Price: low to high' },
  { value: 'price_desc', label: 'Price: high to low' },
]

export default function TutorDirectory() {
  const [tutors, setTutors] = useState<TutorListItem[]>([])
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [params, setParams] = useSearchParams()

  // Filters + sort live in the URL so views are shareable and survive refresh.
  const filters: Filters = {
    search: params.get('q') ?? '',
    subjectId: params.get('subject') ? Number(params.get('subject')) : null,
    city: params.get('city') ?? '',
    onlineOnly: params.get('online') === '1',
  }
  const sort = (params.get('sort') as Sort) || 'name'

  function patchParams(patch: Record<string, string | null>) {
    const next = new URLSearchParams(params)
    for (const [k, v] of Object.entries(patch)) {
      if (v) next.set(k, v)
      else next.delete(k)
    }
    setParams(next, { replace: true })
  }

  function setFilters(f: Filters) {
    patchParams({
      q: f.search || null,
      subject: f.subjectId ? String(f.subjectId) : null,
      city: f.city || null,
      online: f.onlineOnly ? '1' : null,
    })
  }

  const hasFilters = Boolean(
    filters.search || filters.subjectId || filters.city || filters.onlineOnly,
  )

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
    const filtered = tutors.filter((t) => {
      if (filters.search && !t.full_name.toLowerCase().includes(filters.search.toLowerCase()))
        return false
      if (filters.subjectId && !t.subjects.some((s) => s.id === filters.subjectId)) return false
      if (filters.city && t.city !== filters.city) return false
      if (filters.onlineOnly && !t.online_available) return false
      return true
    })
    const sorted = [...filtered]
    if (sort === 'price_asc') sorted.sort((a, b) => a.hourly_rate - b.hourly_rate)
    else if (sort === 'price_desc') sorted.sort((a, b) => b.hourly_rate - a.hourly_rate)
    else sorted.sort((a, b) => a.full_name.localeCompare(b.full_name))
    return sorted
  }, [tutors, filters, sort])

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

      <div className="mt-3 flex flex-wrap items-center gap-3">
        <label className="flex items-center gap-2 text-sm text-slate-600">
          Sort
          <select
            value={sort}
            onChange={(e) => patchParams({ sort: e.target.value })}
            className="rounded-md border border-slate-300 px-2 py-1.5 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          >
            {SORTS.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
        </label>
        {hasFilters && (
          <button
            onClick={() => setParams(sort !== 'name' ? { sort } : {}, { replace: true })}
            className="text-sm font-medium text-indigo-600 hover:underline"
          >
            Clear filters
          </button>
        )}
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
