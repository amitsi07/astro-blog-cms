# Product Requirement Document (PRD)
## Project Name: Astro Modern Static Blog CMS with Sveltia CMS & Cloudflare Pages Edge Deployment

---

## 1. Executive Summary & Vision
The goal of this project is to provide a modern, ultra-fast, zero-server-fee blogging platform powered by a **Git-based headless CMS (Sveltia CMS)** and hosted on **Cloudflare Pages**. 

Content authors and site owners can write, edit, and publish rich multimedia articles directly in their browser or mobile device via Sveltia CMS at `/admin`. The repository maintains 100% pure static pre-rendered HTML, CSS (Tailwind via CDN), and vanilla JavaScript in `dist/`, eliminating the requirement for complex compilation pipelines, server nodes, or recurring database hosting costs.

---

## 2. Target Audience & Personas
- **Blogger / Content Creator**: Wants a clean, fast website with zero maintenance. Prefers a visual editor (WYSIWYG/Markdown) accessible on mobile and desktop without dealing with code.
- **Developer / Technical Marketer**: Wants version-controlled content stored in Git (Markdown + YAML Frontmatter), global CDN edge caching, and instant Cloudflare deployment.
- **Freelancer / Agency Owner**: Needs a client-friendly setup where clients can log in at `/admin`, add articles, and have them appear live in seconds worldwide.

---

## 3. Core Architecture & Technology Stack

| Layer | Technology | Role / Purpose |
|---|---|---|
| **Content Management System** | **Sveltia CMS** | Client-side headless Git CMS running at `/admin`. Modern successor to Netlify/Decap CMS. No backend server required. |
| **Static Output & Pages** | **Pure HTML, Tailwind CSS & JS** | Pre-rendered static output located in `dist/` (`dist/index.html`, `dist/{slug}/index.html`). Zero runtime node build required on Cloudflare. |
| **Version Control & Database** | **GitHub Repository** | All posts stored as Markdown (`src/content/blog/*.md`) with frontmatter metadata. Git commits serve as the database transaction log. |
| **Hosting & Edge Delivery** | **Cloudflare Pages** | Global edge network with 330+ locations, free SSL, HTTP/3, and automatic CI/CD deployment on every Git push. |
| **Local Studio & Export** | **React 18 + TypeScript + Vite + Tailwind CSS** | Local workspace providing full site previews, settings customizer, and 1-click GitHub commit pipeline. |

---

## 4. Key Functional Features & Requirements

### 4.1. Sveltia CMS Integration (`/admin`)
- **Git Backend Provider**: Authenticates securely with GitHub via GitHub Personal Access Token (or OAuth gateway).
- **Admin App Runner (`dist/admin/index.html`)**: Single Page Application loaded directly from `@sveltia/cms` CDN.
- **Configuration Engine (`dist/admin/config.yml`)**:
  - Defines `posts` collection with fields: `title`, `slug`, `publishedAt`, `excerpt`, `category`, `featuredImage`, and Markdown `body`.
  - Configures `media_folder: "public/uploads"` and `public_folder: "/uploads"`.
  - Configures `site_url` and instant preview links.

### 4.2. Instant Zero-Build Cloudflare Pages Hosting
- **Output Directory**: `dist`
- **Build Command**: *None / Blank* (Instant deployment of pre-rendered static HTML, CSS, and JS).
- **wrangler.toml**: Pre-configured with `pages_build_output_dir = "dist"`.

### 4.3. One-Click GitHub Publisher & Sync Engine
- Direct browser-to-GitHub API integration (`https://api.github.com`).
- Creates the repository automatically if it does not exist.
- Commits `dist/index.html`, `dist/{slug}/index.html`, and `dist/admin/` directly without needing local Git or node commands.

### 4.4. Blog Front-End UI
- **Homepage (`dist/index.html`)**: Hero section, typography styling, article cards grid with publication date, category badges, and reading time.
- **Article Detail Page (`dist/{slug}/index.html`)**: Responsive typography, hero cover image, clean readable prose, and links back to home and `/admin`.
- **Navigation & Mobile Responsiveness**: Fluid mobile-friendly header and footer with quick links to Sveltia CMS.

---

## 5. Non-Functional Requirements
- **Performance**: 95+ score on Google Lighthouse across Performance, SEO, and Accessibility.
- **Cost**: 100% Free Tier compatible (GitHub Free + Cloudflare Pages Free Tier).
- **Reliability & Uptime**: 99.99% uptime powered by Cloudflare Edge CDN.
- **Security**: No database injection vulnerabilities. Static HTML and Markdown files stored with Git encryption and Cloudflare DDoS protection.

---

## 6. Cloudflare Deployment Configuration Specification

| Parameter | Recommended Value | Notes |
|---|---|---|
| **Framework preset** | `None` | Eliminates build framework conflicts |
| **Build command** | *(Blank / Empty)* | Zero build time, deploys in < 15 seconds |
| **Build output directory** | `dist` | Cloudflare directly serves files from this folder |
| **Deploy command** | *(Blank / Empty)* | Not needed for Cloudflare Pages |
| **Root directory** | `/` | Root of the repository |

---

## 7. User Workflows

```
┌──────────────────────────────────────────────┐
│                  Author UI                   │
│  Visits: https://your-site.pages.dev/admin   │
└──────────────────────┬───────────────────────┘
                       │
                       ▼
┌──────────────────────────────────────────────┐
│                 Sveltia CMS                  │
│ Writes article & clicks "Publish"            │
└──────────────────────┬───────────────────────┘
                       │
                       ▼ Git Commit
┌──────────────────────────────────────────────┐
│              GitHub Repository               │
│ Commits: src/content/blog/new-post.md        │
└──────────────────────┬───────────────────────┘
                       │
                       ▼ Webhook Trigger
┌──────────────────────────────────────────────┐
│               Cloudflare Pages               │
│ Deploys static files to 330+ edge servers    │
└──────────────────────┬───────────────────────┘
                       │
                       ▼ Live in ~20 seconds
┌──────────────────────────────────────────────┐
│           Worldwide Live Readers             │
│ https://your-site.pages.dev/new-post         │
└──────────────────────────────────────────────┘
```

---

## 8. Release Roadmap
- **v1.0 (Current)**: Pre-compiled static HTML/CSS/JS export, Sveltia CMS configuration, 1-Click GitHub publisher, Cloudflare Pages compatibility.
- **v1.1**: Automated Cloudflare Worker Deploy Hook for instant webhook cache invalidation.
- **v1.2**: RSS feed (`/rss.xml`) and dynamic Sitemap (`/sitemap.xml`) generation.
