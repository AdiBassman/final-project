interface AvatarProps {
  name: string
  size?: number
}

// Deterministic colored circle with initials. No image upload needed.
const COLORS = [
  'bg-indigo-500', 'bg-emerald-500', 'bg-rose-500', 'bg-amber-500',
  'bg-sky-500', 'bg-violet-500', 'bg-teal-500', 'bg-fuchsia-500',
]

function initials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return '?'
  if (parts.length === 1) return parts[0][0].toUpperCase()
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}

function colorFor(name: string) {
  let sum = 0
  for (let i = 0; i < name.length; i++) sum += name.charCodeAt(i)
  return COLORS[sum % COLORS.length]
}

export default function Avatar({ name, size = 48 }: AvatarProps) {
  return (
    <span
      className={`inline-flex items-center justify-center rounded-full font-semibold text-white ${colorFor(name)}`}
      style={{ width: size, height: size, fontSize: size * 0.4 }}
      aria-hidden="true"
    >
      {initials(name)}
    </span>
  )
}
