"use client";

import { useActionState } from "react";
import { signIn, type SignInState } from "./actions";

export function LoginForm({ locale }: { locale: string }) {
  const [state, action, pending] = useActionState<SignInState, FormData>(signIn, { error: null });

  return (
    <form action={action} className="mt-8 space-y-5">
      <input type="hidden" name="locale" value={locale} />
      <label className="block">
        <span className="text-sm font-semibold text-ink">Email</span>
        <input
          name="email"
          type="email"
          defaultValue={state.email ?? ""}
          autoComplete="username"
          required
          className="mt-1.5 w-full rounded-lg border border-brand-deep/20 bg-white px-3.5 py-2.5 text-ink outline-none focus:border-gold/60 focus:ring-2 focus:ring-gold/20"
        />
      </label>
      <label className="block">
        <span className="text-sm font-semibold text-ink">Password</span>
        <input
          name="password"
          type="password"
          autoComplete="current-password"
          required
          className="mt-1.5 w-full rounded-lg border border-brand-deep/20 bg-white px-3.5 py-2.5 text-ink outline-none focus:border-gold/60 focus:ring-2 focus:ring-gold/20"
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
        className="w-full rounded-xl bg-gradient-to-r from-gold-deep via-gold to-gold-soft px-5 py-3.5 font-bold text-ink ring-cta transition hover:brightness-110 disabled:cursor-wait disabled:opacity-60"
      >
        {pending ? "Signing in…" : "Sign in"}
      </button>
    </form>
  );
}
