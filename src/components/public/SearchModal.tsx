import React, { useState, useEffect, useRef } from 'react';
import { Search, X, ArrowRight, Clock } from 'lucide-react';
import { Post, Category } from '../../types/cms';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  posts: Post[];
  categories: Category[];
  onSelectPost: (slug: string) => void;
  onSelectCategory: (slug: string) => void;
}

export const SearchModal: React.FC<SearchModalProps> = ({
  isOpen,
  onClose,
  posts,
  categories,
  onSelectPost,
  onSelectCategory,
}) => {
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery('');
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const publishedPosts = posts.filter((p) => p.status === 'published');
  const cleanQ = query.trim().toLowerCase();

  const filteredPosts = cleanQ
    ? publishedPosts.filter(
        (p) =>
          p.title.toLowerCase().includes(cleanQ) ||
          p.excerpt?.toLowerCase().includes(cleanQ) ||
          p.tags?.some((t) => t.toLowerCase().includes(cleanQ))
      )
    : publishedPosts.slice(0, 4);

  const matchedCategories = cleanQ
    ? categories.filter(
        (c) =>
          c.name.toLowerCase().includes(cleanQ) ||
          c.description?.toLowerCase().includes(cleanQ)
      )
    : [];

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 px-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div
        className="w-full max-w-2xl rounded-2xl border border-slate-800 bg-[#0d131f] shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input Bar */}
        <div className="flex items-center px-4 py-3.5 border-b border-slate-800 bg-[#080c14]">
          <Search className="w-5 h-5 text-slate-400 mr-3 flex-shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search articles, prompt blueprints, edge guides, or tags... (Press Esc to close)"
            className="w-full bg-transparent text-white placeholder-slate-500 text-sm focus:outline-none"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="p-1 text-slate-400 hover:text-white mr-2"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <span className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] font-mono rounded border border-slate-700 bg-slate-800 text-slate-400">
            ESC
          </span>
        </div>

        {/* Results Body */}
        <div className="max-h-[60vh] overflow-y-auto p-3 divide-y divide-slate-800/40">
          {/* Matched Categories */}
          {matchedCategories.length > 0 && (
            <div className="pb-3 mb-2">
              <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider px-3 py-1">
                Categories
              </div>
              <div className="grid grid-cols-2 gap-2 px-1 mt-1">
                {matchedCategories.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => {
                      onSelectCategory(c.slug);
                      onClose();
                    }}
                    className="flex items-center justify-between p-2.5 rounded-lg border border-slate-800/80 bg-slate-900/40 hover:bg-slate-800/60 text-left transition-colors"
                  >
                    <div>
                      <div className="text-xs font-semibold text-white">{c.name}</div>
                      <div className="text-[11px] text-slate-400 truncate max-w-[180px]">
                        {c.description}
                      </div>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-500" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Matched Posts */}
          <div className="pt-2">
            <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider px-3 py-1">
              {cleanQ ? `Articles (${filteredPosts.length})` : 'Popular Articles'}
            </div>
            {filteredPosts.length === 0 ? (
              <div className="p-8 text-center text-slate-500 text-sm">
                No matching articles found for "{query}". Try searching for "Reels", "Cloudflare", or "Astro".
              </div>
            ) : (
              <div className="space-y-1 mt-1">
                {filteredPosts.map((post) => {
                  const cat = categories.find((c) => c.id === post.categoryId);
                  return (
                    <button
                      key={post.id}
                      onClick={() => {
                        onSelectPost(post.slug);
                        onClose();
                      }}
                      className="w-full text-left p-3 rounded-xl hover:bg-slate-800/60 transition-colors flex items-start justify-between group"
                    >
                      <div className="pr-4">
                        <div className="flex items-center gap-2 text-[11px] text-slate-400 mb-1">
                          <span
                            className="font-medium"
                            style={{ color: cat?.color || '#38bdf8' }}
                          >
                            {cat?.name || 'General'}
                          </span>
                          <span>·</span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {post.readingTimeMinutes} min read
                          </span>
                        </div>
                        <h4 className="text-sm font-medium text-slate-200 group-hover:text-white group-hover:translate-x-0.5 transition-all">
                          {post.title}
                        </h4>
                        <p className="text-xs text-slate-400 line-clamp-1 mt-0.5">
                          {post.excerpt}
                        </p>
                      </div>
                      <ArrowRight className="w-4 h-4 text-slate-600 group-hover:text-orange-400 flex-shrink-0 mt-2 transition-colors" />
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Footer info */}
        <div className="px-4 py-2.5 bg-[#090d16] border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
          <span>Search matches titles, excerpts, body, and tags</span>
          <span className="font-mono">Clean URLs: /article-slug</span>
        </div>
      </div>
    </div>
  );
};
