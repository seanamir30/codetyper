import { useState } from 'react'
import { Helmet } from 'react-helmet'
import { Link, useNavigate } from 'react-router-dom'
import TopBar from '../components/TopBar'
import { useAuth } from '../lib/auth'

const Login = () => {
  const { signInWithPassword, signInWithGoogle } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSubmitting(true)
    const { error } = await signInWithPassword(email, password)
    setSubmitting(false)
    if (error) setError(error)
    else navigate('/')
  }

  const onGoogle = async () => {
    setError(null)
    const { error } = await signInWithGoogle()
    if (error) setError(error)
  }

  return (
    <>
      <Helmet>
        <title>Log in | CodeTyper</title>
        <meta name="robots" content="noindex" />
      </Helmet>

      <main className="min-h-screen bg-bg text-text font-mono flex flex-col">
        <TopBar />

        <section className="flex-1 w-full max-w-md mx-auto px-6 py-12 flex flex-col justify-center">
          <h1 className="text-main text-3xl mb-8">log in</h1>

          <button
            onClick={onGoogle}
            className="w-full border border-sub/40 hover:border-text/60 text-text py-2.5 rounded transition mb-6"
          >
            continue with Google
          </button>

          <div className="flex items-center gap-3 mb-6 text-sub/60 text-xs">
            <span className="flex-1 h-px bg-sub/30" />
            <span>or</span>
            <span className="flex-1 h-px bg-sub/30" />
          </div>

          <form onSubmit={onSubmit} className="space-y-4">
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
                autoComplete="current-password"
                className="mt-1 w-full bg-subAlt border border-sub/30 focus:border-main text-text px-3 py-2 rounded outline-none transition"
              />
            </label>

            {error && <p className="text-error text-sm">{error}</p>}

            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-main text-bg font-semibold py-2.5 rounded hover:opacity-90 transition disabled:opacity-50"
            >
              {submitting ? 'signing in...' : 'log in'}
            </button>
          </form>

          <p className="text-sub text-sm mt-6 text-center">
            no account?{' '}
            <Link to="/signup" className="text-main hover:underline">
              sign up
            </Link>
          </p>
          <p className="text-sub text-sm mt-2 text-center">
            <Link to="/" className="hover:text-text transition">
              &larr; back to typing
            </Link>
          </p>
        </section>
      </main>
    </>
  )
}

export default Login
