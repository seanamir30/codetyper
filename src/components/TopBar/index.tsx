import { useEffect, useRef, useState } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { useAuth } from '../../lib/auth'
import { useProfile } from '../../lib/profile'

const KeyboardIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
        <rect x="2" y="6" width="20" height="12" rx="2" />
        <path d="M6 10h0M10 10h0M14 10h0M18 10h0M6 14h0M18 14h0" />
        <path d="M9 14h6" />
    </svg>
)

const CrownIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
        <path d="M3 18h18" />
        <path d="M3 7l4 5 5-7 5 7 4-5v11H3z" />
    </svg>
)

const TopBar = () => {
    const { user, loading, signOut } = useAuth()
    const { profile } = useProfile()
    const [open, setOpen] = useState(false)
    const menuRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        const onDocClick = (e: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(e.target as Node)) setOpen(false)
        }
        document.addEventListener('mousedown', onDocClick)
        return () => document.removeEventListener('mousedown', onDocClick)
    }, [])

    const label = profile?.username ?? user?.email ?? ''
    const initial = label ? label[0].toUpperCase() : '?'

    const navClass = ({ isActive }: { isActive: boolean }) =>
        `p-2 rounded transition ${isActive ? 'text-main' : 'text-sub hover:text-text'}`

    return (
        <header className="w-full max-w-5xl mx-auto px-6 pt-8 flex items-center justify-between">
            <div className="flex items-center gap-3">
                <div className="text-2xl font-bold tracking-tight">
                    <Link to="/" aria-label="CodeTyper home" className="hover:opacity-90 transition">
                        <span className="text-main">Code</span>
                        <span className="text-text">Typer</span>
                    </Link>
                </div>
                <nav className="flex items-center gap-1 ml-2">
                    <NavLink to="/" end className={navClass} aria-label="Typing test">
                        <KeyboardIcon />
                    </NavLink>
                    <NavLink to="/leaderboards" className={navClass} aria-label="Leaderboards">
                        <CrownIcon />
                    </NavLink>
                </nav>
            </div>

            <nav className="text-sm">
                {loading ? null : user ? (
                    <div className="relative" ref={menuRef}>
                        <button
                            onClick={() => setOpen((v) => !v)}
                            className="flex items-center gap-2 text-sub hover:text-text transition"
                            aria-haspopup="menu"
                            aria-expanded={open}
                        >
                            <span className="w-7 h-7 rounded-full bg-main text-bg flex items-center justify-center font-semibold">
                                {initial}
                            </span>
                            <span className="hidden sm:inline">{label}</span>
                        </button>
                        {open && (
                            <div className="absolute right-0 mt-2 w-44 bg-subAlt border border-sub/30 rounded shadow-lg py-1 z-10">
                                <button
                                    onClick={async () => {
                                        setOpen(false)
                                        await signOut()
                                    }}
                                    className="w-full text-left px-3 py-2 text-sub hover:text-text hover:bg-bg/50 transition"
                                >
                                    log out
                                </button>
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="flex items-center gap-4 text-sub">
                        <Link to="/login" className="hover:text-text transition">
                            log in
                        </Link>
                        <Link
                            to="/signup"
                            className="text-main border border-main/40 hover:border-main px-3 py-1 rounded transition"
                        >
                            sign up
                        </Link>
                    </div>
                )}
            </nav>
        </header>
    )
}

export default TopBar
