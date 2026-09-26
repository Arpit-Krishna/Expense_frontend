import { categoryInfo } from '../lib/categories';
import { formatDate, money } from '../lib/format';
import { ArrowsClockwise, CloudArrowUp, Trash } from '../lib/icons';
import { discardPending, retryPending } from '../lib/offline';
import CategoryIcon from './CategoryIcon';
import { useOnline, usePending, useSyncNow } from '../lib/useOffline';

/** Expenses saved on this device that have not reached the server yet. */
export default function PendingList() {
  const pending = usePending();
  const online = useOnline();
  const syncNow = useSyncNow();
  if (!pending.length) return null;
  return (
    <section className="rise rounded-xl border border-warn/30 bg-warn-soft/60 p-4 sm:p-5" aria-label="Waiting to sync">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <CloudArrowUp size={20} weight="bold" className="text-warn" />
          <div>
            <h2 className="text-sm font-semibold text-warn-ink">Waiting to sync</h2>
            <p className="text-xs text-ink-soft">{online ? 'Saved on this device. They are sent to the server automatically.' : 'You are offline. These will sync when you reconnect.'}</p>
          </div>
        </div>
        {online && pending.some((p) => !p.error) && (
          <button className="btn btn-secondary h-8 px-3 text-xs" onClick={() => syncNow()}>
            <ArrowsClockwise size={14} /> Sync now
          </button>
        )}
      </div>
      <ul className="mt-3 divide-y divide-warn/20">
        {pending.map((p) => (
          <li key={p.localId} className="flex items-center gap-3 py-2.5">
            <CategoryIcon name={p.payload.category} size="sm" />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">{p.payload.title}</p>
              <p className="truncate text-xs text-muted">{categoryInfo(p.payload.category).label} · {formatDate(p.payload.date)}</p>
              {p.error && <p className="text-xs text-bad-ink">Not saved: {p.error}</p>}
            </div>
            <span className="amount shrink-0 text-sm font-medium">{money(p.payload.amount)}</span>
            {p.error && (
              <>
                <button className="btn btn-ghost h-8 w-8 p-0" onClick={() => retryPending(p.localId)} aria-label="Try again"><ArrowsClockwise size={15} /></button>
                <button className="btn btn-ghost h-8 w-8 p-0 text-bad-ink" onClick={() => discardPending(p.localId)} aria-label="Discard"><Trash size={15} /></button>
              </>
            )}
          </li>
        ))}
      </ul>
    </section>
  );
}
