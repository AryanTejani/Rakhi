-- Rakhi site: shared wish tree table.
-- Paste this ONCE in Supabase Dashboard → SQL Editor → Run.

create table public.wishes (
  id bigint generated always as identity primary key,
  name text not null,
  flowers text[] default '{}',
  title text not null,
  url text not null,
  created_at timestamptz default now()
);

-- Open family access: anyone with the site link can read/add/remove wishes.
-- Intentional — no logins wanted for this site.
alter table public.wishes enable row level security;
create policy "family read"   on public.wishes for select using (true);
create policy "family add"    on public.wishes for insert with check (true);
create policy "family remove" on public.wishes for delete using (true);

-- Live updates (tree blooms on every phone the moment a wish is tied)
alter publication supabase_realtime add table public.wishes;
