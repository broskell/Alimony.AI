import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AlimonyForm from '../components/calculator/AlimonyForm';
import api from '../lib/api';
import { useAppStore } from '../store/useAppStore';
import { useAuthStore } from '../store/useAuthStore';

export default function Calculator() {
  const [loading, setLoading] = useState(false);
  const { setCalculation, showToast } = useAppStore();
  const { user } = useAuthStore();
  const navigate = useNavigate();

  const handleCalculate = async (form) => {
    setLoading(true);
    try {
      const { data } = await api.post('/calculator/calculate', form);
      setCalculation(data.result, form);
      navigate('/results');
    } catch (e) {
      showToast(e.message || 'Calculation failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1 className="text-3xl font-bold tracking-tight md:text-4xl" style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-display)' }}>
        Alimony Calculator
      </h1>
      <p className="mt-2 text-sm font-light md:text-base" style={{ color: 'var(--text-secondary)' }}>
        Indian family law · Rajnesh v. Neha guidelines · {!user && 'No login required'}
      </p>
      <div className="mt-10 rounded-xl border p-6 md:p-10 transition-all duration-300" style={{ background: 'var(--bg-card)', borderColor: 'var(--border-subtle)' }}>
        <AlimonyForm onCalculate={handleCalculate} loading={loading} />
      </div>
    </div>
  );
}
