import React, { useState } from 'react';
import {
  Search,
  Menu,
  X,
  ArrowUpRight,
  ShieldCheck,
  Flame,
  LayoutDashboard,
  Plus,
  Palette,
  ExternalLink,
} from 'lucide-react';
import { MenuItem, SiteSettings, User } from '../../types/cms';

interface PublicHeaderProps {
  settings: SiteSettings;
  menus: MenuItem[];
  currentUser: User;
  onNavigate: (path: string) => void;
  onOpenSearch: () => void;
  onEnterAdmin: () => void;
  onNewPost?: () => void;
  onEditHomepage?: () => void;
  currentPath: string;
}

export const PublicHeader: React.FC<PublicHeaderProps> = ({
  settings,
  menus,
  currentUser,
  onNavigate,
  onOpenSearch,
  onEnterAdmin,
  onNewPost,
  onEditHomepage,
  currentPath,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Header banner ad slot
  const headerAd = settings.adSlots?.find(
    (a) => a.location === 'header_banner' && a.isEnabled
  );

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800/80 bg-[#080c14]/95 backdrop-blur-md">
      {/* WordPress Style Top Admin Bar for Logged-In Admins/Writers */}
      <div className="w-full bg-[#101522] border-b border-slate-800 px-4 py-1 text-[11px] text-slate-300 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={onEnterAdmin}
            className="flex items-center gap-1.5 text-slate-300 hover:text-white font-medium"
          >
            <Flame className="w-3.5 h-3.5 text-orange-400 fill-orange-400" />
            <span className="font-semibold">{settings.siteName}</span>
            <span className="text-slate-500">›</span>
            <span>Dashboard</span>
          </button>

          <span className="text-slate-700 hidden sm:inline">|</span>

          {onNewPost && (
            <button
              onClick={onNewPost}
              className="hidden sm:flex items-center gap-1 text-slate-300 hover:text-white"
            >
              <Plus className="w-3 h-3 text-orange-400" />
              <span>New Post</span>
            </button>
          )}

          {onEditHomepage && (
            <button
              onClick={onEditHomepage}
              className="hidden md:flex items-center gap-1 text-slate-300 hover:text-white"
            >
              <Palette className="w-3 h-3 text-amber-400" />
              <span>Customize Homepage</span>
            </button>
          )}
        </div>

        <div className="flex items-center gap-2">
          <span className="hidden sm:inline text-slate-400">
            Howdy, <strong className="text-white">{currentUser.name}</strong>
          </span>
          <span className="px-1.5 py-0.2 rounded text-[10px] bg-orange-950/80 border border-orange-500/30 text-orange-300 font-mono">
            {currentUser.role}
          </span>
          <button
            onClick={onEnterAdmin}
            className="ml-1 px-2 py-0.5 rounded bg-orange-600 hover:bg-orange-500 text-white font-semibold transition-colors"
          >
            Open Admin
          </button>
        </div>
      </div>

      {/* Optional Header Ad Slot */}
      {headerAd && headerAd.bannerImageUrl && (
        <div className="w-full bg-[#05070c] border-b border-slate-900 py-1 px-4 text-center">
          <a
            href={headerAd.bannerLinkUrl || '#'}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-xs text-slate-400 hover:text-slate-200 transition-colors"
          >
            <span className="px-1.5 py-0.5 rounded text-[10px] uppercase font-semibold bg-slate-800 text-slate-400">
              Sponsor
            </span>
            <span>{headerAd.altText || 'Featured partner'}</span>
            <ArrowUpRight className="w-3 h-3 text-slate-500" />
          </a>
        </div>
      )}

      {/* Main Public Navigation Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => onNavigate('/')}
              className="flex items-center gap-2.5 text-left group focus:outline-none"
            >
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-orange-600 via-orange-500 to-amber-400 flex items-center justify-center text-white shadow-md shadow-orange-500/20 group-hover:scale-105 transition-transform">
                <Flame className="w-5 h-5 text-white fill-white" />
              </div>
              <div>
                <span className="font-display font-bold text-lg text-white tracking-tight group-hover:text-orange-400 transition-colors">
                  {settings.siteName || 'Astro Blog CMS'}
                </span>
                <span className="hidden sm:block text-[10px] text-slate-400 tracking-wider uppercase font-medium -mt-1">
                  Astro + Edge D1
                </span>
              </div>
            </button>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1 lg:gap-2">
            {menus
              .sort((a, b) => a.order - b.order)
              .map((item) => {
                const isActive = currentPath === item.url;
                return (
                  <button
                    key={item.id}
                    onClick={() => onNavigate(item.url)}
                    className={`px-3 py-1.5 text-xs lg:text-sm font-medium rounded-lg transition-colors ${
                      isActive
                        ? 'text-white bg-slate-800/80'
                        : 'text-slate-300 hover:text-white hover:bg-slate-800/40'
                    }`}
                  >
                    {item.label}
                  </button>
                );
              })}
          </nav>

          {/* Right Action Icons & Admin Switcher */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Search Trigger */}
            <button
              onClick={onOpenSearch}
              className="flex items-center gap-2 px-2.5 sm:px-3 py-1.5 rounded-lg border border-slate-800 bg-slate-900/60 hover:bg-slate-800/60 text-slate-400 hover:text-slate-200 transition-colors text-xs"
              title="Search articles (Cmd+K)"
            >
              <Search className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Search...</span>
              <kbd className="hidden lg:inline-block px-1.5 py-0.5 text-[10px] font-mono rounded bg-slate-800 text-slate-400 border border-slate-700">
                ⌘K
              </kbd>
            </button>

            {/* Mobile Hamburger Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/60"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Navigation */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-800 bg-[#080c14] px-4 pt-3 pb-6 space-y-2">
          {menus
            .sort((a, b) => a.order - b.order)
            .map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  onNavigate(item.url);
                  setMobileMenuOpen(false);
                }}
                className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium ${
                  currentPath === item.url
                    ? 'bg-slate-800 text-white'
                    : 'text-slate-300 hover:bg-slate-800/40 hover:text-white'
                }`}
              >
                {item.label}
              </button>
            ))}
          <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
            <span>Signed in as {currentUser.name}</span>
            <button
              onClick={onEnterAdmin}
              className="font-semibold text-orange-400 underline"
            >
              Open Admin Dashboard
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
