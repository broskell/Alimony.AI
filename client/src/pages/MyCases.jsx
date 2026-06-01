import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../lib/api';
import CaseCard from '../components/case/CaseCard';
import Skeleton from '../components/ui/Skeleton';
import { useAuthStore } from '../store/useAuthStore';

export default function MyCases() {
  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuthStore();

  useEffect(() => {
    if (!user) return;
    api.get('/cases').then((r) => setCases(r.data)).finally(() => setLoading(false));
  }, [user]);

  if (!user) {
    return (
      <div className="py-20 text-center">
        <p style={{ color: 'var(--text-secondary)' }}>Sign in to view your cases</p>
        <Link to="/login" className="mt-4 inline-block" style={{ color: 'var(--gold)' }}>Sign In →</Link>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-3xl">My Cases</h1>
      {loading ? (
        <div className="mt-8 grid gap-4 md:grid-cols-2">
          {[1, 2, 3].map((i) => <Skeleton key={i} height="200px" />)}
        </div>
      ) : cases.length ? (
        <div className="mt-8 grid gap-4 md:grid-cols-2">
          {cases.map((c) => <CaseCard key={c.id} caseData={c} />)}
        </div>
      ) : (
        <p className="mt-12 text-center italic" style={{ color: 'var(--text-muted)' }}>No cases on file</p>
      )}
    </div>
  );
}
