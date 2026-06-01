import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import { useAppStore } from '../store/useAppStore';

export default function Register() {
  const [form, setForm] = useState({ email: '', password: '', firstName: '', lastName: '', state: 'Delhi', city: '' });
  const { register, loading } = useAuthStore();
  const { showToast } = useAppStore();
  const navigate = useNavigate();

  const submit = async (e) => {
    e.preventDefault();
    try {
      await register(form);
      navigate('/dashboard');
    } catch (err) {
      showToast(err.message);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center px-4" style={{ background: 'var(--bg-base)' }}>
      <form onSubmit={submit} className="w-full max-w-md rounded-xl border p-8" style={{ background: 'var(--bg-card)', borderColor: 'var(--border-subtle)' }}>
        <h1 className="text-3xl">Create Account</h1>
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          {['firstName', 'lastName', 'email', 'password', 'state', 'city'].map((f) => (
            <input
              key={f}
              type={f === 'password' ? 'password' : f === 'email' ? 'email' : 'text'}
              placeholder={f.replace(/([A-Z])/g, ' $1').trim()}
              value={form[f]}
              onChange={(e) => setForm({ ...form, [f]: e.target.value })}
              required={f !== 'city'}
              className="rounded-lg border px-4 py-3 sm:col-span-2 first:sm:col-span-1"
              style={{ background: 'var(--bg-raised)', borderColor: 'var(--border-subtle)', color: 'var(--text-primary)' }}
            />
          ))}
        </div>
        <button type="submit" disabled={loading} className="btn-primary mt-6 w-full rounded-lg py-3">
          {loading ? 'Creating…' : 'Get Started'}
        </button>
        <p className="mt-4 text-center text-sm" style={{ color: 'var(--text-muted)' }}>
          Have an account? <Link to="/login" style={{ color: 'var(--gold)' }}>Sign In</Link>
        </p>
      </form>
    </div>
  );
}
