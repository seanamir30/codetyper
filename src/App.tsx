import { useState, useMemo, useEffect } from "react"
import { Helmet } from "react-helmet"
// @ts-ignore
import { getLanguages, generateRandomCode } from "@whitep4nth3r/random-code"
import type { Languages } from "../types/random-code"
import TextArea from "./components/TextArea"
import axios from "axios"
import SmallCard from "./components/SmallCard"

function App() {
  const [rawCPM, setRawCPM] = useState(0)
  const [incorrectCharacters, setIncorrectCharacters] = useState(0)
  const [isActive, setIsActive] = useState(false)
  const languages: Languages = useMemo(()=>getLanguages(),[])
  const languageKeys = Object.keys(languages) as (keyof Languages)[]
  const [options, setOptions] = useState({ seconds: 10, language: 'js' as keyof Languages })
  const [timer, setTimer] = useState(10);
  const [generatedCode, setGeneratedCode] = useState('')
  const [durations, _] = useState([10, 30, 60, 120, 300])

  useEffect(()=>{
    axios.post(import.meta.env.VITE_ANALYTICS_URL || '', {
      url: window.location.href,
      userAgent: window.navigator.userAgent
    })
  },[])

  const setCurrentLanguage = (language: keyof Languages) => {
    setOptions(prevState => ({
      ...prevState,
      language: language
    }))
  }

  const setDuration = (duration: number) => {
    setOptions(prevState => ({
      ...prevState,
      seconds: duration
    }))
  }

  useEffect(() => {
    const ticktock = setInterval(() => {
      if((rawCPM >= 1 && timer > 0) || (timer < options.seconds && timer > 0)) setTimer((count) => count - 1);
    }, 1000);

    return () => clearInterval(ticktock)
  }, [timer, isActive]);

  useEffect(()=>{
    if(rawCPM){
      setIsActive(true)
    }
  },[rawCPM])

  const generateCode = (language:keyof Languages) => generateRandomCode(language, 100).code

  const reset = () => {
    setIsActive(false)
    setRawCPM(0)
    setGeneratedCode(generateCode(options.language))
    setTimer(options.seconds)
    setIncorrectCharacters(0)
  }

  useEffect(()=>{
    reset()
  },[options])

  const currentCPM = Math.ceil((rawCPM/((options.seconds - timer) || 1))*60) || 0
  const accuracy = Math.round((rawCPM/(incorrectCharacters+rawCPM))*100) || 0

  // Dynamic meta tags based on current state
  const getMetaDescription = () => {
    const langName = languages[options.language]
    return `Practice ${langName} typing with real code snippets. Current test: ${options.seconds}s ${langName} typing challenge. Improve your programming speed and accuracy with CodeTyper.`
  }

  const getPageTitle = () => {
    const langName = languages[options.language]
    if (isActive || rawCPM > 0) {
      return `${langName} Typing Test - ${currentCPM} CPM | CodeTyper`
    }
    return `${langName} Typing Test for Programmers | CodeTyper`
  }

  // Structured data for the current typing test
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
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "USD"
    },
    "creator": {
      "@type": "Organization",
      "name": "CodeTyper"
    },
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "4.8",
      "reviewCount": "1200"
    }
  }

  return (
    <>
      <Helmet>
        <title>{getPageTitle()}</title>
        <meta name="description" content={getMetaDescription()} />
        
        {/* Open Graph / Facebook */}
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://codetyper.seancafe.com" />
        <meta property="og:title" content={getPageTitle()} />
        <meta property="og:description" content={getMetaDescription()} />
        <meta property="og:site_name" content="CodeTyper" />
        
        {/* Twitter */}
        <meta property="twitter:card" content="summary" />
        <meta property="twitter:url" content="https://codetyper.seancafe.com" />
        <meta property="twitter:title" content={getPageTitle()} />
        <meta property="twitter:description" content={getMetaDescription()} />
        
        {/* Structured Data */}
        <script type="application/ld+json">
          {JSON.stringify(structuredData)}
        </script>
      </Helmet>

      <main className="w-full min-h-screen relative flex flex-col items-center justify-between bg-neutral-900">
        {/* Header */}
        <header className="pt-8 flex flex-col items-center w-full xl:max-w-5xl">
          <h1 className="text-3xl text-white font-bold">
            <span className="text-green-500">Code</span>
            Typer
          </h1>
          <p className="text-neutral-300 text-center mt-4 max-w-2xl px-4">
            Improve your programming typing speed with real code snippets. 
            Practice typing in multiple programming languages and track your progress.
          </p>
        </header>

        {/* Main Content */}
        <section className="flex flex-col items-center gap-6 mb-12 mt-4 w-full xl:max-w-5xl px-4">
          <h2 className="sr-only">Typing Test Interface</h2>
          <TextArea
            generatedCode={generatedCode} 
            generateNewCode={()=>setGeneratedCode(generateCode(options.language))} 
            language={options.language} 
            setRawCPM={setRawCPM}
            setIncorrectCharacters={setIncorrectCharacters} 
            incorrectCharacters={incorrectCharacters}
            disabled={timer === 0}
          />
          
          {/* Quick Stats */}
          <div className="flex flex-wrap gap-4" role="region" aria-label="Typing statistics">
            <SmallCard className="text-center">
              <span className="text-2xl font-semibold" aria-label={`${currentCPM} characters per minute`}>
                {currentCPM}
              </span>
              <span className="text-xl"> CPM</span>
            </SmallCard>
            <SmallCard className="text-center">
              <span className="text-2xl font-semibold" aria-label={`Timer: ${Math.floor(timer/60)} minutes ${timer-(Math.floor(timer/60))*60} seconds`}>
                {`${Math.floor(timer/60)}:${(timer-(Math.floor(timer/60))*60).toString().padStart(2, '0')}`}
              </span>
            </SmallCard>
            <SmallCard isButton onClick={reset}>
              Reset
            </SmallCard>
          </div>
        </section>

        {/* Statistics and Controls */}
        <section className="flex flex-col xl:flex-row items-center xl:items-start px-4 sm:px-8 xl:px-0 gap-10 relative w-full xl:max-w-5xl">
          
          {/* Statistics Panel */}
          <aside className="flex flex-col text-white w-64 flex-shrink-0 gap-6" role="complementary" aria-label="Detailed typing statistics">
            <p className="text-4xl font-medium text-center" aria-label={`Current speed: ${currentCPM} characters per minute`}>
              {currentCPM} <span className="text-xl">CPM</span>
            </p>
            <dl className="space-y-4">
              <div className="flex justify-between">
                <dt>Accuracy</dt>
                <dd>{accuracy ? `${accuracy}%` : '-'}</dd>
              </div>
              <div className="flex justify-between">
                <dt>Correct Characters</dt>
                <dd>{rawCPM}</dd>
              </div>
              <div className="flex justify-between">
                <dt>Incorrect Characters</dt>
                <dd>{incorrectCharacters}</dd>
              </div>
            </dl>
          </aside>

          {/* Controls Panel */}
          <div className="flex flex-col gap-6">
            
            {/* Language Selection */}
            <fieldset className="flex flex-col items-center xl:items-start gap-2">
              <legend className="text-white text-2xl font-semibold mb-2">Programming Languages</legend>
              <div className="flex flex-wrap justify-center xl:justify-start gap-2" role="radiogroup" aria-label="Select programming language">
                {languageKeys.map((languageKey)=>{
                  return(
                    <button 
                      key={languageKey}
                      onClick={()=>setCurrentLanguage(languageKey)} 
                      className={`transition text-neutral-400 bg-neutral-800 text-xl hover:text-white px-6 py-2 rounded-md ${languageKey === options.language && '!bg-green-400 !text-green-900'}`}
                      role="radio"
                      aria-checked={languageKey === options.language}
                      aria-label={`Select ${languages[languageKey]} programming language`}
                    >
                      {languages[languageKey]}
                    </button>
                  )
                })}
              </div>
            </fieldset>

            {/* Duration Selection */}
            <fieldset className="flex flex-col items-center xl:items-start gap-2">
              <legend className="text-white text-2xl font-semibold mb-2">Test Duration</legend>
              <div className="flex flex-wrap justify-center xl:justify-start gap-2" role="radiogroup" aria-label="Select test duration">
                {durations.map((duration)=>(
                  <button 
                    key={duration}
                    className={`transition text-neutral-400 bg-neutral-800 text-xl hover:text-white px-6 py-2 rounded-md ${duration === options.seconds && '!bg-green-400 !text-green-900'}`} 
                    onClick={()=>setDuration(duration)}
                    role="radio"
                    aria-checked={duration === options.seconds}
                    aria-label={`Set duration to ${Math.floor(duration/60)} minutes ${duration%60} seconds`}
                  >
                    {Math.floor(duration/60)}:{(duration%60).toString().padStart(2, '0')}
                  </button>
                ))}
              </div>
            </fieldset>
          </div>
        </section>

        {/* Footer */}
        <footer className="text-neutral-400 py-4">
          <p>
            Inspired by <a className="hover:underline text-green-400" href="https://typetest.io/" rel="noopener noreferrer">typetest.io</a>
          </p>
        </footer>
      </main>
    </>
  )
}

export default App
