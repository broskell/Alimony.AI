import { Link } from 'react-router-dom';

const ShieldCheckIcon = ({ className = "h-4 w-4" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.57-.598-3.75h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
  </svg>
);

const StarIcon = ({ className = "h-4 w-4" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path fillRule="evenodd" d="M10.788 2.903a.75.75 0 0 1 1.424 0l2.082 5.006 5.404.434a.75.75 0 0 1 .416 1.353l-4.133 3.653 1.22 5.24a.75.75 0 0 1-1.127.818L12 18.254l-4.664 2.654c-.628.358-1.357-.172-1.127-.818l1.22-5.24L3.306 9.697a.75.75 0 0 1 .416-1.353l5.404-.434 2.082-5.005Z" clipRule="evenodd" />
  </svg>
);

export default function LawyerCard({ lawyer, onBook }) {
  const name = lawyer.user ? `${lawyer.user.firstName} ${lawyer.user.lastName}` : 'Advocate';
  const initial = name.charAt(0);

  return (
    <div
      className="group flex flex-col h-full rounded-xl border p-5 transition-all duration-300 hover:-translate-y-1"
      style={{
        background: 'var(--bg-card)',
        borderColor: 'var(--border-subtle)',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = 'var(--gold)';
        e.currentTarget.style.boxShadow = '0 12px 40px var(--accent-glow)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = 'var(--border-subtle)';
        e.currentTarget.style.boxShadow = 'none';
      }}
    >
      {/* Header: Avatar and Verified badge */}
      <div className="flex items-center justify-between mb-4">
        <div
          className="flex h-12 w-12 items-center justify-center rounded-full text-lg font-semibold shadow-inner"
          style={{ background: 'var(--bg-overlay)', color: 'var(--gold)' }}
        >
          {initial}
        </div>
        {lawyer.verified && (
          <span 
            className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-3 py-1 text-xs font-semibold shadow-sm transition-all"
            style={{ background: 'var(--gold)', color: 'var(--btn-on-accent)' }}
          >
            <ShieldCheckIcon className="h-3.5 w-3.5" />
            Verified
          </span>
        )}
      </div>

      {/* Body Section */}
      <div className="flex-1 flex flex-col">
        <h3 className="text-lg font-bold tracking-tight" style={{ color: 'var(--text-primary)' }}>
          Adv. {name}
        </h3>
        <p className="font-mono mt-1 text-[11px] uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
          {lawyer.barNumber}
        </p>
        
        <p className="mt-2 text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
          {lawyer.court} · <span className="font-medium">Enrolled {lawyer.enrollmentYear}</span>
        </p>

        {/* Rating row */}
        <div className="mt-2.5 flex items-center gap-1.5 text-sm font-semibold" style={{ color: 'var(--gold)' }}>
          <StarIcon className="h-4 w-4 fill-current" />
          <span>{lawyer.rating?.toFixed(1) || '0.0'}</span>
          <span className="text-xs font-normal" style={{ color: 'var(--text-secondary)' }}>
            ({lawyer.reviewCount || 0} reviews)
          </span>
        </div>

        {/* Practice Area Tags */}
        <div className="mt-4 flex flex-wrap gap-1.5">
          {lawyer.specializations?.slice(0, 3).map((s) => (
            <span 
              key={s} 
              className="inline-flex rounded-full px-2.5 py-0.5 text-[10px] font-medium transition-all" 
              style={{ background: 'var(--bg-overlay)', color: 'var(--text-secondary)' }}
            >
              {s}
            </span>
          ))}
        </div>

        {/* Languages */}
        {lawyer.languages && lawyer.languages.length > 0 && (
          <p className="mt-3 text-xs leading-normal font-light" style={{ color: 'var(--text-secondary)' }}>
            <span className="font-medium" style={{ color: 'var(--text-muted)' }}>Languages: </span>
            {lawyer.languages.join(' · ')}
          </p>
        )}
      </div>

      {/* Footer Section (Pinned to Bottom) */}
      <div className="mt-6 pt-4 border-t" style={{ borderColor: 'var(--border-dim)' }}>
        <div className="flex items-baseline justify-between mb-4">
          <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>Hourly Rate</span>
          <p className="text-xl font-extrabold tracking-tight" style={{ color: 'var(--gold)' }}>
            ₹{lawyer.feePerHour?.toLocaleString('en-IN') || '0'}<span className="text-xs font-normal" style={{ color: 'var(--text-secondary)' }}>/hr</span>
          </p>
        </div>
        
        <div className="flex gap-3">
          <Link
            to={`/lawyers/${lawyer.id}`}
            className="btn-ghost flex-1 rounded-lg py-2.5 text-center text-xs font-semibold tracking-wide transition-all hover:bg-neutral-800"
          >
            View Profile
          </Link>
          <button
            type="button"
            onClick={() => onBook?.(lawyer)}
            className="btn-primary flex-1 rounded-lg py-2.5 text-xs font-bold tracking-wide shadow-lg cursor-pointer"
          >
            Book
          </button>
        </div>
      </div>
    </div>
  );
}
