import {
  User,
  Category,
  Tag,
  Post,
  MediaItem,
  StaticPage,
  MenuItem,
  SiteSettings,
  ActivityLog,
  Comment,
  RedirectRule,
} from '../types/cms';

export const INITIAL_USERS: User[] = [
  {
    id: 'user-superadmin',
    name: 'Alex Thorne',
    email: 'alex.thorne@astroblog.dev',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=240&h=240&q=80',
    role: 'Super Admin',
    title: 'Lead Architect & Systems Engineer',
    bio: 'Systems engineer obsessed with Astro, edge compute, and sub-100ms first-contentful-paint architectures.',
    twitter: 'https://x.com/alexthorne_dev',
    github: 'https://github.com/alexthorne',
    createdAt: '2026-01-15T10:00:00Z',
  },
  {
    id: 'user-admin',
    name: 'Maya Lin',
    email: 'maya.lin@astroblog.dev',
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=240&h=240&q=80',
    role: 'Admin',
    title: 'Senior Content Strategist & Technical Editor',
    bio: 'Editorial director and digital product lead. Writing about the convergence of machine intelligence and modern publishing.',
    twitter: 'https://x.com/mayalin_writes',
    github: 'https://github.com/mayalin',
    createdAt: '2026-02-01T11:20:00Z',
  },
  {
    id: 'user-editor',
    name: 'Julian Ross',
    email: 'julian.ross@astroblog.dev',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=240&h=240&q=80',
    role: 'Editor',
    title: 'Managing Editor',
    bio: 'Specialist in search engine optimization, content verification, and technical copy review.',
    createdAt: '2026-03-05T09:15:00Z',
  },
  {
    id: 'user-author',
    name: 'Priya Sharma',
    email: 'priya.sharma@astroblog.dev',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=240&h=240&q=80',
    role: 'Author',
    title: 'Full-Stack & AI Pipeline Engineer',
    bio: 'Building automated video workflows, generative prompts, and Cloudflare edge microservices.',
    twitter: 'https://x.com/priyasharma_ai',
    createdAt: '2026-04-10T14:45:00Z',
  },
  {
    id: 'user-contributor',
    name: 'David Kim',
    email: 'david.kim@astroblog.dev',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=240&h=240&q=80',
    role: 'Contributor',
    title: 'Junior Technical Writer',
    bio: 'Passionate about open-source tooling, web standards, and developer productivity hacks.',
    createdAt: '2026-05-18T16:00:00Z',
  },
];

export const INITIAL_CATEGORIES: Category[] = [
  {
    id: 'cat-technology',
    name: 'Technology & AI',
    slug: 'technology',
    description: 'Generative AI workflows, automation pipelines, video generation, and machine learning utilities.',
    color: '#6366f1',
    seoTitle: 'Technology & Artificial Intelligence Articles - Astro Blog CMS',
    metaDescription: 'Explore deep-dive guides on AI content creation, automated pipelines, and modern developer toolchains.',
  },
  {
    id: 'cat-architecture',
    name: 'Web Architecture',
    slug: 'web-architecture',
    description: 'Serverless foundations, zero-JavaScript baselines, Astro island architecture, and CDN performance.',
    color: '#10b981',
    seoTitle: 'Modern Web Architecture & Astro Guides',
    metaDescription: 'In-depth architectural analyses on island hydration, caching layers, and high-performance publishing.',
  },
  {
    id: 'cat-cloudflare',
    name: 'Cloudflare & Edge',
    slug: 'cloudflare-edge',
    description: 'Zero-cost infrastructure, Cloudflare D1 SQL, R2 media distribution, and Edge Workers.',
    color: '#f59e0b',
    seoTitle: 'Cloudflare D1 & Edge Computing Guides',
    metaDescription: 'Deploy scalable, zero-cost production web applications using Cloudflare Workers, Pages, and D1.',
  },
  {
    id: 'cat-workflows',
    name: 'Developer Workflows',
    slug: 'workflows',
    description: 'GitOps strategies, SEO automation, CMS pipelines, and production release checklists.',
    color: '#3b82f6',
    seoTitle: 'Developer Workflows & Publishing Automation',
    metaDescription: 'Actionable blueprints for technical content teams, automated deployments, and editorial governance.',
  },
];

export const INITIAL_TAGS: Tag[] = [
  { id: 'tag-ai', name: 'Artificial Intelligence', slug: 'artificial-intelligence' },
  { id: 'tag-reels', name: 'Facebook Reels', slug: 'facebook-reels' },
  { id: 'tag-astro', name: 'Astro', slug: 'astro' },
  { id: 'tag-cloudflare', name: 'Cloudflare', slug: 'cloudflare' },
  { id: 'tag-d1', name: 'Cloudflare D1', slug: 'cloudflare-d1' },
  { id: 'tag-seo', name: 'SEO & Structured Data', slug: 'seo' },
  { id: 'tag-video', name: 'Video Automation', slug: 'video-automation' },
  { id: 'tag-prompt', name: 'Prompt Engineering', slug: 'prompt-engineering' },
  { id: 'tag-zero-cost', name: 'Zero Cost', slug: 'zero-cost' },
];

