import { useState, useEffect, useRef, useMemo, useLayoutEffect } from 'react'
import { Languages } from '../../../types/random-code'

interface TextAreaProp {
    language: keyof Languages
    setRawCPM: React.Dispatch<React.SetStateAction<number>>
    setIncorrectCharacters: React.Dispatch<React.SetStateAction<number>>
    disabled: boolean
    generatedCode: string
    generateMore: () => string
    incorrectCharacters: number
}

// Trailing whitespace on a line is never typed, so strip it up front.
const normalize = (s: string) =>
    s.split(/\r?\n|\r/g).map(l => l.trimEnd()).join('\n')

// How many lines to keep above/below the caret in the DOM. Keeps the rendered
// node count bounded no matter how long the test runs.
const LINES_ABOVE = 4
const LINES_BELOW = 12
// Append more code once the remaining buffer drops below this many chars.
const REFILL_THRESHOLD = 200

const TextArea = ({ language, setRawCPM, disabled, generatedCode, generateMore, setIncorrectCharacters, incorrectCharacters }: TextAreaProp) => {
    const [codeInput, setCodeInput] = useState('')
    const [isFocused, setIsFocused] = useState(false)
    // The full text to type — grows over time so typing never hits a hard wall.
    const [target, setTarget] = useState('')
    const [errorFlash, setErrorFlash] = useState(false)
    const [scrollY, setScrollY] = useState(0)
    const textareaRef = useRef<HTMLTextAreaElement>(null)
    const contentRef = useRef<HTMLDivElement>(null)
    const caretRef = useRef<HTMLSpanElement>(null)

    const tabWidth = useMemo(() => {
        for (const line of generatedCode.split(/\r?\n/)) {
            const m = line.match(/^ +/)
            if (m) return m[0].length
        }
        return 2
    }, [generatedCode])

    // Seed / reset the buffer whenever a fresh test starts.
    useEffect(() => {
        setCodeInput('')
        setTarget(normalize(generatedCode))
        setScrollY(0)
    }, [language, generatedCode])

    // Keep the buffer ahead of the caret — append more code seamlessly.
    useEffect(() => {
        if (!target) return
        if (target.length - codeInput.length < REFILL_THRESHOLD) {
            const more = normalize(generateMore())
            if (more) setTarget(prev => prev + '\n' + more)
        }
    }, [codeInput.length, target])

    useEffect(() => {
        const classifySpaces = (from: number, count: number): [number, number] => {
            let correct = 0, incorrect = 0
            for (let i = 0; i < count; i++) {
                if (target.charAt(from + i) === ' ') correct++
                else incorrect++
            }
            return [correct, incorrect]
        }

        const enterHandler = (e: KeyboardEvent) => {
            if (e.key !== 'Enter') return
            const target_ch = target.charAt(codeInput.length)
            if (target_ch !== '\n' && target_ch !== '') {
                setIncorrectCharacters(prev => prev + 1)
                e.preventDefault()
                e.stopPropagation()
            }
        }

        const tabHandler = (e: KeyboardEvent) => {
            if (e.key !== 'Tab') return
            e.preventDefault()
            e.stopPropagation()

            if (e.shiftKey) {
                const lastNewlineIdx = codeInput.lastIndexOf('\n')
                const currentLine = codeInput.slice(lastNewlineIdx + 1)
                const leading = (currentLine.match(/^ +/) || [''])[0].length
                if (leading === 0) return
                const remove = Math.min(leading, tabWidth)
                const removedFrom = codeInput.length - remove
                const [wasCorrect, wasIncorrect] = classifySpaces(removedFrom, remove)
                setCodeInput(prev => prev.slice(0, prev.length - remove))
                if (wasCorrect > 0) setRawCPM(prev => Math.max(0, prev - wasCorrect))
                if (wasIncorrect > 0) setIncorrectCharacters(prev => Math.max(0, prev - wasIncorrect))
                return
            }

            const remaining = target.length - codeInput.length
            if (remaining <= 0) return
            const insertN = Math.min(tabWidth, remaining)
            const [correct, incorrect] = classifySpaces(codeInput.length, insertN)
            setCodeInput(prev => prev + ' '.repeat(insertN))
            if (correct > 0) setRawCPM(prev => prev + correct)
            if (incorrect > 0) setIncorrectCharacters(prev => prev + incorrect)
        }

        const keyDownHandler = (e: KeyboardEvent) => {
            tabHandler(e)
            enterHandler(e)
        }

        const el = textareaRef.current
        el?.addEventListener('keydown', keyDownHandler)
        return () => { el?.removeEventListener('keydown', keyDownHandler) }
    }, [codeInput, target, tabWidth])

    useEffect(() => {
        if (incorrectCharacters) {
            setErrorFlash(true)
            const t = setTimeout(() => setErrorFlash(false), 200)
            return () => clearTimeout(t)
        }
    }, [incorrectCharacters])

    useEffect(() => {
        if (!disabled) textareaRef.current?.focus()
    }, [disabled, generatedCode])

    useEffect(() => {
        const el = textareaRef.current
        if (el && document.activeElement === el) {
            el.setSelectionRange(codeInput.length, codeInput.length)
        }
    }, [codeInput])

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        textareaRef.current?.setSelectionRange(codeInput.length, codeInput.length)
        const target_ch = target.charAt(codeInput.length)

        if (e.key === 'Enter') return

        if (e.key !== target_ch && e.key.length === 1) setIncorrectCharacters(prev => prev + 1)

        if (e.key === 'Backspace' && codeInput) {
            // Backspace is a neutral correction — it must never add an error.
            const lastChar = codeInput.charAt(codeInput.length - 1)
            const targetChar = target.charAt(codeInput.length - 1)
            if (lastChar === ' ') {
                // Removing an incorrectly-placed space un-does its earlier error.
                if (lastChar !== targetChar) {
                    setIncorrectCharacters(prev => Math.max(0, prev - 1))
                }
                return
            }
            // Only correctly-typed characters ever reach the input, so undo the
            // correct count (the char will be retyped) without any penalty.
            setRawCPM(prev => Math.max(0, prev - 1))
            return
        }

        if ((e.key !== target_ch) && (e.key !== 'Backspace')) {
            e.preventDefault()
            return
        }

        if (e.key.length === 1) setRawCPM(prev => prev + 1)
    }

    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        let value = e.target.value
        if (value.endsWith('\n') && value.length < target.length) {
            const beforeNewline = value.slice(0, -1)
            const prevNewlineIdx = beforeNewline.lastIndexOf('\n')
            const prevLine = beforeNewline.slice(prevNewlineIdx + 1)
            const prevIndent = (prevLine.match(/^ +/) || [''])[0].length
            let targetLeading = 0
            while (target.charAt(value.length + targetLeading) === ' ') targetLeading++
            const insertN = Math.min(prevIndent, targetLeading)
            if (insertN > 0) {
                value += ' '.repeat(insertN)
                setRawCPM(prev => prev + insertN)
            }
        }
        setCodeInput(value)
    }

    const typed = codeInput.length

    // Only render a window of lines around the caret so the DOM stays small.
    const lines = useMemo(() => target.split('\n'), [target])
    const lineStarts = useMemo(() => {
        const starts: number[] = []
        let acc = 0
        for (const l of lines) { starts.push(acc); acc += l.length + 1 }
        return starts
    }, [lines])
    const currentRow = useMemo(() => {
        let n = 0
        for (let i = 0; i < typed; i++) if (target.charAt(i) === '\n') n++
        return n
    }, [typed, target])

    const windowStart = Math.max(0, currentRow - LINES_ABOVE)
    const windowEnd = Math.min(lines.length - 1, currentRow + LINES_BELOW)
    const startIdx = lineStarts[windowStart] ?? 0
    const endIdx = windowEnd + 1 < lineStarts.length ? lineStarts[windowEnd + 1] - 1 : target.length

    // Keep the caret roughly two lines from the top as the text scrolls.
    useLayoutEffect(() => {
        const content = contentRef.current
        const caret = caretRef.current
        if (!content) return
        if (!caret) return // keep current position when caret isn't shown (e.g. blurred)
        const cs = getComputedStyle(content)
        let lh = parseFloat(cs.lineHeight)
        if (!lh || Number.isNaN(lh)) lh = (parseFloat(cs.fontSize) || 24) * 1.6
        setScrollY(Math.max(0, caret.offsetTop - lh * 2))
    }, [typed, target, windowStart])

    const caretCls = `caret inline-block w-[2px] align-middle -mr-[2px] rounded-sm ${errorFlash ? 'bg-error' : 'bg-main'}`
    const caretStyle = { height: '1.1em' }
    const showCaret = isFocused && !disabled

    const rendered: React.ReactNode[] = []
    for (let i = startIdx; i < endIdx; i++) {
        const ch = target[i]
        const typedCh = i < typed ? codeInput[i] : undefined

        if (i === typed && showCaret) {
            rendered.push(<span key={`caret-${i}`} ref={caretRef} className={caretCls} style={caretStyle} />)
        }

        if (ch === '\n') {
            if (i < typed && typedCh !== ch) {
                rendered.push(<span key={`err-nl-${i}`} className="text-error underline decoration-error">↵</span>)
            }
            rendered.push(<br key={`br-${i}`} />)
            continue
        }

        let cls = 'text-sub'
        let content: React.ReactNode = ch
        if (i < typed) {
            if (typedCh === ch) {
                cls = 'text-text'
            } else {
                cls = 'text-error underline decoration-error'
                if (ch === ' ') content = '·'
            }
        }
        rendered.push(<span key={i} className={cls}>{content}</span>)
    }
    if (typed >= endIdx && showCaret) {
        rendered.push(<span key="caret-end" ref={caretRef} className={caretCls} style={caretStyle} />)
    }

    return (
        <div
            onClick={() => textareaRef.current?.focus()}
            className="relative w-full cursor-text font-mono"
            style={{ fontSize: 'clamp(20px, 2.5vw, 28px)' }}
        >
            <textarea
                ref={textareaRef}
                value={codeInput}
                onChange={handleChange}
                onKeyDown={handleKeyDown}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                onPaste={e => e.preventDefault()}
                disabled={disabled}
                spellCheck={false}
                autoCapitalize="off"
                autoCorrect="off"
                aria-label="Typing area"
                className="absolute inset-0 w-full h-full opacity-0 resize-none outline-none z-10 cursor-text"
            />
            <div
                aria-hidden
                className={`overflow-hidden transition duration-200 ${
                    !isFocused && !disabled ? 'blur-[3px]' : ''
                }`}
                style={{ height: '9.6em' }}
            >
                <div
                    ref={contentRef}
                    className="relative whitespace-pre-wrap leading-[1.6] tracking-wide transition-transform duration-150 ease-out"
                    style={{ transform: `translateY(-${scrollY}px)` }}
                >
                    {rendered}
                </div>
            </div>
            {!isFocused && !disabled && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="px-5 py-3 rounded-md bg-bg/85 border border-sub/30 text-text text-base sm:text-lg shadow-lg backdrop-blur-sm">
                        click or press any key to focus
                    </div>
                </div>
            )}
        </div>
    )
}

export default TextArea
