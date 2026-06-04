import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import AlimonyForm from '../components/calculator/AlimonyForm';
import api from '../lib/api';
import { useAppStore } from '../store/useAppStore';
import { useAuthStore } from '../store/useAuthStore';
import Icon from '../components/ui/Icon';

export default function Calculator() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [savedForm, setSavedForm] = useState(null);
  const { setCalculation, showToast } = useAppStore();
  const { user } = useAuthStore();
  const navigate = useNavigate();

  const handleCalculate = async (formValues) => {
    setLoading(true);
    setError(null);
    setSavedForm(formValues);
    try {
      const { data } = await api.post('/calculator/calculate', formValues);
      setCalculation(data.result, formValues);
      showToast('Calculation completed successfully!', 'success');
      navigate('/results');
    } catch (e) {
      console.error('Calculation API failed:', e);
      const isNetwork = e.message && (e.message.includes('Network Error') || e.message.includes('Failed to fetch'));
      const msg = isNetwork
        ? 'Network Connection Error: Unable to connect to the backend server. Please verify it is running on port 5000.'
        : e.message || 'Calculation failed';
      setError(msg);
      showToast(msg, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleRetry = () => {
    if (savedForm) {
      handleCalculate(savedForm);
    }
  };

  const handleDismissError = () => {
    setError(null);
  };

  return (
    <div className="relative">
      <h1 className="text-3xl font-bold tracking-tight md:text-4xl" style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-display)' }}>
        Alimony Calculator
      </h1>
      <p className="mt-2 text-sm font-light md:text-base" style={{ color: 'var(--text-secondary)' }}>
        Indian family law · Rajnesh v. Neha guidelines · {!user && 'No login required'}
      </p>

      <div className="mt-10 rounded-xl border p-6 md:p-10 transition-all duration-300 relative overflow-hidden" style={{ background: 'var(--bg-card)', borderColor: 'var(--border-subtle)' }}>
        
        {/* Loading Overlay */}
        <AnimatePresence>
          {loading && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 z-20 flex flex-col items-center justify-center backdrop-blur-md bg-white/80 dark:bg-[#080810]/85"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-full mb-4 border-2 border-t-transparent animate-spin" style={{ borderColor: 'var(--gold)' }} />
              <motion.p
                initial={{ y: 10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.15 }}
                className="text-sm font-medium tracking-wide text-center max-w-xs leading-relaxed"
                style={{ color: 'var(--text-primary)' }}
              >
                ✨ Calculating based on Rajnesh v Neha guidelines...
              </motion.p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Error Screen / Fallback Retry Boundary */}
        {error ? (
          <div className="py-6 text-center max-w-md mx-auto space-y-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-950/50 border border-red-500/30 text-red-400 mx-auto">
              <Icon name="warning" size={24} />
            </div>
            <div className="space-y-2">
              <h2 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>Calculation Failed</h2>
              <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{error}</p>
            </div>
            <div className="flex gap-4 pt-2">
              <button
                type="button"
                onClick={handleDismissError}
                className="btn-ghost flex-1 rounded-lg py-2.5 text-xs font-semibold"
              >
                Modify Inputs
              </button>
              <button
                type="button"
                onClick={handleRetry}
                className="btn-primary flex-1 rounded-lg py-2.5 text-xs font-semibold"
              >
                Retry Calculation
              </button>
            </div>
          </div>
        ) : (
          <AlimonyForm onCalculate={handleCalculate} loading={loading} />
        )}
      </div>
    </div>
  );
}