export const INITIAL_MEDIA: MediaItem[] = [
  {
    id: 'media-1',
    title: 'AI Video Reels Production Studio',
    url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&h=675&q=80',
    altText: 'Abstract generative visualization representing automated artificial intelligence video synthesis',
    caption: 'AI-driven visual pipeline for social video creation',
    mimeType: 'image/jpeg',
    sizeBytes: 348200,
    dimensions: '1200x675',
    uploadedAt: '2026-08-10T12:00:00Z',
  },
  {
    id: 'media-2',
    title: 'Global Edge Network Routing',
    url: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=1200&h=675&q=80',
    altText: 'Server racks and illuminated edge networking infrastructure',
    caption: 'Cloudflare global edge network delivering sub-50ms TTFB',
    mimeType: 'image/jpeg',
    sizeBytes: 412500,
    dimensions: '1200x675',
    uploadedAt: '2026-08-12T15:30:00Z',
  },
  {
    id: 'media-3',
    title: 'Astro Island Hydration Architecture',
    url: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=1200&h=675&q=80',
    altText: 'Clean digital code streams displaying zero-javascript island hydration',
    caption: 'Astro 5 islands rendering with selective client-side hydration',
    mimeType: 'image/jpeg',
    sizeBytes: 285400,
    dimensions: '1200x675',
    uploadedAt: '2026-08-14T09:40:00Z',
  },
  {
    id: 'media-4',
    title: 'Content Creator Workflow Dashboard',
    url: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1200&h=675&q=80',
    altText: 'Analytics and publishing metrics dashboard for digital content teams',
    caption: 'Unified publishing interface and performance tracking',
    mimeType: 'image/jpeg',
    sizeBytes: 390100,
    dimensions: '1200x675',
    uploadedAt: '2026-08-18T11:15:00Z',
  },
];

