export default function AuthShell({ title, subtitle, children, footer }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-slate-100 px-4 py-12 dark:from-slate-950 dark:via-slate-900 dark:to-indigo-950">
      <div className="w-full max-w-md">
        <div className="mb-6 text-center">
          <span className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-indigo-600 text-2xl font-bold text-white">₹</span>
          <h1 className="mt-4 text-2xl font-bold">{title}</h1>
          <p className="mt-1 text-sm muted">{subtitle}</p>
        </div>
        <div className="card p-6">{children}</div>
        {footer && <p className="mt-4 text-center text-sm muted">{footer}</p>}
      </div>
    </div>
  );
}
