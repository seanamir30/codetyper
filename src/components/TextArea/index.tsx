import { useState, useEffect, useRef } from 'react'
import CodeEditor from '@uiw/react-textarea-code-editor';
// @ts-ignore

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

const TextArea = ({language = 'js', setRawCPM, disabled, generatedCode, generateNewCode, setIncorrectCharacters, incorrectCharacters}: TextAreaProp) => {
    const [codeInput, setCodeInput] = useState('')
    const [isCodeAreaFocused, setIsCodeAreaFocused] = useState(false)
    const [activeCodePartial, setActiveCodePartial] = useState('')
    const [codePartialStart, setCodePartialStart] = useState(0)
    const [codePartialEnd, setCodePartialEnd] = useState(10)
    const [codePartials, setCodePartials] = useState<string[]>([''])
    const codeEditorRef = useRef<HTMLTextAreaElement>(null)
    const codePartialRef = useRef<HTMLDivElement>(null)
    const [activeTextColor, setActiveTextColor] = useState('text-neutral-500')

    useEffect(() => {
        const enterHandler = (e: KeyboardEvent) => {
            if(e.key === 'Enter' && codePartialRef.current){
                if(codeEditorRef.current?.innerHTML === ''){
                    e.preventDefault()
                    e.stopPropagation()
                    return
                }
                if(codePartialRef.current.innerHTML[codeEditorRef.current?.innerHTML.length || 0] !== '\n'){
                    setIncorrectCharacters(prevState => prevState + 1)
                    e.preventDefault()
                    e.stopPropagation()
                }
            }
        }

        const tabHandler = (e: KeyboardEvent) => {
            if(e.key=='Tab' && codePartialRef.current){
                if(codeEditorRef.current?.innerHTML === ''){
                    e.preventDefault()
                    e.stopPropagation()
                    return
                }
                if(((codePartialRef.current.innerHTML.substring((codeEditorRef.current?.innerHTML.length || 0), (codeEditorRef.current?.innerHTML.length || 0) + 2)) !== '  ') ){
                    // setIncorrectCharacters(prevState => prevState + 1)
                    e.preventDefault()
                    e.stopPropagation()
                    return
                } 
                if((codePartialRef.current.innerHTML.charAt((codeEditorRef.current?.innerHTML.length || 0)-1)) === '\n' && (codePartialRef.current.innerHTML.charAt(codeEditorRef.current?.innerHTML.length || 0)) !== '  '){
                    setRawCPM(prevState => prevState + 1)
                    setCodeInput(prevState => prevState + ' ')
                    return
                }
                setRawCPM(prevState => prevState + 1)
                setCodeInput(prevState => prevState + '  ')
                e.preventDefault()
                e.stopPropagation()

            }
        }

        const keyDownHandler = (e: KeyboardEvent) => {
            tabHandler(e)
            enterHandler(e)
        }

        codeEditorRef.current?.addEventListener('keydown', keyDownHandler)

        return () => {
            codeEditorRef.current?.removeEventListener('keydown', keyDownHandler)
        }
    }, [codeInput]);

    useEffect(()=>{
        setCodeInput('')
        const partials = generatedCode.split(/\r?\n|\r|\n/g)
        setCodePartials(partials)
        setActiveCodePartial(partials.slice(0,10).map(partial => partial.trimEnd()).join('\n'))
        setCodePartialStart(0)
        setCodePartialEnd(10)
    },[language, generatedCode])


    //splits the code generated in 10 and interates thru it
    useEffect(()=> {
        if(codeInput.split(/\r?\n|\r|\n/g).length === activeCodePartial.split(/\r?\n|\r|\n/g).length+1){
            setCodePartialEnd(prevState => prevState + 10)
            setCodePartialStart(prevState => prevState + 10)
            setActiveCodePartial(codePartials.slice(codePartialStart+10,codePartialEnd+10).join('\n'))
            setCodeInput('')
        }
        if(!activeCodePartial){
            generateNewCode()
        }
    },[codeInput.split(/\r?\n|\r|\n/g).length === activeCodePartial.split(/\r?\n|\r|\n/g).length+1])

    const handleIncorrectCharacter = () => {
        setActiveTextColor('text-red-400')
        setTimeout(() => setActiveTextColor('text-neutral-500'), 200); 
    }

    useEffect(()=>{
        if(incorrectCharacters){
            handleIncorrectCharacter()
        }
    },[incorrectCharacters])

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        codeEditorRef.current?.setSelectionRange(codeInput.length, codeInput.length)
        if(e.key !== activeCodePartial.charAt(codeInput.length) && e.key.length === 1) setIncorrectCharacters(prevState => prevState + 1) 
        if(e.key === "Backspace" && codeInput.charAt(codeInput.length-1) !== ' ' && codeInput){
            setIncorrectCharacters(prevState => prevState + 1)
            setRawCPM(prevState => prevState - 1)
            return
        }
        if(
            ((e.key !== activeCodePartial.charAt(codeInput.length)) && (e.key !== "Backspace")) ||
            (activeCodePartial.charAt(codeInput.length) === '\n' && e.key !=='Enter' && e.key !== "Backspace")
            ) {
            e.preventDefault()
            return
        }
        if(e.key.length === 1 || e.key === 'Tab') setRawCPM(prevState => prevState + 1)
    }
    return (
        <div className={`transition duration-300 bg-neutral-800 font-consolas rounded-md border-2 px-4 py-2 w-[calc(100vw-2rem)] sm:w-[calc(100vw-4rem)] xl:w-[64rem]  relative ${isCodeAreaFocused && !disabled ? 'border-green-500' : 'border-neutral-700'}`}>
            <div className='absolute top-0 left-0 px-4 z-10 w-full h-full py-2'>
                <CodeEditor
                    ref={codeEditorRef}
                    onFocus={()=>setIsCodeAreaFocused(true)}
                    onBlur={()=>setIsCodeAreaFocused(false)}
                    disabled={disabled}
                    className='w-full h-full bg-transparent text-lg'
                    value={codeInput}
                    onChange={(e)=>setCodeInput(e.target.value)}
                    language={language}
                    spellCheck={false}
                    onKeyDown={(e)=> handleKeyDown(e)}
                    onPaste={()=> false}
                />
            </div>
            <div ref={codePartialRef} className={`transition select-none whitespace-pre-wrap ${activeTextColor} text-lg pointer-events-none px-[0.625rem] py-[0.625rem]`}>
                {activeCodePartial}
            </div>
        </div>
    )
}

export default TextArea