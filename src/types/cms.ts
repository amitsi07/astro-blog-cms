/**
 * Astro Blog CMS - Core Type Definitions
 * Based on Project Requirements & Development Specification
 */

export type UserRole = 'Super Admin' | 'Admin' | 'Editor' | 'Author' | 'Contributor';

export interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
  role: UserRole;
  bio?: string;
  title?: string;
  twitter?: string;
  github?: string;
  createdAt: string;
}

export type PostStatus = 'published' | 'draft' | 'scheduled' | 'unpublished' | 'trash';

export type SpecialBlockType =
  | 'image'
  | 'divider'
  | 'prompt'
  | 'code'
  | 'info'
  | 'warning'
  | 'important'
  | 'tip'
  | 'cta'
  | 'pros_cons'
  | 'takeaways'
  | 'table'
  | 'faq'
  | 'toc';

export interface ImageBlock {
  type: 'image';
  id: string;
  url: string;
  alt?: string;
  caption?: string;
  credit?: string;
  layout?: 'standard' | 'wide' | 'full';
}

export interface DividerBlock {
  type: 'divider';
  id: string;
  style?: 'solid' | 'dashed' | 'dots' | 'gradient';
}

export interface PromptBlock {
  type: 'prompt';
  id: string;
  promptText: string;
  modelTarget?: string; // e.g. "Claude 3.7", "Gemini 2.5 Pro", "Midjourney v6"
  notes?: string;
}

export interface CodeBlock {
  type: 'code';
  id: string;
  code: string;
  language: string;
  filename?: string;
}

export interface CalloutBlock {
  type: 'info' | 'warning' | 'important' | 'tip';
  id: string;
  title?: string;
  content: string;
}

export interface CtaBlock {
  type: 'cta';
  id: string;
  title: string;
  description: string;
  buttonText: string;
  buttonUrl: string;
}

export interface ProsConsBlock {
  type: 'pros_cons';
  id: string;
  pros: string[];
  cons: string[];
}

export interface TakeawaysBlock {
  type: 'takeaways';
  id: string;
  title: string;
  items: string[];
}

export interface TableBlock {
  type: 'table';
  id: string;
  headers: string[];
  rows: string[][];
  caption?: string;
}

export interface FaqItem {
  id: string;
  question: string;
  answer: string;
}

export interface FaqBlock {
  type: 'faq';
  id: string;
  items: FaqItem[];
}

export interface TocBlock {
  type: 'toc';
  id: string;
  title?: string;
}

export type SpecialContentBlock =
  | ImageBlock
  | DividerBlock
  | PromptBlock
  | CodeBlock
  | CalloutBlock
  | CtaBlock
  | ProsConsBlock
  | TakeawaysBlock
  | TableBlock
  | FaqBlock
  | TocBlock;

export interface PostRevision {
  id: string;
  timestamp: string;
  authorName: string;
  title: string;
  content: string;
  blocks: SpecialContentBlock[];
  note?: string;
}

export interface PostSeo {
  seoTitle?: string;
  metaDescription?: string;
  focusKeyword?: string;
  secondaryKeywords?: string[];
  canonicalUrl?: string;
  robotsIndex: boolean;
  robotsFollow: boolean;
  ogImage?: string;
}

export interface Post {
  id: string;
  title: string;
  subtitle?: string;
  slug: string; // Clean URL: /article-slug (category is NOT in URL)
  excerpt: string;
  content: string; // Markdown/HTML body
  blocks: SpecialContentBlock[]; // Rich CMS blocks
  featuredImage: string;
  featuredImageCaption?: string;
  featuredImageAlt?: string;
  featuredImageCredit?: string;
  showFeaturedImageInPost?: boolean;
  status: PostStatus;
  authorId: string;
  categoryId: string;
  tags: string[];
  faqs?: FaqItem[];
  seo: PostSeo;
  isFeatured?: boolean;
  isTrending?: boolean;
  isSticky?: boolean;
  allowComments?: boolean;
  views: number;
  likesCount?: number;
  readingTimeMinutes: number;
  publishedAt?: string;
  scheduledAt?: string;
  createdAt: string;
  updatedAt: string;
  revisions?: PostRevision[];
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  color: string;
  icon?: string;
  seoTitle?: string;
  metaDescription?: string;
}

