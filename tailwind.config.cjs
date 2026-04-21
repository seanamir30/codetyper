/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        mono: ['"Roboto Mono"', 'Consolas', 'ui-monospace', 'monospace'],
      },
      colors: {
        bg: '#323437',
        subAlt: '#2c2e31',
        sub: '#646669',
        text: '#d1d0c5',
        main: '#10b981',
        error: '#ca4754',
        errorEx: '#7e2a33',
      },
    },
  },
  plugins: [],
}
