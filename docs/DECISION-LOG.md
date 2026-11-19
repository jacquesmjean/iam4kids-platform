# Decision log

Every consequential architectural decision, its alternative, and what would make us revisit it.
Blueprint v0.1 §8 asks for this. It is kept current, not written once.

| # | Decision | Alternative considered | Rationale | Review trigger |
|---|---|---|---|---|
| 1 | Children are records, not users | Child accounts with a parental consent flow | COPPA attaches the moment a child can authenticate or be contacted. `child_profile` has no email, no auth link, no phone. Every experience in the blueprint still works. | Before any child-facing interactive feature |
| 2 | PostgreSQL is the system of record | HubSpot / Salesforce as CRM of record | Households, school rosters and one-person-many-roles do not fit a stock CRM. Blueprint §7 requires owned, portable data. | If staff process outgrows a built admin |
| 3 | Event OS built, not bought | Eventbrite / Zoom Events | Events must be reusable objects feeding one contact record and impact reporting. | If event volume exceeds internal capacity |
| 4 | RLS in the database, not the API | Authorisation in application code only | An API bug must not be able to leak a child record. Policy sits below the app. | Any change to the role model |
| 5 | Publish by API where reliable, queue elsewhere | One third-party scheduler for all channels | TikTok, X and YouTube restrict automated publishing. An honest handoff beats a silent failure. | Each platform API change |
| 6 | Consent is append-only | Boolean flag on the person record | You must be able to prove what someone agreed to, in what wording, and when. | Any privacy or regulatory review |
| 7 | en + es from the first commit | English now, translate later | Retro-fitting locale routing is a rebuild. Blueprint §7 requires multilingual by default. | Adding a third language |
| 8 | The staff console signs people in and uses their own token; the app never holds the service role key | Service role key on the server, authorisation in route code | A bug in the app can then do no more than the signed-in person could. It also means the console works on a deployment that has only the publishable key, which is what this one has. | Any feature that genuinely needs to bypass RLS |
| 9 | `is_staff()` is SECURITY DEFINER | SECURITY INVOKER with policies on role_assignment | As invoker it read role_assignment through RLS that denies everyone, so it was false for every user and Mark's feedback of 15 Oct sat unreadable for 34 days. As definer it takes no argument and only answers about the caller. | Any change to the role model |
| 10 | Page wording lives in `site_block`; staff change values only, every change is kept | A headless CMS | Mark asked to make changes without asking anyone. Keys are defined in code so an edit cannot break a page; revisions make every change reversible and attributable. | More than a handful of pages, or rich media |
| 11 | Atlas: only approved entries are used; claims and history need evidence; editing an approved claim returns it to draft | Free-text brand doc | Mark's first guardrail is "no invented accomplishments or statistics", and he asked that real history not be lost. One constraint serves both. | When the drafting model is connected |
| 12 | Content drafts only for Facebook and LinkedIn | All ten channel formats | Mark's answer on 15 Oct: "Facebook and LinkedIn." The other formats remain in code, off. | Mark adds a channel |
| 13 | Staff console in English; public pages in English and Spanish | Bilingual console | The staff using it today read English. Public pages, including the Schools page, stay bilingual and the Spanish wording is editable. | A Spanish-speaking staff member joins |
