import React, { useState } from 'react';
import { Post, User, Category } from '../../types/cms';
import { ContentBlockRenderer } from '../common/ContentBlockRenderer';
import {
  X,
  Monitor,
  Tablet,
  Smartphone,
  Calendar,
  Clock,
  ExternalLink,
  BookOpen,
} from 'lucide-react';

interface LivePreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  post: Post;
  author: User;
  category?: Category;
}

export const LivePreviewModal: React.FC<LivePreviewModalProps> = ({
  isOpen,
  onClose,
  post,
  author,
  category,
}) => {
  const [deviceMode, setDeviceMode] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');

  if (!isOpen) return null;

  const deviceWidthClasses = {
    desktop: 'w-full max-w-5xl',
    tablet: 'w-full max-w-[768px]',
    mobile: 'w-full max-w-[390px]',
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-black/90 backdrop-blur-md">
      {/* Top Preview Control Bar */}
      <div className="flex items-center justify-between px-6 py-3.5 bg-[#080c14] border-b border-slate-800 text-slate-200">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="font-semibold text-sm">Live Preview Mode</span>
          </div>
          <span className="text-xs text-slate-500 font-mono hidden sm:inline">
            Clean URL: /{post.slug || 'untitled-draft'}
          </span>
        </div>

        {/* Viewport Switcher */}
        <div className="flex items-center gap-1 p-1 bg-slate-900 border border-slate-800 rounded-xl">
          <button
            onClick={() => setDeviceMode('desktop')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              deviceMode === 'desktop'
                ? 'bg-orange-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Monitor className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Desktop</span>
          </button>
          <button
            onClick={() => setDeviceMode('tablet')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              deviceMode === 'tablet'
                ? 'bg-orange-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Tablet className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Tablet</span>
          </button>
          <button
            onClick={() => setDeviceMode('mobile')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              deviceMode === 'mobile'
                ? 'bg-orange-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Mobile</span>
          </button>
        </div>

        {/* Close Button */}
        <button
          onClick={onClose}
          className="p-2 rounded-lg bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Main Preview Frame Container */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-8 flex justify-center bg-[#05070c]">
        <div
          className={`${deviceWidthClasses[deviceMode]} transition-all duration-300 bg-[#0b0f17] border border-slate-800 rounded-2xl shadow-2xl p-6 sm:p-10 my-auto`}
        >
          {/* Breadcrumb Preview */}
          <div className="text-xs text-slate-500 mb-4 flex items-center gap-1.5">
            <span>Home</span>
            <span>/</span>
            <span style={{ color: category?.color || '#38bdf8' }}>
              {category?.name || 'Category'}
            </span>
            <span>/</span>
            <span className="text-slate-400 truncate">{post.title || 'Untitled'}</span>
          </div>

          {/* Article Header */}
          <div className="mb-6 space-y-3">
            <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400">
              <span
                className="font-semibold px-2 py-0.5 rounded bg-slate-900 border border-slate-800"
                style={{ color: category?.color || '#38bdf8' }}
              >
                {category?.name || 'Technology'}
              </span>
              <span>·</span>
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" />
                {new Date().toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </span>
              <span>·</span>
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                {post.readingTimeMinutes || 5} min read
              </span>
            </div>

            <h1 className="font-display text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white leading-tight">
              {post.title || 'Enter your post title in the editor...'}
            </h1>

            {post.subtitle && (
              <p className="text-base sm:text-lg text-slate-300 font-medium leading-relaxed">
                {post.subtitle}
              </p>
            )}

            {post.excerpt && (
              <p className="text-sm sm:text-base text-slate-400 leading-relaxed">
                {post.excerpt}
              </p>
            )}

            {/* Author info */}
            <div className="flex items-center gap-3 pt-3 border-t border-slate-800/80">
              <img
                src={author.avatar}
                alt={author.name}
                className="w-10 h-10 rounded-full object-cover border border-slate-700"
              />
              <div>
                <div className="text-xs font-semibold text-white">{author.name}</div>
                <div className="text-[11px] text-slate-400">{author.title || author.role}</div>
              </div>
            </div>
          </div>

          {/* Featured Image */}
          {post.featuredImage && post.showFeaturedImageInPost !== false && (
            <div className="mb-8 rounded-xl overflow-hidden border border-slate-800">
              <img
                src={post.featuredImage}
                alt={post.title}
                className="w-full h-auto max-h-[420px] object-cover"
              />
              {(post.featuredImageCaption || post.featuredImageCredit) && (
                <div className="p-2.5 text-center text-xs text-slate-400 bg-slate-900/60 border-t border-slate-800 flex items-center justify-center gap-2">
                  {post.featuredImageCaption && <span>{post.featuredImageCaption}</span>}
                  {post.featuredImageCaption && post.featuredImageCredit && (
                    <span className="text-slate-600">·</span>
                  )}
                  {post.featuredImageCredit && (
                    <span className="text-slate-500 italic">Photo: {post.featuredImageCredit}</span>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Markdown & Inline Blocks Content Preview */}
          <div className="prose-content space-y-4 text-sm sm:text-base text-slate-300 leading-relaxed font-sans">
            {(() => {
              const previewRenderedIds = new Set<string>();
              const elements = post.content.split('\n\n').map((paragraph, idx) => {
                const trimmed = paragraph.trim();
                if (!trimmed) return null;

                const blockMatch = trimmed.match(/<!--\s*block:([a-zA-Z0-9_-]+)\s*-->/);
                if (blockMatch) {
                  const blockId = blockMatch[1];
                  const specialBlock = post.blocks?.find((b) => b.id === blockId);
                  if (specialBlock) {
                    previewRenderedIds.add(blockId);
                    return (
                      <div key={`preview-inline-${blockId}-${idx}`} className="my-6">
                        <ContentBlockRenderer block={specialBlock} />
                      </div>
                    );
                  }
                }

                if (trimmed.startsWith('## ')) {
                  return (
                    <h2
                      key={idx}
                      className="font-display text-xl sm:text-2xl font-bold text-white mt-6 mb-3 pb-1 border-b border-slate-800"
                    >
                      {trimmed.replace('## ', '')}
                    </h2>
                  );
                }
                if (trimmed.startsWith('### ')) {
                  return (
                    <h3 key={idx} className="font-display text-lg font-bold text-slate-100 mt-4 mb-2">
                      {trimmed.replace('### ', '')}
                    </h3>
                  );
                }
                return <p key={idx}>{trimmed}</p>;
              });

              const unrendered = (post.blocks || []).filter((b) => !previewRenderedIds.has(b.id));

              return (
                <>
                  {elements}
                  {unrendered.length > 0 && (
                    <div className="mt-8 space-y-6">
                      {unrendered.map((block) => (
                        <ContentBlockRenderer key={block.id} block={block} />
                      ))}
                    </div>
                  )}
                </>
              );
            })()}
          </div>

          {/* Tags */}
          {post.tags && post.tags.length > 0 && (
            <div className="mt-8 pt-4 border-t border-slate-800 flex flex-wrap gap-1.5">
              {post.tags.map((t) => (
                <span
                  key={t}
                  className="px-2.5 py-1 text-xs rounded-lg border border-slate-800 bg-slate-900 text-slate-300"
                >
                  #{t}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
