-- =====================================================================
-- 0012 — CONSOLE CONTENT, SEEDED FROM MARK'S OWN WORDS
--
-- Rule for everything below: nothing is invented.
--
--   * Schools page wording is taken from iam4kids.com/schools as published
--     on 18 November 2026, lightly shortened. Spanish is a translation of
--     that text, editable like the English.
--   * Atlas guardrails are Mark's sentences from his feedback form of
--     15 October 2026. They start approved because he wrote them.
--   * Everything else in Atlas (programs, claims, voice) starts as a DRAFT
--     with its evidence attached. It is his to confirm, not ours.
--   * Characters are deliberately empty. He has established characters;
--     we do not know them and will not make them up.
--   * Decisions he already answered in the form are recorded as answered,
--     in his words, so the open list shows only what is still open.
-- =====================================================================

-- ---------- Schools page wording (en / es) ----------
insert into public.site_block (key, locale, page, label, help, kind, value, sort) values
('schools.eyebrow','en','schools','Small heading above the title',null,'text','I AM 4 Kids for Schools',10),
('schools.eyebrow','es','schools','Small heading above the title',null,'text','I AM 4 Kids para escuelas',10),

('schools.title','en','schools','Page title',null,'text','Bring I AM 4 Kids to your school',20),
('schools.title','es','schools','Page title',null,'text','Lleve I AM 4 Kids a su escuela',20),

('schools.subtitle','en','schools','Line under the title',null,'text','Helping students build confidence, character, and leadership alongside academics.',30),
('schools.subtitle','es','schools','Line under the title',null,'text','Ayudamos a los estudiantes a desarrollar confianza, carácter y liderazgo junto con lo académico.',30),

('schools.masterclass_note','en','schools','Note for Masterclass attendees','Shown in a highlighted box at the top of the page. Leave it empty to hide the box.','longtext','',35),
('schools.masterclass_note','es','schools','Note for Masterclass attendees','Shown in a highlighted box at the top of the page. Leave it empty to hide the box.','longtext','',35),

