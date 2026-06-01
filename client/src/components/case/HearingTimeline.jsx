export default function HearingTimeline({ hearings = [] }) {
  if (!hearings.length) {
    return <p className="text-sm italic" style={{ color: 'var(--text-muted)' }}>No hearings recorded yet.</p>;
  }

  return (
    <div className="relative space-y-6 pl-6">
      <div className="absolute bottom-0 left-2 top-0 w-px" style={{ background: 'var(--border-subtle)' }} />
      {hearings.map((h, i) => (
        <div key={h.id || i} className="relative">
          <div
            className="absolute -left-6 top-1 h-3 w-3 rounded-full border-2"
            style={{ borderColor: 'var(--gold)', background: 'var(--bg-base)' }}
          />
          <p className="mono text-xs" style={{ color: 'var(--gold)' }}>
            {new Date(h.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
          </p>
          <p className="mt-1 font-medium">{h.court}</p>
          {h.judge && <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{h.judge}</p>}
          {h.outcome && <p className="mt-2 text-sm">{h.outcome}</p>}
          {h.nextDate && (
            <p className="mono mt-1 text-xs" style={{ color: 'var(--text-muted)' }}>
              Next: {new Date(h.nextDate).toLocaleDateString('en-IN')}
            </p>
          )}
        </div>
      ))}
    </div>
  );
}
