import { useState } from 'react'

interface FavoriteButtonProps {
  active: boolean
  onToggle: () => Promise<void>
  className?: string
}

// Heart toggle. Optimistic via parent state; shows a brief disabled state
// while the request is in flight.
export default function FavoriteButton({ active, onToggle, className = '' }: FavoriteButtonProps) {
  const [busy, setBusy] = useState(false)

  async function handleClick(e: React.MouseEvent) {
    e.preventDefault()
    e.stopPropagation()
    if (busy) return
    setBusy(true)
    try {
      await onToggle()
    } finally {
      setBusy(false)
    }
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={busy}
      aria-pressed={active}
      aria-label={active ? 'Remove from saved tutors' : 'Save tutor'}
      title={active ? 'Saved' : 'Save tutor'}
      className={`text-xl leading-none transition-transform hover:scale-110 disabled:opacity-50 ${
        active ? 'text-rose-500' : 'text-slate-300 hover:text-rose-400'
      } ${className}`}
    >
      {active ? '♥' : '♡'}
    </button>
  )
}
