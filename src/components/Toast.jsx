import { CheckCircle, Info, Warning, WarningCircle, X } from '../lib/icons';
import { createContext, useCallback, useContext, useState } from 'react';

const ToastContext = createContext(() => {});

const TONES = {
  success: { icon: CheckCircle, className: 'text-ok' },
  error: { icon: WarningCircle, className: 'text-bad' },
  warning: { icon: Warning, className: 'text-warn' },
  info: { icon: Info, className: 'text-muted' },
};

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const dismiss = useCallback((id) => setToasts((t) => t.filter((x) => x.id !== id)), []);

  const toast = useCallback((message, tone = 'info', ms = 4000) => {
    const id = Math.random().toString(36).slice(2);
    setToasts((t) => [...t.slice(-3), { id, message, tone }]);
    setTimeout(() => dismiss(id), ms);
  }, [dismiss]);

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <div className="pointer-events-none fixed inset-x-0 bottom-24 z-50 flex flex-col items-center gap-2 px-4 sm:bottom-6 sm:items-end sm:pr-6" aria-live="polite">
        {toasts.map((t) => {
          const tone = TONES[t.tone] || TONES.info;
          const Icon = tone.icon;
          return (
            <div key={t.id} role="status"
              className="rise pointer-events-auto flex w-full max-w-sm items-start gap-3 rounded-lg border border-line bg-surface px-4 py-3 text-sm text-ink shadow-[0_8px_30px_rgba(26,26,25,0.08)]">
              <Icon size={18} weight="fill" className={`mt-px shrink-0 ${tone.className}`} />
              <span className="flex-1">{t.message}</span>
              <button onClick={() => dismiss(t.id)} className="-mr-1 rounded p-0.5 text-faint transition-colors hover:text-ink" aria-label="Dismiss">
                <X size={14} weight="bold" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export const useToast = () => useContext(ToastContext);
