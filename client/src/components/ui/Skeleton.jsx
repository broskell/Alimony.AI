export default function Skeleton({ className = '', width, height }) {
  return (
    <div
      className={`animate-pulse rounded ${className}`}
      style={{
        width: width || '100%',
        height: height || '1rem',
        background: 'var(--bg-overlay)',
      }}
    />
  );
}
