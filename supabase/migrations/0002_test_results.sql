-- Stored test results, joinable to profiles for username display.
-- user_id FKs to profiles(id) so PostgREST can auto-join via embedded select.

create table public.test_results (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references public.profiles(id) on delete cascade,
  language    text not null,
  seconds     int  not null check (seconds > 0),
  wpm         int  not null check (wpm >= 0),
  cpm         int  not null check (cpm >= 0),
  accuracy    int  not null check (accuracy between 0 and 100),
  correct     int  not null check (correct >= 0),
  incorrect   int  not null check (incorrect >= 0),
  created_at  timestamptz not null default now()
);

-- Leaderboard queries filter by language + seconds + date range, ordered by wpm desc.
create index test_results_lb_idx
  on public.test_results (created_at desc, language, seconds, wpm desc);

alter table public.test_results enable row level security;

-- Public read: leaderboards are visible to anonymous visitors too.
create policy "test_results readable by anyone"
  on public.test_results for select
  to anon, authenticated
  using (true);

-- A user can only insert results attributed to themselves.
create policy "users can insert own results"
  on public.test_results for insert
  to authenticated
  with check ((select auth.uid()) = user_id);
