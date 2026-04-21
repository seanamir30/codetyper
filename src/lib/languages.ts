import type { Languages } from '../../types/random-code'

export const slugToKey: Record<string, keyof Languages> = {
  javascript: 'js',
  typescript: 'ts',
  python: 'python',
  java: 'java',
  css: 'css',
  go: 'go',
  rust: 'rust',
  php: 'php',
  csharp: 'csharp',
  cpp: 'cplusplus',
  kotlin: 'kotlin',
  swift: 'swift',
  sql: 'sql',
  cobol: 'cobol',
  docker: 'docker',
  fsharp: 'fsharp',
  perl: 'perl',
  powershell: 'powershell',
  vba: 'vba',
}

export const keyToSlug = Object.fromEntries(
  Object.entries(slugToKey).map(([slug, key]) => [key, slug])
) as Record<keyof Languages, string>

export const parseLangSlug = (slug: string | undefined): keyof Languages | null => {
  if (!slug) return null
  const m = slug.match(/^([a-z+]+)-typing-test$/i)
  if (!m) return null
  const key = slugToKey[m[1].toLowerCase()]
  return key ?? null
}

export const languagePath = (key: keyof Languages) => `/${keyToSlug[key]}-typing-test`
