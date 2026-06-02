import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Icon from '../ui/Icon';

import { useAppStore } from '../../store/useAppStore';

const INDIAN_STATES = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chandigarh', 'Chhattisgarh',
  'Delhi', 'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka',
  'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram',
  'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana',
  'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
];

const defaultForm = {
  role: 'claimant',
  act: 'HMA',
  state: 'Delhi',
  marriageYears: 8,
  yourIncome: 0,
  spouseIncome: 150000,
  children: 0,
  standardOfLiving: 'middle',
  careerSacrifice: 'none',
  domesticViolence: 'none',
  health: 'healthy',
  educationGap: 'none',
  jointProperty: 'none',
};

export default function AlimonyForm({ onCalculate, loading }) {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState(defaultForm);
  const { showToast } = useAppStore();

  const update = (key, val) => setForm((f) => ({ ...f, [key]: val }));

  const submit = () => {
    if (form.yourIncome < 0 || form.spouseIncome < 0) {
      showToast('Income values cannot be negative.', 'warning');
      return;
    }
    if (form.marriageYears < 1) {
      showToast('Marriage duration must be at least 1 year.', 'warning');
      return;
    }
    onCalculate(form);
  };


  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-8 flex gap-2">
        {[1, 2, 3].map((s) => (
          <div
            key={s}
            className="h-1 flex-1 rounded-full transition-colors"
            style={{ background: step >= s ? 'var(--gold)' : 'var(--border-dim)' }}
          />
        ))}
      </div>

      <AnimatePresence mode="wait">
        {step === 1 && (
          <motion.div key="s1" initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -20, opacity: 0 }} className="space-y-6">
            <h2 className="text-2xl">Basic Information</h2>
            <div className="grid gap-3 sm:grid-cols-2">
              {[
                { val: 'claimant', label: 'Seeking maintenance', icon: 'person' },
                { val: 'payer', label: 'Paying maintenance', icon: 'work' },
              ].map((r) => (
                <button
                  key={r.val}
                  type="button"
                  onClick={() => update('role', r.val)}
                  className="flex items-center gap-3 rounded-lg border p-4 text-left text-sm transition-all"
                  style={{
                    borderColor: form.role === r.val ? 'var(--gold)' : 'var(--border-subtle)',
                    background: form.role === r.val ? 'var(--bg-overlay)' : 'var(--bg-card)',
                    color: 'var(--text-primary)',
                  }}
                >
                  <Icon name={r.icon} size={22} />
                  {r.label}
                </button>
              ))}
            </div>
            <div>
              <label className="label-chip mb-2 block" style={{ color: 'var(--text-muted)' }}>Applicable Act</label>
              <div className="flex flex-wrap gap-2">
                {['HMA', 'CrPC125', 'SMA', 'DV'].map((a) => (
                  <button
                    key={a}
                    type="button"
                    onClick={() => update('act', a)}
                    className="rounded-lg border px-3 py-2 text-sm"
                    style={{
                      borderColor: form.act === a ? 'var(--gold)' : 'var(--border-subtle)',
                      color: form.act === a ? 'var(--gold)' : 'var(--text-secondary)',
                    }}
                  >
                    {a === 'CrPC125' ? 'CrPC 125' : a}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="label-chip mb-2 block" style={{ color: 'var(--text-muted)' }}>State</label>
              <select
                value={form.state}
                onChange={(e) => update('state', e.target.value)}
                className="w-full rounded-lg border px-4 py-3"
                style={{ background: 'var(--bg-card)', borderColor: 'var(--border-subtle)', color: 'var(--text-primary)' }}
              >
                {INDIAN_STATES.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="label-chip mb-2 block" style={{ color: 'var(--text-muted)' }}>
                Marriage duration: <span className="mono" style={{ color: 'var(--gold)' }}>{form.marriageYears} years</span>
              </label>
              <input
                type="range"
                min={1}
                max={40}
                value={form.marriageYears}
                onChange={(e) => update('marriageYears', +e.target.value)}
                className="w-full accent-[var(--gold)]"
              />
            </div>
            <button 
              type="button" 
              onClick={() => setStep(2)} 
              className="btn-primary w-full rounded-lg py-3 text-sm font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[var(--gold)] focus:ring-offset-2 focus:ring-offset-[var(--bg-base)] mt-8"
            >
              Continue →
            </button>
          </motion.div>
        )}

        {step === 2 && (
          <motion.div key="s2" initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -20, opacity: 0 }} className="space-y-6">
            <h2 className="text-2xl">Financial Details</h2>
            {[
              { key: 'yourIncome', label: 'Your net monthly income (₹)' },
              { key: 'spouseIncome', label: "Spouse's net monthly income (₹)" },
            ].map((f) => (
              <div key={f.key}>
                <label className="label-chip mb-2 block" style={{ color: 'var(--text-muted)' }}>{f.label}</label>
                <input
                  type="number"
                  value={form[f.key]}
                  onChange={(e) => update(f.key, +e.target.value)}
                  className="mono w-full rounded-lg border px-4 py-3"
                  style={{ background: 'var(--bg-card)', borderColor: 'var(--border-subtle)', color: 'var(--text-primary)' }}
                />
              </div>
            ))}
            <div>
              <label className="label-chip mb-2 block" style={{ color: 'var(--text-muted)' }}>Dependent children</label>
              <div className="flex items-center gap-4">
                <button type="button" onClick={() => update('children', Math.max(0, form.children - 1))} className="flex h-10 w-10 items-center justify-center rounded-lg border" style={{ borderColor: 'var(--border-subtle)', color: 'var(--text-primary)' }} aria-label="Decrease children">
                  <Icon name="remove" size={20} />
                </button>
                <span className="mono text-2xl" style={{ color: 'var(--gold)' }}>{form.children}</span>
                <button type="button" onClick={() => update('children', Math.min(5, form.children + 1))} className="flex h-10 w-10 items-center justify-center rounded-lg border" style={{ borderColor: 'var(--border-subtle)', color: 'var(--text-primary)' }} aria-label="Increase children">
                  <Icon name="add" size={20} />
                </button>
              </div>
            </div>
            <div>
              <label className="label-chip mb-2 block" style={{ color: 'var(--text-muted)' }}>Standard of living</label>
              <select value={form.standardOfLiving} onChange={(e) => update('standardOfLiving', e.target.value)} className="w-full rounded-lg border px-4 py-3" style={{ background: 'var(--bg-card)', borderColor: 'var(--border-subtle)', color: 'var(--text-primary)' }}>
                <option value="basic">Basic</option>
                <option value="middle">Middle Class</option>
                <option value="upper">Upper Middle</option>
                <option value="affluent">Affluent</option>
              </select>
            </div>
            <div>
              <label className="label-chip mb-2 block" style={{ color: 'var(--text-muted)' }}>Career sacrifice</label>
              <select value={form.careerSacrifice} onChange={(e) => update('careerSacrifice', e.target.value)} className="w-full rounded-lg border px-4 py-3" style={{ background: 'var(--bg-card)', borderColor: 'var(--border-subtle)', color: 'var(--text-primary)' }}>
                <option value="none">None</option>
                <option value="partial">Partial (reduced hours)</option>
                <option value="full">Full (gave up career)</option>
              </select>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row sm:gap-4 mt-8">
              <button 
                type="button" 
                onClick={() => setStep(1)} 
                className="btn-ghost flex-1 rounded-lg py-3 text-sm font-medium transition-all duration-200 hover:bg-neutral-800/40 focus:outline-none focus:ring-2 focus:ring-[var(--gold)] focus:ring-offset-2 focus:ring-offset-[var(--bg-base)]"
              >
                ← Back
              </button>
              <button 
                type="button" 
                onClick={() => setStep(3)} 
                className="btn-primary flex-1 rounded-lg py-3 text-sm font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[var(--gold)] focus:ring-offset-2 focus:ring-offset-[var(--bg-base)]"
              >
                Continue →
              </button>
            </div>
          </motion.div>
        )}

        {step === 3 && (
          <motion.div key="s3" initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -20, opacity: 0 }} className="space-y-6">
            <h2 className="text-2xl">Case Factors</h2>
            {[
              { key: 'domesticViolence', label: 'Domestic violence / cruelty', opts: [['none', 'None'], ['cruelty', 'Cruelty (IPC 498A)'], ['abuse', 'Abuse']] },
              { key: 'health', label: 'Health conditions', opts: [['healthy', 'Both healthy'], ['illness', 'Claimant illness'], ['disability', 'Claimant disability']] },
              { key: 'educationGap', label: 'Education gap', opts: [['none', 'Similar'], ['moderate', 'Moderate'], ['significant', 'Significant']] },
              { key: 'jointProperty', label: 'Joint property', opts: [['none', 'None'], ['some', 'Some'], ['significant', 'Significant']] },
            ].map((field) => (
              <div key={field.key}>
                <label className="label-chip mb-2 block" style={{ color: 'var(--text-muted)' }}>{field.label}</label>
                <select value={form[field.key]} onChange={(e) => update(field.key, e.target.value)} className="w-full rounded-lg border px-4 py-3" style={{ background: 'var(--bg-card)', borderColor: 'var(--border-subtle)', color: 'var(--text-primary)' }}>
                  {field.opts.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                </select>
              </div>
            ))}
            <div className="flex flex-col gap-3 sm:flex-row sm:gap-4 mt-8">
              <button 
                type="button" 
                onClick={() => setStep(2)} 
                className="btn-ghost flex-1 rounded-lg py-3 text-sm font-medium transition-all duration-200 hover:bg-neutral-800/40 focus:outline-none focus:ring-2 focus:ring-[var(--gold)] focus:ring-offset-2 focus:ring-offset-[var(--bg-base)]"
              >
                ← Back
              </button>
              <button
                type="button"
                disabled={loading}
                onClick={submit}
                className="btn-primary flex-1 rounded-lg py-3 text-sm font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[var(--gold)] focus:ring-offset-2 focus:ring-offset-[var(--bg-base)] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Calculating…' : 'Calculate Result →'}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
