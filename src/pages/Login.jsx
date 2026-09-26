import { useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { api, errorMessage, getToken, setToken, wakeServer } from '../lib/api';
import { InlineSpinner } from '../components/Spinner';
import AuthShell from './AuthShell';

export default function Login() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const next = params.get('next') || '/';
  const [form, setForm] = useState({ username: '', password: '' });
  const [remember, setRemember] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(params.get('expired') ? 'Your session ended. Please log in again.' : '');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (getToken()) navigate(next, { replace: true });
    wakeServer();
  }, [navigate, next]);

  const submit = async (e) => {
    e.preventDefault();
    if (!form.username.trim() || !form.password) {
      setError('Enter your username and password.');
      return;
    }
    setSubmitting(true);
    setError('');
    try {
      const res = await api.post('/auth/login', { username: form.username.trim(), password: form.password });
      setToken(res.data, remember);
      navigate(next, { replace: true });
    } catch (err) {
      setError(errorMessage(err, 'Could not log in.'));
    } finally {
      setSubmitting(false);
    }
  };

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  return (
    <AuthShell title="Welcome back" subtitle="Log in to keep your spending on track"
      footer={<>New here? <Link to="/signup" className="link">Create an account</Link></>}>
      <form onSubmit={submit} className="space-y-4" noValidate>
        {error && <p role="alert" className="rounded-md border border-bad/20 bg-bad-soft px-3 py-2.5 text-sm text-bad-ink">{error}</p>}
        <div>
          <label htmlFor="username" className="label">Username</label>
          <input id="username" name="username" autoComplete="username" className="input" value={form.username} onChange={onChange} autoFocus />
        </div>
        <div>
          <label htmlFor="password" className="label">Password</label>
          <div className="relative">
            <input id="password" name="password" type={showPassword ? 'text' : 'password'} autoComplete="current-password"
              className="input pr-16" value={form.password} onChange={onChange} />
            <button type="button" onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 px-3 text-xs font-medium text-muted hover:text-ink">
              {showPassword ? 'Hide' : 'Show'}
            </button>
          </div>
        </div>
        <label className="flex cursor-pointer items-center gap-2.5 text-sm text-ink-soft">
          <input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} className="h-4 w-4 accent-[var(--ink)]" />
          Keep me logged in on this device
        </label>
        <button type="submit" className="btn btn-primary h-11 w-full" disabled={submitting}>
          {submitting ? <><InlineSpinner /> Logging in…</> : 'Log in'}
        </button>
        <p className="text-center text-xs text-faint">The server may take up to a minute to wake up on the first visit.</p>
      </form>
    </AuthShell>
  );
}
