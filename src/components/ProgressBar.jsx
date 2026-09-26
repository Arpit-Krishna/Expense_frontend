import { LEVEL_STYLES } from '../lib/budget';

export default function ProgressBar({ percent = 0, level = 'ok', thresholdPercent, className = '', thin = false }) {
  const width = Math.min(Math.max(percent, 0), 100);
  const style = LEVEL_STYLES[level] || LEVEL_STYLES.ok;
  return (
    <div className={`relative w-full overflow-hidden rounded-full bg-subtle ${thin ? 'h-1.5' : 'h-2'} ${className}`}
      role="progressbar" aria-valuenow={Math.round(percent)} aria-valuemin={0} aria-valuemax={100}>
      <div className={`h-full origin-left rounded-full transition-[width] duration-700 ease-out ${style.bar}`} style={{ width: `${width}%` }} />
      {thresholdPercent ? (
        <div className="absolute inset-y-0 w-px bg-ink/35" style={{ left: `${thresholdPercent}%` }} title={`Alert at ${thresholdPercent}%`} />
      ) : null}
    </div>
  );
}
