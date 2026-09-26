export default function Spinner({ label = 'Loading…', className = '' }) {
  return (
    <div className={`flex flex-col items-center justify-center gap-3 py-20 text-muted ${className}`} role="status">
      <div className="h-6 w-6 animate-spin rounded-full border-2 border-line border-t-ink" />
      <p className="text-sm">{label}</p>
    </div>
  );
}

export function InlineSpinner() {
  return <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-current/30 border-t-current" />;
}

/** Placeholder rows shaped like the expense list. */
export function ListSkeleton({ rows = 6 }) {
  return (
    <ul className="divide-y divide-line" aria-hidden="true">
      {Array.from({ length: rows }, (_, i) => (
        <li key={i} className="flex items-center gap-3 py-3.5">
          <span className="skeleton h-10 w-10 rounded-lg" />
          <span className="flex-1 space-y-2">
            <span className="skeleton block h-3.5 w-2/5" />
            <span className="skeleton block h-3 w-1/4" />
          </span>
          <span className="skeleton h-4 w-16" />
        </li>
      ))}
    </ul>
  );
}
