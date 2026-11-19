-- 0017: ask Mark where Family Reset sign-ups should live.
-- The website button goes to events.iam4kids.com; the platform has its own
-- registration page. Two lists is one too many, so it is his call.
insert into public.decision_request (question, context, needed_by, sort)
select 'Family Reset sign-ups: keep events.iam4kids.com, or move them onto this platform?',
       'Today the "Reserve your free seat" button on the website goes to your existing events page (events.iam4kids.com). The platform also has its own registration page, which opens automatically when you set a date in Events and puts every family straight into your console. Keeping both means two lists. Tell us which one you want families to use, and we will point the button there.',
       '2026-11-25', 25
where not exists (select 1 from public.decision_request where question like 'Family Reset sign-ups:%');
