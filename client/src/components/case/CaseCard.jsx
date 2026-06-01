import { Link } from 'react-router-dom';
import LawBadge from '../ui/LawBadge';

const STATUS_STYLES = {
  ACTIVE: { color: 'var(--blue)', pulse: true },
  SETTLED: { color: 'var(--green)', pulse: false },
  PENDING: { color: 'var(--gold)', pulse: false },
  DISMISSED: { color: 'var(--text-muted)', pulse: false },
  APPEALED: { color: 'var(--blue)', pulse: false },
};

export default function CaseCard({ caseData }) {
  const st = STATUS_STYLES[caseData.status] || STATUS_STYLES.PENDING;

  return (
    <div className="rounded-xl border p-5 transition-all" style={{ background: 'var(--bg-card)', borderColor: 'var(--border-subtle)' }}>
      <p className="mono text-xs" style={{ color: 'var(--text-muted)' }}>{caseData.caseNumber}</p>
      <h3 className="mt-1 text-lg font-medium">{caseData.title}</h3>
      <p className="mt-1 text-sm" style={{ color: 'var(--text-secondary)' }}>{caseData.court} · {caseData.state}</p>
      <span
        className={`label-chip mt-3 inline-block rounded px-2 py-0.5 ${st.pulse ? 'animate-pulse' : ''}`}
        style={{ background: `${st.color}22`, color: st.color }}
      >
        {caseData.status}
      </span>
      <div className="mt-3 flex flex-wrap gap-1">
        {caseData.acts?.map((a) => <LawBadge key={a} act={a} />)}
      </div>
      <p className="mono mt-3 text-xs" style={{ color: 'var(--text-muted)' }}>
        Filed {new Date(caseData.filingDate).toLocaleDateString('en-IN')}
        {caseData.nextHearing && ` · Next: ${new Date(caseData.nextHearing).toLocaleDateString('en-IN')}`}
      </p>
      {caseData.aiSummary && (
        <p className="mt-2 text-sm italic" style={{ color: 'var(--text-muted)' }}>{caseData.aiSummary}</p>
      )}
      <div className="mt-4 flex gap-2">
        <Link to={`/cases/${caseData.id}`} className="text-sm" style={{ color: 'var(--gold)' }}>View Detail →</Link>
      </div>
    </div>
  );
}
