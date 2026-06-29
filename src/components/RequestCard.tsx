import { Link } from 'react-router-dom'

interface RequestCardProps {
  title: string
  subtitle?: string
  message: string
  date: string
  linkTo?: string
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

export default function RequestCard({ title, subtitle, message, date, linkTo }: RequestCardProps) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4">
      <div className="flex items-start justify-between gap-2">
        <div>
          {linkTo ? (
            <Link to={linkTo} className="font-semibold text-indigo-600 hover:underline">
              {title}
            </Link>
          ) : (
            <h3 className="font-semibold text-slate-900">{title}</h3>
          )}
          {subtitle && <p className="text-sm text-slate-500">{subtitle}</p>}
        </div>
        <time className="shrink-0 text-xs text-slate-400">{formatDate(date)}</time>
      </div>
      <p className="mt-2 whitespace-pre-line text-sm text-slate-700">{message}</p>
    </div>
  )
}
