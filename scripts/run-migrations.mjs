import 'dotenv/config'
import { readFile, readdir } from 'node:fs/promises'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import pg from 'pg'

const { Client } = pg
const __dirname = dirname(fileURLToPath(import.meta.url))
const MIGRATIONS_DIR = join(__dirname, '..', 'supabase', 'migrations')

// Prefer DATABASE_URL (pooler, IPv4-friendly). DIRECT_URL on db.<ref>.supabase.co
// is IPv6-only on newer Supabase projects and may not resolve from local dev.
const url = process.env.DATABASE_URL || process.env.DIRECT_URL
if (!url) {
  console.error('DATABASE_URL must be set in .env')
  process.exit(1)
}

const files = (await readdir(MIGRATIONS_DIR)).filter((f) => f.endsWith('.sql')).sort()
if (!files.length) {
  console.log('No migrations to run.')
  process.exit(0)
}

const client = new Client({ connectionString: url })
await client.connect()

try {
  await client.query(`
    create table if not exists public._migrations (
      name text primary key,
      applied_at timestamptz not null default now()
    );
  `)

  for (const file of files) {
    const { rowCount } = await client.query('select 1 from public._migrations where name = $1', [file])
    if (rowCount) {
      console.log(`skip  ${file}`)
      continue
    }
    const sql = await readFile(join(MIGRATIONS_DIR, file), 'utf8')
    console.log(`apply ${file}`)
    await client.query('begin')
    try {
      await client.query(sql)
      await client.query('insert into public._migrations(name) values ($1)', [file])
      await client.query('commit')
    } catch (e) {
      await client.query('rollback')
      throw e
    }
  }
  console.log('Done.')
} finally {
  await client.end()
}
