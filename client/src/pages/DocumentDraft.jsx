import { useState } from 'react';
import api from '../lib/api';
import { useAuthStore } from '../store/useAuthStore';
import { useAppStore } from '../store/useAppStore';
import { Link } from 'react-router-dom';

const TYPES = [
  'Petition for Maintenance (HMA §24)',
  'Application for Permanent Alimony (HMA §25)',
  'Legal Notice to Spouse',
  'Settlement Agreement Draft',
  'Affidavit of Assets & Income',
  'Vakalatnama',
];

export default function DocumentDraft() {
  const [type, setType] = useState(TYPES[0]);
  const [details, setDetails] = useState({ petitioner: '', respondent: '', facts: '', relief: '' });
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const { user } = useAuthStore();
  const { showToast } = useAppStore();

  const generate = async () => {
    if (!user) { showToast('Sign in to generate documents'); return; }
    setLoading(true);
    try {
      const { data } = await api.post('/ai/draft-document', { type, caseDetails: details });
      setContent(data.content);
      await api.post('/documents', { name: type, type: type.split(' ')[0].toLowerCase(), content: data.content, aiGenerated: true });
      showToast('Document saved');
    } catch (e) {
      showToast(e.message);
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="py-20 text-center">
        <p style={{ color: 'var(--text-secondary)' }}>Sign in to draft legal documents with AI</p>
        <Link to="/login" className="mt-4 inline-block" style={{ color: 'var(--gold)' }}>Sign In →</Link>
      </div>
    );
  }

  return (
    <div className="grid gap-8 lg:grid-cols-2">
      <div>
        <h1 className="text-3xl">Document Draft</h1>
        <div className="mt-6 space-y-3">
          {TYPES.map((t) => (
            <button
              key={t}
              type="button"
              disabled={loading}
              onClick={() => setType(t)}
              className="block w-full rounded-lg border px-4 py-3 text-left text-sm disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none cursor-pointer"
              style={{
                borderColor: type === t ? 'var(--gold)' : 'var(--border-subtle)',
                background: type === t ? 'var(--bg-overlay)' : 'var(--bg-card)',
                color: 'var(--text-primary)',
              }}
            >
              {t}
            </button>
          ))}
        </div>
        <div className="mt-6 space-y-3">
          {Object.keys(details).map((k) => (
            <textarea
              key={k}
              placeholder={k.charAt(0).toUpperCase() + k.slice(1)}
              value={details[k]}
              disabled={loading}
              onChange={(e) => setDetails({ ...details, [k]: e.target.value })}
              rows={2}
              className="w-full rounded-lg border px-4 py-3 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ background: 'var(--bg-card)', borderColor: 'var(--border-subtle)', color: 'var(--text-primary)' }}
            />
          ))}
        </div>
        <button type="button" disabled={loading} onClick={generate} className="btn-primary mt-6 w-full rounded-lg py-3 disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none cursor-pointer">
          {loading ? 'Generating…' : 'Generate with AI'}
        </button>
      </div>
      <div className="rounded-xl border p-6 font-light leading-loose whitespace-pre-wrap text-sm min-h-[400px]" style={{ background: 'var(--bg-card)', borderColor: 'var(--border-subtle)' }}>
        {content || 'Preview will appear here…'}
      </div>
    </div>
  );
}