('schools.intro','en','schools','Opening paragraphs','A blank line starts a new paragraph.','longtext',
 'Schools teach students what to know and what to do. I AM 4 Kids helps them decide who they are becoming.

The I AM 4 Kids School Experience gives students practical language and tools to build confidence, resilience, leadership, belonging, and positive self-talk, and then practice those identities through their actions.',40),
('schools.intro','es','schools','Opening paragraphs','A blank line starts a new paragraph.','longtext',
 'Las escuelas enseñan a los estudiantes qué saber y qué hacer. I AM 4 Kids les ayuda a decidir en quién se están convirtiendo.

La experiencia escolar I AM 4 Kids da a los estudiantes lenguaje y herramientas prácticas para desarrollar confianza, resiliencia, liderazgo, sentido de pertenencia y un diálogo interno positivo, y luego practicar esas identidades con sus acciones.',40),

('schools.ages','en','schools','Ages line',null,'text','Designed primarily for students ages 7 to 12.',45),
('schools.ages','es','schools','Ages line',null,'text','Diseñada principalmente para estudiantes de 7 a 12 años.',45),

('schools.reach','en','schools','Reach line','This is a claim. Keep it matched to the approved figure in Atlas. Leave it empty to hide it.','text','I AM 4 Kids has already reached more than 6,000 students across 37 schools.',50),
('schools.reach','es','schools','Reach line','This is a claim. Keep it matched to the approved figure in Atlas. Leave it empty to hide it.','text','I AM 4 Kids ya ha llegado a más de 6.000 estudiantes en 37 escuelas.',50),

('schools.moments_title','en','schools','Heading for the five moments',null,'text','The I AM 4 Kids School Experience',60),
('schools.moments_title','es','schools','Heading for the five moments',null,'text','La experiencia escolar I AM 4 Kids',60),

('schools.moment_1_title','en','schools','Moment 1: name',null,'text','Welcome',61),
('schools.moment_1_title','es','schools','Moment 1: name',null,'text','Bienvenida',61),
('schools.moment_1_body','en','schools','Moment 1: description',null,'longtext','School leaders and staff receive the guidance needed to prepare students, communicate with families, and create a strong beginning.',62),
('schools.moment_1_body','es','schools','Moment 1: description',null,'longtext','Los directivos y el personal reciben la orientación necesaria para preparar a los estudiantes, comunicarse con las familias y empezar con fuerza.',62),

('schools.moment_2_title','en','schools','Moment 2: name',null,'text','Launch',63),
('schools.moment_2_title','es','schools','Moment 2: name',null,'text','Lanzamiento',63),
('schools.moment_2_body','en','schools','Moment 2: description',null,'longtext','The experience begins through a live I AM 4 Kids assembly led by founder Mark Papadas or through a complete school-led launch experience.',64),
('schools.moment_2_body','es','schools','Moment 2: description',null,'longtext','La experiencia comienza con una asamblea en vivo de I AM 4 Kids dirigida por el fundador Mark Papadas o con un lanzamiento completo dirigido por la propia escuela.',64),

('schools.moment_3_title','en','schools','Moment 3: name',null,'text','Teach',65),
('schools.moment_3_title','es','schools','Moment 3: name',null,'text','Enseñanza',65),
('schools.moment_3_body','en','schools','Moment 3: description',null,'longtext','Educators guide students through ready-to-use lessons, conversations, activities, reflections, and classroom resources.',66),
('schools.moment_3_body','es','schools','Moment 3: description',null,'longtext','Los educadores guían a los estudiantes con lecciones, conversaciones, actividades, reflexiones y recursos de aula listos para usar.',66),

('schools.moment_4_title','en','schools','Moment 4: name',null,'text','Celebrate',67),
('schools.moment_4_title','es','schools','Moment 4: name',null,'text','Celebración',67),
('schools.moment_4_body','en','schools','Moment 4: description',null,'longtext','Students share their growth, recognize one another, complete their I AM 4 Kids Projects, and experience what it feels like to live the identities they have chosen.',68),
('schools.moment_4_body','es','schools','Moment 4: description',null,'longtext','Los estudiantes comparten su crecimiento, se reconocen unos a otros, completan su Proyecto I AM 4 Kids y viven lo que se siente al vivir las identidades que han elegido.',68),

('schools.moment_5_title','en','schools','Moment 5: name',null,'text','Measure',69),
('schools.moment_5_title','es','schools','Moment 5: name',null,'text','Medición',69),
('schools.moment_5_body','en','schools','Moment 5: description',null,'longtext','Schools use student reflections, participation evidence, educator feedback, and implementation tools to understand what students experienced and identify opportunities to continue the work.',70),
('schools.moment_5_body','es','schools','Moment 5: description',null,'longtext','Las escuelas usan las reflexiones de los estudiantes, la evidencia de participación, los comentarios de los educadores y las herramientas de implementación para entender lo que vivieron los estudiantes y ver cómo continuar el trabajo.',70),

('schools.options_title','en','schools','Heading for the two options',null,'text','Two ways to bring I AM 4 Kids to your school',80),
('schools.options_title','es','schools','Heading for the two options',null,'text','Dos maneras de llevar I AM 4 Kids a su escuela',80),

('schools.option_1_title','en','schools','Option 1: name',null,'text','Program Only',81),
('schools.option_1_title','es','schools','Option 1: name',null,'text','Solo el programa',81),
('schools.option_1_price','en','schools','Option 1: price','Leave empty to hide the price.','text','$2,500 per school',82),
('schools.option_1_price','es','schools','Option 1: price','Leave empty to hide the price.','text','2.500 USD por escuela',82),
('schools.option_1_body','en','schools','Option 1: description',null,'longtext','A complete, school-led implementation of The I AM 4 Kids Identity System. Ideal for schools that have an internal leader prepared to introduce and facilitate the experience.',83),
('schools.option_1_body','es','schools','Option 1: description',null,'longtext','Una implementación completa, dirigida por la escuela, de The I AM 4 Kids Identity System. Ideal para escuelas que cuentan con un líder interno preparado para presentar y facilitar la experiencia.',83),

('schools.option_2_title','en','schools','Option 2: name',null,'text','Program + Live Launch Day',84),
('schools.option_2_title','es','schools','Option 2: name',null,'text','Programa + Día de lanzamiento en vivo',84),
('schools.option_2_price','en','schools','Option 2: price','Leave empty to hide the price.','text','$6,500 per school',85),
('schools.option_2_price','es','schools','Option 2: price','Leave empty to hide the price.','text','6.500 USD por escuela',85),
('schools.option_2_body','en','schools','Option 2: description',null,'longtext','Everything in Program Only, plus a live schoolwide launch led by founder Mark Papadas: an interactive student assembly, the "Be Great!" / "I AM!" schoolwide activation, and a staff and educator orientation session.',86),
('schools.option_2_body','es','schools','Option 2: description',null,'longtext','Todo lo incluido en Solo el programa, más un lanzamiento en vivo para toda la escuela dirigido por el fundador Mark Papadas: una asamblea interactiva con los estudiantes, la activación escolar "Be Great!" / "I AM!" y una sesión de orientación para el personal y los educadores.',86),

('schools.travel_note','en','schools','Small print under the options',null,'text','Travel expenses outside Central Florida are billed separately.',87),
('schools.travel_note','es','schools','Small print under the options',null,'text','Los gastos de viaje fuera del centro de Florida se facturan por separado.',87),

('schools.form_title','en','schools','Form heading',null,'text','Start a School Experience conversation',90),
('schools.form_title','es','schools','Form heading',null,'text','Iniciemos una conversación sobre la experiencia escolar',90),
('schools.form_intro','en','schools','Line above the form',null,'longtext','Submitting the form does not commit your school to a program. It simply gives us the information needed to understand your school and discuss the best possible launch.',91),
('schools.form_intro','es','schools','Line above the form',null,'longtext','Enviar el formulario no compromete a su escuela con ningún programa. Solo nos da la información necesaria para conocer su escuela y conversar sobre el mejor lanzamiento posible.',91),
('schools.thanks','en','schools','Message after a school submits',null,'longtext','Thank you. A member of the I AM 4 Kids team will contact you to learn more about your school and answer your questions.',92),
('schools.thanks','es','schools','Message after a school submits',null,'longtext','Gracias. Un miembro del equipo de I AM 4 Kids se pondrá en contacto con usted para conocer mejor su escuela y responder sus preguntas.',92)
on conflict (key, locale) do nothing;


-- ---------- Atlas OS ----------
-- Guardrails: Mark's own sentences, approved as of the moment he wrote them.
insert into public.atlas_entry (kind, title, body, evidence, status, source, sort, approved_by, approved_at, created_by)
select g.kind, g.title, g.body,
       'Mark Papadas, platform feedback form, 15 October 2026.',
       'approved', 'Mark Papadas', g.sort,
       (select id from public.person where email = 'mark@iam4kids.com'),
       timestamptz '2026-10-15 12:29:13+00',
       (select id from public.person where email = 'mark@iam4kids.com')
from (values
  ('guardrail', 'Never invent', 'I don''t want AI making up accomplishments, statistics, testimonials, or stories.', 10),
  ('guardrail', 'My words, my meaning', 'I don''t want it putting words in my mouth or changing the meaning of what I''m trying to communicate.', 20),
  ('guardrail', 'Respect our standards', 'We have very specific language, messaging, characters, and brand standards that we''ve spent a lot of time developing. I want those respected.', 30),
  ('guardrail', 'Nothing published without approval', 'Nothing should be published in my name without approval. For now, the approver is me. If I''m unavailable, I''d rather have something wait than go out without approval.', 40),
  ('guardrail', 'Routine messages', 'Things like event confirmations and reminders shouldn''t need my approval every time once we''ve approved the process and the messaging.', 50),
  ('guardrail', 'No promises on my behalf', 'AI shouldn''t make promises or commitments on my behalf.', 60),
  ('guardrail', 'Children', 'AI should never communicate directly with children outside an experience we''ve specifically designed and approved to be safe.', 70),
  ('guardrail', 'Channels', 'Facebook and LinkedIn.', 80),
  ('guardrail', 'The mission comes first', 'Most importantly, nothing we do should ever compromise our mission.', 90)
) as g(kind, title, body, sort)
where not exists (select 1 from public.atlas_entry);

-- Drafts with evidence. His to confirm.
insert into public.atlas_entry (kind, title, body, evidence, status, source, sort)
select d.kind, d.title, d.body, d.evidence, 'draft', d.source, d.sort
from (values
  ('claim', 'Students and schools reached',
   'More than 6,000 students across 37 schools.',
   'Published on iam4kids.com/schools (captured 18 November 2026). Approve to let the content system use it. Add where the count comes from if you can.',
   'iam4kids.com/schools', 10),

  ('message', 'Mission',
   'Help kids believe in themselves before the world tells them not to.',
   'iam4kids.com home page (captured 18 November 2026).', 'iam4kids.com', 10),
  ('message', 'What I AM 4 Kids does',
   'The I AM 4 Kids Movement helps children ages 7-12 develop confidence, identity, and life skills through live family coaching, school programs, and empowering educational entertainment.',
   'iam4kids.com home page (captured 18 November 2026).', 'iam4kids.com', 20),
  ('message', 'Identity shapes destiny',
   'Identity shapes destiny.',
   'iam4kids.com home page (captured 18 November 2026).', 'iam4kids.com', 30),

  ('voice', 'Sign-off',
   'Be Great!',
   'Mark''s emails and iam4kids.com.', 'Mark Papadas', 10),
  ('voice', 'Call and response',
   '"Be Great!" is answered with "I AM!"',
   'iam4kids.com/schools (captured 18 November 2026).', 'iam4kids.com/schools', 20),

  ('term', 'The I AM 4 Kids Identity System',
   'Write it. Revise and improve it. Anchor it. Share and synergize it. Live it.',
   'iam4kids.com/schools (captured 18 November 2026).', 'iam4kids.com/schools', 10),
  ('term', 'The School Experience',
   'Five connected moments: Welcome, Launch, Teach, Celebrate, Measure.',
   'iam4kids.com/schools (captured 18 November 2026).', 'iam4kids.com/schools', 20),
  ('term', 'I AM 4 Kids Project',
   'Something meaningful a student does that benefits at least one person beyond themselves. It must be safe and appropriate.',
   'iam4kids.com/schools (captured 18 November 2026).', 'iam4kids.com/schools', 30),

  ('program', 'Be Great! Family Reset',
   'A free live online training for parents, educators, and anyone who wants to empower kids.',
   'iam4kids.com home page says "Every Other Sunday". Your feedback says weekly. See Decisions.', 'iam4kids.com', 10),
  ('program', 'Family Pack',
   '$495 one-time. A 4-week interactive family experience. Starts the first Monday of every month. Limited to 10 families per cohort.',
   'iam4kids.com/families.', 'iam4kids.com/families', 20),
  ('program', 'Roundtable',
   '$99 per month. Family mastermind with bi-weekly live sessions with Mark Papadas and expert guest teachers. Includes the Family Pack. Price locked for life.',
   'iam4kids.com/families.', 'iam4kids.com/families', 30),
  ('program', 'Academy',
   '$4,995 per year. Weekly expert sessions. Includes everything. Tuition locked for life.',
   'iam4kids.com/families.', 'iam4kids.com/families', 40),
  ('program', 'School: Program Only',
   '$2,500 per school. A complete, school-led implementation of The I AM 4 Kids Identity System.',
   'iam4kids.com/schools (captured 18 November 2026).', 'iam4kids.com/schools', 50),
  ('program', 'School: Program + Live Launch Day',
   '$6,500 per school. Everything in Program Only plus a live schoolwide launch led by Mark Papadas. Travel outside Central Florida billed separately.',
   'iam4kids.com/schools (captured 18 November 2026).', 'iam4kids.com/schools', 60)
) as d(kind, title, body, evidence, source, sort)
where not exists (select 1 from public.atlas_entry where status = 'draft');


-- ---------- Decisions ----------
-- Answered in his feedback form on 15 October. Recorded in his words.
insert into public.decision_request (question, context, status, answer, answered_by, answered_at, sort)
select q.question, q.context, 'answered', q.answer,
       (select id from public.person where email = 'mark@iam4kids.com'),
       timestamptz '2026-10-15 12:29:13+00', q.sort
from (values
  ('What comes first: events or content?', null,
   'Events. "Our weekly Be Great! Family Reset is a great place to start." The content system is "a very close second."', 100),
  ('Who approves content when you are unavailable?', null,
   '"For now, that''s me. If I''m unavailable, I''d rather have something wait than go out without approval." Confirmations and reminders do not need approval every time once the process and messaging are approved.', 110),
  ('Which brand and voice rules must AI never break?', 'Recorded as guardrails in Atlas.',
   'No invented accomplishments, statistics, testimonials or stories. No words put in your mouth. Respect your language and standards. Nothing published without approval. No promises on your behalf. Never contact children outside an approved experience. Never compromise the mission.', 120),
  ('Which two channels first?', null, 'Facebook and LinkedIn.', 130),
  ('Do children stay without their own accounts in Phase 1?',
   'You asked that this not block safe, parent-supervised experiences later. It does not: that is a later decision, made once the consent design exists.',
   '"I understand the thinking behind not giving children their own accounts. That makes sense as a starting point."', 140)
) as q(question, context, answer, sort)
where not exists (select 1 from public.decision_request);

-- Still open.
insert into public.decision_request (question, context, status, needed_by, sort)
select o.question, o.context, 'open', o.needed_by::date, o.sort
from (values
  ('What should a principal be able to do here after your 10 December Masterclass?',
   'Today the Schools page asks for a conversation, using the same fields as your form on iam4kids.com. If you also want them to register for something or download material, say which, and it gets built.',
   '2026-11-25', 10),
  ('Is the Be Great! Family Reset weekly, or every other Sunday?',
   'Your feedback says weekly. iam4kids.com says every other Sunday. Once you decide, set the next date in Events and registration opens on its own.',
   '2026-11-25', 20),
  ('Confirm your published reach: 6,000+ students across 37 schools.',
   'It is on iam4kids.com/schools. It sits in Atlas as a draft so the content system cannot use it until you approve it. If you have the records behind it, add them as evidence.',
   '2026-12-01', 30),
  ('Which I AM 4 Kids email address owns every account?',
   'Domain, hosting, database, email sender, payments, social accounts. One company address. Not a personal address, and not ours.',
   '2026-12-01', 40),
  ('How long do we keep registration and attendance records?',
   'Needed before families register in volume. Your attorney should confirm the number.',
   null, 50),
  ('Can school data ever leave the platform, and to whom?',
   'For example, sharing participation figures with a district. Default today is no.',
   null, 60)
) as o(question, context, needed_by, sort)
where not exists (select 1 from public.decision_request where status = 'open');


-- ---------- The notification that should have existed on 15 October ----------
insert into public.staff_notification (kind, title, body, link, subject_table, subject_id, created_at)
select 'feedback', 'New feedback from ' || f.author_name,
       left(coalesce(f.anything_else, f.hopes, ''), 280), '/admin/feedback', 'client_feedback', f.id, f.created_at
from public.client_feedback f
where not exists (
  select 1 from public.staff_notification n where n.subject_table = 'client_feedback' and n.subject_id = f.id
);
