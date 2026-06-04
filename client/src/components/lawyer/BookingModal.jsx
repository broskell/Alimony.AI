import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../lib/api';
import Icon from '../ui/Icon';
import { useAuthStore } from '../../store/useAuthStore';
import { useAppStore } from '../../store/useAppStore';

const MODES = [
  { id: 'video', label: 'Video', icon: 'videocam' },
  { id: 'phone', label: 'Phone', icon: 'call' },
  { id: 'inperson', label: 'In Person', icon: 'account_balance' },
];

export default function BookingModal({ lawyer, open, onClose }) {
  const { user } = useAuthStore();
  const { showToast } = useAppStore();
  const [form, setForm] = useState({ date: '', mode: 'video', notes: '' });
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    if (!user) {
      showToast('Please sign in to book a consultation');
      return;
    }
    setLoading(true);
    try {
      await api.post('/consultations', {
        lawyerId: lawyer.id,
        date: form.date,
        mode: form.mode,
        notes: form.notes,
        fee: lawyer.feeConsultation,
      });
      showToast('Consultation booked successfully');
      onClose();
    } catch (e) {
      showToast(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {open && lawyer && (
        <>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm" onClick={onClose} />
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 28 }}
            className="fixed bottom-0 left-0 right-0 z-50 rounded-t-2xl border-t p-6 md:left-1/2 md:max-w-lg md:-translate-x-1/2"
            style={{ background: 'var(--bg-surface)', borderColor: 'var(--border-subtle)' }}
          >
            <h3 className="text-xl font-medium" style={{ color: 'var(--text-primary)' }}>Book Consultation</h3>
            <p className="mt-1 text-sm" style={{ color: 'var(--text-secondary)' }}>
              Fee: <span className="amount" style={{ color: 'var(--gold)' }}>₹{lawyer.feeConsultation?.toLocaleString('en-IN')}</span>
            </p>
            <div className="mt-4 space-y-4">
              <input
                type="datetime-local"
                value={form.date}
                disabled={loading}
                onChange={(e) => setForm({ ...form, date: e.target.value })}
                className="w-full rounded-lg border px-4 py-3 disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ background: 'var(--bg-card)', borderColor: 'var(--border-subtle)', color: 'var(--text-primary)' }}
              />
              <div className="flex gap-2">
                {MODES.map((m) => (
                  <button
                    key={m.id}
                    type="button"
                    disabled={loading}
                    onClick={() => setForm({ ...form, mode: m.id })}
                    className="flex flex-1 flex-col items-center gap-1 rounded-lg border py-2 text-sm disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none cursor-pointer"
                    style={{
                      borderColor: form.mode === m.id ? 'var(--gold)' : 'var(--border-subtle)',
                      background: form.mode === m.id ? 'var(--accent-glow)' : 'transparent',
                      color: 'var(--text-primary)',
                    }}
                  >
                    <Icon name={m.icon} size={20} />
                    {m.label}
                  </button>
                ))}
              </div>
              <textarea
                placeholder="Notes for the advocate..."
                value={form.notes}
                disabled={loading}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                rows={3}
                className="w-full rounded-lg border px-4 py-3 disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ background: 'var(--bg-card)', borderColor: 'var(--border-subtle)', color: 'var(--text-primary)' }}
              />
            </div>
            <button
              type="button"
              disabled={loading || !form.date}
              onClick={submit}
              className="btn-primary mt-6 w-full rounded-lg py-3 disabled:opacity-50"
            >
              {loading ? 'Booking…' : 'Confirm Booking'}
            </button>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
