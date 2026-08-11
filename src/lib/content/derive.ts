/**
 * Turn one piece of source material into per-channel drafts.
 *
 * This is deliberately rule-based. It exists to demonstrate the shape of the
 * Content OS and, more importantly, the approval gate that sits after it —
 * not to pass itself off as the drafting model. The language model plugs into
 * exactly this interface in Week 3: same input, same ten outputs, same gate.
 * Swapping the engine must not move the gate.
 */

export type Channel =
  | "linkedin"
  | "facebook"
  | "instagram"
  | "x"
  | "tiktok"
  | "youtube"
  | "email"
  | "substack";

export type Mode = "api" | "handoff";

export interface Draft {
  id: string;
  channel: Channel;
  label: string;
  mode: Mode;
  body: string;
  limit?: number;
}

/** Platforms that permit reliable automated publishing. The rest are honest queues. */
export const MODE: Record<Channel, Mode> = {
  linkedin: "api",
  facebook: "api",
  instagram: "api",
  email: "api",
  substack: "api",
  x: "handoff",
  tiktok: "handoff",
  youtube: "handoff",
};

function sentences(text: string): string[] {
  return text
    .replace(/\s+/g, " ")
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 2);
}

function clamp(s: string, max: number): string {
  if (s.length <= max) return s;
  const cut = s.slice(0, max - 1);
  const lastStop = Math.max(cut.lastIndexOf(". "), cut.lastIndexOf("! "), cut.lastIndexOf("? "));
  if (lastStop > max * 0.5) return cut.slice(0, lastStop + 1);
  return cut.slice(0, cut.lastIndexOf(" ")) + "…";
}

/** The most quotable line: short enough to land, long enough to mean something. */
function hook(ss: string[]): string {
  const scored = ss
    .map((s) => ({ s, score: s.length >= 40 && s.length <= 120 ? 2 : s.length < 40 ? 1 : 0 }))
    .sort((a, b) => b.score - a.score);
  return (scored[0]?.s ?? ss[0] ?? "").trim();
}

/** The lines carrying the substance, in original order. */
function meat(ss: string[], n: number): string[] {
  return [...ss]
    .map((s, i) => ({ s, i, len: s.length }))
    .sort((a, b) => b.len - a.len)
    .slice(0, n)
    .sort((a, b) => a.i - b.i)
    .map((x) => x.s);
}

export function derive(source: string): Draft[] {
  const ss = sentences(source);
  if (ss.length === 0) return [];

  const h = hook(ss);
  const body3 = meat(ss, 3);
  const body5 = meat(ss, 5);
  const rest = ss.filter((s) => s !== h);

  const drafts: Draft[] = [
    {
      id: "linkedin-long",
      channel: "linkedin",
      label: "LinkedIn — full post",
      mode: MODE.linkedin,
      limit: 1300,
      body: clamp(
        `${h}\n\n${body5.filter((s) => s !== h).join("\n\n")}\n\nBe Great!`,
        1300
      ),
    },
    {
      id: "linkedin-short",
      channel: "linkedin",
      label: "LinkedIn — short form",
      mode: MODE.linkedin,
      limit: 400,
      body: clamp(`${h}\n\n${rest[0] ?? ""}\n\nBe Great!`, 400),
    },
    {
      id: "facebook",
      channel: "facebook",
      label: "Facebook — community post",
      mode: MODE.facebook,
      limit: 600,
      body: clamp(`${h}\n\n${body3.filter((s) => s !== h).join(" ")}`, 600),
    },
    {
      id: "instagram",
      channel: "instagram",
      label: "Instagram — caption",
      mode: MODE.instagram,
      limit: 2200,
      body: clamp(
        `${h}\n\n${body3.filter((s) => s !== h).join("\n\n")}\n\n#IAM4Kids #BeGreat #KidsEmpowerment #ParentingWin #ConfidenceKids`,
        2200
      ),
    },
    {
      id: "instagram-carousel",
      channel: "instagram",
      label: "Instagram — carousel slides",
      mode: MODE.instagram,
      body: body5
        .slice(0, 5)
        .map((s, i) => `Slide ${i + 1}\n${clamp(s, 140)}`)
        .join("\n\n"),
    },
    {
      id: "x-thread",
      channel: "x",
      label: "X — thread",
      mode: MODE.x,
      limit: 280,
      body: [h, ...rest.slice(0, 4)]
        .map((s, i, arr) => `${i + 1}/${arr.length}  ${clamp(s, 270)}`)
        .join("\n\n"),
    },
    {
      id: "tiktok",
      channel: "tiktok",
      label: "TikTok — 30-second script",
      mode: MODE.tiktok,
      body: [
        `HOOK (0–3s)\n${clamp(h, 120)}`,
        `BEAT 1 (3–12s)\n${clamp(rest[0] ?? "", 160)}`,
        `BEAT 2 (12–22s)\n${clamp(rest[1] ?? "", 160)}`,
        `CLOSE (22–30s)\nBe Great! Link in bio to join the next Family Reset.`,
      ].join("\n\n"),
    },
    {
      id: "youtube",
      channel: "youtube",
      label: "YouTube — title & description",
      mode: MODE.youtube,
      body: [
        `TITLE\n${clamp(h, 95)}`,
        `DESCRIPTION\n${clamp(body3.join(" "), 700)}`,
        `CHAPTERS\n0:00 Opening\n0:45 ${clamp(rest[0] ?? "The idea", 50)}\n3:10 ${clamp(rest[1] ?? "What it means at home", 50)}\n7:00 Be Great!`,
      ].join("\n\n"),
    },
    {
      id: "email",
      channel: "email",
      label: "Email — subject & body",
      mode: MODE.email,
      body: [
        `SUBJECT\n${clamp(h, 70)}`,
        `PREVIEW\n${clamp(rest[0] ?? "", 100)}`,
        `BODY\n${body5.join("\n\n")}\n\nBe Great!\nMark`,
      ].join("\n\n"),
    },
    {
      id: "substack",
      channel: "substack",
      label: "Newsletter — opening",
      mode: MODE.substack,
      body: `${h}\n\n${body5.filter((s) => s !== h).join("\n\n")}`,
    },
  ];

  return drafts;
}

export const SAMPLE = `A mother told me last week that her nine-year-old had stopped raising her hand in class. Not because she did not know the answer. Because she had decided, somewhere between second grade and fourth, that being wrong in front of people was the worst thing that could happen to her.

That is not a confidence problem. That is a story problem. Somewhere along the way she picked up a story about who she is, and now she is living inside it.

Here is what we have learned running these sessions. You cannot argue a child out of a story. You can only give them a bigger one. When a kid hears an adult say out loud, in front of the whole room, that being wrong is how the answer gets found, something moves. Not always that day. But it moves.

This is why we do the Family Reset with the parent in the room. The child needs to hear it. The parent needs to hear the child hear it. And then, on a Tuesday night three weeks later, when the homework goes badly, the parent has something to say that is not just calm down.

Every kid carries something they have not been told about yet. Our whole job is to say it out loud, early enough to matter.`;
