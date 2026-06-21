"use client";
import { useState } from "react";

export default function CopyLinkButton() {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      /* clipboard unavailable; no-op */
    }
  }

  return (
    <button onClick={copy} title="Copy a shareable link to this view"
      className="rounded-md border border-border bg-surface px-3 py-1.5 text-xs font-medium text-muted transition-colors hover:text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent">
      {copied ? "✓ Copied" : "Copy link"}
    </button>
  );
}
