import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center text-center">
      <p className="font-display text-6xl font-medium tracking-tight text-accent">404</p>
      <h1 className="mt-4 font-display text-2xl font-medium">This page doesn&rsquo;t exist</h1>
      <p className="mt-2 max-w-md text-sm text-muted">
        The page you&rsquo;re looking for isn&rsquo;t part of the dashboard. It may have moved.
      </p>
      <Link href="/"
        className="mt-6 rounded-md bg-accent px-5 py-2.5 text-sm font-medium text-white transition-opacity hover:opacity-90">
        Back to home
      </Link>
    </div>
  );
}
