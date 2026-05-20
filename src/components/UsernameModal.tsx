import { useEffect, useState } from 'react'
import { useAuth } from '../lib/auth'
import { useProfile } from '../lib/profile'
import { supabase } from '../lib/supabase'

const USERNAME_RE = /^[a-z0-9_]{3,20}$/

const UsernameModal = () => {
  const { user, loading: authLoading, signOut } = useAuth()
  const { profile, loading: profileLoading, refresh } = useProfile()

  const [username, setUsername] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [forceOpen, setForceOpen] = useState(
    typeof window !== 'undefined' && sessionStorage.getItem('needs_username') === '1'
  )

  useEffect(() => {
    const pending = sessionStorage.getItem('pending_username')
    if (pending) setUsername(pending)
  }, [])

  // Show immediately if AuthCallback flagged a missing profile, otherwise wait
  // for the profile fetch to confirm so existing users don't see a flash.
  const open =
    !authLoading &&
    !!user &&
    !profile &&
    (forceOpen || !profileLoading)
  useEffect(() => {
    if (!open) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = prev }
  }, [open])

  if (!open || !user) return null

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    const value = username.trim().toLowerCase()
    if (!USERNAME_RE.test(value)) {
      setError('3–20 chars, lowercase letters, digits, or underscores')
      return
    }
    setSubmitting(true)
    const { error } = await supabase
      .from('profiles')
      .insert({ id: user.id, username: value })
    setSubmitting(false)
    if (error) {
      if (error.code === '23505') setError('that username is taken')
      else setError(error.message)
      return
    }
    sessionStorage.removeItem('pending_username')
    sessionStorage.removeItem('needs_username')
    setForceOpen(false)
    await refresh()
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="username-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-bg/80 backdrop-blur-sm px-4"
    >
      <div className="w-full max-w-md bg-subAlt border border-sub/30 rounded-lg p-6 shadow-2xl">
        <h2 id="username-modal-title" className="text-main text-2xl mb-2">
          pick a username
        </h2>
        <p className="text-sub text-sm mb-6">
          this is your public handle on CodeTyper. you'll need one to continue.
        </p>

        <form onSubmit={onSubmit} className="space-y-4">
          <label className="block">
            <span className="text-sub text-sm">username</span>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              autoFocus
              autoComplete="username"
              className="mt-1 w-full bg-bg border border-sub/30 focus:border-main text-text px-3 py-2 rounded outline-none transition"
            />
            <span className="text-sub/70 text-xs mt-1 block">
              3–20 chars · lowercase letters, digits, underscores
            </span>
          </label>

          {error && <p className="text-error text-sm">{error}</p>}

          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-main text-bg font-semibold py-2.5 rounded hover:opacity-90 transition disabled:opacity-50"
          >
            {submitting ? 'saving...' : 'continue'}
          </button>
        </form>

        <button
          onClick={async () => { await signOut() }}
          className="mt-4 w-full text-sub text-xs hover:text-text transition"
        >
          cancel and sign out
        </button>
      </div>
    </div>
  )
}

export default UsernameModal
