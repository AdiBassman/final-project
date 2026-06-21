interface PageStubProps {
  title: string
  note: string
}

// Temporary placeholder used during Phase 1. Each page gets real content
// in a later phase; this confirms routing works end to end.
export default function PageStub({ title, note }: PageStubProps) {
  return (
    <section className="py-8">
      <h1 className="text-2xl font-bold text-slate-900">{title}</h1>
      <p className="mt-2 text-slate-600">{note}</p>
      <span className="mt-4 inline-block rounded-full bg-amber-100 px-3 py-1 text-xs font-medium text-amber-800">
        Placeholder — coming in a later phase
      </span>
    </section>
  )
}
