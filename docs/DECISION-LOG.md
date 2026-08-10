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
