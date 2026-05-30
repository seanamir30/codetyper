import type { Languages } from '../../../types/random-code'

type Mode = 'timed' | 'practice'

interface ConfigBarProps {
    languages: Languages
    languageKeys: (keyof Languages)[]
    currentLanguage: keyof Languages
    setLanguage: (language: keyof Languages) => void
    durations: number[]
    currentDuration: number
    setDuration: (duration: number) => void
    mode: Mode
    setMode: (mode: Mode) => void
    locked: boolean
}

const formatDuration = (d: number) => (d < 60 ? `${d}` : `${d / 60}m`)

const ConfigBar = ({
    languages,
    languageKeys,
    currentLanguage,
    setLanguage,
    durations,
    currentDuration,
    setDuration,
    mode,
    setMode,
    locked,
}: ConfigBarProps) => {
    return (
        <div className="mx-auto mt-8 flex flex-col items-center gap-2">
            <div
                className={`bg-subAlt rounded px-6 py-3 text-sm text-sub max-w-3xl w-fit transition-opacity ${
                    locked ? 'opacity-40 pointer-events-none' : ''
                }`}
                role="toolbar"
                aria-label="Test configuration"
            >
                <div className="flex flex-wrap justify-center gap-x-3 gap-y-2" role="radiogroup" aria-label="Programming language">
                    {languageKeys.map(key => (
                        <button
                            key={key}
                            onClick={() => setLanguage(key)}
                            className={`transition hover:text-text ${
                                key === currentLanguage ? 'text-main' : ''
                            }`}
                            role="radio"
                            aria-checked={key === currentLanguage}
                        >
                            {languages[key]}
                        </button>
                    ))}
                </div>
                <div className="h-px bg-sub/20 my-3" />
                <div className="flex flex-wrap justify-center items-center gap-x-4 gap-y-2">
                    <div className="flex gap-3" role="radiogroup" aria-label="Test mode">
                        <button
                            onClick={() => setMode('timed')}
                            className={`transition hover:text-text ${mode === 'timed' ? 'text-main' : ''}`}
                            role="radio"
                            aria-checked={mode === 'timed'}
                        >
                            timed
                        </button>
                        <button
                            onClick={() => setMode('practice')}
                            className={`transition hover:text-text ${mode === 'practice' ? 'text-main' : ''}`}
                            role="radio"
                            aria-checked={mode === 'practice'}
                        >
                            practice
                        </button>
                    </div>
                    {mode === 'timed' && (
                        <>
                            <span className="text-sub/40" aria-hidden>|</span>
                            <div className="flex gap-3" role="radiogroup" aria-label="Test duration">
                                {durations.map(d => (
                                    <button
                                        key={d}
                                        onClick={() => setDuration(d)}
                                        className={`transition hover:text-text ${
                                            d === currentDuration ? 'text-main' : ''
                                        }`}
                                        role="radio"
                                        aria-checked={d === currentDuration}
                                    >
                                        {formatDuration(d)}
                                    </button>
                                ))}
                            </div>
                        </>
                    )}
                </div>
            </div>
            <div className="text-sub/60 text-xs text-center">
                {mode === 'practice'
                    ? 'no timer — type at your own pace, finish when ready'
                    : 'auto-indent on · tab to indent · shift+tab to outdent'}
            </div>
        </div>
    )
}

export default ConfigBar