export const INITIAL_POSTS: Post[] = [
  {
    id: 'post-1',
    title: 'How to Create Facebook Reels with AI: Complete 2026 Production Blueprint',
    slug: 'how-to-create-facebook-reels-with-ai', // Category is NOT in URL as required
    excerpt: 'Step-by-step masterclass on automating viral 9:16 vertical short-form video creation using prompt chaining, text-to-speech, and zero-cost cloud rendering.',
    content: `Facebook Reels have evolved into one of Meta's primary organic discovery drivers. With algorithmic preference strongly favoring high-velocity 9:16 vertical content, creators who manually edit every clip are quickly outpaced by teams using structured AI workflows.

This guide walks through building an end-to-end automated pipeline: from semantic prompt scripting, neural voiceover synthesis, and dynamic caption generation to automated render pipelines.

<!-- block:blk-1 -->

## The Three-Stage AI Reels Generation Pipeline

To create consistent, high-performing Facebook Reels without incurring exorbitant SaaS costs, we structure our pipeline into three distinct phases:

1. **Script & Hook Generation**: Formulating curiosity gaps within the initial 1.8 seconds.
2. **Audio & Dynamic Pacing**: Generating expressive voiceovers with synchronized word timestamps.
3. **Visual Composition & Motion**: Combining b-roll, generative clips, and burn-in kinetic typography.

<!-- block:blk-2 -->

<!-- block:blk-3 -->

## Automating Vertical Render with Cloud Pipelines

To scale production without burning out, headless rendering scripts turn raw scripts into ready-to-publish MP4 video files automatically:

<!-- block:blk-4 -->

## Strategic Trade-offs & Production Economics

Scaling short-form video requires balancing automation velocity against creative authenticity:

<!-- block:blk-5 -->

## Tooling Matrix & Performance Comparison

<!-- block:blk-6 -->

<!-- block:blk-7 -->

## Frequently Asked Questions

<!-- block:blk-8 -->

<!-- block:blk-9 -->`,
    blocks: [
      {
        type: 'takeaways',
        id: 'blk-1',
        title: 'Executive Summary & Key Takeaways',
        items: [
          'The first 2.5 seconds dictate 84% of algorithmic retention on Facebook Reels.',
          'Open-source toolchains combined with Cloudflare Workers enable $0 automated video batching.',
          'Kinetic auto-captions increase muted watch time completion by up to 62%.',
          'A single high-retention reel can be repurposed across Meta, YouTube Shorts, and TikTok with zero modifications.',
        ],
      },
      {
        type: 'prompt',
        id: 'blk-2',
        promptText: `Act as a top 1% short-form video strategist for Facebook Reels. Write a viral 35-second script about: "3 Counter-Intuitive Habits of Elite Developers".
Follow this strict format:
[0-3s HOOK]: Visual action + provocative statement challenging standard advice.
[3-15s POINT 1]: Rapid explanation with concrete analogy.
[15-27s POINT 2 & 3]: The unexpected twist that creates comments.
[27-35s CTA]: Specific question prompting viewers to debate in comments.
Tone: Authoritative, energetic, zero fluff, punchy sentences under 8 words.`,
        modelTarget: 'Gemini 2.5 Pro / Claude 3.7 Sonnet',
        notes: 'Paste directly into your LLM orchestrator. Keep pacing at roughly 140 words per minute.',
      },
      {
        type: 'info',
        id: 'blk-3',
        title: 'Algorithmic Retention Insight',
        content: 'Facebook Reels algorithm heavily weights re-watch rates and comments. Creating an intentional point of discussion in the first 10 seconds boosts comment velocity, which signals high user engagement to Meta’s distribution engine.',
      },
      {
        type: 'code',
        id: 'blk-4',
        filename: 'generate_reel_ffmpeg.sh',
        language: 'bash',
        code: `# FFmpeg recipe: Scale 16:9 media to 9:16 with blurred ambient background & burned kinetic subtitles
ffmpeg -i input_clip.mp4 -filter_complex \\
"[0:v]scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920,boxblur=20:5[bg]; \\
 [0:v]scale=1080:1920:force_original_aspect_ratio=decrease[fg]; \\
 [bg][fg]overlay=(W-w)/2:(H-h)/2[composite]; \\
 [composite]subtitles=captions.srt:force_style='FontName=Montserrat,FontSize=18,PrimaryColour=&H00FFFFFF,OutlineColour=&H00000000,BorderStyle=3,Bold=1'[out]" \\
-map "[out]" -map 0:a? -c:v libx264 -preset fast -crf 20 -c:a aac -b:a 192k reel_output.mp4`,
      },
      {
        type: 'pros_cons',
        id: 'blk-5',
        pros: [
          'Publish 10x more volume with consistent 1080x1920 vertical quality',
          'Eliminates manual timeline editing and manual subtitling fatigue',
          'Enables A/B testing multiple hooks for the exact same underlying topic',
          'Extensible to programmatic publishing via Graph API',
        ],
        cons: [
          'Over-relying on generic AI templates can trigger duplicate content filters',
          'Requires initial setup of API keys and webhook orchestration',
          'Human review is still crucial to ensure brand safety and factual accuracy',
        ],
      },
      {
        type: 'table',
        id: 'blk-6',
        caption: 'Top AI Video Tools Benchmark for Facebook Reels (2026)',
        headers: ['Platform / Tool', 'Strengths', 'Ideal For', 'Free Tier Quota'],
        rows: [
          ['CapCut Desktop AI', 'Fast kinetic typography, auto-reframe', 'Quick manual polish & captions', 'Generous Free Tier'],
          ['FFmpeg + Whisper API', '100% headless automation, zero lock-in', 'Programmatic batch pipelines', 'Self-hosted / Open Source'],
          ['HeyGen / Synthesia', 'Hyper-realistic digital presenter avatars', 'Corporate & explainers', '1 min free credit'],
          ['Runway Gen-3 / Luma', 'Cinematic generative b-roll scenes', 'Visually arresting hooks', 'Free initial trials'],
        ],
      },
      {
        type: 'warning',
        id: 'blk-7',
        title: 'Meta Community Standards & Copyright Warning',
        content: 'Never use copyrighted audio tracks through third-party tools if you plan to monetize reels. Always utilize royalty-free sound effects or select official trending audio tracks inside the native Facebook app after uploading.',
      },
      {
        type: 'faq',
        id: 'blk-8',
        items: [
          {
            id: 'faq-1',
            question: 'What is the optimal video length for Facebook Reels in 2026?',
            answer: 'Data across millions of reels shows the sweet spot is between 25 and 45 seconds. While Meta supports up to 90 seconds, shorter punchy videos maintain a higher percentage of completion, which triggers algorithmic distribution.',
          },
          {
            id: 'faq-2',
            question: 'Will Facebook downrank videos with AI voiceovers?',
            answer: 'No. Meta does not penalize AI voiceovers as long as the content provides real value, avoids misleading claims, and adheres to originality guidelines. High quality, expressive voices perform just as well as human voice tracks.',
          },
          {
            id: 'faq-3',
            question: 'How do I add captions that highlight word-by-word?',
            answer: 'You can extract word-level timestamps using OpenAI Whisper with JSON output, then convert it to ASS (Advanced SubStation Alpha) subtitle format with karaoke tags (\\k), or use CapCut / AutoCap.',
          },
        ],
      },
      {
        type: 'cta',
        id: 'blk-9',
        title: 'Download the Production Prompt Pack',
        description: 'Get our curated collection of 50+ tested hook templates and video prompts designed specifically for algorithmic retention.',
        buttonText: 'Get the Free Prompt Pack',
        buttonUrl: '/contact?topic=prompts',
      },
    ],
    featuredImage: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&h=675&q=80',
    featuredImageCaption: 'Automated 9:16 generative reel rendering pipeline',
    featuredImageAlt: 'AI video generation and editing setup',
    status: 'published',
    authorId: 'user-author',
    categoryId: 'cat-technology',
    tags: ['artificial-intelligence', 'facebook-reels', 'video-automation', 'prompt-engineering'],
    faqs: [
      {
        id: 'f1',
        question: 'What is the optimal video length for Facebook Reels in 2026?',
        answer: 'Data across millions of reels shows the sweet spot is between 25 and 45 seconds.',
      },
      {
        id: 'f2',
        question: 'Will Facebook downrank videos with AI voiceovers?',
        answer: 'No, Meta does not penalize AI voiceovers as long as the content provides value.',
      },
    ],
    seo: {
      seoTitle: 'How to Create Facebook Reels with AI: 2026 Guide & Pipeline',
      metaDescription: 'Step-by-step guide to generating viral Facebook Reels using AI prompts, neural voiceovers, and automated FFmpeg video rendering.',
      focusKeyword: 'create facebook reels with ai',
      secondaryKeywords: ['facebook reels automation', 'ai video generation', 'viral reels prompt'],
      canonicalUrl: 'https://astroblog.dev/how-to-create-facebook-reels-with-ai',
      robotsIndex: true,
      robotsFollow: true,
    },
    isFeatured: true,
    isTrending: true,
    views: 14280,
    readingTimeMinutes: 7,
    publishedAt: '2026-09-18T09:00:00Z',
    createdAt: '2026-09-17T11:00:00Z',
    updatedAt: '2026-09-20T14:30:00Z',
  },
  {
    id: 'post-2',
    title: 'Zero-Cost Full-Stack Architecture: Astro + Cloudflare D1 + R2 Blueprint',
    slug: 'zero-cost-fullstack-astro-cloudflare-d1',
    excerpt: 'How we engineered a high-throughput CMS and public blog that handles millions of pageviews per month on Cloudflare’s free tier without paying a single dollar for servers.',
    content: `When designing the infrastructure for a high-volume digital publication, the default impulse is often to provision managed PostgreSQL databases, dedicated Redis clusters, and auto-scaling container fleets on AWS or GCP.

However, for 98% of content-driven websites, this is financial and architectural overkill. By combining Astro's static build optimization with Cloudflare Pages, D1 (edge SQLite), and R2 (S3-compatible asset storage), you can achieve enterprise-tier performance with exactly ₹0 / $0 monthly hosting expenses.

<!-- block:blk-cf-1 -->

## Why Astro + Cloudflare D1 is the Ultimate Pairing

Astro excels at generating ultra-fast HTML at build time, hydration islands for interactive components, and server endpoints for admin writes.

Cloudflare D1 is a serverless relational database built on SQLite distributed worldwide across Cloudflare's 300+ city edge network. Reads are near-instantaneous, and writes are managed through an Raft consensus protocol.

<!-- block:blk-cf-2 -->

<!-- block:blk-cf-3 -->

## Infrastructure Breakdown & Cost Modeling

<!-- block:blk-cf-4 -->

<!-- block:blk-cf-5 -->`,
    blocks: [
      {
        type: 'takeaways',
        id: 'blk-cf-1',
        title: 'Core Architectural Advantages',
        items: [
          'Astro pre-renders public articles as static HTML, serving them directly from Cloudflare global edge cache.',
          'CMS write operations interact with Cloudflare D1 via lightweight serverless edge endpoints.',
          'Media files (images, audio) reside on Cloudflare R2 with zero egress fees.',
          'Free-tier allowance includes 5 million read units/day on D1 and 10GB of R2 storage.',
        ],
      },
      {
        type: 'code',
        id: 'blk-cf-2',
        filename: 'schema.sql',
        language: 'sql',
        code: `-- Cloudflare D1 Production CMS Schema
CREATE TABLE IF NOT EXISTS posts (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  excerpt TEXT,
  content TEXT NOT NULL,
  blocks_json TEXT,
  featured_image TEXT,
  status TEXT DEFAULT 'draft',
  author_id TEXT NOT NULL,
  category_id TEXT NOT NULL,
  seo_json TEXT,
  views INTEGER DEFAULT 0,
  published_at DATETIME,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_posts_slug ON posts(slug);
CREATE INDEX idx_posts_status ON posts(status);
CREATE INDEX idx_posts_category ON posts(category_id);`,
      },
      {
        type: 'info',
        id: 'blk-cf-3',
        title: 'Cloudflare D1 Free Tier Quotas',
        content: 'Cloudflare D1 provides 5,000,000 read units per day and 100,000 write units per day on the completely free plan. Since public reads hit edge cache, only admin changes and search uncached misses touch D1, easily supporting 1M+ monthly visitors on free tiers.',
      },
      {
        type: 'table',
        id: 'blk-cf-4',
        caption: 'Zero-Cost Infrastructure Stack Breakdown',
        headers: ['Layer', 'Provider', 'Service', 'Cost at 1M Views'],
        rows: [
          ['Frontend & SSR', 'Cloudflare Pages', 'Astro Pages Adapter', '₹0 / $0'],
          ['Relational Database', 'Cloudflare', 'D1 (Serverless SQLite)', '₹0 / $0'],
          ['Media & Images', 'Cloudflare', 'R2 Storage (0 Egress Fees)', '₹0 / $0'],
          ['DNS, SSL & CDN', 'Cloudflare', 'Global Edge Network', '₹0 / $0'],
          ['Source Control & CI/CD', 'GitHub', 'GitHub Actions', '₹0 / $0'],
        ],
      },
      {
        type: 'tip',
        id: 'blk-cf-5',
        title: 'Pro-Tip: Cache Busting with Webhooks',
        content: 'When an editor clicks "Publish" in the CMS, invoke Cloudflare’s Purge Cache API for the specific article slug instead of purging everything. This guarantees 100% cache hits for the rest of your site.',
      },
    ],
    featuredImage: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=1200&h=675&q=80',
    featuredImageCaption: 'Global edge computing topology diagram',
    featuredImageAlt: 'Serverless Cloudflare edge network infrastructure',
    status: 'published',
    authorId: 'user-superadmin',
    categoryId: 'cat-cloudflare',
    tags: ['cloudflare', 'cloudflare-d1', 'astro', 'zero-cost'],
    seo: {
      seoTitle: 'Zero-Cost Full-Stack Architecture: Astro + Cloudflare D1',
      metaDescription: 'Complete technical architecture guide to launching a production blog on Cloudflare Pages, D1, and R2 with zero hosting expenses.',
      focusKeyword: 'astro cloudflare d1',
      secondaryKeywords: ['zero cost web architecture', 'serverless sqlite', 'cloudflare pages astro'],
      canonicalUrl: 'https://astroblog.dev/zero-cost-fullstack-astro-cloudflare-d1',
      robotsIndex: true,
      robotsFollow: true,
    },
    isFeatured: true,
    isTrending: true,
    views: 9840,
    readingTimeMinutes: 6,
    publishedAt: '2026-09-12T16:00:00Z',
    createdAt: '2026-09-10T14:00:00Z',
    updatedAt: '2026-09-19T10:00:00Z',
  },
  {
    id: 'post-3',
    title: 'Astro 5 Islands & Content Collections: Deep Dive into Zero-JS Baselines',
    slug: 'astro-5-islands-content-collections-deep-dive',
    excerpt: 'Explore how Astro 5 redefines editorial publishing with partial hydration, type-safe content schemas, and lighting-fast Lighthouse 100 scores.',
    content: `Modern web users demand immediate responsiveness. Yet the typical SPA blog loads multiple megabytes of JavaScript just to display static text and an image.

Astro 5 changes the game with its "Islands Architecture". By defaulting to pure server-rendered HTML and isolating client-side interactivity to designated islands, your core article content requires literally zero JavaScript.

## Understanding Island Hydration Directives

In Astro, every component is rendered to static HTML at build time or on the server edge. You only hydrate what requires interactivity using explicit client directives:

- \`client:load\`: Hydrates immediately on page load (use sparingly, e.g. for search bars).
- \`client:idle\`: Hydrates once the browser is idle (ideal for table of contents).
- \`client:visible\`: Hydrates when the element enters the viewport (perfect for comments & social share tools).
- \`client:media\`: Hydrates conditionally based on CSS media queries.`,
    blocks: [
      {
        type: 'takeaways',
        id: 'blk-as-1',
        title: 'Key Architectural Takeaways',
        items: [
          'Zero-JS baseline guarantees perfect 100/100 Google Core Web Vitals.',
          'Content Collections validate frontmatter and metadata with Zod schemas.',
          'Island hydration prevents whole-page JavaScript bloat.',
          'Seamless integration with React, Vue, Svelte, or Solid components in the same codebase.',
        ],
      },
      {
        type: 'code',
        id: 'blk-as-2',
        filename: 'src/content/config.ts',
        language: 'typescript',
        code: `import { defineCollection, z } from 'astro:content';

const blogCollection = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string().max(80),
    description: z.string().max(160),
    pubDate: z.date(),
    author: z.string(),
    category: z.string(),
    tags: z.array(z.string()),
    featuredImage: z.string().url(),
    isDraft: z.boolean().default(false),
  }),
});

export const collections = {
  blog: blogCollection,
};`,
      },
      {
        type: 'pros_cons',
        id: 'blk-as-3',
        pros: [
          'Instant First Contentful Paint (<0.2s) even on slow 3G mobile networks',
          'Strict compile-time schema validation prevents broken metadata',
          'Zero client-side bundle for pure typography & article reading',
        ],
        cons: [
          'Mental model shift for developers accustomed to full-page SPA routers',
          'Shared state between disconnected islands requires nanostores or custom events',
        ],
      },
    ],
    featuredImage: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=1200&h=675&q=80',
    featuredImageCaption: 'Astro 5 zero-javascript island architecture',
    featuredImageAlt: 'Code streams depicting clean server-rendered HTML',
    status: 'published',
    authorId: 'user-admin',
    categoryId: 'cat-architecture',
    tags: ['astro', 'web-architecture', 'seo'],
    seo: {
      seoTitle: 'Astro 5 Islands & Content Collections: Deep Dive',
      metaDescription: 'Comprehensive guide to Astro 5 architecture, island hydration, and building Lighthouse 100 websites.',
      focusKeyword: 'astro 5 islands',
      secondaryKeywords: ['astro content collections', 'zero js web architecture'],
      robotsIndex: true,
      robotsFollow: true,
    },
    isFeatured: false,
    isTrending: true,
    views: 6420,
    readingTimeMinutes: 5,
    publishedAt: '2026-09-05T10:00:00Z',
    createdAt: '2026-09-04T12:00:00Z',
    updatedAt: '2026-09-05T10:00:00Z',
  },
  {
    id: 'post-4',
    title: 'Prompt Engineering Playbook for High-Converting Social Shorts',
    slug: 'prompt-engineering-playbook-social-shorts',
    excerpt: 'Field-tested prompt chains to craft high-retention hooks, compelling visual beats, and viral retention loops across TikTok, Reels, and YouTube Shorts.',
    content: `Crafting high-converting short-form video scripts is no longer about guessing what works. It is about systematically engineering curiosity loops and emotional resonance into the script structure.

In this playbook, we break down our proprietary prompt formulas tested across 200+ viral short videos with verified retention analytics.`,
    blocks: [
      {
        type: 'prompt',
        id: 'blk-pe-1',
        promptText: `Act as a master viral scriptwriter. Analyze this core concept: [INSERT TOPIC].
Generate 5 distinct opening hooks using these specific psychological triggers:
1. The Absurd Contrast: "Everyone thinks X, but the top 1% secretly do Y..."
2. The Urgent Loss Aversion: "Stop doing X right now if you want to avoid..."
3. The Insider Leaked Secret: "A senior engineer at [Company] just showed me how..."
4. The Impossible Speed Challenge: "Here is how to do [Complex Task] in under 60 seconds..."
5. The Pattern Interrupt Question: "Why does nobody talk about this fatal mistake?"
For each hook, include the exact visual cue description for the editor.`,
        modelTarget: 'Claude 3.7 / Gemini 2.5 Flash',
        notes: 'Produces high-converting 3-second opening beats with specific camera cues.',
      },
      {
        type: 'tip',
        id: 'blk-pe-2',
        title: 'The "Two-Second Rule"',
        content: 'Viewers make a subconscious decision to swipe or stay within 1.8 to 2.2 seconds. Ensure the spoken hook begins at millisecond 0, accompanied by a dynamic visual change (zoom, text pop, or unexpected motion).',
      },
    ],
    featuredImage: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1200&h=675&q=80',
    featuredImageCaption: 'Analytics dashboard tracking retention curves across short-form platforms',
    featuredImageAlt: 'Data analytics charts showing audience retention metrics',
    status: 'published',
    authorId: 'user-author',
    categoryId: 'cat-technology',
    tags: ['prompt-engineering', 'artificial-intelligence', 'facebook-reels'],
    seo: {
      seoTitle: 'Prompt Engineering Playbook for High-Converting Social Shorts',
      metaDescription: 'Field-tested prompt formulas and hook architectures for TikTok, Facebook Reels, and YouTube Shorts.',
      focusKeyword: 'prompt engineering social shorts',
      robotsIndex: true,
      robotsFollow: true,
    },
    isFeatured: false,
    isTrending: false,
    views: 4190,
    readingTimeMinutes: 4,
    publishedAt: '2026-08-28T08:00:00Z',
    createdAt: '2026-08-27T10:00:00Z',
    updatedAt: '2026-08-28T08:00:00Z',
  },
  {
    id: 'post-5',
    title: 'Automated SEO Audit & Schema Generation with Astro SSR',
    slug: 'automated-seo-audit-schema-generation-astro',
    excerpt: 'How to dynamically inject valid Article, FAQPage, and BreadcrumbList JSON-LD schemas into Astro pages for maximum search visibility.',
    content: `Search engines are becoming increasingly reliant on structured data to parse content intent, rich snippets, and answer boxes in AI search overviews.

In this guide, we demonstrate how to build an automated schema engine inside Astro that reads your CMS posts and injects verified JSON-LD markup directly into the HTML head.`,
    blocks: [
      {
        type: 'info',
        id: 'blk-seo-1',
        title: 'Why Schema.org Matters in 2026',
        content: 'AI search engines (Google AI Overviews, Perplexity, Bing Copilot) utilize structured JSON-LD entities to synthesize answers. Valid structured schemas increase citation probability by over 300%.',
      },
      {
        type: 'code',
        id: 'blk-seo-2',
        filename: 'src/components/JsonLd.astro',
        language: 'html',
        code: `---
export interface Props {
  article: any;
  siteUrl: string;
}
const { article, siteUrl } = Astro.props;

const schema = {
  "@context": "https://schema.org",
  "@type": "BlogPosting",
  "headline": article.seo.seoTitle || article.title,
  "description": article.seo.metaDescription || article.excerpt,
  "image": article.featuredImage,
  "datePublished": article.publishedAt,
  "dateModified": article.updatedAt,
  "author": {
    "@type": "Person",
    "name": article.author.name
  },
  "publisher": {
    "@type": "Organization",
    "name": "Astro Blog CMS",
    "logo": {
      "@type": "ImageObject",
      "url": \`\${siteUrl}/logo.png\`
    }
  },
  "mainEntityOfPage": {
    "@type": "WebPage",
    "@id": \`\${siteUrl}/\${article.slug}\`
  }
};
---
<script type="application/ld+json" set:html={JSON.stringify(schema)} />`,
      },
    ],
    featuredImage: 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?auto=format&fit=crop&w=1200&h=675&q=80',
    featuredImageCaption: 'Search engine spider and semantic web entity indexing',
    featuredImageAlt: 'Abstract graphic representing structured data and search indexation',
    status: 'draft',
    authorId: 'user-editor',
    categoryId: 'cat-workflows',
    tags: ['seo', 'astro'],
    seo: {
      seoTitle: 'Automated SEO Audit & Schema Generation with Astro SSR',
      metaDescription: 'Learn how to generate Article, Breadcrumb, and FAQ JSON-LD schemas automatically in Astro.',
      robotsIndex: false,
      robotsFollow: true,
    },
    views: 0,
    readingTimeMinutes: 5,
    createdAt: '2026-09-22T14:00:00Z',
    updatedAt: '2026-09-23T11:20:00Z',
  },
];

