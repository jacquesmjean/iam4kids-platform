import Link from "next/link";

export function generateStaticParams() {
  return [{ locale: "en" }, { locale: "es" }];
}

const LAYERS = [
  {
    tag: "Experience",
    items: ["Families", "Schools", "Events", "Speaker & Media", "Apparel", "Partners"],
  },
  {
    tag: "Modules",
    items: ["Event OS", "Content OS", "Public Presence", "Relationship", "Commerce", "Impact"],
  },
  {
    tag: "Foundation",
    items: [
      "Identity & Access",
      "Contact & Relationship",
      "Consent & Child Safety",
      "Content & Assets",
      "Events & Participation",
      "Automation",
      "Analytics & Impact",
      "Audit",
    ],
  },
  {
    tag: "Platform",
    items: ["Next.js on Vercel", "PostgreSQL (Supabase)", "Zoom", "Stripe", "Resend"],
  },
];

const TABLES = [
  { group: "Identity & relationships", names: ["person", "organization", "household", "child_profile", "role_assignment", "consent", "interaction"] },
  { group: "Events & participation", names: ["event", "event_session", "registration", "attendance", "event_message", "exception_item"] },
  { group: "Content & publishing", names: ["content_asset", "content_derivative", "approval", "publication", "publication_metric"] },
];

const WEEKS = [
  {
    week: "Week 1",
    title: "The spine goes in",
    done: [
      "Repository, Vercel project and Supabase project — all created in I AM 4 Kids' name",
      "Eighteen tables migrated: identity, consent, events, content",
      "Row-level security live, so a child record cannot leak through an API bug",
      "One public registration form writing real records",
    ],
  },
  {
    week: "Week 2",
    title: "Events run themselves",
    done: [
      "Zoom link generated on registration, not by hand",
      "Confirmation, 24-hour and 1-hour reminders in the family's own time zone",
      "Attendance written back from Zoom after every session",
      "Failed sends surface as exceptions in seconds, not on the night",
    ],
  },
  {
    week: "Week 3",
    title: "One recording becomes ten pieces",
    done: [
      "Upload a session recording; derivatives are drafted from it",
      "Nothing publishes without a named human approval",
      "API publishing where it is reliable, an honest queue where it is not",
      "Brand and voice rules enforced on every draft",
    ],
  },
  {
    week: "Week 4",
    title: "You can see it, and you own it",
    done: [
      "Impact dashboard: families reached, sessions held, attendance, schools served",
      "Admin console for staff — no engineer needed to run an event",
      "Access handover: every credential in I AM 4 Kids' name, TechFides removable",
      "Decision log current, architecture documented in the repository",
    ],
  },
];

const DECISIONS = [
  { n: 1, d: "Children are records, not users", why: "COPPA attaches the moment a child can log in or be contacted. So they can do neither." },
  { n: 2, d: "PostgreSQL is the system of record", why: "Households, school rosters and one-person-many-roles do not fit a stock CRM." },
  { n: 3, d: "Event OS built, not bought", why: "Events must feed one contact record and one impact report. Eventbrite cannot." },
  { n: 4, d: "Security lives in the database", why: "An application bug must not be able to expose a child record." },
  { n: 5, d: "Publish by API where reliable, queue elsewhere", why: "An honest handoff beats a silent failure on TikTok or YouTube." },
  { n: 6, d: "Consent is append-only", why: "You must be able to prove what someone agreed to, in what wording, and when." },
  { n: 7, d: "English and Spanish from the first commit", why: "Retro-fitting language routing is a rebuild, not a setting." },
];

