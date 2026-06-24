import type { Subject } from '../lib/types'

export interface Filters {
  search: string
  subjectId: number | null
  city: string
  onlineOnly: boolean
}

interface FilterBarProps {
  subjects: Subject[]
  cities: string[]
  filters: Filters
  onChange: (filters: Filters) => void
}

const controlClass =
  'rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500'

export default function FilterBar({ subjects, cities, filters, onChange }: FilterBarProps) {
  function update(patch: Partial<Filters>) {
    onChange({ ...filters, ...patch })
  }

  return (
    <div className="flex flex-wrap items-center gap-3 rounded-lg border border-slate-200 bg-white p-3">
      <input
        type="text"
        placeholder="Search by name…"
        value={filters.search}
        onChange={(e) => update({ search: e.target.value })}
        className={`${controlClass} flex-1 min-w-40`}
      />

      <select
        value={filters.subjectId ?? ''}
        onChange={(e) => update({ subjectId: e.target.value ? Number(e.target.value) : null })}
        className={controlClass}
      >
        <option value="">All subjects</option>
        {subjects.map((s) => (
          <option key={s.id} value={s.id}>
            {s.name}
          </option>
        ))}
      </select>

      <select
        value={filters.city}
        onChange={(e) => update({ city: e.target.value })}
        className={controlClass}
      >
        <option value="">All cities</option>
        {cities.map((c) => (
          <option key={c} value={c}>
            {c}
          </option>
        ))}
      </select>

      <label className="flex items-center gap-2 text-sm text-slate-700">
        <input
          type="checkbox"
          checked={filters.onlineOnly}
          onChange={(e) => update({ onlineOnly: e.target.checked })}
          className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
        />
        Online only
      </label>
    </div>
  )
}
