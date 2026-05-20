-- Profiles: public-facing user data, 1:1 with auth.users.
-- Username is the unique display handle. Login still uses email/OAuth — username is not a credential.

create extension if not exists citext;

create table public.profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  username    citext not null unique,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  constraint  username_format check (username ~ '^[a-z0-9_]{3,20}$')
);

alter table public.profiles enable row level security;

-- Anyone (even anon) can read profiles — usernames are public.
create policy "profiles are readable by anyone"
  on public.profiles for select
  to anon, authenticated
  using (true);

-- A user can insert their own profile row.
create policy "users can insert own profile"
  on public.profiles for insert
  to authenticated
  with check ((select auth.uid()) = id);

-- A user can update their own profile row.
create policy "users can update own profile"
  on public.profiles for update
  to authenticated
  using ((select auth.uid()) = id)
  with check ((select auth.uid()) = id);

-- Keep updated_at fresh.
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_set_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();
