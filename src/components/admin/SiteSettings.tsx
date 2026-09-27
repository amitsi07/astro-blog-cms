import React, { useState } from 'react';
import { SiteSettings, User, AdSlot, SiteTypography } from '../../types/cms';
import { Settings, Save, ShieldAlert, Sparkles, Check, Type } from 'lucide-react';

export const FONT_PRESETS: SiteTypography[] = [
  {
    presetId: 'bricolage_inter',
    presetName: 'Modern Editorial (Bricolage + Inter)',
    displayFont: "'Bricolage Grotesque', sans-serif",
    bodyFont: "'Inter', sans-serif",
    monoFont: "'JetBrains Mono', monospace",
  },
  {
    presetId: 'outfit_inter',
    presetName: 'Geometric Minimalist (Outfit + Inter)',
    displayFont: "'Outfit', sans-serif",
    bodyFont: "'Inter', sans-serif",
    monoFont: "'JetBrains Mono', monospace",
  },
  {
    presetId: 'space_jakarta',
    presetName: 'Avant-Garde Tech (Space Grotesk + Plus Jakarta)',
    displayFont: "'Space Grotesk', sans-serif",
    bodyFont: "'Plus Jakarta Sans', sans-serif",
    monoFont: "'JetBrains Mono', monospace",
  },
  {
    presetId: 'syne_inter',
    presetName: 'Neo-Grotesque & Bold (Syne + Inter)',
    displayFont: "'Syne', sans-serif",
    bodyFont: "'Inter', sans-serif",
    monoFont: "'JetBrains Mono', monospace",
  },
  {
    presetId: 'playfair_inter',
    presetName: 'Editorial Elegance (Playfair Display + Inter)',
    displayFont: "'Playfair Display', Georgia, serif",
    bodyFont: "'Inter', sans-serif",
    monoFont: "'JetBrains Mono', monospace",
  },
  {
    presetId: 'dm_inter',
    presetName: 'Clean Publisher (DM Sans + Inter)',
    displayFont: "'DM Sans', sans-serif",
    bodyFont: "'Inter', sans-serif",
    monoFont: "'JetBrains Mono', monospace",
  },
];

interface SiteSettingsProps {
  settings: SiteSettings;
  currentUser: User;
  onSave: (newSettings: SiteSettings) => void;
}

