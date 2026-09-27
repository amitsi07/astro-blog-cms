import React, { useState, useEffect } from 'react';
import { StorageService } from './services/storage';
import {
  Post,
  Category,
  Tag,
  User,
  MediaItem,
  StaticPage,
  MenuItem,
  SiteSettings,
  ActivityLog,
  Comment,
  RedirectRule,
  UserRole,
} from './types/cms';

// Public Components
import { PublicHeader } from './components/public/PublicHeader';
import { PublicFooter } from './components/public/PublicFooter';
import { PublicHomepage } from './components/public/PublicHomepage';
import { ArticleView } from './components/public/ArticleView';
import { CategoryArchive } from './components/public/CategoryArchive';
import { TagArchive } from './components/public/TagArchive';
import { StaticPageView } from './components/public/StaticPageView';
import { SearchModal } from './components/public/SearchModal';

// Admin Components
import { AdminLayout } from './components/admin/AdminLayout';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { PostList } from './components/admin/PostList';
import { PostEditor } from './components/admin/PostEditor';
import { CategoryManager } from './components/admin/CategoryManager';
import { MediaLibrary } from './components/admin/MediaLibrary';
import { PagesManager } from './components/admin/PagesManager';
import { MenuManager } from './components/admin/MenuManager';
import { SiteSettingsManager } from './components/admin/SiteSettings';
import { UserManager } from './components/admin/UserManager';
import { ActivityLogs } from './components/admin/ActivityLogs';
import { RedirectsManager } from './components/admin/RedirectsManager';
import { SeoStudio } from './components/admin/SeoStudio';
import { CloudflareSpecModal } from './components/admin/CloudflareSpecModal';
import { SveltiaConnectModal } from './components/admin/SveltiaConnectModal';
import { ImportExportModal } from './components/admin/ImportExportModal';
import { LivePreviewModal } from './components/admin/LivePreviewModal';
import { HomepageBuilder } from './components/admin/HomepageBuilder';
import { postToAstroMarkdown } from './services/cloudflareExport';
import { pushSinglePostToGitHub, triggerCloudflareDeployHook, getGitHubSyncConfig } from './services/githubSync';

