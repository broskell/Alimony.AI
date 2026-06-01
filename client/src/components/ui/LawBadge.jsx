export default function LawBadge({ act, section, label }) {
  return (
    <span
      className="label-chip inline-flex items-center rounded px-2 py-0.5"
      style={{
        background: 'var(--bg-overlay)',
        border: '1px solid var(--border-subtle)',
        color: 'var(--gold)',
      }}
    >
      {label || `${act}${section ? ` §${section}` : ''}`}
    </span>
  );
}
