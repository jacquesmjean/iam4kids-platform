-- 0016: one front door, one backend.
--
-- The public site used to be a separate app with its own intake table
-- (leads), its own ticket table, its own staff table and its own admin.
-- None of it was wired to the staff console, and the public could not
-- write to it under row-level security, so every inquiry went nowhere.
--
-- From here the public pages live in this app and write here:
--   * submit_inquiry()  the Get Started form. Schools land in
--                       school_inquiry (so the Masterclass tracking and
--                       the existing screen keep working); families,
--                       agencies and everyone else land in inquiry.
--   * log_concierge()   every chat turn is kept, so "a team member can
--                       see every conversation" is true. A message that
--                       sounds like a child in danger raises an urgent
--                       notification.
-- Both are SECURITY DEFINER functions: the public can call them, but it
-- cannot read, change or delete a single row.
--
-- Then the July tables that nothing uses any more are dropped.

-- ---------------------------------------------------------------------
-- 1. Notification kinds
-- ---------------------------------------------------------------------
alter table public.staff_notification drop constraint if exists staff_notification_kind_check;
alter table public.staff_notification add constraint staff_notification_kind_check
  check (kind in ('feedback','school_inquiry','inquiry','concierge','registration','decision_answered','system'));

-- ---------------------------------------------------------------------
-- 2. inquiry: families, agencies, sponsors, everyone who is not a school
-- ---------------------------------------------------------------------
create table if not exists public.inquiry (
  id            uuid primary key default gen_random_uuid(),
  kind          text not null check (kind in ('parent','agency','other')),
  interest      text check (interest in ('family','roundtable','academy','webinar','partner','other')),
  full_name     text not null check (char_length(full_name) between 1 and 200),
  email         text not null check (char_length(email) <= 255 and email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'),
  phone         text check (char_length(phone) <= 50),
  organization  text check (char_length(organization) <= 300),
  message       text check (char_length(message) <= 5000),
  locale        text not null default 'en' check (locale in ('en','es')),
  source        text check (char_length(source) <= 120),
  status        text not null default 'new'
                  check (status in ('new','contacted','in_conversation','won','closed')),
  staff_note    text check (char_length(staff_note) <= 5000),
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);
alter table public.inquiry enable row level security;

drop policy if exists inquiry_staff_read on public.inquiry;
drop policy if exists inquiry_staff_update on public.inquiry;
create policy inquiry_staff_read on public.inquiry
  for select using (public.is_staff());
create policy inquiry_staff_update on public.inquiry
  for update using (public.is_staff()) with check (public.is_staff());

revoke all on public.inquiry from anon;
revoke insert, update, delete, truncate on public.inquiry from authenticated;
grant select on public.inquiry to authenticated;
grant update (status, staff_note) on public.inquiry to authenticated;
create index if not exists inquiry_status_created on public.inquiry (status, created_at desc);

create or replace function public.tg_inquiry() returns trigger
  language plpgsql
  security definer
  set search_path = public, pg_temp
as $$
begin
  if tg_op = 'INSERT' then
    insert into public.staff_notification (kind, title, body, link, subject_table, subject_id)
    values (
      'inquiry',
      case new.kind when 'parent' then 'Family inquiry: ' when 'agency' then 'Partner inquiry: ' else 'Inquiry: ' end
        || new.full_name,
      coalesce(new.interest || ' · ', '') || new.email || coalesce(' · ' || new.organization, ''),
      '/admin/inquiries',
      'inquiry',
      new.id
    );
    return new;
  end if;
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists inquiry_notify on public.inquiry;
drop trigger if exists inquiry_touch on public.inquiry;
create trigger inquiry_notify after insert on public.inquiry
  for each row execute function public.tg_inquiry();
create trigger inquiry_touch before update on public.inquiry
  for each row execute function public.tg_inquiry();

-- ---------------------------------------------------------------------
-- 3. submit_inquiry(): the one entry point for the Get Started form
-- ---------------------------------------------------------------------
create or replace function public.submit_inquiry(
  p_kind     text,
  p_interest text,
  p_name     text,
  p_email    text,
  p_phone    text default null,
  p_org      text default null,
  p_message  text default null,
  p_locale   text default 'en',
  p_source   text default null
) returns text
  language plpgsql
  security definer
  set search_path = public, pg_temp
as $$
declare
  v_name   text := nullif(btrim(coalesce(p_name, '')), '');
  v_email  text := lower(nullif(btrim(coalesce(p_email, '')), ''));
  v_phone  text := nullif(btrim(coalesce(p_phone, '')), '');
  v_org    text := nullif(btrim(coalesce(p_org, '')), '');
  v_msg    text := nullif(btrim(coalesce(p_message, '')), '');
  v_locale text := case when p_locale = 'es' then 'es' else 'en' end;
  v_source text := left(nullif(btrim(coalesce(p_source, '')), ''), 120);
begin
  if v_name is null or char_length(v_name) > 200 then
    raise exception 'name is required' using errcode = '22023';
  end if;
  if v_email is null or char_length(v_email) > 255 or v_email !~* '^[^@\s]+@[^@\s]+\.[^@\s]+$' then
    raise exception 'a valid email is required' using errcode = '22023';
  end if;
  if char_length(coalesce(v_msg, '')) > 5000 or char_length(coalesce(v_phone, '')) > 50
     or char_length(coalesce(v_org, '')) > 300 then
    raise exception 'too long' using errcode = '22023';
  end if;

  -- The same person pressing Send twice is one inquiry, not two.
  if p_kind = 'school' then
    if exists (select 1 from public.school_inquiry
                where email = v_email and created_at > now() - interval '10 minutes') then
      return 'school';
    end if;
    insert into public.school_inquiry
      (contact_name, school_name, email, phone, interest, message, locale, source)
    values (
      v_name,
      coalesce(v_org, 'School not named'),
      v_email,
      v_phone,
      case p_interest when 'school_program' then 'program_only'
                      when 'school_launch'  then 'program_live_launch'
                      else 'not_sure' end,
      v_msg,
      v_locale,
      coalesce(v_source, 'get-started')
    );
    return 'school';
  end if;

  if exists (select 1 from public.inquiry
              where email = v_email and created_at > now() - interval '10 minutes') then
    return 'inquiry';
  end if;
  insert into public.inquiry
    (kind, interest, full_name, email, phone, organization, message, locale, source)
  values (
    case when p_kind in ('parent','agency') then p_kind else 'other' end,
    case when p_interest in ('family','roundtable','academy','webinar','partner') then p_interest
         else 'other' end,
    v_name, v_email, v_phone, v_org, v_msg, v_locale,
    coalesce(v_source, 'get-started')
  );
  return 'inquiry';
end;
$$;

revoke all on function public.submit_inquiry(text,text,text,text,text,text,text,text,text) from public;
grant execute on function public.submit_inquiry(text,text,text,text,text,text,text,text,text) to anon, authenticated;

-- ---------------------------------------------------------------------
-- 4. concierge_message: every chat turn, kept for the team
-- ---------------------------------------------------------------------
create table if not exists public.concierge_message (
  id              uuid primary key default gen_random_uuid(),
  conversation_id uuid not null,
  role            text not null check (role in ('visitor','assistant')),
  content         text not null check (char_length(content) between 1 and 2000),
  locale          text not null default 'en' check (locale in ('en','es')),
  flag            text check (flag in ('crisis','child','handoff')),
  page            text check (char_length(page) <= 200),
  created_at      timestamptz not null default clock_timestamp()
);
alter table public.concierge_message enable row level security;
drop policy if exists concierge_staff_read on public.concierge_message;
create policy concierge_staff_read on public.concierge_message
  for select using (public.is_staff());
revoke all on public.concierge_message from anon;
revoke insert, update, delete, truncate on public.concierge_message from authenticated;
grant select on public.concierge_message to authenticated;
create index if not exists concierge_conv on public.concierge_message (conversation_id, created_at);
create index if not exists concierge_recent on public.concierge_message (created_at desc);

create or replace function public.log_concierge(
  p_conversation uuid,
  p_visitor      text,
  p_reply        text,
  p_locale       text default 'en',
  p_flag         text default null,
  p_page         text default null
) returns void
  language plpgsql
  security definer
  set search_path = public, pg_temp
as $$
declare
  v_locale text := case when p_locale = 'es' then 'es' else 'en' end;
  v_flag   text := case when p_flag in ('crisis','child','handoff') then p_flag end;
  v_turns  int;
begin
  if p_conversation is null or nullif(btrim(coalesce(p_visitor, '')), '') is null then
    return;
  end if;
  -- A runaway script cannot fill the table: one conversation keeps 60 rows at most.
  select count(*) into v_turns from public.concierge_message where conversation_id = p_conversation;
  if v_turns >= 60 then
    return;
  end if;

  insert into public.concierge_message (conversation_id, role, content, locale, flag, page)
  values (p_conversation, 'visitor', left(btrim(p_visitor), 2000), v_locale, v_flag, left(p_page, 200));
  if nullif(btrim(coalesce(p_reply, '')), '') is not null then
    insert into public.concierge_message (conversation_id, role, content, locale, page)
    values (p_conversation, 'assistant', left(btrim(p_reply), 2000), v_locale, left(p_page, 200));
  end if;

  if v_flag = 'crisis' then
    insert into public.staff_notification (kind, title, body, link, subject_table, subject_id)
    values ('concierge', 'Urgent: a chat needs a person now', left(btrim(p_visitor), 280),
            '/admin/chats#c-' || p_conversation, 'concierge_message', p_conversation);
  elsif v_turns = 0 then
    -- First message of a new conversation: one quiet notification, not one per line.
    insert into public.staff_notification (kind, title, body, link, subject_table, subject_id)
    values ('concierge', 'New chat on the website', left(btrim(p_visitor), 280),
            '/admin/chats#c-' || p_conversation, 'concierge_message', p_conversation);
  end if;
end;
$$;

revoke all on function public.log_concierge(uuid,text,text,text,text,text) from public;
grant execute on function public.log_concierge(uuid,text,text,text,text,text) to anon, authenticated;

revoke execute on function public.tg_inquiry() from public, anon, authenticated;

-- ---------------------------------------------------------------------
-- 5. Retire the July back office. Nothing reads or writes these tables:
--    leads, tickets, onboarding_cases, contracts, invoices, payouts and
--    activities hold no rows; staff holds one row (Jacques), replaced
--    by person + role_assignment. Staff sign-in is unaffected.
-- ---------------------------------------------------------------------
drop table if exists public.invoices         cascade;
drop table if exists public.payouts          cascade;
drop table if exists public.contracts        cascade;
drop table if exists public.onboarding_cases cascade;
drop table if exists public.tickets          cascade;
drop table if exists public.activities       cascade;
drop table if exists public.leads            cascade;
drop table if exists public.staff            cascade;
