import 'dotenv/config'
import pg from 'pg'

const { Client } = pg
const url = process.env.DATABASE_URL || process.env.DIRECT_URL
const name = process.argv[2]
if (!name) { console.error('usage: node mark-applied.mjs <migration-file.sql>'); process.exit(1) }

const client = new Client({ connectionString: url })
await client.connect()
await client.query(`
  create table if not exists public._migrations (
    name text primary key,
    applied_at timestamptz not null default now()
  );
`)
await client.query('insert into public._migrations(name) values ($1) on conflict do nothing', [name])
await client.end()
console.log(`marked ${name} as applied`)
