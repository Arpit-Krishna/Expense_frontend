import { LEVEL_STYLES } from '../lib/budget';

export default function ProgressBar({ percent = 0, level = 'ok', thresholdPercent, className = '' }) {
  const width = Math.min(Math.max(percent, 0), 100);
  const style = LEVEL_STYLES[level] || LEVEL_STYLES.ok;
  return (
    <div className={`relative h-2.5 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800 ${className}`}
      role="progressbar" aria-valuenow={Math.round(percent)} aria-valuemin={0} aria-valuemax={100}>
      <div className={`h-full rounded-full transition-all ${style.bar}`} style={{ width: `${width}%` }} />
      {thresholdPercent ? (
        <div className="absolute inset-y-0 w-0.5 bg-slate-500/60" style={{ left: `${thresholdPercent}%` }} title={`Alert at ${thresholdPercent}%`} />
      ) : null}
    </div>
  );
}
