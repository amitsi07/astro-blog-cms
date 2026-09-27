import React, { useState } from 'react';
import { Post, Category, SiteSettings } from '../../types/cms';
import { Globe, Copy, Check, Download, FileCode, CheckCircle2 } from 'lucide-react';

interface SeoStudioProps {
  posts: Post[];
  categories: Category[];
  settings: SiteSettings;
}

export const SeoStudio: React.FC<SeoStudioProps> = ({ posts, categories, settings }) => {
  const [activeTab, setActiveTab] = useState<'sitemap' | 'robots' | 'rss' | 'schema'>('sitemap');
  const [copied, setCopied] = useState(false);
  const [robotsTxt, setRobotsTxt] = useState(
`User-agent: *
Allow: /
Disallow: /admin
Disallow: /api/

Sitemap: https://astroblog.dev/sitemap.xml
`
  );

  const published = posts.filter((p) => p.status === 'published');

  // Generate XML Sitemap
  const generateSitemap = () => {
    return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <!-- Homepage -->
  <url>
    <loc>https://astroblog.dev/</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  <!-- Categories -->
${categories
  .map(
    (c) => `  <url>
    <loc>https://astroblog.dev/category/${c.slug}</loc>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`
  )
  .join('\n')}
  <!-- Published Articles (Clean URLs) -->
${published
  .map(
    (p) => `  <url>
    <loc>https://astroblog.dev/${p.slug}</loc>
    <lastmod>${(p.updatedAt || p.createdAt).split('T')[0]}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.9</priority>
  </url>`
  )
  .join('\n')}
</urlset>`;
  };

  // Generate RSS Feed
  const generateRss = () => {
    return `<?xml version="1.0" encoding="UTF-8" ?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
<channel>
  <title>${settings.siteName}</title>
  <link>https://astroblog.dev</link>
  <description>${settings.description}</description>
  <language>en-us</language>
  <atom:link href="https://astroblog.dev/rss.xml" rel="self" type="application/rss+xml" />
${published
  .map(
    (p) => `  <item>
    <title><![CDATA[${p.title}]]></title>
    <link>https://astroblog.dev/${p.slug}</link>
    <guid>https://astroblog.dev/${p.slug}</guid>
    <pubDate>${new Date(p.publishedAt || p.createdAt).toUTCString()}</pubDate>
    <description><![CDATA[${p.excerpt}]]></description>
  </item>`
  )
  .join('\n')}
</channel>
</rss>`;
  };

  // Generate Schema.org for sample post
  const samplePost = published[0];
  const generateSchemaOrg = () => {
    if (!samplePost) return '{}';
    return JSON.stringify(
      {
        '@context': 'https://schema.org',
        '@graph': [
          {
            '@type': 'BlogPosting',
            '@id': `https://astroblog.dev/${samplePost.slug}#article`,
            headline: samplePost.seo?.seoTitle || samplePost.title,
            description: samplePost.seo?.metaDescription || samplePost.excerpt,
            image: samplePost.featuredImage,
            datePublished: samplePost.publishedAt,
            dateModified: samplePost.updatedAt,
            author: {
              '@type': 'Person',
              name: 'Astro Blog Author',
            },
            publisher: {
              '@type': 'Organization',
              name: settings.siteName,
              url: 'https://astroblog.dev',
            },
            mainEntityOfPage: {
              '@type': 'WebPage',
              '@id': `https://astroblog.dev/${samplePost.slug}`,
            },
          },
          {
            '@type': 'BreadcrumbList',
            itemListElement: [
              {
                '@type': 'ListItem',
                position: 1,
                name: 'Home',
                item: 'https://astroblog.dev',
              },
              {
                '@type': 'ListItem',
                position: 2,
                name: 'Technology',
                item: 'https://astroblog.dev/category/technology',
              },
              {
                '@type': 'ListItem',
                position: 3,
                name: samplePost.title,
                item: `https://astroblog.dev/${samplePost.slug}`,
              },
            ],
          },
          ...(samplePost.faqs && samplePost.faqs.length > 0
            ? [
                {
                  '@type': 'FAQPage',
                  mainEntity: samplePost.faqs.map((faq) => ({
                    '@type': 'Question',
                    name: faq.question,
                    acceptedAnswer: {
                      '@type': 'Answer',
                      text: faq.answer,
                    },
                  })),
                },
              ]
            : []),
        ],
      },
      null,
      2
    );
  };

  const handleCopyCurrent = () => {
    let text = '';
    if (activeTab === 'sitemap') text = generateSitemap();
    else if (activeTab === 'robots') text = robotsTxt;
    else if (activeTab === 'rss') text = generateRss();
    else if (activeTab === 'schema') text = generateSchemaOrg();

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-display text-2xl font-bold text-white">SEO & Structured Data Studio</h2>
          <p className="text-xs text-slate-400">
            Per Section 7: XML Sitemaps, robots.txt, RSS feeds, and Schema.org rich search verification.
          </p>
        </div>
        <button
          onClick={handleCopyCurrent}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-orange-600 hover:bg-orange-500 text-white text-xs font-semibold shadow-md shadow-orange-600/30"
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-300" />
              <span>Copied to Clipboard!</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5" />
              <span>Copy Current Output</span>
            </>
          )}
        </button>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
        <button
          onClick={() => setActiveTab('sitemap')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition-colors ${
            activeTab === 'sitemap' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-white'
          }`}
        >
          1. XML Sitemap (/sitemap.xml)
        </button>
        <button
          onClick={() => setActiveTab('robots')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition-colors ${
            activeTab === 'robots' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-white'
          }`}
        >
          2. robots.txt
        </button>
        <button
          onClick={() => setActiveTab('rss')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition-colors ${
            activeTab === 'rss' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-white'
          }`}
        >
          3. RSS Feed (/rss.xml)
        </button>
        <button
          onClick={() => setActiveTab('schema')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition-colors ${
            activeTab === 'schema' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-white'
          }`}
        >
          4. Schema.org JSON-LD Tester
        </button>
      </div>

      {/* Tab Panels */}
      <div className="p-6 rounded-2xl border border-slate-800 bg-[#090d16] space-y-4">
        {activeTab === 'sitemap' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span>Automatically generated from active published routes and categories.</span>
              <span className="font-mono">{published.length + categories.length + 1} URLs</span>
            </div>
            <pre className="p-4 rounded-xl bg-[#060910] border border-slate-800 text-xs font-mono text-slate-300 overflow-x-auto max-h-96 leading-relaxed">
              <code>{generateSitemap()}</code>
            </pre>
          </div>
        )}

        {activeTab === 'robots' && (
          <div className="space-y-3">
            <div className="text-xs text-slate-400">
              Customize crawler directives and sitemap reference for search engine bots:
            </div>
            <textarea
              rows={8}
              value={robotsTxt}
              onChange={(e) => setRobotsTxt(e.target.value)}
              className="w-full p-4 rounded-xl bg-[#060910] border border-slate-800 text-xs font-mono text-slate-300 leading-relaxed focus:outline-none focus:border-orange-500 resize-none"
            />
          </div>
        )}

        {activeTab === 'rss' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span>Standard RSS 2.0 Feed syndication for feed readers and newsletter automations.</span>
              <span className="font-mono">{published.length} Feed Items</span>
            </div>
            <pre className="p-4 rounded-xl bg-[#060910] border border-slate-800 text-xs font-mono text-slate-300 overflow-x-auto max-h-96 leading-relaxed">
              <code>{generateRss()}</code>
            </pre>
          </div>
        )}

        {activeTab === 'schema' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span>
                Generated JSON-LD structured data graph (BlogPosting + BreadcrumbList + FAQPage).
              </span>
              <span className="font-mono">Sample: {samplePost?.title.substring(0, 30)}...</span>
            </div>
            <pre className="p-4 rounded-xl bg-[#060910] border border-slate-800 text-xs font-mono text-emerald-300 overflow-x-auto max-h-96 leading-relaxed">
              <code>{generateSchemaOrg()}</code>
            </pre>
          </div>
        )}
      </div>
    </div>
  );
};
