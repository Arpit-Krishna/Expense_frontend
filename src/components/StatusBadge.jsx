import { LEVEL_STYLES } from '../lib/budget';

export default function StatusBadge({ level, label, className = '' }) {
  const s = LEVEL_STYLES[level] || LEVEL_STYLES.none;
  return (
    <span className={`inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-1 text-[11px] font-medium uppercase tracking-[0.06em] ${s.badge} ${className}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${s.bar}`} />
      {label || s.label}
    </span>
  );
}
