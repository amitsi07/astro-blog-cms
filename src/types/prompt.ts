export type AIModel = 
  | 'Midjourney v6'
  | 'Gemini / Imagen 3'
  | 'ChatGPT / DALL·E 3'
  | 'Flux.1'
  | 'Stable Diffusion XL';

export type AspectRatio = '1:1' | '16:9' | '9:16' | '4:3' | '3:4' | '4:5';

export type PostStatus = 'draft' | 'published' | 'scheduled';

export type PostType = 'prompt' | 'article' | 'page';

export interface PromptVariable {
  name: string;
  token: string;
  defaultValue: string;
  options?: string[];
}

export interface PromptSettings {
  stylize?: string;
  cfgScale?: string;
  lighting?: string;
  lens?: string;
  sampler?: string;
}

export interface SEOSettings {
  metaTitle: string;
  metaDescription: string;
  focusKeyword: string;
  canonicalUrl?: string;
  ogImage?: string;
}

// Block Editor Types
export type EditorBlockType = 
  | 'paragraph'
  | 'heading'
  | 'image'
  | 'gallery'
  | 'video'
  | 'audio'
  | 'quote'
  | 'list'
  | 'buttons'
  | 'columns'
  | 'table'
  | 'code'
  | 'html'
  | 'embed'
  | 'divider'
  | 'spacer'
  | 'callout'
  | 'faq';

export interface EditorBlock {
  id: string;
  type: EditorBlockType;
  // Dynamic fields depending on block type
  content?: string; // markdown or text
  level?: 1 | 2 | 3 | 4 | 5 | 6; // for heading
  url?: string; // for image, video, audio, embed
  alt?: string; // for image
  caption?: string; // for image, video
  images?: { url: string; caption?: string }[]; // for gallery
  galleryCols?: 2 | 3 | 4;
  quoteAuthor?: string;
  quoteCitation?: string;
  listType?: 'bullet' | 'ordered' | 'check';
  listItems?: string[];
  buttons?: { text: string; url: string; variant?: 'primary' | 'secondary' | 'outline' }[];
  columns?: { title?: string; content: string }[];
  tableHeaders?: string[];
  tableRows?: string[][];
  codeLanguage?: string;
  calloutType?: 'info' | 'warning' | 'tip' | 'danger';
  calloutTitle?: string;
  faqItems?: { question: string; answer: string }[];
  spacerHeight?: number; // in px
}

export interface PostItem {
  id: string;
  title: string;
  slug: string;
  type: PostType;
  status: PostStatus;
  excerpt: string;
  content: string; // Markdown or rich HTML body with Gutenberg blocks
  blocks?: EditorBlock[]; // Visual block structure
  model?: AIModel;
  category: string;
  image: string;
  aspectRatio?: AspectRatio;
  prompt?: string;
  negativePrompt?: string;
  tags: string[];
  settings?: PromptSettings;
  variables?: PromptVariable[];
  seo: SEOSettings;
  author: string;
  authorAvatar?: string;
  copiesCount: number;
  likesCount: number;
  viewsCount: number;
  featured?: boolean;
  createdAt: string;
  updatedAt: string;
  publishedAt?: string;
}

export interface PageItem {
  id: string;
  title: string;
  slug: string;
  content: string;
  status: PostStatus;
  updatedAt: string;
}

export interface CategoryItem {
  id: string;
  name: string;
  slug: string;
  description: string;
  icon?: string;
  count?: number;
}

export interface MediaItem {
  id: string;
  name: string;
  url: string;
  size: string;
  dimensions: string;
  mimeType: string;
  uploadedAt: string;
}

export interface MenuItem {
  id: string;
  label: string;
  url: string;
  target?: '_self' | '_blank';
}

export interface CommentItem {
  id: string;
  postId: string;
  postTitle: string;
  authorName: string;
  authorEmail: string;
  content: string;
  status: 'approved' | 'pending' | 'spam';
  createdAt: string;
}

export interface DeploymentLog {
  id: string;
  timestamp: string;
  triggerEvent: string;
  status: 'building' | 'success' | 'failed';
  hookUrl: string;
  durationMs?: number;
  responseStatus?: number;
  message: string;
}

export interface WebhookConfig {
  cloudflareDeployHookUrl: string;
  autoDeployOnPublish: boolean;
  githubRepo: string;
  githubBranch: string;
  githubToken: string;
  environment: 'production' | 'preview';
}

// Every section of the site is customizable from CMS:
export interface HeroSectionConfig {
  kicker: string;
  title: string;
  subtitle: string;
  searchPlaceholder: string;
  trendingTags: string[];
  proofText: string;
}

export interface FeaturedSectionConfig {
  enabled: boolean;
  title: string;
  subtitle: string;
  badge: string;
}

export interface FaqItem {
  id: string;
  question: string;
  answer: string;
}

export interface FaqSectionConfig {
  enabled: boolean;
  title: string;
  subtitle: string;
  badge: string;
  items: FaqItem[];
}

export interface CtaSectionConfig {
  enabled: boolean;
  badge: string;
  title: string;
  subtitle: string;
  buttonText: string;
  buttonLink: string;
  secondaryButtonText: string;
}

export interface FooterSectionConfig {
  brandName: string;
  bio: string;
  copyrightText: string;
  links: { label: string; url: string }[];
  socialTwitter: string;
  socialDiscord: string;
  socialGithub: string;
  socialYoutube: string;
}

export interface SiteCustomizerSettings {
  siteTitle: string;
  tagline: string;
  brandColor: string;
  logoUrl?: string;
  faviconUrl?: string;
  headerNotice: string;
  headerNoticeLink?: string;
  headerNoticeEnabled: boolean;
  headerMenuItems: MenuItem[];
  hero: HeroSectionConfig;
  featuredSection: FeaturedSectionConfig;
  faqSection: FaqSectionConfig;
  ctaSection: CtaSectionConfig;
  footer: FooterSectionConfig;
  postsPerPage: number;
  enablePromptBuilder: boolean;
  containerMaxWidth: 'max-w-6xl' | 'max-w-7xl' | 'max-w-screen-2xl';
}

export type SortOption = 'trending' | 'newest' | 'most_copied' | 'popular';
export type PromptItem = PostItem;
