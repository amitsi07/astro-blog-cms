import React, { useState } from 'react';
import { usePrompts } from '../../context/PromptContext';
import { PostEditor } from './PostEditor';
import { DeploymentsManager } from './DeploymentsManager';
import { AstroProjectExporter } from './AstroProjectExporter';
import { MediaLibrary } from './MediaLibrary';
import { Customizer } from './Customizer';
import { 
  LayoutDashboard, 
  FileText, 
  PlusCircle, 
  Image as ImageIcon, 
  Tags, 
  Cloud, 
  Palette, 
  Code2, 
  ExternalLink, 
  Sparkles, 
  Globe, 
  RefreshCw, 
  Trash2, 
  Edit, 
  Eye, 
  Clock, 
  CheckCircle2, 
  AlertCircle,
  Search,
  Filter,
  ArrowUpRight,
  Shield,
  Layers,
  ChevronRight,
  Compass,
  Menu,
  X,
  Copy,
  MessageSquare,
  FileCode,
  BookmarkCheck,
  Github,
  LogOut,
  KeyRound,
  UserCheck,
  Settings
} from 'lucide-react';
import { PostStatus, PostType, PageItem } from '../../types/prompt';
import { INITIAL_PAGES } from '../../data/initialPrompts';

export const WordPressAdmin: React.FC = () => {
  const {
    posts,
    categories,
    mediaList,
    adminSection,
    setAdminSection,
    editingPostId,
    setEditingPostId,
    setCurrentView,
    deletePost,
    isBuilding,
    triggerDeployment,
    saveDraft,
    publishPost,
    showToast,
    customizerSettings,
    currentUser,
    logout,
    updateAdminCredentials
  } = usePrompts();

  // Mobile sidebar drawer state
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Change Password / Account Modal
  const [isSecurityModalOpen, setIsSecurityModalOpen] = useState(false);
  const [newUsername, setNewUsername] = useState(currentUser?.username || 'admin');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Quick Draft State for Dashboard Widget
  const [quickTitle, setQuickTitle] = useState('');
  const [quickContent, setQuickContent] = useState('');
  const [quickType, setQuickType] = useState<PostType>('prompt');

  // Filter in Posts List
  const [postTypeFilter, setPostTypeFilter] = useState<'all' | 'prompt' | 'article' | 'page'>('all');
  const [postStatusFilter, setPostStatusFilter] = useState<'all' | PostStatus>('all');
  const [postSearch, setPostSearch] = useState('');

  // Pages State
  const [pagesList, setPagesList] = useState<PageItem[]>(INITIAL_PAGES);
  const [editingPage, setEditingPage] = useState<PageItem | null>(null);

  const publishedCount = posts.filter((p) => p.status === 'published').length;
  const draftCount = posts.filter((p) => p.status === 'draft').length;
  const totalPrompts = posts.filter((p) => p.type === 'prompt').length;
  const totalArticles = posts.filter((p) => p.type === 'article').length;

  const handleQuickDraftSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickTitle.trim()) {
      showToast('Please enter a draft title');
      return;
    }
    saveDraft({
      title: quickTitle,
      type: quickType,
      prompt: quickType === 'prompt' ? quickContent : undefined,
      content: quickContent,
      excerpt: quickContent.slice(0, 120),
      category: 'Portraits'
    });
    setQuickTitle('');
    setQuickContent('');
  };

  const handleDuplicatePost = (p: typeof posts[0]) => {
    saveDraft({
      title: `${p.title} (Copy)`,
      type: p.type,
      prompt: p.prompt,
      content: p.content,
      excerpt: p.excerpt,
      category: p.category,
      model: p.model,
      image: p.image,
      aspectRatio: p.aspectRatio,
      tags: p.tags,
      settings: p.settings,
      variables: p.variables
    });
    showToast('Post duplicated into drafts');
  };

  const filteredPostsList = posts.filter((p) => {
    if (postTypeFilter !== 'all' && p.type !== postTypeFilter) return false;
    if (postStatusFilter !== 'all' && p.status !== postStatusFilter) return false;
    if (postSearch.trim()) {
      const q = postSearch.toLowerCase();
      return p.title.toLowerCase().includes(q) || p.category.toLowerCase().includes(q) || p.tags.some(t => t.toLowerCase().includes(q));
    }
    return true;
  });

  return (
    <div className="min-h-screen bg-[#10121a] text-slate-200 flex flex-col font-sans">
      
      {/* WordPress Admin Top Bar */}
      <header className="h-12 bg-[#1d2327] border-b border-[#2c3338] px-3 sm:px-4 flex items-center justify-between text-xs z-30 sticky top-0">
        <div className="flex items-center gap-2 sm:gap-4 min-w-0">
          
          {/* Mobile menu toggle */}
          <button
            onClick={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
            className="md:hidden p-1.5 text-slate-400 hover:text-white rounded hover:bg-slate-800 cursor-pointer"
            aria-label="Toggle Navigation Sidebar"
          >
            {isMobileSidebarOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>

          <div className="flex items-center gap-2 text-white font-semibold">
            <span className="w-6 h-6 rounded bg-violet-600 flex items-center justify-center font-bold text-white text-[11px] shrink-0">
              W
            </span>
            <span className="font-display tracking-tight text-slate-100 hidden sm:inline truncate">
              {customizerSettings.siteTitle} · WP Admin
            </span>
          </div>

          <div className="h-4 w-px bg-slate-700 hidden sm:block" />

          <button
            onClick={() => setCurrentView('frontend')}
            className="text-slate-300 hover:text-white flex items-center gap-1.5 transition-colors cursor-pointer py-1 px-2 rounded hover:bg-slate-800"
            title="Visit public Astro frontend"
          >
            <Globe className="w-3.5 h-3.5 text-violet-400 shrink-0" />
            <span className="hidden sm:inline">Visit Astro Site</span>
            <ArrowUpRight className="w-3 h-3 text-slate-500 hidden sm:inline" />
          </button>

          {/* Quick "+ New" Dropdown Button */}
          <button
            onClick={() => {
              setEditingPostId(null);
              setAdminSection('editor');
              setIsMobileSidebarOpen(false);
            }}
            className="text-slate-300 hover:text-white flex items-center gap-1 transition-colors cursor-pointer py-1 px-2 rounded hover:bg-slate-800 font-medium"
          >
            <PlusCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span>+ New</span>
          </button>

          {/* Quick Push to GitHub Button */}
          <button
            onClick={() => {
              setAdminSection('deployments');
              setIsMobileSidebarOpen(false);
            }}
            className="text-slate-300 hover:text-white hidden lg:flex items-center gap-1.5 transition-colors cursor-pointer py-1 px-2.5 rounded bg-[#24283b] hover:bg-violet-600 font-medium text-[11px]"
            title="Push complete Astro site to GitHub"
          >
            <Github className="w-3.5 h-3.5 text-violet-300" />
            <span>Push to GitHub</span>
          </button>
        </div>

        {/* Right side: Auto-Deploy Status & Cloudflare indicator */}
        <div className="flex items-center gap-2 sm:gap-3">
          <div 
            onClick={() => { setAdminSection('deployments'); setIsMobileSidebarOpen(false); }}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded cursor-pointer transition-colors ${
              isBuilding 
                ? 'bg-amber-950/80 text-amber-300 border border-amber-700/60' 
                : 'bg-emerald-950/60 text-emerald-300 border border-emerald-800/60 hover:bg-emerald-950'
            }`}
            title="Click to view Cloudflare Deploy Logs"
          >
            {isBuilding ? (
              <>
                <RefreshCw className="w-3 h-3 animate-spin text-amber-400" />
                <span className="font-mono text-[11px] hidden sm:inline">Building Astro SSG...</span>
              </>
            ) : (
              <>
                <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                <span className="font-mono text-[11px] hidden sm:inline">Cloudflare: Live</span>
              </>
            )}
          </div>

          <div className="flex items-center gap-2 pl-2 border-l border-slate-700">
            <button
              onClick={() => setIsSecurityModalOpen(true)}
              className="flex items-center gap-1.5 py-1 px-2 rounded hover:bg-slate-800 text-slate-300 hover:text-white transition-colors cursor-pointer"
              title="Manage Admin Account & Password"
            >
              <span className="w-6 h-6 rounded-full bg-violet-700 text-white flex items-center justify-center font-bold text-[10px]">
                {currentUser?.username ? currentUser.username.slice(0, 2).toUpperCase() : 'AD'}
              </span>
              <span className="text-slate-300 text-xs font-medium hidden md:inline">
                {currentUser?.username || 'admin'}
              </span>
            </button>

            <button
              onClick={() => {
                logout();
                showToast('Logged out of WP Admin');
              }}
              className="p-1.5 rounded hover:bg-rose-950/60 text-slate-400 hover:text-rose-300 border border-transparent hover:border-rose-800/40 transition-colors cursor-pointer"
              title="Log Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Admin Shell: Sidebar + Content */}
      <div className="flex-1 flex overflow-hidden relative">
        
        {/* WordPress Style Dark Sidebar (Desktop + Mobile Drawer) */}
        <aside className={`
          ${isMobileSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
          fixed md:relative z-40 inset-y-12 md:inset-y-0 left-0 w-60 bg-[#181a24] border-r border-[#242738] flex flex-col justify-between py-3 shrink-0 transition-transform duration-200 ease-in-out shadow-2xl md:shadow-none
        `}>
          <nav className="space-y-1 px-2 overflow-y-auto">
            
            <button
              onClick={() => {
                setAdminSection('dashboard');
                setEditingPostId(null);
                setIsMobileSidebarOpen(false);
              }}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded text-xs font-medium transition-colors cursor-pointer ${
                adminSection === 'dashboard'
                  ? 'bg-violet-600 text-white shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-[#202334]'
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>Dashboard</span>
            </button>

            <button
              onClick={() => {
                setAdminSection('posts');
                setEditingPostId(null);
                setIsMobileSidebarOpen(false);
              }}
              className={`w-full flex items-center justify-between px-3 py-2 rounded text-xs font-medium transition-colors cursor-pointer ${
                adminSection === 'posts' && !editingPostId
                  ? 'bg-violet-600 text-white shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-[#202334]'
              }`}
            >
              <span className="flex items-center gap-2.5">
                <FileText className="w-4 h-4" />
                <span>All Posts & Prompts</span>
              </span>
              <span className="font-mono text-[11px] bg-black/30 px-1.5 py-0.5 rounded text-slate-400">
                {posts.length}
              </span>
            </button>

            <button
              onClick={() => {
                setEditingPostId(null);
                setAdminSection('editor');
                setIsMobileSidebarOpen(false);
              }}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded text-xs font-medium transition-colors cursor-pointer ${
                adminSection === 'editor'
                  ? 'bg-violet-600 text-white shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-[#202334]'
              }`}
            >
              <PlusCircle className="w-4 h-4 text-emerald-400" />
              <span>Add New (Gutenberg)</span>
            </button>

            <button
              onClick={() => {
                setAdminSection('media');
                setEditingPostId(null);
                setIsMobileSidebarOpen(false);
              }}
              className={`w-full flex items-center justify-between px-3 py-2 rounded text-xs font-medium transition-colors cursor-pointer ${
                adminSection === 'media'
                  ? 'bg-violet-600 text-white shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-[#202334]'
              }`}
            >
              <span className="flex items-center gap-2.5">
                <ImageIcon className="w-4 h-4" />
                <span>Media Library</span>
              </span>
              <span className="font-mono text-[11px] bg-black/30 px-1.5 py-0.5 rounded text-slate-400">
                {mediaList.length}
              </span>
            </button>

            <button
              onClick={() => {
                setAdminSection('categories');
                setEditingPostId(null);
                setIsMobileSidebarOpen(false);
              }}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded text-xs font-medium transition-colors cursor-pointer ${
                adminSection === 'categories'
                  ? 'bg-violet-600 text-white shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-[#202334]'
              }`}
            >
              <Tags className="w-4 h-4" />
              <span>Categories & Tags</span>
            </button>

            <div className="pt-2 pb-1 border-t border-[#232738] my-2">
              <span className="px-3 text-[10px] font-mono uppercase tracking-wider text-slate-500">
                Astro & Auto-Deploy
              </span>
            </div>

            <button
              onClick={() => {
                setAdminSection('deployments');
                setEditingPostId(null);
                setIsMobileSidebarOpen(false);
              }}
              className={`w-full flex items-center justify-between px-3 py-2 rounded text-xs font-medium transition-colors cursor-pointer ${
                adminSection === 'deployments'
                  ? 'bg-violet-600 text-white shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-[#202334]'
              }`}
            >
              <span className="flex items-center gap-2.5">
                <Github className="w-4 h-4 text-violet-400" />
                <span>GitHub Push & Deploy</span>
              </span>
            </button>

            <button
              onClick={() => {
                setAdminSection('astro_export');
                setEditingPostId(null);
                setIsMobileSidebarOpen(false);
              }}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded text-xs font-medium transition-colors cursor-pointer ${
                adminSection === 'astro_export'
                  ? 'bg-violet-600 text-white shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-[#202334]'
              }`}
            >
              <Code2 className="w-4 h-4 text-amber-400" />
              <span>Astro 5.x Code & Sync</span>
            </button>

            <button
              onClick={() => {
                setAdminSection('customizer');
                setEditingPostId(null);
                setIsMobileSidebarOpen(false);
              }}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded text-xs font-medium transition-colors cursor-pointer ${
                adminSection === 'customizer'
                  ? 'bg-violet-600 text-white shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-[#202334]'
              }`}
            >
              <Palette className="w-4 h-4 text-pink-400" />
              <span>Site Customizer (All Sections)</span>
            </button>
          </nav>

          {/* Bottom Sidebar Info */}
          <div className="px-3 pt-3 border-t border-[#232738] text-[11px] text-slate-400 space-y-1 font-mono">
            <div className="flex items-center justify-between">
              <span>Astro Engine:</span>
              <span className="text-emerald-400">v5.0 SSG</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Publish Hook:</span>
              <span className="text-violet-400">Active</span>
            </div>
          </div>
        </aside>

        {/* Mobile sidebar backdrop */}
        {isMobileSidebarOpen && (
          <div 
            onClick={() => setIsMobileSidebarOpen(false)} 
            className="md:hidden fixed inset-0 bg-black/60 z-30 backdrop-blur-xs" 
          />
        )}

        {/* Content Pane */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 bg-[#0f111a]">
          
          {/* Section 1: Dashboard Home */}
          {adminSection === 'dashboard' && (
            <div className="max-w-6xl mx-auto space-y-6">
              
              {/* Dashboard Welcome Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#212435]">
                <div>
                  <h1 className="text-2xl font-bold text-white tracking-tight">
                    WordPress Admin Dashboard
                  </h1>
                  <p className="text-xs text-slate-400 mt-1">
                    Manage prompt collections, publish articles, and control Cloudflare Pages auto-deploy hooks.
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <button
                    onClick={() => {
                      setAdminSection('deployments');
                    }}
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-medium bg-[#222638] hover:bg-[#2c324a] text-slate-200 border border-[#2e334d] transition-colors cursor-pointer"
                  >
                    <Github className="w-3.5 h-3.5 text-violet-400" />
                    <span>Push to GitHub</span>
                  </button>

                  <button
                    onClick={() => triggerDeployment('Manual Admin Dashboard Rebuild')}
                    disabled={isBuilding}
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-medium bg-emerald-600 hover:bg-emerald-500 text-white shadow transition-colors cursor-pointer disabled:opacity-50"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isBuilding ? 'animate-spin' : ''}`} />
                    <span>{isBuilding ? 'Building...' : 'Deploy to Cloudflare'}</span>
                  </button>

                  <button
                    onClick={() => {
                      setEditingPostId(null);
                      setAdminSection('editor');
                    }}
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-violet-600 hover:bg-violet-500 text-white shadow-md shadow-violet-900/30 transition-colors cursor-pointer"
                  >
                    <PlusCircle className="w-3.5 h-3.5" />
                    <span>Create Post</span>
                  </button>
                </div>
              </div>

              {/* At a Glance Stats Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                
                <div className="bg-[#151724] border border-[#23273a] rounded-xl p-4 space-y-2">
                  <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
                    <span>Published Posts</span>
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  </div>
                  <div className="text-2xl font-bold text-white font-mono">{publishedCount}</div>
                  <span className="text-[11px] text-slate-500">Live on Cloudflare Edge</span>
                </div>

                <div className="bg-[#151724] border border-[#23273a] rounded-xl p-4 space-y-2">
                  <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
                    <span>Local Drafts</span>
                    <Clock className="w-4 h-4 text-amber-400" />
                  </div>
                  <div className="text-2xl font-bold text-amber-300 font-mono">{draftCount}</div>
                  <span className="text-[11px] text-slate-500">Saved without build trigger</span>
                </div>

                <div className="bg-[#151724] border border-[#23273a] rounded-xl p-4 space-y-2">
                  <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
                    <span>AI Prompts</span>
                    <Sparkles className="w-4 h-4 text-violet-400" />
                  </div>
                  <div className="text-2xl font-bold text-violet-300 font-mono">{totalPrompts}</div>
                  <span className="text-[11px] text-slate-500">With variable replacer</span>
                </div>

                <div className="bg-[#151724] border border-[#23273a] rounded-xl p-4 space-y-2">
                  <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
                    <span>Media Assets</span>
                    <ImageIcon className="w-4 h-4 text-blue-400" />
                  </div>
                  <div className="text-2xl font-bold text-white font-mono">{mediaList.length}</div>
                  <span className="text-[11px] text-slate-500">Images in WordPress Library</span>
                </div>

              </div>

              {/* Two Column Layout: Quick Draft & Recent Activity */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                
                {/* Left Col: WordPress Quick Draft Widget */}
                <div className="lg:col-span-6 bg-[#151724] border border-[#23273a] rounded-xl p-5 space-y-4">
                  <div className="flex items-center justify-between">
                    <h2 className="text-sm font-bold text-white flex items-center gap-2">
                      <Edit className="w-4 h-4 text-violet-400" />
                      <span>Quick Draft</span>
                    </h2>
                    <span className="text-[11px] font-mono text-slate-400">
                      Saves locally · No build triggered
                    </span>
                  </div>

                  <form onSubmit={handleQuickDraftSave} className="space-y-3">
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => setQuickType('prompt')}
                        className={`px-2.5 py-1 text-xs rounded font-medium transition-colors cursor-pointer ${
                          quickType === 'prompt' ? 'bg-violet-600 text-white' : 'bg-[#1b1e2d] text-slate-400'
                        }`}
                      >
                        AI Prompt
                      </button>
                      <button
                        type="button"
                        onClick={() => setQuickType('article')}
                        className={`px-2.5 py-1 text-xs rounded font-medium transition-colors cursor-pointer ${
                          quickType === 'article' ? 'bg-violet-600 text-white' : 'bg-[#1b1e2d] text-slate-400'
                        }`}
                      >
                        Article
                      </button>
                    </div>

                    <input
                      type="text"
                      placeholder="Title of your prompt or guide..."
                      value={quickTitle}
                      onChange={(e) => setQuickTitle(e.target.value)}
                      className="w-full bg-[#0d0e17] border border-[#282c3f] rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-violet-500"
                    />

                    <textarea
                      rows={3}
                      placeholder="What is your prompt formula or draft idea?..."
                      value={quickContent}
                      onChange={(e) => setQuickContent(e.target.value)}
                      className="w-full bg-[#0d0e17] border border-[#282c3f] rounded-lg p-3 text-xs text-white focus:outline-none focus:border-violet-500 font-mono"
                    />

                    <div className="flex items-center justify-between pt-1">
                      <button
                        type="submit"
                        className="px-4 py-1.5 bg-[#23273a] hover:bg-[#2c324a] text-slate-200 text-xs font-medium rounded-lg transition-colors cursor-pointer"
                      >
                        Save Draft
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setEditingPostId(null);
                          setAdminSection('editor');
                        }}
                        className="text-xs text-violet-400 hover:text-violet-300 transition-colors"
                      >
                        Open Full Gutenberg Editor &rarr;
                      </button>
                    </div>
                  </form>
                </div>

                {/* Right Col: Recent Posts & Status */}
                <div className="lg:col-span-6 bg-[#151724] border border-[#23273a] rounded-xl p-5 space-y-4">
                  <div className="flex items-center justify-between">
                    <h2 className="text-sm font-bold text-white flex items-center gap-2">
                      <Clock className="w-4 h-4 text-emerald-400" />
                      <span>Recent Activity & Publications</span>
                    </h2>
                    <button
                      onClick={() => setAdminSection('posts')}
                      className="text-xs text-slate-400 hover:text-white"
                    >
                      View All ({posts.length})
                    </button>
                  </div>

                  <div className="space-y-2.5">
                    {posts.slice(0, 5).map((post) => (
                      <div
                        key={post.id}
                        className="bg-[#0f111a] border border-[#222536] hover:border-violet-500/40 rounded-lg p-3 flex items-center justify-between gap-3 transition-colors"
                      >
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 text-[11px] mb-0.5">
                            <span
                              className={`px-1.5 py-0.2 rounded font-mono text-[10px] uppercase ${
                                post.status === 'published'
                                  ? 'bg-emerald-950 text-emerald-300 border border-emerald-800/60'
                                  : 'bg-amber-950 text-amber-300 border border-amber-800/60'
                              }`}
                            >
                              {post.status}
                            </span>
                            <span className="text-slate-400">{post.category}</span>
                            <span className="text-slate-600">·</span>
                            <span className="text-slate-500 font-mono">{post.type}</span>
                          </div>
                          <h3 className="text-xs font-semibold text-white truncate max-w-sm">
                            {post.title}
                          </h3>
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0">
                          <button
                            onClick={() => {
                              setEditingPostId(post.id);
                              setAdminSection('editor');
                            }}
                            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded transition-colors"
                            title="Edit in Gutenberg"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

              </div>

            </div>
          )}

          {/* Section 2: All Posts & Prompts List */}
          {adminSection === 'posts' && !editingPostId && (
            <div className="max-w-6xl mx-auto space-y-6">
              
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#212435]">
                <div>
                  <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
                    <span>Posts & Content Collections</span>
                    <span className="text-xs font-mono px-2 py-0.5 rounded bg-violet-950 text-violet-300 border border-violet-800/60">
                      {posts.length} Total
                    </span>
                  </h1>
                  <p className="text-xs text-slate-400 mt-1">
                    Manage Astro content collections with WordPress status filters (Draft vs Published).
                  </p>
                </div>

                <button
                  onClick={() => {
                    setEditingPostId(null);
                    setAdminSection('editor');
                  }}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold bg-violet-600 hover:bg-violet-500 text-white shadow-md shadow-violet-900/30 transition-colors cursor-pointer"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>Add New Post</span>
                </button>
              </div>

              {/* Filter controls bar */}
              <div className="bg-[#151724] border border-[#23273a] rounded-xl p-3 flex flex-wrap items-center justify-between gap-3 text-xs">
                <div className="flex flex-wrap items-center gap-2">
                  <div className="flex items-center gap-1 bg-[#0e1018] p-1 rounded-lg border border-[#25283c]">
                    <button
                      onClick={() => setPostStatusFilter('all')}
                      className={`px-2.5 py-1 rounded transition-colors ${
                        postStatusFilter === 'all' ? 'bg-violet-600 text-white' : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      All ({posts.length})
                    </button>
                    <button
                      onClick={() => setPostStatusFilter('published')}
                      className={`px-2.5 py-1 rounded transition-colors ${
                        postStatusFilter === 'published' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      Published ({publishedCount})
                    </button>
                    <button
                      onClick={() => setPostStatusFilter('draft')}
                      className={`px-2.5 py-1 rounded transition-colors ${
                        postStatusFilter === 'draft' ? 'bg-amber-600 text-white' : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      Drafts ({draftCount})
                    </button>
                  </div>

                  <select
                    value={postTypeFilter}
                    onChange={(e) => setPostTypeFilter(e.target.value as any)}
                    className="bg-[#0e1018] border border-[#25283c] rounded-lg px-2.5 py-1.5 text-slate-300 focus:outline-none"
                  >
                    <option value="all">All Content Types</option>
                    <option value="prompt">AI Prompts only</option>
                    <option value="article">Articles & Guides only</option>
                  </select>
                </div>

                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search posts..."
                    value={postSearch}
                    onChange={(e) => setPostSearch(e.target.value)}
                    className="bg-[#0e1018] border border-[#25283c] rounded-lg pl-8 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-violet-500 w-56"
                  />
                  <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-2.5 pointer-events-none" />
                </div>
              </div>

              {/* Posts Table */}
              <div className="bg-[#151724] border border-[#23273a] rounded-xl overflow-x-auto shadow-xl">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-[#23273a] bg-[#11131e] text-slate-400 font-mono text-[11px]">
                      <th className="py-3 px-4">Title & Slug</th>
                      <th className="py-3 px-3">Type</th>
                      <th className="py-3 px-3">Status</th>
                      <th className="py-3 px-3">Category</th>
                      <th className="py-3 px-3">AI Model</th>
                      <th className="py-3 px-3">Date</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#1e2233]">
                    {filteredPostsList.map((p) => (
                      <tr key={p.id} className="hover:bg-[#1a1d2c] transition-colors group">
                        
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3">
                            <img
                              src={p.image}
                              alt={p.title}
                              referrerPolicy="no-referrer"
                              className="w-10 h-10 rounded-md object-cover bg-black/40 border border-[#272a3e] shrink-0"
                            />
                            <div>
                              <button
                                onClick={() => {
                                 setEditingPostId(p.id);
                                  setAdminSection('editor');
                                }}
                                className="font-semibold text-white hover:text-violet-300 text-left line-clamp-1 cursor-pointer transition-colors"
                              >
                                {p.title}
                              </button>
                              <span className="font-mono text-[10px] text-slate-500 block truncate max-w-xs">
                                /posts/{p.slug}
                              </span>
                            </div>
                          </div>
                        </td>

                        <td className="py-3 px-3 font-mono text-[11px] text-slate-300">
                          {p.type === 'prompt' ? (
                            <span className="text-violet-300">Prompt</span>
                          ) : (
                            <span className="text-blue-300">Article</span>
                          )}
                        </td>

                        <td className="py-3 px-3">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-mono uppercase font-bold ${
                              p.status === 'published'
                                ? 'bg-emerald-950 text-emerald-300 border border-emerald-800/60'
                                : 'bg-amber-950 text-amber-300 border border-amber-800/60'
                            }`}
                          >
                            {p.status}
                          </span>
                        </td>

                        <td className="py-3 px-3 text-slate-300">
                          {p.category}
                        </td>

                        <td className="py-3 px-3 font-mono text-[11px] text-slate-400">
                          {p.model || '—'}
                        </td>

                        <td className="py-3 px-3 text-slate-400 font-mono text-[11px] whitespace-nowrap">
                          {p.publishedAt || p.createdAt}
                        </td>

                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => {
                                setEditingPostId(p.id);
                                setAdminSection('editor');
                              }}
                              className="px-2.5 py-1 text-[11px] font-medium bg-[#222638] hover:bg-[#2e334a] text-slate-200 rounded transition-colors cursor-pointer"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDuplicatePost(p)}
                              className="p-1 text-slate-400 hover:text-white transition-colors cursor-pointer"
                              title="Duplicate Post"
                            >
                              <Copy className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => {
                                if (confirm(`Delete post "${p.title}"?`)) {
                                  deletePost(p.id);
                                }
                              }}
                              className="p-1 text-slate-500 hover:text-rose-400 transition-colors cursor-pointer"
                              title="Delete"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>

                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

            </div>
          )}

          {/* Section 3: WordPress Gutenberg Post Editor */}
          {adminSection === 'editor' && (
            <PostEditor
              postId={editingPostId}
              onClose={() => {
                setEditingPostId(null);
                setAdminSection('posts');
              }}
            />
          )}

          {/* Section 4: Deployments & Webhooks */}
          {adminSection === 'deployments' && <DeploymentsManager />}

          {/* Section 5: Astro Project Exporter */}
          {adminSection === 'astro_export' && <AstroProjectExporter />}

          {/* Section 6: Media Library */}
          {adminSection === 'media' && <MediaLibrary />}

          {/* Section 7: Categories & Taxonomies */}
          {adminSection === 'categories' && (
            <div className="max-w-4xl mx-auto space-y-6">
              <div className="pb-4 border-b border-[#212435]">
                <h1 className="text-2xl font-bold text-white tracking-tight">Categories & Taxonomies</h1>
                <p className="text-xs text-slate-400 mt-1">Organize your AI prompt library & editorial guides.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {categories.map((c) => {
                  const count = posts.filter((p) => p.category.toLowerCase() === c.name.toLowerCase()).length;
                  return (
                    <div key={c.id} className="bg-[#151724] border border-[#23273a] p-4 rounded-xl flex items-center justify-between">
                      <div>
                        <h3 className="text-sm font-semibold text-white">{c.name}</h3>
                        <span className="text-[11px] font-mono text-slate-400">/{c.slug}</span>
                        <p className="text-xs text-slate-500 mt-1">{c.description}</p>
                      </div>
                      <span className="font-mono text-xs bg-[#222638] text-violet-300 px-2.5 py-1 rounded-lg">
                        {count} items
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Section 8: Customizer */}
          {adminSection === 'customizer' && <Customizer />}

        </main>
      </div>

      {/* Account & Password Settings Modal */}
      {isSecurityModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#151724] border border-[#2b2f44] rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-[#242738]">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-violet-600/20 text-violet-400 flex items-center justify-center">
                  <KeyRound className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Admin Account & Password</h3>
                  <p className="text-xs text-slate-400">Update your WordPress Admin credentials</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsSecurityModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-[#222538] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!newUsername.trim()) {
                  showToast('Please enter a username');
                  return;
                }
                if (newPassword && newPassword !== confirmPassword) {
                  showToast('Passwords do not match');
                  return;
                }
                updateAdminCredentials(newUsername.trim(), newPassword || 'admin123');
                showToast('Admin credentials updated successfully!');
                setIsSecurityModalOpen(false);
              }}
              className="space-y-4 text-xs"
            >
              <div className="space-y-1.5">
                <label className="block font-semibold text-slate-300">Admin Username</label>
                <input
                  type="text"
                  required
                  value={newUsername}
                  onChange={(e) => setNewUsername(e.target.value)}
                  className="w-full bg-[#0d0e17] border border-[#282c3f] rounded-lg px-3 py-2 text-white font-mono focus:outline-none focus:border-violet-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block font-semibold text-slate-300">New Password</label>
                <input
                  type="password"
                  placeholder="Leave blank to keep default 'admin123'"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full bg-[#0d0e17] border border-[#282c3f] rounded-lg px-3 py-2 text-white font-mono focus:outline-none focus:border-violet-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block font-semibold text-slate-300">Confirm New Password</label>
                <input
                  type="password"
                  placeholder="Repeat new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full bg-[#0d0e17] border border-[#282c3f] rounded-lg px-3 py-2 text-white font-mono focus:outline-none focus:border-violet-500"
                />
              </div>

              <div className="p-3 bg-[#0d0e17] rounded-lg border border-[#242838] text-[11px] text-slate-400">
                <span>🔐 Protected with browser-level session storage and encrypted local authentication.</span>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsSecurityModalOpen(false)}
                  className="px-4 py-2 rounded-lg bg-[#202334] hover:bg-[#2c3048] text-slate-300 text-xs font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-violet-600 hover:bg-violet-500 text-white text-xs font-semibold shadow transition-colors cursor-pointer"
                >
                  Save Credentials
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
