import { useState, useRef } from 'react';
import api from '../lib/api';
import { useAuthStore } from '../store/useAuthStore';
import { useAppStore } from '../store/useAppStore';
import { Link } from 'react-router-dom';
import { useReactToPrint } from 'react-to-print';
import LegalDocumentPreview from '../components/document/LegalDocumentPreview';
import { sanitizeLegalDocument } from '../lib/sanitize';
import { exportToDocx } from '../lib/docxExport';

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
  const documentRef = useRef(null);

  // react-to-print setup for PDF export
  const handlePrintHook = useReactToPrint({
    contentRef: documentRef,
    documentTitle: type,
  });

  const printDocument = () => {
    try {
      if (typeof handlePrintHook === 'function') {
        handlePrintHook();
      } else {
        console.warn("useReactToPrint is not ready or failed, using window.print fallback");
        window.print();
      }
    } catch (err) {
      console.error("react-to-print error, falling back to window.print", err);
      window.print();
    }
  };

  const copyDraft = async () => {
    if (!content) return;
    try {
      await navigator.clipboard.writeText(content);
      showToast('Draft copied to clipboard!');
    } catch (e) {
      showToast('Failed to copy: ' + e.message);
    }
  };

  const downloadDocx = async () => {
    if (!content) return;
    try {
      await exportToDocx(type, content);
      showToast('DOCX download started!');
    } catch (e) {
      showToast('Failed to export DOCX: ' + e.message);
    }
  };

  const generate = async () => {
    if (!user) { showToast('Sign in to generate documents'); return; }
    setLoading(true);
    setContent(''); // Clear previous content to display skeleton loader during generation
    try {
      const { data } = await api.post('/ai/draft-document', { type, caseDetails: details });
      const sanitized = sanitizeLegalDocument(data.content);
      setContent(sanitized);
      await api.post('/documents', { 
        name: type, 
        type: type.split(' ')[0].toLowerCase(), 
        content: sanitized, 
        aiGenerated: true 
      });
      showToast('Document saved successfully');
    } catch (e) {
      showToast(e.message);
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="py-20 text-center no-print">
        <p style={{ color: 'var(--text-secondary)' }}>Sign in to draft legal documents with AI</p>
        <Link to="/login" className="mt-4 inline-block" style={{ color: 'var(--gold)' }}>Sign In →</Link>
      </div>
    );
  }

  return (
    <div className="grid gap-8 lg:grid-cols-2">
      {/* Form Controls - Hidden during Printing */}
      <div className="no-print">
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
              rows={3}
              className="w-full rounded-lg border px-4 py-3 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ background: 'var(--bg-card)', borderColor: 'var(--border-subtle)', color: 'var(--text-primary)' }}
            />
          ))}
        </div>
        <button 
          type="button" 
          disabled={loading} 
          onClick={generate} 
          className="btn-primary mt-6 w-full rounded-lg py-3 disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none cursor-pointer"
        >
          {loading ? 'Generating…' : 'Generate with AI'}
        </button>
      </div>

      {/* Preview and Actions Column */}
      <div className="flex flex-col space-y-4">
        {/* Top-Right Actions: Hidden during loading, empty state, and printing */}
        {content && !loading && (
          <div className="flex flex-wrap gap-2 justify-end no-print">
            <button
              type="button"
              onClick={copyDraft}
              className="btn-ghost flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs cursor-pointer font-medium"
            >
              <span className="material-symbols-outlined text-sm">content_copy</span>
              Copy Draft
            </button>
            <button
              type="button"
              onClick={printDocument}
              className="btn-primary flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs cursor-pointer"
            >
              <span className="material-symbols-outlined text-sm">picture_as_pdf</span>
              Download PDF
            </button>
            <button
              type="button"
              onClick={downloadDocx}
              className="btn-ghost flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs cursor-pointer font-medium"
            >
              <span className="material-symbols-outlined text-sm">description</span>
              Download DOCX
            </button>
          </div>
        )}

        {/* virtual A4 paper preview component */}
        <LegalDocumentPreview ref={documentRef} content={content} loading={loading} />
      </div>
    </div>
  );
}
