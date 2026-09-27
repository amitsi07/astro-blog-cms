import React, { useState } from 'react';
import { Category, Tag, Post } from '../../types/cms';
import { Plus, Edit2, Trash2, Folder, Tag as TagIcon, Check } from 'lucide-react';

interface CategoryManagerProps {
  categories: Category[];
  tags: Tag[];
  posts: Post[];
  onSaveCategory: (cat: Category) => void;
  onDeleteCategory: (id: string) => void;
  onSaveTag: (tag: Tag) => void;
  onDeleteTag: (id: string) => void;
}

export const CategoryManager: React.FC<CategoryManagerProps> = ({
  categories,
  tags,
  posts,
  onSaveCategory,
  onDeleteCategory,
  onSaveTag,
  onDeleteTag,
}) => {
  // Category Form
  const [editingCatId, setEditingCatId] = useState<string | null>(null);
  const [catName, setCatName] = useState('');
  const [catSlug, setCatSlug] = useState('');
  const [catDesc, setCatDesc] = useState('');
  const [catColor, setCatColor] = useState('#6366f1');

  // Tag Form
  const [editingTagId, setEditingTagId] = useState<string | null>(null);
  const [tagName, setTagName] = useState('');
  const [tagSlug, setTagSlug] = useState('');

  const handleStartEditCat = (cat: Category) => {
    setEditingCatId(cat.id);
    setCatName(cat.name);
    setCatSlug(cat.slug);
    setCatDesc(cat.description);
    setCatColor(cat.color || '#6366f1');
  };

  const handleResetCatForm = () => {
    setEditingCatId(null);
    setCatName('');
    setCatSlug('');
    setCatDesc('');
    setCatColor('#6366f1');
  };

  const handleSaveCat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!catName.trim()) return;

    const slug = catSlug.trim() || catName.toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-');
    onSaveCategory({
      id: editingCatId || `cat-${Date.now()}`,
      name: catName.trim(),
      slug,
      description: catDesc.trim(),
      color: catColor,
    });
    handleResetCatForm();
  };

  const handleSaveTagSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!tagName.trim()) return;

    const slug = tagSlug.trim() || tagName.toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-');
    onSaveTag({
      id: editingTagId || `tag-${Date.now()}`,
      name: tagName.trim(),
      slug,
    });
    setEditingTagId(null);
    setTagName('');
    setTagSlug('');
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
      {/* Categories Column */}
      <div className="lg:col-span-7 space-y-6">
        <div className="p-6 rounded-2xl border border-slate-800 bg-[#090d16] space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-800">
            <Folder className="w-5 h-5 text-orange-400" />
            <h3 className="font-display text-lg font-bold text-white">Categories</h3>
          </div>

          {/* Category Edit/Create Form */}
          <form onSubmit={handleSaveCat} className="space-y-3 p-4 rounded-xl border border-slate-800 bg-[#060910]">
            <div className="text-xs font-semibold text-slate-300">
              {editingCatId ? 'Edit Category' : 'Add New Category'}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <input
                type="text"
                required
                placeholder="Category Name *"
                value={catName}
                onChange={(e) => {
                  setCatName(e.target.value);
                  if (!editingCatId) {
                    setCatSlug(e.target.value.toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-'));
                  }
                }}
                className="px-3 py-2 text-xs rounded-lg border border-slate-800 bg-slate-900 text-white"
              />
              <input
                type="text"
                required
                placeholder="Slug (e.g. technology)"
                value={catSlug}
                onChange={(e) => setCatSlug(e.target.value)}
                className="px-3 py-2 text-xs rounded-lg border border-slate-800 bg-slate-900 text-white font-mono"
              />
            </div>
            <textarea
              rows={2}
              placeholder="Category description for archives & SEO..."
              value={catDesc}
              onChange={(e) => setCatDesc(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-lg border border-slate-800 bg-slate-900 text-white resize-none"
            />
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400">Accent Color:</span>
                <input
                  type="color"
                  value={catColor}
                  onChange={(e) => setCatColor(e.target.value)}
                  className="w-7 h-7 rounded border-0 cursor-pointer bg-transparent"
                />
              </div>
              <div className="flex items-center gap-2">
                {editingCatId && (
                  <button
                    type="button"
                    onClick={handleResetCatForm}
                    className="px-3 py-1.5 text-xs rounded-lg text-slate-400 hover:text-white"
                  >
                    Cancel
                  </button>
                )}
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-orange-600 hover:bg-orange-500 text-white text-xs font-semibold"
                >
                  {editingCatId ? 'Save Changes' : 'Add Category'}
                </button>
              </div>
            </div>
          </form>

          {/* Categories List */}
          <div className="space-y-3">
            {categories.map((c) => {
              const postCount = posts.filter((p) => p.categoryId === c.id && p.status !== 'trash').length;
              return (
                <div
                  key={c.id}
                  className="p-3.5 rounded-xl border border-slate-800 bg-[#080c14] flex items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-3">
                    <span
                      className="w-3.5 h-3.5 rounded-full flex-shrink-0"
                      style={{ backgroundColor: c.color }}
                    />
                    <div>
                      <div className="font-semibold text-xs text-white flex items-center gap-2">
                        <span>{c.name}</span>
                        <span className="font-mono text-[11px] text-slate-500">/category/{c.slug}</span>
                      </div>
                      <p className="text-[11px] text-slate-400 line-clamp-1">{c.description}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className="px-2 py-0.5 rounded text-[10px] bg-slate-900 text-slate-400 border border-slate-800 font-mono">
                      {postCount} posts
                    </span>
                    <button
                      onClick={() => handleStartEditCat(c)}
                      className="p-1 text-slate-400 hover:text-white"
                      title="Edit"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => onDeleteCategory(c.id)}
                      className="p-1 text-slate-500 hover:text-rose-400"
                      title="Delete"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Tags Column */}
      <div className="lg:col-span-5 space-y-6">
        <div className="p-6 rounded-2xl border border-slate-800 bg-[#090d16] space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-800">
            <TagIcon className="w-5 h-5 text-orange-400" />
            <h3 className="font-display text-lg font-bold text-white">Tags</h3>
          </div>

          {/* Tag Add Form */}
          <form onSubmit={handleSaveTagSubmit} className="space-y-3 p-4 rounded-xl border border-slate-800 bg-[#060910]">
            <div className="text-xs font-semibold text-slate-300">
              {editingTagId ? 'Edit Tag' : 'Add New Tag'}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                required
                placeholder="Tag Name (e.g. Astro)"
                value={tagName}
                onChange={(e) => setTagName(e.target.value)}
                className="flex-1 px-3 py-1.5 text-xs rounded-lg border border-slate-800 bg-slate-900 text-white"
              />
              <button
                type="submit"
                className="px-3 py-1.5 rounded-lg bg-orange-600 hover:bg-orange-500 text-white text-xs font-semibold"
              >
                {editingTagId ? 'Save' : 'Add'}
              </button>
            </div>
          </form>

          {/* Tags Cloud / List */}
          <div className="flex flex-wrap gap-2">
            {tags.map((t) => {
              const count = posts.filter((p) => p.tags?.includes(t.slug) && p.status !== 'trash').length;
              return (
                <div
                  key={t.id}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-800 bg-[#080c14] text-xs text-slate-300"
                >
                  <span className="font-medium">#{t.name}</span>
                  <span className="text-[10px] text-slate-500 font-mono">({count})</span>
                  <button
                    onClick={() => onDeleteTag(t.id)}
                    className="p-0.5 text-slate-500 hover:text-rose-400 ml-1"
                    title="Delete Tag"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
