import { Wordmark } from '../brand/GullakMark';
import { GullakLoader } from '../components/Spinner';
import { BellRinging, ChartPieSlice, Target } from '../lib/icons';

const POINTS = [
  { icon: Target, text: 'Monthly and per-category limits in rupees' },
  { icon: BellRinging, text: 'A warning at 80%, and a red alert when you go over' },
  { icon: ChartPieSlice, text: 'Where the money went, month by month' },
];

export default function AuthShell({ title, subtitle, children, footer }) {
  return (
    <div className="grid min-h-dvh lg:grid-cols-[1fr_minmax(0,560px)]">
      <aside className="relative hidden overflow-hidden border-r border-line bg-surface lg:flex lg:flex-col lg:justify-between lg:p-12">
        <Wordmark />
        <div className="max-w-md">
          <GullakLoader size={132} loop={false} />
          <p className="mt-4 font-serif text-6xl leading-[1.02] tracking-[-0.03em]">Know where every rupee goes.</p>
          <ul className="mt-10 space-y-4">
            {POINTS.map(({ icon, text }) => {
              const Icon = icon;
              return (
                <li key={text} className="flex items-center gap-3 text-[15px] text-ink-soft">
                  <span className="grid h-8 w-8 place-items-center rounded-md border border-line bg-canvas"><Icon size={17} /></span>{text}
                </li>
              );
            })}
          </ul>
        </div>
        <p className="text-xs text-faint">Built for a monthly salary, fixed payments and everyday spending.</p>
        <div className="pointer-events-none absolute -right-40 -top-40 h-[480px] w-[480px] rounded-full bg-[radial-gradient(closest-side,color-mix(in_oklab,var(--clay)_14%,transparent),transparent)]" />
      </aside>

      <main className="flex items-center justify-center px-5 py-12 sm:px-10">
        <div className="rise w-full max-w-[400px]">
          <Wordmark className="mb-10 lg:hidden" />
          <h1 className="page-title">{title}</h1>
          <p className="mt-2 text-[15px] text-muted">{subtitle}</p>
          <div className="mt-8">{children}</div>
          {footer && <p className="mt-8 border-t border-line pt-6 text-sm text-muted">{footer}</p>}
        </div>
      </main>
    </div>
  );
}
