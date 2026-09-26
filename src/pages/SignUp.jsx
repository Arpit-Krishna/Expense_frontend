import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api, errorMessage, fieldErrors, setToken, wakeServer } from '../lib/api';
import { InlineSpinner } from '../components/Spinner';
import AuthShell from './AuthShell';

const empty = { fullName: '', username: '', email: '', phone: '', password: '', confirm: '' };

function validate(f) {
  const e = {};
  if (!/^[A-Za-z0-9 ._-]{3,30}$/.test(f.username.trim())) e.username = 'Use 3-30 letters, numbers, dots, dashes or underscores.';
  if (f.email && !/^\S+@\S+\.\S+$/.test(f.email)) e.email = 'Enter a valid email address.';
  if (f.password.length < 8) e.password = 'Use at least 8 characters.';
  else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(f.password)) e.password = 'Include an uppercase letter, a lowercase letter and a number.';
  if (f.confirm !== f.password) e.confirm = 'Passwords do not match.';
  return e;
}

export default function SignUp() {
  const navigate = useNavigate();
  const [form, setForm] = useState(empty);
  const [errors, setErrors] = useState({});
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => { wakeServer(); }, []);

  const onChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    if (errors[e.target.name]) setErrors({ ...errors, [e.target.name]: '' });
  };

  const submit = async (e) => {
    e.preventDefault();
    const v = validate(form);
    setErrors(v);
    if (Object.keys(v).length) return;
    setSubmitting(true);
    setError('');
    try {
      const res = await api.post('/auth/signup', {
        username: form.username.trim(),
        fullName: form.fullName.trim() || null,
        email: form.email.trim() || null,
        phone: form.phone.trim() || null,
        password: form.password,
      });
      setToken(res.data, true);
      navigate('/budgets?welcome=1', { replace: true });
    } catch (err) {
      setErrors(fieldErrors(err));
      setError(errorMessage(err, 'Could not create your account.'));
    } finally {
      setSubmitting(false);
    }
  };

  const field = (name, label, props = {}) => (
    <div>
      <label htmlFor={name} className="label">{label}</label>
      <input id={name} name={name} className={`input ${errors[name] ? 'input-error' : ''}`} value={form[name]} onChange={onChange} {...props} />
      {errors[name] && <p className="field-error">{errors[name]}</p>}
    </div>
  );

  return (
    <AuthShell title="Create your account" subtitle="Track spending and get warned before you overspend"
      footer={<>Already have an account? <Link to="/login" className="font-semibold text-indigo-600 hover:underline dark:text-indigo-400">Log in</Link></>}>
      <form onSubmit={submit} className="space-y-4" noValidate>
        {error && <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-950/60 dark:text-red-200">{error}</p>}
        {field('username', 'Username (you log in with this)', { autoComplete: 'username', autoFocus: true })}
        {field('fullName', 'Full name (optional)', { autoComplete: 'name' })}
        <div className="grid gap-4 sm:grid-cols-2">
          {field('email', 'Email (optional)', { type: 'email', autoComplete: 'email' })}
          {field('phone', 'Phone (optional)', { type: 'tel', autoComplete: 'tel' })}
        </div>
        {field('password', 'Password', { type: 'password', autoComplete: 'new-password' })}
        {field('confirm', 'Confirm password', { type: 'password', autoComplete: 'new-password' })}
        <button type="submit" className="btn btn-primary w-full" disabled={submitting}>
          {submitting ? <><InlineSpinner /> Creating account…</> : 'Create account'}
        </button>
      </form>
    </AuthShell>
  );
}
