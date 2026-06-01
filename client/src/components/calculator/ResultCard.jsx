import ScoreRing from '../ui/ScoreRing';
import LawBadge from '../ui/LawBadge';

export default function ResultCard({ result, compact = false }) {
  if (!result) return null;
  const isClaimant = result.role === 'claimant';

  return (
    <div
      className="rounded-xl border p-6 md:p-8"
      style={{ background: 'var(--bg-card)', borderColor: 'var(--border-subtle)' }}
    >
      <p className="label-chip mb-2" style={{ color: 'var(--gold)' }}>
        {result.verdictLabel || 'MONTHLY MAINTENANCE'}
      </p>
      <div className={`flex ${compact ? 'flex-col gap-4' : 'flex-wrap items-end justify-between gap-6'}`}>
        <div>
          <p
            className="amount text-5xl font-bold md:text-7xl"
            style={{ color: isClaimant ? 'var(--gold)' : 'var(--red)' }}
          >
            ₹{result.monthly?.toLocaleString('en-IN')}
          </p>
          <p className="mt-2 text-sm" style={{ color: 'var(--text-secondary)' }}>
            /month · {result.duration}-year term · {result.stateNote}
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <LawBadge label={`${result.section}`} />
          </div>
          <p className="mono mt-3 text-xs" style={{ color: 'var(--text-muted)' }}>
            Based on {result.supremeCourtRef}
          </p>
        </div>
        {!compact && <ScoreRing score={result.score || 0} size={140} />}
      </div>
    </div>
  );
}
