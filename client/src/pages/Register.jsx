import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore } from '../store/useAuthStore';
import { useAppStore } from '../store/useAppStore';
import { auth, googleProvider, signInWithPopup } from '../lib/firebase';
import api from '../lib/api';

const INDIAN_STATES = [
  'Delhi', 'Maharashtra', 'Karnataka', 'Tamil Nadu', 'Telangana', 
  'Andhra Pradesh', 'Gujarat', 'West Bengal', 'Uttar Pradesh', 
  'Kerala', 'Punjab', 'Rajasthan', 'Haryana', 'Madhya Pradesh'
];

const STATE_CITIES = {
  'Delhi': ['New Delhi', 'South Delhi', 'Dwarka', 'Rohini', 'Vasant Kunj'],
  'Maharashtra': ['Mumbai', 'Pune', 'Nagpur', 'Thane', 'Nashik', 'Navi Mumbai'],
  'Karnataka': ['Bangalore', 'Mysore', 'Hubli', 'Mangalore', 'Belgaum'],
  'Tamil Nadu': ['Chennai', 'Coimbatore', 'Madurai', 'Trichy', 'Salem'],
  'Telangana': ['Hyderabad', 'Warangal', 'Nizamabad', 'Karimnagar', 'Khammam'],
  'Andhra Pradesh': ['Visakhapatnam', 'Vijayawada', 'Guntur', 'Nellore', 'Tirupati'],
  'Gujarat': ['Ahmedabad', 'Surat', 'Vadodara', 'Rajkot', 'Gandhinagar'],
  'West Bengal': ['Kolkata', 'Howrah', 'Durgapur', 'Asansol', 'Siliguri'],
  'Uttar Pradesh': ['Lucknow', 'Noida', 'Kanpur', 'Ghaziabad', 'Agra', 'Varanasi'],
  'Kerala': ['Kochi', 'Trivandrum', 'Kozhikode', 'Thrissur', 'Kollam'],
  'Punjab': ['Ludhiana', 'Amritsar', 'Jalandhar', 'Patiala', 'Mohali'],
  'Rajasthan': ['Jaipur', 'Jodhpur', 'Udaipur', 'Kota', 'Ajmer'],
  'Haryana': ['Gurugram', 'Faridabad', 'Panipat', 'Ambala', 'Karnal'],
  'Madhya Pradesh': ['Indore', 'Bhopal', 'Jabalpur', 'Gwalior', 'Ujjain']
};

