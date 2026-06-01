export default function LawyerFilters({ filters, onChange }) {
  const update = (key, val) => onChange({ ...filters, [key]: val });

  const specs = ['Matrimonial Law', 'Child Custody', 'Domestic Violence', 'Property Division', 'NRI Divorce'];
  const langs = ['Hindi', 'English', 'Telugu', 'Tamil', 'Marathi', 'Kannada', 'Punjabi', 'Bengali'];

  return (
    <div className="space-y-6 rounded-xl border p-5 transition-all duration-300" style={{ background: 'var(--bg-card)', borderColor: 'var(--border-subtle)' }}>
      <h3 className="text-base font-semibold tracking-tight border-b pb-3" style={{ borderColor: 'var(--border-dim)', color: 'var(--text-primary)', fontFamily: 'var(--font-display)' }}>
        Filters
      </h3>
      <div>
        <label className="label-chip mb-2 block" style={{ color: 'var(--text-secondary)' }}>State</label>
        <input
          value={filters.state || ''}
          onChange={(e) => update('state', e.target.value)}
          placeholder="e.g. Delhi"
          className="w-full rounded-lg border px-3.5 py-2 text-sm transition-colors duration-200"
          style={{ background: 'var(--bg-raised)', borderColor: 'var(--border-subtle)', color: 'var(--text-primary)' }}
        />
      </div>
      <div>
        <label className="label-chip mb-2 block" style={{ color: 'var(--text-secondary)' }}>City</label>
        <input
          value={filters.city || ''}
          onChange={(e) => update('city', e.target.value)}
          placeholder="e.g. New Delhi"
          className="w-full rounded-lg border px-3.5 py-2 text-sm transition-colors duration-200"
          style={{ background: 'var(--bg-raised)', borderColor: 'var(--border-subtle)', color: 'var(--text-primary)' }}
        />
      </div>
      <div>
        <label className="label-chip mb-2 block" style={{ color: 'var(--text-secondary)' }}>Specialization</label>
        <div className="flex flex-wrap gap-1.5">
          {specs.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => {
                const cur = filters.specialization?.split(',').filter(Boolean) || [];
                const next = cur.includes(s) ? cur.filter((x) => x !== s) : [...cur, s];
                update('specialization', next.join(','));
              }}
              className="rounded px-2.5 py-1 text-xs transition-colors duration-200 cursor-pointer"
              style={{
                background: filters.specialization?.includes(s) ? 'var(--gold)' : 'var(--bg-overlay)',
                color: filters.specialization?.includes(s) ? 'var(--btn-on-accent)' : 'var(--text-secondary)',
                border: '1px solid var(--border-dim)'
              }}
            >
              {s.split(' ')[0]}
            </button>
          ))}
        </div>
      </div>
      <div>
        <label className="label-chip mb-2 block" style={{ color: 'var(--text-secondary)' }}>Language</label>
        <div className="flex flex-wrap gap-1.5">
          {langs.map((l) => (
            <button
              key={l}
              type="button"
              onClick={() => update('language', filters.language === l ? '' : l)}
              className="rounded px-2.5 py-1 text-xs transition-colors duration-200 cursor-pointer"
              style={{
                background: filters.language === l ? 'var(--gold)' : 'var(--bg-overlay)',
                color: filters.language === l ? 'var(--btn-on-accent)' : 'var(--text-secondary)',
                border: '1px solid var(--border-dim)'
              }}
            >
              {l}
            </button>
          ))}
        </div>
      </div>
      <div className="border-t pt-4" style={{ borderColor: 'var(--border-dim)' }}>
        <label className="label-chip mb-2 block flex justify-between" style={{ color: 'var(--text-secondary)' }}>
          <span>Max Hourly Fee</span>
          <span className="mono" style={{ color: 'var(--gold)' }}>₹{filters.maxFee || 10000}/hr</span>
        </label>
        <input
          type="range"
          min={0}
          max={10000}
          step={500}
          value={filters.maxFee || 10000}
          onChange={(e) => update('maxFee', e.target.value)}
          className="w-full accent-[var(--gold)] bg-neutral-800 cursor-pointer h-1.5 rounded-lg"
        />
      </div>
      <div className="space-y-3 border-t pt-4" style={{ borderColor: 'var(--border-dim)' }}>
        <label className="flex items-center gap-2.5 text-sm cursor-pointer select-none" style={{ color: 'var(--text-secondary)' }}>
          <input 
            type="checkbox" 
            checked={filters.available === 'true'} 
            onChange={(e) => update('available', e.target.checked ? 'true' : '')} 
            className="accent-[var(--gold)] h-4 w-4 rounded border-gray-300 focus:ring-gold cursor-pointer"
          />
          Available now
        </label>
        <label className="flex items-center gap-2.5 text-sm cursor-pointer select-none block" style={{ color: 'var(--text-secondary)' }}>
          <input 
            type="checkbox" 
            checked={filters.verified === 'true'} 
            onChange={(e) => update('verified', e.target.checked ? 'true' : '')} 
            className="accent-[var(--gold)] h-4 w-4 rounded border-gray-300 focus:ring-gold cursor-pointer"
          />
          Verified only
        </label>
      </div>
    </div>
  );
}
