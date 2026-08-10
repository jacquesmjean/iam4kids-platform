# Architecture

## One spine, many experiences

```
EXPERIENCE   Families · Schools · Events · Speaker/Media · Apparel · Partners
                                  |
MODULES      Event OS · Content OS · Public Presence
             (later: Relationship & Personalisation · Commerce · Impact · Concierge)
                                  |
FOUNDATION   Identity & Access · Contact & Relationship Model · Consent & Child Safety
             Content & Asset Model · Event & Participation Model
             Automation & Integration · Analytics & Impact · Administration & Audit
                                  |
PLATFORM     Next.js on Vercel · PostgreSQL (Supabase) · Zoom · Stripe · Resend
```

Modules never talk to each other's tables. They share the foundation. That is
what stops the Event OS and the Content OS becoming two isolated tools.

## System of record

PostgreSQL. People, relationships, consent, events and content live here and
nowhere else. Zoom, Stripe and Resend are edges — each replaceable behind one
integration boundary, because none of them owns the truth.

## Identity: who someone IS vs what they are DOING

`person` is the human. `role_assignment` is the doing — person × context × role.
One person can be a guardian at home, an educator at a school and a speaker
contact, at the same time, without becoming four disconnected rows. This is the
answer to Blueprint §8's question about multi-role people.

## Child and school data

- `child_profile` — no email, no auth, no phone. Attached to a household or a
  school roster, never standing alone.
- RLS restricts child records to the guardian of that household, or staff.
  There is no other path to a child record.
- School data is partitioned by organisation and never mixed into marketing
  segments.

## Consent

Append-only. Withdrawal is a `revoked_at` stamp, never a delete. `evidence`
records the wording version shown at the time — you must be able to prove what
someone agreed to, not merely that they did.

## Failure handling

Every integration failure becomes an `exception_item` with a severity and a
subject. A bounced confirmation is a family who will not turn up and will never
say why. It surfaces in seconds, tied to the registration, rather than being
discovered on the night.

## Publishing

`publication.mode` is `api` where a platform publishes reliably (LinkedIn,
Facebook, Instagram) and `handoff` where it does not (TikTok, X, YouTube). An
honest queue beats a promise that breaks quietly.
