import React, { useState } from 'react';
import {
  CLOUDFLARE_D1_SCHEMA_SQL,
  WRANGLER_TOML,
  ASTRO_CONFIG_MJS,
  GITHUB_ACTIONS_YML,
} from '../../services/cloudflareExport';
import {
  X,
  Copy,
  Check,
  FileCode,
  Cloud,
  Github,
  Database,
  Sparkles,
  BookOpen,
} from 'lucide-react';

interface CloudflareSpecModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CloudflareSpecModal: React.FC<CloudflareSpecModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<'spec' | 'schema' | 'wrangler' | 'astro' | 'github'>('spec');
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const getActiveContent = () => {
    switch (activeTab) {
      case 'schema':
        return CLOUDFLARE_D1_SCHEMA_SQL;
      case 'wrangler':
        return WRANGLER_TOML;
      case 'astro':
        return ASTRO_CONFIG_MJS;
      case 'github':
        return GITHUB_ACTIONS_YML;
      default:
        return '';
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(getActiveContent());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-md">
      <div className="w-full max-w-5xl h-[88vh] rounded-3xl border border-slate-800 bg-[#0d131f] shadow-2xl flex flex-col overflow-hidden">
        {/* Top Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-[#080c14]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-500 to-orange-600 flex items-center justify-center text-white">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-display text-base sm:text-lg font-bold text-white">
                Astro Blog CMS Specification & ₹0 Cloudflare D1 Blueprint
              </h2>
              <p className="text-xs text-slate-400">
                Project Requirements & Development Specification v1.0 (September 2026)
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 px-6 py-3 border-b border-slate-800 bg-[#0a0f1b] overflow-x-auto">
          <button
            onClick={() => setActiveTab('spec')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
              activeTab === 'spec'
                ? 'bg-orange-600 text-white'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>17-Section Specification Summary</span>
          </button>
          <button
            onClick={() => setActiveTab('schema')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
              activeTab === 'schema'
                ? 'bg-orange-600 text-white'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            <Database className="w-3.5 h-3.5" />
            <span>Cloudflare D1 SQL Schema</span>
          </button>
          <button
            onClick={() => setActiveTab('wrangler')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
              activeTab === 'wrangler'
                ? 'bg-orange-600 text-white'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            <Cloud className="w-3.5 h-3.5" />
            <span>wrangler.toml</span>
          </button>
          <button
            onClick={() => setActiveTab('astro')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
              activeTab === 'astro'
                ? 'bg-orange-600 text-white'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            <FileCode className="w-3.5 h-3.5" />
            <span>astro.config.mjs</span>
          </button>
          <button
            onClick={() => setActiveTab('github')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
              activeTab === 'github'
                ? 'bg-orange-600 text-white'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            <Github className="w-3.5 h-3.5" />
            <span>GitHub Actions CI/CD</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {activeTab === 'spec' ? (
            <div className="space-y-6 text-xs sm:text-sm text-slate-300 leading-relaxed">
              <div className="p-4 rounded-2xl border border-amber-500/30 bg-amber-950/20 text-amber-200">
                <span className="font-semibold block mb-1">Architecture & Hosting Goal:</span>
                Astro Public Website + Custom CMS/Admin + Database + Cloudflare + GitHub. Domain cost excluded; designed for a <b>₹0 starting infrastructure</b> using appropriate free tiers (Cloudflare Pages, D1 SQL free tier 5M reads/day, and R2 zero-egress asset storage).
              </div>

              {/* 1. Project Objective */}
              <div className="space-y-2 border-b border-slate-800 pb-4">
                <h3 className="font-display font-bold text-white text-base">
                  1. Project Objective & Zero-Rebuild Principle
                </h3>
                <p>
                  Build a production-oriented blogging platform with a fast Astro-based public website and a secure CMS/Admin panel. Content must be managed from the admin panel without manually editing source code or redeploying individual articles.
                </p>
              </div>

              {/* 2. Public URLs */}
              <div className="space-y-2 border-b border-slate-800 pb-4">
                <h3 className="font-display font-bold text-white text-base">
                  2. Clean URL Routing Standard
                </h3>
                <p>
                  <b>Category URL:</b> <code className="text-orange-300 font-mono">/category/technology</code><br />
                  <b>Tag URL:</b> <code className="text-orange-300 font-mono">/tag/artificial-intelligence</code><br />
                  <b>Article URL:</b> <code className="text-orange-300 font-mono">/how-to-create-facebook-reels-with-ai</code> (Category is strictly NOT included in article URL).
                </p>
              </div>

              {/* 3. Special Editor Blocks */}
              <div className="space-y-2 border-b border-slate-800 pb-4">
                <h3 className="font-display font-bold text-white text-base">
                  3. All 12 Special Content Blocks (Section 5)
                </h3>
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-300">
                  <li>• 1. Prompt Box with copy button</li>
                  <li>• 2. Code block with copy button</li>
                  <li>• 3. Info/Note box</li>
                  <li>• 4. Warning box</li>
                  <li>• 5. Important/Alert box</li>
                  <li>• 6. Success/Tip box</li>
                  <li>• 7. CTA box/button</li>
                  <li>• 8. Pros & Cons comparison</li>
                  <li>• 9. Key Takeaways block</li>
                  <li>• 10. Table builder</li>
                  <li>• 11. FAQ accordion & schema</li>
                  <li>• 12. Dynamic TOC generation</li>
                </ul>
              </div>

              {/* 4. Definition of Done */}
              <div className="space-y-2">
                <h3 className="font-display font-bold text-white text-base">
                  4. Definition of Done (Section 15)
                </h3>
                <p>
                  Fully fulfilled: Public homepage works on mobile, tablet, and desktop; Admin login & RBAC works securely; Super Admin can create/edit/publish/delete articles; Rich editor supports all specified formatting blocks; Images and embeds render correctly; Prompt boxes have working copy buttons; TOC is generated from headings; Clean URLs without category; Database-backed changes appear immediately without source code edits.
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>Production configuration ready for deployment:</span>
                <button
                  onClick={handleCopy}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-orange-600 hover:bg-orange-500 text-white font-semibold transition-colors"
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy Code</span>
                    </>
                  )}
                </button>
              </div>
              <pre className="p-5 rounded-2xl bg-[#060910] border border-slate-800 text-xs font-mono text-slate-200 overflow-x-auto max-h-[55vh] leading-relaxed">
                <code>{getActiveContent()}</code>
              </pre>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-800 bg-[#080c14] flex items-center justify-between text-xs text-slate-400">
          <span>Target Architecture: Astro + Cloudflare D1 + R2 + Pages</span>
          <span className="font-mono text-emerald-400">₹0 / $0 Free Tier Compatible</span>
        </div>
      </div>
    </div>
  );
};
