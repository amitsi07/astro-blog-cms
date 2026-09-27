import React, { useState } from 'react';
import { StorageService } from '../../services/storage';
import { postToAstroMarkdown } from '../../services/cloudflareExport';
import { Post, Category } from '../../types/cms';
import { Download, Upload, RotateCcw, Check, AlertTriangle, FileText, X } from 'lucide-react';

interface ImportExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  posts: Post[];
  categories: Category[];
  onDatabaseRestored: () => void;
}

export const ImportExportModal: React.FC<ImportExportModalProps> = ({
  isOpen,
  onClose,
  posts,
  categories,
  onDatabaseRestored,
}) => {
  const [jsonInput, setJsonInput] = useState('');
  const [statusMsg, setStatusMsg] = useState<{ text: string; error?: boolean } | null>(null);

  if (!isOpen) return null;

  const handleExportJson = () => {
    const jsonStr = StorageService.exportDatabaseJson();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `astro-blog-cms-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setStatusMsg({ text: 'Database exported as JSON backup!' });
  };

  const handleExportMarkdownZip = () => {
    // Generate text file of all posts with Astro frontmatter
    let fullOutput = '';
    posts.forEach((p) => {
      const cat = categories.find((c) => c.id === p.categoryId)?.name || 'General';
      fullOutput += `\n/* ===== FILE: src/content/blog/${p.slug}.mdx ===== */\n\n`;
      fullOutput += postToAstroMarkdown(p, cat);
      fullOutput += '\n\n';
    });

    const blob = new Blob([fullOutput], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `astro-posts-frontmatter-${new Date().toISOString().split('T')[0]}.md`;
    a.click();
    URL.revokeObjectURL(url);
    setStatusMsg({ text: 'Exported all posts formatted with Astro Markdown/MDX frontmatter!' });
  };

  const handleImportJson = () => {
    if (!jsonInput.trim()) {
      setStatusMsg({ text: 'Please paste JSON data first.', error: true });
      return;
    }
    const success = StorageService.importDatabaseJson(jsonInput);
    if (success) {
      setStatusMsg({ text: 'Database successfully restored from JSON!' });
      setJsonInput('');
      onDatabaseRestored();
    } else {
      setStatusMsg({ text: 'Failed to parse JSON backup. Check format.', error: true });
    }
  };

  const handleResetDefaults = () => {
    if (confirm('Are you sure you want to reset all posts, settings, and database entities to original seed data?')) {
      StorageService.resetToDefault();
      setStatusMsg({ text: 'Database reset to initial production seeds.' });
      onDatabaseRestored();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="w-full max-w-2xl rounded-3xl border border-slate-800 bg-[#0d131f] shadow-2xl p-6 sm:p-8 space-y-6">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div>
            <h3 className="font-display text-lg font-bold text-white">
              Data Management & Astro Markdown Export
            </h3>
            <p className="text-xs text-slate-400">
              Backup your CMS database, export Astro content collection files, or restore snapshots.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {statusMsg && (
          <div
            className={`p-3 rounded-xl border text-xs flex items-center gap-2 ${
              statusMsg.error
                ? 'bg-rose-950/40 border-rose-500/40 text-rose-300'
                : 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300'
            }`}
          >
            <Check className="w-4 h-4 flex-shrink-0" />
            <span>{statusMsg.text}</span>
          </div>
        )}

        {/* Action Buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-4 rounded-2xl border border-slate-800 bg-[#090d16] space-y-3">
            <h4 className="font-semibold text-xs text-white uppercase tracking-wider flex items-center gap-2">
              <Download className="w-4 h-4 text-orange-400" />
              <span>Full Database JSON Export</span>
            </h4>
            <p className="text-xs text-slate-400">
              Exports posts, categories, media, tags, settings, and users into a standalone JSON file.
            </p>
            <button
              onClick={handleExportJson}
              className="w-full py-2 px-3 rounded-xl bg-orange-600 hover:bg-orange-500 text-white font-semibold text-xs transition-colors"
            >
              Download JSON Database
            </button>
          </div>

          <div className="p-4 rounded-2xl border border-slate-800 bg-[#090d16] space-y-3">
            <h4 className="font-semibold text-xs text-white uppercase tracking-wider flex items-center gap-2">
              <FileText className="w-4 h-4 text-emerald-400" />
              <span>Astro .mdx Posts Export</span>
            </h4>
            <p className="text-xs text-slate-400">
              Generates individual Astro Content Collection Markdown files with YAML frontmatter.
            </p>
            <button
              onClick={handleExportMarkdownZip}
              className="w-full py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs transition-colors"
            >
              Export Astro Markdown
            </button>
          </div>
        </div>

        {/* JSON Import Section */}
        <div className="p-4 rounded-2xl border border-slate-800 bg-[#090d16] space-y-3">
          <h4 className="font-semibold text-xs text-white uppercase tracking-wider flex items-center gap-2">
            <Upload className="w-4 h-4 text-blue-400" />
            <span>Restore / Import JSON Database</span>
          </h4>
          <textarea
            rows={3}
            value={jsonInput}
            onChange={(e) => setJsonInput(e.target.value)}
            placeholder="Paste your JSON backup payload here..."
            className="w-full p-3 font-mono text-xs rounded-xl border border-slate-800 bg-[#060910] text-slate-200 focus:outline-none focus:border-orange-500 resize-none"
          />
          <div className="flex items-center justify-end">
            <button
              onClick={handleImportJson}
              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs transition-colors"
            >
              Restore from JSON
            </button>
          </div>
        </div>

        {/* Reset Database */}
        <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
          <span className="text-xs text-slate-500">
            Troubleshooting or testing fresh installation?
          </span>
          <button
            onClick={handleResetDefaults}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-rose-500/30 bg-rose-950/20 hover:bg-rose-950/40 text-rose-300 text-xs font-medium"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset to Production Seed Data</span>
          </button>
        </div>
      </div>
    </div>
  );
};
