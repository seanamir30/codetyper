import { useState, useMemo, useEffect } from "react"
import { Helmet } from "react-helmet"
import { Link, useParams, useNavigate } from "react-router-dom"
// @ts-ignore
import { getLanguages, generateRandomCode } from "@whitep4nth3r/random-code"
import type { Languages } from "../types/random-code"
import axios from "axios"
import TextArea from "./components/TextArea"
import TopBar from "./components/TopBar"
import ConfigBar from "./components/ConfigBar"
import Results from "./components/Results"
import { parseLangSlug, keyToSlug } from "./lib/languages"
import { supabase } from "./lib/supabase"
import { useAuth } from "./lib/auth"
import { useProfile } from "./lib/profile"

function App() {
  const params = useParams<{ slug?: string }>()
  const navigate = useNavigate()
  const { user } = useAuth()
  const { profile } = useProfile()
  const urlLangKey = useMemo(() => parseLangSlug(params.slug), [params.slug])
  const isLangPage = urlLangKey !== null

  useEffect(() => {
    if (params.slug && !urlLangKey) navigate('/', { replace: true })
  }, [params.slug, urlLangKey])

  const [rawCPM, setRawCPM] = useState(0)
  const [incorrectCharacters, setIncorrectCharacters] = useState(0)
  const [isActive, setIsActive] = useState(false)
  const languages: Languages = useMemo(() => getLanguages(), [])
  const languageKeys = Object.keys(languages) as (keyof Languages)[]
  const [options, setOptions] = useState({
    seconds: 30,
    language: (urlLangKey || 'js') as keyof Languages,
  })

  useEffect(() => {
    if (urlLangKey && urlLangKey !== options.language) {
      setOptions(prev => ({ ...prev, language: urlLangKey }))
    }
  }, [urlLangKey])
  const [timer, setTimer] = useState(30)
  const [generatedCode, setGeneratedCode] = useState('')
  const [durations] = useState([10, 30, 60, 120, 300])

  useEffect(() => {
    axios.post(import.meta.env.VITE_ANALYTICS_URL || '', {
      url: window.location.href,
      userAgent: window.navigator.userAgent
    })
  }, [])

  const setCurrentLanguage = (language: keyof Languages) => {
    setOptions(prev => ({ ...prev, language }))
  }

  const setDuration = (duration: number) => {
    setOptions(prev => ({ ...prev, seconds: duration }))
  }

  useEffect(() => {
    const ticktock = setInterval(() => {
      if ((rawCPM >= 1 && timer > 0) || (timer < options.seconds && timer > 0)) setTimer(count => count - 1)
    }, 1000)
    return () => clearInterval(ticktock)
  }, [timer, isActive])

  useEffect(() => {
    if (rawCPM) setIsActive(true)
  }, [rawCPM])

  const generateCode = (language: keyof Languages) => generateRandomCode(language, 100).code

  const reset = () => {
    setIsActive(false)
    setRawCPM(0)
    setGeneratedCode(generateCode(options.language))
    setTimer(options.seconds)
    setIncorrectCharacters(0)
  }

  useEffect(() => {
    reset()
  }, [options])

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (timer === 0 && e.key === 'Tab') {
        e.preventDefault()
        reset()
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [timer, options])

  const currentCPM = Math.ceil((rawCPM / ((options.seconds - timer) || 1)) * 60) || 0
  const currentWPM = Math.round(currentCPM / 5) || 0
  const accuracy = Math.round((rawCPM / (incorrectCharacters + rawCPM)) * 100) || 0

  const [savedTestKey, setSavedTestKey] = useState<string | null>(null)
  useEffect(() => {
    if (timer !== 0) return
    if (!user || !profile) return
    if (rawCPM === 0 && incorrectCharacters === 0) return
    const key = `${user.id}:${options.seconds}:${options.language}:${rawCPM}:${incorrectCharacters}`
    if (savedTestKey === key) return
    setSavedTestKey(key)
    supabase
      .from('test_results')
      .insert({
        user_id: user.id,
        language: options.language,
        seconds: options.seconds,
        wpm: currentWPM,
        cpm: currentCPM,
        accuracy,
        correct: rawCPM,
        incorrect: incorrectCharacters,
      })
      .then(({ error }) => {
        if (error) console.error('save result error', error)
      })
  }, [timer, user, profile])

  const langName = languages[options.language]

  const getMetaDescription = () => {
    if (isLangPage) {
      return `${langName} typing test — practice ${langName} with real code snippets. Improve your programming speed, measure your CPM and WPM, and track accuracy on CodeTyper.`
    }
    return `Practice ${langName} typing with real code snippets. Current test: ${options.seconds}s ${langName} typing challenge. Improve your programming speed and accuracy with CodeTyper.`
  }

  const getPageTitle = () => {
    if (isLangPage) {
      return `${langName} Typing Test | Practice ${langName} Code | CodeTyper`
    }
    if (isActive || rawCPM > 0) {
      return `${langName} Typing Test - ${currentCPM} CPM | CodeTyper`
    }
    return `${langName} Typing Test for Programmers | CodeTyper`
  }

  const canonicalUrl = isLangPage
    ? `https://codetyper.seancafe.com/${keyToSlug[options.language]}-typing-test`
    : 'https://codetyper.seancafe.com/'

  const h1Text = isLangPage
    ? `${langName} Typing Test`
    : 'Typing Test for Programmers'

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "CodeTyper",
    "description": "A specialized typing test for programmers featuring real code snippets in multiple programming languages",
    "url": "https://codetyper.seancafe.com",
    "applicationCategory": "DeveloperApplication",
    "operatingSystem": "Any",
    "featureList": [
      "Multiple programming languages support",
      "Real code snippet practice",
      "Typing speed measurement (CPM/WPM)",
      "Accuracy tracking",
      "Customizable test duration"
    ],
    "offers": { "@type": "Offer", "price": "0", "priceCurrency": "USD" },
    "creator": { "@type": "Organization", "name": "CodeTyper" },
    "aggregateRating": { "@type": "AggregateRating", "ratingValue": "4.8", "reviewCount": "1200" }
  }

  const testOver = timer === 0

  return (
    <>
      <Helmet>
        <title>{getPageTitle()}</title>
        <meta name="description" content={getMetaDescription()} />
        <link rel="canonical" href={canonicalUrl} />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={canonicalUrl} />
        <meta property="og:title" content={getPageTitle()} />
        <meta property="og:description" content={getMetaDescription()} />
        <meta property="og:site_name" content="CodeTyper" />
        <meta property="twitter:card" content="summary" />
        <meta property="twitter:url" content={canonicalUrl} />
        <meta property="twitter:title" content={getPageTitle()} />
        <meta property="twitter:description" content={getMetaDescription()} />
        <script type="application/ld+json">{JSON.stringify(structuredData)}</script>
      </Helmet>

      <main className="min-h-screen bg-bg text-text font-mono flex flex-col">
        <h1 className="sr-only">{h1Text}</h1>
        <TopBar />
        <ConfigBar
          languages={languages}
          languageKeys={languageKeys}
          currentLanguage={options.language}
          setLanguage={setCurrentLanguage}
          durations={durations}
          currentDuration={options.seconds}
          setDuration={setDuration}
          locked={isActive && !testOver}
        />

        <section className="flex-1 flex flex-col items-center justify-center w-full max-w-5xl mx-auto px-6 py-10">
          {testOver ? (
            <Results
              wpm={currentWPM}
              cpm={currentCPM}
              accuracy={accuracy}
              correct={rawCPM}
              incorrect={incorrectCharacters}
              seconds={options.seconds}
              language={languages[options.language]}
            />
          ) : (
            <>
              <div className="w-full text-main text-3xl mb-4" aria-label={`Time remaining: ${timer} seconds`}>
                {Math.floor(timer / 60)}:{(timer % 60).toString().padStart(2, '0')}
              </div>
              <TextArea
                generatedCode={generatedCode}
                generateNewCode={() => setGeneratedCode(generateCode(options.language))}
                language={options.language}
                setRawCPM={setRawCPM}
                setIncorrectCharacters={setIncorrectCharacters}
                incorrectCharacters={incorrectCharacters}
                disabled={testOver}
              />
              <button
                onClick={reset}
                className="mt-10 text-sub hover:text-text transition text-xl"
                aria-label="Restart test"
              >
                ↻
              </button>
            </>
          )}
        </section>

        <footer className="w-full flex flex-wrap justify-center items-center gap-x-4 gap-y-1 py-6 text-sub text-xs">
          <span>
            created by{' '}
            <a
              href="https://seancafe.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-main hover:underline"
            >
              sean cafe
            </a>
          </span>
          <span className="text-sub/50">·</span>
          <a href="mailto:hi@seancafe.com" className="hover:text-text transition">
            contact
          </a>
          <span className="text-sub/50">·</span>
          <a
            href="https://github.com/seanamir30/codetyper/issues/new"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-text transition"
          >
            report a bug
          </a>
          <span className="text-sub/50">·</span>
          <Link to="/about" className="hover:text-text transition">
            about
          </Link>
        </footer>
      </main>
    </>
  )
}

export default App
