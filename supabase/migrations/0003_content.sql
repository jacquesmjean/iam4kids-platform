-- =====================================================================
-- 0003 — CONTENT OPERATING SYSTEM (Blueprint v0.1 §4, Priority 1A)
-- One approved source asset becomes many channel assets, through a
-- human approval gate. The gate is the product.
-- =====================================================================

create table content_asset (
  id           uuid primary key default gen_random_uuid(),
  title        text not null,
  kind         text not null check (kind in
                 ('video','transcript','article','podcast','voice_note','image','brief','event','idea')),
  body         text,
  storage_path text,
  audience     text,
  objective    text,
  campaign     text,
  sensitivity  text not null default 'standard'
                 check (sensitivity in ('standard','child_story','claim','safeguarding')),
  created_by   uuid references person(id) on delete set null,
  created_at   timestamptz not null default now()
);
comment on column content_asset.sensitivity is
  'child_story, claim and safeguarding can never auto-publish. Enforced in the publish path.';

create table content_derivative (
  id          uuid primary key default gen_random_uuid(),
  asset_id    uuid not null references content_asset(id) on delete cascade,
  channel     text not null check (channel in
                ('linkedin','facebook','instagram','tiktok','youtube','x','email','substack')),
  body        text not null,
  version     int  not null default 1,
  status      text not null default 'draft'
                check (status in ('draft','in_review','approved','rejected','scheduled','published','failed')),
  generated_by text not null default 'ai' check (generated_by in ('ai','human')),
  created_at  timestamptz not null default now()
);

create table approval (
  id             uuid primary key default gen_random_uuid(),
  derivative_id  uuid not null references content_derivative(id) on delete cascade,
  reviewer_id    uuid references person(id) on delete set null,
  decision       text not null check (decision in ('approved','rejected','changes_requested')),
  note           text,
  decided_at     timestamptz not null default now()
);
comment on table approval is 'Who reviewed, what they decided, when. Never inferred from a status field.';

create table publication (
  id             uuid primary key default gen_random_uuid(),
  derivative_id  uuid not null references content_derivative(id) on delete cascade,
  channel        text not null,
  mode           text not null default 'api' check (mode in ('api','handoff')),
  published_at   timestamptz,
  external_ref   text,
  status         text not null default 'queued'
                   check (status in ('queued','published','failed','manual_required')),
  error          text
);
comment on column publication.mode is
  'api where the platform publishes reliably; handoff where it does not. An honest queue beats '
  'a promise that breaks quietly.';

create table publication_metric (
  id             uuid primary key default gen_random_uuid(),
  publication_id uuid not null references publication(id) on delete cascade,
  captured_at    timestamptz not null default now(),
  impressions    int, engagements int, clicks int, conversions int
);

create index on content_derivative (asset_id, status);
create index on publication (status, channel);
