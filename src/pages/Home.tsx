import { Link } from 'react-router-dom'

export default function Home() {
  return (
    <section className="text-center py-12">
      <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-slate-900">
        Find the right tutor, faster.
      </h1>
      <p className="mt-4 text-lg text-slate-600 max-w-2xl mx-auto">
        TutorMatch centralizes private-tutor discovery. Search by subject, city,
        and online availability — then send a lesson request in one click.
      </p>
      <div className="mt-8 flex items-center justify-center gap-3">
        <Link
          to="/tutors"
          className="px-5 py-3 rounded-lg bg-indigo-600 text-white font-medium hover:bg-indigo-700 transition-colors"
        >
          Browse tutors
        </Link>
        <Link
          to="/signup"
          className="px-5 py-3 rounded-lg border border-slate-300 text-slate-700 font-medium hover:bg-slate-100 transition-colors"
        >
          Become a tutor
        </Link>
      </div>
    </section>
  )
}
