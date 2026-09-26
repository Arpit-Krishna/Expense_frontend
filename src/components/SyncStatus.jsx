import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { CloudArrowUp, CloudSlash } from '../lib/icons';
import { useOnline, usePending, useSyncNow } from '../lib/useOffline';

/** Header pill: offline state and entries waiting to sync. Also syncs on load and when the phone reconnects. */
export default function SyncStatus() {
  const online = useOnline();
  const pending = usePending();
  const syncNow = useSyncNow();

  useEffect(() => {
    if (online) syncNow({ quiet: true });
  }, [online, syncNow]);

  if (online && pending.length === 0) return null;
  const failed = pending.some((p) => p.error);
  return (
    <Link to="/expenses" title={online ? 'Entries waiting to sync' : 'You are offline'}
      className={`inline-flex h-8 items-center gap-1.5 rounded-full border px-2.5 text-xs font-medium transition-colors ${
        failed ? 'border-bad/30 bg-bad-soft text-bad-ink' : 'border-warn/30 bg-warn-soft text-warn-ink'}`}>
      {online ? <CloudArrowUp size={15} weight="bold" /> : <CloudSlash size={15} weight="bold" />}
      {!online && 'Offline'}
      {!online && pending.length > 0 && ' · '}
      {pending.length > 0 && <span>{pending.length} <span className="hidden sm:inline">waiting to sync</span><span className="sm:hidden">pending</span></span>}
    </Link>
  );
}

