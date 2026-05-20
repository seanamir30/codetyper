import { useEffect, useMemo, useState } from 'react'
import { Helmet } from 'react-helmet'
// @ts-ignore
import { getLanguages } from '@whitep4nth3r/random-code'
import type { Languages } from '../../types/random-code'
import TopBar from '../components/TopBar'
import { supabase } from '../lib/supabase'

type Row = {
  id: string
  wpm: number
  cpm: number
  accuracy: number
  language: string
  seconds: number
  created_at: string
  profiles: { username: string } | null
}

type TimeRange = 'today' | 'week' | 'all'

const DURATIONS = [10, 30, 60, 120, 300] as const

// Date ranges are evaluated in UTC so leaderboards are consistent for every
// viewer regardless of timezone.
const rangeStart = (range: TimeRange): string | null => {
  if (range === 'all') return null
  const now = new Date()
  if (range === 'today') {
    return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate())).toISOString()
  }
  const weekAgo = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()))
  weekAgo.setUTCDate(weekAgo.getUTCDate() - 7)
  return weekAgo.toISOString()
}

const Leaderboards = () => {
  const languages: Languages = useMemo(() => getLanguages(), [])
  const languageKeys = Object.keys(languages) as (keyof Languages)[]

  const [language, setLanguage] = useState<keyof Languages | 'all'>('all')
  const [seconds, setSeconds] = useState<number | 'all'>(30)
  const [range, setRange] = useState<TimeRange>('today')

  const [rows, setRows] = useState<Row[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    const run = async () => {
      setLoading(true)
      setError(null)
      let q = supabase
        .from('test_results')
        .select('id, wpm, cpm, accuracy, language, seconds, created_at, profiles(username)')
        .order('wpm', { ascending: false })
        .limit(100)

      if (language !== 'all') q = q.eq('language', language)
      if (seconds !== 'all') q = q.eq('seconds', seconds)
      const from = rangeStart(range)
      if (from) q = q.gte('created_at', from)

      const { data, error } = await q
      if (cancelled) return
      if (error) {
        setError(error.message)
        setRows([])
      } else {
        setRows((data ?? []) as unknown as Row[])
      }
      setLoading(false)
    }
    run()
    return () => { cancelled = true }
  }, [language, seconds, range])

  const fmtDate = (iso: string) => {
    const d = new Date(iso)
    return d.toLocaleString('en-GB', {
      timeZone: 'UTC',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    })
  }

  const FilterPill = ({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) => (
    <button
      onClick={onClick}
      className={`px-3 py-1 rounded text-sm transition ${
        active ? 'bg-main text-bg' : 'text-sub hover:text-text'
      }`}
    >
      {children}
    </button>
  )

  return (
    <>
      <Helmet>
        <title>Leaderboards | CodeTyper</title>
        <meta name="description" content="Top typing test scores on CodeTyper. Filter by language, duration, and time range." />
        <link rel="canonical" href="https://codetyper.seancafe.com/leaderboards" />
      </Helmet>

      <main className="min-h-screen bg-bg text-text font-mono flex flex-col">
        <TopBar />

        <section className="flex-1 w-full max-w-5xl mx-auto px-6 py-10">
          <h1 className="text-main text-3xl mb-1">leaderboards</h1>
          <p className="text-sub text-sm mb-8">top scores across CodeTyper · times in UTC</p>

          <div className="space-y-4 mb-8">
            <div>
              <div className="text-sub/70 text-xs uppercase tracking-wide mb-2">when</div>
              <div className="flex flex-wrap gap-1">
                <FilterPill active={range === 'today'} onClick={() => setRange('today')}>today</FilterPill>
                <FilterPill active={range === 'week'} onClick={() => setRange('week')}>this week</FilterPill>
                <FilterPill active={range === 'all'} onClick={() => setRange('all')}>all time</FilterPill>
              </div>
            </div>

            <div>
              <div className="text-sub/70 text-xs uppercase tracking-wide mb-2">duration</div>
              <div className="flex flex-wrap gap-1">
                <FilterPill active={seconds === 'all'} onClick={() => setSeconds('all')}>all</FilterPill>
                {DURATIONS.map((d) => (
                  <FilterPill key={d} active={seconds === d} onClick={() => setSeconds(d)}>
                    {d}s
                  </FilterPill>
                ))}
              </div>
            </div>

            <div>
              <div className="text-sub/70 text-xs uppercase tracking-wide mb-2">language</div>
              <div className="flex flex-wrap gap-1">
                <FilterPill active={language === 'all'} onClick={() => setLanguage('all')}>all</FilterPill>
                {languageKeys.map((k) => (
                  <FilterPill key={k} active={language === k} onClick={() => setLanguage(k)}>
                    {languages[k]}
                  </FilterPill>
                ))}
              </div>
            </div>
          </div>

          {error && <p className="text-error text-sm mb-4">{error}</p>}

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-sub/70 text-xs uppercase tracking-wide">
                <tr>
                  <th className="text-left py-2 pr-4 font-normal">#</th>
                  <th className="text-left py-2 pr-4 font-normal">user</th>
                  <th className="text-right py-2 pr-4 font-normal">wpm</th>
                  <th className="text-right py-2 pr-4 font-normal">cpm</th>
                  <th className="text-right py-2 pr-4 font-normal">acc</th>
                  <th className="text-left py-2 pr-4 font-normal">language</th>
                  <th className="text-right py-2 pr-4 font-normal">time</th>
                  <th className="text-right py-2 font-normal">when</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={8} className="py-8 text-center text-sub">loading...</td></tr>
                ) : rows.length === 0 ? (
                  <tr><td colSpan={8} className="py-8 text-center text-sub">no results yet</td></tr>
                ) : (
                  rows.map((r, i) => (
                    <tr key={r.id} className="border-t border-sub/10">
                      <td className="py-2 pr-4 text-sub">{i + 1}</td>
                      <td className="py-2 pr-4 text-text">{r.profiles?.username ?? '—'}</td>
                      <td className="py-2 pr-4 text-right text-main">{r.wpm}</td>
                      <td className="py-2 pr-4 text-right text-text">{r.cpm}</td>
                      <td className="py-2 pr-4 text-right text-text">{r.accuracy}%</td>
                      <td className="py-2 pr-4 text-sub">
                        {languages[r.language as keyof Languages] ?? r.language}
                      </td>
                      <td className="py-2 pr-4 text-right text-sub">{r.seconds}s</td>
                      <td className="py-2 text-right text-sub/80">{fmtDate(r.created_at)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </>
  )
}

export default Leaderboards
