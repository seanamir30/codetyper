import { Link } from 'react-router-dom'

const TopBar = () => {
    return (
        <header className="w-full max-w-5xl mx-auto px-6 pt-8">
            <div className="text-2xl font-bold tracking-tight">
                <Link to="/" aria-label="CodeTyper home" className="hover:opacity-90 transition">
                    <span className="text-main">Code</span>
                    <span className="text-text">Typer</span>
                </Link>
            </div>
        </header>
    )
}

export default TopBar
