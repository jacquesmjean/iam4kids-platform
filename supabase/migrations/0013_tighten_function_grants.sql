-- =====================================================================
-- 0013 — function grants, tightened
--
-- Supabase grants EXECUTE on new public functions to anon and
-- authenticated by default. For trigger functions that is harmless
-- (Postgres refuses to run them outside a trigger) but it is noise in the
-- security advisor, and noise hides the warnings that matter. For the two
-- "who am I" helpers, anon has no reason to call them.
--
-- What stays callable by the public, on purpose:
--   is_staff()            answers "am I staff" about the caller only
--   impact_counts()       totals, never rows
--   atlas_guardrails()    Mark's approved guardrails, shown beside drafts
--   register_for_event()  the only door a family needs
-- =====================================================================

revoke execute on function public.tg_feedback_notify()      from public, anon, authenticated;
revoke execute on function public.tg_site_block_revision()  from public, anon, authenticated;
revoke execute on function public.tg_school_inquiry()       from public, anon, authenticated;
revoke execute on function public.tg_atlas_entry()          from public, anon, authenticated;
revoke execute on function public.tg_decision_answered()    from public, anon, authenticated;

revoke execute on function public.current_person_id() from public, anon;
revoke execute on function public.current_staff()     from public, anon;