export const INITIAL_PAGES: StaticPage[] = [
  {
    id: 'page-about',
    title: 'About Astro Blog CMS',
    slug: 'about',
    content: `## The Next-Generation Publishing Platform

Astro Blog CMS was engineered to solve a fundamental problem in modern web publishing: **the trade-off between editorial velocity and website performance**.

Traditional platforms like WordPress rely on heavy PHP servers, fragile plugins, and bloated database queries for every pageview. Conversely, headless JAMstack setups often force editors to edit raw markdown files or trigger slow 15-minute static rebuilds for a single typo fix.

### Our Architecture

We combine the best of both paradigms:

- **Lightning-Fast Astro Frontend**: Pure zero-JavaScript baseline by default with selective island hydration.
- **Full-Featured Headless CMS**: Built-in rich article editor, special blocks (AI prompts, code blocks, tables, callouts), media manager, and revision history.
- **Edge Data Persistence**: Powered by Cloudflare D1 distributed SQLite and R2 storage.
- **Zero-Cost Scaling**: Architected from the ground up to operate within generous free-tier quotas while effortlessly absorbing viral traffic spikes.

### The Team

We are a distributed group of software architects, content strategists, and performance obsessives committed to making the web faster, cleaner, and more accessible.`,
    seoTitle: 'About Us – Astro Blog CMS Publishing Architecture',
    metaDescription: 'Learn about Astro Blog CMS: the high-performance publishing platform powered by Astro, Cloudflare D1, and zero-cost edge infrastructure.',
    isPublished: true,
    updatedAt: '2026-09-15T10:00:00Z',
  },
  {
    id: 'page-contact',
    title: 'Contact Us',
    slug: 'contact',
    content: `## Get in Touch

Have questions about our publishing architecture, editorial submissions, or open-source tools? We’d love to hear from you.

### Editorial & Technical Inquiries
- **General Support**: editorial@astroblog.dev
- **Press & Partnerships**: partnerships@astroblog.dev
- **Security & Vulnerability Reports**: security@astroblog.dev

### Office & Hours
Our core team operates asynchronously across San Francisco, London, and Tokyo. We typically reply within 24 hours Monday through Friday.`,
    seoTitle: 'Contact Us – Astro Blog CMS',
    metaDescription: 'Reach out to the Astro Blog CMS team for editorial submissions, technical support, and architectural inquiries.',
    isPublished: true,
    updatedAt: '2026-09-15T10:00:00Z',
  },
  {
    id: 'page-privacy',
    title: 'Privacy Policy',
    slug: 'privacy-policy',
    content: `## Privacy Policy
*Effective Date: September 2026*

Your privacy is paramount. Astro Blog CMS operates under a strict privacy-first principle:

1. **No Invasive Trackers**: We do not use third-party behavioral trackers or sell personal browsing information to advertisers.
2. **Aggregated Analytics**: Performance metrics collected are anonymized and processed without storing personal identifiers or persistent cross-site cookies.
3. **Data Protection**: Any personal information provided through newsletter signups or contact forms is encrypted in transit and at rest.
4. **Your Rights**: You retain the right to inspect, correct, or request deletion of any submitted email addresses or user accounts at any time.`,
    seoTitle: 'Privacy Policy – Astro Blog CMS',
    metaDescription: 'Privacy policy and data protection principles for Astro Blog CMS.',
    isPublished: true,
    updatedAt: '2026-09-01T12:00:00Z',
  },
  {
    id: 'page-terms',
    title: 'Terms of Service',
    slug: 'terms',
    content: `## Terms of Service
*Effective Date: September 2026*

By accessing Astro Blog CMS and utilizing our website, public articles, or CMS services, you agree to these Terms of Service.

- **Content License**: All original technical tutorials, architecture diagrams, and prompt templates are published under standard attribution licenses unless explicitly designated otherwise.
- **Fair Use**: Code samples and FFmpeg scripts may be freely used in your personal and commercial software projects without attribution.
- **Disclaimer**: Content is provided "as is" for informational and educational purposes without warranty.`,
    seoTitle: 'Terms of Service – Astro Blog CMS',
    metaDescription: 'Terms of service and content usage guidelines for Astro Blog CMS.',
    isPublished: true,
    updatedAt: '2026-09-01T12:00:00Z',
  },
  {
    id: 'page-disclaimer',
    title: 'Disclaimer',
    slug: 'disclaimer',
    content: `## Disclaimer
*Effective Date: September 2026*

All tutorials, architectural guides, and software specifications on Astro Blog CMS reflect the opinions and testing methodologies of the respective authors.

- **Infrastructure Pricing**: Free tier quotas and cloud provider policies (Cloudflare, GitHub, AWS) are subject to change at the provider's discretion.
- **External Links**: We are not responsible for the contents or security practices of external third-party sites linked from our articles.`,
    seoTitle: 'Disclaimer – Astro Blog CMS',
    metaDescription: 'Editorial and infrastructure disclaimer for Astro Blog CMS.',
    isPublished: true,
    updatedAt: '2026-09-01T12:00:00Z',
  },
];

