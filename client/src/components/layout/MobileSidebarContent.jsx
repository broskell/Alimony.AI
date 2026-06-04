import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuthStore } from '../../store/useAuthStore';
import Icon from '../ui/Icon';

const GROUPS = [
  {
    title: 'Core Services',
    items: [
      { to: '/dashboard', label: 'Dashboard', icon: 'dashboard' },
      { to: '/calculator', label: 'Calculator', icon: 'calculate' },
      { to: '/results', label: 'Results', icon: 'analytics' },
    ],
  },
  {
    title: 'Matrimonial Matters',
    items: [
      { to: '/lawyers', label: 'Lawyers', icon: 'gavel' },
      { to: '/cases', label: 'My Cases', icon: 'folder_open' },
      { to: '/documents', label: 'Documents', icon: 'description' },
    ],
  },
  {
    title: 'Resources',
    items: [
      { to: '/library', label: 'Legal Library', icon: 'menu_book' },
      { to: '/ai', label: 'Lex AI', icon: 'smart_toy' },
      { to: '/settings', label: 'Settings', icon: 'settings' },
    ],
  },
];

export default function MobileSidebarContent({ onClose }) {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const handleLinkClick = (to) => {
    onClose();
    navigate(to);
  };

  const handleLogout = () => {
    logout();
    onClose();
  };

  return (
    <div 
      className="flex h-full w-full flex-col p-5 shadow-2xl relative overflow-y-auto"
      style={{
        paddingTop: 'calc(1.5rem + env(safe-area-inset-top))',
        paddingBottom: 'calc(1.5rem + env(safe-area-inset-bottom))',
      }}
    >
      {/* Header Profile Section */}
      <div className="mb-6 mt-6 flex items-center gap-3 border-b pb-5" style={{ borderColor: 'var(--border-dim)' }}>
        {user ? (
          <>
            <div 
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-sm font-semibold shadow-inner"
              style={{ background: 'var(--gold)', color: 'var(--btn-on-accent)' }}
            >
              {user.firstName ? `${user.firstName[0]}${user.lastName ? user.lastName[0] : ''}`.toUpperCase() : 'U'}
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-sm font-semibold truncate" style={{ color: 'var(--text-primary)' }}>
                {user.firstName} {user.lastName}
              </span>
              <span className="text-xs truncate" style={{ color: 'var(--text-secondary)' }}>
                {user.email}
              </span>
            </div>
          </>
        ) : (
          <>
            <div 
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-sm font-semibold"
              style={{ background: 'var(--bg-overlay)', color: 'var(--text-secondary)' }}
            >
              G
            </div>
            <div className="flex flex-col min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="text-sm font-semibold truncate" style={{ color: 'var(--text-primary)' }}>
                  Guest User
                </span>
                <span 
                  className="rounded px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider shrink-0"
                  style={{ background: 'rgba(201, 168, 76, 0.15)', color: 'var(--gold)' }}
                >
                  Guest
                </span>
              </div>
              <span className="text-xs truncate" style={{ color: 'var(--text-muted)' }}>
                matrimonial law guidance
              </span>
            </div>
          </>
        )}
      </div>

      {/* Grouped Navigation Links */}
      <div className="flex-1 space-y-5">
        {GROUPS.map((group) => (
          <div key={group.title} className="space-y-1">
            <h4 className="text-[10px] font-semibold uppercase tracking-wider px-2" style={{ color: 'var(--text-muted)' }}>
              {group.title}
            </h4>
            <nav className="flex flex-col gap-1">
              {group.items.map((link) => {
                const isActive = pathname.startsWith(link.to);
                return (
                  <button
                    key={link.to}
                    type="button"
                    onClick={() => handleLinkClick(link.to)}
                    className="flex w-full items-center gap-3.5 rounded-xl px-4 text-sm font-medium transition-all cursor-pointer min-h-[48px] h-12 text-left"
                    style={{
                      background: isActive ? 'rgba(201, 168, 76, 0.12)' : 'transparent',
                      color: isActive ? 'var(--gold)' : 'var(--text-secondary)',
                      borderLeft: isActive ? '3px solid var(--gold)' : '3px solid transparent',
                      paddingLeft: isActive ? '13px' : '16px',
                    }}
                  >
                    <Icon name={link.icon} size={22} className="shrink-0" />
                    <span>{link.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>
        ))}
      </div>

      {/* Footer Section */}
      <div className="mt-6 border-t pt-4 flex flex-col gap-2" style={{ borderColor: 'var(--border-dim)' }}>
        {user ? (
          <button
            type="button"
            onClick={handleLogout}
            className="flex w-full items-center gap-3.5 rounded-xl px-4 py-3 text-sm font-medium transition-colors hover:bg-red-500/10 cursor-pointer text-red-400 min-h-[48px] h-12"
          >
            <Icon name="logout" size={22} />
            <span>Sign Out</span>
          </button>
        ) : (
          <div className="flex gap-2 w-full pt-1">
            <button
              type="button"
              onClick={() => handleLinkClick('/login')}
              className="btn-ghost flex-1 text-center rounded-lg flex items-center justify-center text-xs font-semibold cursor-pointer min-h-[48px] h-12"
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => handleLinkClick('/register')}
              className="btn-primary flex-1 text-center rounded-lg flex items-center justify-center text-xs font-semibold cursor-pointer min-h-[48px] h-12"
            >
              Sign Up
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
