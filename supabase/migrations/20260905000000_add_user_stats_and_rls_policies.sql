-- Create missing user_stats table and lock down RLS on documents, leaderboard, user_stats.

-- 1. user_stats table
create table if not exists public.user_stats (
  user_id           uuid primary key references auth.users(id) on delete cascade,
  username          text not null,
  iq_points         integer not null default 60,
  student_level     integer not null default 1,
  unlocked_students text[] not null default array['marko'],
  active_student_id text not null default 'marko',
  history           jsonb not null default '[]'::jsonb,
  updated_at        timestamptz not null default now()
);

alter table public.user_stats enable row level security;

-- Users can only see/insert/update their own row.
create policy "user_stats_select_own"
  on public.user_stats for select
  to authenticated
  using (auth.uid() = user_id);

create policy "user_stats_insert_own"
  on public.user_stats for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy "user_stats_update_own"
  on public.user_stats for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- 2. documents: open read, authenticated write
create policy "documents_select_all"
  on public.documents for select
  to anon, authenticated
  using (true);

create policy "documents_insert_authenticated"
  on public.documents for insert
  to authenticated
  with check (true);

create policy "documents_update_authenticated"
  on public.documents for update
  to authenticated
  using (true)
  with check (true);

-- 3. leaderboard: open read, authenticated write
create policy "leaderboard_select_all"
  on public.leaderboard for select
  to anon, authenticated
  using (true);

create policy "leaderboard_insert_authenticated"
  on public.leaderboard for insert
  to authenticated
  with check (true);

create policy "leaderboard_update_authenticated"
  on public.leaderboard for update
  to authenticated
  using (true)
  with check (true);