export const INITIAL_MENUS: MenuItem[] = [
  { id: 'm-home', label: 'Home', url: '/', order: 1 },
  { id: 'm-tech', label: 'AI & Reels', url: '/category/technology', order: 2 },
  { id: 'm-arch', label: 'Architecture', url: '/category/web-architecture', order: 3 },
  { id: 'm-edge', label: 'Cloudflare D1', url: '/category/cloudflare-edge', order: 4 },
  { id: 'm-about', label: 'About', url: '/about', order: 5 },
  { id: 'm-contact', label: 'Contact', url: '/contact', order: 6 },
];

export const INITIAL_SETTINGS: SiteSettings = {
  siteName: 'Astro Blog CMS',
  tagline: 'High-Velocity Publishing & Edge Architecture',
  description: 'Production-ready blogging platform pairing an ultra-fast Astro public site with a rich CMS, Cloudflare D1 storage, and prompt engineering toolsets.',
  logoUrl: '',
  faviconUrl: '',
  typography: {
    presetId: 'bricolage_inter',
    presetName: 'Modern Editorial (Bricolage + Inter)',
    displayFont: "'Bricolage Grotesque', sans-serif",
    bodyFont: "'Inter', sans-serif",
    monoFont: "'JetBrains Mono', monospace",
  },
  authorDefaultId: 'user-superadmin',
  postsPerPage: 6,
  commentsEnabled: true,
  commentsRequireApproval: true,
  homepage: {
    sectionsOrder: [
      'hero',
      'announcement',
      'trending',
      'latest_feed',
      'category_sections',
      'newsletter',
    ],
    sectionsEnabled: {
      hero: true,
      announcement: true,
      trending: true,
      featured_grid: true,
      latest_feed: true,
      category_sections: true,
      newsletter: true,
    },
    hero: {
      type: 'featured_post',
      selectedPostId: 'auto',
      badgeText: 'Featured Blueprint',
      customHeadline: 'High-Velocity Publishing & Edge Compute Architecture',
      customSubheadline: 'Explore deep-dive technical blueprints on Astro 5 island hydration, generative video pipelines, and zero-cost Cloudflare edge storage.',
      customCtaText: 'Explore Blueprints',
      customCtaUrl: '/how-to-create-facebook-reels-with-ai',
      customImageUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&h=675&q=80',
      customImageCaption: 'Interactive edge publishing architecture',
    },
    announcement: {
      enabled: true,
      badge: 'Production Target',
      title: '₹0 Starting Infrastructure Target (Astro + Cloudflare D1 + R2)',
      description: 'Production CMS architecture with static pre-rendering, edge SQLite, and zero egress image distribution.',
      buttonText: 'View Specification Blueprint',
      buttonAction: 'open_spec',
    },
    trending: {
      title: 'Trending & High Velocity',
      subtitle: 'Most read technical playbooks this week',
      postLimit: 4,
    },
    featuredGrid: {
      title: 'Curated Staff Blueprints',
      subtitle: 'Selected by senior systems engineers',
      postLimit: 3,
    },
    latestFeed: {
      title: 'Latest Publications',
      subtitle: 'Recent guides from our distributed engineering and editorial team',
      showCategoryTabs: true,
    },
    categorySections: [
      {
        id: 'hcs-1',
        categoryId: 'cat-technology',
        customTitle: 'AI Workflows & Video Automation',
        customSubtitle: 'Generative prompt chains, FFmpeg pipelines, and neural synthesis guides',
        postLimit: 3,
      },
      {
        id: 'hcs-2',
        categoryId: 'cat-cloudflare',
        customTitle: 'Cloudflare & Edge Systems',
        customSubtitle: 'Zero-cost serverless databases, edge workers, and cache architectures',
        postLimit: 2,
      },
    ],
    newsletter: {
      badge: 'Weekly Digest',
      title: 'Join 12,000+ Edge & Full-Stack Engineers',
      description: 'Get our curated collection of production prompt templates, Astro 5 recipes, and zero-cost cloud architecture deep dives directly to your inbox every Thursday.',
      buttonText: 'Subscribe Free',
      subscriberCountText: 'Join 12,000+ engineers',
      perks: [
        'Production FFmpeg vertical video recipes',
        'Tested prompt chains for Gemini 2.5 & Claude 3.7',
        'Zero-cost serverless database benchmarks',
        'No spam or sponsored third-party pitches',
      ],
    },
    sidebar: {
      enabled: true,
      showAuthorSpotlight: true,
      authorSpotlightTitle: 'Author Spotlight',
      showTags: true,
      tagsTitle: 'Explore Tags',
      showNewsletter: true,
      newsletterTitle: 'The Edge Letter',
      newsletterDesc: 'Join 12,000+ developers receiving our production recipes every Thursday.',
    },
  },
  socialLinks: {
    twitter: 'https://x.com/astroblogcms',
    github: 'https://github.com/astro-blog-cms',
    youtube: 'https://youtube.com',
    linkedin: 'https://linkedin.com',
  },
  defaultSeo: {
    metaTitle: 'Astro Blog CMS – High-Velocity Publishing & Edge Architecture',
    metaDescription: 'Production-ready blogging platform pairing an ultra-fast Astro public site with a rich CMS, Cloudflare D1 storage, and prompt engineering toolsets.',
    ogImage: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&h=675&q=80',
  },
  customCodeHeader: '<!-- Astro Blog CMS Custom Header Code Slot -->',
  customCodeFooter: '<!-- Astro Blog CMS Custom Footer Code Slot -->',
  adSlots: [
    {
      id: 'ad-header',
      name: 'Header Banner',
      location: 'header_banner',
      isEnabled: true,
      bannerImageUrl: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=728&h=90&q=80',
      bannerLinkUrl: 'https://cloudflare.com',
      altText: 'Supercharge your edge deployments with Cloudflare D1 and Pages',
    },
    {
      id: 'ad-in-article',
      name: 'In-Article Responsive Sponsor',
      location: 'in_article',
      isEnabled: true,
      bannerImageUrl: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=800&h=120&q=80',
      bannerLinkUrl: 'https://astro.build',
      altText: 'Build faster websites with Astro 5 Islands',
    },
    {
      id: 'ad-sidebar',
      name: 'Sidebar Square Banner',
      location: 'sidebar',
      isEnabled: true,
      bannerImageUrl: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=300&h=250&q=80',
      bannerLinkUrl: '/how-to-create-facebook-reels-with-ai',
      altText: 'Master AI video creation: View our comprehensive blueprint',
    },
    {
      id: 'ad-footer',
      name: 'Footer Wide Billboard',
      location: 'footer_banner',
      isEnabled: false,
    },
  ],
};

