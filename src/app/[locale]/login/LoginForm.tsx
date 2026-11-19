"use client";

import { useActionState } from "react";
import { signIn, type SignInState } from "./actions";

export function LoginForm({ locale }: { locale: string }) {
  const [state, action, pending] = useActionState<SignInState, FormData>(signIn, { error: null });

  return (
    <form action={action} className="mt-8 space-y-5">
      <input type="hidden" name="locale" value={locale} />
      <label className="block">
        <span className="text-sm font-semibold text-[#0b1b3a]">Email</span>
        <input
          name="email"
          type="email"
          defaultValue={state.email ?? ""}
          autoComplete="username"
          required
          className="mt-1.5 w-full rounded-lg border border-[#0b1b3a]/20 bg-white px-3.5 py-2.5 text-[#0b1b3a] outline-none focus:border-[#2563eb] focus:ring-2 focus:ring-[#2563eb]/20"
        />
      </label>
      <label className="block">
        <span className="text-sm font-semibold text-[#0b1b3a]">Password</span>
        <input
          name="password"
          type="password"
          autoComplete="current-password"
          required
          className="mt-1.5 w-full rounded-lg border border-[#0b1b3a]/20 bg-white px-3.5 py-2.5 text-[#0b1b3a] outline-none focus:border-[#2563eb] focus:ring-2 focus:ring-[#2563eb]/20"
        />
      </label>

      {state.error && (
        <p role="alert" className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          {state.error}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-lg bg-[#0b1b3a] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#12224a] disabled:cursor-wait disabled:opacity-60"
      >
        {pending ? "Signing in…" : "Sign in"}
      </button>
    </form>
  );
}
