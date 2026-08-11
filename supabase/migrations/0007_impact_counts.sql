-- =====================================================================
-- 0007 — public.impact_counts()
--
-- The impact dashboard needs totals, not people. Totals are not sensitive;
-- the rows behind them are. So rather than hand the dashboard a
-- service-role key that can read every child record, this function runs
-- security definer and returns nothing but integers.
--
-- Aggregate in, aggregate out. There is no argument, so there is no way to
-- filter it down toward an individual — the classic re-identification
-- route out of an aggregate endpoint is closed by having no input at all.
-- =====================================================================

create or replace function public.impact_counts()
returns json
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select json_build_object(
    'families',        (select count(*) from household),
    'children',        (select count(*) from child_profile),
    'guardians',       (select count(*) from role_assignment where role = 'guardian'),
    'schools',         (select count(*) from organization where kind in ('school','district')),
    'sessions_held',   (select count(*) from event_session where status = 'completed'),
    'sessions_upcoming',(select count(*) from event_session where status = 'scheduled'),
    'registrations',   (select count(*) from registration where status = 'confirmed'),
    'attended',        (select count(*) from attendance where outcome = 'attended'),
    'no_shows',        (select count(*) from attendance where outcome = 'no_show'),
    'consents',        (select count(*) from consent where revoked_at is null),
    'content_assets',  (select count(*) from content_asset),
    'published',       (select count(*) from publication where status = 'published'),
    'awaiting_approval',(select count(*) from content_derivative where status in ('draft','in_review')),
    'open_exceptions', (select count(*) from exception_item where resolved_at is null)
  );
$$;

comment on function public.impact_counts is
  'Aggregate-only impact totals. Safe for the anon key: returns counts, never rows.';

revoke all on function public.impact_counts() from public;
grant execute on function public.impact_counts() to anon, authenticated, service_role;
