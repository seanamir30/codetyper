import { useState, useEffect, useRef, useMemo } from 'react'
import { Languages } from '../../../types/random-code'

interface TextAreaProp {
    language: keyof Languages
    setRawCPM: React.Dispatch<React.SetStateAction<number>>
    setIncorrectCharacters: React.Dispatch<React.SetStateAction<number>>
    disabled: boolean
    generatedCode: string
    generateNewCode: Function
    incorrectCharacters: number
}

const TextArea = ({ language, setRawCPM, disabled, generatedCode, generateNewCode, setIncorrectCharacters, incorrectCharacters }: TextAreaProp) => {
    const [codeInput, setCodeInput] = useState('')
    const [isFocused, setIsFocused] = useState(false)
    const [activeCodePartial, setActiveCodePartial] = useState('')
    const [codePartialStart, setCodePartialStart] = useState(0)
    const [codePartialEnd, setCodePartialEnd] = useState(5)
    const [codePartials, setCodePartials] = useState<string[]>([''])
    const [errorFlash, setErrorFlash] = useState(false)
    const textareaRef = useRef<HTMLTextAreaElement>(null)

    const tabWidth = useMemo(() => {
        for (const line of generatedCode.split(/\r?\n/)) {
            const m = line.match(/^ +/)
            if (m) return m[0].length
        }
        return 2
    }, [generatedCode])

    useEffect(() => {
        const classifySpaces = (from: number, count: number): [number, number] => {
            let correct = 0, incorrect = 0
            for (let i = 0; i < count; i++) {
                if (activeCodePartial.charAt(from + i) === ' ') correct++
                else incorrect++
            }
            return [correct, incorrect]
        }

        const enterHandler = (e: KeyboardEvent) => {
            if (e.key !== 'Enter') return
            if (codeInput === '') {
                e.preventDefault()
                e.stopPropagation()
                return
            }
            const target = activeCodePartial.charAt(codeInput.length)
            if (target !== '\n' && target !== '') {
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

            const remaining = activeCodePartial.length - codeInput.length
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
    }, [codeInput, activeCodePartial, codePartialStart, tabWidth])

    useEffect(() => {
        setCodeInput('')
        const partials = generatedCode.split(/\r?\n|\r|\n/g)
        setCodePartials(partials)
        setActiveCodePartial(partials.slice(0, 5).map(p => p.trimEnd()).join('\n'))
        setCodePartialStart(0)
        setCodePartialEnd(5)
    }, [language, generatedCode])

    useEffect(() => {
        if (codeInput.split(/\r?\n|\r|\n/g).length === activeCodePartial.split(/\r?\n|\r|\n/g).length + 1) {
            setCodePartialEnd(prev => prev + 5)
            setCodePartialStart(prev => prev + 5)
            setActiveCodePartial(codePartials.slice(codePartialStart + 5, codePartialEnd + 5).join('\n'))
            setCodeInput('')
        }
        if (!activeCodePartial) {
            generateNewCode()
        }
    }, [codeInput.split(/\r?\n|\r|\n/g).length === activeCodePartial.split(/\r?\n|\r|\n/g).length + 1])

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
        const target = activeCodePartial.charAt(codeInput.length)

        if (e.key === 'Enter') return

        if (e.key !== target && e.key.length === 1) setIncorrectCharacters(prev => prev + 1)

        if (e.key === 'Backspace' && codeInput) {
            const lastChar = codeInput.charAt(codeInput.length - 1)
            const targetChar = activeCodePartial.charAt(codeInput.length - 1)
            if (lastChar === ' ') {
                if (lastChar !== targetChar) {
                    setIncorrectCharacters(prev => Math.max(0, prev - 1))
                }
                return
            }
            setIncorrectCharacters(prev => prev + 1)
            setRawCPM(prev => prev - 1)
            return
        }

        if ((e.key !== target) && (e.key !== 'Backspace')) {
            e.preventDefault()
            return
        }

        if (e.key.length === 1) setRawCPM(prev => prev + 1)
    }

    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        let value = e.target.value
        if (value.endsWith('\n') && value.length < activeCodePartial.length) {
            const beforeNewline = value.slice(0, -1)
            const prevNewlineIdx = beforeNewline.lastIndexOf('\n')
            const prevLine = beforeNewline.slice(prevNewlineIdx + 1)
            const prevIndent = (prevLine.match(/^ +/) || [''])[0].length
            let targetLeading = 0
            while (activeCodePartial.charAt(value.length + targetLeading) === ' ') targetLeading++
            const insertN = Math.min(prevIndent, targetLeading)
            if (insertN > 0) {
                value += ' '.repeat(insertN)
                setRawCPM(prev => prev + insertN)
            }
        }
        setCodeInput(value)
    }

    const typed = codeInput.length
    const caretCls = `caret inline-block w-[2px] align-middle -mr-[2px] rounded-sm ${errorFlash ? 'bg-error' : 'bg-main'}`
    const caretStyle = { height: '1.1em' }

    const rendered: React.ReactNode[] = []
    for (let i = 0; i < activeCodePartial.length; i++) {
        const ch = activeCodePartial[i]
        const typedCh = i < typed ? codeInput[i] : undefined

        if (i === typed && isFocused && !disabled) {
            rendered.push(<span key={`caret-${i}`} className={caretCls} style={caretStyle} />)
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
    if (typed >= activeCodePartial.length && isFocused && !disabled) {
        rendered.push(<span key="caret-end" className={caretCls} style={caretStyle} />)
    }

    return (
        <div
            onClick={() => textareaRef.current?.focus()}
            className="relative w-full cursor-text font-mono"
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
                className={`whitespace-pre-wrap leading-[1.6] tracking-wide transition duration-200 ${
                    !isFocused && !disabled ? 'blur-[3px]' : ''
                }`}
                style={{ fontSize: 'clamp(20px, 2.5vw, 28px)' }}
            >
                {rendered}
            </div>
            {!isFocused && !disabled && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none text-sub text-sm">
                    click or press any key to focus
                </div>
            )}
        </div>
    )
}

export default TextArea
