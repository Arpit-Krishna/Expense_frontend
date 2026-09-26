import { COIN, POT } from './mark';

/** The logo mark drawn with theme tokens, so it follows light and dark mode. */
export default function GullakMark({ className = 'h-7 w-7', title }) {
  const { body, neck, foot, slot, shine } = POT;
  const r = (b, fill) => <rect x={b.x} y={b.y} width={b.w} height={b.h} rx={b.r} fill={fill} />;
  return (
    <svg viewBox="0 0 64 64" className={className} role={title ? 'img' : undefined} aria-label={title} aria-hidden={title ? undefined : true}>
      <circle cx={COIN.cx} cy={COIN.cy} r={COIN.r} fill="var(--ink)" />
      <circle cx={COIN.cx} cy={COIN.cy} r={COIN.ring} fill="none" stroke="var(--canvas)" strokeOpacity="0.35" strokeWidth="1.2" />
      {r(foot, 'var(--clay)')}
      <ellipse cx={body.cx} cy={body.cy} rx={body.rx} ry={body.ry} fill="var(--clay)" />
      {r(neck, 'var(--clay)')}
      <path d={shine} fill="none" stroke="#F7F6F3" strokeOpacity="0.35" strokeWidth="2.2" strokeLinecap="round" />
      {r(slot, 'var(--clay-deep)')}
    </svg>
  );
}

/** Mark plus the serif wordmark. */
export function Wordmark({ className = '' }) {
  return (
    <span className={`inline-flex items-center gap-1.5 ${className}`}>
      <GullakMark className="h-9 w-9 -translate-y-0.5" />
      <span className="font-serif text-[1.55rem] leading-none tracking-[-0.01em] text-ink">Expensify</span>
    </span>
  );
}
