import { useState, useMemo, useEffect } from "react"
// @ts-ignore
import { getLanguages, generateRandomCode } from "@whitep4nth3r/random-code"
import type { Languages } from "../types/random-code"
import TextArea from "./components/TextArea"
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

  return (
    <main className="w-full min-h-screen relative flex flex-col items-center justify-between bg-neutral-900">
      <div className="pt-16 pb-16 flex flex-col items-center w-full xl:max-w-5xl">
        <h1 className="text-3xl text-white font-bold">
          <span className="text-green-500">Code</span>
          Typer
        </h1>
        <section className="flex flex-col items-center gap-6 my-12">
          <TextArea
            generatedCode={generatedCode} 
            generateNewCode={()=>setGeneratedCode(generateCode(options.language))} 
            language={options.language} 
            setRawCPM={setRawCPM}
            setIncorrectCharacters={setIncorrectCharacters} 
            incorrectCharacters={incorrectCharacters}
            disabled={timer === 0}
          />
          <div className="flex flex-wrap gap-4">
            <SmallCard className="text-center">
              <span className="text-2xl font-semibold">{Math.ceil((rawCPM/((options.seconds - timer) || 1))*60) || 0}</span>
              <span className="text-xl"> CPM</span>
            </SmallCard>
            <SmallCard className="text-center">
              <span className="text-2xl font-semibold">
                {`${Math.floor(timer/60)}:${(timer-(Math.floor(timer/60))*60).toString().padStart(2, '0')}`}
              </span>
            </SmallCard>
            <SmallCard isButton onClick={reset}>
              Reset
            </SmallCard>
          </div>
        </section>
        <section className="flex flex-col xl:flex-row items-center xl:items-start px-4 sm:px-8 xl:px-0 gap-10 relative">
          <div className="flex flex-col text-white w-64 flex-shrink-0 gap-6">
            <h1 className="text-4xl font-medium text-center">{Math.ceil((rawCPM/((options.seconds - timer) || 1))*60) || 0} <span className="text-xl">CPM</span></h1>
            <div className="flex justify-between">
              <p>Accuracy</p>
              <p>{Math.round((rawCPM/(incorrectCharacters+rawCPM))*100) || '-'}{Math.round((rawCPM/(incorrectCharacters+rawCPM))*100) ? '%' : null}</p>
            </div>
            <div className="flex justify-between">
              <p>Correct Characters</p>
              <p>{rawCPM}</p>
            </div>
            <div className="flex justify-between">
              <p>Incorrect Characters</p>
              <p>{incorrectCharacters}</p>
            </div>
          </div>
          <div className="flex flex-col gap-6">
            <div className="flex flex-col items-center xl:items-start gap-2">
              <h1 className="text-white text-2xl font-semibold">Languages</h1>
              <div className="flex flex-wrap justify-center xl:justify-start gap-2">
                {languageKeys.map((languageKey)=>{
                  return(
                    <button onClick={()=>setCurrentLanguage(languageKey)} className={`transition text-neutral-400 bg-neutral-800 text-xl hover:text-white px-6 py-2 rounded-md ${languageKey === options.language && '!bg-neutral-700 !text-white'}`}>{languages[languageKey]}</button>
                  )
                })}
              </div>
            </div>
            <div className="flex flex-col items-center xl:items-start gap-2">
              <h1 className="text-white text-2xl font-semibold">Duration</h1>
              <div className="flex flex-wrap justify-center xl:justify-start gap-2">
                {durations.map((duration)=>(
                  <button className={`transition text-neutral-400 bg-neutral-800 text-xl hover:text-white px-6 py-2 rounded-md ${duration === options.seconds && '!bg-neutral-700 !text-white'}`} onClick={()=>setDuration(duration)}>{Math.floor(duration/60)}:{(duration%60).toString().padStart(2, '0')}</button>
                ))}
              </div>
            </div>
          </div>
        </section>
      </div>
      <footer className="text-neutral-400 py-4">
        Inspired by <a className="hover:underline" href="https://typetest.io/">typetest.io</a>
      </footer>
    </main>
  )
}

export default App
