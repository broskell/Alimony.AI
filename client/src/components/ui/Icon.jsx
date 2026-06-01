/** Google Material Symbols Outlined */
export default function Icon({ name, className = '', size = 20, filled = false }) {
  return (
    <span
      className={`material-symbols-${filled ? 'rounded' : 'outlined'} inline-flex items-center justify-center ${className}`}
      style={{
        fontSize: size,
        width: size,
        height: size,
        lineHeight: 1,
        fontVariationSettings: filled ? "'FILL' 1" : "'FILL' 0",
      }}
      aria-hidden={!className.includes('sr-only')}
    >
      {name}
    </span>
  );
}
