import React, { useState } from 'react';
import { usePrompts } from '../context/PromptContext';
import { PostItem, PromptVariable } from '../types/prompt';
import { RichContentRenderer } from './RichContentRenderer';
import { 
  ArrowLeft, 
  Sparkles, 
  Copy, 
  Check, 
  Bookmark, 
  SlidersHorizontal, 
  Camera, 
  SunMedium, 
  ExternalLink,
  ThumbsUp,
  Clock,
  Share2,
  Calendar,
  Layers,
  FileText
} from 'lucide-react';

interface SinglePostViewProps {
  post: PostItem;
  onBack: () => void;
}

export const SinglePostView: React.FC<SinglePostViewProps> = ({ post, onBack }) => {
  const { 
    favorites, 
    toggleFavorite, 
    incrementCopy, 
    likePost, 
    showToast,
    setActiveCustomizerPrompt
  } = usePrompts();

  const isFavorite = favorites.includes(post.id);
  const [copiedPrompt, setCopiedPrompt] = useState(false);
  const [copiedNegative, setCopiedNegative] = useState(false);

  // Dynamic variable values
  const [variableValues, setVariableValues] = useState<Record<string, string>>(() => {
    const init: Record<string, string> = {};
    post.variables?.forEach((v: PromptVariable) => {
      init[v.token] = v.defaultValue;
    });
    return init;
  });

  const computedPrompt = React.useMemo(() => {
    if (!post.prompt) return '';
    let result = post.prompt;
    Object.entries(variableValues).forEach(([token, val]) => {
      result = result.split(token).join(val);
    });
    return result;
  }, [post.prompt, variableValues]);

  const handleCopy = () => {
    if (!computedPrompt) return;
    navigator.clipboard.writeText(computedPrompt);
    incrementCopy(post.id);
    setCopiedPrompt(true);
    showToast('Prompt copied to clipboard!');
    setTimeout(() => setCopiedPrompt(false), 2000);
  };

  const handleCopyNegative = () => {
    if (!post.negativePrompt) return;
    navigator.clipboard.writeText(post.negativePrompt);
    setCopiedNegative(true);
    showToast('Negative prompt copied!');
    setTimeout(() => setCopiedNegative(false), 2000);
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    showToast('Link copied to clipboard! Ready to share.');
  };

  const wordCount = post.content ? post.content.split(/\s+/).length : 0;
  const readTime = Math.max(1, Math.ceil(wordCount / 200));

  return (
    <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 animate-in fade-in duration-300">
      
      {/* Navigation & Metadata Breadcrumb */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-400 hover:text-white bg-[#151724] hover:bg-[#1f2334] px-3 py-1.5 rounded-lg border border-[#232738] transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Library</span>
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={handleShare}
            className="p-2 rounded-lg border border-[#232738] text-slate-400 hover:text-white bg-[#151724] transition-colors cursor-pointer"
            title="Share Link"
          >
            <Share2 className="w-4 h-4" />
          </button>

          <button
            onClick={() => toggleFavorite(post.id)}
            className={`p-2 rounded-lg border border-[#232738] transition-colors cursor-pointer ${
              isFavorite ? 'bg-rose-500/20 text-rose-300 border-rose-500/40' : 'text-slate-400 hover:text-white bg-[#151724]'
            }`}
            title="Bookmark"
          >
            <Bookmark className={`w-4 h-4 ${isFavorite ? 'fill-current' : ''}`} />
          </button>

          <button
            onClick={() => likePost(post.id)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#232738] bg-[#151724] hover:bg-[#1f2334] text-xs text-slate-300 hover:text-white transition-colors cursor-pointer"
          >
            <ThumbsUp className="w-3.5 h-3.5 text-violet-400" />
            <span className="font-mono">{post.likesCount}</span>
          </button>
        </div>
      </div>

      {/* Header Info */}
      <header className="space-y-4">
        <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400">
          <span className="text-violet-400 font-semibold">{post.category}</span>
          <span>·</span>
          {post.model && (
            <>
              <span className="font-mono text-slate-300">{post.model}</span>
              <span>·</span>
            </>
          )}
          {post.aspectRatio && (
            <>
              <span className="font-mono text-slate-400">{post.aspectRatio}</span>
              <span>·</span>
            </>
          )}
          <span className="flex items-center gap-1 text-slate-500 font-mono">
            <Clock className="w-3.5 h-3.5" /> {readTime} min read
          </span>
        </div>

        <h1 className="text-3xl sm:text-5xl font-display font-extrabold text-white tracking-tight leading-tight text-balance">
          {post.title}
        </h1>

        <div className="flex items-center gap-3 pt-2 text-xs text-slate-400 font-mono">
          <img
            src={post.authorAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80'}
            alt={post.author}
            className="w-7 h-7 rounded-full object-cover border border-slate-700"
          />
          <span className="font-medium text-slate-200">{post.author}</span>
          <span>·</span>
          <span>Published on {post.publishedAt || post.createdAt}</span>
        </div>
      </header>

      {/* Featured Visual */}
      <div className="rounded-2xl overflow-hidden bg-black/40 border border-[#232738] shadow-2xl max-h-[540px] flex items-center justify-center">
        <img
          src={post.image}
          alt={post.title}
          referrerPolicy="no-referrer"
          className="w-full h-full object-contain max-h-[540px]"
        />
      </div>

      {/* AI Prompt Box (If post is a prompt) */}
      {post.type === 'prompt' && post.prompt && (
        <div className="bg-[#141724] border border-[#282d42] rounded-2xl p-6 space-y-4 shadow-xl">
          
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-violet-300 flex items-center gap-2">
              <Sparkles className="w-4 h-4" />
              <span>Prompt Formula (Astro Optimized)</span>
            </span>

            {post.variables && post.variables.length > 0 && (
              <button
                onClick={() => setActiveCustomizerPrompt(post)}
                className="inline-flex items-center gap-1 px-2.5 py-1 text-xs text-violet-300 bg-[#1e2238] rounded-lg border border-violet-800/40 hover:bg-violet-900/40 transition-colors cursor-pointer"
              >
                <SlidersHorizontal className="w-3 h-3" />
                <span>Customize Variables</span>
              </button>
            )}
          </div>

          {/* Interactive Variables Selectors directly inside post */}
          {post.variables && post.variables.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3.5 bg-[#0e1018] rounded-xl border border-[#222538]">
              {post.variables.map((v: PromptVariable) => (
                <div key={v.token} className="space-y-1">
                  <label className="text-[11px] font-mono text-slate-400">
                    {v.name} <code className="text-violet-400">{v.token}</code>
                  </label>
                  {v.options && v.options.length > 0 ? (
                    <select
                      value={variableValues[v.token] || ''}
                      onChange={(e) =>
                        setVariableValues({ ...variableValues, [v.token]: e.target.value })
                      }
                      className="w-full bg-[#151724] border border-[#272b3e] rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-violet-500 cursor-pointer"
                    >
                      {v.options.map((opt: string) => (
                        <option key={opt} value={opt}>{opt}</option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type="text"
                      value={variableValues[v.token] || ''}
                      onChange={(e) =>
                        setVariableValues({ ...variableValues, [v.token]: e.target.value })
                      }
                      className="w-full bg-[#151724] border border-[#272b3e] rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-violet-500"
                    />
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Prompt String with one-click copy */}
          <div className="bg-[#0b0c12] border border-[#232738] rounded-xl p-4 relative group">
            <p className="font-mono text-xs sm:text-sm text-slate-200 leading-relaxed select-all">
              {computedPrompt}
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
            <div className="flex items-center gap-2">
              <a
                href={`https://chatgpt.com/?q=${encodeURIComponent(computedPrompt)}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 px-3 py-1.5 text-xs text-slate-300 hover:text-white bg-[#191c2b] rounded-lg border border-[#292e42] transition-colors"
              >
                <span>ChatGPT</span>
                <ExternalLink className="w-3 h-3 text-slate-500" />
              </a>

              <a
                href="https://gemini.google.com/app"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 px-3 py-1.5 text-xs text-slate-300 hover:text-white bg-[#191c2b] rounded-lg border border-[#292e42] transition-colors"
              >
                <span>Gemini</span>
                <ExternalLink className="w-3 h-3 text-slate-500" />
              </a>
            </div>

            <button
              onClick={handleCopy}
              className={`inline-flex items-center gap-2 px-5 py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                copiedPrompt
                  ? 'bg-emerald-600 text-white shadow-emerald-900/30'
                  : 'bg-violet-600 hover:bg-violet-500 text-white shadow-violet-900/30'
              }`}
            >
              {copiedPrompt ? (
                <>
                  <Check className="w-4 h-4" />
                  <span>Copied to Clipboard!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  <span>Copy Full Prompt</span>
                </>
              )}
            </button>
          </div>

          {/* Negative prompt */}
          {post.negativePrompt && (
            <div className="pt-2 border-t border-[#232738] flex items-center justify-between text-xs">
              <span className="text-rose-300 font-mono">Negative: {post.negativePrompt}</span>
              <button
                onClick={handleCopyNegative}
                className="text-slate-400 hover:text-white underline text-[11px] cursor-pointer"
              >
                {copiedNegative ? 'Copied Negative' : 'Copy Negative'}
              </button>
            </div>
          )}

        </div>
      )}

      {/* Rich Content & Markdown Body (with Callout boxes, YouTube embeds, FAQs, HR) */}
      {post.content && (
        <div className="bg-[#131520] border border-[#232738] rounded-2xl p-6 sm:p-8 space-y-4">
          <RichContentRenderer content={post.content} />
        </div>
      )}

      {/* Tags list */}
      <div className="flex flex-wrap items-center gap-2 pt-4 border-t border-[#1c1f2c]">
        {post.tags.map((t) => (
          <span key={t} className="px-3 py-1 bg-[#151724] border border-[#232738] rounded-lg text-xs text-slate-300">
            #{t}
          </span>
        ))}
      </div>

    </article>
  );
};
