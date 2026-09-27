import React, { useState } from 'react';
import { User, UserRole, SiteSettings } from '../../types/cms';
import {
  LayoutDashboard,
  FileText,
  Plus,
  Image,
  FolderTree,
  Tag as TagIcon,
  FileCode,
  Palette,
  Menu,
  Settings,
  Users,
  History,
  Compass,
  Globe,
  Cloud,
  Database,
  ExternalLink,
  Shield,
  ChevronDown,
  X,
  Flame,
  Home,
  Sliders,
  Check,
  ChevronRight,
  UserCheck,
  Github,
} from 'lucide-react';

interface AdminLayoutProps {
  currentTab: string;
  onSelectTab: (tab: string) => void;
  currentUser: User;
  allUsers: User[];
  onSwitchUser: (userId: string) => void;
  onExitAdmin: () => void;
  onNewPost: () => void;
  onOpenSveltiaModal?: () => void;
  settings: SiteSettings;
  children: React.ReactNode;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({
  currentTab,
  onSelectTab,
  currentUser,
  allUsers,
  onSwitchUser,
  onExitAdmin,
  onNewPost,
  onOpenSveltiaModal,
  settings,
  children,
}) => {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [roleDropdownOpen, setRoleDropdownOpen] = useState(false);
  const [postsSubmenuOpen, setPostsSubmenuOpen] = useState(true);
  const [appearanceSubmenuOpen, setAppearanceSubmenuOpen] = useState(true);
  const [settingsSubmenuOpen, setSettingsSubmenuOpen] = useState(false);
  const [toolsSubmenuOpen, setToolsSubmenuOpen] = useState(false);

  // WordPress / Blogger Style Navigation Hierarchy
  const isPostsActive =
    currentTab === 'posts' || currentTab === 'categories' || currentTab === 'tags';
  const isAppearanceActive = currentTab === 'homepage' || currentTab === 'menus';
  const isSettingsActive = currentTab === 'settings' || currentTab === 'seo';
  const isToolsActive =
    currentTab === 'logs' ||
    currentTab === 'redirects' ||
    currentTab === 'spec' ||
    currentTab === 'export';

  return (
    <div className="min-h-screen bg-[#090d16] text-slate-200 flex flex-col font-sans">
      {/* 1. WordPress Style Top Admin Bar */}
      <header className="sticky top-0 z-40 h-12 bg-[#101522] border-b border-slate-800 text-xs px-3 sm:px-5 flex items-center justify-between shadow-sm">
        {/* Left Side: Brand, Visit Site, + New Post */}
        <div className="flex items-center gap-3 sm:gap-4">
          {/* Mobile hamburger */}
          <button
            onClick={() => setMobileSidebarOpen(true)}
            className="lg:hidden p-1.5 rounded text-slate-400 hover:text-white hover:bg-slate-800"
            aria-label="Open menu"
          >
            <Menu className="w-4 h-4" />
          </button>

          {/* WP Logo / Site name */}
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-gradient-to-tr from-orange-600 to-amber-500 flex items-center justify-center text-white shadow-sm">
              <Flame className="w-3.5 h-3.5 fill-white" />
            </div>
            <button
              onClick={() => onSelectTab('dashboard')}
              className="font-display font-bold text-white hover:text-orange-400 transition-colors hidden sm:inline"
            >
              {settings.siteName || 'Astro Blog'}
            </button>
          </div>

          <div className="h-4 w-px bg-slate-800 hidden sm:block" />

          {/* Visit Site Button (WordPress style) */}
          <button
            onClick={onExitAdmin}
            className="flex items-center gap-1.5 text-slate-300 hover:text-white px-2 py-1 rounded hover:bg-slate-800 transition-colors"
            title="Open public website"
          >
            <Home className="w-3.5 h-3.5 text-slate-400" />
            <span className="hidden md:inline">Visit Site</span>
            <ExternalLink className="w-3 h-3 text-slate-500" />
          </button>

          <div className="h-4 w-px bg-slate-800 hidden sm:block" />

          {/* Quick "+ New Post" Button (WordPress style) */}
          <button
            onClick={onNewPost}
            className="flex items-center gap-1 text-slate-200 hover:text-white px-2.5 py-1 rounded bg-slate-800 hover:bg-orange-600 transition-colors font-medium text-[11px]"
          >
            <Plus className="w-3.5 h-3.5 text-orange-400" />
            <span>New Post</span>
          </button>

          {onOpenSveltiaModal && (
            <button
              onClick={onOpenSveltiaModal}
              className="hidden lg:flex items-center gap-1.5 text-white hover:text-white px-2.5 py-1 rounded bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 transition-all font-bold text-[11px] shadow-sm shadow-orange-500/20"
              title="Publish site and Sveltia CMS to GitHub & Cloudflare"
            >
              <Github className="w-3.5 h-3.5" />
              <span>Publish to GitHub</span>
            </button>
          )}
        </div>

        {/* Right Side: Role Badge, User Switcher (WordPress "Howdy, User") */}
        <div className="flex items-center gap-3">
          <div className="relative">
            <button
              onClick={() => setRoleDropdownOpen(!roleDropdownOpen)}
              className="flex items-center gap-2 px-2.5 py-1 rounded hover:bg-slate-800 text-slate-300 hover:text-white transition-colors"
            >
              <img
                src={currentUser.avatar}
                alt={currentUser.name}
                className="w-5 h-5 rounded-full object-cover border border-slate-700"
              />
              <span className="hidden sm:inline">
                Howdy, <strong className="text-white">{currentUser.name}</strong>
              </span>
              <span className="px-1.5 py-0.5 rounded text-[10px] font-mono uppercase bg-orange-950/60 text-orange-300 border border-orange-500/30">
                {currentUser.role}
              </span>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </button>

            {roleDropdownOpen && (
              <div className="absolute right-0 mt-2 w-64 rounded-xl border border-slate-800 bg-[#0d131f] shadow-2xl p-2 z-50 space-y-1">
                <div className="px-2.5 py-1.5 text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                  Switch Active Role (RBAC)
                </div>
                {allUsers.map((u) => (
                  <button
                    key={u.id}
                    onClick={() => {
                      onSwitchUser(u.id);
                      setRoleDropdownOpen(false);
                    }}
                    className={`w-full flex items-center justify-between p-2 rounded-lg text-xs transition-colors ${
                      currentUser.id === u.id
                        ? 'bg-orange-600 text-white font-semibold'
                        : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <img
                        src={u.avatar}
                        alt={u.name}
                        className="w-5 h-5 rounded-full object-cover"
                      />
                      <span>{u.name}</span>
                    </div>
                    <span className="text-[10px] opacity-80 font-mono">
                      {u.role}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </header>

      {/* 2. Main Admin Container (Sidebar + Content) */}
      <div className="flex-1 flex min-h-0">
        {/* WordPress / Blogger Classic Left Sidebar */}
        <aside className="hidden lg:flex w-56 flex-col border-r border-slate-800 bg-[#0b101c] shrink-0">
          <nav className="p-2 space-y-0.5 text-xs">
            {/* 1. Dashboard */}
            <button
              onClick={() => onSelectTab('dashboard')}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg font-medium transition-colors ${
                currentTab === 'dashboard'
                  ? 'bg-orange-600 text-white font-semibold shadow-sm'
                  : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
              }`}
            >
              <LayoutDashboard className="w-4 h-4 text-slate-400" />
              <span>Dashboard</span>
            </button>

            {/* 2. Posts (WordPress / Blogger style) */}
            <div className="pt-1">
              <button
                onClick={() => {
                  onSelectTab('posts');
                  setPostsSubmenuOpen(!postsSubmenuOpen);
                }}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg font-medium transition-colors ${
                  isPostsActive && currentTab === 'posts'
                    ? 'bg-slate-800 text-white font-semibold'
                    : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <FileText className="w-4 h-4 text-orange-400" />
                  <span>Posts</span>
                </div>
                <ChevronDown
                  className={`w-3 h-3 text-slate-500 transition-transform ${
                    postsSubmenuOpen ? 'rotate-180' : ''
                  }`}
                />
              </button>

              {postsSubmenuOpen && (
                <div className="pl-7 pr-1 py-1 space-y-0.5 text-[11px]">
                  <button
                    onClick={() => onSelectTab('posts')}
                    className={`w-full text-left px-2 py-1.5 rounded transition-colors ${
                      currentTab === 'posts'
                        ? 'text-orange-400 font-semibold bg-slate-900/60'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    All Posts
                  </button>
                  <button
                    onClick={onNewPost}
                    className="w-full text-left px-2 py-1.5 rounded text-slate-400 hover:text-white"
                  >
                    + Add New Post
                  </button>
                  <button
                    onClick={() => onSelectTab('categories')}
                    className={`w-full text-left px-2 py-1.5 rounded transition-colors ${
                      currentTab === 'categories'
                        ? 'text-orange-400 font-semibold bg-slate-900/60'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Categories & Tags
                  </button>
                </div>
              )}
            </div>

            {/* 3. Homepage Builder (Edit Full Home Page) - Prominent First-Class Item */}
            <button
              onClick={() => onSelectTab('homepage')}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-lg font-medium transition-colors ${
                currentTab === 'homepage'
                  ? 'bg-orange-600 text-white font-semibold shadow-sm'
                  : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Home className="w-4 h-4 text-amber-400" />
                <span>Homepage Builder</span>
              </div>
              <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                Live Edit
              </span>
            </button>

            {/* 4. Media Library */}
            <button
              onClick={() => onSelectTab('media')}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg font-medium transition-colors ${
                currentTab === 'media'
                  ? 'bg-orange-600 text-white font-semibold shadow-sm'
                  : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
              }`}
            >
              <Image className="w-4 h-4 text-slate-400" />
              <span>Media Library</span>
            </button>

            {/* 5. Static Pages */}
            <button
              onClick={() => onSelectTab('pages')}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg font-medium transition-colors ${
                currentTab === 'pages'
                  ? 'bg-orange-600 text-white font-semibold shadow-sm'
                  : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
              }`}
            >
              <FileCode className="w-4 h-4 text-slate-400" />
              <span>Pages</span>
            </button>

            {/* 6. Navigation Menus */}
            <button
              onClick={() => onSelectTab('menus')}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg font-medium transition-colors ${
                currentTab === 'menus'
                  ? 'bg-orange-600 text-white font-semibold shadow-sm'
                  : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
              }`}
            >
              <Palette className="w-4 h-4 text-slate-400" />
              <span>Navigation Menus</span>
            </button>

            {/* Users */}
            <button
              onClick={() => onSelectTab('users')}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg font-medium transition-colors ${
                currentTab === 'users'
                  ? 'bg-orange-600 text-white font-semibold shadow-sm'
                  : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
              }`}
            >
              <Users className="w-4 h-4 text-slate-400" />
              <span>Users & Roles</span>
            </button>

            {/* Tools (Import/Export, Cloudflare D1 Blueprint, Redirects, Logs) */}
            <div>
              <button
                onClick={() => {
                  onSelectTab('spec');
                  setToolsSubmenuOpen(!toolsSubmenuOpen);
                }}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg font-medium transition-colors ${
                  isToolsActive
                    ? 'bg-slate-800 text-white font-semibold'
                    : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Database className="w-4 h-4 text-blue-400" />
                  <span>Tools & Edge</span>
                </div>
                <ChevronDown
                  className={`w-3 h-3 text-slate-500 transition-transform ${
                    toolsSubmenuOpen ? 'rotate-180' : ''
                  }`}
                />
              </button>

              {toolsSubmenuOpen && (
                <div className="pl-7 pr-1 py-1 space-y-0.5 text-[11px]">
                  <button
                    onClick={() => {
                      if (onOpenSveltiaModal) onOpenSveltiaModal();
                      else onSelectTab('sveltia');
                    }}
                    className={`w-full text-left px-2 py-1.5 rounded transition-colors flex items-center justify-between ${
                      currentTab === 'sveltia'
                        ? 'text-orange-400 font-semibold bg-slate-900/60'
                        : 'text-orange-300 hover:text-white font-medium'
                    }`}
                  >
                    <span>GitHub & Cloudflare (Sveltia)</span>
                    <span className="text-[9px] px-1.5 py-0.2 rounded bg-orange-500/20 text-orange-400 font-mono">DEPLOY</span>
                  </button>
                  <button
                    onClick={() => onSelectTab('spec')}
                    className={`w-full text-left px-2 py-1.5 rounded transition-colors ${
                      currentTab === 'spec'
                        ? 'text-orange-400 font-semibold bg-slate-900/60'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Cloudflare D1 Spec
                  </button>
                  <button
                    onClick={() => onSelectTab('export')}
                    className={`w-full text-left px-2 py-1.5 rounded transition-colors ${
                      currentTab === 'export'
                        ? 'text-orange-400 font-semibold bg-slate-900/60'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Import & Export (.mdx)
                  </button>
                  <button
                    onClick={() => onSelectTab('redirects')}
                    className={`w-full text-left px-2 py-1.5 rounded transition-colors ${
                      currentTab === 'redirects'
                        ? 'text-orange-400 font-semibold bg-slate-900/60'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    301 Redirects
                  </button>
                  <button
                    onClick={() => onSelectTab('logs')}
                    className={`w-full text-left px-2 py-1.5 rounded transition-colors ${
                      currentTab === 'logs'
                        ? 'text-orange-400 font-semibold bg-slate-900/60'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Audit Logs
                  </button>
                </div>
              )}
            </div>

            {/* Settings (General, SEO) */}
            <div>
              <button
                onClick={() => {
                  onSelectTab('settings');
                  setSettingsSubmenuOpen(!settingsSubmenuOpen);
                }}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg font-medium transition-colors ${
                  isSettingsActive
                    ? 'bg-slate-800 text-white font-semibold'
                    : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Settings className="w-4 h-4 text-emerald-400" />
                  <span>Settings</span>
                </div>
                <ChevronDown
                  className={`w-3 h-3 text-slate-500 transition-transform ${
                    settingsSubmenuOpen ? 'rotate-180' : ''
                  }`}
                />
              </button>

              {settingsSubmenuOpen && (
                <div className="pl-7 pr-1 py-1 space-y-0.5 text-[11px]">
                  <button
                    onClick={() => onSelectTab('settings')}
                    className={`w-full text-left px-2 py-1.5 rounded transition-colors ${
                      currentTab === 'settings'
                        ? 'text-orange-400 font-semibold bg-slate-900/60'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    General Settings & Ads
                  </button>
                  <button
                    onClick={() => onSelectTab('seo')}
                    className={`w-full text-left px-2 py-1.5 rounded transition-colors ${
                      currentTab === 'seo'
                        ? 'text-orange-400 font-semibold bg-slate-900/60'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    SEO & Sitemap (/sitemap.xml)
                  </button>
                </div>
              )}
            </div>
          </nav>
        </aside>

        {/* Content Container */}
        <main className="flex-1 p-4 sm:p-8 max-w-7xl w-full mx-auto overflow-y-auto">
          {children}
        </main>
      </div>

      {/* Mobile Sidebar Drawer */}
      {mobileSidebarOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden bg-black/80 backdrop-blur-sm">
          <div className="w-64 bg-[#0b101c] border-r border-slate-800 h-full p-4 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-3">
                <span className="font-display font-bold text-sm text-white">
                  Astro CMS
                </span>
                <button
                  onClick={() => setMobileSidebarOpen(false)}
                  className="p-1 text-slate-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-1 text-xs">
                <button
                  onClick={() => {
                    onSelectTab('dashboard');
                    setMobileSidebarOpen(false);
                  }}
                  className="w-full text-left px-3 py-2 rounded text-slate-300 hover:bg-slate-800"
                >
                  Dashboard
                </button>
                <button
                  onClick={() => {
                    onSelectTab('posts');
                    setMobileSidebarOpen(false);
                  }}
                  className="w-full text-left px-3 py-2 rounded text-slate-300 hover:bg-slate-800"
                >
                  All Posts
                </button>
                <button
                  onClick={() => {
                    onSelectTab('homepage');
                    setMobileSidebarOpen(false);
                  }}
                  className="w-full text-left px-3 py-2 rounded text-slate-300 hover:bg-slate-800"
                >
                  Customize Homepage
                </button>
                <button
                  onClick={() => {
                    onSelectTab('categories');
                    setMobileSidebarOpen(false);
                  }}
                  className="w-full text-left px-3 py-2 rounded text-slate-300 hover:bg-slate-800"
                >
                  Categories & Tags
                </button>
                <button
                  onClick={() => {
                    onSelectTab('media');
                    setMobileSidebarOpen(false);
                  }}
                  className="w-full text-left px-3 py-2 rounded text-slate-300 hover:bg-slate-800"
                >
                  Media Library
                </button>
                <button
                  onClick={() => {
                    onSelectTab('pages');
                    setMobileSidebarOpen(false);
                  }}
                  className="w-full text-left px-3 py-2 rounded text-slate-300 hover:bg-slate-800"
                >
                  Pages
                </button>
                <button
                  onClick={() => {
                    onSelectTab('settings');
                    setMobileSidebarOpen(false);
                  }}
                  className="w-full text-left px-3 py-2 rounded text-slate-300 hover:bg-slate-800"
                >
                  Settings
                </button>
              </div>
            </div>

            <button
              onClick={() => {
                setMobileSidebarOpen(false);
                onExitAdmin();
              }}
              className="w-full py-2.5 rounded-lg bg-slate-800 text-white text-xs font-semibold flex items-center justify-center gap-1.5"
            >
              <span>Visit Public Site</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
