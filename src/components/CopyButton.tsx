"use client";

import { useState } from "react";

/** Copies approved text so it can be pasted straight into Facebook or LinkedIn. */
export function CopyButton({ text, label = "Copy text" }: { text: string; label?: string }) {
  const [done, setDone] = useState(false);
  return (
    <button
      type="button"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(text);
          setDone(true);
          setTimeout(() => setDone(false), 2500);
        } catch {
          setDone(false);
        }
      }}
      className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-700"
    >
      {done ? "Copied" : label}
    </button>
  );
}