export const INITIAL_ACTIVITY_LOGS: ActivityLog[] = [
  {
    id: 'act-1',
    userId: 'user-superadmin',
    userName: 'Alex Thorne',
    userRole: 'Super Admin',
    action: 'Database Initialization',
    details: 'Bootstrapped Cloudflare D1 schema tables, categories, and initial admin roles.',
    timestamp: '2026-09-24T06:30:00Z',
  },
  {
    id: 'act-2',
    userId: 'user-author',
    userName: 'Priya Sharma',
    userRole: 'Author',
    action: 'Post Published',
    details: 'Published article "How to Create Facebook Reels with AI: Complete 2026 Production Blueprint".',
    timestamp: '2026-09-24T07:15:00Z',
  },
  {
    id: 'act-3',
    userId: 'user-admin',
    userName: 'Maya Lin',
    userRole: 'Admin',
    action: 'SEO Metadata Updated',
    details: 'Configured canonical tags and Breadcrumb structured data for core category archives.',
    timestamp: '2026-09-24T07:45:00Z',
  },
];

export const INITIAL_COMMENTS: Comment[] = [
  {
    id: 'com-1',
    postId: 'post-1',
    authorName: 'Marcus Vance',
    authorEmail: 'marcus@creatorshq.io',
    content: 'The FFmpeg script with the ambient blurred background alone saved me hours of fiddling with Premiere Pro templates! Works brilliantly in our automated webhook pipeline.',
    createdAt: '2026-09-19T14:22:00Z',
    isApproved: true,
  },
  {
    id: 'com-2',
    postId: 'post-1',
    authorName: 'Elena Rostova',
    authorEmail: 'elena@growthviral.com',
    content: 'Do you recommend using ElevenLabs for the voiceover synthesis or are open-source Bark/XTTS models sufficient for Facebook Reels retention?',
    createdAt: '2026-09-20T08:14:00Z',
    isApproved: true,
  },
  {
    id: 'com-3',
    postId: 'post-2',
    authorName: 'Kenji Sato',
    authorEmail: 'kenji@edgelabs.jp',
    content: 'Cloudflare D1 combined with Astro is truly the sweet spot for zero-cost publishing. Our database read latency dropped to under 12ms globally.',
    createdAt: '2026-09-21T18:40:00Z',
    isApproved: true,
  },
];

export const INITIAL_REDIRECTS: RedirectRule[] = [
  {
    id: 'red-1',
    fromPath: '/articles/facebook-reels-ai',
    toPath: '/how-to-create-facebook-reels-with-ai',
    type: 301,
    hits: 242,
    createdAt: '2026-09-18T10:00:00Z',
  },
  {
    id: 'red-2',
    fromPath: '/blog/zero-cost-astro',
    toPath: '/zero-cost-fullstack-astro-cloudflare-d1',
    type: 301,
    hits: 118,
    createdAt: '2026-09-14T08:00:00Z',
  },
];
