import React, { useState } from 'react';
import { usePrompts } from '../context/PromptContext';
import { 
  Sparkles, 
  Bookmark, 
  Settings, 
  Cloud, 
  Menu, 
  X, 
  Wand2, 
  Compass,
  Layers,
  FileText,
  Code2,
  RefreshCw,
  CheckCircle2,
  Lock,
  ExternalLink
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const { 
    favorites, 
    activeTab, 
    setActiveTab, 
    currentView,
    setCurrentView,
    setAdminSection,
    isDeployModalOpen, 
    setIsDeployModalOpen,
    isGeneratorOpen,
    setIsGeneratorOpen,
    isBuilding,
    customizerSettings,
    posts
  } = usePrompts();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleNavClick = (url: string) => {
    setMobileMenuOpen(false);
    if (url === '#explore') {
      setCurrentView('frontend');
      setActiveTab('all');
    } else if (url === '#articles') {
      setCurrentView('frontend');
      setActiveTab('articles');
    } else if (url === '#generator') {
      setIsGeneratorOpen(true);
    } else if (url === '#favorites') {
      setCurrentView('frontend');
      setActiveTab('favorites');
    } else if (url === '#deploy') {
      setIsDeployModalOpen(true);
    } else if (url.startsWith('http')) {
      window.open(url, '_blank');
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-[#0c0d12]/95 backdrop-blur-md border-b border-[#1f222e]">
      
      {/* Top Notice Bar from Customizer */}
      {customizerSettings.headerNoticeEnabled && customizerSettings.headerNotice && (
        <div className="bg-gradient-to-r from-violet-950/90 via-indigo-950/90 to-violet-950/90 text-violet-200 text-[11px] py-1 text-center font-medium border-b border-violet-900/40 px-4 flex items-center justify-center gap-2">
          <span>{customizerSettings.headerNotice}</span>
          {customizerSettings.headerNoticeLink && (
            <button
              onClick={() => {
                if (customizerSettings.headerNoticeLink === '#deploy') {
                  setIsDeployModalOpen(true);
                } else {
                  setCurrentView('admin');
                  setAdminSection('deployments');
                }
              }}
              className="underline text-violet-300 hover:text-white cursor-pointer ml-1 font-semibold"
            >
              Configure Webhook &rarr;
            </button>
          )}
        </div>
      )}

      <div className={`${customizerSettings.containerMaxWidth || 'max-w-7xl'} mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between`}>
        
        {/* Zone 1: Wordmark */}
        <div className="flex items-center gap-3">
          <button 
            onClick={() => {
              setCurrentView('frontend');
              setActiveTab('all');
            }} 
            className="flex items-center gap-2.5 group text-left cursor-pointer"
          >
            {customizerSettings.logoUrl ? (
              <img src={customizerSettings.logoUrl} alt={customizerSettings.siteTitle} className="w-8 h-8 rounded-lg object-cover" />
            ) : (
              <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-violet-600 to-indigo-500 flex items-center justify-center text-white shadow-md shadow-violet-900/30">
                <Sparkles className="w-4 h-4 transition-transform group-hover:scale-110" />
              </div>
            )}
            <div className="flex flex-col">
              <span className="font-display font-bold text-xl tracking-tight text-white group-hover:text-violet-300 transition-colors">
                {customizerSettings.siteTitle}
              </span>
            </div>
          </button>
        </div>

        {/* Zone 2: Navigation Links (Customizer Header Menu Items) */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-300">
          {(customizerSettings.headerMenuItems && customizerSettings.headerMenuItems.length > 0) ? (
            customizerSettings.headerMenuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.url)}
                className="hover:text-white transition-colors cursor-pointer text-xs lg:text-sm"
              >
                {item.label}
              </button>
            ))
          ) : (
            <>
              <button
                onClick={() => {
                  setCurrentView('frontend');
                  setActiveTab('all');
                }}
                className={`transition-colors flex items-center gap-1.5 cursor-pointer ${
                  currentView === 'frontend' && activeTab === 'all' ? 'text-violet-400 font-semibold' : 'text-slate-300 hover:text-white'
                }`}
              >
                <Compass className="w-4 h-4" />
                <span>Explore All</span>
              </button>

              <button
                onClick={() => {
                  setCurrentView('frontend');
                  setActiveTab('articles');
                }}
                className={`transition-colors flex items-center gap-1.5 cursor-pointer ${
                  currentView === 'frontend' && activeTab === 'articles' ? 'text-violet-400 font-semibold' : 'text-slate-300 hover:text-white'
                }`}
              >
                <FileText className="w-4 h-4 text-blue-400" />
                <span>Articles</span>
              </button>

              <button
                onClick={() => setIsGeneratorOpen(true)}
                className="text-slate-300 hover:text-white transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <Wand2 className="w-4 h-4 text-violet-400" />
                <span>Prompt Studio</span>
              </button>
            </>
          )}

          <button
            onClick={() => {
              setCurrentView('frontend');
              setActiveTab('favorites');
            }}
            className={`transition-colors flex items-center gap-1.5 cursor-pointer ${
              currentView === 'frontend' && activeTab === 'favorites' ? 'text-violet-400 font-semibold' : 'text-slate-300 hover:text-white'
            }`}
          >
            <Bookmark className="w-4 h-4" />
            <span>Saved</span>
            {favorites.length > 0 && (
              <span className="ml-0.5 px-1.5 py-0.2 text-[10px] font-mono rounded bg-violet-950 text-violet-300 border border-violet-800/60">
                {favorites.length}
              </span>
            )}
          </button>
        </nav>

        {/* Zone 3: Primary Actions (WordPress Admin + Auto-Deploy Status) */}
        <div className="flex items-center gap-2 sm:gap-3">
          
          {/* Cloudflare Auto-Deploy status badge */}
          <button
            onClick={() => {
              setCurrentView('admin');
              setAdminSection('deployments');
            }}
            className={`hidden lg:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg border transition-colors cursor-pointer ${
              isBuilding
                ? 'bg-amber-950/80 text-amber-300 border-amber-800/60'
                : 'bg-[#141622] text-emerald-400 border-[#232738] hover:bg-[#1c1f2e]'
            }`}
            title="Cloudflare Pages Deploy Status"
          >
            {isBuilding ? (
              <RefreshCw className="w-3.5 h-3.5 animate-spin text-amber-400" />
            ) : (
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            )}
            <span className="font-mono">{isBuilding ? 'Building SSG...' : 'Cloudflare: Live'}</span>
          </button>

          {/* WordPress Admin Button */}
          <button
            onClick={() => {
              setCurrentView('admin');
              setAdminSection('dashboard');
            }}
            className="inline-flex items-center gap-1.5 px-3.5 sm:px-4 py-2 text-xs font-semibold rounded-lg bg-violet-600 hover:bg-violet-500 text-white shadow-md shadow-violet-900/30 transition-all cursor-pointer"
          >
            <Lock className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">WP Admin Panel</span>
            <span className="sm:hidden">Admin</span>
          </button>

          {/* Mobile hamburger */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
            aria-label="Toggle Menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-[#1f222e] bg-[#0f1017] px-4 pt-3 pb-5 space-y-2">
          {(customizerSettings.headerMenuItems && customizerSettings.headerMenuItems.length > 0) ? (
            customizerSettings.headerMenuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.url)}
                className="w-full text-left px-3 py-2 rounded-md text-sm font-medium text-slate-200 hover:bg-slate-800 flex items-center justify-between"
              >
                <span>{item.label}</span>
              </button>
            ))
          ) : (
            <>
              <button
                onClick={() => {
                  setCurrentView('frontend');
                  setActiveTab('all');
                  setMobileMenuOpen(false);
                }}
                className="w-full text-left px-3 py-2 rounded-md text-sm font-medium text-slate-200 hover:bg-slate-800 flex items-center justify-between"
              >
                <span className="flex items-center gap-2">
                  <Compass className="w-4 h-4 text-violet-400" /> Explore All Prompts
                </span>
                <span className="text-xs text-slate-500 font-mono">{posts.length}</span>
              </button>

              <button
                onClick={() => {
                  setCurrentView('frontend');
                  setActiveTab('articles');
                  setMobileMenuOpen(false);
                }}
                className="w-full text-left px-3 py-2 rounded-md text-sm font-medium text-slate-200 hover:bg-slate-800 flex items-center gap-2"
              >
                <FileText className="w-4 h-4 text-blue-400" />
                <span>Articles & Masterclasses</span>
              </button>

              <button
                onClick={() => {
                  setIsGeneratorOpen(true);
                  setMobileMenuOpen(false);
                }}
                className="w-full text-left px-3 py-2 rounded-md text-sm font-medium text-slate-200 hover:bg-slate-800 flex items-center gap-2"
              >
                <Wand2 className="w-4 h-4 text-violet-400" />
                <span>Prompt Studio</span>
              </button>
            </>
          )}

          <button
            onClick={() => {
              setCurrentView('admin');
              setAdminSection('dashboard');
              setMobileMenuOpen(false);
            }}
            className="w-full text-left px-3 py-2 rounded-md text-sm font-semibold text-violet-300 bg-violet-950/40 hover:bg-violet-900/50 flex items-center gap-2"
          >
            <Lock className="w-4 h-4" />
            <span>Open WordPress Admin Panel</span>
          </button>
        </div>
      )}
    </header>
  );
};
