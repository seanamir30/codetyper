import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'

const AuthCallback = () => {
  const navigate = useNavigate()
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const run = async () => {
      const { data, error } = await supabase.auth.getSession()
      if (error) {
        setError(error.message)
        return
      }
      if (data.session) {
        // Pre-check the profile so the username modal can render immediately
        // on the landing page instead of waiting for ProfileProvider's fetch.
        const { data: existing } = await supabase
          .from('profiles')
          .select('id')
          .eq('id', data.session.user.id)
          .maybeSingle()
        if (!existing) sessionStorage.setItem('needs_username', '1')
        navigate('/', { replace: true })
      } else {
        const params = new URLSearchParams(window.location.hash.replace(/^#/, ''))
        const errDesc = params.get('error_description')
        if (errDesc) setError(errDesc)
        else navigate('/login', { replace: true })
      }
    }
    run()
  }, [navigate])

  return (
    <main className="min-h-screen bg-bg text-text font-mono flex items-center justify-center">
      {error ? (
        <div className="text-error text-sm max-w-md text-center px-6">{error}</div>
      ) : (
        <div className="text-sub text-sm">signing you in...</div>
      )}
    </main>
  )
}

export default AuthCallback
