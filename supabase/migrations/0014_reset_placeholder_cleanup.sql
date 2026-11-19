-- =====================================================================
-- 0014 — retire the placeholder Reset date
--
-- The demo session (16 August 2026) was our date, not Mark's, and it was
-- still marked "scheduled" three months after it passed. Now that Mark sets
-- dates himself in the console, it is cancelled rather than deleted, so the
-- record of the demo stays honest. The event description, which told the
-- public "PLACEHOLDER DATE", is replaced with the line from his own site.
-- =====================================================================

update public.event_session s
set status = 'cancelled'
from public.event e
where e.id = s.event_id
  and e.slug = 'be-great-family-reset'
  and s.status = 'scheduled'
  and s.starts_at < now();

update public.event
set description = 'A free live training for parents, educators, and anyone who wants to empower kids.'
where slug = 'be-great-family-reset'
  and description like 'PLACEHOLDER%';
