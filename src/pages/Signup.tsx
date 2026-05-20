import { useState } from 'react'
import { Helmet } from 'react-helmet'
import { Link, useNavigate } from 'react-router-dom'
import TopBar from '../components/TopBar'
import { useAuth } from '../lib/auth'
import { useProfile } from '../lib/profile'
import { supabase } from '../lib/supabase'

const USERNAME_RE = /^[a-z0-9_]{3,20}$/

const Signup = () => {
  const { signUpWithPassword, signInWithGoogle } = useAuth()
  const { refresh } = useProfile()
  const navigate = useNavigate()
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [needsConfirm, setNeedsConfirm] = useState(false)

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    const handle = username.trim().toLowerCase()
    if (!USERNAME_RE.test(handle)) {
      setError('username: 3–20 chars, lowercase letters, digits, or underscores')
      return
    }

    setSubmitting(true)

    // Pre-check username availability so we don't create an orphaned auth user
    // when the handle is taken. (Race conditions are still caught by the unique
    // constraint at insert time below.)
    const { data: existing, error: lookupErr } = await supabase
      .from('profiles')
      .select('id')
      .eq('username', handle)
      .maybeSingle()
    if (lookupErr) {
      setSubmitting(false)
      setError(lookupErr.message)
      return
    }
    if (existing) {
      setSubmitting(false)
      setError('that username is taken')
      return
    }

    const { error: signUpErr } = await signUpWithPassword(email, password)
    if (signUpErr) {
      setSubmitting(false)
      setError(signUpErr)
      return
    }

    // If email confirmation is required, there's no session yet — we can't
    // insert the profile (RLS blocks it). Stash the desired username and let
    // /onboarding finalize it after the user confirms and signs in.
    const { data: sessionData } = await supabase.auth.getSession()
    if (!sessionData.session) {
      sessionStorage.setItem('pending_username', handle)
      setSubmitting(false)
      setNeedsConfirm(true)
      return
    }

    const { error: insertErr } = await supabase
      .from('profiles')
      .insert({ id: sessionData.session.user.id, username: handle })
    setSubmitting(false)
    if (insertErr) {
      if (insertErr.code === '23505') setError('that username is taken')
      else setError(insertErr.message)
      return
    }
    await refresh()
    navigate('/', { replace: true })
  }

  const onGoogle = async () => {
    setError(null)
    const { error } = await signInWithGoogle()
    if (error) setError(error)
  }

  return (
    <>
      <Helmet>
        <title>Sign up | CodeTyper</title>
        <meta name="robots" content="noindex" />
      </Helmet>

      <main className="min-h-screen bg-bg text-text font-mono flex flex-col">
        <TopBar />

        <section className="flex-1 w-full max-w-md mx-auto px-6 py-12 flex flex-col justify-center">
          <h1 className="text-main text-3xl mb-8">sign up</h1>

          {needsConfirm ? (
            <div className="space-y-4">
              <p className="text-text">
                Check your email — we sent you a confirmation link.
              </p>
              <p className="text-sub text-sm">
                Once confirmed, you'll be asked to finalize your username on first login.
              </p>
              <Link to="/" className="text-sub hover:text-text transition block">
                &larr; back to typing
              </Link>
            </div>
          ) : (
            <>
              <button
                onClick={onGoogle}
                className="w-full border border-sub/40 hover:border-text/60 text-text py-2.5 rounded transition mb-6"
              >
                continue with Google
              </button>
              <p className="text-sub/70 text-xs mb-6 text-center">
                you'll pick your username after Google sign-in
              </p>

              <div className="flex items-center gap-3 mb-6 text-sub/60 text-xs">
                <span className="flex-1 h-px bg-sub/30" />
                <span>or</span>
                <span className="flex-1 h-px bg-sub/30" />
              </div>

              <form onSubmit={onSubmit} className="space-y-4">
                <label className="block">
                  <span className="text-sub text-sm">username</span>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                    autoComplete="username"
                    className="mt-1 w-full bg-subAlt border border-sub/30 focus:border-main text-text px-3 py-2 rounded outline-none transition"
                  />
                  <span className="text-sub/70 text-xs mt-1 block">
                    3–20 chars · lowercase letters, digits, underscores
                  </span>
                </label>
                <label className="block">
                  <span className="text-sub text-sm">email</span>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    autoComplete="email"
                    className="mt-1 w-full bg-subAlt border border-sub/30 focus:border-main text-text px-3 py-2 rounded outline-none transition"
                  />
                </label>
                <label className="block">
                  <span className="text-sub text-sm">password</span>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={8}
                    autoComplete="new-password"
                    className="mt-1 w-full bg-subAlt border border-sub/30 focus:border-main text-text px-3 py-2 rounded outline-none transition"
                  />
                  <span className="text-sub/70 text-xs mt-1 block">min 8 characters</span>
                </label>

                {error && <p className="text-error text-sm">{error}</p>}

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full bg-main text-bg font-semibold py-2.5 rounded hover:opacity-90 transition disabled:opacity-50"
                >
                  {submitting ? 'creating account...' : 'sign up'}
                </button>
              </form>

              <p className="text-sub text-sm mt-6 text-center">
                already have an account?{' '}
                <Link to="/login" className="text-main hover:underline">
                  log in
                </Link>
              </p>
              <p className="text-sub text-sm mt-2 text-center">
                <Link to="/" className="hover:text-text transition">
                  &larr; back to typing
                </Link>
              </p>
            </>
          )}
        </section>
      </main>
    </>
  )
}

export default Signup
