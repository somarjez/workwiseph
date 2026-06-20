export default function StateWrapper({
  isLoading, error, isEmpty, children,
}: {
  isLoading: boolean; error?: Error; isEmpty?: boolean; children: React.ReactNode;
}) {
  if (isLoading) {
    return <div aria-busy="true" className="skeleton h-72 w-full rounded-xl border border-border" />;
  }
  if (error) {
    return (
      <div className="rounded-xl border border-border bg-surface p-6 text-sm text-danger">
        Couldn’t load this data: {error.message}
      </div>
    );
  }
  if (isEmpty) {
    return (
      <div className="rounded-xl border border-dashed border-border bg-surface p-6 text-sm text-muted">
        No data available for this view yet.
      </div>
    );
  }
  return <>{children}</>;
}
