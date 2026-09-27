import React, { useState, useEffect } from 'react';
import {
  Post,
  User,
  Category,
  SiteSettings,
  Comment,
} from '../../types/cms';
import { ContentBlockRenderer } from '../common/ContentBlockRenderer';
import {
  Calendar,
  Clock,
  Eye,
  Share2,
  Twitter,
  Linkedin,
  Facebook,
  Copy,
  Check,
  ChevronRight,
  ArrowLeft,
  ArrowRight,
  MessageSquare,
  Send,
  Sparkles,
  BookOpen,
} from 'lucide-react';

interface ArticleViewProps {
  post: Post;
  author: User;
  category: Category;
  allPosts: Post[];
  settings: SiteSettings;
  comments: Comment[];
  onAddComment: (comment: Omit<Comment, 'id' | 'createdAt' | 'isApproved'>) => void;
  onNavigate: (path: string) => void;
}

interface TocItem {
  id: string;
  text: string;
  level: number;
}

export const ArticleView: React.FC<ArticleViewProps> = ({
  post,
  author,
  category,
  allPosts,
  settings,
  comments,
  onAddComment,
  onNavigate,
}) => {
  const [copiedLink, setCopiedLink] = useState(false);
  const [activeTocId, setActiveTocId] = useState<string>('');
  const [tocItems, setTocItems] = useState<TocItem[]>([]);

  // Comment Form state
  const [commentName, setCommentName] = useState('');
  const [commentEmail, setCommentEmail] = useState('');
  const [commentContent, setCommentContent] = useState('');
  const [commentSubmitted, setCommentSubmitted] = useState(false);

  // Extract H2 and H3 headings from markdown content
  useEffect(() => {
    const items: TocItem[] = [];
    const lines = post.content.split('\n');

    lines.forEach((line) => {
      const h2Match = line.match(/^##\s+(.+)$/);
      if (h2Match) {
        const text = h2Match[1].trim();
        const id = text.toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-');
        items.push({ id, text, level: 2 });
      }
      const h3Match = line.match(/^###\s+(.+)$/);
      if (h3Match) {
        const text = h3Match[1].trim();
        const id = text.toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-');
        items.push({ id, text, level: 3 });
      }
    });

    setTocItems(items);
    if (items.length > 0) {
      setActiveTocId(items[0].id);
    }
  }, [post.content]);

  // Social Share handlers
  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleShareTwitter = () => {
    const url = encodeURIComponent(window.location.href);
    const text = encodeURIComponent(`${post.title} via @astroblogcms`);
    window.open(`https://twitter.com/intent/tweet?url=${url}&text=${text}`, '_blank');
  };

  const handleShareLinkedIn = () => {
    const url = encodeURIComponent(window.location.href);
    window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${url}`, '_blank');
  };

  const handleShareFacebook = () => {
    const url = encodeURIComponent(window.location.href);
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}`, '_blank');
  };

  // Previous and Next Posts
  const publishedList = allPosts.filter((p) => p.status === 'published');
  const currentIndex = publishedList.findIndex((p) => p.id === post.id);
  const prevPost = currentIndex > 0 ? publishedList[currentIndex - 1] : null;
  const nextPost = currentIndex < publishedList.length - 1 ? publishedList[currentIndex + 1] : null;

  // Related posts (same category or shared tags, excluding self)
  const relatedPosts = publishedList
    .filter((p) => p.id !== post.id)
    .map((p) => {
      let score = 0;
      if (p.categoryId === post.categoryId) score += 3;
      const sharedTags = p.tags?.filter((t) => post.tags?.includes(t)) || [];
      score += sharedTags.length * 2;
      return { post: p, score };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, 3)
    .map((item) => item.post);

  // In-article sponsor ad
  const inArticleAd = settings.adSlots?.find(
    (a) => a.location === 'in_article' && a.isEnabled
  );

  // Post comments
  const postComments = comments.filter((c) => c.postId === post.id && c.isApproved);

  const handleSubmitComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentName.trim() || !commentContent.trim()) return;

    onAddComment({
      postId: post.id,
      authorName: commentName.trim(),
      authorEmail: commentEmail.trim(),
      content: commentContent.trim(),
    });

    setCommentName('');
    setCommentEmail('');
    setCommentContent('');
    setCommentSubmitted(true);
    setTimeout(() => setCommentSubmitted(false), 5000);
  };

  // Render markdown text lines and inline blocks into styled HTML elements
  const renderedBlockIds = new Set<string>();

  const renderFormattedMarkdown = (content: string) => {
    renderedBlockIds.clear();
    const paragraphs = content.split('\n\n');

    return paragraphs.map((block, idx) => {
      const trimmed = block.trim();
      if (!trimmed) return null;

      // Inline Special Block Marker: <!-- block:blk-id -->
      const blockMatch = trimmed.match(/<!--\s*block:([a-zA-Z0-9_-]+)\s*-->/);
      if (blockMatch) {
        const blockId = blockMatch[1];
        const specialBlock = post.blocks?.find((b) => b.id === blockId);
        if (specialBlock) {
          renderedBlockIds.add(blockId);
          return (
            <div key={`inline-blk-${blockId}-${idx}`} className="my-8">
              <ContentBlockRenderer block={specialBlock} />
            </div>
          );
        }
      }

      // H2
      if (trimmed.startsWith('## ')) {
        const text = trimmed.replace('## ', '');
        const id = text.toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-');
        return (
          <h2
            key={idx}
            id={id}
            className="scroll-mt-24 font-display text-2xl sm:text-3xl font-bold text-white mt-10 mb-4 pb-2 border-b border-slate-800/60"
          >
            {text}
          </h2>
        );
      }

      // H3
      if (trimmed.startsWith('### ')) {
        const text = trimmed.replace('### ', '');
        const id = text.toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-');
        return (
          <h3
            key={idx}
            id={id}
            className="scroll-mt-24 font-display text-xl font-bold text-slate-100 mt-8 mb-3"
          >
            {text}
          </h3>
        );
      }

      // Numbered List
      if (trimmed.match(/^\d+\.\s+/)) {
        const lines = trimmed.split('\n');
        return (
          <ol key={idx} className="my-4 space-y-2 list-decimal list-inside text-slate-300 text-base leading-relaxed pl-2">
            {lines.map((l, lIdx) => {
              const text = l.replace(/^\d+\.\s+/, '');
              return (
                <li key={lIdx}>
                  <span className="font-semibold text-white">{text.split(':')[0]}:</span>
                  <span>{text.split(':').slice(1).join(':')}</span>
                </li>
              );
            })}
          </ol>
        );
      }

      // Bullet List
      if (trimmed.startsWith('- ')) {
        const lines = trimmed.split('\n');
        return (
          <ul key={idx} className="my-4 space-y-2 list-disc list-inside text-slate-300 text-base leading-relaxed pl-2">
            {lines.map((l, lIdx) => (
              <li key={lIdx}>{l.replace(/^- /, '')}</li>
            ))}
          </ul>
        );
      }

      // Regular Paragraph
      return (
        <p key={idx} className="my-4 text-base sm:text-lg text-slate-300 leading-relaxed font-sans">
          {trimmed}
        </p>
      );
    });
  };

  return (
    <article className="min-h-screen py-8">
      {/* 1. Breadcrumbs */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 mb-6">
        <nav className="flex items-center gap-2 text-xs text-slate-400">
          <button
            onClick={() => onNavigate('/')}
            className="hover:text-white transition-colors"
          >
            Home
          </button>
          <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
          <button
            onClick={() => onNavigate(`/category/${category.slug}`)}
            className="hover:text-white transition-colors font-medium"
            style={{ color: category.color }}
          >
            {category.name}
          </button>
          <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
          <span className="text-slate-500 truncate max-w-xs">{post.title}</span>
        </nav>
      </div>

      {/* 2. Article Header */}
      <header className="max-w-4xl mx-auto px-4 sm:px-6 mb-8 text-center sm:text-left">
        {/* Category & Read Time */}
        <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 text-xs text-slate-400 mb-4">
          <button
            onClick={() => onNavigate(`/category/${category.slug}`)}
            className="font-semibold px-2.5 py-1 rounded-md bg-slate-900 border border-slate-800 hover:border-slate-700 transition-colors"
            style={{ color: category.color }}
          >
            {category.name}
          </button>
          <span>·</span>
          <span className="flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-slate-500" />
            {new Date(post.publishedAt || post.createdAt).toLocaleDateString('en-US', {
              month: 'long',
              day: 'numeric',
              year: 'numeric',
            })}
          </span>
          <span>·</span>
          <span className="flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-slate-500" />
            {post.readingTimeMinutes} min read
          </span>
          <span>·</span>
          <span className="flex items-center gap-1.5">
            <Eye className="w-3.5 h-3.5 text-slate-500" />
            {post.views.toLocaleString()} views
          </span>
        </div>

        {/* Title */}
        <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight leading-[1.15] mb-4">
          {post.title}
        </h1>

        {/* Subtitle */}
        {post.subtitle && (
          <p className="text-xl sm:text-2xl text-slate-300 font-medium leading-relaxed mb-6">
            {post.subtitle}
          </p>
        )}

        {/* Excerpt */}
        {post.excerpt && (
          <p className="text-base sm:text-lg text-slate-400 leading-relaxed mb-6 font-normal">
            {post.excerpt}
          </p>
        )}

        {/* Author Bio Bar & Share Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-between py-4 border-y border-slate-800/80 gap-4">
          <div className="flex items-center gap-3.5">
            <img
              src={author.avatar}
              alt={author.name}
              className="w-11 h-11 rounded-full object-cover border border-slate-700"
            />
            <div>
              <div className="font-semibold text-sm text-white">{author.name}</div>
              <div className="text-xs text-slate-400">{author.title || author.role}</div>
            </div>
          </div>

          {/* Social Share Group */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400 mr-1 flex items-center gap-1">
              <Share2 className="w-3.5 h-3.5" />
              <span>Share:</span>
            </span>
            <button
              onClick={handleShareTwitter}
              className="p-2 rounded-lg bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-300 hover:text-white transition-colors"
              title="Share on X / Twitter"
            >
              <Twitter className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={handleShareLinkedIn}
              className="p-2 rounded-lg bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-300 hover:text-white transition-colors"
              title="Share on LinkedIn"
            >
              <Linkedin className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={handleShareFacebook}
              className="p-2 rounded-lg bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-300 hover:text-white transition-colors"
              title="Share on Facebook"
            >
              <Facebook className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={handleCopyLink}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-300 hover:text-white transition-colors text-xs"
              title="Copy URL to clipboard"
            >
              {copiedLink ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400 font-medium">Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy Link</span>
                </>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* 3. Featured Image */}
      {post.featuredImage && post.showFeaturedImageInPost !== false && (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 mb-10">
          <figure className="rounded-2xl overflow-hidden border border-slate-800 shadow-2xl bg-slate-950">
            <img
              src={post.featuredImage}
              alt={post.featuredImageAlt || post.title}
              className="w-full h-auto max-h-[540px] object-cover"
            />
            {(post.featuredImageCaption || post.featuredImageCredit) && (
              <figcaption className="p-3 text-center text-xs text-slate-400 bg-[#090d16] border-t border-slate-800/80 flex items-center justify-center gap-2">
                {post.featuredImageCaption && <span>{post.featuredImageCaption}</span>}
                {post.featuredImageCaption && post.featuredImageCredit && (
                  <span className="text-slate-600">·</span>
                )}
                {post.featuredImageCredit && (
                  <span className="text-slate-500 italic">Photo: {post.featuredImageCredit}</span>
                )}
              </figcaption>
            )}
          </figure>
        </div>
      )}

      {/* 4. Article Layout with Automatic Table of Contents */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Main Content Column */}
          <div className="lg:col-span-8">
            {/* Automatic TOC on Mobile if present */}
            {tocItems.length > 0 && (
              <div className="lg:hidden mb-8 p-4 rounded-xl border border-slate-800 bg-[#0b101c]">
                <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-300 mb-3">
                  <BookOpen className="w-4 h-4 text-orange-400" />
                  <span>Table of Contents</span>
                </div>
                <ul className="space-y-1.5 text-sm">
                  {tocItems.map((item) => (
                    <li
                      key={item.id}
                      className={item.level === 3 ? 'pl-4' : ''}
                    >
                      <a
                        href={`#${item.id}`}
                        className="text-slate-300 hover:text-orange-400 transition-colors block py-0.5"
                      >
                        {item.text}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Markdown Text Rendering */}
            <div className="prose-content">
              {renderFormattedMarkdown(post.content)}
            </div>

            {/* In-Article Sponsor Ad */}
            {inArticleAd && inArticleAd.bannerImageUrl && (
              <div className="my-8 p-4 rounded-xl border border-slate-800 bg-[#080d17] text-center">
                <span className="block text-[10px] text-slate-500 uppercase tracking-widest mb-2 font-mono">
                  Sponsor Advertisement
                </span>
                <a
                  href={inArticleAd.bannerLinkUrl || '#'}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block overflow-hidden rounded-lg hover:opacity-95 transition-opacity"
                >
                  <img
                    src={inArticleAd.bannerImageUrl}
                    alt={inArticleAd.altText || 'Sponsor'}
                    className="w-full h-auto max-h-32 object-cover rounded-lg"
                  />
                </a>
              </div>
            )}

            {/* Any unplaced Rich CMS Special Blocks (if not already embedded inline) */}
            {post.blocks && post.blocks.filter((b) => !renderedBlockIds.has(b.id)).length > 0 && (
              <div className="mt-8 space-y-6">
                {post.blocks
                  .filter((b) => !renderedBlockIds.has(b.id))
                  .map((block) => (
                    <ContentBlockRenderer key={block.id} block={block} />
                  ))}
              </div>
            )}

            {/* Tags List */}
            {post.tags && post.tags.length > 0 && (
              <div className="mt-12 pt-6 border-t border-slate-800">
                <div className="flex items-center gap-2 text-xs text-slate-400 mb-3">
                  <Sparkles className="w-3.5 h-3.5 text-orange-400" />
                  <span className="uppercase tracking-wider font-semibold">Tags:</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {post.tags.map((tag) => (
                    <button
                      key={tag}
                      onClick={() => onNavigate(`/tag/${tag}`)}
                      className="px-3 py-1 text-xs rounded-lg border border-slate-800 bg-slate-900/60 hover:bg-slate-800 hover:text-white text-slate-300 transition-colors"
                    >
                      #{tag}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Author Box Full Card */}
            <div className="mt-12 p-6 rounded-2xl border border-slate-800 bg-slate-900/30 flex flex-col sm:flex-row items-center sm:items-start gap-5">
              <img
                src={author.avatar}
                alt={author.name}
                className="w-16 h-16 rounded-full object-cover border-2 border-slate-700 flex-shrink-0"
              />
              <div className="text-center sm:text-left">
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-1">
                  <h3 className="font-display text-lg font-bold text-white">
                    Written by {author.name}
                  </h3>
                  <span className="px-2 py-0.5 text-[10px] rounded bg-orange-950/40 border border-orange-500/30 text-orange-300 font-mono w-max mx-auto sm:mx-0">
                    {author.role}
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed mb-3">
                  {author.bio ||
                    'Contributing author specializing in modern web frameworks, Cloudflare edge compute, and machine learning publishing.'}
                </p>
                <div className="flex items-center justify-center sm:justify-start gap-3 text-xs text-slate-400">
                  {author.twitter && (
                    <a
                      href={author.twitter}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:text-white flex items-center gap-1 transition-colors"
                    >
                      <Twitter className="w-3.5 h-3.5" />
                      <span>Twitter / X</span>
                    </a>
                  )}
                  {author.github && (
                    <a
                      href={author.github}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:text-white flex items-center gap-1 transition-colors"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>GitHub</span>
                    </a>
                  )}
                </div>
              </div>
            </div>

            {/* Previous and Next Article Navigation */}
            <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 gap-4 pt-6 border-t border-slate-800">
              {prevPost ? (
                <button
                  onClick={() => onNavigate(`/${prevPost.slug}`)}
                  className="p-4 rounded-xl border border-slate-800 bg-slate-900/40 hover:bg-slate-800/60 text-left transition-colors group"
                >
                  <div className="flex items-center gap-1 text-xs text-slate-400 mb-1">
                    <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-1 transition-transform" />
                    <span>Previous Article</span>
                  </div>
                  <h4 className="font-medium text-sm text-slate-200 line-clamp-2 group-hover:text-white">
                    {prevPost.title}
                  </h4>
                </button>
              ) : (
                <div />
              )}

              {nextPost ? (
                <button
                  onClick={() => onNavigate(`/${nextPost.slug}`)}
                  className="p-4 rounded-xl border border-slate-800 bg-slate-900/40 hover:bg-slate-800/60 text-right transition-colors group"
                >
                  <div className="flex items-center justify-end gap-1 text-xs text-slate-400 mb-1">
                    <span>Next Article</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </div>
                  <h4 className="font-medium text-sm text-slate-200 line-clamp-2 group-hover:text-white">
                    {nextPost.title}
                  </h4>
                </button>
              ) : (
                <div />
              )}
            </div>

            {/* 5. Comments Section */}
            {settings.commentsEnabled && post.allowComments !== false && (
              <section className="mt-14 pt-8 border-t border-slate-800">
                <div className="flex items-center gap-2 mb-6">
                  <MessageSquare className="w-5 h-5 text-orange-400" />
                  <h3 className="font-display text-xl font-bold text-white">
                    Discussion ({postComments.length})
                  </h3>
                </div>

                {/* Comment Form */}
                <form
                  onSubmit={handleSubmitComment}
                  className="mb-8 p-5 rounded-2xl border border-slate-800 bg-[#090d16] space-y-4"
                >
                  <h4 className="text-sm font-semibold text-white">Leave a Comment</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <input
                      type="text"
                      required
                      placeholder="Your Name *"
                      value={commentName}
                      onChange={(e) => setCommentName(e.target.value)}
                      className="px-3 py-2 text-xs rounded-lg border border-slate-800 bg-slate-900 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-orange-500"
                    />
                    <input
                      type="email"
                      placeholder="Your Email (kept private)"
                      value={commentEmail}
                      onChange={(e) => setCommentEmail(e.target.value)}
                      className="px-3 py-2 text-xs rounded-lg border border-slate-800 bg-slate-900 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-orange-500"
                    />
                  </div>
                  <textarea
                    rows={3}
                    required
                    placeholder="Share your technical perspective, code questions, or experience..."
                    value={commentContent}
                    onChange={(e) => setCommentContent(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-800 bg-slate-900 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-orange-500 resize-none"
                  />
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] text-slate-500">
                      {settings.commentsRequireApproval
                        ? 'Comments are reviewed prior to publication.'
                        : 'Instant publishing enabled.'}
                    </span>
                    <button
                      type="submit"
                      className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-orange-600 hover:bg-orange-500 text-white font-medium text-xs transition-colors"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>Post Comment</span>
                    </button>
                  </div>
                  {commentSubmitted && (
                    <div className="p-3 rounded-lg bg-emerald-950/30 border border-emerald-500/30 text-emerald-300 text-xs">
                      Thank you! Your comment has been submitted and is pending moderation.
                    </div>
                  )}
                </form>

                {/* Comments List */}
                <div className="space-y-4">
                  {postComments.length === 0 ? (
                    <p className="text-xs text-slate-500 italic">
                      No comments yet. Be the first to start the discussion!
                    </p>
                  ) : (
                    postComments.map((com) => (
                      <div
                        key={com.id}
                        className="p-4 rounded-xl border border-slate-800/80 bg-slate-900/30 space-y-1.5"
                      >
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-semibold text-white">{com.authorName}</span>
                          <span className="text-slate-500">
                            {new Date(com.createdAt).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric',
                            })}
                          </span>
                        </div>
                        <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                          {com.content}
                        </p>
                      </div>
                    ))
                  )}
                </div>
              </section>
            )}
          </div>

          {/* Sticky Sidebar: Desktop Table of Contents & Related Posts */}
          <aside className="hidden lg:block lg:col-span-4 space-y-8">
            <div className="sticky top-24 space-y-8">
              {/* Dynamic Table of Contents */}
              {tocItems.length > 0 && (
                <div className="p-5 rounded-2xl border border-slate-800 bg-[#080d17]">
                  <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-300 mb-4 pb-2 border-b border-slate-800">
                    <BookOpen className="w-4 h-4 text-orange-400" />
                    <span>Table of Contents</span>
                  </div>
                  <nav className="space-y-2 text-xs">
                    {tocItems.map((item) => (
                      <a
                        key={item.id}
                        href={`#${item.id}`}
                        onClick={() => setActiveTocId(item.id)}
                        className={`block transition-colors leading-normal ${
                          item.level === 3 ? 'pl-3 text-slate-400' : 'font-medium text-slate-300'
                        } hover:text-orange-400`}
                      >
                        {item.text}
                      </a>
                    ))}
                  </nav>
                </div>
              )}

              {/* Related Posts */}
              {relatedPosts.length > 0 && (
                <div className="p-5 rounded-2xl border border-slate-800 bg-[#080d17]">
                  <div className="text-xs font-bold uppercase tracking-wider text-slate-300 mb-4 pb-2 border-b border-slate-800">
                    Related Articles
                  </div>
                  <div className="space-y-4">
                    {relatedPosts.map((rel) => (
                      <button
                        key={rel.id}
                        onClick={() => onNavigate(`/${rel.slug}`)}
                        className="w-full text-left group flex gap-3"
                      >
                        {rel.featuredImage && (
                          <img
                            src={rel.featuredImage}
                            alt={rel.title}
                            className="w-16 h-12 rounded-lg object-cover flex-shrink-0 border border-slate-800"
                          />
                        )}
                        <div>
                          <h5 className="text-xs font-semibold text-slate-200 group-hover:text-orange-400 line-clamp-2 transition-colors">
                            {rel.title}
                          </h5>
                          <span className="text-[10px] text-slate-500 mt-1 block">
                            {rel.readingTimeMinutes} min read
                          </span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </aside>
        </div>
      </div>
    </article>
  );
};
