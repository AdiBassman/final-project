import { Link, NavLink } from 'react-router-dom'

const linkBase = 'px-3 py-2 rounded-md text-sm font-medium transition-colors'

function navClass({ isActive }: { isActive: boolean }) {
  return isActive
    ? `${linkBase} bg-indigo-100 text-indigo-700`
    : `${linkBase} text-slate-600 hover:bg-slate-100 hover:text-slate-900`
}

export default function Navbar() {
  // Auth-aware links arrive in Phase 2. For now, static shell.
  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
      <nav className="w-full max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link to="/" className="text-lg font-bold text-indigo-600">
          TutorMatch
        </Link>
        <div className="flex items-center gap-1">
          <NavLink to="/tutors" className={navClass}>
            Find Tutors
          </NavLink>
          <NavLink to="/dashboard" className={navClass}>
            Dashboard
          </NavLink>
          <NavLink to="/login" className={navClass}>
            Log in
          </NavLink>
          <NavLink
            to="/signup"
            className={`${linkBase} bg-indigo-600 text-white hover:bg-indigo-700`}
          >
            Sign up
          </NavLink>
        </div>
      </nav>
    </header>
  )
}
