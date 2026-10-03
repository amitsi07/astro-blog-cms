import React from 'react';
import { usePrompts } from '../context/PromptContext';
import { Cloud, ArrowRight, Sparkles, Compass } from 'lucide-react';

export const CtaSection: React.FC = () => {
  const { customizerSettings, setIsDeployModalOpen, setActiveTab } = usePrompts();

  if (!customizerSettings?.ctaSection?.enabled) return null;

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-violet-950/60 via-[#151728] to-indigo-950/60 border border-violet-800/40 p-8 sm:p-12 text-center shadow-2xl">
        
        {/* Glow backdrop */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-violet-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-2xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-violet-900/60 text-violet-300 text-xs font-semibold border border-violet-700/50">
            <Sparkles className="w-3.5 h-3.5" />
            <span>{customizerSettings?.ctaSection?.badge || 'Launch'}</span>
          </div>

          <h2 className="text-2xl sm:text-4xl font-display font-extrabold text-white tracking-tight text-balance">
            {customizerSettings?.ctaSection?.title || 'Launch Your Free AI Prompt Site'}
          </h2>

          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-xl mx-auto text-balance">
            {customizerSettings?.ctaSection?.subtitle || 'Deploy to Cloudflare Pages in 2 minutes.'}
          </p>

          <div className="pt-4 flex flex-wrap items-center justify-center gap-3">
            <button
              onClick={() => setIsDeployModalOpen(true)}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-xs sm:text-sm font-semibold text-white bg-violet-600 hover:bg-violet-500 shadow-xl shadow-violet-900/50 transition-all cursor-pointer"
            >
              <Cloud className="w-4 h-4" />
              <span>{customizerSettings?.ctaSection?.buttonText || 'Open Setup Guide'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={() => {
                setActiveTab('all');
                window.scrollTo({ top: 600, behavior: 'smooth' });
              }}
              className="inline-flex items-center gap-2 px-5 py-3 rounded-xl text-xs sm:text-sm font-medium text-slate-300 hover:text-white bg-[#1a1c2d] hover:bg-[#23273e] border border-[#2d324c] transition-all cursor-pointer"
            >
              <Compass className="w-4 h-4 text-violet-400" />
              <span>{customizerSettings?.ctaSection?.secondaryButtonText || 'Browse Prompts'}</span>
            </button>
          </div>
        </div>

      </div>
    </section>
  );
};
