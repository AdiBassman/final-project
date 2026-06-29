import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import type { RequestStatus } from '../lib/types'
import StatusBadge from './StatusBadge'

interface RequestCardProps {
  title: string
  subtitle?: string
  message: string
  date: string
  linkTo?: string
  subject?: string | null
  status?: RequestStatus
  footer?: ReactNode
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

export default function RequestCard({
  title,
  subtitle,
  message,
  date,
  linkTo,
  subject,
  status,
  footer,
}: RequestCardProps) {
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
        <div className="flex shrink-0 flex-col items-end gap-1">
          {status && <StatusBadge status={status} />}
          <time className="text-xs text-slate-400">{formatDate(date)}</time>
        </div>
      </div>

      {subject && (
        <span className="mt-2 inline-block rounded-full bg-indigo-50 px-2 py-0.5 text-xs font-medium text-indigo-700">
          {subject}
        </span>
      )}

      <p className="mt-2 whitespace-pre-line text-sm text-slate-700">{message}</p>

      {footer && <div className="mt-3 flex gap-2">{footer}</div>}
    </div>
  )
}
