"use client";

import { useEffect } from "react";

type ErrorProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function Error({ error, reset }: ErrorProps) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="flex min-h-dvh items-center justify-center bg-bg px-6 py-16">
      <div className="w-full max-w-md rounded-2xl bg-bg-card p-8 text-center">
        <div
          className="mx-auto h-1.5 w-1.5 rounded-full bg-accent"
          aria-hidden="true"
        />

        <h1 className="mt-6 font-display text-xl font-bold text-text">
          Da ist etwas schiefgelaufen
        </h1>

        <p className="mt-2 text-sm leading-relaxed text-text-muted">
          Deine Bewertung konnte gerade nicht geladen werden. Versuch es bitte
          noch einmal — deine Eingaben gehen dabei nicht verloren.
        </p>

        <button
          type="button"
          onClick={reset}
          className="mt-8 w-full rounded-xl bg-accent px-6 py-3.5 text-base font-semibold text-bg transition-colors hover:bg-accent-light focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-light"
        >
          Erneut versuchen
        </button>

        {error.digest ? (
          <p className="mt-6 text-xs tracking-wide text-text-subtle">
            Referenz {error.digest}
          </p>
        ) : null}
      </div>
    </main>
  );
}
