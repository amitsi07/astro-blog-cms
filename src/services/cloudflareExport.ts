/**
 * Cloudflare D1 & Astro Production Configuration Generator
 * Fulfills Section 8, 12, 13 & 15 of Astro Blog CMS Specification
 */

export const CLOUDFLARE_D1_SCHEMA_SQL = `-- Astro Blog CMS Cloudflare D1 Production Database Schema
-- Version 1.0 (September 2026)
-- Target: SQLite on Cloudflare D1 (Zero-Cost Free Tier Capable)

-- 1. Users Table
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  avatar TEXT,
  role TEXT NOT NULL CHECK(role IN ('Super Admin', 'Admin', 'Editor', 'Author', 'Contributor')),
  bio TEXT,
  title TEXT,
  twitter TEXT,
  github TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 2. Categories Table
CREATE TABLE IF NOT EXISTS categories (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  color TEXT DEFAULT '#6366f1',
  icon TEXT,
  seo_title TEXT,
  meta_description TEXT
);

-- 3. Tags Table
CREATE TABLE IF NOT EXISTS tags (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL
);

-- 4. Posts Table
CREATE TABLE IF NOT EXISTS posts (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  excerpt TEXT,
  content TEXT NOT NULL,
  blocks_json TEXT, -- Serialized rich blocks (Prompts, Codes, Callouts, Tables, etc.)
  featured_image TEXT,
  featured_image_caption TEXT,
  featured_image_alt TEXT,
  status TEXT NOT NULL DEFAULT 'draft' CHECK(status IN ('published', 'draft', 'scheduled', 'unpublished', 'trash')),
  author_id TEXT NOT NULL REFERENCES users(id),
  category_id TEXT NOT NULL REFERENCES categories(id),
  seo_json TEXT, -- Custom SEO Title, Meta Description, Focus Keyword, Canonical
  faqs_json TEXT, -- FAQ accordion and structured data
  is_featured INTEGER DEFAULT 0,
  is_trending INTEGER DEFAULT 0,
  views INTEGER DEFAULT 0,
  reading_time_minutes INTEGER DEFAULT 5,
  published_at DATETIME,
  scheduled_at DATETIME,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_posts_slug ON posts(slug);
CREATE INDEX IF NOT EXISTS idx_posts_status ON posts(status);
CREATE INDEX IF NOT EXISTS idx_posts_category ON posts(category_id);
CREATE INDEX IF NOT EXISTS idx_posts_published_at ON posts(published_at DESC);

-- 5. Post Tags Pivot Table (Many-to-Many)
CREATE TABLE IF NOT EXISTS post_tags (
  post_id TEXT NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  tag_id TEXT NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
  PRIMARY KEY (post_id, tag_id)
);

-- 6. Media Library Table
CREATE TABLE IF NOT EXISTS media (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  url TEXT NOT NULL,
  alt_text TEXT,
  caption TEXT,
  mime_type TEXT NOT NULL,
  size_bytes INTEGER NOT NULL,
  dimensions TEXT,
  uploaded_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 7. Static Pages Table
CREATE TABLE IF NOT EXISTS pages (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  content TEXT NOT NULL,
  seo_title TEXT,
  meta_description TEXT,
  is_published INTEGER DEFAULT 1,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 8. Revisions Table (Version History)
CREATE TABLE IF NOT EXISTS revisions (
  id TEXT PRIMARY KEY,
  post_id TEXT NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  author_name TEXT NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  blocks_json TEXT,
  note TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 9. Activity / Audit Logs Table
CREATE TABLE IF NOT EXISTS activity_logs (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  user_name TEXT NOT NULL,
  user_role TEXT NOT NULL,
  action TEXT NOT NULL,
  details TEXT,
  timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 10. URL 301/302 Redirects Table
CREATE TABLE IF NOT EXISTS redirects (
  id TEXT PRIMARY KEY,
  from_path TEXT UNIQUE NOT NULL,
  to_path TEXT NOT NULL,
  status_code INTEGER DEFAULT 301,
  hits INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
`;

export const WRANGLER_TOML = `# wrangler.toml - Cloudflare Pages / Workers Configuration
name = "astro-blog-cms"
compatibility_date = "2026-09-01"
compatibility_flags = ["nodejs_compat"]

# Cloudflare D1 Relational Database Binding
[[d1_databases]]
binding = "DB"
database_name = "astro_cms_prod"
database_id = "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"

# Cloudflare R2 Media Asset Storage Binding
[[r2_buckets]]
binding = "MEDIA_BUCKET"
bucket_name = "astro-cms-assets"

[vars]
PUBLIC_SITE_URL = "https://astroblog.dev"
ENVIRONMENT = "production"
`;

export const ASTRO_CONFIG_MJS = `// astro.config.mjs
import { defineConfig } from 'astro/config';
import cloudflare from '@astrojs/cloudflare';
import tailwind from '@astrojs/tailwind';
import react from '@astrojs/react';

export default defineConfig({
  output: 'server', // Hybrid SSR for Admin & Cached Edge Pages for Public
  adapter: cloudflare({
    imageService: 'cloudflare',
    mode: 'advanced',
  }),
  integrations: [
    tailwind(),
    react(),
  ],
  vite: {
    ssr: {
      external: ['node:crypto'],
    },
  },
});
`;

export const GITHUB_ACTIONS_YML = `# .github/workflows/deploy.yml
name: Deploy Astro Blog CMS to Cloudflare

on:
  push:
    branches: [main]
  workflow_dispatch:

jobs:
  deploy:
    runs-on: ubuntu-latest
    name: Build & Deploy to Cloudflare Pages
    steps:
      - name: Checkout Code
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: 'npm'

      - name: Install Dependencies
        run: npm ci

      - name: Apply D1 Database Migrations
        env:
          CLOUDFLARE_API_TOKEN: \${{ secrets.CLOUDFLARE_API_TOKEN }}
          CLOUDFLARE_ACCOUNT_ID: \${{ secrets.CLOUDFLARE_ACCOUNT_ID }}
        run: npx wrangler d1 migrations apply astro_cms_prod --remote

      - name: Build Astro Application
        run: npm run build

      - name: Deploy to Cloudflare Pages
        uses: cloudflare/wrangler-action@v3
        with:
          apiToken: \${{ secrets.CLOUDFLARE_API_TOKEN }}
          accountId: \${{ secrets.CLOUDFLARE_ACCOUNT_ID }}
          command: pages deploy dist --project-name=astro-blog-cms
`;

export function postToAstroMarkdown(post: any, categoryName: string): string {
  const frontmatter = `---
title: "${post.title.replace(/"/g, '\\"')}"
slug: "${post.slug}"
excerpt: "${(post.excerpt || '').replace(/"/g, '\\"')}"
featuredImage: "${post.featuredImage || ''}"
category: "${categoryName}"
tags: [${(post.tags || []).map((t: string) => `"${t}"`).join(', ')}]
authorId: "${post.authorId}"
publishedAt: "${post.publishedAt || new Date().toISOString()}"
status: "${post.status}"
readingTime: ${post.readingTimeMinutes || 5}
seo:
  title: "${(post.seo?.seoTitle || post.title).replace(/"/g, '\\"')}"
  description: "${(post.seo?.metaDescription || post.excerpt || '').replace(/"/g, '\\"')}"
  focusKeyword: "${post.seo?.focusKeyword || ''}"
---

${post.content}
`;
  return frontmatter;
}