export interface Tag {
  id: string;
  name: string;
  slug: string;
}

export interface MediaItem {
  id: string;
  title: string;
  url: string;
  altText: string;
  caption?: string;
  mimeType: string;
  sizeBytes: number;
  dimensions?: string;
  uploadedAt: string;
}

export interface StaticPage {
  id: string;
  title: string;
  slug: string; // /about, /contact, etc.
  content: string;
  seoTitle?: string;
  metaDescription?: string;
  isPublished: boolean;
  updatedAt: string;
}

export interface MenuItem {
  id: string;
  label: string;
  url: string;
  targetNewTab?: boolean;
  order: number;
}

export interface AdSlot {
  id: string;
  name: string;
  location: 'header_banner' | 'in_article' | 'sidebar' | 'footer_banner';
  isEnabled: boolean;
  codeHtml?: string;
  bannerImageUrl?: string;
  bannerLinkUrl?: string;
  altText?: string;
}

export type HomepageSectionId =
  | 'hero'
  | 'announcement'
  | 'trending'
  | 'featured_grid'
  | 'latest_feed'
  | 'category_sections'
  | 'newsletter';

export interface HomepageCategorySection {
  id: string;
  categoryId: string;
  customTitle?: string;
  customSubtitle?: string;
  postLimit: number;
}

export interface HomepageConfig {
  sectionsOrder: HomepageSectionId[];
  sectionsEnabled: Record<HomepageSectionId, boolean>;
  hero: {
    type: 'featured_post' | 'custom';
    selectedPostId?: string; // 'auto' or specific post id
    badgeText: string;
    customHeadline?: string;
    customSubheadline?: string;
    customCtaText?: string;
    customCtaUrl?: string;
    customImageUrl?: string;
    customImageCaption?: string;
  };
  announcement: {
    enabled: boolean;
    badge: string;
    title: string;
    description: string;
    buttonText: string;
    buttonAction: 'open_spec' | 'navigate';
    buttonUrl?: string;
  };
  trending: {
    title: string;
    subtitle?: string;
    postLimit: number;
  };
  featuredGrid: {
    title: string;
    subtitle?: string;
    postLimit: number;
  };
  latestFeed: {
    title: string;
    subtitle?: string;
    showCategoryTabs: boolean;
  };
  categorySections: HomepageCategorySection[];
  newsletter: {
    badge: string;
    title: string;
    description: string;
    buttonText: string;
    subscriberCountText: string;
    perks: string[];
  };
  sidebar: {
    enabled: boolean;
    showAuthorSpotlight: boolean;
    authorSpotlightTitle: string;
    showTags: boolean;
    tagsTitle: string;
    showNewsletter: boolean;
    newsletterTitle: string;
    newsletterDesc: string;
  };
}

export interface SiteTypography {
  presetId: string;
  presetName: string;
  displayFont: string;
  bodyFont: string;
  monoFont: string;
}

export interface SiteSettings {
  siteName: string;
  tagline: string;
  description: string;
  logoUrl?: string;
  faviconUrl?: string;
  typography?: SiteTypography;
  authorDefaultId: string;
  postsPerPage: number;
  commentsEnabled: boolean;
  commentsRequireApproval: boolean;
  homepage: HomepageConfig;
  socialLinks: {
    twitter?: string;
    github?: string;
    youtube?: string;
    linkedin?: string;
  };
  defaultSeo: {
    metaTitle: string;
    metaDescription: string;
    ogImage: string;
  };
  customCodeHeader?: string;
  customCodeFooter?: string;
  adSlots: AdSlot[];
}

export interface Comment {
  id: string;
  postId: string;
  authorName: string;
  authorEmail: string;
  content: string;
  createdAt: string;
  isApproved: boolean;
}

export interface ActivityLog {
  id: string;
  userId: string;
  userName: string;
  userRole: UserRole;
  action: string;
  details: string;
  timestamp: string;
}

export interface RedirectRule {
  id: string;
  fromPath: string;
  toPath: string;
  type: 301 | 302;
  hits: number;
  createdAt: string;
}
