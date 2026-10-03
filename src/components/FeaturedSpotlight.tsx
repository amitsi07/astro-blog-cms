import React from 'react';
import { usePrompts } from '../context/PromptContext';
import { PostItem } from '../types/prompt';
import { Sparkles, ArrowRight, SlidersHorizontal, Copy, Check, Bookmark } from 'lucide-react';

interface FeaturedSpotlightProps {
  onSelectPost: (post: PostItem) => void;
}

export const FeaturedSpotlight: React.FC<FeaturedSpotlightProps> = ({ onSelectPost }) => {
  const { posts, customizerSettings, setActiveCustomizerPrompt, toggleFavorite, favorites, incrementCopy, showToast } = usePrompts();

  if (!customizerSettings?.featuredSection?.enabled) return null;

  const featuredPosts = (posts || []).filter((p) => p.status === 'published' && p.featured).slice(0, 3);
  if (featuredPosts.length === 0) return null;

  const mainFeatured = featuredPosts[0];
  const secondaryFeatured = featuredPosts.slice(1, 3);

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 mb-6 pb-3 border-b border-[#1d202e]">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-violet-400 mb-1">
            <Sparkles className="w-3.5 h-3.5" />
            <span>{customizerSettings?.featuredSection?.badge || 'Spotlight'}</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            {customizerSettings?.featuredSection?.title || 'Featured Masterpieces'}
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            {customizerSettings?.featuredSection?.subtitle || 'Hand-tested prompts'}
          </p>
        </div>
      </div>

      {/* Bento Grid: 1 Large Hero Card + 2 Stacked Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Main Hero Bento Card (col-span-7) */}
        {mainFeatured && (
          <div
            onClick={() => onSelectPost(mainFeatured)}
            className="lg:col-span-7 group relative bg-[#131520] border border-[#23273a] hover:border-[#3d4360] rounded-2xl overflow-hidden cursor-pointer flex flex-col justify-between transition-all duration-300 shadow-xl"
          >
            <div className="relative aspect-[16/10] sm:aspect-[16/9] w-full overflow-hidden bg-black/40">
              <img
                src={mainFeatured.image}
                alt={mainFeatured.title}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#131520] via-black/20 to-transparent" />
              
              <div className="absolute top-3 left-3 px-2.5 py-1 rounded-md bg-violet-600/90 text-white font-mono text-[11px] font-bold backdrop-blur-md">
                Featured Spotlight
              </div>

              <div className="absolute bottom-3 left-4 right-4 text-xs text-slate-300 font-mono flex items-center justify-between">
                <span>{mainFeatured.model}</span>
                <span>{mainFeatured.category}</span>
              </div>
            </div>

            <div className="p-5 sm:p-6 space-y-3">
              <h3 className="text-lg sm:text-2xl font-bold text-white group-hover:text-violet-300 transition-colors">
                {mainFeatured.title}
              </h3>
              <p className="text-xs sm:text-sm text-slate-400 line-clamp-2 leading-relaxed">
                {mainFeatured.excerpt}
              </p>

              <div className="pt-2 flex items-center justify-between text-xs text-violet-400 font-medium">
                <span className="flex items-center gap-1">
                  <span>Explore Formulation & Masterclass</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </span>
                <span className="text-slate-500 font-mono text-[11px]">
                  {mainFeatured.copiesCount} copies
                </span>
              </div>
            </div>
          </div>
        )}

        {/* 2 Secondary Stacked Bento Cards (col-span-5) */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          {secondaryFeatured.map((post) => (
            <div
              key={post.id}
              onClick={() => onSelectPost(post)}
              className="group bg-[#131520] border border-[#23273a] hover:border-[#3d4360] rounded-2xl overflow-hidden cursor-pointer flex flex-col sm:flex-row gap-4 p-4 transition-all duration-300 shadow-xl flex-1 justify-between"
            >
              <div className="relative w-full sm:w-36 aspect-[4/3] sm:aspect-square rounded-xl overflow-hidden bg-black/40 shrink-0">
                <img
                  src={post.image}
                  alt={post.title}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>

              <div className="flex flex-col justify-between flex-1 py-1">
                <div>
                  <div className="flex items-center gap-2 text-[11px] text-slate-400 mb-1">
                    <span className="text-violet-400 font-semibold">{post.category}</span>
                    <span>·</span>
                    <span className="font-mono text-slate-300">{post.model}</span>
                  </div>
                  <h4 className="text-sm font-bold text-white group-hover:text-violet-300 transition-colors line-clamp-2 mb-1.5">
                    {post.title}
                  </h4>
                  <p className="text-xs text-slate-400 line-clamp-2">
                    {post.excerpt}
                  </p>
                </div>

                <div className="pt-2 flex items-center justify-between text-[11px] text-violet-400 font-medium">
                  <span className="flex items-center gap-1">
                    <span>Inspect Prompt &rarr;</span>
                  </span>
                  <span className="text-slate-500 font-mono">
                    {post.copiesCount} copies
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>

    </section>
  );
};
