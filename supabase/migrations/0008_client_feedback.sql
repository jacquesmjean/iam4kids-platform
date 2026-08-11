-- =====================================================================
-- 0008 — client_feedback
--
-- Feedback given in a meeting evaporates. Feedback given to a form is a
-- record with a timestamp, attached to the thing it is about.
--
-- RLS shape is deliberate and unusual: INSERT is open to anon, SELECT is
-- staff-only. A feedback form must accept a submission from someone who is
-- not logged in, and must never let that same someone read what anyone
-- else wrote. Insert-only-for-the-public is the correct posture, and it is
-- also what lets this work with the publishable key alone.
-- =====================================================================

create table client_feedback (
  id            uuid primary key default gen_random_uuid(),
  author_name   text not null,
  author_role   text,
  guardrails    text,
  go_live_date  date,
  go_live_driver text,
  hopes         text,
  priority      text check (priority in
                  ('events','content','schools','impact','public_site','not_sure')),
  locale        text not null default 'en' check (locale in ('en','es')),
  source        text,
  created_at    timestamptz not null default now()
);

comment on table client_feedback is
  'Structured client feedback. Public may insert, only staff may read.';

alter table client_feedback enable row level security;

create policy feedback_public_insert on client_feedback
  for insert to anon, authenticated
  with check (true);

create policy feedback_staff_read on client_feedback
  for select using (public.is_staff());

create index on client_feedback (created_at desc);
