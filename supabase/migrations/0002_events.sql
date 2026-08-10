-- =====================================================================
-- 0002 — EVENT OPERATING SYSTEM (Blueprint v0.1 §5, Priority 1B)
-- Events are reusable objects. The next Reset is a row, not a rebuild.
-- =====================================================================

create table event (
  id             uuid primary key default gen_random_uuid(),
  slug           text unique not null,
  title          text not null,
  kind           text not null check (kind in
                   ('family_reset','educator_masterclass','before_the_bell','family_pack',
                    'academy','assembly','professional_development','webinar','media','community')),
  description    text,
  audience       text,                                   -- families | schools | educators | mixed
  is_free        boolean not null default true,
  price_cents    int,
  created_at     timestamptz not null default now()
);

create table event_session (
  id             uuid primary key default gen_random_uuid(),
  event_id       uuid not null references event(id) on delete cascade,
  starts_at      timestamptz not null,                   -- always UTC; rendered per-person
  duration_mins  int not null default 60,
  capacity       int,
  delivery       text not null default 'zoom' check (delivery in ('zoom','in_person','other')),
  external_ref   text,                                   -- zoom meeting id
  join_url       text,
  status         text not null default 'scheduled'
                   check (status in ('draft','scheduled','live','completed','cancelled')),
  created_at     timestamptz not null default now()
);
comment on column event_session.starts_at is
  'Stored UTC. Every message renders in the recipient timezone — a reminder in the wrong '
  'timezone is a missed session.';

create table registration (
  id                uuid primary key default gen_random_uuid(),
  session_id        uuid not null references event_session(id) on delete cascade,
  person_id         uuid not null references person(id) on delete cascade,
  household_id      uuid references household(id) on delete set null,
  child_profile_id  uuid references child_profile(id) on delete set null,
  status            text not null default 'confirmed'
                      check (status in ('confirmed','waitlisted','cancelled')),
  source            text,                                -- utm / campaign attribution
  campaign          text,
  registered_at     timestamptz not null default now(),
  unique (session_id, person_id)                         -- duplicate handling, at the database
);

create table attendance (
  id              uuid primary key default gen_random_uuid(),
  registration_id uuid not null unique references registration(id) on delete cascade,
  joined_at       timestamptz,
  left_at         timestamptz,
  outcome         text not null default 'pending'
                    check (outcome in ('pending','attended','no_show','replay_watched')),
  updated_at      timestamptz not null default now()
);

-- Outbound comms, so a bounce is a visible object rather than a silence.
create table event_message (
  id              uuid primary key default gen_random_uuid(),
  registration_id uuid not null references registration(id) on delete cascade,
  kind            text not null check (kind in
                    ('confirmation','reminder_24h','reminder_1h','change','cancellation',
                     'replay','survey','follow_up')),
  scheduled_for   timestamptz,
  sent_at         timestamptz,
  status          text not null default 'queued'
                    check (status in ('queued','sent','bounced','failed','skipped')),
  provider_ref    text,
  error           text
);

-- The exception queue Blueprint §5 asks for: failures visible without a user reporting them.
create table exception_item (
  id            uuid primary key default gen_random_uuid(),
  area          text not null,        -- event | content | integration | billing
  severity      text not null default 'warning' check (severity in ('info','warning','critical')),
  summary       text not null,
  detail        jsonb,
  subject_table text,
  subject_id    uuid,
  resolved_at   timestamptz,
  created_at    timestamptz not null default now()
);

create index on registration (session_id);
create index on registration (person_id);
create index on event_message (status, scheduled_for);
create index on exception_item (resolved_at, severity);
