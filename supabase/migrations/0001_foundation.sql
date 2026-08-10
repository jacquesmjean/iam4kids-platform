-- =====================================================================
-- 0001 — FOUNDATION (the girders)
-- I AM 4 Kids platform. Responds to Blueprint v0.1 §3.
--
-- GOVERNING DECISION: children are records, not users.
-- child_profile has no email, no auth link and no contact route. COPPA
-- obligations attach when a child can authenticate or be contacted;
-- neither is possible here. Revisit only with a documented consent flow.
-- =====================================================================

create extension if not exists "pgcrypto";
create extension if not exists "citext";

-- ---------- person: one human, one row, ever ----------
create table person (
  id                  uuid primary key default gen_random_uuid(),
  auth_user_id        uuid unique,                 -- supabase auth; null until they sign in
  full_name           text not null,
  email               citext unique not null,      -- citext: Maria@x = maria@x
  phone               text,
  preferred_language  text not null default 'en' check (preferred_language in ('en','es')),
  timezone            text not null default 'America/Chicago',
  accessibility_notes text,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);
comment on table person is 'The single human record. Never duplicated per role.';

-- ---------- organization: school, district, partner, media ----------
create table organization (
  id            uuid primary key default gen_random_uuid(),
  name          text not null,
  kind          text not null check (kind in ('school','district','partner','sponsor','media','company')),
  parent_id     uuid references organization(id) on delete set null,  -- district -> school
  country       text,
  region        text,
  created_at    timestamptz not null default now()
);
comment on column organization.parent_id is 'Self-referencing so a district owns its schools.';

-- ---------- household: the family unit ----------
create table household (
  id                uuid primary key default gen_random_uuid(),
  name              text,
  primary_person_id uuid not null references person(id) on delete restrict,
  created_at        timestamptz not null default now()
);

-- ---------- child_profile: a record, deliberately not a user ----------
create table child_profile (
  id            uuid primary key default gen_random_uuid(),
  household_id  uuid references household(id) on delete cascade,
  organization_id uuid references organization(id) on delete set null, -- school roster
  first_name    text not null,
  age_band      int  check (age_band between 4 and 18),
  created_at    timestamptz not null default now(),
  -- Guardrails, enforced by the database rather than by good intentions:
  constraint child_belongs_somewhere
    check (household_id is not null or organization_id is not null)
);
comment on table child_profile is
  'No email, no auth_user_id, no phone. A child is counted and celebrated, never contacted.';

-- ---------- role_assignment: what someone is DOING, and where ----------
create table role_assignment (
  id              uuid primary key default gen_random_uuid(),
  person_id       uuid not null references person(id) on delete cascade,
  role            text not null check (role in
                    ('guardian','educator','school_leader','staff','partner',
                     'media','investor','speaker_contact','customer')),
  household_id    uuid references household(id) on delete cascade,
  organization_id uuid references organization(id) on delete cascade,
  created_at      timestamptz not null default now(),
  unique (person_id, role, household_id, organization_id)
);
comment on table role_assignment is
  'One person may be guardian at home, educator at a school and speaker contact at once. '
  'Separating who someone IS from what they are DOING is what stops four disconnected rows.';

-- ---------- consent: append-only, auditable ----------
create table consent (
  id           uuid primary key default gen_random_uuid(),
  person_id    uuid not null references person(id) on delete cascade,
  scope        text not null,          -- e.g. guardian_consent, event_comms, media_release
  method       text not null,          -- checkbox_v1, signed_form, verbal_logged
  granted_at   timestamptz not null default now(),
  expires_at   timestamptz,
  revoked_at   timestamptz,
  evidence     jsonb                   -- form version, IP, wording shown at the time
);
comment on table consent is
  'Append-only by policy. Withdrawal is a revoked_at stamp, never a delete — you must be able '
  'to prove what someone agreed to and when.';

-- ---------- interaction: the spine of impact reporting ----------
create table interaction (
  id              uuid primary key default gen_random_uuid(),
  person_id       uuid references person(id) on delete cascade,
  organization_id uuid references organization(id) on delete cascade,
  kind            text not null,      -- registered, attended, replied, purchased, enquired
  subject         text,
  metadata        jsonb,
  occurred_at     timestamptz not null default now()
);

create index on role_assignment (person_id);
create index on child_profile (household_id);
create index on consent (person_id, scope);
create index on interaction (person_id, occurred_at desc);
