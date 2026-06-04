import React, { forwardRef } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

const LegalDocumentPreview = forwardRef(({ content, loading }, ref) => {
  // Loading state: Skeleton paper representation
  if (loading) {
    return (
      <div 
        className="w-full mx-auto bg-white border border-slate-200 shadow-xl rounded-sm p-12 min-h-[600px] lg:min-h-[1100px] flex flex-col justify-between animate-pulse"
        style={{ maxWidth: '816px' }}
      >
        <div className="space-y-8 w-full">
          {/* Main Title heading placeholder */}
          <div className="h-7 bg-slate-200 rounded-md w-3/4 mx-auto"></div>
          
          {/* Subheading placeholder */}
          <div className="h-5 bg-slate-200 rounded-md w-1/3 mt-12"></div>
          
          {/* Paragraphs placeholders */}
          <div className="space-y-3 mt-6">
            <div className="h-4 bg-slate-200 rounded-md w-full"></div>
            <div className="h-4 bg-slate-200 rounded-md w-full"></div>
            <div className="h-4 bg-slate-200 rounded-md w-5/6"></div>
          </div>

          {/* Subheading placeholder */}
          <div className="h-5 bg-slate-200 rounded-md w-1/4 mt-12"></div>
          
          {/* Paragraphs placeholders */}
          <div className="space-y-3 mt-6">
            <div className="h-4 bg-slate-200 rounded-md w-full"></div>
            <div className="h-4 bg-slate-200 rounded-md w-11/12"></div>
            <div className="h-4 bg-slate-200 rounded-md w-full"></div>
            <div className="h-4 bg-slate-200 rounded-md w-4/5"></div>
          </div>

          <div className="border-t border-slate-200 my-8 w-full"></div>

          {/* Bullet points placeholder */}
          <div className="space-y-3 mt-6 pl-6">
            <div className="flex items-center space-x-3">
              <div className="h-2 w-2 rounded-full bg-slate-200"></div>
              <div className="h-4 bg-slate-200 rounded-md w-5/6"></div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="h-2 w-2 rounded-full bg-slate-200"></div>
              <div className="h-4 bg-slate-200 rounded-md w-4/5"></div>
            </div>
          </div>
        </div>

        <div className="h-4 bg-slate-100 rounded-md w-1/4 mx-auto mt-20"></div>
      </div>
    );
  }

  // Empty state: Placeholder text
  if (!content) {
    return (
      <div 
        className="w-full flex flex-col items-center justify-center border border-dashed rounded-xl py-20 px-6 text-center"
        style={{ 
          borderColor: 'var(--border-subtle)', 
          background: 'var(--bg-card)',
          minHeight: '450px'
        }}
      >
        <span className="material-symbols-outlined text-5xl mb-4" style={{ color: 'var(--gold)' }}>
          description
        </span>
        <h3 className="text-lg font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
          Document Preview
        </h3>
        <p className="text-sm max-w-sm" style={{ color: 'var(--text-secondary)' }}>
          Generate a document to preview it here. Your formatted, court-ready draft will appear on an A4 sheet.
        </p>
      </div>
    );
  }

  // Loaded state: A4 document preview sheet
  return (
    <div className="w-full overflow-x-auto pb-4">
      <div
        ref={ref}
        id="legal-document-preview"
        className="mx-auto shadow-xl border border-slate-200 rounded-sm"
      >
        <ReactMarkdown remarkPlugins={[remarkGfm]}>
          {content}
        </ReactMarkdown>
      </div>
    </div>
  );
});

LegalDocumentPreview.displayName = 'LegalDocumentPreview';

export default LegalDocumentPreview;
