-- =====================================================================
-- 0005 — THE CONSTRAINTS THAT MAKE REGISTRATION IDEMPOTENT
--
-- registerFamily() upserts on three conflict targets. Two of them did not
-- exist, and a third only looked like it did:
--
--   1. household(primary_person_id) had no unique constraint at all, so
--      `on conflict (primary_person_id)` had nothing to match and the
--      insert failed outright. Every registration would have 500'd.
--
--   2. role_assignment's unique tuple contains nullable columns. Postgres
--      treats NULLs as distinct by default, so (person, 'guardian',
--      household, NULL) never collided with itself — a parent registering
--      twice accumulated duplicate guardian roles forever.
--
--   3. child_profile had no uniqueness at all and the code plain-inserted,
--      so a parent tapping submit twice on a phone created two children.
--      The comment promised idempotency the schema could not deliver.
--
-- NULLS NOT DISTINCT (Postgres 15+) is what makes 2 and 3 behave the way
-- the code already assumed they did.
--
-- Verified against the live database: running the full registerFamily
-- sequence twice yields one person, one household, one role assignment,
-- one child and one registration — with consent and interaction correctly
-- appending twice, because those two are logs and are meant to.
-- =====================================================================

-- 1. One household per primary guardian.
alter table household
  add constraint household_primary_person_unique unique (primary_person_id);

-- 2. A role in a context is held once, even when the other context is null.
alter table role_assignment
  drop constraint role_assignment_person_id_role_household_id_organization_id_key;

alter table role_assignment
  add constraint role_assignment_unique
  unique nulls not distinct (person_id, role, household_id, organization_id);

-- 3. Within one household, a child is identified by first name and age.
--    Siblings differ on one or the other; a double submit differs on neither.
alter table child_profile
  add constraint child_profile_household_identity
  unique nulls not distinct (household_id, first_name, age_band);

comment on constraint child_profile_household_identity on child_profile is
  'Makes a double-tapped submit update one child rather than create two. Siblings are still '
  'distinct rows because they differ on first_name or age_band.';
