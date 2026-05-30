interface ResultsProps {
    wpm: number
    cpm: number
    accuracy: number
    correct: number
    incorrect: number
    seconds: number
    language: string
    mode: 'timed' | 'practice'
    onRestart: () => void
    personalBest: number | null
    isPersonalBest: boolean
}

const Stat = ({ value, label }: { value: string | number; label: string }) => (
    <div>
        <div className="text-sub text-xs uppercase tracking-wide">{label}</div>
        <div className="text-text text-2xl">{value}</div>
    </div>
)

const Results = ({ wpm, cpm, accuracy, correct, incorrect, seconds, language, mode, onRestart, personalBest, isPersonalBest }: ResultsProps) => {
    return (
        <div className="w-full flex flex-col gap-10" role="region" aria-label="Test results">
            {isPersonalBest && (
                <div className="self-start flex items-center gap-2 text-main text-sm bg-main/10 border border-main/30 rounded px-3 py-1">
                    <span aria-hidden>★</span> new personal best!
                </div>
            )}
            <div className="flex flex-wrap items-end gap-x-16 gap-y-6">
                <div>
                    <div className="text-sub text-sm">wpm</div>
                    <div className="text-main text-7xl font-medium leading-none">{wpm}</div>
                </div>
                <div>
                    <div className="text-sub text-sm">cpm</div>
                    <div className="text-main text-7xl font-medium leading-none">{cpm}</div>
                </div>
                <div>
                    <div className="text-sub text-sm">acc</div>
                    <div className="text-main text-7xl font-medium leading-none">{accuracy}%</div>
                </div>
            </div>
            <div className="flex flex-wrap gap-x-12 gap-y-4">
                <Stat value={`${correct}/${incorrect}`} label="characters" />
                <Stat value={`${seconds}s`} label={mode === 'practice' ? 'elapsed' : 'time'} />
                <Stat value={language} label="language" />
                <Stat value={correct + incorrect} label="keystrokes" />
                {personalBest !== null && !isPersonalBest && (
                    <Stat value={personalBest} label="your best" />
                )}
            </div>
            <div className="flex items-center gap-4 mt-2">
                <button
                    onClick={onRestart}
                    className="bg-main text-bg rounded px-5 py-2 text-sm font-medium hover:opacity-90 transition"
                    aria-label="Start next test"
                >
                    next test
                </button>
                <span className="text-sub text-xs">or press tab</span>
            </div>
        </div>
    )
}

export default Results
