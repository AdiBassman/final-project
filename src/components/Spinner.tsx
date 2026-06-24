export default function Spinner({ label = 'Loading…' }: { label?: string }) {
  return <p className="py-12 text-center text-slate-500">{label}</p>
}
