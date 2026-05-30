import { useEffect, useMemo, useState } from 'react'
import { Helmet } from 'react-helmet'
import { Link } from 'react-router-dom'
// @ts-ignore
import { getLanguages } from '@whitep4nth3r/random-code'
import type { Languages } from '../../types/random-code'
import TopBar from '../components/TopBar'
import { supabase } from '../lib/supabase'
import { useAuth } from '../lib/auth'

type Row = {
  id: string
  wpm: number
  cpm: number
  accuracy: number
  language: string
  seconds: number
  correct: number
  incorrect: number
  created_at: string
}

const History = () => {
  const languages: Languages = useMemo(() => getLanguages(), [])
  const { user, loading: authLoading } = useAuth()

  const [rows, setRows] = useState<Row[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (authLoading) return
    if (!user) {
      setLoading(false)
      return
    }
    let cancelled = false
    const run = async () => {
      setLoading(true)
      setError(null)
      const { data, error } = await supabase
        .from('test_results')
        .select('id, wpm, cpm, accuracy, language, seconds, correct, incorrect, created_at')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(100)
      if (cancelled) return
      if (error) {
        setError(error.message)
        setRows([])
      } else {
        setRows((data ?? []) as Row[])
      }
      setLoading(false)
    }
    run()
    return () => { cancelled = true }
  }, [user, authLoading])

  // Best WPM per language+duration, for a quick "personal bests" summary.
  const bests = useMemo(() => {
    const map = new Map<string, Row>()
    for (const r of rows) {
      const key = `${r.language}:${r.seconds}`
      const cur = map.get(key)
      if (!cur || r.wpm > cur.wpm) map.set(key, r)
    }
    return Array.from(map.values()).sort((a, b) => b.wpm - a.wpm)
  }, [rows])

  const fmtDate = (iso: string) => {
    const d = new Date(iso)
    return d.toLocaleString('en-GB', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    })
  }

  return (
    <>
      <Helmet>
        <title>Your History | CodeTyper</title>
        <meta name="robots" content="noindex" />
      </Helmet>

      <main className="min-h-screen bg-bg text-text font-mono flex flex-col">
        <TopBar />

        <section className="flex-1 w-full max-w-5xl mx-auto px-6 py-10">
          <h1 className="text-main text-3xl mb-1">your history</h1>
          <p className="text-sub text-sm mb-8">your last 100 timed tests · times in local time</p>

          {!authLoading && !user ? (
            <div className="text-sub">
              <p className="mb-4">log in to track your typing history and personal bests.</p>
              <div className="flex gap-3">
                <Link to="/login" className="text-main hover:underline">log in</Link>
                <Link to="/signup" className="text-main hover:underline">sign up</Link>
              </div>
            </div>
          ) : (
            <>
              {bests.length > 0 && (
                <div className="mb-10">
                  <div className="text-sub/70 text-xs uppercase tracking-wide mb-3">personal bests</div>
                  <div className="flex flex-wrap gap-3">
                    {bests.slice(0, 8).map((b) => (
                      <div key={`${b.language}:${b.seconds}`} className="bg-subAlt rounded px-4 py-2">
                        <div className="text-sub text-xs">
                          {languages[b.language as keyof Languages] ?? b.language} · {b.seconds}s
                        </div>
                        <div className="text-main text-xl">{b.wpm} <span className="text-sub text-xs">wpm</span></div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {error && <p className="text-error text-sm mb-4">{error}</p>}

              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="text-sub/70 text-xs uppercase tracking-wide">
                    <tr>
                      <th className="text-left py-2 pr-4 font-normal">when</th>
                      <th className="text-left py-2 pr-4 font-normal">language</th>
                      <th className="text-right py-2 pr-4 font-normal">time</th>
                      <th className="text-right py-2 pr-4 font-normal">wpm</th>
                      <th className="text-right py-2 pr-4 font-normal">cpm</th>
                      <th className="text-right py-2 pr-4 font-normal">acc</th>
                      <th className="text-right py-2 font-normal">chars</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loading ? (
                      <tr><td colSpan={7} className="py-8 text-center text-sub">loading...</td></tr>
                    ) : rows.length === 0 ? (
                      <tr><td colSpan={7} className="py-8 text-center text-sub">no tests yet — go set a record</td></tr>
                    ) : (
                      rows.map((r) => (
                        <tr key={r.id} className="border-t border-sub/10">
                          <td className="py-2 pr-4 text-sub/80">{fmtDate(r.created_at)}</td>
                          <td className="py-2 pr-4 text-sub">
                            {languages[r.language as keyof Languages] ?? r.language}
                          </td>
                          <td className="py-2 pr-4 text-right text-sub">{r.seconds}s</td>
                          <td className="py-2 pr-4 text-right text-main">{r.wpm}</td>
                          <td className="py-2 pr-4 text-right text-text">{r.cpm}</td>
                          <td className="py-2 pr-4 text-right text-text">{r.accuracy}%</td>
                          <td className="py-2 text-right text-sub/80">{r.correct}/{r.incorrect}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </section>
      </main>
    </>
  )
}

export default History
