export default function EmptyState({ message }: { message: string }) {
  return (
    <div className="rounded-lg border border-dashed border-slate-300 bg-white py-12 text-center text-slate-500">
      {message}
    </div>
  )
}
