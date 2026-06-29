import type { RequestStatus } from '../lib/types'

const STYLES: Record<RequestStatus, string> = {
  pending: 'bg-amber-100 text-amber-800',
  accepted: 'bg-emerald-100 text-emerald-700',
  declined: 'bg-slate-200 text-slate-600',
}

export default function StatusBadge({ status }: { status: RequestStatus }) {
  return (
    <span className={`rounded-full px-2 py-0.5 text-xs font-medium capitalize ${STYLES[status]}`}>
      {status}
    </span>
  )
}
