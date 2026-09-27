import React, { useState } from 'react';
import {
  HomepageConfig,
  HomepageSectionId,
  HomepageCategorySection,
  Post,
  Category,
} from '../../types/cms';
import {
  Layout,
  Save,
  Eye,
  ArrowUp,
  ArrowDown,
  Plus,
  Trash2,
  Sparkles,
  Flame,
  Check,
  RotateCcw,
  Sliders,
  FolderPlus,
  ExternalLink,
  GripVertical,
  Hash,
  ArrowUpDown,
  Move,
  CheckCircle2,
} from 'lucide-react';

interface HomepageBuilderProps {
  homepage: HomepageConfig;
  posts: Post[];
  categories: Category[];
  onSave: (newConfig: HomepageConfig) => void;
  onPreviewLive: () => void;
  onResetDefaults: () => void;
}

export const HomepageBuilder: React.FC<HomepageBuilderProps> = ({
  homepage,
  posts,
  categories,
  onSave,
  onPreviewLive,
  onResetDefaults,
}) => {
  const [config, setConfig] = useState<HomepageConfig>(homepage);
  const [activeTab, setActiveTab] = useState<
    'layout' | 'hero' | 'announcement' | 'trending' | 'categories' | 'newsletter' | 'sidebar'
  >('layout');
  const [saved, setSaved] = useState(false);

  const publishedPosts = posts.filter((p) => p.status === 'published');

  // Drag & drop state
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  // Move section in order
  const moveSection = (index: number, direction: 'up' | 'down') => {
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= config.sectionsOrder.length) return;

    const newOrder = [...config.sectionsOrder];
    const temp = newOrder[index];
    newOrder[index] = newOrder[targetIdx];
    newOrder[targetIdx] = temp;

    setConfig({ ...config, sectionsOrder: newOrder });
  };

  // Rank / Position number assignment (1-indexed input)
  const handleRankChange = (currentIndex: number, newRankOneIndexed: number) => {
    const targetIdx = Math.max(0, Math.min(config.sectionsOrder.length - 1, newRankOneIndexed - 1));
    if (targetIdx === currentIndex) return;

    const newOrder = [...config.sectionsOrder];
    const [movedItem] = newOrder.splice(currentIndex, 1);
    newOrder.splice(targetIdx, 0, movedItem);

    setConfig({ ...config, sectionsOrder: newOrder });
  };

  // HTML5 Drag and Drop handlers
  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', `${index}`);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>, index: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (dragOverIndex !== index) {
      setDragOverIndex(index);
    }
  };

  const handleDragLeave = () => {
    // leave
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>, targetIndex: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === targetIndex) {
      setDraggedIndex(null);
      setDragOverIndex(null);
      return;
    }

    const newOrder = [...config.sectionsOrder];
    const [movedItem] = newOrder.splice(draggedIndex, 1);
    newOrder.splice(targetIndex, 0, movedItem);

    setConfig({ ...config, sectionsOrder: newOrder });
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  // Quick Preset Layouts
  const applyPresetLayout = (preset: 'standard' | 'editorial' | 'newsletter_first' | 'content_heavy') => {
    let order: HomepageSectionId[] = [];
    switch (preset) {
      case 'standard':
        order = ['hero', 'announcement', 'trending', 'featured_grid', 'latest_feed', 'category_sections', 'newsletter'];
        break;
      case 'editorial':
        order = ['hero', 'featured_grid', 'trending', 'category_sections', 'latest_feed', 'announcement', 'newsletter'];
        break;
      case 'newsletter_first':
        order = ['hero', 'newsletter', 'trending', 'featured_grid', 'latest_feed', 'category_sections', 'announcement'];
        break;
      case 'content_heavy':
        order = ['hero', 'trending', 'latest_feed', 'category_sections', 'featured_grid', 'announcement', 'newsletter'];
        break;
    }
    setConfig({
      ...config,
      sectionsOrder: order,
    });
  };

  // Toggle section enabled
  const toggleSectionEnabled = (sectionId: HomepageSectionId) => {
    setConfig({
      ...config,
      sectionsEnabled: {
        ...config.sectionsEnabled,
        [sectionId]: !config.sectionsEnabled[sectionId],
      },
    });
  };

  // Add Category Showcase Block
  const addCategoryShowcase = () => {
    if (categories.length === 0) return;
    const newSection: HomepageCategorySection = {
      id: `hcs-${Date.now()}`,
      categoryId: categories[0].id,
      customTitle: `${categories[0].name} Spotlight`,
      customSubtitle: `Curated guides on ${categories[0].name.toLowerCase()}`,
      postLimit: 3,
    };
    setConfig({
      ...config,
      categorySections: [...config.categorySections, newSection],
    });
  };

  const removeCategoryShowcase = (id: string) => {
    setConfig({
      ...config,
      categorySections: config.categorySections.filter((cs) => cs.id !== id),
    });
  };

  const moveCategoryShowcase = (index: number, direction: 'up' | 'down') => {
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= config.categorySections.length) return;

    const newSections = [...config.categorySections];
    const temp = newSections[index];
    newSections[index] = newSections[targetIdx];
    newSections[targetIdx] = temp;

    setConfig({ ...config, categorySections: newSections });
  };

  // Add perk to newsletter
  const addNewsletterPerk = () => {
    setConfig({
      ...config,
      newsletter: {
        ...config.newsletter,
        perks: [...config.newsletter.perks, 'New weekly production recipe'],
      },
    });
  };

  const removeNewsletterPerk = (idx: number) => {
    const updated = [...config.newsletter.perks];
    updated.splice(idx, 1);
    setConfig({
      ...config,
      newsletter: {
        ...config.newsletter,
        perks: updated,
      },
    });
  };

  const handleSave = () => {
    onSave(config);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const sectionLabels: Record<HomepageSectionId, { title: string; desc: string }> = {
    hero: {
      title: 'Hero Spotlight Section',
      desc: 'Top primary spotlight article or custom campaign hero banner',
    },
    announcement: {
      title: 'Architecture & Announcement Bar',
      desc: '₹0 target infrastructure banner with specification modal trigger',
    },
    trending: {
      title: 'Trending / Popular Ribbon',
      desc: 'High-velocity popular publications based on reader views',
    },
    featured_grid: {
      title: 'Curated Staff Blueprints Grid',
      desc: 'Featured posts selected by editorial team',
    },
    latest_feed: {
      title: 'Latest Publications Feed & Sidebar',
      desc: 'Interactive category tabs, paginated articles, and desktop sidebar',
    },
    category_sections: {
      title: 'Configurable Category Showcases',
      desc: 'Dedicated showcase blocks for specific categories (Section 3 spec)',
    },
    newsletter: {
      title: 'Newsletter & Community CTA Area',
      desc: 'Full-width email capture and audience perks list',
    },
  };

  return (
    <div className="space-y-6 pb-20">
      {/* Top Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl border border-slate-800 bg-[#090d16] shadow-xl">
        <div>
          <div className="flex items-center gap-2">
            <Layout className="w-5 h-5 text-orange-400" />
            <h2 className="font-display text-xl sm:text-2xl font-bold text-white">
              Homepage Layout & Content Builder
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Per Section 3 & 4 of specification: Full control over homepage sections, hero content, category blocks, copy, and layout order.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            type="button"
            onClick={onResetDefaults}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-700 bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs font-medium transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
            <span>Reset Defaults</span>
          </button>

          <button
            type="button"
            onClick={onPreviewLive}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-700 bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold transition-colors"
          >
            <Eye className="w-3.5 h-3.5 text-orange-400" />
            <span>Preview Live Site</span>
          </button>

          <button
            type="button"
            onClick={handleSave}
            className="flex items-center gap-2 px-5 py-2 rounded-xl bg-orange-600 hover:bg-orange-500 text-white text-xs font-semibold shadow-md shadow-orange-600/30 transition-all active:scale-95"
          >
            <Save className="w-4 h-4" />
            <span>{saved ? 'Homepage Saved!' : 'Save Homepage'}</span>
          </button>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto border-b border-slate-800 pb-2">
        <button
          onClick={() => setActiveTab('layout')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-colors whitespace-nowrap ${
            activeTab === 'layout'
              ? 'bg-slate-800 text-white shadow-sm'
              : 'text-slate-400 hover:text-white hover:bg-slate-900'
          }`}
        >
          1. Sections Order & Visibility
        </button>
        <button
          onClick={() => setActiveTab('hero')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-colors whitespace-nowrap ${
            activeTab === 'hero'
              ? 'bg-slate-800 text-white shadow-sm'
              : 'text-slate-400 hover:text-white hover:bg-slate-900'
          }`}
        >
          2. Hero Section
        </button>
        <button
          onClick={() => setActiveTab('announcement')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-colors whitespace-nowrap ${
            activeTab === 'announcement'
              ? 'bg-slate-800 text-white shadow-sm'
              : 'text-slate-400 hover:text-white hover:bg-slate-900'
          }`}
        >
          3. Architecture Banner
        </button>
        <button
          onClick={() => setActiveTab('trending')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-colors whitespace-nowrap ${
            activeTab === 'trending'
              ? 'bg-slate-800 text-white shadow-sm'
              : 'text-slate-400 hover:text-white hover:bg-slate-900'
          }`}
        >
          4. Trending & Featured
        </button>
        <button
          onClick={() => setActiveTab('categories')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-colors whitespace-nowrap ${
            activeTab === 'categories'
              ? 'bg-slate-800 text-white shadow-sm'
              : 'text-slate-400 hover:text-white hover:bg-slate-900'
          }`}
        >
          5. Category Showcases ({config.categorySections?.length || 0})
        </button>
        <button
          onClick={() => setActiveTab('newsletter')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-colors whitespace-nowrap ${
            activeTab === 'newsletter'
              ? 'bg-slate-800 text-white shadow-sm'
              : 'text-slate-400 hover:text-white hover:bg-slate-900'
          }`}
        >
          6. Newsletter Area
        </button>
        <button
          onClick={() => setActiveTab('sidebar')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-colors whitespace-nowrap ${
            activeTab === 'sidebar'
              ? 'bg-slate-800 text-white shadow-sm'
              : 'text-slate-400 hover:text-white hover:bg-slate-900'
          }`}
        >
          7. Desktop Sidebar
        </button>
      </div>

      {/* TAB 1: Layout & Sections Order */}
      {activeTab === 'layout' && (
        <div className="space-y-5">
          {/* Header Card with Quick Preset Layouts */}
          <div className="p-5 rounded-2xl border border-slate-800 bg-[#090d16] space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <ArrowUpDown className="w-4 h-4 text-orange-400" />
                  <h3 className="font-semibold text-sm text-white">Homepage Layout Sequence & Reordering</h3>
                </div>
                <p className="text-xs text-slate-400 mt-1">
                  Drag & drop sections by their grip handle, assign exact rank positions (1 to {config.sectionsOrder.length}), or use arrow buttons to arrange your homepage.
                </p>
              </div>

              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-orange-950/30 border border-orange-500/20 text-orange-400 text-xs font-semibold shrink-0">
                <Move className="w-3.5 h-3.5" />
                <span>Drag & Drop Enabled</span>
              </div>
            </div>

            {/* Quick Layout Presets */}
            <div className="pt-3 border-t border-slate-800/80 flex flex-wrap items-center gap-2 text-xs">
              <span className="text-slate-400 font-medium mr-1 flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>Quick Layout Presets:</span>
              </span>
              <button
                type="button"
                onClick={() => applyPresetLayout('standard')}
                className="px-2.5 py-1 rounded-lg border border-slate-800 bg-slate-900 hover:bg-slate-800 hover:text-white text-slate-300 font-medium transition-colors"
              >
                Standard Flow
              </button>
              <button
                type="button"
                onClick={() => applyPresetLayout('editorial')}
                className="px-2.5 py-1 rounded-lg border border-slate-800 bg-slate-900 hover:bg-slate-800 hover:text-white text-slate-300 font-medium transition-colors"
              >
                Editorial Showcase
              </button>
              <button
                type="button"
                onClick={() => applyPresetLayout('newsletter_first')}
                className="px-2.5 py-1 rounded-lg border border-slate-800 bg-slate-900 hover:bg-slate-800 hover:text-white text-slate-300 font-medium transition-colors"
              >
                Lead Capture Focus
              </button>
              <button
                type="button"
                onClick={() => applyPresetLayout('content_heavy')}
                className="px-2.5 py-1 rounded-lg border border-slate-800 bg-slate-900 hover:bg-slate-800 hover:text-white text-slate-300 font-medium transition-colors"
              >
                Content Heavy Feed
              </button>
            </div>
          </div>

          {/* Reorderable Section Cards */}
          <div className="space-y-3">
            {config.sectionsOrder.map((sectionId, idx) => {
              const info = sectionLabels[sectionId] || { title: sectionId, desc: '' };
              const isEnabled = config.sectionsEnabled[sectionId] !== false;
              const isDragging = draggedIndex === idx;
              const isDragOver = dragOverIndex === idx && draggedIndex !== idx;

              return (
                <div
                  key={sectionId}
                  draggable
                  onDragStart={(e) => handleDragStart(e, idx)}
                  onDragOver={(e) => handleDragOver(e, idx)}
                  onDragLeave={handleDragLeave}
                  onDrop={(e) => handleDrop(e, idx)}
                  onDragEnd={handleDragEnd}
                  className={`p-4 rounded-2xl border transition-all duration-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4 cursor-grab active:cursor-grabbing select-none ${
                    isDragging
                      ? 'opacity-40 border-orange-500 scale-[0.98] bg-slate-900 shadow-xl'
                      : isDragOver
                      ? 'border-orange-500 bg-orange-950/20 ring-2 ring-orange-500/50 scale-[1.01]'
                      : isEnabled
                      ? 'border-slate-800 bg-[#090d16] hover:border-slate-700 shadow-md'
                      : 'border-slate-800/40 bg-slate-950/40 opacity-60'
                  }`}
                >
                  {/* Left: Drag Handle + Rank Number + Title & Description */}
                  <div className="flex items-center gap-3">
                    {/* Drag Grip Handle */}
                    <div
                      className="p-1 rounded-lg hover:bg-slate-800 text-slate-500 hover:text-orange-400 cursor-grab active:cursor-grabbing transition-colors"
                      title="Drag to reorder"
                    >
                      <GripVertical className="w-5 h-5" />
                    </div>

                    {/* Rank Badge / Numerical Rank Selector */}
                    <div className="flex items-center gap-1.5">
                      <div className="relative group">
                        <select
                          value={idx + 1}
                          onChange={(e) => handleRankChange(idx, parseInt(e.target.value, 10))}
                          title="Click to select exact position rank"
                          className="w-11 h-8 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-orange-400 font-mono font-bold text-xs flex items-center justify-center text-center cursor-pointer focus:outline-none focus:ring-1 focus:ring-orange-500 appearance-none px-1"
                        >
                          {config.sectionsOrder.map((_, rIdx) => (
                            <option key={rIdx} value={rIdx + 1} className="bg-slate-900 text-white">
                              #{rIdx + 1}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div>
                      <div className="font-semibold text-sm text-white flex items-center gap-2 flex-wrap">
                        <span>{info.title}</span>
                        {!isEnabled && (
                          <span className="px-2 py-0.5 rounded text-[10px] bg-slate-900 text-slate-400 border border-slate-800 font-mono font-semibold">
                            HIDDEN
                          </span>
                        )}
                        {idx === 0 && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] bg-orange-500/10 text-orange-400 border border-orange-500/20 font-medium">
                            Above Fold (Hero)
                          </span>
                        )}
                      </div>
                      <span className="text-xs text-slate-400 block mt-0.5">{info.desc}</span>
                    </div>
                  </div>

                  {/* Right: Controls (Rank input, Enable/Disable, Move Up/Down) */}
                  <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                    {/* Rank Jump Buttons */}
                    <div className="hidden md:flex items-center bg-slate-900 border border-slate-800 rounded-xl px-2 py-1 gap-1 text-[11px] text-slate-400 font-mono">
                      <span>Pos:</span>
                      <span className="text-white font-bold">{idx + 1}</span>
                      <span className="text-slate-600">/</span>
                      <span className="text-slate-500">{config.sectionsOrder.length}</span>
                    </div>

                    {/* Toggle Visibility */}
                    <button
                      type="button"
                      onClick={() => toggleSectionEnabled(sectionId)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                        isEnabled
                          ? 'bg-emerald-950/40 border-emerald-500/30 text-emerald-300 hover:bg-emerald-900/40'
                          : 'bg-slate-900 border-slate-800 text-slate-500 hover:text-slate-300'
                      }`}
                    >
                      {isEnabled ? 'Visible' : 'Hidden'}
                    </button>

                    {/* Step Reorder: Up / Down */}
                    <div className="flex items-center gap-1 bg-slate-900 border border-slate-800 rounded-xl p-0.5">
                      <button
                        type="button"
                        disabled={idx === 0}
                        onClick={() => moveSection(idx, 'up')}
                        className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white disabled:opacity-20 disabled:cursor-not-allowed transition-colors"
                        title="Move Section Up (Higher Rank)"
                      >
                        <ArrowUp className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        disabled={idx === config.sectionsOrder.length - 1}
                        onClick={() => moveSection(idx, 'down')}
                        className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white disabled:opacity-20 disabled:cursor-not-allowed transition-colors"
                        title="Move Section Down (Lower Rank)"
                      >
                        <ArrowDown className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Helper visual flow banner */}
          <div className="p-4 rounded-xl border border-slate-800/80 bg-[#060a12] text-xs text-slate-400 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>
                Changes take effect as soon as you reorder. Click <strong>"Save Homepage"</strong> at the top to commit your layout permanently.
              </span>
            </div>
            <button
              type="button"
              onClick={handleSave}
              className="px-3.5 py-1.5 rounded-xl bg-orange-600 hover:bg-orange-500 text-white font-semibold text-xs transition-colors shrink-0 shadow-sm"
            >
              {saved ? 'Saved!' : 'Save Layout'}
            </button>
          </div>
        </div>
      )}

      {/* TAB 2: Hero Customization */}
      {activeTab === 'hero' && (
        <div className="p-6 rounded-2xl border border-slate-800 bg-[#090d16] space-y-6">
          <div className="pb-3 border-b border-slate-800">
            <h3 className="font-display text-base font-bold text-white">Hero Spotlight Configuration</h3>
            <p className="text-xs text-slate-400">
              Configure how the prominent above-the-fold hero section renders on the public homepage.
            </p>
          </div>

          {/* Hero Type Selection */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <button
              type="button"
              onClick={() =>
                setConfig({
                  ...config,
                  hero: { ...config.hero, type: 'featured_post' },
                })
              }
              className={`p-4 rounded-xl border text-left transition-all ${
                config.hero.type === 'featured_post'
                  ? 'border-orange-500 bg-orange-950/20 text-white ring-1 ring-orange-500'
                  : 'border-slate-800 bg-slate-900/60 text-slate-400 hover:border-slate-700'
              }`}
            >
              <div className="font-semibold text-sm text-white mb-1">
                Featured Article Spotlight
              </div>
              <p className="text-xs text-slate-400">
                Pulls dynamically from a published article with title, excerpt, reading time, and cover image.
              </p>
            </button>

            <button
              type="button"
              onClick={() =>
                setConfig({
                  ...config,
                  hero: { ...config.hero, type: 'custom' },
                })
              }
              className={`p-4 rounded-xl border text-left transition-all ${
                config.hero.type === 'custom'
                  ? 'border-orange-500 bg-orange-950/20 text-white ring-1 ring-orange-500'
                  : 'border-slate-800 bg-slate-900/60 text-slate-400 hover:border-slate-700'
              }`}
            >
              <div className="font-semibold text-sm text-white mb-1">
                Custom Campaign / Brand Hero
              </div>
              <p className="text-xs text-slate-400">
                Craft custom headlines, description, custom CTA button text & destination link, and graphic.
              </p>
            </button>
          </div>

          {/* Badge Text */}
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
              Hero Top Badge Text
            </label>
            <input
              type="text"
              value={config.hero.badgeText}
              onChange={(e) =>
                setConfig({
                  ...config,
                  hero: { ...config.hero, badgeText: e.target.value },
                })
              }
              placeholder="Featured Blueprint"
              className="w-full sm:w-80 px-3 py-2 text-xs rounded-xl border border-slate-800 bg-slate-900 text-white"
            />
          </div>

          {/* If featured post mode */}
          {config.hero.type === 'featured_post' && (
            <div className="space-y-2 pt-2">
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Select Featured Article to Spotlight
              </label>
              <select
                value={config.hero.selectedPostId || 'auto'}
                onChange={(e) =>
                  setConfig({
                    ...config,
                    hero: { ...config.hero, selectedPostId: e.target.value },
                  })
                }
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-800 bg-slate-900 text-white"
              >
                <option value="auto">Automatic: First article marked as "Featured" (or newest published)</option>
                {publishedPosts.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.title} ({p.views.toLocaleString()} reads)
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* If custom hero mode */}
          {config.hero.type === 'custom' && (
            <div className="space-y-4 pt-2 border-t border-slate-800">
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
                  Custom Headline *
                </label>
                <input
                  type="text"
                  value={config.hero.customHeadline || ''}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      hero: { ...config.hero, customHeadline: e.target.value },
                    })
                  }
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-800 bg-slate-900 text-white text-base font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
                  Custom Subheadline / Summary
                </label>
                <textarea
                  rows={3}
                  value={config.hero.customSubheadline || ''}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      hero: { ...config.hero, customSubheadline: e.target.value },
                    })
                  }
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-800 bg-slate-900 text-white"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
                    CTA Button Text
                  </label>
                  <input
                    type="text"
                    value={config.hero.customCtaText || ''}
                    onChange={(e) =>
                      setConfig({
                        ...config,
                        hero: { ...config.hero, customCtaText: e.target.value },
                      })
                    }
                    placeholder="e.g. Explore Blueprints"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-800 bg-slate-900 text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
                    CTA Button Destination URL
                  </label>
                  <input
                    type="text"
                    value={config.hero.customCtaUrl || ''}
                    onChange={(e) =>
                      setConfig({
                        ...config,
                        hero: { ...config.hero, customCtaUrl: e.target.value },
                      })
                    }
                    placeholder="e.g. /category/technology or /about"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-800 bg-slate-900 text-white font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
                  Cover Image URL
                </label>
                <input
                  type="url"
                  value={config.hero.customImageUrl || ''}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      hero: { ...config.hero, customImageUrl: e.target.value },
                    })
                  }
                  placeholder="https://images.unsplash.com/..."
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-800 bg-slate-900 text-white"
                />
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 3: Announcement Bar */}
      {activeTab === 'announcement' && (
        <div className="p-6 rounded-2xl border border-slate-800 bg-[#090d16] space-y-4">
          <div className="pb-3 border-b border-slate-800">
            <h3 className="font-display text-base font-bold text-white">
              Announcement & Target Architecture Banner
            </h3>
            <p className="text-xs text-slate-400">
              Customize the prominent banner highlighting the ₹0 Cloudflare D1 architecture or important site notices.
            </p>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
                  Badge Label
                </label>
                <input
                  type="text"
                  value={config.announcement.badge}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      announcement: { ...config.announcement, badge: e.target.value },
                    })
                  }
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-800 bg-slate-900 text-white"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
                  Button Action
                </label>
                <select
                  value={config.announcement.buttonAction}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      announcement: {
                        ...config.announcement,
                        buttonAction: e.target.value as 'open_spec' | 'navigate',
                      },
                    })
                  }
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-800 bg-slate-900 text-white"
                >
                  <option value="open_spec">Open Specification Blueprint Modal</option>
                  <option value="navigate">Navigate to URL Path</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
                Headline Title
              </label>
              <input
                type="text"
                value={config.announcement.title}
                onChange={(e) =>
                  setConfig({
                    ...config,
                    announcement: { ...config.announcement, title: e.target.value },
                  })
                }
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-800 bg-slate-900 text-white font-semibold"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
                Description Text
              </label>
              <textarea
                rows={2}
                value={config.announcement.description}
                onChange={(e) =>
                  setConfig({
                    ...config,
                    announcement: { ...config.announcement, description: e.target.value },
                  })
                }
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-800 bg-slate-900 text-white resize-none"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
                  Button Text
                </label>
                <input
                  type="text"
                  value={config.announcement.buttonText}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      announcement: { ...config.announcement, buttonText: e.target.value },
                    })
                  }
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-800 bg-slate-900 text-white"
                />
              </div>
              {config.announcement.buttonAction === 'navigate' && (
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
                    Button URL Path
                  </label>
                  <input
                    type="text"
                    value={config.announcement.buttonUrl || ''}
                    onChange={(e) =>
                      setConfig({
                        ...config,
                        announcement: { ...config.announcement, buttonUrl: e.target.value },
                      })
                    }
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-800 bg-slate-900 text-white font-mono"
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: Trending & Featured */}
      {activeTab === 'trending' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {/* Trending Settings */}
          <div className="p-6 rounded-2xl border border-slate-800 bg-[#090d16] space-y-4">
            <h3 className="font-display text-base font-bold text-white pb-2 border-b border-slate-800">
              Trending / Popular Posts Ribbon
            </h3>
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
                Section Heading
              </label>
              <input
                type="text"
                value={config.trending.title}
                onChange={(e) =>
                  setConfig({
                    ...config,
                    trending: { ...config.trending, title: e.target.value },
                  })
                }
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-800 bg-slate-900 text-white"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
                Max Articles to Display (2 to 6)
              </label>
              <input
                type="number"
                min={2}
                max={6}
                value={config.trending.postLimit}
                onChange={(e) =>
                  setConfig({
                    ...config,
                    trending: { ...config.trending, postLimit: Number(e.target.value) },
                  })
                }
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-800 bg-slate-900 text-white"
              />
            </div>
          </div>

          {/* Featured Grid Settings */}
          <div className="p-6 rounded-2xl border border-slate-800 bg-[#090d16] space-y-4">
            <h3 className="font-display text-base font-bold text-white pb-2 border-b border-slate-800">
              Latest Feed Configuration
            </h3>
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
                Latest Publications Heading
              </label>
              <input
                type="text"
                value={config.latestFeed.title}
                onChange={(e) =>
                  setConfig({
                    ...config,
                    latestFeed: { ...config.latestFeed, title: e.target.value },
                  })
                }
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-800 bg-slate-900 text-white"
              />
            </div>
            <div className="pt-2">
              <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-300">
                <input
                  type="checkbox"
                  checked={config.latestFeed.showCategoryTabs}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      latestFeed: {
                        ...config.latestFeed,
                        showCategoryTabs: e.target.checked,
                      },
                    })
                  }
                  className="w-4 h-4 rounded text-orange-600 bg-slate-900 border-slate-800"
                />
                <span>Show interactive Category Tabs filter bar</span>
              </label>
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: Category Showcase Blocks */}
      {activeTab === 'categories' && (
        <div className="p-6 rounded-2xl border border-slate-800 bg-[#090d16] space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div>
              <h3 className="font-display text-base font-bold text-white">
                Category Sections on Homepage
              </h3>
              <p className="text-xs text-slate-400">
                Per Section 3 of specification: "Category sections configurable from admin". Highlight curated topic deep dives directly on the homepage.
              </p>
            </div>
            <button
              type="button"
              onClick={addCategoryShowcase}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-orange-600 hover:bg-orange-500 text-white text-xs font-semibold"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Category Section</span>
            </button>
          </div>

          {config.categorySections?.length === 0 ? (
            <div className="p-10 text-center text-slate-500 rounded-xl border border-slate-800 bg-[#060910] text-xs">
              No category showcases added. Click "Add Category Section" to feature a specific category on the homepage.
            </div>
          ) : (
            <div className="space-y-4">
              {config.categorySections.map((sec, idx) => {
                const cat = categories.find((c) => c.id === sec.categoryId);
                return (
                  <div
                    key={sec.id}
                    className="p-4 rounded-xl border border-slate-800 bg-[#060910] space-y-3"
                  >
                    <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                      <div className="flex items-center gap-2">
                        <span
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: cat?.color || '#f97316' }}
                        />
                        <span className="font-semibold text-xs text-white">
                          Showcase Block #{idx + 1}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          disabled={idx === 0}
                          onClick={() => moveCategoryShowcase(idx, 'up')}
                          className="p-1 rounded bg-slate-800 text-slate-300 hover:text-white disabled:opacity-20"
                          title="Move Up"
                        >
                          <ArrowUp className="w-3 h-3" />
                        </button>
                        <button
                          type="button"
                          disabled={idx === config.categorySections.length - 1}
                          onClick={() => moveCategoryShowcase(idx, 'down')}
                          className="p-1 rounded bg-slate-800 text-slate-300 hover:text-white disabled:opacity-20"
                          title="Move Down"
                        >
                          <ArrowDown className="w-3 h-3" />
                        </button>
                        <button
                          type="button"
                          onClick={() => removeCategoryShowcase(sec.id)}
                          className="p-1 text-slate-500 hover:text-rose-400 ml-1"
                          title="Remove category section"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="block text-[11px] text-slate-400 mb-1">
                          Category *
                        </label>
                        <select
                          value={sec.categoryId}
                          onChange={(e) => {
                            const updated = [...config.categorySections];
                            updated[idx].categoryId = e.target.value;
                            const targetCat = categories.find((c) => c.id === e.target.value);
                            if (targetCat) {
                              updated[idx].customTitle = `${targetCat.name} Spotlight`;
                            }
                            setConfig({ ...config, categorySections: updated });
                          }}
                          className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-800 bg-slate-900 text-white"
                        >
                          {categories.map((c) => (
                            <option key={c.id} value={c.id}>
                              {c.name}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-[11px] text-slate-400 mb-1">
                          Custom Section Heading
                        </label>
                        <input
                          type="text"
                          value={sec.customTitle || ''}
                          onChange={(e) => {
                            const updated = [...config.categorySections];
                            updated[idx].customTitle = e.target.value;
                            setConfig({ ...config, categorySections: updated });
                          }}
                          className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-800 bg-slate-900 text-white font-medium"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] text-slate-400 mb-1">
                          Max Articles to Show
                        </label>
                        <input
                          type="number"
                          min={1}
                          max={6}
                          value={sec.postLimit}
                          onChange={(e) => {
                            const updated = [...config.categorySections];
                            updated[idx].postLimit = Number(e.target.value);
                            setConfig({ ...config, categorySections: updated });
                          }}
                          className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-800 bg-slate-900 text-white"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] text-slate-400 mb-1">
                        Subheadline / Description
                      </label>
                      <input
                        type="text"
                        value={sec.customSubtitle || ''}
                        onChange={(e) => {
                          const updated = [...config.categorySections];
                          updated[idx].customSubtitle = e.target.value;
                          setConfig({ ...config, categorySections: updated });
                        }}
                        placeholder="Explain what readers will discover in this section..."
                        className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-800 bg-slate-900 text-slate-300"
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 6: Newsletter Area */}
      {activeTab === 'newsletter' && (
        <div className="p-6 rounded-2xl border border-slate-800 bg-[#090d16] space-y-5">
          <div className="pb-3 border-b border-slate-800">
            <h3 className="font-display text-base font-bold text-white">
              Newsletter & Community Subscription Area
            </h3>
            <p className="text-xs text-slate-400">
              Customize the prominent bottom subscription section and reader takeaway promises.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
                Badge Text
              </label>
              <input
                type="text"
                value={config.newsletter.badge}
                onChange={(e) =>
                  setConfig({
                    ...config,
                    newsletter: { ...config.newsletter, badge: e.target.value },
                  })
                }
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-800 bg-slate-900 text-white"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
                Subscriber Count Counter Copy
              </label>
              <input
                type="text"
                value={config.newsletter.subscriberCountText}
                onChange={(e) =>
                  setConfig({
                    ...config,
                    newsletter: { ...config.newsletter, subscriberCountText: e.target.value },
                  })
                }
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-800 bg-slate-900 text-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
              Headline Title
            </label>
            <input
              type="text"
              value={config.newsletter.title}
              onChange={(e) =>
                setConfig({
                  ...config,
                  newsletter: { ...config.newsletter, title: e.target.value },
                })
              }
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-800 bg-slate-900 text-white font-bold"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
              Description Body
            </label>
            <textarea
              rows={3}
              value={config.newsletter.description}
              onChange={(e) =>
                setConfig({
                  ...config,
                  newsletter: { ...config.newsletter, description: e.target.value },
                })
              }
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-800 bg-slate-900 text-white resize-none"
            />
          </div>

          {/* Perks list */}
          <div className="space-y-2 pt-2">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Value Perks (Bullet Points)
              </label>
              <button
                type="button"
                onClick={addNewsletterPerk}
                className="text-xs text-orange-400 hover:underline"
              >
                + Add Perk
              </button>
            </div>

            <div className="space-y-2">
              {config.newsletter.perks.map((perk, pIdx) => (
                <div key={pIdx} className="flex items-center gap-2">
                  <span className="text-emerald-400 font-bold text-xs">✓</span>
                  <input
                    type="text"
                    value={perk}
                    onChange={(e) => {
                      const updated = [...config.newsletter.perks];
                      updated[pIdx] = e.target.value;
                      setConfig({
                        ...config,
                        newsletter: { ...config.newsletter, perks: updated },
                      });
                    }}
                    className="flex-1 px-3 py-1.5 text-xs rounded-lg border border-slate-800 bg-slate-900 text-white"
                  />
                  <button
                    type="button"
                    onClick={() => removeNewsletterPerk(pIdx)}
                    className="p-1 text-slate-500 hover:text-rose-400"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 7: Sidebar Customization */}
      {activeTab === 'sidebar' && (
        <div className="p-6 rounded-2xl border border-slate-800 bg-[#090d16] space-y-6">
          <div className="pb-3 border-b border-slate-800">
            <h3 className="font-display text-base font-bold text-white">
              Desktop Sidebar Widgets
            </h3>
            <p className="text-xs text-slate-400">
              Configure which widgets appear on the desktop sidebar next to the latest posts.
            </p>
          </div>

          <div className="space-y-4">
            {/* Widget 1: Author Spotlight */}
            <div className="p-4 rounded-xl border border-slate-800 bg-[#060910] space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-white">Widget: Author Spotlight</span>
                <label className="flex items-center gap-2 cursor-pointer text-xs">
                  <input
                    type="checkbox"
                    checked={config.sidebar.showAuthorSpotlight}
                    onChange={(e) =>
                      setConfig({
                        ...config,
                        sidebar: {
                          ...config.sidebar,
                          showAuthorSpotlight: e.target.checked,
                        },
                      })
                    }
                    className="w-4 h-4 rounded text-orange-600 bg-slate-900 border-slate-800"
                  />
                  <span className={config.sidebar.showAuthorSpotlight ? 'text-emerald-400' : 'text-slate-500'}>
                    {config.sidebar.showAuthorSpotlight ? 'Enabled' : 'Disabled'}
                  </span>
                </label>
              </div>
              <input
                type="text"
                value={config.sidebar.authorSpotlightTitle}
                onChange={(e) =>
                  setConfig({
                    ...config,
                    sidebar: {
                      ...config.sidebar,
                      authorSpotlightTitle: e.target.value,
                    },
                  })
                }
                placeholder="Author Spotlight"
                className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-800 bg-slate-900 text-white"
              />
            </div>

            {/* Widget 2: Explore Tags */}
            <div className="p-4 rounded-xl border border-slate-800 bg-[#060910] space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-white">Widget: Explore Tags</span>
                <label className="flex items-center gap-2 cursor-pointer text-xs">
                  <input
                    type="checkbox"
                    checked={config.sidebar.showTags}
                    onChange={(e) =>
                      setConfig({
                        ...config,
                        sidebar: {
                          ...config.sidebar,
                          showTags: e.target.checked,
                        },
                      })
                    }
                    className="w-4 h-4 rounded text-orange-600 bg-slate-900 border-slate-800"
                  />
                  <span className={config.sidebar.showTags ? 'text-emerald-400' : 'text-slate-500'}>
                    {config.sidebar.showTags ? 'Enabled' : 'Disabled'}
                  </span>
                </label>
              </div>
              <input
                type="text"
                value={config.sidebar.tagsTitle}
                onChange={(e) =>
                  setConfig({
                    ...config,
                    sidebar: {
                      ...config.sidebar,
                      tagsTitle: e.target.value,
                    },
                  })
                }
                placeholder="Explore Tags"
                className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-800 bg-slate-900 text-white"
              />
            </div>

            {/* Widget 3: Newsletter Mini Card */}
            <div className="p-4 rounded-xl border border-slate-800 bg-[#060910] space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-white">Widget: Newsletter Card</span>
                <label className="flex items-center gap-2 cursor-pointer text-xs">
                  <input
                    type="checkbox"
                    checked={config.sidebar.showNewsletter}
                    onChange={(e) =>
                      setConfig({
                        ...config,
                        sidebar: {
                          ...config.sidebar,
                          showNewsletter: e.target.checked,
                        },
                      })
                    }
                    className="w-4 h-4 rounded text-orange-600 bg-slate-900 border-slate-800"
                  />
                  <span className={config.sidebar.showNewsletter ? 'text-emerald-400' : 'text-slate-500'}>
                    {config.sidebar.showNewsletter ? 'Enabled' : 'Disabled'}
                  </span>
                </label>
              </div>
              <input
                type="text"
                value={config.sidebar.newsletterTitle}
                onChange={(e) =>
                  setConfig({
                    ...config,
                    sidebar: {
                      ...config.sidebar,
                      newsletterTitle: e.target.value,
                    },
                  })
                }
                placeholder="The Edge Letter"
                className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-800 bg-slate-900 text-white"
              />
              <textarea
                rows={2}
                value={config.sidebar.newsletterDesc}
                onChange={(e) =>
                  setConfig({
                    ...config,
                    sidebar: {
                      ...config.sidebar,
                      newsletterDesc: e.target.value,
                    },
                  })
                }
                className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-800 bg-slate-900 text-white resize-none"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
