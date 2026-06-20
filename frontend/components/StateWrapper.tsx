export default function StateWrapper({
  isLoading, error, isEmpty, children,
}: {
  isLoading: boolean; error?: Error; isEmpty?: boolean; children: React.ReactNode;
}) {
  if (isLoading) return <div className="p-6 text-slate-500 dark:text-slate-400 animate-pulse">Loading…</div>;
  if (error) return <div className="p-6 text-red-600 dark:text-red-400">Couldn’t load data: {error.message}</div>;
  if (isEmpty) return <div className="p-6 text-slate-500 dark:text-slate-400">No data available.</div>;
  return <>{children}</>;
}