export const SiteSettingsManager: React.FC<SiteSettingsProps> = ({
  settings,
  currentUser,
  onSave,
}) => {
  const [formData, setFormData] = useState<SiteSettings>(settings);
  const [saved, setSaved] = useState(false);

  const isSuperAdmin = currentUser.role === 'Super Admin';

  const activeTypography = formData.typography || FONT_PRESETS[0];

  const handleApplyTypography = (typo: SiteTypography) => {
    setFormData({ ...formData, typography: typo });
    // Apply live to DOM immediately
    document.documentElement.style.setProperty('--font-sans', typo.bodyFont);
    document.documentElement.style.setProperty('--font-display', typo.displayFont);
    document.documentElement.style.setProperty('--font-mono', typo.monoFont);
  };

  const handleUpdateAdSlot = (id: string, updates: Partial<AdSlot>) => {
    const updatedSlots = formData.adSlots.map((slot) =>
      slot.id === id ? { ...slot, ...updates } : slot
    );
    setFormData({ ...formData, adSlots: updatedSlots });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-4xl space-y-8 pb-16">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-display text-2xl font-bold text-white">Site-Wide Configuration</h2>
          <p className="text-xs text-slate-400">
            Control brand identity, SEO defaults, advertising slots, and Super Admin injection scripts.
          </p>
        </div>
        <button
          type="submit"
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-500 text-white text-xs font-semibold shadow-md shadow-orange-600/30 transition-all active:scale-95"
        >
          <Save className="w-4 h-4" />
          <span>{saved ? 'Settings Saved!' : 'Save Configuration'}</span>
        </button>
      </div>

      {/* 1. General Identity */}
      <div className="p-6 rounded-2xl border border-slate-800 bg-[#090d16] space-y-4">
        <h3 className="font-display text-base font-bold text-white pb-2 border-b border-slate-800">
          General Identity & Branding
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
              Publication Name
            </label>
            <input
              type="text"
              required
              value={formData.siteName}
              onChange={(e) => setFormData({ ...formData, siteName: e.target.value })}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-800 bg-slate-900 text-white"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
              Tagline
            </label>
            <input
              type="text"
              value={formData.tagline}
              onChange={(e) => setFormData({ ...formData, tagline: e.target.value })}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-800 bg-slate-900 text-white"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
            Site Description (Meta / Brand)
          </label>
          <textarea
            rows={2}
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="w-full px-3 py-2 text-xs rounded-xl border border-slate-800 bg-slate-900 text-white resize-none"
          />
        </div>
      </div>

      {/* 2. Site Typography & Global Fonts */}
      <div className="p-6 rounded-2xl border border-slate-800 bg-[#090d16] space-y-5">
        <div className="flex items-center justify-between pb-2 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <Type className="w-4 h-4 text-orange-400" />
              <h3 className="font-display text-base font-bold text-white">
                Site Typography & Global Font Studio
              </h3>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Switch typography pairs across all headings, body text, and code blocks with immediate live application.
            </p>
          </div>
          <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/40 border border-emerald-500/30 px-2 py-0.5 rounded">
            Live Preview Active
          </span>
        </div>

        {/* Preset Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {FONT_PRESETS.map((preset) => {
            const isSelected = activeTypography.presetId === preset.presetId;
            return (
              <div
                key={preset.presetId}
                onClick={() => handleApplyTypography(preset)}
                className={`p-4 rounded-xl border cursor-pointer transition-all duration-200 text-left relative group ${
                  isSelected
                    ? 'border-orange-500 bg-orange-500/10 shadow-lg shadow-orange-500/10 scale-[1.01]'
                    : 'border-slate-800 bg-slate-900/50 hover:border-slate-700 hover:bg-slate-900'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold text-slate-300 group-hover:text-white">
                    {preset.presetName.split(' (')[0]}
                  </span>
                  {isSelected ? (
                    <span className="flex items-center gap-1 text-[10px] font-bold text-orange-400 bg-orange-500/20 px-2 py-0.5 rounded-full">
                      <Check className="w-3 h-3" />
                      Active
                    </span>
                  ) : (
                    <span className="text-[10px] text-slate-500 group-hover:text-slate-400">
                      Click to apply
                    </span>
                  )}
                </div>

                {/* Live Sample Preview using the actual fonts */}
                <div className="p-3 rounded-lg bg-[#060910] border border-slate-800/80 space-y-1.5 my-2">
                  <div
                    className="text-base font-bold text-white tracking-tight"
                    style={{ fontFamily: preset.displayFont }}
                  >
                    Headline Sample
                  </div>
                  <div
                    className="text-xs text-slate-400 leading-relaxed"
                    style={{ fontFamily: preset.bodyFont }}
                  >
                    Crisp editorial reading experience with balanced optical hierarchy.
                  </div>
                </div>

                <div className="text-[10px] text-slate-500 flex items-center justify-between pt-1">
                  <span>Display: {preset.displayFont.split(',')[0].replace(/['"]/g, '')}</span>
                  <span>Body: {preset.bodyFont.split(',')[0].replace(/['"]/g, '')}</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Custom Fine-Tuning */}
        <div className="p-4 rounded-xl border border-slate-800 bg-[#060910] space-y-3">
          <div className="text-xs font-semibold text-slate-300">
            Advanced Typography Customization
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-[11px] font-medium text-slate-400 mb-1">
                Headings / Display Font
              </label>
              <input
                type="text"
                value={activeTypography.displayFont}
                onChange={(e) => {
                  const updated: SiteTypography = {
                    ...activeTypography,
                    presetId: 'custom',
                    displayFont: e.target.value,
                  };
                  handleApplyTypography(updated);
                }}
                className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-800 bg-slate-900 text-white font-mono"
              />
            </div>
            <div>
              <label className="block text-[11px] font-medium text-slate-400 mb-1">
                Body / Paragraphs Font
              </label>
              <input
                type="text"
                value={activeTypography.bodyFont}
                onChange={(e) => {
                  const updated: SiteTypography = {
                    ...activeTypography,
                    presetId: 'custom',
                    bodyFont: e.target.value,
                  };
                  handleApplyTypography(updated);
                }}
                className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-800 bg-slate-900 text-white font-mono"
              />
            </div>
            <div>
              <label className="block text-[11px] font-medium text-slate-400 mb-1">
                Code / Monospace Font
              </label>
              <input
                type="text"
                value={activeTypography.monoFont}
                onChange={(e) => {
                  const updated: SiteTypography = {
                    ...activeTypography,
                    presetId: 'custom',
                    monoFont: e.target.value,
                  };
                  handleApplyTypography(updated);
                }}
                className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-800 bg-slate-900 text-white font-mono"
              />
            </div>
          </div>
        </div>
      </div>

      {/* 2. Ad Placement Slots (Section 14) */}
      <div className="p-6 rounded-2xl border border-slate-800 bg-[#090d16] space-y-5">
        <div className="flex items-center justify-between pb-2 border-b border-slate-800">
          <div>
            <h3 className="font-display text-base font-bold text-white">
              Ad Placement Slots Management
            </h3>
            <p className="text-xs text-slate-400">
              Manage non-intrusive sponsor units across header, in-article, sidebar, and footer.
            </p>
          </div>
          <span className="text-[10px] font-mono text-orange-400 bg-orange-950/40 border border-orange-500/30 px-2 py-0.5 rounded">
            Section 14 Spec
          </span>
        </div>

        <div className="space-y-4">
          {formData.adSlots.map((slot) => (
            <div
              key={slot.id}
              className="p-4 rounded-xl border border-slate-800 bg-[#060910] space-y-3"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-xs text-white">{slot.name}</span>
                  <span className="text-[10px] font-mono text-slate-500 uppercase">
                    ({slot.location})
                  </span>
                </div>
                <label className="flex items-center gap-2 cursor-pointer text-xs">
                  <input
                    type="checkbox"
                    checked={slot.isEnabled}
                    onChange={(e) => handleUpdateAdSlot(slot.id, { isEnabled: e.target.checked })}
                    className="w-4 h-4 rounded text-orange-600 bg-slate-900 border-slate-800"
                  />
                  <span className={slot.isEnabled ? 'text-emerald-400 font-semibold' : 'text-slate-500'}>
                    {slot.isEnabled ? 'Active / Visible' : 'Disabled'}
                  </span>
                </label>
              </div>

              {slot.isEnabled && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">
                      Banner Image URL
                    </label>
                    <input
                      type="url"
                      value={slot.bannerImageUrl || ''}
                      onChange={(e) =>
                        handleUpdateAdSlot(slot.id, { bannerImageUrl: e.target.value })
                      }
                      placeholder="https://images.unsplash.com/..."
                      className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-800 bg-slate-900 text-white font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">
                      Target Link URL
                    </label>
                    <input
                      type="url"
                      value={slot.bannerLinkUrl || ''}
                      onChange={(e) =>
                        handleUpdateAdSlot(slot.id, { bannerLinkUrl: e.target.value })
                      }
                      placeholder="https://sponsor.com"
                      className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-800 bg-slate-900 text-white font-mono"
                    />
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* 3. Comments Policy */}
      <div className="p-6 rounded-2xl border border-slate-800 bg-[#090d16] space-y-4">
        <h3 className="font-display text-base font-bold text-white pb-2 border-b border-slate-800">
          Reader Discussion & Comments
        </h3>
        <div className="space-y-3">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.commentsEnabled}
              onChange={(e) => setFormData({ ...formData, commentsEnabled: e.target.checked })}
              className="w-4 h-4 rounded text-orange-600 bg-slate-900 border-slate-800"
            />
            <span className="text-xs text-slate-200">
              Enable comments on published articles
            </span>
          </label>
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.commentsRequireApproval}
              onChange={(e) =>
                setFormData({ ...formData, commentsRequireApproval: e.target.checked })
              }
              className="w-4 h-4 rounded text-orange-600 bg-slate-900 border-slate-800"
            />
            <span className="text-xs text-slate-200">
              Require editorial review before reader comments are made public
            </span>
          </label>
        </div>
      </div>

      {/* 4. Super Admin Custom Header & Footer Code Snippets (Section 14) */}
      <div className="p-6 rounded-2xl border border-slate-800 bg-[#090d16] space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-slate-800">
          <div>
            <h3 className="font-display text-base font-bold text-white flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-amber-400" />
              <span>Custom Code Snippets (Super Admin Only)</span>
            </h3>
            <p className="text-xs text-slate-400">
              Per Section 14: Custom code snippets for header/footer only for Super Admin.
            </p>
          </div>
          {!isSuperAdmin && (
            <span className="px-2 py-0.5 rounded bg-rose-950/60 border border-rose-500/40 text-rose-400 text-xs font-mono">
              Locked: Super Admin Privilege Required
            </span>
          )}
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
              Header Code Snippet (&lt;head&gt;)
            </label>
            <textarea
              rows={3}
              disabled={!isSuperAdmin}
              value={formData.customCodeHeader || ''}
              onChange={(e) => setFormData({ ...formData, customCodeHeader: e.target.value })}
              className="w-full p-3 font-mono text-xs rounded-xl border border-slate-800 bg-[#060910] text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
              Footer Code Snippet (before &lt;/body&gt;)
            </label>
            <textarea
              rows={3}
              disabled={!isSuperAdmin}
              value={formData.customCodeFooter || ''}
              onChange={(e) => setFormData({ ...formData, customCodeFooter: e.target.value })}
              className="w-full p-3 font-mono text-xs rounded-xl border border-slate-800 bg-[#060910] text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed"
            />
          </div>
        </div>
      </div>
    </form>
  );
};
