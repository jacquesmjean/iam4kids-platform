-- =====================================================================
-- 0009 — client_feedback, opened out into sections
--
-- One "what do you think" box gets one paragraph back. Asking separately
-- about the vision, the public site, and the platform gets three, because
-- each question reminds the person of something the previous one did not.
--
-- Two of the columns below are decisions the project is formally waiting
-- on (who approves content, and the brand rules the AI must never break).
-- Asking for them inside a feedback form is how they get answered without
-- another meeting.
-- =====================================================================

alter table client_feedback
  add column vision_serves    text,
  add column vision_missing   text,
  add column website_likes    text,
  add column website_changes  text,
  add column platform_likes   text,
  add column platform_changes text,
  add column approver         text,
  add column channels         text,
  add column anything_else    text;

comment on column client_feedback.vision_serves is
  'Does what has been built serve the vision as he described it. His words, not ours.';
comment on column client_feedback.approver is
  'Blueprint decision: who approves content when Mark is unavailable.';
comment on column client_feedback.guardrails is
  'Blueprint decision: brand and voice rules the AI must never break.';
comment on column client_feedback.channels is
  'Blueprint decision: the first two channels the content slice targets.';
