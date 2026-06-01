import { Link, useLocation } from 'react-router-dom';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ThemeToggle from '../ui/ThemeToggle';
import Icon from '../ui/Icon';
import { useAuthStore } from '../../store/useAuthStore';

const NAV = [
  { to: '/calculator', label: 'Calculator' },
  { to: '/lawyers', label: 'Lawyers' },
  { to: '/library', label: 'Library' },
  { to: '/ai', label: 'Lex AI' },
  { to: '/cases', label: 'Cases' },
];

export default function Navbar({ minimal = false }) {
  const { pathname } = useLocation();
  const { user, logout } = useAuthStore();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <nav className="app-nav sticky top-0 z-50 flex items-center justify-between px-4 py-4 md:px-8">
      <Link to="/" className="brand text-xl font-bold" style={{ color: 'var(--text-primary)' }}>
        <span style={{ color: 'var(--gold)' }}>Alimony</span>
        <span>.AI</span>
      </Link>

      {!minimal && (
        <div className="hidden items-center gap-8 md:flex">
          {NAV.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className="text-sm font-medium transition-colors"
              style={{ color: pathname.startsWith(item.to) ? 'var(--gold)' : 'var(--text-secondary)' }}
            >
              {item.label}
            </Link>
          ))}
        </div>
      )}

      <div className="flex items-center gap-3">
        <ThemeToggle />
        {user ? (
          <>
            <Link
              to="/dashboard"
              className="hidden text-sm md:block"
              style={{ color: 'var(--text-secondary)' }}
            >
              {user.firstName}
            </Link>
            <button
              type="button"
              onClick={logout}
              className="hidden text-sm md:block"
              style={{ color: 'var(--text-muted)' }}
            >
              Sign out
            </button>
          </>
        ) : (
          <>
            <Link
              to="/login"
              className="hidden text-sm md:block"
              style={{ color: 'var(--text-secondary)' }}
            >
              Sign In
            </Link>
            <Link to="/register" className="btn-primary rounded-lg px-4 py-2 text-sm">
              Get Started
            </Link>
          </>
        )}
        {!minimal && (
          <button
            type="button"
            className="flex md:hidden"
            style={{ color: 'var(--text-primary)' }}
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Open menu"
          >
            <Icon name="menu" size={24} />
          </button>
        )}
      </div>

      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm md:hidden"
              onClick={() => setMobileOpen(false)}
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25 }}
              className="fixed right-0 top-0 z-50 flex h-full w-72 flex-col gap-4 p-6 md:hidden"
              style={{ background: 'var(--bg-surface)', borderLeft: '1px solid var(--border-subtle)' }}
            >
              {NAV.map((item) => (
                <Link
                  key={item.to}
                  to={item.to}
                  onClick={() => setMobileOpen(false)}
                  className="text-base font-medium"
                  style={{
                    color: pathname.startsWith(item.to) ? 'var(--gold)' : 'var(--text-primary)',
                  }}
                >
                  {item.label}
                </Link>
              ))}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </nav>
  );
}
