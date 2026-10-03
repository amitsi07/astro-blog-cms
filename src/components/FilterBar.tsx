import React from 'react';
import { usePrompts } from '../context/PromptContext';
import { AspectRatio, SortOption } from '../types/prompt';
import { 
  Sparkles, 
  User, 
  Film, 
  Camera, 
  Shirt, 
  Cpu, 
  Wand2, 
  Package, 
  Box, 
  Palette, 
  Building,
  RotateCcw,
  ArrowUpDown,
  Ratio
} from 'lucide-react';

const ASPECT_RATIOS: (AspectRatio | 'All')[] = ['All', '1:1', '16:9', '9:16', '4:3', '3:4'];

const SORT_OPTIONS: { label: string; value: SortOption }[] = [
  { label: '🔥 Trending', value: 'trending' },
  { label: '✨ Newest Added', value: 'newest' },
  { label: '📋 Most Copied', value: 'most_copied' },
  { label: '⭐ Top Rated', value: 'popular' }
];

export const FilterBar: React.FC = () => {
  const {
    categories,
    selectedCategory,
    setSelectedCategory,
    selectedAspectRatio,
    setSelectedAspectRatio,
    sortOption,
    setSortOption,
    searchQuery,
    setSearchQuery,
    selectedModel,
    setSelectedModel
  } = usePrompts();

  const hasActiveFilters = selectedCategory !== 'all' || selectedModel !== 'All' || selectedAspectRatio !== 'All' || searchQuery !== '';

  const clearAllFilters = () => {
    setSelectedCategory('all');
    setSelectedModel('All');
    setSelectedAspectRatio('All');
    setSearchQuery('');
  };

  const getCategoryIcon = (slug: string) => {
    switch (slug) {
      case 'portraits': return <User className="w-3.5 h-3.5" />;
      case 'cinematic': return <Film className="w-3.5 h-3.5" />;
      case 'realistic': return <Camera className="w-3.5 h-3.5" />;
      case 'fashion': return <Shirt className="w-3.5 h-3.5" />;
      case 'cyberpunk': return <Cpu className="w-3.5 h-3.5" />;
      case 'fantasy': return <Wand2 className="w-3.5 h-3.5" />;
      case 'product': return <Package className="w-3.5 h-3.5" />;
      case '3d-art': return <Box className="w-3.5 h-3.5" />;
      case 'anime': return <Palette className="w-3.5 h-3.5" />;
      case 'architecture': return <Building className="w-3.5 h-3.5" />;
      default: return <Sparkles className="w-3.5 h-3.5" />;
    }
  };

  return (
    <div className="py-4 border-b border-[#1b1e2a] bg-[#0c0d12]/60 sticky top-16 z-30 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-3">
        
        {/* Categories Horizontal Scroll Strip */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none no-scrollbar">
          {categories.map((cat) => {
            const isActive = selectedCategory === cat.slug;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.slug)}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap transition-all cursor-pointer ${
                  isActive
                    ? 'bg-violet-600 text-white font-semibold shadow-sm'
                    : 'bg-[#151722] text-slate-300 hover:text-white hover:bg-[#1d2030] border border-[#232738]'
                }`}
              >
                {getCategoryIcon(cat.slug)}
                <span>{cat.name}</span>
              </button>
            );
          })}
        </div>

        {/* Secondary controls: Aspect Ratio, Sort, and Reset */}
        <div className="flex flex-wrap items-center justify-between gap-3 text-xs pt-1">
          
          {/* Aspect Ratio Filter */}
          <div className="flex items-center gap-1">
            <span className="text-slate-400 font-medium flex items-center gap-1 mr-1">
              <Ratio className="w-3.5 h-3.5 text-slate-500" />
              <span>Ratio:</span>
            </span>
            <div className="flex items-center gap-1 bg-[#141622] p-0.5 rounded-lg border border-[#232738]">
              {ASPECT_RATIOS.map((ratio) => {
                const isActive = selectedAspectRatio === ratio;
                return (
                  <button
                    key={ratio}
                    onClick={() => setSelectedAspectRatio(ratio)}
                    className={`px-2 py-1 rounded text-[11px] font-mono transition-colors cursor-pointer ${
                      isActive
                        ? 'bg-violet-600 text-white font-semibold'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {ratio}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right side: Sort & Reset button */}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 bg-[#141622] px-2.5 py-1 rounded-lg border border-[#232738]">
              <ArrowUpDown className="w-3 h-3 text-slate-500" />
              <select
                value={sortOption}
                onChange={(e) => setSortOption(e.target.value as SortOption)}
                aria-label="Sort prompts"
                className="bg-transparent text-slate-300 text-xs focus:outline-none cursor-pointer pr-1"
              >
                {SORT_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value} className="bg-[#141622] text-slate-200">
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            {hasActiveFilters && (
              <button
                onClick={clearAllFilters}
                className="inline-flex items-center gap-1 px-2.5 py-1 text-slate-400 hover:text-rose-400 bg-[#161824] hover:bg-[#201d2a] rounded-lg border border-[#2a2d3e] transition-colors cursor-pointer"
                title="Clear all filters"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset</span>
              </button>
            )}
          </div>

        </div>

      </div>
    </div>
  );
};
