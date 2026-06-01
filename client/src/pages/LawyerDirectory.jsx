import { useEffect, useState } from 'react';
import api from '../lib/api';
import LawyerCard from '../components/lawyer/LawyerCard';
import LawyerFilters from '../components/lawyer/LawyerFilters';
import BookingModal from '../components/lawyer/BookingModal';
import Skeleton from '../components/ui/Skeleton';

export default function LawyerDirectory() {
  const [lawyers, setLawyers] = useState([]);
  const [filters, setFilters] = useState({ maxFee: '10000' });
  const [prevFilters, setPrevFilters] = useState(filters);
  const [loading, setLoading] = useState(true);
  const [bookLawyer, setBookLawyer] = useState(null);

  if (filters !== prevFilters) {
    setPrevFilters(filters);
    setLoading(true);
  }

  useEffect(() => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([k, v]) => v && params.set(k, v));
    api.get(`/lawyers?${params}`)
      .then((r) => setLawyers(r.data))
      .catch(() => setLawyers([]))
      .finally(() => setLoading(false));
  }, [filters]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight md:text-4xl" style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-display)' }}>
          Lawyer Directory
        </h1>
        <p className="mt-2 text-sm font-light md:text-base" style={{ color: 'var(--text-secondary)' }}>
          Verified matrimonial and family law specialists across India
        </p>
      </div>

      <div className="mt-8 flex flex-col gap-8 lg:flex-row">
        <div className="lg:w-64 shrink-0">
          <LawyerFilters filters={filters} onChange={setFilters} />
        </div>
        <div className="flex-1">
          {loading ? (
            <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
              {[1, 2, 3, 4, 5, 6].map((i) => <Skeleton key={i} height="320px" />)}
            </div>
          ) : lawyers.length ? (
            <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3 items-stretch">
              {lawyers.map((l) => (
                <LawyerCard key={l.id} lawyer={l} onBook={setBookLawyer} />
              ))}
            </div>
          ) : (
            <div className="rounded-xl border border-dashed py-20 text-center" style={{ borderColor: 'var(--border-subtle)' }}>
              <p className="italic text-sm" style={{ color: 'var(--text-secondary)' }}>No lawyers match your current filters</p>
            </div>
          )}
        </div>
      </div>
      <BookingModal lawyer={bookLawyer} open={!!bookLawyer} onClose={() => setBookLawyer(null)} />
    </div>
  );
}
