export default function BreakdownTable({ breakdown = [] }) {
  return (
    <div className="overflow-hidden rounded-xl border" style={{ borderColor: 'var(--border-subtle)' }}>
      <table className="w-full text-sm">
        <thead>
          <tr style={{ background: 'var(--bg-overlay)' }}>
            <th className="label-chip px-4 py-3 text-left" style={{ color: 'var(--text-muted)' }}>Factor</th>
            <th className="label-chip px-4 py-3 text-left" style={{ color: 'var(--text-muted)' }}>Value</th>
            <th className="label-chip px-4 py-3 text-right" style={{ color: 'var(--text-muted)' }}>Modifier</th>
          </tr>
        </thead>
        <tbody>
          {breakdown.map((row, i) => (
            <tr key={i} style={{ borderTop: '1px solid var(--border-dim)' }}>
              <td className="px-4 py-3">{row.factor}</td>
              <td className="mono px-4 py-3 capitalize" style={{ color: 'var(--text-secondary)' }}>{String(row.value)}</td>
              <td className="mono px-4 py-3 text-right" style={{ color: 'var(--gold)' }}>{row.modifier}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
