import React, { useState } from 'react';
import { usePrompts } from '../../context/PromptContext';
import { SiteCustomizerSettings, FaqItem, MenuItem } from '../../types/prompt';
import { 
  Palette, 
  Save, 
  Sparkles, 
  Layout, 
  HelpCircle, 
  Plus, 
  Trash2, 
  Globe, 
  Sliders, 
  MessageSquare, 
  CheckCircle2,
  Share2,
  Tv,
  Menu,
  Eye,
  RotateCcw
} from 'lucide-react';

export const Customizer: React.FC = () => {
  const { customizerSettings, updateCustomizerSettings, showToast, resetAllToSeed } = usePrompts();

  const [activeTab, setActiveTab] = useState<'branding' | 'menu' | 'hero' | 'featured' | 'faq' | 'cta' | 'footer' | 'layout'>('branding');

  // Form State
  const [settings, setSettings] = useState<SiteCustomizerSettings>(customizerSettings);
  const [newTagInput, setNewTagInput] = useState('');
  const [newMenuItemLabel, setNewMenuItemLabel] = useState('');
  const [newMenuItemUrl, setNewMenuItemUrl] = useState('');

  // Save handler
  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateCustomizerSettings(settings);
    showToast('Customizer changes saved & published to Astro frontend!');
  };

  // FAQ Manager helpers
  const handleAddFaq = () => {
    const newFaq: FaqItem = {
      id: `faq-${Date.now()}`,
      question: 'New Question Here?',
      answer: 'Detailed helpful explanation goes here.'
    };
    setSettings((prev) => ({
      ...prev,
      faqSection: {
        ...prev.faqSection,
        items: [...prev.faqSection.items, newFaq]
      }
    }));
  };

  const handleUpdateFaq = (id: string, q: string, a: string) => {
    setSettings((prev) => ({
      ...prev,
      faqSection: {
        ...prev.faqSection,
        items: prev.faqSection.items.map((item) =>
          item.id === id ? { ...item, question: q, answer: a } : item
        )
      }
    }));
  };

  const handleDeleteFaq = (id: string) => {
    setSettings((prev) => ({
      ...prev,
      faqSection: {
        ...prev.faqSection,
        items: prev.faqSection.items.filter((item) => item.id !== id)
      }
    }));
  };

  // Trending Tag helpers
  const handleAddTag = () => {
    if (!newTagInput.trim()) return;
    setSettings((prev) => ({
      ...prev,
      hero: {
        ...prev.hero,
        trendingTags: [...prev.hero.trendingTags, newTagInput.trim()]
      }
    }));
    setNewTagInput('');
  };

  const handleDeleteTag = (tagToRemove: string) => {
    setSettings((prev) => ({
      ...prev,
      hero: {
        ...prev.hero,
        trendingTags: prev.hero.trendingTags.filter((t) => t !== tagToRemove)
      }
    }));
  };

  // Menu Items helper
  const handleAddMenuItem = () => {
    if (!newMenuItemLabel.trim() || !newMenuItemUrl.trim()) return;
    const newItem: MenuItem = {
      id: `menu-${Date.now()}`,
      label: newMenuItemLabel.trim(),
      url: newMenuItemUrl.trim()
    };
    setSettings(prev => ({
      ...prev,
      headerMenuItems: [...(prev.headerMenuItems || []), newItem]
    }));
    setNewMenuItemLabel('');
    setNewMenuItemUrl('');
  };

  const handleDeleteMenuItem = (id: string) => {
    setSettings(prev => ({
      ...prev,
      headerMenuItems: (prev.headerMenuItems || []).filter(m => m.id !== id)
    }));
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-[#212435]">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2.5">
            <Palette className="w-6 h-6 text-pink-400" />
            <span>Complete Site CMS & Section Customizer</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Every single section of the website is customizable from this control panel.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={resetAllToSeed}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium bg-[#1e2132] hover:bg-[#282c42] text-slate-300 transition-colors cursor-pointer"
            title="Reset to default settings"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset</span>
          </button>
          <button
            onClick={handleSave}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold bg-violet-600 hover:bg-violet-500 text-white shadow-md shadow-violet-900/30 transition-colors cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>Save All Changes</span>
          </button>
        </div>
      </div>

      {/* Navigation Tabs for Sections */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 border-b border-[#232738] text-xs">
        {[
          { id: 'branding', label: 'Site Identity & Notice', icon: Globe },
          { id: 'menu', label: 'Navigation Menu', icon: Menu },
          { id: 'hero', label: 'Hero Section', icon: Sparkles },
          { id: 'featured', label: 'Featured Spotlight', icon: Layout },
          { id: 'faq', label: 'Homepage FAQs', icon: HelpCircle },
          { id: 'cta', label: 'CTA Banner', icon: Sliders },
          { id: 'footer', label: 'Footer & Socials', icon: Share2 },
          { id: 'layout', label: 'Layout & Engine', icon: Tv }
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-3 py-2 rounded-lg font-medium transition-colors whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
                isActive
                  ? 'bg-violet-600 text-white font-semibold'
                  : 'text-slate-400 hover:text-white bg-[#141624]'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Content Form Panels */}
      <div className="bg-[#141624] border border-[#242738] rounded-2xl p-6 shadow-xl space-y-6">
        
        {/* 1. BRANDING & NOTICE BAR */}
        {activeTab === 'branding' && (
          <div className="space-y-6">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2 border-b border-[#232738] pb-3">
              <Globe className="w-4 h-4 text-violet-400" />
              <span>Brand Identity & Global Notice</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">Site Title *</label>
                <input
                  type="text"
                  value={settings.siteTitle}
                  onChange={(e) => setSettings({ ...settings, siteTitle: e.target.value })}
                  className="w-full bg-[#0d0e17] border border-[#262a3e] rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-violet-500 font-medium"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">Tagline</label>
                <input
                  type="text"
                  value={settings.tagline}
                  onChange={(e) => setSettings({ ...settings, tagline: e.target.value })}
                  className="w-full bg-[#0d0e17] border border-[#262a3e] rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-violet-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">Brand Accent Color</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={settings.brandColor || '#8b5cf6'}
                    onChange={(e) => setSettings({ ...settings, brandColor: e.target.value })}
                    className="w-9 h-9 rounded bg-transparent border-0 cursor-pointer"
                  />
                  <input
                    type="text"
                    value={settings.brandColor}
                    onChange={(e) => setSettings({ ...settings, brandColor: e.target.value })}
                    className="flex-1 bg-[#0d0e17] border border-[#262a3e] rounded-lg px-3 py-2 text-xs font-mono text-violet-300"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">Logo Image URL (Optional)</label>
                <input
                  type="text"
                  value={settings.logoUrl || ''}
                  onChange={(e) => setSettings({ ...settings, logoUrl: e.target.value })}
                  placeholder="https://..."
                  className="w-full bg-[#0d0e17] border border-[#262a3e] rounded-lg px-3 py-2 text-xs text-slate-200"
                />
              </div>
            </div>

            {/* Announcement Banner */}
            <div className="p-4 rounded-xl bg-[#0e1019] border border-[#232738] space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-slate-200">Header Announcement Notice Bar</h4>
                <label className="flex items-center gap-2 cursor-pointer text-xs">
                  <input
                    type="checkbox"
                    checked={settings.headerNoticeEnabled}
                    onChange={(e) => setSettings({ ...settings, headerNoticeEnabled: e.target.checked })}
                    className="rounded border-[#262a3e] bg-[#141624] text-violet-600 focus:ring-0"
                  />
                  <span className="text-slate-300">Enable Header Notice</span>
                </label>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <input
                  type="text"
                  value={settings.headerNotice}
                  onChange={(e) => setSettings({ ...settings, headerNotice: e.target.value })}
                  placeholder="Notice text message..."
                  className="w-full bg-[#141624] border border-[#262a3e] rounded-lg px-3 py-2 text-xs text-white"
                />
                <input
                  type="text"
                  value={settings.headerNoticeLink || ''}
                  onChange={(e) => setSettings({ ...settings, headerNoticeLink: e.target.value })}
                  placeholder="Notice click link (e.g. #deploy)"
                  className="w-full bg-[#141624] border border-[#262a3e] rounded-lg px-3 py-2 text-xs text-violet-300 font-mono"
                />
              </div>
            </div>
          </div>
        )}

        {/* 2. NAVIGATION MENU */}
        {activeTab === 'menu' && (
          <div className="space-y-6">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2 border-b border-[#232738] pb-3">
              <Menu className="w-4 h-4 text-violet-400" />
              <span>Header Navigation Links</span>
            </h3>

            <div className="space-y-3">
              {(settings.headerMenuItems || []).map((menuItem) => (
                <div key={menuItem.id} className="flex items-center gap-3 p-3 bg-[#0d0e17] rounded-xl border border-[#262a3e]">
                  <input
                    type="text"
                    value={menuItem.label}
                    onChange={(e) => {
                      const updated = (settings.headerMenuItems || []).map(m => m.id === menuItem.id ? { ...m, label: e.target.value } : m);
                      setSettings({ ...settings, headerMenuItems: updated });
                    }}
                    className="flex-1 bg-[#141624] border border-[#262a3e] rounded px-2.5 py-1 text-xs text-white"
                  />
                  <input
                    type="text"
                    value={menuItem.url}
                    onChange={(e) => {
                      const updated = (settings.headerMenuItems || []).map(m => m.id === menuItem.id ? { ...m, url: e.target.value } : m);
                      setSettings({ ...settings, headerMenuItems: updated });
                    }}
                    className="flex-1 bg-[#141624] border border-[#262a3e] rounded px-2.5 py-1 text-xs font-mono text-violet-300"
                  />
                  <button
                    type="button"
                    onClick={() => handleDeleteMenuItem(menuItem.id)}
                    className="p-1.5 hover:bg-rose-950 rounded text-rose-400 cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>

            {/* Add Menu Item */}
            <div className="p-4 bg-[#0d0e17] rounded-xl border border-[#262a3e] space-y-3">
              <span className="text-xs font-semibold text-slate-300">Add New Navigation Item</span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <input
                  type="text"
                  placeholder="Label (e.g. Documentation)"
                  value={newMenuItemLabel}
                  onChange={(e) => setNewMenuItemLabel(e.target.value)}
                  className="bg-[#141624] border border-[#262a3e] rounded px-3 py-2 text-xs text-white"
                />
                <input
                  type="text"
                  placeholder="URL (e.g. #docs or https://...)"
                  value={newMenuItemUrl}
                  onChange={(e) => setNewMenuItemUrl(e.target.value)}
                  className="bg-[#141624] border border-[#262a3e] rounded px-3 py-2 text-xs text-violet-300"
                />
              </div>
              <button
                type="button"
                onClick={handleAddMenuItem}
                className="px-3 py-1.5 rounded bg-violet-600 hover:bg-violet-500 text-white text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Menu Item</span>
              </button>
            </div>
          </div>
        )}

        {/* 3. HERO SECTION */}
        {activeTab === 'hero' && (
          <div className="space-y-6">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2 border-b border-[#232738] pb-3">
              <Sparkles className="w-4 h-4 text-violet-400" />
              <span>Hero Section Settings</span>
            </h3>

            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">Kicker Badge Text</label>
                <input
                  type="text"
                  value={settings.hero.kicker}
                  onChange={(e) => setSettings({ ...settings, hero: { ...settings.hero, kicker: e.target.value } })}
                  className="w-full bg-[#0d0e17] border border-[#262a3e] rounded-lg px-3 py-2 text-xs text-white"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">Hero Main Title *</label>
                <input
                  type="text"
                  value={settings.hero.title}
                  onChange={(e) => setSettings({ ...settings, hero: { ...settings.hero, title: e.target.value } })}
                  className="w-full bg-[#0d0e17] border border-[#262a3e] rounded-lg px-3 py-2 text-sm font-bold text-white"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">Hero Subtitle / Description</label>
                <textarea
                  rows={3}
                  value={settings.hero.subtitle}
                  onChange={(e) => setSettings({ ...settings, hero: { ...settings.hero, subtitle: e.target.value } })}
                  className="w-full bg-[#0d0e17] border border-[#262a3e] rounded-lg p-2.5 text-xs text-slate-200 leading-relaxed"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">Search Placeholder Text</label>
                <input
                  type="text"
                  value={settings.hero.searchPlaceholder}
                  onChange={(e) => setSettings({ ...settings, hero: { ...settings.hero, searchPlaceholder: e.target.value } })}
                  className="w-full bg-[#0d0e17] border border-[#262a3e] rounded-lg px-3 py-2 text-xs text-slate-200"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-300">Trending Search Tags</label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {settings.hero.trendingTags.map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#10121b] border border-[#262a3e] text-xs text-slate-200"
                    >
                      <span>{tag}</span>
                      <button
                        type="button"
                        onClick={() => handleDeleteTag(tag)}
                        className="text-slate-500 hover:text-rose-400 cursor-pointer"
                      >
                        ✕
                      </button>
                    </span>
                  ))}
                </div>

                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newTagInput}
                    onChange={(e) => setNewTagInput(e.target.value)}
                    placeholder="Add trending keyword..."
                    className="flex-1 bg-[#0d0e17] border border-[#262a3e] rounded-lg px-3 py-1.5 text-xs text-white"
                  />
                  <button
                    type="button"
                    onClick={handleAddTag}
                    className="px-3 py-1.5 rounded-lg bg-violet-600 hover:bg-violet-500 text-white text-xs font-semibold cursor-pointer"
                  >
                    Add Tag
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 4. FEATURED SPOTLIGHT */}
        {activeTab === 'featured' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between border-b border-[#232738] pb-3">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <Layout className="w-4 h-4 text-violet-400" />
                <span>Featured Spotlight Section</span>
              </h3>
              <label className="flex items-center gap-2 cursor-pointer text-xs">
                <input
                  type="checkbox"
                  checked={settings.featuredSection.enabled}
                  onChange={(e) => setSettings({ ...settings, featuredSection: { ...settings.featuredSection, enabled: e.target.checked } })}
                  className="rounded border-[#262a3e] bg-[#141624] text-violet-600"
                />
                <span className="text-slate-300 font-semibold">Enable Section</span>
              </label>
            </div>

            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">Spotlight Badge</label>
                <input
                  type="text"
                  value={settings.featuredSection.badge}
                  onChange={(e) => setSettings({ ...settings, featuredSection: { ...settings.featuredSection, badge: e.target.value } })}
                  className="w-full bg-[#0d0e17] border border-[#262a3e] rounded-lg px-3 py-2 text-xs text-white"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">Section Title</label>
                <input
                  type="text"
                  value={settings.featuredSection.title}
                  onChange={(e) => setSettings({ ...settings, featuredSection: { ...settings.featuredSection, title: e.target.value } })}
                  className="w-full bg-[#0d0e17] border border-[#262a3e] rounded-lg px-3 py-2 text-xs text-white font-bold"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">Section Subtitle</label>
                <input
                  type="text"
                  value={settings.featuredSection.subtitle}
                  onChange={(e) => setSettings({ ...settings, featuredSection: { ...settings.featuredSection, subtitle: e.target.value } })}
                  className="w-full bg-[#0d0e17] border border-[#262a3e] rounded-lg px-3 py-2 text-xs text-slate-200"
                />
              </div>
            </div>
          </div>
        )}

        {/* 5. HOMEPAGE FAQS */}
        {activeTab === 'faq' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between border-b border-[#232738] pb-3">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-violet-400" />
                <span>Homepage FAQ Accordion Section</span>
              </h3>
              <label className="flex items-center gap-2 cursor-pointer text-xs">
                <input
                  type="checkbox"
                  checked={settings.faqSection.enabled}
                  onChange={(e) => setSettings({ ...settings, faqSection: { ...settings.faqSection, enabled: e.target.checked } })}
                  className="rounded border-[#262a3e] bg-[#141624] text-violet-600"
                />
                <span className="text-slate-300 font-semibold">Enable FAQ Section</span>
              </label>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">FAQ Section Title</label>
                <input
                  type="text"
                  value={settings.faqSection.title}
                  onChange={(e) => setSettings({ ...settings, faqSection: { ...settings.faqSection, title: e.target.value } })}
                  className="w-full bg-[#0d0e17] border border-[#262a3e] rounded-lg px-3 py-2 text-xs text-white"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">FAQ Section Subtitle</label>
                <input
                  type="text"
                  value={settings.faqSection.subtitle}
                  onChange={(e) => setSettings({ ...settings, faqSection: { ...settings.faqSection, subtitle: e.target.value } })}
                  className="w-full bg-[#0d0e17] border border-[#262a3e] rounded-lg px-3 py-2 text-xs text-slate-200"
                />
              </div>
            </div>

            {/* Dynamic FAQ Item Editor */}
            <div className="space-y-4 pt-4 border-t border-[#232738]">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase text-slate-300">FAQ Question List ({settings.faqSection.items.length})</span>
                <button
                  type="button"
                  onClick={handleAddFaq}
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold bg-violet-600 hover:bg-violet-500 text-white cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Question</span>
                </button>
              </div>

              <div className="space-y-3">
                {settings.faqSection.items.map((faq, idx) => (
                  <div key={faq.id} className="p-4 rounded-xl bg-[#0d0e17] border border-[#262a3e] space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-violet-400 font-mono">Q#{idx + 1}</span>
                      <button
                        type="button"
                        onClick={() => handleDeleteFaq(faq.id)}
                        className="text-rose-400 hover:text-rose-300 p-1 cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <input
                      type="text"
                      value={faq.question}
                      onChange={(e) => handleUpdateFaq(faq.id, e.target.value, faq.answer)}
                      placeholder="Question text..."
                      className="w-full bg-[#141624] border border-[#262a3e] rounded-lg px-3 py-1.5 text-xs font-semibold text-white"
                    />

                    <textarea
                      rows={2}
                      value={faq.answer}
                      onChange={(e) => handleUpdateFaq(faq.id, faq.question, e.target.value)}
                      placeholder="Answer details..."
                      className="w-full bg-[#141624] border border-[#262a3e] rounded-lg p-2.5 text-xs text-slate-300 leading-relaxed"
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* 6. CTA BANNER */}
        {activeTab === 'cta' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between border-b border-[#232738] pb-3">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <Sliders className="w-4 h-4 text-violet-400" />
                <span>Call to Action Banner Section</span>
              </h3>
              <label className="flex items-center gap-2 cursor-pointer text-xs">
                <input
                  type="checkbox"
                  checked={settings.ctaSection.enabled}
                  onChange={(e) => setSettings({ ...settings, ctaSection: { ...settings.ctaSection, enabled: e.target.checked } })}
                  className="rounded border-[#262a3e] bg-[#141624] text-violet-600"
                />
                <span className="text-slate-300 font-semibold">Enable CTA Banner</span>
              </label>
            </div>

            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">CTA Badge</label>
                <input
                  type="text"
                  value={settings.ctaSection.badge}
                  onChange={(e) => setSettings({ ...settings, ctaSection: { ...settings.ctaSection, badge: e.target.value } })}
                  className="w-full bg-[#0d0e17] border border-[#262a3e] rounded-lg px-3 py-2 text-xs text-white"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">CTA Main Heading</label>
                <input
                  type="text"
                  value={settings.ctaSection.title}
                  onChange={(e) => setSettings({ ...settings, ctaSection: { ...settings.ctaSection, title: e.target.value } })}
                  className="w-full bg-[#0d0e17] border border-[#262a3e] rounded-lg px-3 py-2 text-xs font-bold text-white"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">CTA Subtitle</label>
                <textarea
                  rows={2}
                  value={settings.ctaSection.subtitle}
                  onChange={(e) => setSettings({ ...settings, ctaSection: { ...settings.ctaSection, subtitle: e.target.value } })}
                  className="w-full bg-[#0d0e17] border border-[#262a3e] rounded-lg p-2.5 text-xs text-slate-200"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">Primary Button Text</label>
                  <input
                    type="text"
                    value={settings.ctaSection.buttonText}
                    onChange={(e) => setSettings({ ...settings, ctaSection: { ...settings.ctaSection, buttonText: e.target.value } })}
                    className="w-full bg-[#0d0e17] border border-[#262a3e] rounded-lg px-3 py-2 text-xs text-white"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">Secondary Button Text</label>
                  <input
                    type="text"
                    value={settings.ctaSection.secondaryButtonText}
                    onChange={(e) => setSettings({ ...settings, ctaSection: { ...settings.ctaSection, secondaryButtonText: e.target.value } })}
                    className="w-full bg-[#0d0e17] border border-[#262a3e] rounded-lg px-3 py-2 text-xs text-slate-200"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 7. FOOTER & SOCIALS */}
        {activeTab === 'footer' && (
          <div className="space-y-6">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2 border-b border-[#232738] pb-3">
              <Share2 className="w-4 h-4 text-violet-400" />
              <span>Footer Branding & Social Links</span>
            </h3>

            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">Brand Name</label>
                <input
                  type="text"
                  value={settings.footer.brandName}
                  onChange={(e) => setSettings({ ...settings, footer: { ...settings.footer, brandName: e.target.value } })}
                  className="w-full bg-[#0d0e17] border border-[#262a3e] rounded-lg px-3 py-2 text-xs text-white font-semibold"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">Brand Biography / Blurb</label>
                <textarea
                  rows={2}
                  value={settings.footer.bio}
                  onChange={(e) => setSettings({ ...settings, footer: { ...settings.footer, bio: e.target.value } })}
                  className="w-full bg-[#0d0e17] border border-[#262a3e] rounded-lg p-2.5 text-xs text-slate-200"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">Twitter / X URL</label>
                  <input
                    type="text"
                    value={settings.footer.socialTwitter}
                    onChange={(e) => setSettings({ ...settings, footer: { ...settings.footer, socialTwitter: e.target.value } })}
                    className="w-full bg-[#0d0e17] border border-[#262a3e] rounded-lg px-3 py-2 text-xs text-slate-200"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">Discord URL</label>
                  <input
                    type="text"
                    value={settings.footer.socialDiscord}
                    onChange={(e) => setSettings({ ...settings, footer: { ...settings.footer, socialDiscord: e.target.value } })}
                    className="w-full bg-[#0d0e17] border border-[#262a3e] rounded-lg px-3 py-2 text-xs text-slate-200"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">GitHub URL</label>
                  <input
                    type="text"
                    value={settings.footer.socialGithub}
                    onChange={(e) => setSettings({ ...settings, footer: { ...settings.footer, socialGithub: e.target.value } })}
                    className="w-full bg-[#0d0e17] border border-[#262a3e] rounded-lg px-3 py-2 text-xs text-slate-200"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">YouTube URL</label>
                  <input
                    type="text"
                    value={settings.footer.socialYoutube}
                    onChange={(e) => setSettings({ ...settings, footer: { ...settings.footer, socialYoutube: e.target.value } })}
                    className="w-full bg-[#0d0e17] border border-[#262a3e] rounded-lg px-3 py-2 text-xs text-slate-200"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">Copyright Line</label>
                <input
                  type="text"
                  value={settings.footer.copyrightText}
                  onChange={(e) => setSettings({ ...settings, footer: { ...settings.footer, copyrightText: e.target.value } })}
                  className="w-full bg-[#0d0e17] border border-[#262a3e] rounded-lg px-3 py-2 text-xs text-slate-400"
                />
              </div>
            </div>
          </div>
        )}

        {/* 8. LAYOUT & POSTS */}
        {activeTab === 'layout' && (
          <div className="space-y-6">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2 border-b border-[#232738] pb-3">
              <Tv className="w-4 h-4 text-violet-400" />
              <span>Container Width & Prompt Studio</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">Container Max Width</label>
                <select
                  value={settings.containerMaxWidth || 'max-w-7xl'}
                  onChange={(e) => setSettings({ ...settings, containerMaxWidth: e.target.value as any })}
                  className="w-full bg-[#0d0e17] border border-[#262a3e] rounded-lg px-3 py-2 text-xs text-slate-200"
                >
                  <option value="max-w-6xl">Compact (max-w-6xl)</option>
                  <option value="max-w-7xl">Standard Modern (max-w-7xl)</option>
                  <option value="max-w-screen-2xl">Ultra-Wide (max-w-screen-2xl)</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">Prompts Per Page</label>
                <input
                  type="number"
                  min="4"
                  max="48"
                  value={settings.postsPerPage}
                  onChange={(e) => setSettings({ ...settings, postsPerPage: parseInt(e.target.value, 10) || 12 })}
                  className="w-full bg-[#0d0e17] border border-[#262a3e] rounded-lg px-3 py-2 text-xs text-slate-200"
                />
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