export default function Register() {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    state: 'Delhi',
    city: '',
    password: '',
    confirmPassword: ''
  });

  const { register, loading } = useAuthStore();
  const { showToast } = useAppStore();
  const navigate = useNavigate();

  const updateField = (key, val) => {
    setForm((prev) => {
      const next = { ...prev, [key]: val };
      // If changing state, auto-select first city
      if (key === 'state') {
        next.city = STATE_CITIES[val]?.[0] || '';
      }
      return next;
    });
  };

  // Check password strength
  const getPasswordStrength = (pass) => {
    if (!pass) return { score: 0, label: '', color: 'bg-neutral-800', width: 'w-0' };
    let score = 0;
    if (pass.length >= 6) score += 1;
    if (/[0-9]/.test(pass)) score += 1;
    if (/[A-Z]/.test(pass)) score += 1;
    if (/[^A-Za-z0-9]/.test(pass)) score += 1;

    if (score <= 1) return { score: 1, label: 'Weak', color: 'bg-red-500', width: 'w-1/3' };
    if (score <= 3) return { score: 2, label: 'Medium', color: 'bg-yellow-500', width: 'w-2/3' };
    return { score: 3, label: 'Strong', color: 'bg-green-500', width: 'w-full' };
  };

  const strength = getPasswordStrength(form.password);

  // Validate current step
  const validateStep = () => {
    if (step === 1) {
      if (!form.firstName.trim() || !form.lastName.trim() || !form.email.trim()) {
        showToast('Please fill out all personal details', 'warning');
        return false;
      }
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(form.email)) {
        showToast('Please enter a valid email address', 'warning');
        return false;
      }
    } else if (step === 2) {
      if (!form.state || !form.city) {
        showToast('Please select your state and city', 'warning');
        return false;
      }
    } else if (step === 3) {
      if (!form.password || !form.confirmPassword) {
        showToast('Please fill out password fields', 'warning');
        return false;
      }
      if (form.password.length < 6) {
        showToast('Password must be at least 6 characters long', 'warning');
        return false;
      }
      if (form.password !== form.confirmPassword) {
        showToast('Passwords do not match', 'warning');
        return false;
      }
    }
    return true;
  };

  const handleNext = () => {
    if (validateStep()) {
      setStep((s) => s + 1);
    }
  };

  const handleBack = () => {
    setStep((s) => Math.max(1, s - 1));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateStep()) return;
    try {
      await register({
        email: form.email,
        password: form.password,
        firstName: form.firstName,
        lastName: form.lastName,
        state: form.state,
        city: form.city,
        role: 'CLIENT'
      });
      showToast('Account created successfully!', 'success');
      navigate('/dashboard');
    } catch (err) {
      showToast(err.message || 'Registration failed. Please try again.', 'error');
    }
  };

  const handleGoogleSignup = async () => {
    try {
      if (!auth) {
        showToast('Firebase not configured. Registering with Demo Google account...', 'info');
        const res = await api.post('/auth/google-demo', {
          email: 'google-client@demo.com',
          firstName: 'Google',
          lastName: 'User',
        });
        useAuthStore.getState().setAuth(res.data.token, res.data.user);
        showToast('Registered with Demo Google account!', 'success');
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
      showToast('Google registration successful!', 'success');
      navigate('/dashboard');
    } catch (error) {
      console.error('Google signup error:', error);
      if (error.code === 'auth/popup-closed-by-user') {
        showToast('Popup closed before completing sign-up.', 'warning');
      } else {
        showToast(error.message || 'Google Sign-Up failed', 'error');
      }
    }
  };

  // Pre-load cities
  const cities = STATE_CITIES[form.state] || [];

  return (
    <div className="flex min-h-screen flex-col lg:flex-row" style={{ background: 'var(--bg-base)' }}>
      {/* LEFT SIDE - Split screen brand layout (50%) */}
      <div className="relative flex flex-col justify-between overflow-hidden p-8 lg:w-1/2 lg:p-16" style={{ background: 'var(--hero-gradient)' }}>
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
          {/* Header */}
          <div className="text-center lg:text-left">
            <h1 className="text-2xl font-bold sm:text-3xl" style={{ color: 'var(--text-primary)' }}>Create Account</h1>
            <p className="mt-2 text-xs sm:text-sm" style={{ color: 'var(--text-secondary)' }}>Get analytical matrimonial law guidance in minutes</p>
          </div>

          {/* Progress Stepper */}
          <div className="flex items-center justify-between">
            {[
              { num: 1, label: 'Profile' },
              { num: 2, label: 'Location' },
              { num: 3, label: 'Security' }
            ].map((s, index) => (
              <div key={s.num} className="flex flex-1 items-center">
                <div className="flex flex-col items-center gap-1.5 mx-auto">
                  <div
                    className="flex h-8 w-8 items-center justify-center rounded-full text-xs font-semibold border transition-all duration-300"
                    style={{
                      background: step >= s.num ? 'var(--gold)' : 'transparent',
                      borderColor: step >= s.num ? 'var(--gold)' : 'var(--border-strong)',
                      color: step >= s.num ? 'var(--btn-on-accent)' : 'var(--text-secondary)'
                    }}
                  >
                    {s.num}
                  </div>
                  <span className="text-[10px] uppercase tracking-wider font-medium" style={{ color: step >= s.num ? 'var(--text-primary)' : 'var(--text-muted)' }}>
                    {s.label}
                  </span>
                </div>
                {index < 2 && (
                  <div 
                    className="h-[1px] flex-1 transition-all duration-300"
                    style={{ background: step > s.num ? 'var(--gold)' : 'var(--border-dim)' }}
                  />
                )}
              </div>
            ))}
          </div>

          {/* Form Container */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <AnimatePresence mode="wait">
              {step === 1 && (
                <motion.div
                  key="step1"
                  initial={{ x: 15, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  exit={{ x: -15, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-4"
                >
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs uppercase tracking-wider mb-2" style={{ color: 'var(--text-secondary)' }}>First Name</label>
                      <input
                        type="text"
                        value={form.firstName}
                        disabled={loading}
                        onChange={(e) => updateField('firstName', e.target.value)}
                        placeholder="Jane"
                        required
                        className="w-full rounded-lg border px-4 py-3 text-sm focus:ring-1 focus:ring-[var(--gold)] disabled:opacity-50 disabled:cursor-not-allowed"
                        style={{ background: 'var(--bg-card)', borderColor: 'var(--border-subtle)', color: 'var(--text-primary)' }}
                      />
                    </div>
                    <div>
                      <label className="block text-xs uppercase tracking-wider mb-2" style={{ color: 'var(--text-secondary)' }}>Last Name</label>
                      <input
                        type="text"
                        value={form.lastName}
                        disabled={loading}
                        onChange={(e) => updateField('lastName', e.target.value)}
                        placeholder="Doe"
                        required
                        className="w-full rounded-lg border px-4 py-3 text-sm focus:ring-1 focus:ring-[var(--gold)] disabled:opacity-50 disabled:cursor-not-allowed"
                        style={{ background: 'var(--bg-card)', borderColor: 'var(--border-subtle)', color: 'var(--text-primary)' }}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs uppercase tracking-wider mb-2" style={{ color: 'var(--text-secondary)' }}>Email Address</label>
                    <input
                      type="email"
                      value={form.email}
                      disabled={loading}
                      onChange={(e) => updateField('email', e.target.value)}
                      placeholder="jane.doe@example.com"
                      required
                      className="w-full rounded-lg border px-4 py-3 text-sm focus:ring-1 focus:ring-[var(--gold)] disabled:opacity-50 disabled:cursor-not-allowed"
                      style={{ background: 'var(--bg-card)', borderColor: 'var(--border-subtle)', color: 'var(--text-primary)' }}
                    />
                  </div>
                </motion.div>
              )}

              {step === 2 && (
                <motion.div
                  key="step2"
                  initial={{ x: 15, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  exit={{ x: -15, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-4"
                >
                  <div>
                    <label className="block text-xs uppercase tracking-wider mb-2" style={{ color: 'var(--text-secondary)' }}>State</label>
                    <select
                      value={form.state}
                      disabled={loading}
                      onChange={(e) => updateField('state', e.target.value)}
                      className="w-full rounded-lg border px-4 py-3 text-sm focus:ring-1 focus:ring-[var(--gold)] disabled:opacity-50 disabled:cursor-not-allowed"
                      style={{ background: 'var(--bg-card)', borderColor: 'var(--border-subtle)', color: 'var(--text-primary)' }}
                    >
                      {INDIAN_STATES.map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs uppercase tracking-wider mb-2" style={{ color: 'var(--text-secondary)' }}>City / Region</label>
                    <select
                      value={form.city}
                      disabled={loading}
                      onChange={(e) => updateField('city', e.target.value)}
                      className="w-full rounded-lg border px-4 py-3 text-sm focus:ring-1 focus:ring-[var(--gold)] disabled:opacity-50 disabled:cursor-not-allowed"
                      style={{ background: 'var(--bg-card)', borderColor: 'var(--border-subtle)', color: 'var(--text-primary)' }}
                    >
                      <option value="">Select City...</option>
                      {cities.map((c) => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>
                </motion.div>
              )}

              {step === 3 && (
                <motion.div
                  key="step3"
                  initial={{ x: 15, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  exit={{ x: -15, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-4"
                >
                  <div>
                    <label className="block text-xs uppercase tracking-wider mb-2" style={{ color: 'var(--text-secondary)' }}>Password</label>
                    <input
                      type="password"
                      value={form.password}
                      disabled={loading}
                      onChange={(e) => updateField('password', e.target.value)}
                      placeholder="••••••••"
                      required
                      className="w-full rounded-lg border px-4 py-3 text-sm focus:ring-1 focus:ring-[var(--gold)] disabled:opacity-50 disabled:cursor-not-allowed"
                      style={{ background: 'var(--bg-card)', borderColor: 'var(--border-subtle)', color: 'var(--text-primary)' }}
                    />
                    {form.password && (
                      <div className="mt-2 space-y-1">
                        <div className="flex items-center justify-between text-[11px]">
                          <span style={{ color: 'var(--text-secondary)' }}>Password strength:</span>
                          <span className={`font-semibold ${strength.score === 1 ? 'text-red-600 dark:text-red-400' : strength.score === 2 ? 'text-amber-600 dark:text-yellow-400' : 'text-green-600 dark:text-green-400'}`}>
                            {strength.label}
                          </span>
                        </div>
                        <div className="h-1.5 w-full rounded-full bg-neutral-200 dark:bg-neutral-800 overflow-hidden">
                          <div className={`h-full ${strength.color} ${strength.width} transition-all duration-300`} />
                        </div>
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs uppercase tracking-wider mb-2" style={{ color: 'var(--text-secondary)' }}>Confirm Password</label>
                    <input
                      type="password"
                      value={form.confirmPassword}
                      disabled={loading}
                      onChange={(e) => updateField('confirmPassword', e.target.value)}
                      placeholder="••••••••"
                      required
                      className="w-full rounded-lg border px-4 py-3 text-sm focus:ring-1 focus:ring-[var(--gold)] disabled:opacity-50 disabled:cursor-not-allowed"
                      style={{ background: 'var(--bg-card)', borderColor: 'var(--border-subtle)', color: 'var(--text-primary)' }}
                    />
                    {form.confirmPassword && form.password !== form.confirmPassword && (
                      <p className="mt-1 text-xs text-red-600 dark:text-red-400">Passwords do not match</p>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Stepper Buttons */}
            <div className="flex gap-4 pt-4">
              {step > 1 && (
                <button
                  type="button"
                  disabled={loading}
                  onClick={handleBack}
                  className="btn-ghost flex-1 rounded-lg py-3 text-sm font-medium transition-colors hover:bg-neutral-100 dark:hover:bg-neutral-800/40 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none"
                >
                  Back
                </button>
              )}

              {step < 3 ? (
                <button
                  type="button"
                  disabled={loading}
                  onClick={handleNext}
                  className="btn-primary flex-1 rounded-lg py-3 text-sm font-medium cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none"
                >
                  Continue
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary flex-1 rounded-lg py-3 text-sm font-medium disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed disabled:pointer-events-none"
                >
                  {loading ? 'Registering…' : 'Complete Setup →'}
                </button>
              )}
            </div>
          </form>

          {/* Divider & Google Login (only on step 1) */}
          {step === 1 && (
            <div className="mt-6 space-y-4">
              <div className="relative flex py-2 items-center">
                <div className="flex-grow border-t" style={{ borderColor: 'var(--border-dim)' }}></div>
                <span className="flex-shrink mx-4 text-xs" style={{ color: 'var(--text-muted)' }}>or</span>
                <div className="flex-grow border-t" style={{ borderColor: 'var(--border-dim)' }}></div>
              </div>

              <button
                type="button"
                disabled={loading}
                onClick={handleGoogleSignup}
                className="flex w-full items-center justify-center gap-3 rounded-lg border px-4 py-3 text-sm font-semibold transition-all hover:bg-neutral-100 dark:hover:bg-neutral-800/50 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none"
                style={{ borderColor: 'var(--border-subtle)', background: 'var(--bg-card)', color: 'var(--text-primary)' }}
              >
                <svg className="h-5 w-5 shrink-0" viewBox="0 0 24 24" width="20" height="20" xmlns="http://www.w3.org/2000/svg">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335"/>
                </svg>
                Sign Up with Google
              </button>
            </div>
          )}

          <p className="mt-8 text-center text-xs sm:text-sm" style={{ color: 'var(--text-secondary)' }}>
            Have an account?{' '}
            <Link to="/login" style={{ color: 'var(--gold)', fontWeight: 500 }} className="hover:underline">
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
