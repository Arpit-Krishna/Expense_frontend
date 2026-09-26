import { api, getToken } from './api';

// Expenses saved while offline wait in localStorage until the server can be reached.
const QUEUE_KEY = 'pendingExpenses';
const RECENT_KEY = 'recentCategories';
const CHANGE = 'expensify:pending-change';

function read(key, fallback) {
  try {
    return JSON.parse(localStorage.getItem(key)) ?? fallback;
  } catch {
    return fallback;
  }
}

function write(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch { /* storage full or blocked */ }
}

/** The username inside the JWT, so one person's queued entries never sync into another account. */
function currentOwner() {
  const token = getToken()?.replace(/^Bearer /, '');
  try {
    return JSON.parse(atob(token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/'))).sub || null;
  } catch {
    return null;
  }
}

export function pendingExpenses() {
  const owner = currentOwner();
  return read(QUEUE_KEY, []).filter((p) => !p.owner || p.owner === owner);
}

function saveQueue(items) {
  write(QUEUE_KEY, items);
  window.dispatchEvent(new Event(CHANGE));
}

export function onPendingChange(fn) {
  const storage = (e) => { if (e.key === QUEUE_KEY) fn(); };
  window.addEventListener(CHANGE, fn);
  window.addEventListener('storage', storage);
  return () => {
    window.removeEventListener(CHANGE, fn);
    window.removeEventListener('storage', storage);
  };
}

export function discardPending(localId) {
  saveQueue(read(QUEUE_KEY, []).filter((p) => p.localId !== localId));
}

function enqueue(payload) {
  const item = { localId: `local-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`, owner: currentOwner(), payload, queuedAt: new Date().toISOString() };
  saveQueue([...read(QUEUE_KEY, []), item]);
  return item;
}

/** A request that never reached the server, as opposed to one the server answered or a slow reply. */
const neverSent = (err) => !err.response && err.code !== 'ECONNABORTED';

/**
 * Creates the expense, or queues it when the phone is offline.
 * Returns { expense } when saved, or { queued } when it will sync later.
 */
export async function createExpense(payload) {
  rememberCategory(payload.category);
  if (typeof navigator !== 'undefined' && navigator.onLine === false) return { queued: enqueue(payload) };
  try {
    const res = await api.post('/api/expense', payload);
    return { expense: res.data };
  } catch (err) {
    if (neverSent(err)) return { queued: enqueue(payload) };
    throw err;
  }
}

let syncing = null;

/** Sends queued expenses in order. Stops at the first network failure; marks ones the server rejects. */
export function syncPending() {
  if (syncing) return syncing;
  syncing = (async () => {
    let synced = 0;
    let failed = 0;
    for (const item of pendingExpenses()) {
      if (item.error) continue;
      try {
        await api.post('/api/expense', item.payload);
        saveQueue(read(QUEUE_KEY, []).filter((p) => p.localId !== item.localId));
        synced += 1;
      } catch (err) {
        if (neverSent(err) || err.code === 'ECONNABORTED' || err.response?.status === 401) break;
        const message = err.response?.data?.message || 'The server rejected this entry.';
        saveQueue(read(QUEUE_KEY, []).map((p) => (p.localId === item.localId ? { ...p, error: message } : p)));
        failed += 1;
      }
    }
    return { synced, failed };
  })().finally(() => { syncing = null; });
  return syncing;
}

export function retryPending(localId) {
  saveQueue(read(QUEUE_KEY, []).map((p) => (p.localId === localId ? { ...p, error: undefined } : p)));
  return syncPending();
}

export function recentCategories() {
  return read(RECENT_KEY, []);
}

export function rememberCategory(name) {
  if (!name) return;
  write(RECENT_KEY, [name, ...recentCategories().filter((c) => c !== name)].slice(0, 8));
}
