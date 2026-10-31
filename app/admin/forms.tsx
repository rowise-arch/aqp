"use client";

import { useActionState } from "react";

type Result = { error?: string; ok?: string };

// A form that runs a server action and shows what came back, with no page reload.
export function ActionForm({
  action,
  submit,
  className,
  children,
}: {
  action: (prev: Result, form: FormData) => Promise<Result>;
  submit: string;
  className?: string;
  children: React.ReactNode;
}) {
  const [state, run, pending] = useActionState(action, {});
  return (
    <form action={run} className={className}>
      {children}
      <div className="form-foot">
        <button className="a-btn" type="submit" disabled={pending}>
          {pending ? "Saving…" : submit}
        </button>
        {state.error ? <p className="a-error" role="alert">{state.error}</p> : null}
        {state.ok ? <p className="a-ok" role="status">{state.ok}</p> : null}
      </div>
    </form>
  );
}
