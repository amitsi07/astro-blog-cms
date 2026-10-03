import React, { useState } from 'react';
import { PostItem } from '../types/prompt';
import { usePrompts } from '../context/PromptContext';
import { 
  Copy, 
  Check, 
  Bookmark, 
  SlidersHorizontal, 
  Sparkles,
  Maximize2,
  FileText,
  Clock
} from 'lucide-react';

interface PromptCardProps {
  post: PostItem;
  onSelectPost?: (post: PostItem) => void;
}

export const PromptCard: React.FC<PromptCardProps> = ({ post, onSelectPost }) => {
  const { 
    favorites, 
    toggleFavorite, 
    incrementCopy, 
    showToast,
    setActivePostModal,
    setActiveCustomizerPrompt
  } = usePrompts();

  const [copied, setCopied] = useState(false);
  const [imageError, setImageError] = useState(false);
  const isFavorite = favorites.includes(post.id);

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!post.prompt) return;
    navigator.clipboard.writeText(post.prompt);
    incrementCopy(post.id);
    setCopied(true);
    showToast('Prompt copied to clipboard!');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCustomize = (e: React.MouseEvent) => {
    e.stopPropagation();
    setActiveCustomizerPrompt(post);
  };

  const handleClick = () => {
    if (onSelectPost) {
      onSelectPost(post);
    } else {
      setActivePostModal(post);
    }
  };

  const hasVariables = post.variables && post.variables.length > 0;

  const getAspectRatioClass = (ratio?: string) => {
    switch (ratio) {
      case '16:9': return 'aspect-[16/9]';
      case '9:16': return 'aspect-[9/16]';
      case '4:3': return 'aspect-[4/3]';
      case '3:4': return 'aspect-[3/4]';
      case '4:5': return 'aspect-[4/5]';
      case '1:1':
      default: return 'aspect-square';
    }
  };

  return (
    <article 
      onClick={handleClick}
      className="group relative bg-[#13151f] rounded-xl overflow-hidden border border-[#212433] hover:border-[#3a3f5a] transition-all duration-200 cursor-pointer flex flex-col justify-between hover:shadow-xl hover:shadow-black/50"
    >
      {/* Media Container */}
      <div className={`relative w-full ${getAspectRatioClass(post.aspectRatio)} overflow-hidden bg-[#181a26]`}>
        {!imageError ? (
          <img
            src={post.image}
            alt={post.title}
            referrerPolicy="no-referrer"
            loading="lazy"
            onError={() => setImageError(true)}
            className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500 ease-out"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center bg-gradient-to-br from-[#181b28] to-[#12131d]">
            <Sparkles className="w-8 h-8 text-violet-400 mb-2 opacity-60" />
            <span className="text-xs text-slate-400 font-medium">{post.title}</span>
          </div>
        )}

        {/* Hover overlay with inspect icon */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-between p-3 pointer-events-none">
          <span className="text-xs text-white/90 font-medium flex items-center gap-1.5 drop-shadow">
            <Maximize2 className="w-3.5 h-3.5 text-violet-400" />
            <span>Read full prompt & guide</span>
          </span>
          <span className="text-[11px] font-mono text-white/80 tabular-nums drop-shadow">
            {post.type === 'prompt' ? `${post.copiesCount} copies` : `${post.viewsCount} views`}
          </span>
        </div>

        {/* Top Floating Buttons: Bookmark */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            toggleFavorite(post.id);
          }}
          className={`absolute top-2.5 right-2.5 p-2 rounded-lg backdrop-blur-md transition-all cursor-pointer ${
            isFavorite 
              ? 'bg-rose-500/90 text-white shadow-md' 
              : 'bg-black/50 text-white/80 hover:bg-black/80 hover:text-white'
          }`}
          title={isFavorite ? 'Remove from saved' : 'Save prompt'}
        >
          <Bookmark className={`w-3.5 h-3.5 ${isFavorite ? 'fill-current' : ''}`} />
        </button>

        {/* Post Type Tag */}
        {post.type === 'article' && (
          <span className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded-md bg-blue-900/80 text-blue-200 text-[10px] font-mono uppercase font-bold backdrop-blur-md border border-blue-700/60">
            Article
          </span>
        )}
      </div>

      {/* Card Content */}
      <div className="p-4 flex flex-col flex-1 justify-between">
        <div>
          {/* Metadata line */}
          <div className="flex items-center gap-2 text-xs text-slate-400 mb-1.5">
            <span className="text-violet-400 font-medium">{post.category}</span>
            {post.model && (
              <>
                <span aria-hidden="true" className="text-slate-600">·</span>
                <span className="font-mono text-slate-300">{post.model}</span>
              </>
            )}
            {post.aspectRatio && (
              <>
                <span aria-hidden="true" className="text-slate-600">·</span>
                <span className="font-mono text-slate-500">{post.aspectRatio}</span>
              </>
            )}
          </div>

          {/* Title */}
          <h2 className="text-base font-semibold text-white tracking-tight group-hover:text-violet-300 transition-colors line-clamp-1 mb-2">
            {post.title}
          </h2>

          {/* Excerpt or Prompt string */}
          {post.type === 'prompt' && post.prompt ? (
            <p className="text-xs text-slate-400 leading-relaxed line-clamp-2 font-mono mb-3 bg-[#0c0d13] p-2 rounded-md border border-[#1d202d]">
              {post.prompt}
            </p>
          ) : (
            <p className="text-xs text-slate-400 leading-relaxed line-clamp-2 mb-3">
              {post.excerpt}
            </p>
          )}

          {/* Tags */}
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] text-slate-500 mb-3">
            {post.tags.slice(0, 3).map((tag) => (
              <span key={tag} className="hover:text-slate-300">
                #{tag}
              </span>
            ))}
          </div>
        </div>

        {/* Card Action Controls */}
        <div className="pt-2 border-t border-[#1b1e2a] flex items-center justify-between gap-2">
          
          {post.type === 'prompt' ? (
            <>
              {hasVariables ? (
                <button
                  onClick={handleCustomize}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-slate-300 bg-[#1a1c29] hover:bg-[#232638] hover:text-white rounded-lg border border-[#2b2f42] transition-colors cursor-pointer"
                  title="Replace variables"
                >
                  <SlidersHorizontal className="w-3 h-3 text-violet-400" />
                  <span>Customize</span>
                </button>
              ) : (
                <span className="text-[11px] text-slate-500 font-mono">Ready to use</span>
              )}

              <button
                onClick={handleCopy}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-all cursor-pointer ${
                  copied
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'bg-violet-600 hover:bg-violet-500 text-white shadow-sm'
                }`}
                title="Copy prompt"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy</span>
                  </>
                )}
              </button>
            </>
          ) : (
            <span className="text-xs text-violet-400 group-hover:underline flex items-center gap-1 font-medium">
              <span>Read Full Article &rarr;</span>
            </span>
          )}

        </div>
      </div>
    </article>
  );
};
