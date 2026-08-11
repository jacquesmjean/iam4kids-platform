-- =====================================================================
-- 0006 — citext lives in `extensions`, not `public`
--
-- An extension installed in the public schema is reachable by anything
-- that can reach public, which is why Supabase's security linter flags it.
-- Moving it keeps the application schema to application objects.
-- `extensions` is already on the search_path for the API roles, so
-- person.email keeps resolving to the same type.
--
-- Verified after the move: 'Mixed.Case@Techfides.com' and
-- 'mixed.case@techfides.com' still collapse to a single person row.
-- =====================================================================

create schema if not exists extensions;
alter extension citext set schema extensions;
