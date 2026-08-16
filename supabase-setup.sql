-- Rakhi site: shared wish thread.
-- Paste this ONCE in Supabase Dashboard → SQL Editor → Run.

create table public.wishes (
  id bigint generated always as identity primary key,
  name text not null,
  flowers text[] default '{}',
  title text not null,
  url text not null,
  -- Per-row delete token. Generated on the sister's phone and kept in her
  -- localStorage; never readable back over the API (see the revoke below).
  secret text not null default encode(gen_random_bytes(16), 'hex'),
  created_at timestamptz default now()
);

-- Open family access: anyone with the site link can read and add wishes.
-- Intentional — no logins wanted for this site.
alter table public.wishes enable row level security;
create policy "family read" on public.wishes for select using (true);
create policy "family add"  on public.wishes for insert with check (true);

-- NO delete policy on purpose. `for delete using (true)` would let anyone
-- who has the link wipe every sister's wish in one request.
-- Nobody can read another row's secret, so nobody can delete another row.
revoke select (secret) on public.wishes from anon, authenticated;

-- Deletes go through this instead: it only removes the row whose secret the
-- caller can already prove they hold.
create or replace function public.remove_wish(p_id bigint, p_secret text)
returns void
language sql
security definer
set search_path = public
as $$
  delete from public.wishes where id = p_id and secret = p_secret;
$$;

grant execute on function public.remove_wish(bigint, text) to anon, authenticated;

-- Live updates (the thread blooms on every phone the moment a wish is tied)
alter publication supabase_realtime add table public.wishes;


-- ────────────────────────────────────────────────────────────────────────────
-- ALREADY RAN THE OLD VERSION? Run this block instead of the whole file.
-- Existing rows get a secret nobody holds, so they can only be removed from
-- the Supabase dashboard — which is the point.
-- ────────────────────────────────────────────────────────────────────────────
-- alter table public.wishes
--   add column if not exists secret text not null default encode(gen_random_bytes(16), 'hex');
-- drop policy if exists "family remove" on public.wishes;
-- revoke select (secret) on public.wishes from anon, authenticated;
-- (then create the remove_wish function + grant above)
