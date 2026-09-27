import React, { useState } from 'react';
import {
  Post,
  Category,
  User,
  Tag,
  SiteSettings,
  HomepageSectionId,
} from '../../types/cms';
import {
  Clock,
  TrendingUp,
  ArrowRight,
  Flame,
  Sparkles,
  BookOpen,
  Mail,
  CheckCircle2,
  Folder,
  Palette,
} from 'lucide-react';

interface PublicHomepageProps {
  posts: Post[];
  categories: Category[];
  users: User[];
  tags: Tag[];
  settings: SiteSettings;
  onNavigate: (path: string) => void;
  onOpenSpecModal: () => void;
  onEditHomepage?: () => void;
}

export const PublicHomepage: React.FC<PublicHomepageProps> = ({
  posts,
  categories,
  users,
  tags,
  settings,
  onNavigate,
  onOpenSpecModal,
  onEditHomepage,
}) => {
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('all');
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterSubscribed, setNewsletterSubscribed] = useState(false);

  // Config from settings
  const hp = settings.homepage;

  // Filter only published posts
  const publishedPosts = posts.filter((p) => p.status === 'published');

  // Hero Post Resolution
  let heroPost: Post | undefined;
  if (hp.hero.type === 'featured_post') {
    if (hp.hero.selectedPostId && hp.hero.selectedPostId !== 'auto') {
      heroPost = publishedPosts.find((p) => p.id === hp.hero.selectedPostId);
    }
    if (!heroPost) {
      heroPost = publishedPosts.find((p) => p.isFeatured) || publishedPosts[0];
    }
  }

  // Secondary Featured Grid posts (excluding hero)
  const secondaryFeatured = publishedPosts
    .filter((p) => p.id !== heroPost?.id && p.isFeatured)
    .slice(0, hp.featuredGrid?.postLimit || 3);

  // Trending / Popular posts
  const trendingLimit = hp.trending?.postLimit || 4;
  const trendingPosts = [...publishedPosts]
    .sort((a, b) => (b.views || 0) - (a.views || 0))
    .slice(0, trendingLimit);

  // Filtered latest posts
  const filteredLatest = publishedPosts.filter((p) => {
    if (selectedCategoryFilter === 'all') return true;
    return p.categoryId === selectedCategoryFilter;
  });

  const sidebarAd = settings.adSlots?.find(
    (a) => a.location === 'sidebar' && a.isEnabled
  );

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (newsletterEmail) {
      setNewsletterSubscribed(true);
      setNewsletterEmail('');
    }
  };

  // Section 1: Hero Section
  const renderHeroSection = () => {
    if (hp.hero.type === 'custom') {
      return (
        <section key="hero" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative rounded-3xl border border-slate-800 bg-gradient-to-b from-[#111726] to-[#0a0e17] overflow-hidden shadow-2xl">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center p-6 sm:p-10 lg:p-12">
              <div className="lg:col-span-7 space-y-5">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-orange-500/20 text-orange-400 border border-orange-500/30">
                    <Flame className="w-3.5 h-3.5 fill-orange-400" />
                    <span>{hp.hero.badgeText || 'Spotlight Announcement'}</span>
                  </span>
                  {onEditHomepage && (
                    <button
                      onClick={onEditHomepage}
                      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-colors shadow-sm"
                    >
                      <Palette className="w-3.5 h-3.5 text-amber-400" />
                      <span>Edit Homepage in CMS</span>
                    </button>
                  )}
                </div>

                <h1 className="font-display text-2xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight leading-[1.15]">
                  {hp.hero.customHeadline || 'High-Velocity Publishing & Edge Compute Architecture'}
                </h1>

                <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-2xl">
                  {hp.hero.customSubheadline ||
                    'Explore deep-dive technical blueprints on Astro 5 island hydration, generative video pipelines, and zero-cost Cloudflare edge storage.'}
                </p>

                {hp.hero.customCtaText && (
                  <div className="pt-2">
                    <button
                      onClick={() => onNavigate(hp.hero.customCtaUrl || '/')}
                      className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-orange-600 hover:bg-orange-500 text-white font-semibold text-sm shadow-lg shadow-orange-600/25 transition-all active:scale-95"
                    >
                      <span>{hp.hero.customCtaText}</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>

              {/* Custom Image */}
              {hp.hero.customImageUrl && (
                <div className="lg:col-span-5">
                  <div className="relative rounded-2xl overflow-hidden border border-slate-700/60 shadow-xl aspect-video lg:aspect-[4/3]">
                    <img
                      src={hp.hero.customImageUrl}
                      alt="Hero Graphic"
                      className="w-full h-full object-cover"
                    />
                    {hp.hero.customImageCaption && (
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end p-4">
                        <span className="text-xs text-slate-300 font-mono">
                          {hp.hero.customImageCaption}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>
      );
    }

    // Default: Featured Article Hero
    if (!heroPost) return null;

    return (
      <section key="hero" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative rounded-3xl border border-slate-800 bg-gradient-to-b from-[#111726] to-[#0a0e17] overflow-hidden shadow-2xl">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center p-6 sm:p-10 lg:p-12">
            <div className="lg:col-span-7 space-y-5">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-orange-500/20 text-orange-400 border border-orange-500/30">
                  <Flame className="w-3.5 h-3.5 fill-orange-400" />
                  <span>{hp.hero.badgeText || 'Featured Blueprint'}</span>
                </span>
                {heroPost.isTrending && (
                  <span className="inline-flex items-center gap-1 text-xs text-amber-400 font-medium">
                    <TrendingUp className="w-3.5 h-3.5" />
                    <span>Trending #1</span>
                  </span>
                )}
                {onEditHomepage && (
                  <button
                    onClick={onEditHomepage}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-colors shadow-sm"
                  >
                    <Palette className="w-3.5 h-3.5 text-amber-400" />
                    <span>Edit Homepage in CMS</span>
                  </button>
                )}
              </div>

              <h1
                onClick={() => onNavigate(`/${heroPost.slug}`)}
                className="font-display text-2xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight leading-[1.15] cursor-pointer hover:text-orange-400 transition-colors"
              >
                {heroPost.title}
              </h1>

              <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-2xl">
                {heroPost.excerpt}
              </p>

              <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400 pt-2">
                <span className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-slate-500" />
                  {heroPost.readingTimeMinutes} min read
                </span>
                <span>·</span>
                <span>Clean URL: /{heroPost.slug}</span>
                <span>·</span>
                <span>{heroPost.views.toLocaleString()} reads</span>
              </div>

              <div className="pt-2">
                <button
                  onClick={() => onNavigate(`/${heroPost.slug}`)}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-orange-600 hover:bg-orange-500 text-white font-semibold text-sm shadow-lg shadow-orange-600/25 transition-all active:scale-95"
                >
                  <span>Read Full Blueprint</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Hero Image */}
            <div
              className="lg:col-span-5 cursor-pointer group"
              onClick={() => onNavigate(`/${heroPost.slug}`)}
            >
              <div className="relative rounded-2xl overflow-hidden border border-slate-700/60 shadow-xl aspect-video lg:aspect-[4/3]">
                <img
                  src={heroPost.featuredImage}
                  alt={heroPost.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end p-4">
                  <span className="text-xs text-slate-300 font-mono">
                    {heroPost.featuredImageCaption || 'Interactive production guide'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  };

  // Section 2: Announcement / Architecture Target Banner
  const renderAnnouncementSection = () => {
    const ann = hp.announcement;
    return (
      <section key="announcement" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-2xl border border-slate-800 bg-[#090d16] p-4 sm:p-5 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-semibold text-sm text-white">{ann.title}</h4>
              <p className="text-xs text-slate-400">{ann.description}</p>
            </div>
          </div>
          <button
            onClick={() => {
              if (ann.buttonAction === 'open_spec') {
                onOpenSpecModal();
              } else if (ann.buttonUrl) {
                onNavigate(ann.buttonUrl);
              }
            }}
            className="flex-shrink-0 px-4 py-2 rounded-lg border border-slate-700 hover:border-amber-500/50 bg-slate-900 text-slate-200 hover:text-white text-xs font-medium transition-colors"
          >
            {ann.buttonText || 'View Details'}
          </button>
        </div>
      </section>
    );
  };

  // Section 3: Trending Ribbon
  const renderTrendingSection = () => {
    return (
      <section key="trending" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-orange-400" />
            <div>
              <h2 className="font-display text-xl sm:text-2xl font-bold text-white">
                {hp.trending.title || 'Trending & High Velocity'}
              </h2>
              {hp.trending.subtitle && (
                <p className="text-xs text-slate-400">{hp.trending.subtitle}</p>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {trendingPosts.map((post, idx) => {
            const cat = categories.find((c) => c.id === post.categoryId);
            return (
              <div
                key={post.id}
                onClick={() => onNavigate(`/${post.slug}`)}
                className="group p-4 rounded-2xl border border-slate-800/80 bg-[#0a0e17] hover:border-slate-700 hover:bg-[#0e1320] transition-all cursor-pointer flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
                    <span className="font-mono text-orange-400/80 font-semibold">
                      0{idx + 1}
                    </span>
                    <span style={{ color: cat?.color || '#94a3b8' }}>{cat?.name}</span>
                  </div>
                  <h3 className="font-display text-sm font-bold text-white group-hover:text-orange-400 transition-colors line-clamp-2 mb-2">
                    {post.title}
                  </h3>
                  <p className="text-xs text-slate-400 line-clamp-2">
                    {post.excerpt}
                  </p>
                </div>
                <div className="flex items-center justify-between text-[11px] text-slate-500 mt-4 pt-3 border-t border-slate-800/60">
                  <span>{post.readingTimeMinutes} min read</span>
                  <span>{post.views.toLocaleString()} views</span>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    );
  };

  // Section 4: Curated Staff Featured Grid
  const renderFeaturedGridSection = () => {
    if (secondaryFeatured.length === 0) return null;

    return (
      <section key="featured_grid" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-2 mb-6">
          <Flame className="w-5 h-5 text-orange-400" />
          <div>
            <h2 className="font-display text-xl sm:text-2xl font-bold text-white">
              {hp.featuredGrid?.title || 'Curated Staff Blueprints'}
            </h2>
            {hp.featuredGrid?.subtitle && (
              <p className="text-xs text-slate-400">{hp.featuredGrid.subtitle}</p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {secondaryFeatured.map((post) => {
            const cat = categories.find((c) => c.id === post.categoryId);
            return (
              <article
                key={post.id}
                onClick={() => onNavigate(`/${post.slug}`)}
                className="group rounded-2xl border border-slate-800/80 bg-[#0a0e17] hover:border-slate-700 transition-all cursor-pointer overflow-hidden flex flex-col justify-between"
              >
                <div>
                  <div className="aspect-video w-full overflow-hidden border-b border-slate-800/60 bg-slate-950">
                    <img
                      src={post.featuredImage}
                      alt={post.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <div className="p-5 space-y-2">
                    <span
                      className="text-xs font-semibold"
                      style={{ color: cat?.color || '#38bdf8' }}
                    >
                      {cat?.name}
                    </span>
                    <h3 className="font-display text-base font-bold text-white group-hover:text-orange-400 transition-colors line-clamp-2">
                      {post.title}
                    </h3>
                    <p className="text-xs text-slate-400 line-clamp-2">
                      {post.excerpt}
                    </p>
                  </div>
                </div>
                <div className="p-5 pt-0 flex items-center justify-between text-xs text-slate-500 border-t border-slate-800/40 mt-3">
                  <span>{post.readingTimeMinutes} min read</span>
                  <span className="text-orange-400 flex items-center gap-1 font-medium">
                    <span>Read</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </article>
            );
          })}
        </div>
      </section>
    );
  };

  // Section 5: Latest Feed & Desktop Sidebar
  const renderLatestFeedSection = () => {
    return (
      <section key="latest_feed" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Main Feed Column */}
          <div className={`${hp.sidebar?.enabled ? 'lg:col-span-8' : 'lg:col-span-12'} space-y-6`}>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-orange-400" />
                <div>
                  <h2 className="font-display text-xl sm:text-2xl font-bold text-white">
                    {hp.latestFeed.title || 'Latest Publications'}
                  </h2>
                  {hp.latestFeed.subtitle && (
                    <p className="text-xs text-slate-400">{hp.latestFeed.subtitle}</p>
                  )}
                </div>
              </div>

              {/* Category Filter Tabs */}
              {hp.latestFeed.showCategoryTabs && (
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full">
                  <button
                    onClick={() => setSelectedCategoryFilter('all')}
                    className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap ${
                      selectedCategoryFilter === 'all'
                        ? 'bg-orange-600 text-white'
                        : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    All ({publishedPosts.length})
                  </button>
                  {categories.map((cat) => {
                    const count = publishedPosts.filter((p) => p.categoryId === cat.id).length;
                    return (
                      <button
                        key={cat.id}
                        onClick={() => setSelectedCategoryFilter(cat.id)}
                        className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap ${
                          selectedCategoryFilter === cat.id
                            ? 'bg-orange-600 text-white'
                            : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'
                        }`}
                      >
                        {cat.name} ({count})
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Posts Grid */}
            <div className="space-y-6">
              {filteredLatest.length === 0 ? (
                <div className="p-12 text-center text-slate-500 rounded-2xl border border-slate-800 bg-[#080c14]">
                  No articles found in this category yet.
                </div>
              ) : (
                filteredLatest.map((post) => {
                  const cat = categories.find((c) => c.id === post.categoryId);
                  const author = users.find((u) => u.id === post.authorId);

                  return (
                    <article
                      key={post.id}
                      onClick={() => onNavigate(`/${post.slug}`)}
                      className="group p-5 sm:p-6 rounded-2xl border border-slate-800/80 bg-[#0a0e17] hover:border-slate-700 hover:bg-[#0e1422] transition-all cursor-pointer grid grid-cols-1 sm:grid-cols-12 gap-5"
                    >
                      <div className="sm:col-span-8 flex flex-col justify-between">
                        <div>
                          <div className="flex items-center gap-2 text-xs text-slate-400 mb-2">
                            <span
                              className="font-semibold"
                              style={{ color: cat?.color || '#38bdf8' }}
                            >
                              {cat?.name || 'General'}
                            </span>
                            <span>·</span>
                            <span>
                              {new Date(post.publishedAt || post.createdAt).toLocaleDateString(
                                'en-US',
                                { month: 'short', day: 'numeric', year: 'numeric' }
                              )}
                            </span>
                            <span>·</span>
                            <span>{post.readingTimeMinutes} min read</span>
                          </div>
                          <h3 className="font-display text-lg sm:text-xl font-bold text-white group-hover:text-orange-400 transition-colors leading-snug mb-2">
                            {post.title}
                          </h3>
                          <p className="text-xs sm:text-sm text-slate-400 line-clamp-2 leading-relaxed">
                            {post.excerpt}
                          </p>
                        </div>

                        {/* Author info & tags */}
                        <div className="flex items-center justify-between mt-4 pt-3 border-t border-slate-800/50 text-xs">
                          <div className="flex items-center gap-2">
                            {author?.avatar && (
                              <img
                                src={author.avatar}
                                alt={author.name}
                                className="w-5 h-5 rounded-full object-cover"
                              />
                            )}
                            <span className="text-slate-300 font-medium">
                              {author?.name || 'Editorial Team'}
                            </span>
                          </div>
                          <span className="text-orange-400 group-hover:translate-x-1 transition-transform flex items-center gap-1 font-medium">
                            <span>Read</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </span>
                        </div>
                      </div>

                      {/* Post Thumbnail */}
                      <div className="sm:col-span-4 overflow-hidden rounded-xl border border-slate-800 aspect-video sm:aspect-auto sm:h-full">
                        <img
                          src={post.featuredImage}
                          alt={post.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                    </article>
                  );
                })
              )}
            </div>
          </div>

          {/* Desktop Sidebar (Configurable from CMS) */}
          {hp.sidebar?.enabled && (
            <aside className="lg:col-span-4 space-y-8">
              {/* Optional Sidebar Ad Slot */}
              {sidebarAd && sidebarAd.bannerImageUrl && (
                <div className="p-4 rounded-2xl border border-slate-800 bg-[#080d17] text-center">
                  <span className="block text-[10px] text-slate-500 uppercase tracking-widest mb-2 font-mono">
                    Sponsor
                  </span>
                  <a
                    href={sidebarAd.bannerLinkUrl || '#'}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block rounded-xl overflow-hidden hover:opacity-95 transition-opacity"
                  >
                    <img
                      src={sidebarAd.bannerImageUrl}
                      alt={sidebarAd.altText || 'Sponsor banner'}
                      className="w-full h-auto object-cover rounded-xl"
                    />
                  </a>
                </div>
              )}

              {/* Author Spotlight Widget */}
              {hp.sidebar.showAuthorSpotlight && (
                <div className="p-6 rounded-2xl border border-slate-800 bg-[#0a0e17] space-y-4">
                  <div className="text-xs font-bold uppercase tracking-wider text-slate-300 pb-2 border-b border-slate-800">
                    {hp.sidebar.authorSpotlightTitle || 'Author Spotlight'}
                  </div>
                  {users.slice(0, 3).map((u) => (
                    <div key={u.id} className="flex items-center gap-3">
                      <img
                        src={u.avatar}
                        alt={u.name}
                        className="w-10 h-10 rounded-full object-cover border border-slate-700"
                      />
                      <div>
                        <div className="text-xs font-semibold text-white">{u.name}</div>
                        <div className="text-[11px] text-slate-400">{u.title || u.role}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Tags Cloud Widget */}
              {hp.sidebar.showTags && (
                <div className="p-6 rounded-2xl border border-slate-800 bg-[#0a0e17] space-y-4">
                  <div className="text-xs font-bold uppercase tracking-wider text-slate-300 pb-2 border-b border-slate-800">
                    {hp.sidebar.tagsTitle || 'Explore Tags'}
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {tags.map((t) => (
                      <button
                        key={t.id}
                        onClick={() => onNavigate(`/tag/${t.slug}`)}
                        className="px-2.5 py-1 text-xs rounded-lg border border-slate-800 bg-slate-900/60 hover:bg-slate-800 text-slate-300 hover:text-white transition-colors"
                      >
                        #{t.name}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Sidebar Newsletter Widget */}
              {hp.sidebar.showNewsletter && (
                <div className="p-6 rounded-2xl border border-orange-500/20 bg-gradient-to-br from-orange-950/20 to-[#0c101a] space-y-3">
                  <div className="flex items-center gap-2 text-orange-400 font-semibold text-xs uppercase tracking-wider">
                    <Mail className="w-4 h-4" />
                    <span>{hp.sidebar.newsletterTitle || 'The Edge Letter'}</span>
                  </div>
                  <h4 className="font-display font-bold text-white text-base">
                    Zero-Cost Cloud & AI Weekly
                  </h4>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    {hp.sidebar.newsletterDesc ||
                      'Join 12,000+ developers receiving our production recipes every Thursday.'}
                  </p>
                  {newsletterSubscribed ? (
                    <div className="flex items-center gap-2 text-xs text-emerald-400 bg-emerald-950/30 p-2.5 rounded-lg border border-emerald-500/30">
                      <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                      <span>Subscribed! Check your inbox.</span>
                    </div>
                  ) : (
                    <form onSubmit={handleSubscribe} className="space-y-2">
                      <input
                        type="email"
                        required
                        value={newsletterEmail}
                        onChange={(e) => setNewsletterEmail(e.target.value)}
                        placeholder="Enter email address"
                        className="w-full px-3 py-2 text-xs rounded-lg border border-slate-800 bg-slate-900 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-orange-500"
                      />
                      <button
                        type="submit"
                        className="w-full py-2 px-3 text-xs font-semibold rounded-lg bg-orange-600 hover:bg-orange-500 text-white transition-colors"
                      >
                        Join 12,000+ Engineers
                      </button>
                    </form>
                  )}
                </div>
              )}
            </aside>
          )}
        </div>
      </section>
    );
  };

  // Section 6: Configurable Category Showcases (Section 3 of spec: "Category sections configurable from admin")
  const renderCategorySections = () => {
    if (!hp.categorySections || hp.categorySections.length === 0) return null;

    return (
      <div key="category_sections" className="space-y-16">
        {hp.categorySections.map((sec) => {
          const cat = categories.find((c) => c.id === sec.categoryId);
          if (!cat) return null;

          const catPosts = publishedPosts
            .filter((p) => p.categoryId === cat.id)
            .slice(0, sec.postLimit || 3);

          if (catPosts.length === 0) return null;

          return (
            <section key={sec.id} className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-800 mb-6 gap-2">
                <div className="flex items-center gap-2.5">
                  <span
                    className="w-3.5 h-3.5 rounded-full"
                    style={{ backgroundColor: cat.color }}
                  />
                  <div>
                    <h2 className="font-display text-xl sm:text-2xl font-bold text-white">
                      {sec.customTitle || `${cat.name} Spotlight`}
                    </h2>
                    {sec.customSubtitle && (
                      <p className="text-xs text-slate-400">{sec.customSubtitle}</p>
                    )}
                  </div>
                </div>

                <button
                  onClick={() => onNavigate(`/category/${cat.slug}`)}
                  className="text-xs font-semibold flex items-center gap-1 hover:underline text-slate-400 hover:text-white"
                >
                  <span>View all {cat.name} articles</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {catPosts.map((post) => (
                  <article
                    key={post.id}
                    onClick={() => onNavigate(`/${post.slug}`)}
                    className="group rounded-2xl border border-slate-800/80 bg-[#0a0e17] hover:border-slate-700 transition-all cursor-pointer overflow-hidden flex flex-col justify-between"
                  >
                    <div>
                      <div className="aspect-video w-full overflow-hidden border-b border-slate-800/60 bg-slate-950">
                        <img
                          src={post.featuredImage}
                          alt={post.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                      <div className="p-5 space-y-2">
                        <div className="flex items-center gap-2 text-xs text-slate-400">
                          <span>
                            {new Date(post.publishedAt || post.createdAt).toLocaleDateString(
                              'en-US',
                              { month: 'short', day: 'numeric' }
                            )}
                          </span>
                          <span>·</span>
                          <span>{post.readingTimeMinutes} min</span>
                        </div>
                        <h3 className="font-display text-base font-bold text-white group-hover:text-orange-400 transition-colors line-clamp-2">
                          {post.title}
                        </h3>
                        <p className="text-xs text-slate-400 line-clamp-2">
                          {post.excerpt}
                        </p>
                      </div>
                    </div>

                    <div className="p-5 pt-0 flex items-center justify-between text-xs text-slate-500 border-t border-slate-800/40 mt-3">
                      <span>Clean URL: /{post.slug}</span>
                      <span className="text-orange-400 flex items-center gap-1 font-medium">
                        <span>Read</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </span>
                    </div>
                  </article>
                ))}
              </div>
            </section>
          );
        })}
      </div>
    );
  };

  // Section 7: Full-Width Newsletter Area
  const renderNewsletterSection = () => {
    const nl = hp.newsletter;
    return (
      <section key="newsletter" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl border border-orange-500/30 bg-gradient-to-br from-orange-950/30 via-[#111726] to-[#0a0f1b] p-8 sm:p-12 shadow-2xl">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-7 space-y-4">
              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-orange-500/20 text-orange-400 border border-orange-500/30">
                {nl.badge || 'Weekly Technical Digest'}
              </span>

              <h2 className="font-display text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white">
                {nl.title}
              </h2>

              <p className="text-sm text-slate-300 leading-relaxed max-w-xl">
                {nl.description}
              </p>

              {/* Perks list */}
              {nl.perks && nl.perks.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-2">
                  {nl.perks.map((perk, i) => (
                    <div key={i} className="flex items-center gap-2 text-xs text-slate-200">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                      <span>{perk}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="lg:col-span-5">
              <div className="p-6 rounded-2xl border border-slate-800 bg-[#090d16] space-y-4">
                <span className="text-xs font-semibold text-slate-300 block">
                  {nl.subscriberCountText || 'Join 12,000+ engineers'}
                </span>

                {newsletterSubscribed ? (
                  <div className="p-4 rounded-xl bg-emerald-950/40 border border-emerald-500/30 text-emerald-300 text-xs">
                    You're registered! Look out for our welcome pack with FFmpeg scripts and prompt formulas.
                  </div>
                ) : (
                  <form onSubmit={handleSubscribe} className="space-y-3">
                    <input
                      type="email"
                      required
                      value={newsletterEmail}
                      onChange={(e) => setNewsletterEmail(e.target.value)}
                      placeholder="engineer@company.com"
                      className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-800 bg-slate-900 text-white placeholder-slate-500 focus:outline-none focus:border-orange-500"
                    />
                    <button
                      type="submit"
                      className="w-full py-3 rounded-xl bg-orange-600 hover:bg-orange-500 text-white text-xs font-bold shadow-md shadow-orange-600/30 transition-all active:scale-95"
                    >
                      {nl.buttonText || 'Subscribe Free'}
                    </button>
                    <span className="text-[11px] text-slate-500 block text-center">
                      Zero spam. One-click unsubscribe at any time.
                    </span>
                  </form>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  };

  // Render Section by SectionId according to configured order & visibility
  const renderSectionById = (id: HomepageSectionId) => {
    if (hp.sectionsEnabled && hp.sectionsEnabled[id] === false) {
      return null;
    }

    switch (id) {
      case 'hero':
        return renderHeroSection();
      case 'announcement':
        return renderAnnouncementSection();
      case 'trending':
        return renderTrendingSection();
      case 'featured_grid':
        return renderFeaturedGridSection();
      case 'latest_feed':
        return renderLatestFeedSection();
      case 'category_sections':
        return renderCategorySections();
      case 'newsletter':
        return renderNewsletterSection();
      default:
        return null;
    }
  };

  return (
    <div className="space-y-16 py-8">
      {hp.sectionsOrder.map((sectionId) => renderSectionById(sectionId))}
    </div>
  );
};
