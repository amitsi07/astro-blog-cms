import React from 'react';
import { Tag, Post, User, Category } from '../../types/cms';
import { Tag as TagIcon, Clock, ArrowRight } from 'lucide-react';

interface TagArchiveProps {
  tagSlug: string;
  tags: Tag[];
  posts: Post[];
  categories: Category[];
  users: User[];
  onNavigate: (path: string) => void;
}

export const TagArchive: React.FC<TagArchiveProps> = ({
  tagSlug,
  tags,
  posts,
  categories,
  users,
  onNavigate,
}) => {
  const currentTag = tags.find((t) => t.slug === tagSlug) || {
    id: 'unknown',
    name: tagSlug,
    slug: tagSlug,
  };

  const publishedPosts = posts.filter(
    (p) => p.status === 'published' && p.tags?.includes(tagSlug)
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Tag Header */}
      <div className="rounded-3xl border border-slate-800 bg-[#0a0f1b] p-8 sm:p-10">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-orange-400 mb-2">
          <TagIcon className="w-4 h-4" />
          <span>Tag Archive</span>
          <span>·</span>
          <span>{publishedPosts.length} Articles</span>
        </div>
        <h1 className="font-display text-3xl sm:text-4xl font-extrabold text-white mb-2">
          #{currentTag.name}
        </h1>
        <p className="text-slate-400 text-xs sm:text-sm font-mono">
          URL: /tag/{tagSlug}
        </p>
      </div>

      {/* Post Grid */}
      {publishedPosts.length === 0 ? (
        <div className="p-16 text-center text-slate-500 rounded-2xl border border-slate-800 bg-[#080c14]">
          No published articles found tagged with #{currentTag.name}.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {publishedPosts.map((post) => {
            const author = users.find((u) => u.id === post.authorId);
            const cat = categories.find((c) => c.id === post.categoryId);

            return (
              <article
                key={post.id}
                onClick={() => onNavigate(`/${post.slug}`)}
                className="group rounded-2xl border border-slate-800/80 bg-[#0a0e17] hover:border-slate-700 hover:bg-[#0e1422] transition-all cursor-pointer overflow-hidden flex flex-col justify-between"
              >
                <div>
                  <div className="aspect-video w-full overflow-hidden border-b border-slate-800/60 bg-slate-950">
                    <img
                      src={post.featuredImage}
                      alt={post.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <div className="p-5 space-y-3">
                    <div className="flex items-center gap-2 text-xs text-slate-400">
                      <span style={{ color: cat?.color || '#38bdf8' }}>{cat?.name}</span>
                      <span>·</span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {post.readingTimeMinutes} min read
                      </span>
                    </div>
                    <h3 className="font-display text-base font-bold text-white group-hover:text-orange-400 transition-colors line-clamp-2">
                      {post.title}
                    </h3>
                    <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                      {post.excerpt}
                    </p>
                  </div>
                </div>

                <div className="p-5 pt-0 flex items-center justify-between border-t border-slate-800/50 mt-4 text-xs">
                  <span className="text-slate-400">{author?.name || 'Editorial Team'}</span>
                  <span className="text-orange-400 group-hover:translate-x-1 transition-transform flex items-center gap-1 font-medium">
                    <span>Read Article</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
};
