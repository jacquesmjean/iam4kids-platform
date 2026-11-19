"use client";

import { useFormStatus } from "react-dom";

/** A submit button that says it is working, so nobody clicks Save three times. */
export function SubmitButton({
  children,
  pending: pendingLabel = "Saving…",
  className = "",
  variant = "primary",
  name,
  value,
}: {
  children: React.ReactNode;
  pending?: string;
  className?: string;
  variant?: "primary" | "secondary" | "quiet" | "danger";
  name?: string;
  value?: string;
}) {
  const { pending } = useFormStatus();
  const styles = {
    primary: "bg-[#0b1b3a] text-white hover:bg-[#12224a]",
    secondary: "border border-[#0b1b3a]/20 bg-white text-[#0b1b3a] hover:border-[#0b1b3a]/50",
    quiet: "text-[#2563eb] hover:underline",
    danger: "border border-red-200 bg-white text-red-700 hover:border-red-400",
  }[variant];
  return (
    <button
      type="submit"
      name={name}
      value={value}
      disabled={pending}
      className={`rounded-lg px-4 py-2 text-sm font-semibold transition disabled:cursor-wait disabled:opacity-60 ${styles} ${className}`}
    >
      {pending ? pendingLabel : children}
    </button>
  );
}
