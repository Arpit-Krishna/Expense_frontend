import { SignOut } from '../lib/icons';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api, clearToken, errorMessage } from '../lib/api';
import Spinner from '../components/Spinner';

export default function Profile() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get('/auth/me').then((res) => setUser(res.data)).catch((err) => setError(errorMessage(err)));
  }, []);

  const logout = () => { clearToken(); navigate('/login'); };

  if (error) return <p className="card text-center text-bad-ink">{error}</p>;
  if (!user) return <Spinner />;

  const name = user.fullName || user.username;
  return (
    <div className="mx-auto max-w-lg">
      <div className="rise flex items-center gap-4">
        <div className="grid h-16 w-16 shrink-0 place-items-center rounded-2xl bg-ink font-serif text-3xl text-on-ink">
          {name.slice(0, 1).toUpperCase()}
        </div>
        <div className="min-w-0">
          <h1 className="truncate font-serif text-4xl leading-tight tracking-[-0.02em]">{name}</h1>
          <p className="text-sm text-muted">@{user.username}</p>
        </div>
      </div>
      <dl className="card rise mt-8 divide-y divide-line py-2 text-sm sm:py-2" style={{ '--i': 1 }}>
        <div className="flex justify-between gap-4 py-3.5"><dt className="text-muted">Username</dt><dd className="truncate">{user.username}</dd></div>
        <div className="flex justify-between gap-4 py-3.5"><dt className="text-muted">Email</dt><dd className="truncate">{user.email || '—'}</dd></div>
        <div className="flex justify-between gap-4 py-3.5"><dt className="text-muted">Phone</dt><dd className="truncate">{user.phone || '—'}</dd></div>
      </dl>
      <button onClick={logout} className="btn btn-secondary rise mt-4 w-full text-bad-ink" style={{ '--i': 2 }}><SignOut size={16} /> Log out</button>
    </div>
  );
}
