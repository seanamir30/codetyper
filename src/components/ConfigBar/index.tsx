import type { Languages } from '../../../types/random-code'

interface ConfigBarProps {
    languages: Languages
    languageKeys: (keyof Languages)[]
    currentLanguage: keyof Languages
    setLanguage: (language: keyof Languages) => void
    durations: number[]
    currentDuration: number
    setDuration: (duration: number) => void
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
    locked,
}: ConfigBarProps) => {
    return (
        <div
            className={`bg-subAlt rounded mx-auto mt-8 px-6 py-3 text-sm text-sub max-w-3xl w-fit transition-opacity ${
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
            <div className="flex justify-center gap-3" role="radiogroup" aria-label="Test duration">
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
        </div>
    )
}

export default ConfigBar
