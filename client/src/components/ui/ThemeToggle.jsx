import { motion } from 'framer-motion';
import { useThemeStore } from '../../store/useThemeStore';
import Icon from './Icon';

export default function ThemeToggle({ className = '' }) {
  const { theme, toggleTheme } = useThemeStore();
  const isDark = theme === 'dark';

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className={`flex h-9 w-9 items-center justify-center rounded-lg border transition-colors ${className}`}
      style={{ borderColor: 'var(--border-subtle)', background: 'var(--bg-raised)', color: 'var(--text-primary)' }}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      <motion.span
        key={theme}
        initial={{ rotateY: 90, opacity: 0 }}
        animate={{ rotateY: 0, opacity: 1 }}
        transition={{ duration: 0.25 }}
        className="flex items-center justify-center"
      >
        <Icon name={isDark ? 'light_mode' : 'dark_mode'} size={20} />
      </motion.span>
    </button>
  );
}
