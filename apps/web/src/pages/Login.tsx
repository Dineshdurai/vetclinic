import { FormEvent, useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { api, session, User } from '../api';
import { useAction } from '../ui';

export default function Login() {
  const nav = useNavigate();
  const { error, busy, run } = useAction();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  if (session.get()) return <Navigate to="/" replace />;
  const submit = (e: FormEvent) => {
    e.preventDefault();
    run(async () => {
      session.set(await api<{ token: string; user: User }>('/auth/login', { method: 'POST', body: { username, password } }));
      nav('/');
    });
  };
  return (
    <div className="login">
      <form className="card" onSubmit={submit}>
        <div className="logo">🐾</div>
        <h1>PetVitality</h1>
        <p className="muted">Sign in to manage your clinic</p>
        <label className="field"><span>Username</span><input value={username} onChange={(e) => setUsername(e.target.value)} autoFocus autoComplete="username" required /></label>
        <label className="field"><span>Password</span><input type="password" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="current-password" required /></label>
        {error && <div className="error">{error}</div>}
        <button className="primary" disabled={busy}>{busy ? 'Signing in…' : 'Sign in'}</button>
      </form>
    </div>
  );
}
