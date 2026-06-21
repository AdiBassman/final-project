import { Link } from 'react-router-dom'

export default function NotFound() {
  return (
    <section className="text-center py-16">
      <p className="text-6xl font-bold text-indigo-600">404</p>
      <h1 className="mt-4 text-2xl font-semibold text-slate-900">Page not found</h1>
      <p className="mt-2 text-slate-600">That page doesn’t exist.</p>
      <Link
        to="/"
        className="mt-6 inline-block px-5 py-3 rounded-lg bg-indigo-600 text-white font-medium hover:bg-indigo-700 transition-colors"
      >
        Back home
      </Link>
    </section>
  )
}
