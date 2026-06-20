export default function PageHeader({
  title, context, children,
}: {
  title: string;
  context?: string;
  children?: React.ReactNode;
}) {
  return (
    <header className="mb-8 animate-rise">
      <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-3">
        <div>
          <h1 className="font-display text-3xl font-medium leading-tight tracking-tight text-balance md:text-[2.5rem]">
            {title}
          </h1>
          {context && <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted">{context}</p>}
        </div>
        {children && <div className="flex shrink-0 flex-wrap items-center gap-2">{children}</div>}
      </div>
      <hr className="mt-5 border-0 border-t border-border" />
    </header>
  );
}
