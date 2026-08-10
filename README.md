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
src/app/      Routes. [locale] for en/es; api/v1 for the platform API
src/lib/      Domain logic. Business rules live here, not in routes
src/i18n/     Translations. en + es from the first commit
```

## Build order

| Phase | What | Status |
|---|---|---|
| 0  | Foundation — identity, contacts, consent, roles, RLS | Schema landed |
| 1B | Event OS — the Be Great! Family Reset, end to end | Registration slice landed |
| 1A | Content OS — source asset to approved multi-channel | Schema landed |
| 1C | Public presence — audience pathways | Next |
| 2  | Relationship & personalisation | Later |

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
