import { useEffect, useRef, useState } from 'react';
import GullakMark from '../brand/GullakMark';
import { buildLoaderAnimation } from '../brand/loaderAnimation';

function themeColors() {
  const css = getComputedStyle(document.documentElement);
  const v = (name) => css.getPropertyValue(name).trim();
  return { pot: v('--clay'), slot: v('--clay-deep'), coin: v('--ink'), coinRing: v('--canvas'), clink: v('--clay') };
}

function prefersReducedMotion() {
  return window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;
}

/**
 * Page loader: the gullak takes a coin (Lottie). The player loads on demand; until it
 * arrives, and whenever reduced motion is on, the still mark is shown instead.
 */
export function GullakLoader({ size = 96, loop = true }) {
  const box = useRef(null);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    if (prefersReducedMotion()) return undefined;
    let player = null;
    let cancelled = false;

    const start = async () => {
      try {
        const { default: lottie } = await import('lottie-web/build/player/lottie_light');
        if (cancelled || !box.current) return;
        player?.destroy();
        player = lottie.loadAnimation({
          container: box.current,
          renderer: 'svg',
          loop,
          autoplay: true,
          animationData: buildLoaderAnimation(themeColors()),
          rendererSettings: { preserveAspectRatio: 'xMidYMid meet' },
        });
        setPlaying(true);
      } catch {
        // Keep the still mark if the player cannot load (offline on a first visit).
      }
    };
    start();

    // Rebuild with new colours when the theme switches.
    const observer = new MutationObserver(() => { start(); });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });

    return () => {
      cancelled = true;
      observer.disconnect();
      player?.destroy();
    };
  }, [loop]);

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <div ref={box} className="absolute inset-0" />
      {!playing && <GullakMark className="absolute inset-0 h-full w-full" />}
    </div>
  );
}

export default function Spinner({ label = 'Loading…', className = '' }) {
  return (
    <div className={`loader-in flex flex-col items-center justify-center gap-2 py-20 text-muted ${className}`} role="status" aria-live="polite">
      <GullakLoader />
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
