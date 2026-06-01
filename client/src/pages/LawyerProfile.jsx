import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '../lib/api';
import Skeleton from '../components/ui/Skeleton';
import BookingModal from '../components/lawyer/BookingModal';

export default function LawyerProfile() {
  const { id } = useParams();
  const [lawyer, setLawyer] = useState(null);
  const [bookOpen, setBookOpen] = useState(false);

  useEffect(() => {
    api.get(`/lawyers/${id}`).then((r) => setLawyer(r.data)).catch(() => setLawyer(null));
  }, [id]);

  if (!lawyer) return <Skeleton height="400px" />;

  const name = lawyer.user ? `${lawyer.user.firstName} ${lawyer.user.lastName}` : 'Advocate';

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="text-3xl">Adv. {name}</h1>
      <p className="mono mt-2 text-sm" style={{ color: 'var(--text-muted)' }}>{lawyer.barNumber}</p>
      <p className="mt-4" style={{ color: 'var(--text-secondary)' }}>{lawyer.bio}</p>
      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        <div className="rounded-xl border p-4" style={{ borderColor: 'var(--border-subtle)' }}>
          <p className="label-chip text-[10px]" style={{ color: 'var(--text-muted)' }}>Fee</p>
          <p className="amount text-2xl" style={{ color: 'var(--gold)' }}>₹{lawyer.feePerHour?.toLocaleString('en-IN')}/hr</p>
        </div>
        <div className="rounded-xl border p-4" style={{ borderColor: 'var(--border-subtle)' }}>
          <p className="label-chip text-[10px]" style={{ color: 'var(--text-muted)' }}>Experience</p>
          <p className="text-2xl">{lawyer.experience} years</p>
        </div>
      </div>
      <button type="button" onClick={() => setBookOpen(true)} className="btn-primary mt-8 rounded-lg px-6 py-3">
        Book Consultation
      </button>
      <BookingModal lawyer={lawyer} open={bookOpen} onClose={() => setBookOpen(false)} />
    </div>
  );
}
