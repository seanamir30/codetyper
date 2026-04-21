interface ResultsProps {
    wpm: number
    cpm: number
    accuracy: number
    correct: number
    incorrect: number
    seconds: number
    language: string
}

const Stat = ({ value, label }: { value: string | number; label: string }) => (
    <div>
        <div className="text-sub text-xs uppercase tracking-wide">{label}</div>
        <div className="text-text text-2xl">{value}</div>
    </div>
)

const Results = ({ wpm, cpm, accuracy, correct, incorrect, seconds, language }: ResultsProps) => {
    return (
        <div className="w-full flex flex-col gap-10" role="region" aria-label="Test results">
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
                <Stat value={`${seconds}s`} label="time" />
                <Stat value={language} label="language" />
                <Stat value={correct + incorrect} label="keystrokes" />
            </div>
            <div className="text-sub text-xs mt-2">tab &mdash; restart test</div>
        </div>
    )
}

export default Results