export default async function FoundationConsole({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  return (
    <main className="mx-auto max-w-5xl px-6 py-16 md:py-24">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#f5a524]">
        I AM 4 Kids · Platform Foundation
      </p>
      <h1 className="mt-4 text-4xl font-bold leading-tight text-[#0b1b3a] md:text-5xl">
        One foundation. Every experience in the vision sits on top of it.
      </h1>
      <p className="mt-6 max-w-3xl text-lg leading-relaxed text-[#12224a]/80">
        The blueprint describes a kids&rsquo; empowerment universe: a show, characters, toys,
        games, books, apparel. Those are six products. They are also six chances to build six
        disconnected databases. This is the thing that stops that happening — one record for
        every family, one place events and content are managed from, and a child who is counted
        and celebrated but never contacted.
      </p>

      <div className="mt-10 flex flex-wrap gap-3">
        <Link
          href={`/${locale}/register`}
          className="rounded-lg bg-[#2563eb] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#1d4ed8]"
        >
          See a family register &rarr;
        </Link>
        <a
          href="https://iam4kids-os.vercel.app/en/vision"
          className="rounded-lg border border-[#0b1b3a]/15 px-5 py-3 text-sm font-semibold text-[#0b1b3a] transition hover:border-[#0b1b3a]/40"
        >
          The vision this serves
        </a>
      </div>

      {/* The one decision */}
      <section className="mt-20 rounded-2xl bg-[#0b1b3a] p-8 text-white md:p-10">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#f5a524]">
          The decision everything else depends on
        </p>
        <h2 className="mt-4 text-2xl font-bold md:text-3xl">
          A child is a record, not a user.
        </h2>
        <p className="mt-4 max-w-2xl leading-relaxed text-white/75">
          COPPA attaches the moment a child can log in or be reached directly. Rather than build
          a consent apparatus around child accounts, we removed the trigger. A child profile has
          no email address, no login, no phone number. There is no column to put one in. Every
          experience in the blueprint still works — the parent is the one we talk to.
        </p>
        <pre className="mt-6 overflow-x-auto rounded-lg bg-black/30 p-5 text-xs leading-relaxed text-[#c7d7ff]">
{`create table child_profile (
  id              uuid primary key default gen_random_uuid(),
  household_id    uuid references household(id) on delete cascade,
  organization_id uuid references organization(id) on delete set null,
  first_name      text not null,
  age_band        int  check (age_band between 4 and 18),
  created_at      timestamptz not null default now()
);
-- No email. No auth_user_id. No phone.
-- A child is counted and celebrated, never contacted.`}
        </pre>
        <p className="mt-5 text-sm text-white/60">
          Enforced by the schema, not by a rule someone has to remember.
        </p>
      </section>

      {/* Stack */}
      <section className="mt-20">
        <h2 className="text-2xl font-bold text-[#0b1b3a]">How it stacks</h2>
        <p className="mt-3 max-w-2xl text-[#12224a]/70">
          Modules never read each other&rsquo;s tables. They share the foundation. That is the
          difference between a platform and a folder of tools.
        </p>
        <div className="mt-8 space-y-3">
          {LAYERS.map((layer) => (
            <div
              key={layer.tag}
              className="rounded-xl border border-[#0b1b3a]/10 bg-white p-5 shadow-sm"
            >
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#2563eb]">
                {layer.tag}
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                {layer.items.map((item) => (
                  <span
                    key={item}
                    className="rounded-md bg-[#f4f6fb] px-3 py-1.5 text-sm text-[#12224a]"
                  >
                    {item}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Tables */}
      <section className="mt-20">
        <h2 className="text-2xl font-bold text-[#0b1b3a]">What is already built</h2>
        <p className="mt-3 max-w-2xl text-[#12224a]/70">
          Eighteen tables across four migrations, with row-level security on the child records.
          This is committed code, not a diagram.
        </p>
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {TABLES.map((t) => (
            <div key={t.group} className="rounded-xl border border-[#0b1b3a]/10 bg-white p-5">
              <p className="text-sm font-semibold text-[#0b1b3a]">{t.group}</p>
              <ul className="mt-3 space-y-1.5">
                {t.names.map((n) => (
                  <li key={n} className="font-mono text-xs text-[#12224a]/70">
                    {n}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* 30 days */}
      <section className="mt-20">
        <h2 className="text-2xl font-bold text-[#0b1b3a]">The first thirty days</h2>
        <p className="mt-3 max-w-2xl text-[#12224a]/70">
          Each week ends with something you can use, not something you can read about.
        </p>
        <div className="mt-8 space-y-4">
          {WEEKS.map((w, i) => (
            <div
              key={w.week}
              className="rounded-xl border border-[#0b1b3a]/10 bg-white p-6 shadow-sm"
            >
              <div className="flex flex-wrap items-baseline gap-3">
                <span className="rounded-md bg-[#0b1b3a] px-2.5 py-1 text-xs font-semibold text-white">
                  {w.week}
                </span>
                <h3 className="text-lg font-semibold text-[#0b1b3a]">{w.title}</h3>
                {i === 0 && (
                  <span className="rounded-full bg-[#f5a524]/15 px-2.5 py-1 text-xs font-semibold text-[#8a5a00]">
                    in progress
                  </span>
                )}
              </div>
              <ul className="mt-4 space-y-2">
                {w.done.map((d) => (
                  <li key={d} className="flex gap-3 text-sm leading-relaxed text-[#12224a]/80">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[#2563eb]" />
                    {d}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* Decisions */}
      <section className="mt-20">
        <h2 className="text-2xl font-bold text-[#0b1b3a]">Decisions on the record</h2>
        <p className="mt-3 max-w-2xl text-[#12224a]/70">
          Blueprint §8 asks for a decision log. Here it is, and it stays current. Each one names
          what we chose, and what would make us revisit it.
        </p>
        <div className="mt-8 divide-y divide-[#0b1b3a]/10 rounded-xl border border-[#0b1b3a]/10 bg-white">
          {DECISIONS.map((d) => (
            <div key={d.n} className="flex gap-4 p-5">
              <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#f4f6fb] text-xs font-semibold text-[#2563eb]">
                {d.n}
              </span>
              <div>
                <p className="font-semibold text-[#0b1b3a]">{d.d}</p>
                <p className="mt-1 text-sm leading-relaxed text-[#12224a]/70">{d.why}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Ownership */}
      <section className="mt-20 rounded-2xl border-2 border-[#f5a524]/40 bg-[#fffaf0] p-8 md:p-10">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#8a5a00]">
          Ownership
        </p>
        <h2 className="mt-4 text-2xl font-bold text-[#0b1b3a]">
          Every account is created in I AM 4 Kids&rsquo; name.
        </h2>
        <p className="mt-4 max-w-2xl leading-relaxed text-[#12224a]/80">
          The repository, the hosting, the database, the email sender, the social accounts —
          all owned by I AM 4 Kids, with TechFides added as an administrator who can be removed
          on a Tuesday afternoon without anything breaking. Never the reverse. That is a
          condition of the work, not a favour.
        </p>
      </section>

      <footer className="mt-20 border-t border-[#0b1b3a]/10 pt-8 text-sm text-[#12224a]/50">
        Built by TechFides for I AM 4 Kids. Foundation commit — architecture, schema and access
        model. Not a public site.
      </footer>
    </main>
  );
}
