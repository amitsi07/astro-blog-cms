import React, { useState } from 'react';
import {
  Post,
  Category,
  Tag,
  ActivityLog,
  User,
  SiteSettings,
} from '../../types/cms';
import {
  FileText,
  CheckCircle2,
  Calendar,
  Clock,
  Eye,
  TrendingUp,
  Folder,
  Tag as TagIcon,
  Plus,
  Send,
  Sparkles,
  ArrowRight,
  ShieldAlert,
  Github,
} from 'lucide-react';

interface AdminDashboardProps {
  posts: Post[];
  categories: Category[];
  tags: Tag[];
  activityLogs: ActivityLog[];
  currentUser: User;
  onNavigateTab: (tab: string) => void;
  onNewPost: () => void;
  onQuickDraft: (title: string, content: string) => void;
  onOpenSpecModal: () => void;
  onOpenSveltiaModal?: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  posts,
  categories,
  tags,
  activityLogs,
  currentUser,
  onNavigateTab,
  onNewPost,
  onQuickDraft,
  onOpenSpecModal,
  onOpenSveltiaModal,
}) => {
  const [quickTitle, setQuickTitle] = useState('');
  const [quickContent, setQuickContent] = useState('');
  const [draftSaved, setDraftSaved] = useState(false);

  // Metrics
  const totalPosts = posts.filter((p) => p.status !== 'trash').length;
  const publishedCount = posts.filter((p) => p.status === 'published').length;
  const draftCount = posts.filter((p) => p.status === 'draft').length;
  const scheduledCount = posts.filter((p) => p.status === 'scheduled').length;
  const totalViews = posts.reduce((acc, p) => acc + (p.views || 0), 0);

  // Top performing articles
  const topArticles = [...posts]
    .filter((p) => p.status === 'published')
    .sort((a, b) => (b.views || 0) - (a.views || 0))
    .slice(0, 4);

  const handleQuickDraftSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickTitle.trim()) return;
    onQuickDraft(quickTitle, quickContent);
    setQuickTitle('');
    setQuickContent('');
    setDraftSaved(true);
    setTimeout(() => setDraftSaved(false), 3000);
  };

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="rounded-3xl border border-slate-800 bg-gradient-to-r from-[#111726] via-[#0d121f] to-[#080c14] p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-xl">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-orange-500/20 text-orange-400 border border-orange-500/30">
              Active Role: {currentUser.role}
            </span>
            <span className="text-xs text-slate-400 font-mono">
              Signed in as {currentUser.name}
            </span>
          </div>
          <h2 className="font-display text-2xl sm:text-3xl font-extrabold text-white">
            Editorial Publishing Center
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 max-w-xl">
            Astro public site and CMS admin connected to the same unified source of truth. Zero code rebuilds required to publish.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={onNewPost}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-500 text-white font-semibold text-xs shadow-md shadow-orange-600/30 transition-all active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Write Article</span>
          </button>
          <button
            onClick={() => onNavigateTab('homepage')}
            className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl border border-orange-500/30 bg-orange-950/20 hover:bg-orange-950/40 text-orange-300 text-xs font-semibold transition-colors"
          >
            <span>Customize Homepage</span>
          </button>
          {onOpenSveltiaModal && (
            <button
              onClick={onOpenSveltiaModal}
              className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl border border-orange-500/40 bg-gradient-to-r from-orange-600/30 to-amber-600/30 hover:from-orange-600/50 hover:to-amber-600/50 text-white font-bold text-xs transition-all shadow-md shadow-orange-500/10"
            >
              <Github className="w-3.5 h-3.5 text-orange-400" />
              <span>Publish to GitHub & Cloudflare (Sveltia)</span>
            </button>
          )}
          <button
            onClick={onOpenSpecModal}
            className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl border border-slate-700 bg-slate-900 hover:bg-slate-800 text-slate-200 text-xs font-medium transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Deployment Guide & D1 Spec</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Total Published */}
        <div className="p-5 rounded-2xl border border-emerald-500/20 bg-[#080d17] space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Published</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-display font-extrabold text-white">
            {publishedCount}
          </div>
          <div className="text-[11px] text-emerald-400/80 font-mono">
            Live on Astro Edge
          </div>
        </div>

        {/* Drafts */}
        <div className="p-5 rounded-2xl border border-amber-500/20 bg-[#080d17] space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Drafts</span>
            <FileText className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-display font-extrabold text-white">
            {draftCount}
          </div>
          <div className="text-[11px] text-amber-400/80 font-mono">
            In progress
          </div>
        </div>

        {/* Scheduled */}
        <div className="p-5 rounded-2xl border border-blue-500/20 bg-[#080d17] space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Scheduled</span>
            <Calendar className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-display font-extrabold text-white">
            {scheduledCount}
          </div>
          <div className="text-[11px] text-blue-400/80 font-mono">
            Upcoming releases
          </div>
        </div>

        {/* Total Views */}
        <div className="p-5 rounded-2xl border border-purple-500/20 bg-[#080d17] space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Total Reads</span>
            <Eye className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-display font-extrabold text-white">
            {totalViews.toLocaleString()}
          </div>
          <div className="text-[11px] text-purple-400/80 font-mono">
            Across all posts
          </div>
        </div>

        {/* Categories / Tags */}
        <div className="p-5 rounded-2xl border border-slate-800 bg-[#080d17] space-y-2 col-span-2 lg:col-span-1">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Taxonomy</span>
            <Folder className="w-4 h-4 text-slate-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-display font-extrabold text-white">
            {categories.length} / {tags.length}
          </div>
          <div className="text-[11px] text-slate-400 font-mono">
            Categories & Tags
          </div>
        </div>
      </div>

      {/* Main Grid: Quick Draft + Top Performing Articles */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Quick Draft Box */}
        <div className="lg:col-span-5 p-6 rounded-2xl border border-slate-800 bg-[#090d16] space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <h3 className="font-display text-base font-bold text-white flex items-center gap-2">
              <FileText className="w-4 h-4 text-orange-400" />
              <span>Quick Draft</span>
            </h3>
            <span className="text-[11px] text-slate-500">Fast idea capture</span>
          </div>

          <form onSubmit={handleQuickDraftSubmit} className="space-y-3">
            <input
              type="text"
              required
              placeholder="Title for idea / hook..."
              value={quickTitle}
              onChange={(e) => setQuickTitle(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-800 bg-slate-900 text-white placeholder-slate-500 focus:outline-none focus:border-orange-500"
            />
            <textarea
              rows={4}
              placeholder="What's on your mind? Capture prompt formulas, code snippets, or draft outlines..."
              value={quickContent}
              onChange={(e) => setQuickContent(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-800 bg-slate-900 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-orange-500 resize-none"
            />
            <div className="flex items-center justify-between pt-1">
              <button
                type="submit"
                className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-orange-600 hover:bg-orange-500 text-white text-xs font-semibold transition-colors"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Save Quick Draft</span>
              </button>
              {draftSaved && (
                <span className="text-xs text-emerald-400 font-medium">
                  Draft saved to database!
                </span>
              )}
            </div>
          </form>
        </div>

        {/* Top Performing Publications */}
        <div className="lg:col-span-7 p-6 rounded-2xl border border-slate-800 bg-[#090d16] space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <h3 className="font-display text-base font-bold text-white flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-orange-400" />
              <span>Top Publications by Readership</span>
            </h3>
            <button
              onClick={() => onNavigateTab('posts')}
              className="text-xs text-orange-400 hover:underline"
            >
              View All Posts →
            </button>
          </div>

          <div className="space-y-3">
            {topArticles.map((art) => (
              <div
                key={art.id}
                className="p-3 rounded-xl border border-slate-800/80 bg-slate-900/40 hover:bg-slate-800/40 transition-colors flex items-center justify-between gap-4"
              >
                <div className="min-w-0">
                  <h4 className="font-semibold text-xs text-slate-200 truncate">
                    {art.title}
                  </h4>
                  <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-0.5">
                    <span className="font-mono">/{art.slug}</span>
                    <span>·</span>
                    <span>{art.readingTimeMinutes} min</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 font-mono text-xs text-slate-300 flex-shrink-0">
                  <Eye className="w-3.5 h-3.5 text-purple-400" />
                  <span>{art.views.toLocaleString()}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Activity / Audit Log Stream */}
      <div className="p-6 rounded-2xl border border-slate-800 bg-[#090d16] space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-orange-400" />
            <h3 className="font-display text-base font-bold text-white">
              Recent CMS Activity & Audit Trail
            </h3>
          </div>
          <button
            onClick={() => onNavigateTab('logs')}
            className="text-xs text-slate-400 hover:text-white"
          >
            Full Audit Logs →
          </button>
        </div>

        <div className="space-y-2.5">
          {activityLogs.slice(0, 5).map((log) => (
            <div
              key={log.id}
              className="p-3 rounded-xl border border-slate-800/60 bg-[#060910] flex flex-col sm:flex-row sm:items-center justify-between text-xs gap-2"
            >
              <div className="flex items-center gap-2.5">
                <span className="w-2 h-2 rounded-full bg-orange-500" />
                <span className="font-semibold text-white">{log.action}:</span>
                <span className="text-slate-300">{log.details}</span>
              </div>
              <div className="flex items-center gap-2 text-slate-500 text-[11px]">
                <span className="font-medium text-slate-400">{log.userName}</span>
                <span>({log.userRole})</span>
                <span>·</span>
                <span>{new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
