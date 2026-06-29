import { Link } from 'react-router-dom'
import type { TutorListItem } from '../lib/types'
import Avatar from './Avatar'
import FavoriteButton from './FavoriteButton'

interface TutorCardProps {
  tutor: TutorListItem
  favorite?: boolean
  onToggleFavorite?: () => Promise<void>
}

export default function TutorCard({ tutor, favorite, onToggleFavorite }: TutorCardProps) {
  return (
    <Link
      to={`/tutors/${tutor.id}`}
      className="block rounded-lg border border-slate-200 bg-white p-4 transition-shadow hover:shadow-md"
    >
      <div className="flex items-start gap-3">
        <Avatar name={tutor.full_name} />
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-2">
            <h3 className="truncate font-semibold text-slate-900">{tutor.full_name}</h3>
            <span className="flex shrink-0 items-center gap-2 text-sm font-medium text-slate-700">
              ₪{tutor.hourly_rate}/hr
              {onToggleFavorite && (
                <FavoriteButton active={Boolean(favorite)} onToggle={onToggleFavorite} />
              )}
            </span>
          </div>
          <p className="text-sm text-slate-500">
            {tutor.city}
            {tutor.online_available && (
              <span className="ml-2 rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-700">
                Online
              </span>
            )}
          </p>
          {tutor.subjects.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1">
              {tutor.subjects.map((s) => (
                <span
                  key={s.id}
                  className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-600"
                >
                  {s.name}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </Link>
  )
}
