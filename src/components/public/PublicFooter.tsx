import React, { useState } from 'react';
import { Flame, ArrowRight, CheckCircle2, Github, Twitter, Youtube, Linkedin, Cloud, Sparkles } from 'lucide-react';
import { SiteSettings, Category, MenuItem } from '../../types/cms';

interface PublicFooterProps {
  settings: SiteSettings;
  categories: Category[];
  menus: MenuItem[];
  onNavigate: (path: string) => void;
  onOpenSpecModal: () => void;
}

export const PublicFooter: React.FC<PublicFooterProps> = ({
  settings,
  categories,
  onNavigate,
  onOpenSpecModal,
}) => {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      setSubscribed(true);
      setEmail('');
    }
  };

  const footerAd = settings.adSlots?.find(
    (a) => a.location === 'footer_banner' && a.isEnabled
  );

  return (
    <footer className="w-full border-t border-slate-800/80 bg-[#060910] text-slate-400 mt-20">
      {/* Optional Footer Ad Slot */}
      {footerAd && footerAd.bannerImageUrl && (
        <div className="max-w-7xl mx-auto px-4 pt-8 text-center">
          <a
            href={footerAd.bannerLinkUrl || '#'}
            target="_blank"
            rel="noopener noreferrer"
            className="block max-w-4xl mx-auto rounded-xl overflow-hidden border border-slate-800 hover:border-slate-700 transition-colors"
          >
            <img
              src={footerAd.bannerImageUrl}
              alt={footerAd.altText || 'Sponsor banner'}
              className="w-full h-auto max-h-28 object-cover"
            />
          </a>
        </div>
      )}

      {/* Main Footer Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
          {/* Brand Info & Mission */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-orange-600 flex items-center justify-center text-white">
                <Flame className="w-4 h-4 fill-white" />
              </div>
              <span className="font-display font-bold text-lg text-white">
                {settings.siteName}
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed max-w-sm">
              {settings.description ||
                'High-performance publishing platform powered by Astro and Cloudflare D1. Zero-JS baseline by default with sub-50ms global edge delivery.'}
            </p>

            {/* Architecture pill */}
            <button
              onClick={onOpenSpecModal}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border border-orange-500/30 bg-orange-950/20 hover:bg-orange-950/30 text-orange-300 text-xs font-medium transition-colors"
            >
              <Sparkles className="w-3.5 h-3.5 text-orange-400" />
              <span>Inspect ₹0 Architecture & Cloudflare D1 Spec</span>
            </button>

            {/* Social Icons */}
            <div className="flex items-center gap-3 pt-2">
              {settings.socialLinks?.twitter && (
                <a
                  href={settings.socialLinks.twitter}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
                  aria-label="Twitter"
                >
                  <Twitter className="w-4 h-4" />
                </a>
              )}
              {settings.socialLinks?.github && (
                <a
                  href={settings.socialLinks.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
                  aria-label="GitHub"
                >
                  <Github className="w-4 h-4" />
                </a>
              )}
              {settings.socialLinks?.youtube && (
                <a
                  href={settings.socialLinks.youtube}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
                  aria-label="YouTube"
                >
                  <Youtube className="w-4 h-4" />
                </a>
              )}
              {settings.socialLinks?.linkedin && (
                <a
                  href={settings.socialLinks.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
                  aria-label="LinkedIn"
                >
                  <Linkedin className="w-4 h-4" />
                </a>
              )}
            </div>
          </div>

          {/* Categories Column */}
          <div>
            <h4 className="text-xs font-semibold text-slate-200 uppercase tracking-wider mb-4">
              Categories
            </h4>
            <ul className="space-y-2.5 text-xs sm:text-sm">
              {categories.map((c) => (
                <li key={c.id}>
                  <button
                    onClick={() => onNavigate(`/category/${c.slug}`)}
                    className="hover:text-white transition-colors flex items-center gap-1.5"
                  >
                    <span
                      className="w-1.5 h-1.5 rounded-full"
                      style={{ backgroundColor: c.color }}
                    />
                    <span>{c.name}</span>
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal & Static Pages */}
          <div>
            <h4 className="text-xs font-semibold text-slate-200 uppercase tracking-wider mb-4">
              Information
            </h4>
            <ul className="space-y-2.5 text-xs sm:text-sm">
              <li>
                <button
                  onClick={() => onNavigate('/about')}
                  className="hover:text-white transition-colors"
                >
                  About the Platform
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('/contact')}
                  className="hover:text-white transition-colors"
                >
                  Contact & Submissions
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('/privacy-policy')}
                  className="hover:text-white transition-colors"
                >
                  Privacy Policy
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('/terms')}
                  className="hover:text-white transition-colors"
                >
                  Terms of Service
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('/disclaimer')}
                  className="hover:text-white transition-colors"
                >
                  Disclaimer
                </button>
              </li>
            </ul>
          </div>

          {/* Newsletter Box */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold text-slate-200 uppercase tracking-wider">
              Weekly Edge Digest
            </h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Curated prompt blueprints, Astro 5 patterns, and zero-cost cloud architecture recipes.
            </p>
            {subscribed ? (
              <div className="flex items-center gap-2 p-3 rounded-xl bg-emerald-950/30 border border-emerald-500/30 text-emerald-300 text-xs">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <span>You're on the list! Check your inbox for the prompt pack.</span>
              </div>
            ) : (
              <form onSubmit={handleSubscribe} className="space-y-2">
                <div className="relative">
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="architect@domain.com"
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-800 bg-slate-900 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-orange-500 transition-colors"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full py-2 px-3 text-xs font-semibold rounded-lg bg-orange-600 hover:bg-orange-500 text-white flex items-center justify-center gap-1.5 transition-colors"
                >
                  <span>Subscribe</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </form>
            )}
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-6 border-t border-slate-800/60 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-3">
          <div>
            © {new Date().getFullYear()} {settings.siteName}. Built strictly per specification v1.0.
          </div>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5 text-slate-400">
              <Cloud className="w-3.5 h-3.5 text-amber-400" />
              <span>Cloudflare D1 + R2 + Pages</span>
            </span>
            <span>·</span>
            <span>Target: ₹0 / $0 Hosting Baseline</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
