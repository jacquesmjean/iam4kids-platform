-- =====================================================================
-- 0004 — ROW LEVEL SECURITY
-- Blueprint v0.1 §3: child and school data separated, permissioned,
-- retained and audited. Security lives in the database, so an API bug
-- cannot leak a child record.
-- =====================================================================

alter table person            enable row level security;
alter table household         enable row level security;
alter table child_profile     enable row level security;
alter table organization      enable row level security;
alter table role_assignment   enable row level security;
alter table consent           enable row level security;
alter table interaction       enable row level security;
alter table event             enable row level security;
alter table event_session     enable row level security;
alter table registration      enable row level security;
alter table attendance        enable row level security;
alter table event_message     enable row level security;
alter table exception_item    enable row level security;
alter table content_asset     enable row level security;
alter table content_derivative enable row level security;
alter table approval          enable row level security;
alter table publication       enable row level security;

-- Helper: is the caller staff?
create or replace function is_staff() returns boolean language sql stable as $$
  select exists (
    select 1 from role_assignment ra
    join person p on p.id = ra.person_id
    where p.auth_user_id = auth.uid() and ra.role = 'staff'
  );
$$;

-- Public may read published events. Nothing else is public.
create policy event_public_read on event
  for select using (true);
create policy session_public_read on event_session
  for select using (status in ('scheduled','live','completed'));

-- A person sees themself.
create policy person_self on person
  for select using (auth_user_id = auth.uid() or is_staff());

-- A guardian sees only their own household's children. Staff see all.
-- No other path to a child record exists.
create policy child_guardian_only on child_profile
  for select using (
    is_staff()
    or household_id in (
      select ra.household_id from role_assignment ra
      join person p on p.id = ra.person_id
      where p.auth_user_id = auth.uid() and ra.role = 'guardian'
    )
  );

-- A person sees their own registrations; staff see all.
create policy registration_own on registration
  for select using (
    is_staff()
    or person_id in (select id from person where auth_user_id = auth.uid())
  );

-- Operational surfaces are staff-only.
create policy exceptions_staff on exception_item for all using (is_staff());
create policy content_staff    on content_asset  for all using (is_staff());
create policy derivative_staff on content_derivative for all using (is_staff());
create policy approval_staff   on approval       for all using (is_staff());
create policy publication_staff on publication   for all using (is_staff());

-- Consent is readable by its owner and staff, and never updatable in place.
create policy consent_read on consent
  for select using (
    is_staff() or person_id in (select id from person where auth_user_id = auth.uid())
  );
