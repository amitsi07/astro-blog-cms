import React, { useState } from 'react';
import { Post, Category, User } from '../../types/cms';
import {
  Plus,
  Search,
  Filter,
  Eye,
  Edit3,
  Copy,
  Trash2,
  RotateCcw,
  Clock,
  Send,
  MoreVertical,
} from 'lucide-react';

interface PostListProps {
  posts: Post[];
  categories: Category[];
  users: User[];
  onNewPost: () => void;
  onEditPost: (post: Post) => void;
  onDuplicatePost: (id: string) => void;
  onPreviewPost: (post: Post) => void;
  onMoveToTrash: (id: string) => void;
  onRestoreFromTrash: (id: string) => void;
  onDeletePermanent: (id: string) => void;
  onPublishPost: (id: string) => void;
}

export const PostList: React.FC<PostListProps> = ({
  posts,
  categories,
  users,
  onNewPost,
  onEditPost,
  onDuplicatePost,
  onPreviewPost,
  onMoveToTrash,
  onRestoreFromTrash,
  onDeletePermanent,
  onPublishPost,
}) => {
  const [statusFilter, setStatusFilter] = useState<'all' | 'published' | 'scheduled' | 'draft' | 'trash'>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Counts for tabs
  const counts = {
    all: posts.filter((p) => p.status !== 'trash').length,
    published: posts.filter((p) => p.status === 'published').length,
    scheduled: posts.filter((p) => p.status === 'scheduled').length,
    draft: posts.filter((p) => p.status === 'draft').length,
    trash: posts.filter((p) => p.status === 'trash').length,
  };

  const filteredPosts = posts.filter((p) => {
    // Status filter
    if (statusFilter === 'trash') {
      if (p.status !== 'trash') return false;
    } else {
      if (p.status === 'trash') return false;
      if (statusFilter !== 'all' && p.status !== statusFilter) return false;
    }

    // Category filter
    if (categoryFilter !== 'all' && p.categoryId !== categoryFilter) return false;

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        p.title.toLowerCase().includes(q) ||
        p.slug.toLowerCase().includes(q) ||
        p.excerpt?.toLowerCase().includes(q)
      );
    }

    return true;
  });

  return (
    <div className="space-y-6">
      {/* Top Header & New Post button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-display text-2xl font-bold text-white">Articles & Publications</h2>
          <p className="text-xs text-slate-400">
            Manage your Astro blog articles, publishing workflows, and content revisions.
          </p>
        </div>
        <button
          onClick={onNewPost}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-orange-600 hover:bg-orange-500 text-white font-semibold text-xs shadow-md shadow-orange-600/25 transition-all active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>Create Article</span>
        </button>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="p-4 rounded-2xl border border-slate-800 bg-[#090d16] space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Status Tabs */}
          <div className="flex items-center gap-1 overflow-x-auto pb-1">
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                statusFilter === 'all'
                  ? 'bg-slate-800 text-white'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              All ({counts.all})
            </button>
            <button
              onClick={() => setStatusFilter('published')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                statusFilter === 'published'
                  ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-500/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Published ({counts.published})
            </button>
            <button
              onClick={() => setStatusFilter('scheduled')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                statusFilter === 'scheduled'
                  ? 'bg-blue-950/60 text-blue-400 border border-blue-500/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Scheduled ({counts.scheduled})
            </button>
            <button
              onClick={() => setStatusFilter('draft')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                statusFilter === 'draft'
                  ? 'bg-amber-950/60 text-amber-400 border border-amber-500/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Drafts ({counts.draft})
            </button>
            <button
              onClick={() => setStatusFilter('trash')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                statusFilter === 'trash'
                  ? 'bg-rose-950/60 text-rose-400 border border-rose-500/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Trash ({counts.trash})
            </button>
          </div>

          {/* Search Box & Category Dropdown */}
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search title, slug..."
                className="pl-8 pr-3 py-1.5 text-xs rounded-lg border border-slate-800 bg-slate-900 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-orange-500"
              />
            </div>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-2.5 py-1.5 text-xs rounded-lg border border-slate-800 bg-slate-900 text-slate-300 focus:outline-none"
            >
              <option value="all">All Categories</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Table of Articles */}
      <div className="overflow-hidden rounded-2xl border border-slate-800 bg-[#090d16]">
        {filteredPosts.length === 0 ? (
          <div className="p-12 text-center text-slate-500 text-sm">
            No articles match the current filter criteria.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#060910] text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-800">
                <tr>
                  <th className="px-5 py-3.5">Title & Clean URL</th>
                  <th className="px-4 py-3.5">Category</th>
                  <th className="px-4 py-3.5">Author</th>
                  <th className="px-4 py-3.5">Status</th>
                  <th className="px-4 py-3.5">Views</th>
                  <th className="px-4 py-3.5">Date</th>
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredPosts.map((post) => {
                  const cat = categories.find((c) => c.id === post.categoryId);
                  const author = users.find((u) => u.id === post.authorId);

                  return (
                    <tr
                      key={post.id}
                      className="hover:bg-slate-800/30 transition-colors group"
                    >
                      {/* Title & Slug */}
                      <td className="px-5 py-4 max-w-sm">
                        <div className="flex items-center gap-3">
                          {post.featuredImage && (
                            <img
                              src={post.featuredImage}
                              alt={post.title}
                              className="w-12 h-9 rounded-lg object-cover flex-shrink-0 border border-slate-800"
                            />
                          )}
                          <div className="min-w-0">
                            <button
                              onClick={() => onEditPost(post)}
                              className="font-semibold text-slate-100 hover:text-orange-400 transition-colors text-left line-clamp-1 block text-sm"
                            >
                              {post.title}
                            </button>
                            <span className="font-mono text-[11px] text-slate-500 truncate block mt-0.5">
                              /{post.slug}
                            </span>
                            {/* WordPress style action links on hover */}
                            <div className="flex items-center gap-2 text-[11px] mt-1 pt-0.5 opacity-90 group-hover:opacity-100 font-medium">
                              <button
                                onClick={() => onEditPost(post)}
                                className="text-orange-400 hover:underline"
                              >
                                Edit
                              </button>
                              <span className="text-slate-600">|</span>
                              <button
                                onClick={() => onDuplicatePost(post.id)}
                                className="text-slate-400 hover:text-white"
                              >
                                Duplicate
                              </button>
                              <span className="text-slate-600">|</span>
                              <button
                                onClick={() => onPreviewPost(post)}
                                className="text-slate-400 hover:text-white"
                              >
                                View
                              </button>
                              <span className="text-slate-600">|</span>
                              <button
                                onClick={() => onMoveToTrash(post.id)}
                                className="text-rose-400 hover:underline"
                              >
                                Trash
                              </button>
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Category */}
                      <td className="px-4 py-4 whitespace-nowrap">
                        <span
                          className="font-medium px-2 py-0.5 rounded text-[11px] bg-slate-900 border border-slate-800"
                          style={{ color: cat?.color || '#94a3b8' }}
                        >
                          {cat?.name || 'General'}
                        </span>
                      </td>

                      {/* Author */}
                      <td className="px-4 py-4 whitespace-nowrap text-slate-300">
                        {author?.name || 'Unknown'}
                      </td>

                      {/* Status */}
                      <td className="px-4 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-mono font-semibold uppercase ${
                            post.status === 'published'
                              ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-500/30'
                              : post.status === 'scheduled'
                              ? 'bg-blue-950/60 text-blue-400 border border-blue-500/30'
                              : post.status === 'trash'
                              ? 'bg-rose-950/60 text-rose-400 border border-rose-500/30'
                              : 'bg-amber-950/60 text-amber-400 border border-amber-500/30'
                          }`}
                        >
                          {post.status}
                        </span>
                      </td>

                      {/* Views */}
                      <td className="px-4 py-4 whitespace-nowrap font-mono text-slate-400">
                        {post.views.toLocaleString()}
                      </td>

                      {/* Date */}
                      <td className="px-4 py-4 whitespace-nowrap text-slate-400 text-[11px]">
                        {new Date(post.publishedAt || post.createdAt).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </td>

                      {/* Action buttons */}
                      <td className="px-5 py-4 whitespace-nowrap text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {post.status === 'trash' ? (
                            <>
                              <button
                                onClick={() => onRestoreFromTrash(post.id)}
                                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200"
                                title="Restore article"
                              >
                                <RotateCcw className="w-3.5 h-3.5 text-emerald-400" />
                              </button>
                              <button
                                onClick={() => onDeletePermanent(post.id)}
                                className="p-1.5 rounded-lg bg-rose-950/40 hover:bg-rose-900/60 text-rose-400"
                                title="Delete Permanently"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </>
                          ) : (
                            <>
                              <button
                                onClick={() => onPreviewPost(post)}
                                className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white"
                                title="Live Preview"
                              >
                                <Eye className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => onEditPost(post)}
                                className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white"
                                title="Edit Post"
                              >
                                <Edit3 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => onDuplicatePost(post.id)}
                                className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white"
                                title="Duplicate Post"
                              >
                                <Copy className="w-3.5 h-3.5" />
                              </button>
                              {post.status === 'draft' && (
                                <button
                                  onClick={() => onPublishPost(post.id)}
                                  className="p-1.5 rounded-lg bg-emerald-950/40 hover:bg-emerald-900/60 text-emerald-400"
                                  title="Publish Now"
                                >
                                  <Send className="w-3.5 h-3.5" />
                                </button>
                              )}
                              <button
                                onClick={() => onMoveToTrash(post.id)}
                                className="p-1.5 rounded-lg bg-slate-900 hover:bg-rose-950/40 text-slate-500 hover:text-rose-400"
                                title="Move to Trash"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
