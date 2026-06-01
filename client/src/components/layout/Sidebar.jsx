import { NavLink } from 'react-router-dom';
import { motion } from 'framer-motion';
import Icon from '../ui/Icon';

const LINKS = [
  { to: '/dashboard', label: 'Dashboard', icon: 'dashboard' },
  { to: '/calculator', label: 'Calculator', icon: 'calculate' },
  { to: '/results', label: 'Results', icon: 'analytics' },
  { to: '/lawyers', label: 'Lawyers', icon: 'gavel' },
  { to: '/cases', label: 'My Cases', icon: 'folder_open' },
  { to: '/library', label: 'Legal Library', icon: 'menu_book' },
  { to: '/ai', label: 'Lex AI', icon: 'smart_toy' },
  { to: '/documents', label: 'Documents', icon: 'description' },
  { to: '/settings', label: 'Settings', icon: 'settings' },
];

export default function Sidebar() {
  return (
    <motion.aside
      initial={{ x: -24, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      className="hidden w-56 shrink-0 flex-col border-r p-4 lg:flex"
      style={{ borderColor: 'var(--border-dim)', background: 'var(--bg-surface)' }}
    >
      <NavLink to="/" className="brand mb-8 block text-lg font-bold" style={{ color: 'var(--text-primary)' }}>
        <span style={{ color: 'var(--gold)' }}>Alimony</span>.AI
      </NavLink>
      <nav className="flex flex-col gap-1">
        {LINKS.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors"
            style={({ isActive }) => ({
              background: isActive ? 'var(--bg-overlay)' : 'transparent',
              color: isActive ? 'var(--gold)' : 'var(--text-secondary)',
              borderLeft: isActive ? '2px solid var(--gold)' : '2px solid transparent',
            })}
          >
            <Icon name={link.icon} size={18} />
            {link.label}
          </NavLink>
        ))}
      </nav>
    </motion.aside>
  );
}
