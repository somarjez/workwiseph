"use client";

export default function Error({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center text-center">
      <h1 className="font-display text-2xl font-medium">Something went wrong</h1>
      <p className="mt-2 max-w-md text-sm text-muted">
        An unexpected error occurred while rendering this view. You can try again.
      </p>
      <button onClick={reset}
        className="mt-6 rounded-md bg-accent px-5 py-2.5 text-sm font-medium text-white transition-opacity hover:opacity-90">
        Try again
      </button>
    </div>
  );
}
