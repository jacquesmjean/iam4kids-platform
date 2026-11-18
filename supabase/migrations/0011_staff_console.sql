-- =====================================================================
-- 0011 — THE STAFF CONSOLE
--
-- Responds to Mark's feedback of 15 October 2026 and his email of
-- 16 November ("I've been waiting for access to an interface where I can
-- make changes without bothering you guys").
--
-- What was wrong, and why this migration exists:
--
--   is_staff() was SECURITY INVOKER. It reads role_assignment, which has
--   RLS and no policy (deny-all), so for every signed-in user it returned
--   false. And person's own policy calls is_staff(), so the check could
--   never succeed. Every staff-only table was readable by nobody. Mark's
--   feedback landed in client_feedback on 15 October and no screen could
--   ever have shown it. That is the failure this migration closes first.
--
-- Everything else here is what the console needs: a notification trail so
-- a submission reaches a person the same day, editable site wording with a
-- revision history, staff write access to events, a schools inquiry inbox,
-- the Atlas OS starter, the decisions list Mark asked for, and a
-- registration function that works with the publishable key alone.
--
-- Design rule carried through: the app never needs the service role key.
-- Staff sign in, their own session carries their identity, and the
-- policies below decide what they can do. A bug in the app cannot hand
-- the public a child record, because the app does not hold the key that
-- could read one.
-- =====================================================================

-- ---------------------------------------------------------------------
-- 1. is_staff(), fixed
--
-- SECURITY DEFINER so the lookup reads role_assignment and person as the
-- owner, bypassing their RLS. Safe: it takes no argument and only answers
-- one question about the caller (auth.uid()). It cannot be pointed at
-- anyone else. search_path stays pinned.
-- ---------------------------------------------------------------------
create or replace function public.is_staff() returns boolean
  language sql
  stable
  security definer
  set search_path = public, pg_temp
as $$
  select exists (
    select 1 from public.role_assignment ra
    join public.person p on p.id = ra.person_id
    where p.auth_user_id = auth.uid() and ra.role = 'staff'
  );
$$;
revoke all on function public.is_staff() from public;
grant execute on function public.is_staff() to anon, authenticated, service_role;

-- The signed-in person's id, or null. Used by triggers to stamp who did what.
create or replace function public.current_person_id() returns uuid
  language sql
  stable
  security definer
  set search_path = public, pg_temp
as $$
  select id from public.person where auth_user_id = auth.uid() limit 1;
$$;
revoke all on function public.current_person_id() from public;
grant execute on function public.current_person_id() to authenticated, service_role;

-- Who is signed in, if they are staff. The console header reads this.
create or replace function public.current_staff() returns json
  language sql
  stable
  security definer
  set search_path = public, pg_temp
as $$
  select json_build_object('person_id', p.id, 'full_name', p.full_name, 'email', p.email::text)
  from public.person p
  join public.role_assignment ra on ra.person_id = p.id and ra.role = 'staff'
  where p.auth_user_id = auth.uid()
  limit 1;
$$;
revoke all on function public.current_staff() from public;
grant execute on function public.current_staff() to authenticated, service_role;


-- ---------------------------------------------------------------------
-- 2. staff_notification
--
-- The guaranteed channel. Email is a nice second one, but email depends
-- on a provider key and a spam filter. A row in this table depends on
-- nothing: the console shows an unread count the moment someone signs in.
-- ---------------------------------------------------------------------
create table public.staff_notification (
  id            uuid primary key default gen_random_uuid(),
  kind          text not null check (kind in
                  ('feedback','school_inquiry','registration','decision_answered','system')),
  title         text not null,
  body          text,
  link          text,          -- console path without the locale, e.g. /admin/feedback
  subject_table text,
  subject_id    uuid,
  created_at    timestamptz not null default now(),
  read_at       timestamptz,
  read_by       uuid references public.person(id) on delete set null
);
alter table public.staff_notification enable row level security;
create policy notification_staff on public.staff_notification
  for all using (public.is_staff()) with check (public.is_staff());
revoke insert, delete on public.staff_notification from anon, authenticated;
revoke update on public.staff_notification from anon, authenticated;
grant update (read_at, read_by) on public.staff_notification to authenticated;
create index on public.staff_notification (read_at, created_at desc);


-- ---------------------------------------------------------------------
-- 3. client_feedback: read state, and an alert on every submission
--
-- The feedback itself stays immutable. Staff may mark it read and nothing
-- else: the column grant below is narrower than the policy on purpose.
-- What Mark wrote is a record. Nobody gets to edit it.
-- ---------------------------------------------------------------------
alter table public.client_feedback
  add column read_at timestamptz,
  add column read_by uuid references public.person(id) on delete set null;

revoke update on public.client_feedback from anon, authenticated;
grant update (read_at, read_by) on public.client_feedback to authenticated;

create policy feedback_staff_mark_read on public.client_feedback
  for update using (public.is_staff()) with check (public.is_staff());

create or replace function public.tg_feedback_notify() returns trigger
  language plpgsql
  security definer
  set search_path = public, pg_temp
as $$
begin
  insert into public.staff_notification (kind, title, body, link, subject_table, subject_id, created_at)
  values (
    'feedback',
    'New feedback from ' || new.author_name,
    left(coalesce(new.anything_else, new.hopes, new.vision_serves, new.platform_changes, ''), 280),
    '/admin/feedback',
    'client_feedback',
    new.id,
    new.created_at
  );
  return new;
end;
$$;

create trigger client_feedback_notify
  after insert on public.client_feedback
  for each row execute function public.tg_feedback_notify();


-- ---------------------------------------------------------------------
-- 4. site_block: wording Mark can change himself
--
-- Keys are defined by the code (each page declares which blocks it reads).
-- Staff edit values only. They cannot invent keys, delete blocks or touch
-- the labels, so the editor can never break a page by accident.
-- Every change writes a revision, which is also how "undo" works.
-- ---------------------------------------------------------------------
create table public.site_block (
  key        text not null,
  locale     text not null check (locale in ('en','es')),
  page       text not null,
  label      text not null,
  help       text,
  kind       text not null default 'text' check (kind in ('text','longtext','url','email')),
  value      text not null default '',
  sort       int  not null default 0,
  updated_by uuid references public.person(id) on delete set null,
  updated_at timestamptz not null default now(),
  primary key (key, locale)
);
comment on table public.site_block is
  'Editable page wording. Public may read; staff may change the value only. Every change is kept.';

create table public.site_block_revision (
  id         uuid primary key default gen_random_uuid(),
  key        text not null,
  locale     text not null,
  old_value  text,
  new_value  text,
  changed_by uuid references public.person(id) on delete set null,
  changed_at timestamptz not null default now()
);
create index on public.site_block_revision (key, locale, changed_at desc);

alter table public.site_block enable row level security;
alter table public.site_block_revision enable row level security;

create policy site_block_public_read on public.site_block for select using (true);
create policy site_block_staff_update on public.site_block
  for update using (public.is_staff()) with check (public.is_staff());
create policy site_block_revision_staff_read on public.site_block_revision
  for select using (public.is_staff());

revoke insert, delete on public.site_block from anon, authenticated;
revoke update on public.site_block from anon, authenticated;
grant update (value) on public.site_block to authenticated;
revoke insert, update, delete on public.site_block_revision from anon, authenticated;

create or replace function public.tg_site_block_revision() returns trigger
  language plpgsql
  security definer
  set search_path = public, pg_temp
as $$
begin
  if new.value is distinct from old.value then
    new.updated_at := now();
    new.updated_by := public.current_person_id();
    insert into public.site_block_revision (key, locale, old_value, new_value, changed_by)
    values (old.key, old.locale, old.value, new.value, new.updated_by);
  end if;
  return new;
end;
$$;

create trigger site_block_revision
  before update on public.site_block
  for each row execute function public.tg_site_block_revision();


-- ---------------------------------------------------------------------
-- 5. Events: staff can create and change them, never delete them
--
-- Deleting a session would cascade into registrations. A session that is
-- not happening is cancelled, which keeps the record of who signed up.
-- ---------------------------------------------------------------------
create policy event_staff_write on public.event
  for all using (public.is_staff()) with check (public.is_staff());
create policy session_staff_write on public.event_session
  for all using (public.is_staff()) with check (public.is_staff());
revoke delete on public.event, public.event_session from anon, authenticated;


-- ---------------------------------------------------------------------
-- 6. school_inquiry: the principals' front door
--
-- Same posture as client_feedback. Anyone may submit, only staff may read,
-- and staff may change the status and their own note, never what the
-- school wrote. The fields mirror the form already on iam4kids.com/schools
-- (name, title, school, email, phone, number of students) so schools are
-- asked what Mark already asks them.
-- ---------------------------------------------------------------------
create table public.school_inquiry (
  id            uuid primary key default gen_random_uuid(),
  contact_name  text not null check (char_length(contact_name) between 1 and 200),
  contact_title text check (char_length(contact_title) <= 200),
  school_name   text not null check (char_length(school_name) between 1 and 300),
  email         text not null check (char_length(email) <= 255 and email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'),
  phone         text check (char_length(phone) <= 50),
  student_count int  check (student_count between 0 and 100000),
  interest      text check (interest in ('program_only','program_live_launch','masterclass','not_sure')),
  message       text check (char_length(message) <= 5000),
  locale        text not null default 'en' check (locale in ('en','es')),
  source        text check (char_length(source) <= 120),
  status        text not null default 'new'
                  check (status in ('new','contacted','in_conversation','won','closed')),
  staff_note    text check (char_length(staff_note) <= 5000),
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);
alter table public.school_inquiry enable row level security;

create policy school_inquiry_public_insert on public.school_inquiry
  for insert to anon, authenticated
  with check (status = 'new' and staff_note is null);
create policy school_inquiry_staff_read on public.school_inquiry
  for select using (public.is_staff());
create policy school_inquiry_staff_update on public.school_inquiry
  for update using (public.is_staff()) with check (public.is_staff());

revoke update, delete on public.school_inquiry from anon, authenticated;
grant update (status, staff_note) on public.school_inquiry to authenticated;
create index on public.school_inquiry (status, created_at desc);

create or replace function public.tg_school_inquiry() returns trigger
  language plpgsql
  security definer
  set search_path = public, pg_temp
as $$
begin
  if tg_op = 'INSERT' then
    insert into public.staff_notification (kind, title, body, link, subject_table, subject_id)
    values (
      'school_inquiry',
      'School inquiry: ' || new.school_name,
      new.contact_name || coalesce(', ' || new.contact_title, '') || ' · ' || new.email
        || coalesce(' · ' || new.student_count || ' students', ''),
      '/admin/schools',
      'school_inquiry',
      new.id
    );
    return new;
  end if;
  new.updated_at := now();
  return new;
end;
$$;

create trigger school_inquiry_notify
  after insert on public.school_inquiry
  for each row execute function public.tg_school_inquiry();
create trigger school_inquiry_touch
  before update on public.school_inquiry
  for each row execute function public.tg_school_inquiry();


-- ---------------------------------------------------------------------
-- 7. atlas_entry: Atlas OS, the starter
--
-- Mark's words: "I want all of that organized in one place so that when
-- we use AI to create something, it's working from our actual standards
-- instead of guessing."
--
-- Two of his guardrails are enforced here rather than promised:
--   * A claim or a piece of history cannot be approved without evidence.
--     That is "never make up numbers" and "don't lose the legitimate
--     history" in one constraint.
--   * Editing an approved claim or history entry sends it back to draft.
--     Nothing changes meaning under his name without him seeing it again.
-- ---------------------------------------------------------------------
create table public.atlas_entry (
  id          uuid primary key default gen_random_uuid(),
  kind        text not null check (kind in
                ('guardrail','voice','claim','history','program','character','message','term')),
  title       text not null check (char_length(title) between 1 and 200),
  body        text not null check (char_length(body) <= 20000),
  evidence    text check (char_length(evidence) <= 2000),
  locale      text not null default 'en' check (locale in ('en','es')),
  status      text not null default 'draft' check (status in ('draft','approved','retired')),
  source      text check (char_length(source) <= 300),
  sort        int  not null default 0,
  created_by  uuid references public.person(id) on delete set null,
  created_at  timestamptz not null default now(),
  updated_by  uuid references public.person(id) on delete set null,
  updated_at  timestamptz not null default now(),
  approved_by uuid references public.person(id) on delete set null,
  approved_at timestamptz,
  constraint atlas_claims_need_evidence check (
    kind not in ('claim','history')
    or status <> 'approved'
    or char_length(coalesce(evidence, '')) > 0
  )
);
comment on table public.atlas_entry is
  'Atlas OS. The standards AI must work from. Claims and history need evidence to be approved.';

alter table public.atlas_entry enable row level security;
create policy atlas_staff on public.atlas_entry
  for all using (public.is_staff()) with check (public.is_staff());
revoke delete on public.atlas_entry from anon, authenticated;
create index on public.atlas_entry (kind, status, sort);

create or replace function public.tg_atlas_entry() returns trigger
  language plpgsql
  security definer
  set search_path = public, pg_temp
as $$
begin
  if tg_op = 'INSERT' then
    new.created_by := coalesce(new.created_by, public.current_person_id());
  else
    -- An approved claim or history entry whose substance changed goes back to draft.
    if old.status = 'approved' and new.status = 'approved'
       and new.kind in ('claim','history')
       and (new.body is distinct from old.body or new.evidence is distinct from old.evidence) then
      new.status := 'draft';
    end if;
  end if;

  new.updated_at := now();
  new.updated_by := coalesce(public.current_person_id(), new.updated_by);

  if new.status = 'approved' and (tg_op = 'INSERT' or old.status <> 'approved') then
    -- A seeded entry may carry its true approval time (when Mark wrote it).
    new.approved_at := case when tg_op = 'INSERT' then coalesce(new.approved_at, now()) else now() end;
    new.approved_by := coalesce(public.current_person_id(), new.approved_by);
  elsif new.status <> 'approved' then
    new.approved_at := null;
    new.approved_by := null;
  end if;
  return new;
end;
$$;

create trigger atlas_entry_stamp
  before insert or update on public.atlas_entry
  for each row execute function public.tg_atlas_entry();

-- Approved guardrails, readable by the public Content OS page. Guardrails
-- are not secret; showing them next to the drafts is the point.
create or replace function public.atlas_guardrails()
returns table (title text, body text)
  language sql
  stable
  security definer
  set search_path = public, pg_temp
as $$
  select title, body from public.atlas_entry
  where kind = 'guardrail' and status = 'approved' and locale = 'en'
  order by sort, created_at;
$$;
revoke all on function public.atlas_guardrails() from public;
grant execute on function public.atlas_guardrails() to anon, authenticated, service_role;


-- ---------------------------------------------------------------------
-- 8. decision_request: what we need from Mark, in one list
--
-- He asked on 15 October: "I'd also appreciate knowing which decisions you
-- need from me right now so I can keep things moving." This is that list.
-- Answering one notifies the rest of the team.
-- ---------------------------------------------------------------------
create table public.decision_request (
  id          uuid primary key default gen_random_uuid(),
  question    text not null check (char_length(question) between 1 and 500),
  context     text check (char_length(context) <= 3000),
  status      text not null default 'open' check (status in ('open','answered','withdrawn')),
  answer      text check (char_length(answer) <= 5000),
  answered_by uuid references public.person(id) on delete set null,
  answered_at timestamptz,
  needed_by   date,
  sort        int not null default 0,
  created_at  timestamptz not null default now()
);
alter table public.decision_request enable row level security;
create policy decision_staff on public.decision_request
  for all using (public.is_staff()) with check (public.is_staff());
revoke delete on public.decision_request from anon, authenticated;

create or replace function public.tg_decision_answered() returns trigger
  language plpgsql
  security definer
  set search_path = public, pg_temp
as $$
begin
  if tg_op = 'UPDATE' and new.status = 'answered' and old.status <> 'answered' then
    new.answered_at := coalesce(new.answered_at, now());
    new.answered_by := coalesce(new.answered_by, public.current_person_id());
    insert into public.staff_notification (kind, title, body, link, subject_table, subject_id)
    values ('decision_answered', 'Decision answered: ' || left(new.question, 120),
            left(coalesce(new.answer, ''), 280), '/admin/decisions', 'decision_request', new.id);
  elsif new.status = 'open' then
    new.answered_at := null;
    new.answered_by := null;
  end if;
  return new;
end;
$$;
create trigger decision_answered
  before update on public.decision_request
  for each row execute function public.tg_decision_answered();


-- ---------------------------------------------------------------------
-- 9. register_for_event(): registration that works with the public key
--
-- The register route needed the service role key, which this deployment
-- has never had, so every registration so far was a preview that wrote
-- nothing. This function does the same six writes in one transaction,
-- with the same idempotency, and it is the only door: it validates its
-- own input, it only ever opens the next future session, and it never
-- returns a row it did not just write.
--
-- Two behaviours the old code did not have:
--   * A session in the past cannot be registered for. The demo session is
--     dated 16 August and was still "scheduled".
--   * A full session waitlists instead of overbooking.
-- ---------------------------------------------------------------------
create or replace function public.register_for_event(
  p_slug             text,
  p_guardian_name    text,
  p_guardian_email   text,
  p_child_first_name text,
  p_child_age        int,
  p_language         text    default 'en',
  p_consent          boolean default false,
  p_source           text    default null,
  p_campaign         text    default null
) returns json
  language plpgsql
  volatile
  security definer
  set search_path = public, extensions, pg_temp
as $$
declare
  v_session   record;
  v_email     text := lower(trim(coalesce(p_guardian_email, '')));
  v_name      text := trim(coalesce(p_guardian_name, ''));
  v_child     text := trim(coalesce(p_child_first_name, ''));
  v_lang      text := case when p_language in ('en','es') then p_language else 'en' end;
  v_person    uuid;
  v_household uuid;
  v_child_id  uuid;
  v_reg       uuid;
  v_status    text;
  v_confirmed int;
begin
  if p_consent is not true then
    raise exception 'consent_required' using errcode = '22023';
  end if;
  if char_length(v_name) not between 1 and 200 then
    raise exception 'invalid_name' using errcode = '22023';
  end if;
  if char_length(v_email) > 255 or v_email !~* '^[^@\s]+@[^@\s]+\.[^@\s]+$' then
    raise exception 'invalid_email' using errcode = '22023';
  end if;
  if char_length(v_child) not between 1 and 100 then
    raise exception 'invalid_child_name' using errcode = '22023';
  end if;
  if p_child_age is null or p_child_age not between 4 and 18 then
    raise exception 'invalid_child_age' using errcode = '22023';
  end if;

  select s.id, s.capacity, s.starts_at, e.id as event_id, e.title
    into v_session
  from public.event_session s
  join public.event e on e.id = s.event_id
  where e.slug = p_slug and s.status = 'scheduled' and s.starts_at > now()
  order by s.starts_at
  limit 1;

  if not found then
    raise exception 'no_upcoming_session' using errcode = 'P0002';
  end if;

  -- 1. Person. An existing record is matched, never renamed: a stranger
  --    typing someone else's email must not be able to overwrite their name.
  insert into public.person (full_name, email, preferred_language)
  values (v_name, v_email, v_lang)
  on conflict (email) do nothing;
  select id into v_person from public.person where email = v_email::citext;

  -- 2. Household, one per guardian.
  insert into public.household (primary_person_id) values (v_person)
  on conflict (primary_person_id) do nothing;
  select id into v_household from public.household where primary_person_id = v_person;

  -- 3. Guardian role in that household.
  insert into public.role_assignment (person_id, role, household_id)
  values (v_person, 'guardian', v_household)
  on conflict on constraint role_assignment_unique do nothing;

  -- 4. The child. No email, no phone, no login. There is nowhere to put one.
  insert into public.child_profile (household_id, first_name, age_band)
  values (v_household, v_child, p_child_age)
  on conflict on constraint child_profile_household_identity do nothing;
  select id into v_child_id from public.child_profile
  where household_id = v_household and first_name = v_child and age_band = p_child_age;

  -- 5. Consent, appended with the wording version.
  insert into public.consent (person_id, scope, method, evidence)
  values (v_person, 'guardian_consent + event_comms', 'checkbox_v1',
          jsonb_build_object('form_version', 'reset-v1', 'child_profile_id', v_child_id,
                             'session_id', v_session.id));

  -- 6. Registration. Waitlist when full. A repeat submit updates, never duplicates.
  select count(*) into v_confirmed from public.registration
  where session_id = v_session.id and status = 'confirmed';

  v_status := case
    when v_session.capacity is not null and v_confirmed >= v_session.capacity then 'waitlisted'
    else 'confirmed'
  end;

  insert into public.registration as r
    (session_id, person_id, household_id, child_profile_id, status, source, campaign)
  values
    (v_session.id, v_person, v_household, v_child_id, v_status, left(p_source, 120), left(p_campaign, 120))
  on conflict (session_id, person_id) do update
    set child_profile_id = excluded.child_profile_id,
        status = case when r.status = 'cancelled' then excluded.status else r.status end
  returning id, status into v_reg, v_status;

  -- The journey, queued once per registration. Reminders are timed off the session.
  insert into public.event_message (registration_id, kind, scheduled_for)
  select v_reg, k,
         case k when 'confirmation' then now()
                when 'reminder_24h' then v_session.starts_at - interval '24 hours'
                else v_session.starts_at - interval '1 hour' end
  from unnest(array['confirmation','reminder_24h','reminder_1h']) as k
  where not exists (
    select 1 from public.event_message m where m.registration_id = v_reg and m.kind = k
  )
  -- A reminder whose moment has already passed is not queued. Registering
  -- an hour before a session should not produce a "see you tomorrow".
  and (k = 'confirmation'
       or (k = 'reminder_24h' and v_session.starts_at - interval '24 hours' > now())
       or (k = 'reminder_1h'  and v_session.starts_at - interval '1 hour'  > now()));

  insert into public.interaction (person_id, kind, subject, metadata)
  values (v_person, 'registered', v_session.title,
          jsonb_build_object('session_id', v_session.id, 'source', p_source, 'campaign', p_campaign));

  return json_build_object(
    'registration_id', v_reg,
    'status',          v_status,
    'starts_at',       v_session.starts_at,
    'event_title',     v_session.title
  );
end;
$$;
revoke all on function public.register_for_event(text,text,text,text,int,text,boolean,text,text) from public;
grant execute on function public.register_for_event(text,text,text,text,int,text,boolean,text,text)
  to anon, authenticated, service_role;
