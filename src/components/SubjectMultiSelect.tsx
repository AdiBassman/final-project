import type { Subject } from '../lib/types'

interface SubjectMultiSelectProps {
  subjects: Subject[]
  selected: number[]
  onChange: (ids: number[]) => void
}

// Toggleable subject chips.
export default function SubjectMultiSelect({
  subjects,
  selected,
  onChange,
}: SubjectMultiSelectProps) {
  function toggle(id: number) {
    onChange(selected.includes(id) ? selected.filter((s) => s !== id) : [...selected, id])
  }

  return (
    <div className="flex flex-wrap gap-2">
      {subjects.map((s) => {
        const active = selected.includes(s.id)
        return (
          <button
            key={s.id}
            type="button"
            onClick={() => toggle(s.id)}
            aria-pressed={active}
            className={`rounded-full border px-3 py-1 text-sm transition-colors ${
              active
                ? 'border-indigo-500 bg-indigo-600 text-white'
                : 'border-slate-300 text-slate-600 hover:bg-slate-100'
            }`}
          >
            {s.name}
          </button>
        )
      })}
    </div>
  )
}
