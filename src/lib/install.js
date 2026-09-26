// Chrome and Android fire beforeinstallprompt once, often before React mounts, so capture it at load.
let deferred = null;
const listeners = new Set();
const notify = () => listeners.forEach((fn) => fn());

if (typeof window !== 'undefined') {
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferred = e;
    notify();
  });
  window.addEventListener('appinstalled', () => {
    deferred = null;
    notify();
  });
}

export const isStandalone = () =>
  window.matchMedia?.('(display-mode: standalone)').matches || window.navigator.standalone === true;

export const isIos = () => /iphone|ipad|ipod/i.test(navigator.userAgent) && !window.MSStream;

export const canPromptInstall = () => Boolean(deferred);

export async function promptInstall() {
  if (!deferred) return false;
  const e = deferred;
  deferred = null;
  notify();
  await e.prompt();
  const choice = await e.userChoice.catch(() => null);
  return choice?.outcome === 'accepted';
}

export function onInstallChange(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}
