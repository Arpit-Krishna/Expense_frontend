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

  if (error) return <p className="card text-center text-red-600 dark:text-red-400">{error}</p>;
  if (!user) return <Spinner />;

  const name = user.fullName || user.username;
  return (
    <div className="mx-auto max-w-lg">
      <div className="card text-center">
        <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-indigo-600 text-2xl font-bold text-white">
          {name.slice(0, 1).toUpperCase()}
        </div>
        <h1 className="mt-3 text-xl font-bold">{name}</h1>
        <p className="text-sm muted">@{user.username}</p>
        <dl className="mt-6 space-y-3 text-left text-sm">
          <div className="flex justify-between border-b border-slate-100 pb-3 dark:border-slate-800"><dt className="muted">Email</dt><dd>{user.email || '—'}</dd></div>
          <div className="flex justify-between"><dt className="muted">Phone</dt><dd>{user.phone || '—'}</dd></div>
        </dl>
        <button onClick={logout} className="btn btn-secondary mt-6 w-full text-red-600 dark:text-red-400">Log out</button>
      </div>
    </div>
  );
}