export default function App() {
  // Mode: Public website vs Admin studio
  const [mode, setMode] = useState<'public' | 'admin'>('public');

  // Routing State
  const [currentPath, setCurrentPath] = useState<string>('/');
  const [adminTab, setAdminTab] = useState<string>('dashboard');
  const [editingPost, setEditingPost] = useState<Post | null>(null);
  const [isCreatingPost, setIsCreatingPost] = useState(false);

  // Modals
  const [searchOpen, setSearchOpen] = useState(false);
  const [specModalOpen, setSpecModalOpen] = useState(false);
  const [sveltiaModalOpen, setSveltiaModalOpen] = useState(false);
  const [exportModalOpen, setExportModalOpen] = useState(false);
  const [previewModalPost, setPreviewModalPost] = useState<Post | null>(null);

  // Toast Notification
  const [toast, setToast] = useState<{ message: string; type?: 'success' | 'info' | 'error' } | null>(null);

  const showToast = (message: string, type: 'success' | 'info' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  // State loaded from StorageService
  const [posts, setPosts] = useState<Post[]>(() => StorageService.getPosts());
  const [categories, setCategories] = useState<Category[]>(() => StorageService.getCategories());
  const [tags, setTags] = useState<Tag[]>(() => StorageService.getTags());
  const [users, setUsers] = useState<User[]>(() => StorageService.getUsers());
  const [currentUser, setCurrentUser] = useState<User>(() => StorageService.getCurrentUser());
  const [media, setMedia] = useState<MediaItem[]>(() => StorageService.getMedia());
  const [pages, setPages] = useState<StaticPage[]>(() => StorageService.getPages());
  const [menus, setMenus] = useState<MenuItem[]>(() => StorageService.getMenus());
  const [settings, setSettings] = useState<SiteSettings>(() => StorageService.getSettings());
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>(() => StorageService.getActivityLogs());
  const [comments, setComments] = useState<Comment[]>(() => StorageService.getComments());
  const [redirects, setRedirects] = useState<RedirectRule[]>(() => StorageService.getRedirects());

  // Synchronize active typography settings with root CSS custom properties
  useEffect(() => {
    const typo = settings.typography;
    if (typo) {
      if (typo.bodyFont) document.documentElement.style.setProperty('--font-sans', typo.bodyFont);
      if (typo.displayFont) document.documentElement.style.setProperty('--font-display', typo.displayFont);
      if (typo.monoFont) document.documentElement.style.setProperty('--font-mono', typo.monoFont);
    }
  }, [settings.typography]);

  // Reload everything when database is reset or imported
  const reloadAllState = () => {
    setPosts(StorageService.getPosts());
    setCategories(StorageService.getCategories());
    setTags(StorageService.getTags());
    setUsers(StorageService.getUsers());
    setCurrentUser(StorageService.getCurrentUser());
    setMedia(StorageService.getMedia());
    setPages(StorageService.getPages());
    setMenus(StorageService.getMenus());
    setSettings(StorageService.getSettings());
    setActivityLogs(StorageService.getActivityLogs());
    setComments(StorageService.getComments());
    setRedirects(StorageService.getRedirects());
    showToast('Database refreshed.');
  };

  // Handle URL Redirection if path matches 301 rule
  const navigate = (path: string) => {
    // Check 301/302 redirects
    const matchedRedirect = redirects.find((r) => r.fromPath === path);
    if (matchedRedirect) {
      matchedRedirect.hits += 1;
      StorageService.saveRedirects(redirects);
      setRedirects([...redirects]);
      setCurrentPath(matchedRedirect.toPath);
      window.scrollTo(0, 0);
      return;
    }

    setCurrentPath(path);
    window.scrollTo(0, 0);
  };

  // Switch Simulated User / Role
  const handleSwitchUser = (userId: string) => {
    StorageService.setCurrentUserId(userId);
    const updated = StorageService.getCurrentUser();
    setCurrentUser(updated);
    showToast(`Switched active session to: ${updated.name} (${updated.role})`);
  };

  // Post Actions
  const handleSavePost = (
    postData: Partial<Post>,
    statusChange?: 'draft' | 'published' | 'scheduled' | 'trash'
  ) => {
    const existing = editingPost || posts.find((p) => p.id === postData.id);
    const targetStatus = statusChange || postData.status || existing?.status || 'draft';

    const fullPost: Post = {
      id: existing ? existing.id : `post-${Date.now()}`,
      title: postData.title || 'Untitled Article',
      slug: postData.slug || 'untitled-article',
      excerpt: postData.excerpt || '',
      content: postData.content || '',
      blocks: postData.blocks || [],
      featuredImage:
        postData.featuredImage ||
        'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&h=675&q=80',
      featuredImageCaption: postData.featuredImageCaption,
      featuredImageAlt: postData.featuredImageAlt,
      status: targetStatus,
      authorId: existing?.authorId || currentUser.id,
      categoryId: postData.categoryId || categories[0]?.id,
      tags: postData.tags || [],
      faqs: postData.faqs,
      seo: postData.seo || {
        seoTitle: postData.title,
        metaDescription: postData.excerpt,
        robotsIndex: true,
        robotsFollow: true,
      },
      isFeatured: existing?.isFeatured ?? false,
      isTrending: existing?.isTrending ?? false,
      views: existing?.views || 0,
      readingTimeMinutes: postData.readingTimeMinutes || 5,
      scheduledAt: targetStatus === 'scheduled' ? postData.scheduledAt : undefined,
      publishedAt:
        targetStatus === 'published'
          ? (existing?.publishedAt || new Date().toISOString())
          : undefined,
      createdAt: existing?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      revisions: existing?.revisions || [],
    };

    const saved = StorageService.savePostWithRevision(fullPost);
    setPosts(StorageService.getPosts());
    setActivityLogs(StorageService.getActivityLogs());
    setIsCreatingPost(false);
    setEditingPost(null);
    setAdminTab('posts');

    // Auto-deploy to GitHub & Cloudflare if published
    const ghConfig = getGitHubSyncConfig();
    if (targetStatus === 'published' && ghConfig) {
      showToast(`Article "${saved.title}" saved. Auto-deploying to GitHub & Cloudflare...`);
      const catName = categories.find((c) => c.id === saved.categoryId)?.name || 'General';
      const markdown = postToAstroMarkdown(saved, catName);
      pushSinglePostToGitHub(markdown, saved.slug, saved.title).then((res) => {
        if (res.success) {
          triggerCloudflareDeployHook();
          showToast(`🚀 Auto-deployed "${saved.title}" to GitHub! Cloudflare build running.`);
          StorageService.logActivity('Auto-Deployed Post', `Committed "${saved.title}" to ${ghConfig.repo} on branch ${ghConfig.branch}`);
        } else {
          showToast(`Saved locally. GitHub sync note: ${res.message}`, 'info');
        }
      });
    } else {
      showToast(`Article "${saved.title}" saved (Status: ${saved.status}).`);
    }
  };

  const handleDuplicatePost = (id: string) => {
    const source = posts.find((p) => p.id === id);
    if (!source) return;

    const duplicated: Post = {
      ...source,
      id: `post-${Date.now()}`,
      title: `${source.title} (Copy)`,
      slug: `${source.slug}-copy-${Math.random().toString(36).substr(2, 3)}`,
      status: 'draft',
      views: 0,
      publishedAt: undefined,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      revisions: [],
    };

    StorageService.savePostWithRevision(duplicated, 'Duplicated from existing article');
    setPosts(StorageService.getPosts());
    setActivityLogs(StorageService.getActivityLogs());
    showToast(`Duplicated article as draft.`);
  };

  const handleMoveToTrash = (id: string) => {
    const post = posts.find((p) => p.id === id);
    if (!post) return;
    post.status = 'trash';
    StorageService.savePosts(posts);
    StorageService.logActivity('Post Trashed', `Moved "${post.title}" to trash.`);
    setPosts([...posts]);
    setActivityLogs(StorageService.getActivityLogs());
    showToast(`Moved article to trash.`, 'info');
  };

  const handleRestoreFromTrash = (id: string) => {
    const post = posts.find((p) => p.id === id);
    if (!post) return;
    post.status = 'draft';
    StorageService.savePosts(posts);
    StorageService.logActivity('Post Restored', `Restored "${post.title}" from trash.`);
    setPosts([...posts]);
    setActivityLogs(StorageService.getActivityLogs());
    showToast(`Restored article as draft.`);
  };

  const handleDeletePermanent = (id: string) => {
    if (confirm('Permanently delete this article? This cannot be undone.')) {
      const remaining = posts.filter((p) => p.id !== id);
      StorageService.savePosts(remaining);
      StorageService.logActivity('Post Deleted', `Permanently deleted article ID: ${id}`);
      setPosts(remaining);
      setActivityLogs(StorageService.getActivityLogs());
      showToast('Article permanently deleted.', 'info');
    }
  };

  const handlePublishPostQuick = (id: string) => {
    const post = posts.find((p) => p.id === id);
    if (!post) return;
    post.status = 'published';
    post.publishedAt = post.publishedAt || new Date().toISOString();
    StorageService.savePostWithRevision(post, 'Published directly from post list');
    setPosts(StorageService.getPosts());
    setActivityLogs(StorageService.getActivityLogs());

    const ghConfig = getGitHubSyncConfig();
    if (ghConfig) {
      showToast(`Published "${post.title}". Auto-deploying to GitHub & Cloudflare...`);
      const catName = categories.find((c) => c.id === post.categoryId)?.name || 'General';
      const markdown = postToAstroMarkdown(post, catName);
      pushSinglePostToGitHub(markdown, post.slug, post.title).then((res) => {
        if (res.success) {
          triggerCloudflareDeployHook();
          showToast(`🚀 Auto-deployed "${post.title}" to GitHub! Cloudflare build running.`);
          StorageService.logActivity('Auto-Deployed Post', `Committed "${post.title}" to ${ghConfig.repo}`);
        } else {
          showToast(`Published locally. GitHub sync note: ${res.message}`, 'info');
        }
      });
    } else {
      showToast(`Published "${post.title}" to live Astro edge!`);
    }
  };

  // Quick Draft from Dashboard
  const handleQuickDraft = (title: string, body: string) => {
    const newPost: Post = {
      id: `post-${Date.now()}`,
      title,
      slug: title.toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-'),
      excerpt: body.substring(0, 140),
      content: body,
      blocks: [],
      featuredImage:
        'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&h=675&q=80',
      status: 'draft',
      authorId: currentUser.id,
      categoryId: categories[0]?.id || 'cat-technology',
      tags: ['draft'],
      views: 0,
      readingTimeMinutes: 3,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      seo: {
        seoTitle: title,
        metaDescription: body.substring(0, 140),
        robotsIndex: true,
        robotsFollow: true,
      },
    };

    StorageService.savePostWithRevision(newPost, 'Quick Draft capture');
    setPosts(StorageService.getPosts());
    setActivityLogs(StorageService.getActivityLogs());
  };

  // Comments
  const handleAddComment = (commentData: Omit<Comment, 'id' | 'createdAt' | 'isApproved'>) => {
    const newComment: Comment = {
      ...commentData,
      id: `com-${Date.now()}`,
      createdAt: new Date().toISOString(),
      isApproved: !settings.commentsRequireApproval,
    };
    const updated = [newComment, ...comments];
    StorageService.saveComments(updated);
    setComments(updated);
    StorageService.logActivity('Comment Submitted', `New comment submitted by ${commentData.authorName}`);
  };

  // Route Resolver for Public Site
  const renderPublicRoute = () => {
    // 1. Homepage
    if (currentPath === '/' || currentPath === '') {
      return (
        <PublicHomepage
          posts={posts}
          categories={categories}
          users={users}
          tags={tags}
          settings={settings}
          onNavigate={navigate}
          onOpenSpecModal={() => setSpecModalOpen(true)}
          onEditHomepage={() => {
            setMode('admin');
            setAdminTab('homepage');
            setIsCreatingPost(false);
            setEditingPost(null);
          }}
        />
      );
    }

    // 2. Category Archive: /category/:slug
    if (currentPath.startsWith('/category/')) {
      const slug = currentPath.replace('/category/', '').replace(/\/$/, '');
      const cat = categories.find((c) => c.slug === slug);
      if (cat) {
        return (
          <CategoryArchive
            category={cat}
            posts={posts}
            users={users}
            onNavigate={navigate}
          />
        );
      }
    }

    // 3. Tag Archive: /tag/:slug
    if (currentPath.startsWith('/tag/')) {
      const slug = currentPath.replace('/tag/', '').replace(/\/$/, '');
      return (
        <TagArchive
          tagSlug={slug}
          tags={tags}
          posts={posts}
          categories={categories}
          users={users}
          onNavigate={navigate}
        />
      );
    }

    // 4. Static Pages: /about, /contact, /privacy-policy, /terms, /disclaimer
    const matchedPage = pages.find((p) => `/${p.slug}` === currentPath);
    if (matchedPage) {
      return <StaticPageView page={matchedPage} onNavigate={navigate} />;
    }

    // 5. Clean Article URL: /article-slug (category is NOT in URL per spec!)
    const cleanSlug = currentPath.replace(/^\/+|\/+$/g, '');
    const matchedPost = posts.find(
      (p) => p.slug === cleanSlug && (p.status === 'published' || mode === 'admin')
    );
    if (matchedPost) {
      const author = users.find((u) => u.id === matchedPost.authorId) || users[0];
      const category = categories.find((c) => c.id === matchedPost.categoryId) || categories[0];

      return (
        <ArticleView
          post={matchedPost}
          author={author}
          category={category}
          allPosts={posts}
          settings={settings}
          comments={comments}
          onAddComment={handleAddComment}
          onNavigate={navigate}
        />
      );
    }

    // 6. 404 Fallback
    return (
      <div className="max-w-xl mx-auto px-4 py-24 text-center space-y-4">
        <h1 className="font-display text-4xl font-extrabold text-white">404 - Page Not Found</h1>
        <p className="text-slate-400 text-sm">
          The requested article or page <code className="text-orange-400 font-mono">{currentPath}</code> does not exist or has been relocated.
        </p>
        <button
          onClick={() => navigate('/')}
          className="px-5 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-500 text-white font-semibold text-xs transition-colors"
        >
          Return to Homepage
        </button>
      </div>
    );
  };

  // Render Admin Panels
  const renderAdminTabContent = () => {
    if (isCreatingPost || editingPost) {
      return (
        <PostEditor
          post={editingPost}
          categories={categories}
          tags={tags}
          currentUser={currentUser}
          allUsers={users}
          media={media}
          onAddMedia={(item) => {
            const updated = [item, ...media];
            StorageService.saveMedia(updated);
            setMedia(updated);
            StorageService.logActivity('Media Uploaded', `Saved "${item.title}" to media library.`);
          }}
          onSave={handleSavePost}
          onCancel={() => {
            setIsCreatingPost(false);
            setEditingPost(null);
          }}
          onDelete={handleMoveToTrash}
        />
      );
    }

    switch (adminTab) {
      case 'dashboard':
        return (
          <AdminDashboard
            posts={posts}
            categories={categories}
            tags={tags}
            activityLogs={activityLogs}
            currentUser={currentUser}
            onNavigateTab={setAdminTab}
            onNewPost={() => {
              setEditingPost(null);
              setIsCreatingPost(true);
            }}
            onQuickDraft={handleQuickDraft}
            onOpenSpecModal={() => setSpecModalOpen(true)}
            onOpenSveltiaModal={() => setSveltiaModalOpen(true)}
          />
        );

      case 'homepage':
        return (
          <HomepageBuilder
            homepage={settings.homepage}
            posts={posts}
            categories={categories}
            onSave={(newHomepageConfig) => {
              const updatedSettings: SiteSettings = {
                ...settings,
                homepage: newHomepageConfig,
              };
              StorageService.saveSettings(updatedSettings);
              setSettings(updatedSettings);
              StorageService.logActivity('Homepage Updated', 'Configured homepage layout, hero, and section blocks.');
              showToast('Homepage layout and content saved successfully!');
            }}
            onPreviewLive={() => {
              setMode('public');
              navigate('/');
            }}
            onResetDefaults={() => {
              if (confirm('Reset homepage layout and sections to original defaults?')) {
                // reload from storage or initial
                const fresh = StorageService.getSettings();
                const resetHomepage = {
                  ...settings,
                  homepage: fresh.homepage,
                };
                StorageService.saveSettings(resetHomepage);
                setSettings(resetHomepage);
                showToast('Homepage reset to default.');
              }
            }}
          />
        );

      case 'posts':
        return (
          <PostList
            posts={posts}
            categories={categories}
            users={users}
            onNewPost={() => {
              setEditingPost(null);
              setIsCreatingPost(true);
            }}
            onEditPost={(p) => setEditingPost(p)}
            onDuplicatePost={handleDuplicatePost}
            onPreviewPost={(p) => setPreviewModalPost(p)}
            onMoveToTrash={handleMoveToTrash}
            onRestoreFromTrash={handleRestoreFromTrash}
            onDeletePermanent={handleDeletePermanent}
            onPublishPost={handlePublishPostQuick}
          />
        );

      case 'media':
        return (
          <MediaLibrary
            media={media}
            onAddMedia={(item) => {
              const updated = [item, ...media];
              StorageService.saveMedia(updated);
              setMedia(updated);
              StorageService.logActivity('Media Uploaded', `Uploaded asset "${item.title}"`);
              showToast('Asset saved to media repository.');
            }}
            onUpdateMedia={(id, updates) => {
              const updated = media.map((m) => (m.id === id ? { ...m, ...updates } : m));
              StorageService.saveMedia(updated);
              setMedia(updated);
              showToast('Media metadata updated.');
            }}
            onDeleteMedia={(id) => {
              const updated = media.filter((m) => m.id !== id);
              StorageService.saveMedia(updated);
              setMedia(updated);
              showToast('Media asset removed.', 'info');
            }}
          />
        );

      case 'categories':
        return (
          <CategoryManager
            categories={categories}
            tags={tags}
            posts={posts}
            onSaveCategory={(cat) => {
              const idx = categories.findIndex((c) => c.id === cat.id);
              let updated = [...categories];
              if (idx !== -1) updated[idx] = cat;
              else updated.push(cat);
              StorageService.saveCategories(updated);
              setCategories(updated);
              StorageService.logActivity('Category Saved', `Updated category "${cat.name}"`);
              showToast(`Category "${cat.name}" saved.`);
            }}
            onDeleteCategory={(id) => {
              const updated = categories.filter((c) => c.id !== id);
              StorageService.saveCategories(updated);
              setCategories(updated);
              showToast('Category deleted.', 'info');
            }}
            onSaveTag={(tag) => {
              const idx = tags.findIndex((t) => t.id === tag.id);
              let updated = [...tags];
              if (idx !== -1) updated[idx] = tag;
              else updated.push(tag);
              StorageService.saveTags(updated);
              setTags(updated);
              showToast(`Tag #${tag.name} saved.`);
            }}
            onDeleteTag={(id) => {
              const updated = tags.filter((t) => t.id !== id);
              StorageService.saveTags(updated);
              setTags(updated);
              showToast('Tag deleted.', 'info');
            }}
          />
        );

      case 'pages':
        return (
          <PagesManager
            pages={pages}
            onSavePage={(page) => {
              const updated = pages.map((p) => (p.id === page.id ? page : p));
              StorageService.savePages(updated);
              setPages(updated);
              StorageService.logActivity('Page Updated', `Edited page "${page.title}"`);
              showToast(`Page "${page.title}" updated.`);
            }}
            onPreviewPage={(path) => {
              setMode('public');
              navigate(path);
            }}
          />
        );

      case 'menus':
        return (
          <MenuManager
            menus={menus}
            onSaveMenus={(items) => {
              StorageService.saveMenus(items);
              setMenus(items);
              StorageService.logActivity('Menus Updated', 'Reconfigured header/footer navigation order.');
              showToast('Menu navigation updated.');
            }}
          />
        );

      case 'seo':
        return <SeoStudio posts={posts} categories={categories} settings={settings} />;

      case 'settings':
        return (
          <SiteSettingsManager
            settings={settings}
            currentUser={currentUser}
            onSave={(newSettings) => {
              StorageService.saveSettings(newSettings);
              setSettings(newSettings);
              StorageService.logActivity('Settings Saved', 'Updated site branding, ad slots, and settings.');
              showToast('Site configuration updated.');
            }}
          />
        );

      case 'users':
        return (
          <UserManager
            users={users}
            currentUser={currentUser}
            onSwitchUser={handleSwitchUser}
            onAddUser={(user) => {
              const updated = [...users, user];
              StorageService.saveUsers(updated);
              setUsers(updated);
              StorageService.logActivity('Staff Created', `Added team member ${user.name} (${user.role})`);
              showToast(`Added staff account for ${user.name}`);
            }}
            onUpdateUserRole={(userId, newRole) => {
              const updated = users.map((u) => (u.id === userId ? { ...u, role: newRole } : u));
              StorageService.saveUsers(updated);
              setUsers(updated);
              if (currentUser.id === userId) {
                setCurrentUser({ ...currentUser, role: newRole });
              }
              StorageService.logActivity('Role Updated', `Changed role for user ID: ${userId} to ${newRole}`);
              showToast(`Updated role to ${newRole}.`);
            }}
          />
        );

      case 'logs':
        return <ActivityLogs logs={activityLogs} />;

      case 'redirects':
        return (
          <RedirectsManager
            redirects={redirects}
            onAddRedirect={(rule) => {
              const updated = [rule, ...redirects];
              StorageService.saveRedirects(updated);
              setRedirects(updated);
              StorageService.logActivity('Redirect Created', `Forwarded ${rule.fromPath} -> ${rule.toPath}`);
              showToast(`Redirect added.`);
            }}
            onDeleteRedirect={(id) => {
              const updated = redirects.filter((r) => r.id !== id);
              StorageService.saveRedirects(updated);
              setRedirects(updated);
              showToast('Redirect rule removed.', 'info');
            }}
          />
        );

      case 'spec':
        return (
          <div className="space-y-4">
            <button
              onClick={() => setSpecModalOpen(true)}
              className="px-4 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-500 text-white font-semibold text-xs"
            >
              Open Full Specification & D1 Architecture Blueprint Modal
            </button>
          </div>
        );

      case 'export':
        return (
          <div className="space-y-4">
            <button
              onClick={() => setExportModalOpen(true)}
              className="px-4 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-500 text-white font-semibold text-xs"
            >
              Open Backup Database & Markdown Export Modal
            </button>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-[#070b12] text-slate-100 flex flex-col font-sans selection:bg-orange-500/20 selection:text-orange-400">
      {/* Toast Notification Alert */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-3 rounded-xl bg-[#0d131f] border border-slate-700 shadow-2xl text-xs font-medium text-white animate-in slide-in-from-bottom-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400" />
          <span>{toast.message}</span>
        </div>
      )}

      {mode === 'public' ? (
        <>
          {/* Public Header with WordPress Admin Bar */}
          <PublicHeader
            settings={settings}
            menus={menus}
            currentUser={currentUser}
            onNavigate={navigate}
            onOpenSearch={() => setSearchOpen(true)}
            onEnterAdmin={() => {
              setMode('admin');
              setAdminTab('dashboard');
            }}
            onNewPost={() => {
              setMode('admin');
              setIsCreatingPost(true);
              setEditingPost(null);
            }}
            onEditHomepage={() => {
              setMode('admin');
              setAdminTab('homepage');
              setIsCreatingPost(false);
              setEditingPost(null);
            }}
            currentPath={currentPath}
          />

          {/* Public Main Body */}
          <main className="flex-1">
            {renderPublicRoute()}
          </main>

          {/* Public Footer */}
          <PublicFooter
            settings={settings}
            categories={categories}
            menus={menus}
            onNavigate={navigate}
            onOpenSpecModal={() => setSpecModalOpen(true)}
          />
        </>
      ) : (
        /* Admin Studio Panel */
        <AdminLayout
          currentTab={isCreatingPost || editingPost ? 'posts' : adminTab}
          onSelectTab={(tab) => {
            setIsCreatingPost(false);
            setEditingPost(null);
            if (tab === 'spec') setSpecModalOpen(true);
            else if (tab === 'sveltia') setSveltiaModalOpen(true);
            else if (tab === 'export') setExportModalOpen(true);
            else setAdminTab(tab);
          }}
          onOpenSveltiaModal={() => setSveltiaModalOpen(true)}
          currentUser={currentUser}
          allUsers={users}
          onSwitchUser={handleSwitchUser}
          onExitAdmin={() => setMode('public')}
          onNewPost={() => {
            setIsCreatingPost(true);
            setEditingPost(null);
            setAdminTab('posts');
          }}
          settings={settings}
        >
          {renderAdminTabContent()}
        </AdminLayout>
      )}

      {/* Global Modals */}
      <SearchModal
        isOpen={searchOpen}
        onClose={() => setSearchOpen(false)}
        posts={posts}
        categories={categories}
        onSelectPost={(slug) => {
          setMode('public');
          navigate(`/${slug}`);
        }}
        onSelectCategory={(slug) => {
          setMode('public');
          navigate(`/category/${slug}`);
        }}
      />

      <SveltiaConnectModal
        isOpen={sveltiaModalOpen}
        onClose={() => setSveltiaModalOpen(false)}
        settings={settings}
        posts={posts}
        categories={categories}
      />

      <CloudflareSpecModal
        isOpen={specModalOpen}
        onClose={() => setSpecModalOpen(false)}
      />

      <ImportExportModal
        isOpen={exportModalOpen}
        onClose={() => setExportModalOpen(false)}
        posts={posts}
        categories={categories}
        onDatabaseRestored={reloadAllState}
      />

      {previewModalPost && (
        <LivePreviewModal
          isOpen={Boolean(previewModalPost)}
          onClose={() => setPreviewModalPost(null)}
          post={previewModalPost}
          author={users.find((u) => u.id === previewModalPost.authorId) || currentUser}
          category={categories.find((c) => c.id === previewModalPost.categoryId)}
        />
      )}
    </div>
  );
}
