import ThemeToggle from '../components/ui/ThemeToggle';
import { useAuthStore } from '../store/useAuthStore';
import { useThemeStore } from '../store/useThemeStore';

export default function Settings() {
  const { user, logout } = useAuthStore();
  const { theme } = useThemeStore();

  return (
    <div className="mx-auto max-w-lg">
      <h1 className="text-3xl">Settings</h1>
      <div className="mt-8 space-y-6">
        <div className="flex items-center justify-between rounded-xl border p-5" style={{ borderColor: 'var(--border-subtle)' }}>
          <div>
            <p className="font-medium">Theme</p>
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Currently {theme}</p>
          </div>
          <ThemeToggle />
        </div>
        {user && (
          <div className="rounded-xl border p-5" style={{ borderColor: 'var(--border-subtle)' }}>
            <p className="font-medium">{user.firstName} {user.lastName}</p>
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>{user.email}</p>
            <button type="button" onClick={logout} className="mt-4 text-sm" style={{ color: 'var(--red)' }}>Sign out</button>
          </div>
        )}
      </div>
    </div>
  );
}
