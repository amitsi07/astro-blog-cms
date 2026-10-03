/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useMemo, useState } from 'react';
import { PromptProvider, usePrompts } from './context/PromptContext';
import { Navbar } from './components/Navbar';
import { HeroSection } from './components/HeroSection';
import { FeaturedSpotlight } from './components/FeaturedSpotlight';
import { FilterBar } from './components/FilterBar';
import { PromptCard } from './components/PromptCard';
import { HomepageFaqSection } from './components/HomepageFaqSection';
import { CtaSection } from './components/CtaSection';
import { PromptModal } from './components/PromptModal';
import { PromptCustomizerModal } from './components/PromptCustomizerModal';
import { WordPressAdmin } from './components/admin/WordPressAdmin';
import { SveltiaDeploymentModal } from './components/SveltiaDeploymentModal';
import { PromptGeneratorModal } from './components/PromptGeneratorModal';
import { SinglePostView } from './components/SinglePostView';
import { Toast } from './components/Toast';
import { Footer } from './components/Footer';
import { PostItem } from './types/prompt';
import { 
  Sparkles, 
  RotateCcw, 
  Bookmark, 
  Compass, 
  SlidersHorizontal,
  Cloud,
  FileText,
  Lock,
  Layers
} from 'lucide-react';

const MainAppContent: React.FC = () => {
  const {
    posts,
    searchQuery,
    selectedCategory,
    selectedModel,
    selectedAspectRatio,
    sortOption,
    favorites,
    activeTab,
    setActiveTab,
    currentView,
    setCurrentView,
    setAdminSection,
    setIsDeployModalOpen,
    customizerSettings,
    setSearchQuery,
    setSelectedCategory,
    setSelectedModel,
    setSelectedAspectRatio
  } = usePrompts();

  const [selectedPostForView, setSelectedPostForView] = useState<PostItem | null>(null);

  // Filter & Sort Logic (Only show PUBLISHED posts on the public frontend!)
  const publicPublishedPosts = useMemo(() => {
    return posts.filter((p) => p.status === 'published');
  }, [posts]);

  const filteredPosts = useMemo(() => {
    return publicPublishedPosts
      .filter((p) => {
        // Tab filter (all vs prompts vs articles vs favorites)
        if (activeTab === 'favorites' && !favorites.includes(p.id)) return false;
        if (activeTab === 'prompts' && p.type !== 'prompt') return false;
        if (activeTab === 'articles' && p.type !== 'article') return false;

        // Category filter
        if (selectedCategory !== 'all') {
          const matchSlug = p.category.toLowerCase().replace(/[^a-z0-9]/g, '');
          const targetSlug = selectedCategory.toLowerCase().replace(/[^a-z0-9]/g, '');
          if (!matchSlug.includes(targetSlug) && !targetSlug.includes(matchSlug)) {
            return false;
          }
        }

        // AI Model filter (if post has model)
        if (selectedModel !== 'All' && p.model && p.model !== selectedModel) {
          return false;
        }

        // Aspect ratio filter
        if (selectedAspectRatio !== 'All' && p.aspectRatio && p.aspectRatio !== selectedAspectRatio) {
          return false;
        }

        // Search Query filter
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase().trim();
          const inTitle = p.title.toLowerCase().includes(q);
          const inPrompt = p.prompt ? p.prompt.toLowerCase().includes(q) : false;
          const inContent = p.content ? p.content.toLowerCase().includes(q) : false;
          const inTags = p.tags.some((t) => t.toLowerCase().includes(q));
          const inCategory = p.category.toLowerCase().includes(q);
          if (!inTitle && !inPrompt && !inContent && !inTags && !inCategory) {
            return false;
          }
        }

        return true;
      })
      .sort((a, b) => {
        if (sortOption === 'trending') {
          const scoreA = a.copiesCount * 1.5 + a.likesCount * 2;
          const scoreB = b.copiesCount * 1.5 + b.likesCount * 2;
          return scoreB - scoreA;
        }
        if (sortOption === 'newest') {
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        }
        if (sortOption === 'most_copied') {
          return b.copiesCount - a.copiesCount;
        }
        if (sortOption === 'popular') {
          return b.likesCount - a.likesCount;
        }
        return 0;
      });
  }, [
    publicPublishedPosts,
    activeTab,
    favorites,
    selectedCategory,
    selectedModel,
    selectedAspectRatio,
    searchQuery,
    sortOption
  ]);

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedCategory('all');
    setSelectedModel('All');
    setSelectedAspectRatio('All');
  };

  // If Admin View is active, show the WordPress Admin Dashboard!
  if (currentView === 'admin') {
    return (
      <>
        <WordPressAdmin />
        <Toast />
      </>
    );
  }

  // If Single Post Reader View is active:
  if (selectedPostForView) {
    return (
      <div className="min-h-screen flex flex-col bg-[#0b0c10] text-[#e0e2ec]">
        <Navbar />
        <main className="flex-1">
          <SinglePostView
            post={selectedPostForView}
            onBack={() => setSelectedPostForView(null)}
          />
        </main>
        <PromptCustomizerModal />
        <Toast />
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#0b0c10] text-[#e0e2ec]">
      <Navbar />

      <HeroSection />

      {/* Featured Spotlight Bento Grid (Configurable from CMS) */}
      <FeaturedSpotlight onSelectPost={(p) => setSelectedPostForView(p)} />

      <FilterBar />

      {/* Main Grid Section */}
      <main id="explore" className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        
        {/* Top bar with count & quick action notice */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6 pb-3 border-b border-[#1c1f2c]">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <span className="font-semibold text-white">
              {filteredPosts.length} {filteredPosts.length === 1 ? 'Publication' : 'Publications'}
            </span>
            {searchQuery && (
              <>
                <span aria-hidden="true" className="text-slate-600">·</span>
                <span>matching &quot;{searchQuery}&quot;</span>
              </>
            )}
            {selectedCategory !== 'all' && (
              <>
                <span aria-hidden="true" className="text-slate-600">·</span>
                <span className="capitalize">{selectedCategory}</span>
              </>
            )}
            <span aria-hidden="true" className="text-slate-600">·</span>
            <span className="text-emerald-400 font-mono">100% Static Astro SSG</span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                setCurrentView('admin');
                setAdminSection('editor');
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-violet-600 hover:bg-violet-500 text-white shadow-md shadow-violet-900/30 transition-colors cursor-pointer"
            >
              <Lock className="w-3.5 h-3.5" />
              <span>Admin: + Add New Post</span>
            </button>
          </div>
        </div>

        {/* Content Cards Grid */}
        {filteredPosts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredPosts.map((post) => (
              <PromptCard
                key={post.id}
                post={post}
                onSelectPost={(p) => setSelectedPostForView(p)}
              />
            ))}
          </div>
        ) : (
          /* Empty state */
          <div className="py-20 text-center max-w-md mx-auto space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-violet-950/60 border border-violet-800/50 flex items-center justify-center text-violet-400 mx-auto">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white mb-1">No publications matched your search</h3>
              <p className="text-xs text-slate-400">
                Try adjusting your filters, selecting another category, or clearing the search query.
              </p>
            </div>
            <button
              onClick={clearFilters}
              className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-violet-600 hover:bg-violet-500 rounded-lg transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Clear All Filters</span>
            </button>
          </div>
        )}

      </main>

      {/* Homepage FAQ Section (Configurable from CMS) */}
      <HomepageFaqSection />

      {/* CTA Conversion Banner (Configurable from CMS) */}
      <CtaSection />

      {/* Global Modals & Utilities */}
      <PromptModal />
      <PromptCustomizerModal />
      <SveltiaDeploymentModal />
      <PromptGeneratorModal />
      <Toast />
      <Footer />
    </div>
  );
};

export default function App() {
  return (
    <PromptProvider>
      <MainAppContent />
    </PromptProvider>
  );
}
