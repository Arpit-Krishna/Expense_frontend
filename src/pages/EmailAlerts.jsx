import { useEffect, useState } from 'react';
import { errorMessage, fieldErrors } from '../lib/api';
import { Info, PaperPlaneTilt, WarningCircle } from '../lib/icons';
import { getEmailSettings, saveEmailSettings, sendTestEmail } from '../lib/recurring';
import { useToast } from '../components/Toast';
import PageHeader from '../components/PageHeader';
import Spinner, { InlineSpinner } from '../components/Spinner';

const OPTIONS = [
  { key: 'weeklySummary', title: 'Sunday check-in', body: 'Every Sunday morning: what you spent this week, what is safe to spend next week, and categories past your alert level.' },
  { key: 'limitAlerts', title: 'Budget alerts', body: 'The moment an expense takes a limit to your alert level or over it. Once per limit each month.' },
  { key: 'dueReminders', title: 'Payment reminders', body: 'The day before a recurring payment is due.' },
];

export default function EmailAlerts() {
  const toast = useToast();
  const [form, setForm] = useState(null);
  const [ready, setReady] = useState(true);
  const [error, setError] = useState('');
  const [errors, setErrors] = useState({});
  const [busy, setBusy] = useState('');
  const [testError, setTestError] = useState('');

  useEffect(() => {
    getEmailSettings()
      .then((s) => { setReady(s.emailReady); setForm({ ...s, email: s.email || '' }); })
      .catch((err) => setError(errorMessage(err)));
  }, []);

  const save = async (e) => {
    e?.preventDefault();
    setBusy('save');
    setErrors({});
    try {
      const s = await saveEmailSettings({ ...form, email: form.email.trim() || null });
      setForm({ ...s, email: s.email || '' });
      toast('Email settings saved', 'success');
      return true;
    } catch (err) {
      setErrors(fieldErrors(err));
      toast(errorMessage(err, 'Could not save your settings.'), 'error');
      return false;
    } finally {
      setBusy('');
    }
  };

  const test = async () => {
    if (!(await save())) return;
    setBusy('test');
    setTestError('');
    try {
      await sendTestEmail();
      toast(`Test email sent to ${form.email}`, 'success');
    } catch (err) {
      // Keep the reason on screen: it usually says exactly what to change.
      setTestError(errorMessage(err, 'Could not send the test email.'));
    } finally {
      setBusy('');
    }
  };

  if (error) return <p className="card text-center text-bad-ink">{error}</p>;
  if (!form) return <Spinner />;

  return (
    <form onSubmit={save} className="mx-auto max-w-2xl space-y-6 sm:space-y-8" noValidate>
      <PageHeader title="Email alerts" subtitle="Choose what Expensify emails you about." />

      {!ready && (
        <div className="rise flex gap-3 rounded-xl border border-line bg-surface p-4 text-sm">
          <Info size={20} className="shrink-0 text-muted" />
          <p>Emails are switched off on the server for now. Your choices are saved and start working once email is set up.</p>
        </div>
      )}

      <section className="card rise space-y-5" style={{ '--i': 1 }}>
        <div>
          <label htmlFor="email" className="label">Send emails to</label>
          <input id="email" type="email" autoComplete="email" className={`input ${errors.email ? 'input-error' : ''}`}
            placeholder="you@example.com" value={form.email}
            onChange={(e) => { setForm({ ...form, email: e.target.value }); setTestError(''); }} />
          {errors.email ? <p className="field-error">{errors.email}</p> : (
            <p className="mt-1 text-xs text-muted">Alerts can go to any address. Check your spam folder the first time and mark them as not spam.</p>
          )}
        </div>
        <ul className="divide-y divide-line border-t border-line">
          {OPTIONS.map((o) => (
            <li key={o.key} className="py-4 last:pb-0">
              <label className="flex cursor-pointer items-start gap-3">
                <input type="checkbox" className="mt-0.5 h-4 w-4 shrink-0 accent-[var(--ink)]" checked={form[o.key]}
                  onChange={(e) => setForm({ ...form, [o.key]: e.target.checked })} />
                <span>
                  <span className="block text-sm font-medium">{o.title}</span>
                  <span className="mt-0.5 block text-sm text-muted">{o.body}</span>
                </span>
              </label>
            </li>
          ))}
        </ul>
      </section>

      {testError && (
        <div role="alert" className="rise flex gap-3 rounded-xl border border-bad/30 bg-bad-soft p-4 text-sm text-bad-ink">
          <WarningCircle size={20} className="shrink-0" />
          <p>{testError}</p>
        </div>
      )}

      <div className="flex flex-wrap justify-end gap-2">
        <button type="button" className="btn btn-secondary" onClick={test} disabled={!ready || !form.email.trim() || Boolean(busy)}>
          {busy === 'test' ? <><InlineSpinner /> Sending…</> : <><PaperPlaneTilt size={15} /> Send a test email</>}
        </button>
        <button type="submit" className="btn btn-primary" disabled={Boolean(busy)}>
          {busy === 'save' ? <><InlineSpinner /> Saving…</> : 'Save'}
        </button>
      </div>
    </form>
  );
}
