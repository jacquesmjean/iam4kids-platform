-- =====================================================================
-- 0015 — content review, and a public track record
--
-- Two small additions for the staff console.
--
-- 1. content_derivative.label: a human name for each draft ("LinkedIn,
--    full post"), so two drafts for the same channel can be told apart
--    in the review queue.
--
-- 2. public_track_record(): the claims and history Mark has APPROVED in
--    Atlas, readable by the public impact page. Only approved entries,
--    only the title and the text. Evidence stays staff-only, because it
--    can hold internal notes. Nothing appears on the public page until
--    Mark presses Approve, which is the point: his real history, shown
--    accurately, and nothing he has not signed off.
-- =====================================================================

alter table public.content_derivative add column if not exists label text;

create or replace function public.public_track_record()
returns table (title text, body text, approved_at timestamptz)
  language sql
  stable
  security definer
  set search_path = public, pg_temp
as $$
  select title, body, approved_at from public.atlas_entry
  where kind in ('claim', 'history') and status = 'approved' and locale = 'en'
  order by sort, approved_at;
$$;
revoke all on function public.public_track_record() from public;
grant execute on function public.public_track_record() to anon, authenticated, service_role;

-- 3. content_asset.provenance: where the wording in this asset's drafts came
--    from, stated per source. Shown above the drafts so the reviewer knows
--    exactly what was and was not written for them.
alter table public.content_asset add column if not exists provenance text;
