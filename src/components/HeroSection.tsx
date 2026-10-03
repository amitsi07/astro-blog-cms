import React from 'react';
import { usePrompts } from '../context/PromptContext';
import { Search, X, Sparkles, SlidersHorizontal } from 'lucide-react';
import { AIModel } from '../types/prompt';

const POPULAR_TAGS = [
  '85mm Portrait',
  'Golden Hour',
  'Cyberpunk',
  'Tokyo',
  'Haute Couture',
  'Cinema Still',
  'Anime Ghibli',
  'Minimalist Product',
  'Brutalism'
];

const MODELS: (AIModel | 'All')[] = [
  'All',
  'Midjourney v6',
  'Flux.1',
  'Gemini / Imagen 3',
  'ChatGPT / DALL·E 3',
  'Stable Diffusion XL'
];

export const HeroSection: React.FC = () => {
  const { 
    searchQuery, 
    setSearchQuery, 
    selectedModel, 
    setSelectedModel,
    posts,
    customizerSettings
  } = usePrompts();

  return (
    <section className="relative overflow-hidden pt-12 pb-10 border-b border-[#1b1e2a] bg-gradient-to-b from-[#10121a] via-[#0c0d12] to-[#0c0d12]">
      {/* Subtle radial ambient glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[280px] bg-gradient-to-tr from-violet-600/10 via-indigo-600/10 to-transparent blur-3xl pointer-events-none" />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 text-center relative z-10">
        
        {/* Anti-slop clean kicker */}
        <div className="inline-flex items-center gap-2 text-xs font-medium text-violet-400 mb-3 tracking-wide">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Curated AI Photo Editing & Generative Prompts</span>
          <span aria-hidden="true">·</span>
          <span>Tested & Verified</span>
        </div>

        {/* Display Headline with balanced wrap */}
        <h1 className="text-3xl sm:text-5xl font-display font-extrabold text-white tracking-tight mb-4 text-balance">
          {customizerSettings?.hero?.title || customizerSettings?.siteTitle || 'PromptPlum AI'}
        </h1>
        
        <p className="text-sm sm:text-base text-slate-400 max-w-2xl mx-auto mb-8 font-normal leading-relaxed text-balance">
          {customizerSettings?.hero?.subtitle || customizerSettings?.tagline || 'Curated AI photo editing and generative prompts'}
        </p>

        {/* Search Bar */}
        <div className="max-w-2xl mx-auto relative mb-5">
          <div className="relative flex items-center bg-[#151722] border border-[#2b2f42] rounded-xl shadow-xl shadow-black/40 focus-within:border-violet-500 focus-within:ring-2 focus-within:ring-violet-500/20 transition-all">
            <Search className="w-5 h-5 text-slate-400 ml-4 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={customizerSettings?.hero?.searchPlaceholder || "Search prompts, photography styles, cameras, lighting, keywords..."}
              className="w-full bg-transparent px-3.5 py-3.5 text-sm sm:text-base text-white placeholder-slate-500 focus:outline-none"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="p-2 text-slate-400 hover:text-white mr-2 transition-colors cursor-pointer"
                title="Clear search"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Model Filter Segmented Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-1.5 mb-5 max-w-3xl mx-auto">
          {MODELS.map((model) => {
            const isActive = selectedModel === model;
            return (
              <button
                key={model}
                onClick={() => setSelectedModel(model)}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all whitespace-nowrap cursor-pointer ${
                  isActive
                    ? 'bg-violet-600 text-white shadow-md shadow-violet-900/30'
                    : 'bg-[#151722] text-slate-400 hover:text-slate-200 hover:bg-[#1d2030] border border-[#232738]'
                }`}
              >
                {model}
              </button>
            );
          })}
        </div>

        {/* Trending keyword tags */}
        <div className="flex flex-wrap items-center justify-center gap-2 text-xs text-slate-400">
          <span className="text-slate-500 font-medium">Trending:</span>
          {(customizerSettings?.hero?.trendingTags || POPULAR_TAGS).map((tag) => (
            <button
              key={tag}
              onClick={() => setSearchQuery(tag)}
              className="hover:text-violet-300 transition-colors cursor-pointer underline-offset-4 hover:underline"
            >
              #{tag}
            </button>
          ))}
        </div>

        {/* Unboxed metadata proof separator */}
        <div className="mt-7 pt-4 border-t border-[#181a24] flex items-center justify-center gap-4 sm:gap-6 text-xs text-slate-400 font-mono">
          <span className="tabular-nums font-semibold text-slate-200">{posts.length} Curated Publications</span>
          <span aria-hidden="true" className="text-slate-700">·</span>
          <span>Astro Content Collections</span>
          <span aria-hidden="true" className="text-slate-700">·</span>
          <span>Auto-Deploy Webhooks</span>
          <span aria-hidden="true" className="text-slate-700">·</span>
          <span className="text-emerald-400">Cloudflare Pages Ready</span>
        </div>

      </div>
    </section>
  );
};
