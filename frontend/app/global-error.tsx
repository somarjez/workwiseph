"use client";

export default function GlobalError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <html lang="en">
      <body style={{ fontFamily: "system-ui, sans-serif", display: "flex", minHeight: "100vh", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 16, color: "#1e293b" }}>
        <h1 style={{ fontSize: 22 }}>Something went wrong</h1>
        <button onClick={reset} style={{ background: "#3457d5", color: "#fff", border: 0, borderRadius: 8, padding: "10px 20px", fontSize: 14, cursor: "pointer" }}>
          Try again
        </button>
      </body>
    </html>
  );
}
