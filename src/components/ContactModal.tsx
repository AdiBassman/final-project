import { useEffect, useState, type FormEvent } from 'react'
import { useAuth } from '../auth/useAuth'
import { sendLessonRequest } from '../lib/queries'
import type { Subject } from '../lib/types'

interface ContactModalProps {
  tutorId: string
  tutorName: string
  subjects: Subject[]
  onClose: () => void
}

const inputClass =
  'w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500'

export default function ContactModal({ tutorId, tutorName, subjects, onClose }: ContactModalProps) {
  const { user, profile } = useAuth()
  const [name, setName] = useState(profile?.full_name ?? '')
  const [email, setEmail] = useState(user?.email ?? '')
  const [subjectId, setSubjectId] = useState<number | null>(null)
  const [message, setMessage] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [sent, setSent] = useState(false)

  // Close on Escape for keyboard users.
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onClose])

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!user) return
    setError(null)
    setSubmitting(true)
    try {
      await sendLessonRequest({
        tutorId,
        studentId: user.id,
        studentName: name,
        studentEmail: email,
        message,
        subjectId,
      })
      setSent(true)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to send request')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="contact-modal-title"
        className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between">
          <h2 id="contact-modal-title" className="text-lg font-bold text-slate-900">
            Contact {tutorName}
          </h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        {sent ? (
          <div className="mt-6 text-center">
            <p className="text-green-700">Your request was sent to {tutorName}.</p>
            <button
              onClick={onClose}
              className="mt-4 rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
            >
              Done
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-4 space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700">Your name</label>
              <input
                type="text"
                required
                autoFocus
                value={name}
                onChange={(e) => setName(e.target.value)}
                className={`mt-1 ${inputClass}`}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">Your email</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={`mt-1 ${inputClass}`}
              />
            </div>
            {subjects.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-slate-700">
                  Subject (optional)
                </label>
                <select
                  value={subjectId ?? ''}
                  onChange={(e) => setSubjectId(e.target.value ? Number(e.target.value) : null)}
                  className={`mt-1 ${inputClass}`}
                >
                  <option value="">— Select a subject —</option>
                  {subjects.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-slate-700">Message</label>
              <textarea
                required
                rows={4}
                maxLength={1000}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className={`mt-1 ${inputClass}`}
                placeholder="What would you like help with?"
              />
              <p className="mt-1 text-right text-xs text-slate-400">{message.length}/1000</p>
            </div>

            {error && <p className="text-sm text-red-600">{error}</p>}

            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={onClose}
                className="rounded-md border border-slate-300 px-4 py-2 text-sm text-slate-700 hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting || !message.trim()}
                className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
              >
                {submitting ? 'Sending…' : 'Send request'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
