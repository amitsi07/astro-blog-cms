import React from 'react';
import { usePrompts } from '../context/PromptContext';
import { Sparkles, Cloud, Github, Lock, Code2 } from 'lucide-react';

export const Footer: React.FC = () => {
  const { 
    setIsDeployModalOpen, 
    setCurrentView, 
    setAdminSection, 
    setIsGeneratorOpen, 
    setActiveTab, 
    customizerSettings 
  } = usePrompts();

  return (
    <footer className="border-t border-[#1a1d29] bg-[#090a0f] text-slate-400 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          
          {/* Col 1: Wordmark & Summary */}
          <div className="md:col-span-2 space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-md bg-violet-600 flex items-center justify-center text-white">
                <Sparkles className="w-3.5 h-3.5" />
              </div>
              <span className="font-display font-bold text-lg text-white">
                {customizerSettings.siteTitle}
              </span>
            </div>
            <p className="text-xs text-slate-400 max-w-sm leading-relaxed">
              {customizerSettings.footer.bio}
            </p>
          </div>

          {/* Col 2: Navigation */}
          <div className="space-y-2.5">
            <span className="text-xs font-semibold text-slate-200 block uppercase tracking-wider">
              Navigation
            </span>
            <ul className="text-xs space-y-2">
              <li>
                <button
                  onClick={() => {
                    setCurrentView('frontend');
                    setActiveTab('all');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  Explore All Prompts
                </button>
              </li>
              <li>
                <button
                  onClick={() => {
                    setCurrentView('frontend');
                    setActiveTab('articles');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  Articles & Masterclasses
                </button>
              </li>
              <li>
                <button
                  onClick={() => setIsGeneratorOpen(true)}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  Prompt Studio
                </button>
              </li>
              <li>
                <button
                  onClick={() => {
                    setCurrentView('frontend');
                    setActiveTab('favorites');
                  }}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  Saved Favorites
                </button>
              </li>
            </ul>
          </div>

          {/* Col 3: CMS & Hosting */}
          <div className="space-y-2.5">
            <span className="text-xs font-semibold text-slate-200 block uppercase tracking-wider">
              WordPress Admin & Astro
            </span>
            <ul className="text-xs space-y-2">
              <li>
                <button
                  onClick={() => {
                    setCurrentView('admin');
                    setAdminSection('dashboard');
                  }}
                  className="text-violet-400 hover:text-violet-300 transition-colors flex items-center gap-1.5 cursor-pointer font-medium"
                >
                  <Lock className="w-3.5 h-3.5" />
                  <span>WordPress Admin Studio</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => {
                    setCurrentView('admin');
                    setAdminSection('deployments');
                  }}
                  className="text-emerald-400 hover:text-emerald-300 transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <Cloud className="w-3.5 h-3.5" />
                  <span>Cloudflare Auto-Deploy Hooks</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => {
                    setCurrentView('admin');
                    setAdminSection('astro_export');
                  }}
                  className="hover:text-white transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <Code2 className="w-3.5 h-3.5" />
                  <span>Astro Static Project Code</span>
                </button>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom row: Clean unboxed metadata separator */}
        <div className="pt-6 border-t border-[#161822] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <span>{customizerSettings.footer.copyrightText}</span>
            <span aria-hidden="true">·</span>
            <span>Astro SSG + Cloudflare Pages</span>
          </div>

          <div className="flex items-center gap-2 font-mono text-[11px]">
            <span>Cloudflare Pages Edge</span>
            <span aria-hidden="true">·</span>
            <span>Content Collections</span>
            <span aria-hidden="true">·</span>
            <span className="text-emerald-400">Auto-Deploy Enabled</span>
          </div>
        </div>

      </div>
    </footer>
  );
};
