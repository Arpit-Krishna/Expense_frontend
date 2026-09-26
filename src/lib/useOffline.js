import { useCallback, useEffect, useState } from 'react';
import { fetchBudgetStatus, newAlerts } from './budget';
import { currentMonth } from './format';
import { onPendingChange, pendingExpenses, syncPending } from './offline';
import { useToast } from '../components/Toast';

export function useOnline() {
  const [online, setOnline] = useState(() => navigator.onLine !== false);
  useEffect(() => {
    const on = () => setOnline(true);
    const off = () => setOnline(false);
    window.addEventListener('online', on);
    window.addEventListener('offline', off);
    return () => {
      window.removeEventListener('online', on);
      window.removeEventListener('offline', off);
    };
  }, []);
  return online;
}

export function usePending() {
  const [items, setItems] = useState(pendingExpenses);
  useEffect(() => onPendingChange(() => setItems(pendingExpenses())), []);
  return items;
}

/** Sends queued expenses and reports what happened, including any budget alerts they caused. */
export function useSyncNow() {
  const toast = useToast();
  return useCallback(async ({ quiet = false } = {}) => {
    if (!pendingExpenses().some((p) => !p.error)) return;
    const before = await fetchBudgetStatus(currentMonth()).catch(() => null);
    const { synced, failed } = await syncPending();
    if (synced) {
      toast(`${synced} offline expense${synced === 1 ? '' : 's'} synced`, 'success');
      window.dispatchEvent(new Event('expensify:expenses-changed'));
      const after = await fetchBudgetStatus(currentMonth()).catch(() => null);
      newAlerts(before, after).forEach((a) => toast(a.text, a.level === 'over' ? 'error' : 'warning', 8000));
    }
    if (failed) toast(`${failed} offline expense${failed === 1 ? ' was' : 's were'} rejected. Open Expenses to fix ${failed === 1 ? 'it' : 'them'}.`, 'error', 8000);
    if (!synced && !failed && !quiet) toast('Still cannot reach the server. Entries stay saved on this device.', 'warning');
  }, [toast]);
}

/** A number that goes up whenever queued expenses reach the server, for pages to refetch on. */
export function useSyncedVersion() {
  const [version, setVersion] = useState(0);
  useEffect(() => {
    const bump = () => setVersion((v) => v + 1);
    window.addEventListener('expensify:expenses-changed', bump);
    return () => window.removeEventListener('expensify:expenses-changed', bump);
  }, []);
  return version;
}
