// After a new deploy, an open tab still points at the old build's file names. Loading one of those
// fails, so reload once to pick up the new build instead of leaving the page blank.
const KEY = 'expensify:chunk-reload';

export const isChunkError = (err) =>
  /dynamically imported module|Importing a module script failed|error loading dynamically imported|Loading chunk|preload CSS/i
    .test(String(err?.message || err));

/** Reloads the page, at most once a minute, so a genuinely broken file cannot cause a reload loop. */
export function reloadForNewBuild() {
  try {
    const last = Number(sessionStorage.getItem(KEY) || 0);
    if (Date.now() - last < 60000) return false;
    sessionStorage.setItem(KEY, String(Date.now()));
  } catch { /* storage blocked: still try once */ }
  window.location.reload();
  return true;
}

/** Like import(), but reloads into the new build when the file is gone. */
export function loadChunk(importer) {
  return importer().catch((err) => {
    if (isChunkError(err) && reloadForNewBuild()) return new Promise(() => {});
    throw err;
  });
}

if (typeof window !== 'undefined') {
  // Vite fires this when a preloaded dependency of a lazy page fails to load.
  window.addEventListener('vite:preloadError', (event) => {
    if (reloadForNewBuild()) event.preventDefault();
  });
}
