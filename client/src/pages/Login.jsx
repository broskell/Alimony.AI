import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import { useAppStore } from '../store/useAppStore';

export default function Login() {
  const [email, setEmail] = useState('client@demo.com');
  const [password, setPassword] = useState('Demo@1234');
  const { login, loading } = useAuthStore();
  const { showToast } = useAppStore();
  const navigate = useNavigate();

  const submit = async (e) => {
    e.preventDefault();
    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      showToast(err.message);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center px-4" style={{ background: 'var(--bg-base)' }}>
      <form onSubmit={submit} className="w-full max-w-md rounded-xl border p-8" style={{ background: 'var(--bg-card)', borderColor: 'var(--border-subtle)' }}>
        <h1 className="text-3xl">Sign In</h1>
        <p className="mt-2 text-sm" style={{ color: 'var(--text-secondary)' }}>Demo: client@demo.com / Demo@1234</p>
        <div className="mt-6 space-y-4">
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" required className="w-full rounded-lg border px-4 py-3" style={{ background: 'var(--bg-raised)', borderColor: 'var(--border-subtle)', color: 'var(--text-primary)' }} />
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" required className="w-full rounded-lg border px-4 py-3" style={{ background: 'var(--bg-raised)', borderColor: 'var(--border-subtle)', color: 'var(--text-primary)' }} />
        </div>
        <button type="submit" disabled={loading} className="btn-primary mt-6 w-full rounded-lg py-3">
          {loading ? 'Signing in…' : 'Sign In'}
        </button>
        <p className="mt-4 text-center text-sm" style={{ color: 'var(--text-muted)' }}>
          No account? <Link to="/register" style={{ color: 'var(--gold)' }}>Register</Link>
        </p>
      </form>
    </div>
  );
}
