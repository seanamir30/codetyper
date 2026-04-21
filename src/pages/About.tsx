import { Helmet } from 'react-helmet'
import { Link } from 'react-router-dom'
import TopBar from '../components/TopBar'

const About = () => {
  return (
    <>
      <Helmet>
        <title>About CodeTyper | Typing Test for Programmers</title>
        <meta name="description" content="CodeTyper is a minimal, open-source typing test built for programmers. Practice with real code snippets in 19+ programming languages and track your CPM, WPM, and accuracy." />
        <link rel="canonical" href="https://codetyper.seancafe.com/about" />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://codetyper.seancafe.com/about" />
        <meta property="og:title" content="About CodeTyper" />
        <meta property="og:description" content="A minimal, open-source typing test built for programmers." />
        <meta property="og:site_name" content="CodeTyper" />
        <meta name="twitter:card" content="summary" />
        <meta name="twitter:title" content="About CodeTyper" />
        <meta name="twitter:description" content="A minimal, open-source typing test built for programmers." />
      </Helmet>

      <main className="min-h-screen bg-bg text-text font-mono flex flex-col">
        <TopBar />

        <article className="flex-1 w-full max-w-2xl mx-auto px-6 py-12 space-y-8 text-sub leading-relaxed">
          <header className="space-y-2">
            <h1 className="text-main text-3xl">about</h1>
            <p className="text-sub/70 text-sm">a typing test for programmers</p>
          </header>

          <section className="space-y-3">
            <h2 className="text-text text-lg">what is this?</h2>
            <p>
              CodeTyper is a minimal typing test designed specifically for programmers.
              Instead of typing random prose, you practice against real code snippets
              sampled from 19+ programming languages &mdash; JavaScript, Python, Rust,
              Go, Java, C, and more.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-text text-lg">why code?</h2>
            <p>
              Typing prose and typing code are very different activities. Code is dense
              with symbols, brackets, indentation, and camelCase identifiers that rarely
              show up in normal writing. If you spend your day writing code, a code-aware
              typing test gives you a truer signal of how fast you actually work.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-text text-lg">how it works</h2>
            <ul className="list-disc list-outside ml-5 space-y-1">
              <li>Pick a language and a duration.</li>
              <li>Start typing. The timer begins on your first correct keystroke.</li>
              <li>
                <span className="text-text">Tab</span> inserts indentation;{' '}
                <span className="text-text">Shift+Tab</span> outdents;{' '}
                <span className="text-text">Enter</span> matches the previous line's indent &mdash;
                just like a code editor.
              </li>
              <li>
                When the timer hits zero you get your WPM, CPM, and accuracy. Press{' '}
                <span className="text-text">Tab</span> to start a new test.
              </li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-text text-lg">contact</h2>
            <p>
              Have an idea or question? Email{' '}
              <a href="mailto:hi@seancafe.com" className="text-main hover:underline">
                hi@seancafe.com
              </a>
              . Found a bug? Open an issue on{' '}
              <a
                href="https://github.com/seanamir30/codetyper/issues/new"
                target="_blank"
                rel="noopener noreferrer"
                className="text-main hover:underline"
              >
                GitHub
              </a>
              .
            </p>
          </section>

          <div className="pt-4">
            <Link to="/" className="text-sub hover:text-text transition">
              &larr; back to typing
            </Link>
          </div>
        </article>

        <footer className="w-full flex flex-wrap justify-center items-center gap-x-4 gap-y-1 py-6 text-sub text-xs">
          <span>
            created by{' '}
            <a
              href="https://seancafe.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-main hover:underline"
            >
              sean cafe
            </a>
          </span>
          <span className="text-sub/50">·</span>
          <a href="mailto:hi@seancafe.com" className="hover:text-text transition">
            contact
          </a>
          <span className="text-sub/50">·</span>
          <a
            href="https://github.com/seanamir30/codetyper/issues/new"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-text transition"
          >
            report a bug
          </a>
        </footer>
      </main>
    </>
  )
}

export default About
