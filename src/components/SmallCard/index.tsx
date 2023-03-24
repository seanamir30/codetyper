import { ReactNode } from 'react'

interface TimerProps {
    children: ReactNode
    className?: string
    isButton?: boolean
    onClick?: React.MouseEventHandler<HTMLButtonElement>
}

const Timer = ({children, className, isButton, onClick}: TimerProps) => {
    if (isButton) return (
        <button className={`rounded-md bg-neutral-800 text-white px-6 py-4 ${className}`} onClick={onClick}>
            {children}
        </button>
    )
    return (
        <div className={`rounded-md bg-neutral-800 text-white px-6 py-4 ${className}`}>
            {children}
        </div>
    )
}

export default Timer