import { Link, useLocation } from 'react-router-dom';
import { useState } from 'react';
import ThemeToggle from '../ui/ThemeToggle';
import Icon from '../ui/Icon';
import { Sheet, SheetContent } from '../ui/sheet';
import MobileSidebarContent from './MobileSidebarContent';
import { useAuthStore } from '../../store/useAuthStore';

const NAV = [
  { to: '/calculator', label: 'Calculator' },
  { to: '/lawyers', label: 'Lawyers' },
  { to: '/library', label: 'Library' },
  { to: '/ai', label: 'Lex AI' },
  { to: '/cases', label: 'Cases' },
];

export default function Navbar({ minimal = false, onMenuClick }) {
  const { pathname } = useLocation();
  const { user, logout } = useAuthStore();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <nav className="app-nav sticky top-0 z-50 flex items-center justify-between px-4 py-4 md:px-8">
      <div className="flex items-center gap-3">
        {minimal && onMenuClick && (
          <button
            type="button"
            className="flex lg:hidden mr-1 cursor-pointer"
            style={{ color: 'var(--text-primary)' }}
            onClick={onMenuClick}
            aria-label="Open menu"
          >
            <Icon name="menu" size={24} />
          </button>
        )}
        <Link to="/" className="brand text-xl font-bold" style={{ color: 'var(--text-primary)' }}>
          <span style={{ color: 'var(--gold)' }}>Alimony</span>
          <span>.AI</span>
        </Link>
      </div>

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

      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent side="left" className="w-72 max-w-[85vw] p-0">
          <MobileSidebarContent onClose={() => setMobileOpen(false)} />
        </SheetContent>
      </Sheet>
    </nav>
  );
}
