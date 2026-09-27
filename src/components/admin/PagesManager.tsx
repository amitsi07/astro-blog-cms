import React, { useState } from 'react';
import { StaticPage } from '../../types/cms';
import { FileText, Edit2, Plus, Eye, Check, Globe } from 'lucide-react';

interface PagesManagerProps {
  pages: StaticPage[];
  onSavePage: (page: StaticPage) => void;
  onPreviewPage: (slug: string) => void;
}

export const PagesManager: React.FC<PagesManagerProps> = ({
  pages,
  onSavePage,
  onPreviewPage,
}) => {
  const [editingPage, setEditingPage] = useState<StaticPage | null>(null);
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [content, setContent] = useState('');
  const [seoTitle, setSeoTitle] = useState('');
  const [metaDesc, setMetaDesc] = useState('');

  const handleStartEdit = (page: StaticPage) => {
    setEditingPage(page);
    setTitle(page.title);
    setSlug(page.slug);
    setContent(page.content);
    setSeoTitle(page.seoTitle || '');
    setMetaDesc(page.metaDescription || '');
  };

  const handleSaveSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPage || !title.trim()) return;

    onSavePage({
      ...editingPage,
      title: title.trim(),
      slug: slug.trim(),
      content: content.trim(),
      seoTitle: seoTitle.trim(),
      metaDescription: metaDesc.trim(),
      updatedAt: new Date().toISOString(),
    });

    setEditingPage(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-display text-2xl font-bold text-white">Pages Management</h2>
          <p className="text-xs text-slate-400">
            Edit institutional documentation: About, Contact, Privacy Policy, Terms, and custom pages.
          </p>
        </div>
      </div>

      {editingPage ? (
        <form onSubmit={handleSaveSubmit} className="p-6 rounded-2xl border border-slate-800 bg-[#090d16] space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <h3 className="font-display text-base font-bold text-white">
              Editing Page: {editingPage.title}
            </h3>
            <button
              type="button"
              onClick={() => setEditingPage(null)}
              className="text-xs text-slate-400 hover:text-white"
            >
              Cancel
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
                Page Title *
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-800 bg-slate-900 text-white"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
                Route Slug *
              </label>
              <input
                type="text"
                required
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-800 bg-slate-900 text-white font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
              Page Content (Markdown)
            </label>
            <textarea
              rows={12}
              required
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full p-4 font-mono text-xs rounded-xl border border-slate-800 bg-[#060910] text-slate-200 leading-relaxed resize-y"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
                SEO Title
              </label>
              <input
                type="text"
                value={seoTitle}
                onChange={(e) => setSeoTitle(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-800 bg-slate-900 text-white"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
                SEO Meta Description
              </label>
              <input
                type="text"
                value={metaDesc}
                onChange={(e) => setMetaDesc(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-800 bg-slate-900 text-white"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={() => setEditingPage(null)}
              className="px-3.5 py-1.5 text-xs text-slate-400 hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-orange-600 hover:bg-orange-500 text-white text-xs font-semibold"
            >
              Save Page Changes
            </button>
          </div>
        </form>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-slate-800 bg-[#090d16]">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#060910] text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-800">
              <tr>
                <th className="px-5 py-3.5">Page Title</th>
                <th className="px-4 py-3.5">URL Path</th>
                <th className="px-4 py-3.5">Last Updated</th>
                <th className="px-5 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {pages.map((p) => (
                <tr key={p.id} className="hover:bg-slate-800/30 transition-colors">
                  <td className="px-5 py-4 font-semibold text-white">{p.title}</td>
                  <td className="px-4 py-4 font-mono text-slate-400">/{p.slug}</td>
                  <td className="px-4 py-4 text-slate-400">
                    {new Date(p.updatedAt).toLocaleDateString()}
                  </td>
                  <td className="px-5 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => onPreviewPage(`/${p.slug}`)}
                        className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white"
                        title="View Public Page"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleStartEdit(p)}
                        className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200"
                      >
                        <Edit2 className="w-3 h-3" />
                        <span>Edit</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
