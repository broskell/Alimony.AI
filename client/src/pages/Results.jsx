import { Link } from 'react-router-dom';
import { useAppStore } from '../store/useAppStore';
import { useAuthStore } from '../store/useAuthStore';
import ResultCard from '../components/calculator/ResultCard';
import BreakdownTable from '../components/calculator/BreakdownTable';
import StreamingText from '../components/ui/StreamingText';
import api from '../lib/api';

export default function Results() {
  const { lastCalculation, showToast } = useAppStore();
  const { user } = useAuthStore();
  const result = lastCalculation;

  if (!result) {
    return (
      <div className="text-center py-20">
        <p style={{ color: 'var(--text-secondary)' }}>No calculation yet.</p>
        <Link to="/calculator" className="mt-4 inline-block" style={{ color: 'var(--gold)' }}>Run Calculator →</Link>
      </div>
    );
  }

  const downloadPdf = async () => {
    if (!result.id || result.id.startsWith('guest')) {
      showToast(user ? 'Recalculate to save first' : 'Sign in to download PDF');
      return;
    }
    try {
      const res = await api.get(`/calculator/${result.id}/pdf`, { responseType: 'blob' });
      const url = URL.createObjectURL(res.data);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'alimony-report.pdf';
      a.click();
    } catch (e) {
      showToast(e.message);
    }
  };

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      <ResultCard result={result} />
      <div className="grid gap-4 sm:grid-cols-3">
        {[
          ['Annual Total', `₹${result.annual?.toLocaleString('en-IN')}`],
          ['Duration', `${result.duration} years`],
          ['Total Payout', `₹${result.total?.toLocaleString('en-IN')}`],
        ].map(([l, v]) => (
          <div key={l} className="rounded-xl border p-4 text-center" style={{ background: 'var(--bg-card)', borderColor: 'var(--border-subtle)' }}>
            <p className="label-chip text-[10px]" style={{ color: 'var(--text-muted)' }}>{l}</p>
            <p className="amount mt-2 text-xl" style={{ color: 'var(--gold)' }}>{v}</p>
          </div>
        ))}
      </div>
      <div>
        <h2 className="mb-4 text-xl">Calculation Breakdown</h2>
        <BreakdownTable breakdown={result.breakdown} />
      </div>
      {result.aiRecommendation && (
        <div className="rounded-xl border p-6 italic" style={{ background: 'var(--bg-card)', borderColor: 'var(--border-subtle)' }}>
          <h2 className="mb-3 text-lg not-italic">AI Recommendation</h2>
          <StreamingText text={result.aiRecommendation} className="font-light text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }} />
        </div>
      )}
      <div className="flex flex-wrap gap-3">
        <button type="button" onClick={downloadPdf} className="btn-primary rounded-lg px-5 py-2">Download PDF</button>
        <Link to="/ai" className="rounded-lg border px-5 py-2" style={{ borderColor: 'var(--border-subtle)' }}>Talk to Lex</Link>
        <Link to="/lawyers" className="rounded-lg border px-5 py-2" style={{ borderColor: 'var(--border-subtle)' }}>Find a Lawyer</Link>
      </div>
    </div>
  );
}
