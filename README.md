# I AM 4 Kids — Platform

The digital foundation for I AM 4 Kids. Built in response to the
**Digital Architecture Blueprint v0.1**.

> We are not commissioning a website. We are establishing the digital
> infrastructure of a worldwide identity-development platform.

## The one decision to understand before reading any code

**Children are records, not users.**

`child_profile` has no email, no auth link and no contact route. COPPA
obligations attach when a child can authenticate or be contacted — neither is
possible here. Every experience in the blueprint still works: Family Reset,
school programs, Family Pack cohorts, impact reporting, apparel. Child logins
become a deliberate later decision, taken once the consent machinery exists.

This is enforced by the schema, not by convention. See
`supabase/migrations/0001_foundation.sql`.

## Structure

```
docs/         Architecture, decision log, access checklist
supabase/     Migrations — the foundation, Event OS, Content OS, RLS
src/app/      Routes. [locale]/(site) is the public website, [locale]/admin the
              staff console, api/v1 the platform API (inquiry, concierge, ...)
src/site/     The public site: shell (header, footer, chat), page bodies in
              src/site/pages/<page>.<en|es>.tsx, the chat script, form
src/lib/      Domain logic. Business rules live here, not in routes
src/i18n/     Translations. en + es from the first commit
```

## One app, one backend

The public website (Home, Families, Schools, Movement, Vision, Founder, Get
Started, Terms, Privacy, Impact, Register) and the staff console are the same
Next.js app on the same Supabase project. Every form and every chat lands in
the console:

| Visitor does | Lands in | Console screen |
|---|---|---|
| Get Started form, parent / agency / other | `inquiry` via `submit_inquiry()` | Inquiries → Families & partners |
| Get Started form, school | `school_inquiry` via `submit_inquiry()` | Inquiries → Schools |
| Schools page form (`?from=masterclass` tracked) | `school_inquiry` | Inquiries → Schools |
| Website chat | `concierge_message` via `log_concierge()` | Inquiries → Website chats |
| Family Reset registration | `registration` via `register_for_event()` | Overview |

The Schools page wording comes from `site_block`, edited in Page editor.

## Build order

| Phase | What | Status |
|---|---|---|
| 0  | Foundation — identity, contacts, consent, roles, RLS | Schema landed |
| 1B | Event OS — the Be Great! Family Reset, end to end | Registration slice landed |
| 1A | Content OS — source asset to approved multi-channel | Schema landed |
| 1C | Public presence — audience pathways | Schools page live, editable |
| 1D | Staff console — sign-in, feedback, page editor, events, Atlas, decisions | Landed |
| 2  | Relationship & personalisation | Later |

## The staff console

`/en/admin`. Staff sign in with Supabase Auth; every query runs as that
person, so row-level security decides what they can see and change. The
console never uses the service role key. Screens:

- **Overview**: notifications (every feedback, school inquiry and answered decision), next session, latest registrations, failures.
- **Feedback**: every client review, word for word, with read state. Immutable.
- **School inquiries**: the Schools page form, with status and a team note.
- **Page editor**: page wording in English and Spanish, with history and restore.
- **Events**: create events, add dates in Eastern/Central/Mountain/Pacific, seats, Zoom link, status.
- **Atlas**: guardrails, claims, history, programs, messages, voice, terms, characters. Only approved entries are used.
- **Decisions**: what the team needs from Mark, answered in place.

Adding a staff member: create their Supabase Auth user, then a `person` row
linked by `auth_user_id` and a `role_assignment` with role `staff`. Set
`must_change_password: true` in their user metadata to force a new password
at first sign-in.

## Running locally

```bash
cp .env.example .env.local     # fill in — never commit real values
npm install
npx supabase db push           # apply migrations
npm run dev
```

## Principles this codebase is held to

- **Kids first, always.** No engagement or growth objective outranks child safety.
- **Owned, portable, interoperable.** PostgreSQL is the system of record. Every
  purchased tool is an edge that can be replaced without a migration project.
- **Observable and recoverable.** Failures land in `exception_item` and are visible
  without a user reporting them.
- **Build once, configure many.** A new event, cohort, school or language is a row,
  not a rebuild.
- **Secure and auditable.** Row-level security sits below the application, so an API
  bug cannot leak a child record.

Ownership: every account is in I AM 4 Kids' name, with TechFides as an
administrator that can be removed. See `docs/ACCESS-CHECKLIST.md`.
