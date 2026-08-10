import { db } from "@/lib/db";

export interface RegistrationInput {
  sessionId: string;
  guardianName: string;
  guardianEmail: string;
  childFirstName: string;
  childAge: number;
  language: "en" | "es";
  guardianConsent: boolean;
  source?: string;
  campaign?: string;
}

export interface RegistrationResult {
  registrationId: string;
  personId: string;
  householdId: string;
  childProfileId: string;
}

/**
 * Register a family for an event session.
 *
 * Six records, one submission — and deliberately no child account:
 *   person -> household -> role_assignment(guardian) -> child_profile
 *   -> consent -> registration
 *
 * The child gets a profile with no email, no auth link and no contact route.
 * That is the decision that keeps COPPA off the critical path (docs/DECISION-LOG.md #1),
 * and it is enforced by the schema rather than by convention.
 *
 * Idempotent on (session_id, person_id): a double submit updates rather than
 * duplicating, because a parent tapping twice on a phone is normal behaviour.
 */
export async function registerFamily(input: RegistrationInput): Promise<RegistrationResult> {
  if (!input.guardianConsent) {
    throw new Error("Guardian consent is required before any record is written.");
  }

  // 1. Person — matched on email (citext, so case never creates a duplicate).
  const { data: person, error: pErr } = await db
    .from("person")
    .upsert(
      {
        full_name: input.guardianName,
        email: input.guardianEmail,
        preferred_language: input.language,
      },
      { onConflict: "email" }
    )
    .select("id")
    .single();
  if (pErr) throw pErr;

  // 2. Household — one per guardian for now; siblings attach to the same one.
  const { data: household, error: hErr } = await db
    .from("household")
    .upsert({ primary_person_id: person.id }, { onConflict: "primary_person_id" })
    .select("id")
    .single();
  if (hErr) throw hErr;

  // 3. The guardian role, in the context of that household.
  await db.from("role_assignment").upsert(
    { person_id: person.id, role: "guardian", household_id: household.id },
    { onConflict: "person_id,role,household_id,organization_id" }
  );

  // 4. The child. Note what is absent: no email, no phone, no auth_user_id.
  const { data: child, error: cErr } = await db
    .from("child_profile")
    .insert({
      household_id: household.id,
      first_name: input.childFirstName,
      age_band: input.childAge,
    })
    .select("id")
    .single();
  if (cErr) throw cErr;

  // 5. Consent — append-only. We record the wording version, not just a boolean.
  await db.from("consent").insert({
    person_id: person.id,
    scope: "guardian_consent + event_comms",
    method: "checkbox_v1",
    evidence: { form_version: "reset-v1", child_profile_id: child.id },
  });

  // 6. The registration itself.
  const { data: reg, error: rErr } = await db
    .from("registration")
    .upsert(
      {
        session_id: input.sessionId,
        person_id: person.id,
        household_id: household.id,
        child_profile_id: child.id,
        source: input.source ?? "direct",
        campaign: input.campaign,
        status: "confirmed",
      },
      { onConflict: "session_id,person_id" }
    )
    .select("id")
    .single();
  if (rErr) throw rErr;

  // Queue the journey. Nothing is sent inline — a slow mail provider must
  // never make a parent wait on a submit button.
  await db.from("event_message").insert([
    { registration_id: reg.id, kind: "confirmation", scheduled_for: new Date().toISOString() },
    { registration_id: reg.id, kind: "reminder_24h" },
    { registration_id: reg.id, kind: "reminder_1h" },
  ]);

  await db.from("interaction").insert({
    person_id: person.id,
    kind: "registered",
    subject: input.sessionId,
    metadata: { source: input.source, campaign: input.campaign },
  });

  return {
    registrationId: reg.id,
    personId: person.id,
    householdId: household.id,
    childProfileId: child.id,
  };
}
