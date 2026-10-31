"use client";

import { useActionState } from "react";
import { signIn } from "../actions";

export default function LoginForm() {
  const [state, run, pending] = useActionState(signIn, {});
  return (
    <form action={run} className="login-form">
      <label>
        Email
        <input name="email" type="email" autoComplete="username" required />
      </label>
      <label>
        Password
        <input name="password" type="password" autoComplete="current-password" required />
      </label>
      <button className="a-btn" type="submit" disabled={pending}>
        {pending ? "Signing in…" : "Sign in"}
      </button>
      {state.error ? <p className="a-error" role="alert">{state.error}</p> : null}
    </form>
  );
}
