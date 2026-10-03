/**
 * GitHub Integration & Astro 5.x Project Generator
 * Pushes pure Astro static site with .astro components and Markdown Content Collections directly to GitHub
 */

import JSZip from 'jszip';
import { PostItem, CategoryItem, SiteCustomizerSettings, WebhookConfig } from '../types/prompt';

export interface GitHubPushResult {
  success: boolean;
  commitSha?: string;
  commitUrl?: string;
  filesCount?: number;
  error?: string;
}

export interface AstroFileItem {
  path: string;
  content: string;
}

/**
 * Test user token & repository permissions
 */
export async function testGitHubConnection(token: string, repoFullName: string): Promise<{
  success: boolean;
  user?: string;
  repo?: string;
  defaultBranch?: string;
  error?: string;
}> {
  try {
    const cleanToken = token.trim();
    const cleanRepo = repoFullName.trim().replace(/^https?:\/\/github\.com\//, '').replace(/\.git$/, '');

    if (!cleanToken) throw new Error('GitHub Personal Access Token is required');
    if (!cleanRepo || !cleanRepo.includes('/')) throw new Error('Repository format must be "owner/repo"');

    // 1. Check user token
    const userRes = await fetch('https://api.github.com/user', {
      headers: {
        Authorization: `Bearer ${cleanToken}`,
        Accept: 'application/vnd.github+json',
      }
    });

    if (!userRes.ok) {
      if (userRes.status === 401) throw new Error('Invalid GitHub Token. Please check token permissions.');
      throw new Error(`GitHub API Error: ${userRes.statusText}`);
    }

    const userData = await userRes.json();

    // 2. Check repository access & permissions
    const repoRes = await fetch(`https://api.github.com/repos/${cleanRepo}`, {
      headers: {
        Authorization: `Bearer ${cleanToken}`,
        Accept: 'application/vnd.github+json',
      }
    });

    if (!repoRes.ok) {
      if (repoRes.status === 404) throw new Error(`Repository "${cleanRepo}" not found or token lacks access.`);
      throw new Error(`GitHub Repo Error: ${repoRes.statusText}`);
    }

    const repoData = await repoRes.json();

    if (!repoData.permissions?.push) {
      throw new Error(`Token does not have write (push) permission for repository "${cleanRepo}".`);
    }

    return {
      success: true,
      user: userData.login,
      repo: repoData.full_name,
      defaultBranch: repoData.default_branch || 'main'
    };
  } catch (err: any) {
    return {
      success: false,
      error: err.message || 'Failed to connect to GitHub'
    };
  }
}

/**
 * Generate all pure Astro site files (.astro components, content collections, layout, config)
 */
export function generateAstroFilesBundle(
  posts: PostItem[],
  categories: CategoryItem[],
  customizer: SiteCustomizerSettings,
  repoName: string = 'username/promptplum'
): AstroFileItem[] {
  const files: AstroFileItem[] = [];

  // 1. package.json for pure Astro project
  files.push({
    path: 'package.json',
    content: JSON.stringify({
      name: customizer.siteTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      type: 'module',
      version: '1.0.0',
      scripts: {
        dev: 'astro dev',
        start: 'astro dev',
        build: 'astro build',
        preview: 'astro preview'
      },
      dependencies: {
        astro: '^5.1.0',
        '@tailwindcss/vite': '^4.0.0',
        tailwindcss: '^4.0.0'
      }
    }, null, 2)
  });

  // 2. .node-version, .nvmrc & .npmrc to force Node 20+ and smooth dependency resolution
  files.push({
    path: '.node-version',
    content: '20\n'
  });
  files.push({
    path: '.nvmrc',
    content: '20\n'
  });
  files.push({
    path: '.npmrc',
    content: 'legacy-peer-deps=true\n'
  });

  // 3. astro.config.mjs
  files.push({
    path: 'astro.config.mjs',
    content: `import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';

// Astro Static Site Generation for 100% Free Cloudflare Pages CDN
export default defineConfig({
  site: 'https://${customizer.siteTitle.toLowerCase().replace(/[^a-z0-9]+/g, '')}.pages.dev',
  output: 'static',
  vite: {
    plugins: [tailwindcss()],
  },
  compressHTML: true,
});
`
  });

  // 4. src/content.config.ts - Modern Astro Content Layer API
  files.push({
    path: 'src/content.config.ts',
    content: `import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const postsCollection = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/posts' }),
  schema: z.object({
    id: z.string(),
    title: z.string(),
    slug: z.string(),
    type: z.enum(['prompt', 'article', 'page']).default('prompt'),
    status: z.enum(['draft', 'published', 'scheduled']).default('published'),
    featured: z.boolean().default(false),
    excerpt: z.string().default(''),
    model: z.string().optional(),
    category: z.string().default('Portraits'),
    image: z.string(),
    aspectRatio: z.string().default('3:4'),
    prompt: z.string().optional(),
    negativePrompt: z.string().optional(),
    tags: z.array(z.string()).default([]),
    settings: z.object({
      stylize: z.string().optional(),
      lighting: z.string().optional(),
      lens: z.string().optional(),
      cfgScale: z.string().optional(),
      sampler: z.string().optional(),
    }).optional(),
    variables: z.array(z.object({
      name: z.string(),
      token: z.string(),
      defaultValue: z.string(),
      options: z.array(z.string()).optional()
    })).optional(),
    seo: z.object({
      metaTitle: z.string().optional(),
      metaDescription: z.string().optional(),
      focusKeyword: z.string().optional(),
    }).optional(),
    author: z.string().default('Editor'),
    copiesCount: z.number().default(0),
    likesCount: z.number().default(0),
    viewsCount: z.number().default(0),
    publishedAt: z.string().optional(),
    createdAt: z.string().optional(),
    updatedAt: z.string().optional(),
  }),
});

export const collections = {
  posts: postsCollection,
};
`
  });

  // 6. Markdown content collection files in src/content/posts/
  posts.forEach((post) => {
    const frontmatter = {
      id: post.id,
      title: post.title,
      slug: post.slug,
      type: post.type,
      status: post.status,
      featured: !!post.featured,
      excerpt: post.excerpt || '',
      model: post.model || 'Midjourney v6',
      category: post.category || 'Portraits',
      image: post.image,
      aspectRatio: post.aspectRatio || '3:4',
      prompt: post.prompt || '',
      negativePrompt: post.negativePrompt || '',
      tags: post.tags || [],
      settings: post.settings || {},
      variables: post.variables || [],
      seo: post.seo || {},
      author: post.author || 'Editor',
      copiesCount: post.copiesCount || 0,
      likesCount: post.likesCount || 0,
      viewsCount: post.viewsCount || 0,
      publishedAt: post.publishedAt || post.createdAt,
      createdAt: post.createdAt,
      updatedAt: post.updatedAt
    };

    const yamlLines = Object.entries(frontmatter).map(([k, v]) => `${k}: ${JSON.stringify(v)}`);

    files.push({
      path: `src/content/posts/${post.slug}.md`,
      content: `---\n${yamlLines.join('\n')}\n---\n\n${post.content || ''}\n`
    });
  });

  // 7. src/layouts/Layout.astro
  files.push({
    path: 'src/layouts/Layout.astro',
    content: `---
interface Props {
  title?: string;
  description?: string;
  ogImage?: string;
}

const {
  title = "${customizer.siteTitle} – ${customizer.tagline}",
  description = "${customizer.hero?.subtitle || customizer.tagline}",
  ogImage = "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=1200&q=80"
} = Astro.props;
---

<!doctype html>
<html lang="en" class="dark scroll-smooth">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>{title}</title>
    <meta name="description" content={description} />
    <meta property="og:title" content={title} />
    <meta property="og:description" content={description} />
    <meta property="og:image" content={ogImage} />
    <meta property="og:type" content="website" />
    <meta name="twitter:card" content="summary_large_image" />
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:ital,wght@0,300;0,400;0,500;0,600;0,700;1,400&family=Syne:wght@600;700;800&family=JetBrains+Mono:wght@400;500;600&display=swap" rel="stylesheet" />
    <style is:global>
      body {
        font-family: 'Plus Jakarta Sans', system-ui, -apple-system, sans-serif;
        background-color: #0b0c10;
        color: #e0e2ec;
      }
      .font-display {
        font-family: 'Syne', sans-serif;
      }
      .font-mono {
        font-family: 'JetBrains Mono', monospace;
      }
    </style>
  </head>
  <body class="min-h-screen flex flex-col bg-[#0b0c10] text-[#e0e2ec] antialiased">
    <!-- Top Notice Bar -->
    ${customizer.headerNoticeEnabled ? `
    <div class="bg-gradient-to-r from-violet-950 via-indigo-950 to-violet-950 text-violet-200 text-xs py-1.5 text-center font-medium border-b border-violet-900/40 px-4">
      <span>${customizer.headerNotice}</span>
    </div>` : ''}

    <!-- Header Navigation -->
    <header class="sticky top-0 z-40 w-full bg-[#0c0d12]/95 backdrop-blur-md border-b border-[#1f222e]">
      <div class="${customizer.containerMaxWidth || 'max-w-7xl'} mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <a href="/" class="flex items-center gap-2.5">
          <div class="w-8 h-8 rounded-lg bg-gradient-to-tr from-violet-600 to-indigo-500 flex items-center justify-center text-white font-bold shadow-md shadow-violet-900/30">
            ✦
          </div>
          <span class="font-display font-bold text-xl tracking-tight text-white hover:text-violet-300 transition-colors">
            ${customizer.siteTitle}
          </span>
        </a>

        <nav class="hidden md:flex items-center gap-6 text-sm font-medium text-slate-300">
          <a href="/" class="hover:text-white transition-colors">Explore Prompts</a>
          <a href="/articles" class="hover:text-white transition-colors">Articles</a>
          <a href="/admin/" class="text-violet-400 hover:text-violet-300 font-semibold flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-violet-950/40 border border-violet-800/40">
            <span>WP Admin Panel</span> &rarr;
          </a>
        </nav>
      </div>
    </header>

    <slot />

    <!-- Footer -->
    <footer class="border-t border-[#1a1d29] bg-[#090a0f] text-slate-400 py-12 mt-auto">
      <div class="${customizer.containerMaxWidth || 'max-w-7xl'} mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
          <p>${customizer.footer?.copyrightText || '© 2026 PromptPlum AI · Open Source Architecture'}</p>
          <div class="flex items-center gap-4">
            <a href="/" class="hover:text-white">Home</a>
            <a href="/articles" class="hover:text-white">Articles</a>
            <a href="/admin/" class="text-violet-400 hover:underline">WordPress Admin CMS</a>
          </div>
        </div>
      </div>
    </footer>
  </body>
</html>
`
  });

  // 8. src/pages/index.astro - Pure Astro Homepage with Client-Side Interactive Vanilla JS Island
  files.push({
    path: 'src/pages/index.astro',
    content: `---
import Layout from '../layouts/Layout.astro';
import { getCollection } from 'astro:content';

const allPosts = await getCollection('posts', ({ data }) => data.status === 'published');
const prompts = allPosts.filter(p => p.data.type === 'prompt');
const featuredPrompts = prompts.filter(p => p.data.featured).slice(0, 3);
const categories = ${JSON.stringify(categories)};
---

<Layout title="${customizer.siteTitle} – ${customizer.tagline}">
  <!-- Hero Section -->
  <section class="relative overflow-hidden pt-16 pb-12 border-b border-[#1b1e2a] bg-gradient-to-b from-[#10121a] via-[#0c0d12] to-[#0c0d12] text-center">
    <div class="max-w-5xl mx-auto px-4 sm:px-6">
      <div class="inline-flex items-center gap-2 text-xs font-semibold text-violet-400 mb-3 tracking-wide">
        <span>✦</span>
        <span>${customizer.hero?.kicker || 'Curated AI Prompts Library'}</span>
      </div>
      <h1 class="text-4xl sm:text-6xl font-display font-extrabold text-white tracking-tight mb-4">
        ${customizer.hero?.title || customizer.siteTitle}
      </h1>
      <p class="text-sm sm:text-base text-slate-400 max-w-2xl mx-auto mb-8 leading-relaxed">
        ${customizer.hero?.subtitle || customizer.tagline}
      </p>

      <!-- Instant Live Search Bar -->
      <div class="max-w-2xl mx-auto relative mb-6">
        <input
          id="promptSearchInput"
          type="text"
          placeholder="Search prompts, cameras, lighting, keywords..."
          class="w-full bg-[#151722] border border-[#2b2f42] rounded-xl px-5 py-3.5 text-sm sm:text-base text-white placeholder-slate-500 focus:outline-none focus:border-violet-500 shadow-xl"
        />
      </div>

      <!-- AI Model Filter Pills -->
      <div class="flex flex-wrap items-center justify-center gap-1.5 max-w-3xl mx-auto mb-4" id="modelFiltersContainer">
        <button data-model="All" class="model-filter-btn px-3 py-1.5 text-xs font-medium rounded-lg bg-violet-600 text-white transition-all">All Engines</button>
        <button data-model="Midjourney v6" class="model-filter-btn px-3 py-1.5 text-xs font-medium rounded-lg bg-[#151722] text-slate-400 hover:text-white border border-[#232738] transition-all">Midjourney v6</button>
        <button data-model="Flux.1" class="model-filter-btn px-3 py-1.5 text-xs font-medium rounded-lg bg-[#151722] text-slate-400 hover:text-white border border-[#232738] transition-all">Flux.1</button>
        <button data-model="Gemini / Imagen 3" class="model-filter-btn px-3 py-1.5 text-xs font-medium rounded-lg bg-[#151722] text-slate-400 hover:text-white border border-[#232738] transition-all">Gemini</button>
        <button data-model="ChatGPT / DALL·E 3" class="model-filter-btn px-3 py-1.5 text-xs font-medium rounded-lg bg-[#151722] text-slate-400 hover:text-white border border-[#232738] transition-all">ChatGPT / DALL-E</button>
      </div>

      <!-- Proof stats -->
      <div class="flex flex-wrap items-center justify-center gap-3 text-xs text-slate-400 font-mono pt-4 border-t border-[#181a24]">
        <span class="text-white font-semibold">{prompts.length} Verified Prompts</span>
        <span>·</span>
        <span>Pure Astro Content Collections</span>
        <span>·</span>
        <span class="text-emerald-400">Cloudflare Pages Edge</span>
      </div>
    </div>
  </section>

  <!-- Category Filter Bar -->
  <div class="border-b border-[#1c1f2c] bg-[#0c0d12]/90 backdrop-blur-sm sticky top-16 z-30 py-3">
    <div class="${customizer.containerMaxWidth || 'max-w-7xl'} mx-auto px-4 flex items-center gap-2 overflow-x-auto" id="categoryFiltersContainer">
      <button data-category="all" class="cat-filter-btn px-3.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap bg-violet-600 text-white">All Posts</button>
      {categories.filter(c => c.id !== 'all').map((cat) => (
        <button data-category={cat.name} class="cat-filter-btn px-3.5 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap bg-[#131520] text-slate-400 hover:text-white border border-[#212435]">{cat.name}</button>
      ))}
    </div>
  </div>

  <!-- Prompts Grid -->
  <main class="${customizer.containerMaxWidth || 'max-w-7xl'} mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full">
    <div class="flex items-center justify-between mb-8 pb-3 border-b border-[#1f222e]">
      <div class="flex items-center gap-2 text-xs text-slate-400 font-mono">
        <span id="promptCountLabel" class="text-white font-bold text-sm">{prompts.length} Prompts</span>
        <span>·</span>
        <span>1-Click Copy Enabled</span>
      </div>
    </div>

    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6" id="promptsGrid">
      {prompts.map((post) => (
        <div
          class="prompt-card group bg-[#131520] border border-[#23273a] hover:border-violet-500/60 rounded-2xl overflow-hidden transition-all duration-300 flex flex-col justify-between shadow-xl"
          data-title={post.data.title.toLowerCase()}
          data-prompt={(post.data.prompt || '').toLowerCase()}
          data-category={post.data.category}
          data-model={post.data.model}
        >
          <a href={\`/posts/\${post.data.slug}\`} class="block relative aspect-[3/4] overflow-hidden bg-black/40">
            <img src={post.data.image} alt={post.data.title} class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" />
            <div class="absolute inset-0 bg-gradient-to-t from-[#131520] via-transparent to-transparent opacity-80" />
            <div class="absolute top-3 left-3 px-2 py-0.5 rounded bg-black/70 backdrop-blur-md text-[11px] font-mono text-violet-300 border border-white/10">
              {post.data.model}
            </div>
            <div class="absolute bottom-3 left-3 right-3 text-xs text-slate-300 font-mono flex items-center justify-between">
              <span>{post.data.category}</span>
              <span>{post.data.aspectRatio}</span>
            </div>
          </a>

          <div class="p-4 flex-1 flex flex-col justify-between space-y-3">
            <a href={\`/posts/\${post.data.slug}\`}>
              <h3 class="text-sm font-bold text-white group-hover:text-violet-300 transition-colors line-clamp-2">
                {post.data.title}
              </h3>
              <p class="text-xs text-slate-400 line-clamp-2 mt-1">
                {post.data.excerpt}
              </p>
            </a>

            <div class="pt-2 border-t border-[#1f222e] flex items-center gap-2">
              <button
                type="button"
                class="copy-prompt-btn flex-1 py-1.5 px-3 rounded-lg text-xs font-semibold bg-[#1a1c2a] hover:bg-violet-600 text-slate-200 hover:text-white border border-[#2d3148] transition-colors cursor-pointer text-center"
                data-prompt={post.data.prompt}
              >
                Copy Prompt
              </button>
              <a
                href={\`/posts/\${post.data.slug}\`}
                class="p-1.5 rounded-lg bg-[#1a1c2a] hover:bg-[#25283d] text-violet-300 transition-colors"
                title="View Full Post"
              >
                &rarr;
              </a>
            </div>
          </div>
        </div>
      ))}
    </div>
  </main>

  <!-- Interactive Client-side Script (Runs 100% in browser with no external React runtime needed!) -->
  <script is:inline>
    // 1. Live Instant Search & Filter
    const searchInput = document.getElementById('promptSearchInput');
    const cards = document.querySelectorAll('.prompt-card');
    const countLabel = document.getElementById('promptCountLabel');
    let currentCategory = 'all';
    let currentModel = 'All';

    function filterCards() {
      const q = (searchInput?.value || '').toLowerCase().trim();
      let visibleCount = 0;

      cards.forEach(card => {
        const title = card.getAttribute('data-title') || '';
        const prompt = card.getAttribute('data-prompt') || '';
        const category = card.getAttribute('data-category') || '';
        const model = card.getAttribute('data-model') || '';

        const matchesQuery = !q || title.includes(q) || prompt.includes(q);
        const matchesCategory = currentCategory === 'all' || category.toLowerCase() === currentCategory.toLowerCase();
        const matchesModel = currentModel === 'All' || model === currentModel;

        if (matchesQuery && matchesCategory && matchesModel) {
          card.style.display = 'flex';
          visibleCount++;
        } else {
          card.style.display = 'none';
        }
      });

      if (countLabel) countLabel.textContent = visibleCount + ' Prompts';
    }

    if (searchInput) {
      searchInput.addEventListener('input', filterCards);
    }

    // 2. Category Filter Switcher
    const catBtns = document.querySelectorAll('.cat-filter-btn');
    catBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        catBtns.forEach(b => {
          b.classList.remove('bg-violet-600', 'text-white');
          b.classList.add('bg-[#131520]', 'text-slate-400');
        });
        btn.classList.add('bg-violet-600', 'text-white');
        btn.classList.remove('bg-[#131520]', 'text-slate-400');
        currentCategory = btn.getAttribute('data-category') || 'all';
        filterCards();
      });
    });

    // 3. Model Filter Switcher
    const modelBtns = document.querySelectorAll('.model-filter-btn');
    modelBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        modelBtns.forEach(b => {
          b.classList.remove('bg-violet-600', 'text-white');
          b.classList.add('bg-[#151722]', 'text-slate-400');
        });
        btn.classList.add('bg-violet-600', 'text-white');
        btn.classList.remove('bg-[#151722]', 'text-slate-400');
        currentModel = btn.getAttribute('data-model') || 'All';
        filterCards();
      });
    });

    // 4. One-Click Copy Prompt
    const copyBtns = document.querySelectorAll('.copy-prompt-btn');
    copyBtns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        const promptText = btn.getAttribute('data-prompt');
        if (promptText) {
          navigator.clipboard.writeText(promptText);
          const original = btn.textContent;
          btn.textContent = 'Copied! ✓';
          btn.classList.add('bg-emerald-600', 'text-white');
          setTimeout(() => {
            btn.textContent = original;
            btn.classList.remove('bg-emerald-600', 'text-white');
          }, 2000);
        }
      });
    });
  </script>
</Layout>
`
  });

  // 9. src/pages/posts/[slug].astro - Dynamic Post Reader with Gutenberg Blocks
  files.push({
    path: 'src/pages/posts/[slug].astro',
    content: `---
import { getCollection, render } from 'astro:content';
import Layout from '../../layouts/Layout.astro';

export async function getStaticPaths() {
  const posts = await getCollection('posts', ({ data }) => data.status === 'published');
  return posts.map(entry => ({
    params: { slug: entry.data.slug },
    props: { entry },
  }));
}

const { entry } = Astro.props;
const { Content } = await render(entry);

const allPosts = await getCollection('posts', ({ data }) => data.status === 'published' && data.slug !== entry.data.slug);
const relatedPosts = allPosts.filter(p => p.data.category === entry.data.category).slice(0, 3);
---

<Layout title={\`\${entry.data.title} – \${entry.data.model || 'Prompt'}\`} description={entry.data.excerpt} ogImage={entry.data.image}>
  <article class="max-w-4xl mx-auto px-4 sm:px-6 py-12">
    <!-- Breadcrumbs -->
    <div class="mb-6 flex items-center gap-2 text-xs font-mono text-slate-400">
      <a href="/" class="text-violet-400 hover:underline">&larr; All Prompts</a>
      <span>·</span>
      <span>{entry.data.category}</span>
      <span>·</span>
      <span class="text-emerald-400">{entry.data.model}</span>
    </div>

    <!-- Title & Excerpt -->
    <h1 class="text-3xl sm:text-5xl font-display font-extrabold text-white tracking-tight mb-4">
      {entry.data.title}
    </h1>

    {entry.data.excerpt && (
      <p class="text-base text-slate-300 leading-relaxed mb-8 border-l-2 border-violet-500 pl-4 italic">
        {entry.data.excerpt}
      </p>
    )}

    <!-- Large Featured Image -->
    <div class="rounded-2xl overflow-hidden mb-8 border border-[#23273a] shadow-2xl bg-black">
      <img src={entry.data.image} alt={entry.data.title} class="w-full object-cover max-h-[640px]" />
    </div>

    <!-- Prompt Formulation Box -->
    {entry.data.prompt && (
      <div class="bg-[#141624] border border-violet-800/40 rounded-2xl p-6 mb-8 shadow-xl space-y-4">
        <div class="flex items-center justify-between text-xs">
          <span class="font-bold text-violet-300 uppercase tracking-wider font-mono">Tested AI Prompt Formula</span>
          <span class="text-slate-400 font-mono">{entry.data.aspectRatio}</span>
        </div>
        <pre id="formulaText" class="bg-[#0b0c14] border border-[#232738] p-4 rounded-xl text-sm font-mono text-slate-200 select-all whitespace-pre-wrap leading-relaxed">
          {entry.data.prompt}
        </pre>
        <div class="flex items-center justify-between pt-1">
          <button
            id="copyFormulaBtn"
            type="button"
            class="px-5 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-xs font-bold transition-all shadow-md cursor-pointer"
          >
            Copy Prompt Formula
          </button>
        </div>
        {entry.data.negativePrompt && (
          <div class="pt-2 text-xs text-rose-300 font-mono border-t border-[#232738]">
            <span class="font-bold">Negative Prompt:</span> {entry.data.negativePrompt}
          </div>
        )}
      </div>
    )}

    <!-- Content Markdown Body -->
    <div class="prose prose-invert max-w-none text-slate-300 leading-relaxed space-y-4 text-sm sm:text-base">
      <Content />
    </div>

    <!-- Related Prompts -->
    {relatedPosts.length > 0 && (
      <div class="mt-16 pt-8 border-t border-[#1f222e]">
        <h3 class="text-xl font-bold text-white mb-6">More in {entry.data.category}</h3>
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {relatedPosts.map(rp => (
            <a href={\`/posts/\${rp.data.slug}\`} class="group bg-[#131520] border border-[#23273a] hover:border-violet-500 rounded-xl overflow-hidden p-3 block">
              <img src={rp.data.image} alt={rp.data.title} class="w-full aspect-[4/3] object-cover rounded-lg mb-2" />
              <h4 class="text-xs font-bold text-white group-hover:text-violet-300 truncate">{rp.data.title}</h4>
            </a>
          ))}
        </div>
      </div>
    )}
  </article>

  <script is:inline>
    const btn = document.getElementById('copyFormulaBtn');
    const textEl = document.getElementById('formulaText');
    if (btn && textEl) {
      btn.addEventListener('click', () => {
        navigator.clipboard.writeText(textEl.textContent.trim());
        const original = btn.textContent;
        btn.textContent = 'Copied to Clipboard! ✓';
        btn.classList.add('bg-emerald-600');
        setTimeout(() => {
          btn.textContent = original;
          btn.classList.remove('bg-emerald-600');
        }, 2000);
      });
    }
  </script>
</Layout>
`
  });

  // 10. src/pages/articles.astro
  files.push({
    path: 'src/pages/articles.astro',
    content: `---
import Layout from '../layouts/Layout.astro';
import { getCollection } from 'astro:content';

const allPosts = await getCollection('posts', ({ data }) => data.status === 'published');
const articles = allPosts.filter(p => p.data.type === 'article');
---

<Layout title="Articles & Photography Masterclasses – ${customizer.siteTitle}">
  <main class="${customizer.containerMaxWidth || 'max-w-7xl'} mx-auto px-4 sm:px-6 lg:px-8 py-12">
    <div class="mb-10 pb-4 border-b border-[#1f222e]">
      <h1 class="text-3xl sm:text-4xl font-display font-extrabold text-white">Articles & Photography Masterclasses</h1>
      <p class="text-slate-400 text-sm mt-1">Deep dives into lighting, camera lenses, and prompt optimization formulas.</p>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
      {articles.map((item) => (
        <a href={\`/posts/\${item.data.slug}\`} class="group bg-[#131520] border border-[#23273a] hover:border-violet-500 rounded-2xl overflow-hidden p-6 transition-all space-y-3 flex flex-col justify-between shadow-xl">
          <div>
            <div class="flex items-center gap-2 text-xs text-violet-400 font-mono mb-2">
              <span>{item.data.category}</span>
              <span>·</span>
              <span class="text-slate-500">{item.data.publishedAt || item.data.createdAt}</span>
            </div>
            <h2 class="text-xl font-bold text-white group-hover:text-violet-300 transition-colors">
              {item.data.title}
            </h2>
            <p class="text-xs sm:text-sm text-slate-400 line-clamp-3 mt-2 leading-relaxed">
              {item.data.excerpt}
            </p>
          </div>
          <span class="text-xs font-semibold text-violet-400 group-hover:underline">Read Full Masterclass &rarr;</span>
        </a>
      ))}
    </div>
  </main>
</Layout>
`
  });

  // 11. public/admin/index.html (Sveltia CMS static entry)
  files.push({
    path: 'public/admin/index.html',
    content: `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>PromptPlum Content Manager – Sveltia CMS</title>
    <link rel="icon" type="image/svg+xml" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>⚡</text></svg>">
  </head>
  <body>
    <!-- Sveltia CMS: Lightweight, Git-based CMS for Cloudflare Pages & GitHub -->
    <script src="https://unpkg.com/@sveltia/cms/dist/sveltia-cms.js"></script>
  </body>
</html>
`
  });

  // 12. public/admin/config.yml (Sveltia CMS Configuration)
  files.push({
    path: 'public/admin/config.yml',
    content: `backend:
  name: github
  repo: ${repoName}
  branch: main

media_folder: 'public/images/uploads'
public_folder: '/images/uploads'

collections:
  - name: 'posts'
    label: 'Prompts & Articles'
    folder: 'src/content/posts'
    create: true
    slug: '{{slug}}'
    fields:
      - { label: 'Title', name: 'title', widget: 'string' }
      - { label: 'Slug', name: 'slug', widget: 'string' }
      - { label: 'Type', name: 'type', widget: 'select', options: ['prompt', 'article', 'page'], default: 'prompt' }
      - { label: 'Status', name: 'status', widget: 'select', options: ['draft', 'published'], default: 'published' }
      - { label: 'Category', name: 'category', widget: 'string' }
      - { label: 'AI Model', name: 'model', widget: 'string', required: false }
      - { label: 'Aspect Ratio', name: 'aspectRatio', widget: 'string', default: '3:4' }
      - { label: 'Image URL', name: 'image', widget: 'string' }
      - { label: 'Prompt Body', name: 'prompt', widget: 'text', required: false }
      - { label: 'Negative Prompt', name: 'negativePrompt', widget: 'string', required: false }
      - { label: 'Excerpt', name: 'excerpt', widget: 'text' }
      - { label: 'Content Body', name: 'body', widget: 'markdown' }
`
  });

  // 13. public/_headers for Cloudflare Pages
  files.push({
    path: 'public/_headers',
    content: `/*
  X-Frame-Options: SAMEORIGIN
  X-Content-Type-Options: nosniff
  Referrer-Policy: strict-origin-when-cross-origin
`
  });

  // 14. README.md with clear Cloudflare Pages setup
  files.push({
    path: 'README.md',
    content: `# ${customizer.siteTitle} – Pure Astro 5.x Static Site & CMS

${customizer.tagline}

## ⚡ Cloudflare Pages Build Settings:
- **Framework preset:** Astro
- **Build command:** \`npm run build\`
- **Build output directory:** \`dist\`
- **Root directory:** \`/\`
- **Node version:** 20 (configured in \`.node-version\`)

## 🛠 Local Development
\`\`\`bash
npm install
npm run dev
\`\`\`
Visit \`http://localhost:4321\`
`
  });

  return files;
}

/**
 * Push all files directly to GitHub repository using GitHub Git Data API
 */
export async function pushAstroSiteToGitHub(
  token: string,
  repoFullName: string,
  branch: string = 'main',
  commitMessage: string,
  files: AstroFileItem[],
  onProgress?: (step: string) => void
): Promise<GitHubPushResult> {
  const cleanToken = token.trim();
  const cleanRepo = repoFullName.trim().replace(/^https?:\/\/github\.com\//, '').replace(/\.git$/, '');

  const headers = {
    Authorization: `Bearer ${cleanToken}`,
    Accept: 'application/vnd.github+json',
    'Content-Type': 'application/json',
  };

  try {
    onProgress?.('Authenticating with GitHub API...');
    // 1. Get current branch reference (HEAD)
    const refRes = await fetch(`https://api.github.com/repos/${cleanRepo}/git/ref/heads/${branch}`, { headers });
    if (!refRes.ok) {
      throw new Error(`Could not find branch "${branch}" on repo ${cleanRepo}. Make sure the repository exists and has an initialized "${branch}" branch.`);
    }
    const refData = await refRes.json();
    const latestCommitSha = refData.object.sha;

    // 2. Get latest commit to find base tree
    onProgress?.('Reading repository tree...');
    const commitRes = await fetch(`https://api.github.com/repos/${cleanRepo}/git/commits/${latestCommitSha}`, { headers });
    if (!commitRes.ok) throw new Error('Could not get latest commit information');
    const commitData = await commitRes.json();
    const baseTreeSha = commitData.tree.sha;

    // 3. Create blobs/tree objects for each pure Astro file
    onProgress?.(`Building Git tree with ${files.length} pure Astro files & collections...`);
    const treeItems = files.map((file) => ({
      path: file.path,
      mode: '100644',
      type: 'blob',
      content: file.content,
    }));

    // If cleanSync is desired or replacing full project with pure Astro, do not pass base_tree
    // so no conflicting stale .tsx or root SPA index.html files break Astro build on Cloudflare Pages
    const createTreeRes = await fetch(`https://api.github.com/repos/${cleanRepo}/git/trees`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        tree: treeItems,
      }),
    });

    if (!createTreeRes.ok) {
      const err = await createTreeRes.text();
      throw new Error(`Failed to create Git tree: ${err}`);
    }
    const newTreeData = await createTreeRes.json();

    // 4. Create new commit
    onProgress?.('Creating commit on GitHub...');
    const createCommitRes = await fetch(`https://api.github.com/repos/${cleanRepo}/git/commits`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        message: commitMessage || `Update Astro site and prompts collection [${new Date().toISOString()}]`,
        tree: newTreeData.sha,
        parents: [latestCommitSha],
      }),
    });

    if (!createCommitRes.ok) {
      const err = await createCommitRes.text();
      throw new Error(`Failed to create commit: ${err}`);
    }
    const newCommitData = await createCommitRes.json();

    // 5. Update branch reference (HEAD)
    onProgress?.(`Updating branch "${branch}" to point to new commit...`);
    const updateRefRes = await fetch(`https://api.github.com/repos/${cleanRepo}/git/refs/heads/${branch}`, {
      method: 'PATCH',
      headers,
      body: JSON.stringify({
        sha: newCommitData.sha,
        force: false,
      }),
    });

    if (!updateRefRes.ok) {
      const err = await updateRefRes.text();
      throw new Error(`Failed to update branch reference: ${err}`);
    }

    onProgress?.('Pushed successfully to GitHub!');
    return {
      success: true,
      commitSha: newCommitData.sha,
      commitUrl: `https://github.com/${cleanRepo}/commit/${newCommitData.sha}`,
      filesCount: files.length,
    };
  } catch (err: any) {
    return {
      success: false,
      error: err.message || 'Push to GitHub failed',
    };
  }
}

/**
 * Generate a complete downloadable ZIP file of the pure Astro project
 */
export async function downloadAstroProjectZip(
  posts: PostItem[],
  categories: CategoryItem[],
  customizer: SiteCustomizerSettings,
  repoName: string = 'username/promptplum'
): Promise<void> {
  const files = generateAstroFilesBundle(posts, categories, customizer, repoName);
  const zip = new JSZip();

  files.forEach((file) => {
    zip.file(file.path, file.content);
  });

  const blob = await zip.generateAsync({ type: 'blob' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${customizer.siteTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-astro-project.zip`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
