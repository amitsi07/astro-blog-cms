import React from 'react';
import { StaticPage } from '../../types/cms';
import { ChevronRight, FileText } from 'lucide-react';

interface StaticPageViewProps {
  page: StaticPage;
  onNavigate: (path: string) => void;
}

export const StaticPageView: React.FC<StaticPageViewProps> = ({ page, onNavigate }) => {
  // Simple markdown renderer for static pages
  const renderContent = (content: string) => {
    return content.split('\n\n').map((paragraph, idx) => {
      const trimmed = paragraph.trim();
      if (!trimmed) return null;

      if (trimmed.startsWith('## ')) {
        return (
          <h2
            key={idx}
            className="font-display text-2xl font-bold text-white mt-8 mb-4 pb-2 border-b border-slate-800"
          >
            {trimmed.replace('## ', '')}
          </h2>
        );
      }

      if (trimmed.startsWith('### ')) {
        return (
          <h3 key={idx} className="font-display text-lg font-bold text-slate-100 mt-6 mb-3">
            {trimmed.replace('### ', '')}
          </h3>
        );
      }

      if (trimmed.startsWith('- ')) {
        const items = trimmed.split('\n');
        return (
          <ul key={idx} className="my-4 space-y-2 list-disc list-inside text-slate-300 text-sm leading-relaxed pl-2">
            {items.map((it, i) => (
              <li key={i}>{it.replace(/^- /, '')}</li>
            ))}
          </ul>
        );
      }

      if (trimmed.match(/^\d+\.\s+/)) {
        const items = trimmed.split('\n');
        return (
          <ol key={idx} className="my-4 space-y-2 list-decimal list-inside text-slate-300 text-sm leading-relaxed pl-2">
            {items.map((it, i) => (
              <li key={i}>{it.replace(/^\d+\.\s+/, '')}</li>
            ))}
          </ol>
        );
      }

      return (
        <p key={idx} className="my-4 text-slate-300 text-base leading-relaxed">
          {trimmed}
        </p>
      );
    });
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-xs text-slate-400 mb-8">
        <button
          onClick={() => onNavigate('/')}
          className="hover:text-white transition-colors"
        >
          Home
        </button>
        <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
        <span className="text-slate-400">{page.title}</span>
      </nav>

      {/* Page Header */}
      <header className="mb-10 pb-6 border-b border-slate-800">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-orange-400 mb-2">
          <FileText className="w-4 h-4" />
          <span>Documentation / Page</span>
        </div>
        <h1 className="font-display text-3xl sm:text-4xl font-extrabold text-white">
          {page.title}
        </h1>
        <div className="text-xs text-slate-500 font-mono mt-2">
          Updated: {new Date(page.updatedAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
        </div>
      </header>

      {/* Page Body */}
      <div className="prose-content">{renderContent(page.content)}</div>
    </div>
  );
};
