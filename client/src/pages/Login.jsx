import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuthStore } from '../store/useAuthStore';
import { useAppStore } from '../store/useAppStore';
import { auth, googleProvider, signInWithPopup } from '../lib/firebase';
import api from '../lib/api';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const { login, loading } = useAuthStore();
  const { showToast } = useAppStore();
  const navigate = useNavigate();

  useEffect(() => {
    const savedEmail = localStorage.getItem('alimony_remembered_email');
    if (savedEmail) {
      setEmail(savedEmail);
      setRememberMe(true);
    } else {
      setEmail('client@demo.com');
      setPassword('Demo@1234');
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      showToast('Please fill in all fields', 'warning');
      return;
    }
    try {
      if (rememberMe) {
        localStorage.setItem('alimony_remembered_email', email);
      } else {
        localStorage.removeItem('alimony_remembered_email');
      }
      await login(email, password);
      showToast('Signed in successfully!', 'success');
      navigate('/dashboard');
    } catch (err) {
      showToast(err.message || 'Invalid email or password', 'error');
    }
  };

  const handleGoogleLogin = async () => {
    try {
      if (!auth) {
        // Fallback demo Google Auth
        showToast('Firebase not configured. Signing in with Demo Google account...', 'info');
        const res = await api.post('/auth/google-demo', {
          email: 'google-client@demo.com',
          firstName: 'Google',
          lastName: 'User',
        });
        useAuthStore.getState().setAuth(res.data.token, res.data.user);
        showToast('Signed in with Demo Google account!', 'success');
        navigate('/dashboard');
        return;
      }
      
      const result = await signInWithPopup(auth, googleProvider);
      const idToken = await result.user.getIdToken();
      
      const firstName = result.user.displayName?.split(' ')[0] || 'Google';
      const lastName = result.user.displayName?.split(' ').slice(1).join(' ') || 'User';

      const { data } = await api.post('/auth/google', {
        idToken,
        firstName,
        lastName,
      });

      useAuthStore.getState().setAuth(data.token, data.user);
      showToast('Signed in successfully with Google!', 'success');
      navigate('/dashboard');
    } catch (error) {
      console.error('Google Auth Error:', error);
      if (error.code === 'auth/popup-closed-by-user') {
        showToast('Google login popup was closed before completing.', 'warning');
      } else if (error.code === 'auth/account-exists-with-different-credential') {
        showToast('An account already exists with this email.', 'error');
      } else if (error.code === 'auth/network-request-failed') {
        showToast('Network error during Google authentication.', 'error');
      } else {
        showToast(error.message || 'Google Authentication failed', 'error');
      }
    }
  };

  const handleForgotPassword = () => {
    if (!email) {
      showToast('Please enter your email address first.', 'info');
      return;
    }
    showToast(`Password reset link sent to: ${email} (Demo mode)`, 'success');
  };

  return (
    <div className="flex min-h-screen flex-col lg:flex-row" style={{ background: 'var(--bg-base)' }}>
      {/* LEFT SIDE - Split screen brand layout (50%) */}
      <div className="relative flex flex-col justify-between overflow-hidden p-8 lg:w-1/2 lg:p-16" style={{ background: 'radial-gradient(circle at 10% 10%, #1a1510, #080810)' }}>
        {/* Subtle Animated Glow Effect */}
        <div className="absolute inset-0 pointer-events-none opacity-20">
          <motion.div 
            animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.6, 0.3] }}
            transition={{ repeat: Infinity, duration: 8, ease: "easeInOut" }}
            className="absolute top-1/4 left-1/4 h-72 w-72 rounded-full blur-[120px]" 
            style={{ background: 'var(--gold)' }}
          />
          <motion.div 
            animate={{ scale: [1.2, 1, 1.2], opacity: [0.2, 0.4, 0.2] }}
            transition={{ repeat: Infinity, duration: 10, ease: "easeInOut" }}
            className="absolute bottom-1/4 right-1/4 h-80 w-80 rounded-full blur-[140px]" 
            style={{ background: 'var(--gold)' }}
          />
        </div>

        {/* Brand logo */}
        <div className="relative z-10">
          <Link to="/" className="text-xl font-bold tracking-tight" style={{ color: 'var(--text-primary)' }}>
            <span style={{ color: 'var(--gold)' }}>Alimony</span>.AI
          </Link>
        </div>

        {/* Content & features */}
        <div className="relative z-10 my-auto py-12 max-w-lg">
          <motion.h2 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-3xl font-extrabold tracking-tight sm:text-4xl lg:text-5xl"
            style={{ color: 'var(--text-primary)', lineHeight: 1.25 }}
          >
            Understand Alimony.<br />
            Predict Outcomes.<br />
            <span style={{ color: 'var(--gold)' }}>Find Legal Help.</span>
          </motion.h2>

          <motion.p 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.15 }}
            className="mt-6 text-sm sm:text-base font-light leading-relaxed" 
            style={{ color: 'var(--text-secondary)' }}
          >
            India's AI-powered family law platform combining alimony estimation, legal guidance, case tracking, and verified lawyer discovery.
          </motion.p>

          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="mt-10 space-y-4"
          >
            {[
              { label: 'AI Family Law Assistant', icon: '✨' },
              { label: 'Rajnesh v Neha Alimony Calculator', icon: '⚖️' },
              { label: 'Verified Lawyer Directory', icon: '✓' }
            ].map((feat) => (
              <div key={feat.label} className="flex items-center gap-3">
                <span className="flex h-5 w-5 items-center justify-center rounded-full text-xs font-bold" style={{ background: 'rgba(201, 168, 76, 0.15)', color: 'var(--gold)' }}>
                  {feat.icon}
                </span>
                <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{feat.label}</span>
              </div>
            ))}
          </motion.div>
        </div>

        {/* Trust Badges */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.45 }}
          className="relative z-10 grid grid-cols-3 gap-4 border-t pt-8" 
          style={{ borderColor: 'var(--border-dim)' }}
        >
          {[
            { metric: '5000+', label: 'calculations' },
            { metric: 'Verified', label: 'advocates' },
            { metric: 'Secure', label: '& private' }
          ].map((badge) => (
            <div key={badge.label} className="text-left">
              <p className="text-base font-bold sm:text-lg" style={{ color: 'var(--gold)' }}>{badge.metric}</p>
              <p className="text-[10px] uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>{badge.label}</p>
            </div>
          ))}
        </motion.div>
      </div>

      {/* RIGHT SIDE - Form layout (50%) */}
      <div className="flex flex-col justify-center px-6 py-12 lg:w-1/2 lg:px-16" style={{ background: 'var(--bg-base)' }}>
        <div className="mx-auto w-full max-w-md space-y-8">
          <div className="text-center lg:text-left">
            <h1 className="text-2xl font-bold sm:text-3xl" style={{ color: 'var(--text-primary)' }}>Sign In</h1>
            <p className="mt-2 text-xs sm:text-sm" style={{ color: 'var(--text-secondary)' }}>
              Demo access: <span className="font-mono text-xs" style={{ color: 'var(--gold)' }}>client@demo.com</span> / <span className="font-mono text-xs" style={{ color: 'var(--gold)' }}>Demo@1234</span>
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-xs uppercase tracking-wider mb-2" style={{ color: 'var(--text-secondary)' }}>Email Address</label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  required
                  autoComplete="email"
                  className="w-full rounded-lg border px-4 py-3 text-sm transition-all focus:border-[var(--gold)] focus:ring-1 focus:ring-[var(--gold)]"
                  style={{ background: 'var(--bg-card)', borderColor: 'var(--border-subtle)', color: 'var(--text-primary)' }}
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-xs uppercase tracking-wider mb-2" style={{ color: 'var(--text-secondary)' }}>Password</label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  autoComplete="current-password"
                  className="w-full rounded-lg border px-4 py-3 text-sm transition-all focus:border-[var(--gold)] focus:ring-1 focus:ring-[var(--gold)]"
                  style={{ background: 'var(--bg-card)', borderColor: 'var(--border-subtle)', color: 'var(--text-primary)' }}
                />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 text-xs sm:text-sm cursor-pointer select-none" style={{ color: 'var(--text-secondary)' }}>
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded border-neutral-700 bg-neutral-900 text-[var(--gold)] focus:ring-offset-0 focus:ring-0"
                />
                Remember Me
              </label>

              <button
                type="button"
                onClick={handleForgotPassword}
                className="text-xs sm:text-sm transition-colors hover:underline"
                style={{ color: 'var(--gold)' }}
              >
                Forgot Password?
              </button>
            </div>

            <div className="space-y-4 pt-2">
              <button
                type="submit"
                disabled={loading}
                className="btn-primary flex w-full justify-center rounded-lg py-3.5 text-sm font-medium transition-all duration-200 disabled:opacity-50"
              >
                {loading ? 'Signing in…' : 'Sign In'}
              </button>

              <div className="relative flex py-2 items-center">
                <div className="flex-grow border-t" style={{ borderColor: 'var(--border-dim)' }}></div>
                <span className="flex-shrink mx-4 text-xs" style={{ color: 'var(--text-muted)' }}>or</span>
                <div className="flex-grow border-t" style={{ borderColor: 'var(--border-dim)' }}></div>
              </div>

              {/* Official Google Brand Button */}
              <button
                type="button"
                onClick={handleGoogleLogin}
                className="flex w-full items-center justify-center gap-3 rounded-lg border px-4 py-3 text-sm font-semibold transition-all hover:bg-neutral-100 dark:hover:bg-neutral-800/50 cursor-pointer"
                style={{ borderColor: 'var(--border-subtle)', background: 'var(--bg-card)', color: 'var(--text-primary)' }}
              >
                <svg className="h-5 w-5 shrink-0" viewBox="0 0 24 24" width="20" height="20" xmlns="http://www.w3.org/2000/svg">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335"/>
                </svg>
                Continue with Google
              </button>
            </div>
          </form>

          <p className="mt-8 text-center text-xs sm:text-sm" style={{ color: 'var(--text-secondary)' }}>
            Don't have an account?{' '}
            <Link to="/register" style={{ color: 'var(--gold)', fontWeight: 500 }} className="hover:underline">
              Create one
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
