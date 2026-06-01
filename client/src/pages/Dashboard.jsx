import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useAuthStore } from '../store/useAuthStore';
import api from '../lib/api';
import Skeleton from '../components/ui/Skeleton';

export default function Dashboard() {
  const { user } = useAuthStore();
  const [cases, setCases] = useState([]);
  const [calcs, setCalcs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/cases').then((r) => setCases(r.data.slice(0, 3))).catch(() => {}),
      api.get('/calculator/history').then((r) => setCalcs(r.data.slice(0, 2))).catch(() => {}),
    ]).finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <h1 className="text-3xl">Welcome, {user?.firstName}</h1>
      <p className="mt-2 font-light" style={{ color: 'var(--text-secondary)' }}>Your family law command center</p>
      <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { to: '/calculator', label: 'Calculator', desc: 'Estimate maintenance' },
          { to: '/ai', label: 'Lex AI', desc: 'Ask legal questions' },
          { to: '/lawyers', label: 'Lawyers', desc: 'Find advocates' },
          { to: '/cases', label: 'My Cases', desc: 'Track proceedings' },
        ].map((c) => (
          <Link key={c.to} to={c.to} className="rounded-xl border p-5 transition hover:-translate-y-0.5" style={{ background: 'var(--bg-card)', borderColor: 'var(--border-subtle)' }}>
            <h3 className="font-medium">{c.label}</h3>
            <p className="mt-1 text-sm" style={{ color: 'var(--text-muted)' }}>{c.desc}</p>
          </Link>
        ))}
      </div>
      <div className="mt-12 grid gap-8 lg:grid-cols-2">
        <div>
          <h2 className="text-xl">Recent Cases</h2>
          {loading ? <Skeleton className="mt-4 h-24" /> : cases.length ? (
            <ul className="mt-4 space-y-3">
              {cases.map((c) => (
                <li key={c.id} className="rounded-lg border p-4" style={{ borderColor: 'var(--border-dim)' }}>
                  <Link to={`/cases/${c.id}`} style={{ color: 'var(--gold)' }}>{c.title}</Link>
                  <p className="mono text-xs mt-1" style={{ color: 'var(--text-muted)' }}>{c.caseNumber}</p>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-4 text-sm italic" style={{ color: 'var(--text-muted)' }}>No cases yet</p>
          )}
        </div>
        <div>
          <h2 className="text-xl">Recent Calculations</h2>
          {loading ? <Skeleton className="mt-4 h-24" /> : calcs.length ? (
            <ul className="mt-4 space-y-3">
              {calcs.map((c) => (
                <li key={c.id} className="rounded-lg border p-4" style={{ borderColor: 'var(--border-dim)' }}>
                  <span className="amount" style={{ color: 'var(--gold)' }}>₹{c.result?.monthly?.toLocaleString('en-IN')}/mo</span>
                  <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>{c.act} · {c.state}</p>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-4 text-sm italic" style={{ color: 'var(--text-muted)' }}>No saved calculations</p>
          )}
        </div>
      </div>
    </div>
  );
}
