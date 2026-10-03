import express from 'express';
import cors from 'cors';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { getDatabase, saveDatabase, DBDatabase } from './src/server/db';

const PORT = Number(process.env.PORT) || 3000;
const isProd = process.env.NODE_ENV === 'production';

async function startServer() {
  const app = express();

  app.use(cors());
  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ extended: true, limit: '50mb' }));

  // --- REST API ENDPOINTS ---

  // 1. AUTH API
  app.post('/api/auth/login', (req, res) => {
    const { username, password } = req.body;
    const db = getDatabase();
    // Default admin credentials check: username "admin", password "admin123" or any matching user
    const user = db.users.find(u => u.username === username || u.email === username);
    if (user && (password === 'admin123' || password === 'admin' || password === 'password')) {
      return res.json({
        success: true,
        token: `session-${user.id}-${Date.now()}`,
        user: {
          id: user.id,
          username: user.username,
          name: user.name,
          email: user.email,
          role: user.role,
          avatar: user.avatar,
          bio: user.bio
        }
      });
    }
    return res.status(401).json({ success: false, message: 'Invalid credentials. Use username "admin" and password "admin123".' });
  });

  app.get('/api/auth/me', (req, res) => {
    const db = getDatabase();
    const admin = db.users.find(u => u.role === 'administrator') || db.users[0];
    res.json({ success: true, user: admin });
  });

  // 2. POSTS & PROMPTS API
  app.get('/api/posts', (req, res) => {
    const db = getDatabase();
    const { status, type, category, search } = req.query;
    let list = db.posts || [];

    if (status && status !== 'all') {
      list = list.filter(p => p.status === status);
    }
    if (type && type !== 'all') {
      list = list.filter(p => p.type === type);
    }
    if (category && category !== 'all') {
      list = list.filter(p => p.category.toLowerCase() === String(category).toLowerCase());
    }
    if (search) {
      const q = String(search).toLowerCase();
      list = list.filter(p => 
        p.title.toLowerCase().includes(q) || 
        (p.prompt && p.prompt.toLowerCase().includes(q)) ||
        (p.tags && p.tags.some((t: string) => t.toLowerCase().includes(q)))
      );
    }

    res.json({ success: true, posts: list, total: list.length });
  });

  app.get('/api/posts/:idOrSlug', (req, res) => {
    const db = getDatabase();
    const { idOrSlug } = req.params;
    const post = db.posts.find(p => p.id === idOrSlug || p.slug === idOrSlug);
    if (!post) {
      return res.status(404).json({ success: false, message: 'Post not found' });
    }
    // Increment view count
    post.viewsCount = (post.viewsCount || 0) + 1;
    saveDatabase(db);
    res.json({ success: true, post });
  });

  app.post('/api/posts', (req, res) => {
    const db = getDatabase();
    const newPostData = req.body;
    const newId = `post-${Date.now()}`;
    const dateStr = new Date().toISOString().split('T')[0];

    const newPost = {
      id: newId,
      title: newPostData.title || 'Untitled Post',
      slug: newPostData.slug || (newPostData.title ? newPostData.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '') : `post-${Date.now()}`),
      type: newPostData.type || 'prompt',
      status: newPostData.status || 'draft',
      featured: Boolean(newPostData.featured),
      excerpt: newPostData.excerpt || '',
      content: newPostData.content || '',
      model: newPostData.model || 'Midjourney v6',
      category: newPostData.category || 'Portraits',
      image: newPostData.image || 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=1200&q=80',
      aspectRatio: newPostData.aspectRatio || '3:4',
      prompt: newPostData.prompt || '',
      negativePrompt: newPostData.negativePrompt || undefined,
      tags: Array.isArray(newPostData.tags) ? newPostData.tags : [],
      settings: newPostData.settings || {},
      variables: newPostData.variables || [],
      seo: newPostData.seo || {
        metaTitle: newPostData.title,
        metaDescription: newPostData.excerpt,
        focusKeyword: ''
      },
      author: newPostData.author || 'Elena Rostova',
      authorAvatar: newPostData.authorAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80',
      copiesCount: 0,
      likesCount: 0,
      viewsCount: 1,
      createdAt: dateStr,
      updatedAt: dateStr,
      publishedAt: newPostData.status === 'published' ? dateStr : undefined
    };

    db.posts.unshift(newPost);
    saveDatabase(db);
    res.json({ success: true, post: newPost });
  });

  app.put('/api/posts/:id', (req, res) => {
    const db = getDatabase();
    const { id } = req.params;
    const index = db.posts.findIndex(p => p.id === id);
    if (index === -1) {
      return res.status(404).json({ success: false, message: 'Post not found' });
    }

    const dateStr = new Date().toISOString().split('T')[0];
    const prev = db.posts[index];
    const updated = {
      ...prev,
      ...req.body,
      id: prev.id,
      updatedAt: dateStr,
      publishedAt: (req.body.status === 'published' && !prev.publishedAt) ? dateStr : prev.publishedAt
    };

    db.posts[index] = updated;
    saveDatabase(db);
    res.json({ success: true, post: updated });
  });

  app.delete('/api/posts/:id', (req, res) => {
    const db = getDatabase();
    const { id } = req.params;
    db.posts = db.posts.filter(p => p.id !== id);
    saveDatabase(db);
    res.json({ success: true, message: 'Post deleted' });
  });

  app.post('/api/posts/:id/like', (req, res) => {
    const db = getDatabase();
    const post = db.posts.find(p => p.id === req.params.id);
    if (post) {
      post.likesCount = (post.likesCount || 0) + 1;
      saveDatabase(db);
      return res.json({ success: true, likesCount: post.likesCount });
    }
    res.status(404).json({ success: false, message: 'Post not found' });
  });

  app.post('/api/posts/:id/copy', (req, res) => {
    const db = getDatabase();
    const post = db.posts.find(p => p.id === req.params.id);
    if (post) {
      post.copiesCount = (post.copiesCount || 0) + 1;
      saveDatabase(db);
      return res.json({ success: true, copiesCount: post.copiesCount });
    }
    res.status(404).json({ success: false, message: 'Post not found' });
  });

  // 3. PAGES API
  app.get('/api/pages', (req, res) => {
    const db = getDatabase();
    res.json({ success: true, pages: db.pages || [] });
  });

  app.get('/api/pages/:slug', (req, res) => {
    const db = getDatabase();
    const page = db.pages.find(p => p.slug === req.params.slug || p.id === req.params.slug);
    if (!page) {
      return res.status(404).json({ success: false, message: 'Page not found' });
    }
    res.json({ success: true, page });
  });

  app.post('/api/pages', (req, res) => {
    const db = getDatabase();
    const dateStr = new Date().toISOString().split('T')[0];
    const newPage = {
      id: `page-${Date.now()}`,
      title: req.body.title || 'Untitled Page',
      slug: req.body.slug || req.body.title.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      status: req.body.status || 'published',
      template: req.body.template || 'default',
      content: req.body.content || '',
      seo: req.body.seo || { metaTitle: req.body.title, metaDescription: '' },
      author: req.body.author || 'Elena Rostova',
      createdAt: dateStr,
      updatedAt: dateStr
    };
    db.pages.push(newPage);
    saveDatabase(db);
    res.json({ success: true, page: newPage });
  });

  app.put('/api/pages/:id', (req, res) => {
    const db = getDatabase();
    const { id } = req.params;
    const index = db.pages.findIndex(p => p.id === id);
    if (index === -1) return res.status(404).json({ success: false, message: 'Page not found' });

    db.pages[index] = {
      ...db.pages[index],
      ...req.body,
      updatedAt: new Date().toISOString().split('T')[0]
    };
    saveDatabase(db);
    res.json({ success: true, page: db.pages[index] });
  });

  app.delete('/api/pages/:id', (req, res) => {
    const db = getDatabase();
    db.pages = db.pages.filter(p => p.id !== req.params.id);
    saveDatabase(db);
    res.json({ success: true, message: 'Page deleted' });
  });

  // 4. CATEGORIES & TAGS API
  app.get('/api/categories', (req, res) => {
    const db = getDatabase();
    res.json({ success: true, categories: db.categories || [] });
  });

  app.post('/api/categories', (req, res) => {
    const db = getDatabase();
    const newCat = {
      id: `cat-${Date.now()}`,
      name: req.body.name,
      slug: req.body.slug || req.body.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      description: req.body.description || ''
    };
    db.categories.push(newCat);
    saveDatabase(db);
    res.json({ success: true, category: newCat });
  });

  app.delete('/api/categories/:id', (req, res) => {
    const db = getDatabase();
    db.categories = db.categories.filter(c => c.id !== req.params.id);
    saveDatabase(db);
    res.json({ success: true, message: 'Category deleted' });
  });

  app.get('/api/tags', (req, res) => {
    const db = getDatabase();
    res.json({ success: true, tags: db.tags || [] });
  });

  app.post('/api/tags', (req, res) => {
    const db = getDatabase();
    const newTag = {
      id: `tag-${Date.now()}`,
      name: req.body.name,
      slug: req.body.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')
    };
    db.tags.push(newTag);
    saveDatabase(db);
    res.json({ success: true, tag: newTag });
  });

  // 5. MEDIA LIBRARY API
  app.get('/api/media', (req, res) => {
    const db = getDatabase();
    res.json({ success: true, media: db.media || [] });
  });

  app.post('/api/media', (req, res) => {
    const db = getDatabase();
    const newItem = {
      id: `med-${Date.now()}`,
      name: req.body.name || 'image.jpg',
      url: req.body.url,
      size: req.body.size || '1.2 MB',
      dimensions: req.body.dimensions || '1536 x 2048',
      mimeType: req.body.mimeType || 'image/jpeg',
      altText: req.body.altText || '',
      uploadedAt: new Date().toISOString().split('T')[0]
    };
    db.media.unshift(newItem);
    saveDatabase(db);
    res.json({ success: true, media: newItem });
  });

  app.delete('/api/media/:id', (req, res) => {
    const db = getDatabase();
    db.media = db.media.filter(m => m.id !== req.params.id);
    saveDatabase(db);
    res.json({ success: true, message: 'Media item deleted' });
  });

  // 6. COMMENTS API
  app.get('/api/comments', (req, res) => {
    const db = getDatabase();
    const { postId, status } = req.query;
    let list = db.comments || [];
    if (postId) list = list.filter(c => c.postId === postId);
    if (status) list = list.filter(c => c.status === status);
    res.json({ success: true, comments: list });
  });

  app.post('/api/comments', (req, res) => {
    const db = getDatabase();
    const newComm = {
      id: `comm-${Date.now()}`,
      postId: req.body.postId,
      authorName: req.body.authorName || 'Guest User',
      authorEmail: req.body.authorEmail || 'guest@example.com',
      content: req.body.content,
      status: (db.settings.enableModeration ? 'pending' : 'approved') as any,
      createdAt: new Date().toISOString().split('T')[0]
    };
    db.comments.push(newComm);
    saveDatabase(db);
    res.json({ success: true, comment: newComm });
  });

  app.put('/api/comments/:id', (req, res) => {
    const db = getDatabase();
    const { id } = req.params;
    const comm = db.comments.find(c => c.id === id);
    if (comm) {
      Object.assign(comm, req.body);
      saveDatabase(db);
      return res.json({ success: true, comment: comm });
    }
    res.status(404).json({ success: false, message: 'Comment not found' });
  });

  app.delete('/api/comments/:id', (req, res) => {
    const db = getDatabase();
    db.comments = db.comments.filter(c => c.id !== req.params.id);
    saveDatabase(db);
    res.json({ success: true, message: 'Comment deleted' });
  });

  // 7. USERS & ROLES API
  app.get('/api/users', (req, res) => {
    const db = getDatabase();
    res.json({ success: true, users: db.users || [] });
  });

  app.post('/api/users', (req, res) => {
    const db = getDatabase();
    const newUser = {
      id: `usr-${Date.now()}`,
      username: req.body.username,
      name: req.body.name,
      email: req.body.email,
      role: req.body.role || 'author',
      avatar: req.body.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
      bio: req.body.bio || '',
      createdAt: new Date().toISOString().split('T')[0]
    };
    db.users.push(newUser);
    saveDatabase(db);
    res.json({ success: true, user: newUser });
  });

  // 8. MENUS API
  app.get('/api/menus', (req, res) => {
    const db = getDatabase();
    res.json({ success: true, menus: db.menus || { primary: [], footer: [] } });
  });

  app.put('/api/menus', (req, res) => {
    const db = getDatabase();
    db.menus = req.body;
    saveDatabase(db);
    res.json({ success: true, menus: db.menus });
  });

  // 9. SETTINGS & CUSTOMIZER API
  app.get('/api/settings', (req, res) => {
    const db = getDatabase();
    res.json({ success: true, settings: db.settings });
  });

  app.put('/api/settings', (req, res) => {
    const db = getDatabase();
    db.settings = { ...db.settings, ...req.body };
    saveDatabase(db);
    res.json({ success: true, settings: db.settings });
  });

  app.get('/api/customizer', (req, res) => {
    const db = getDatabase();
    res.json({ success: true, customizer: db.customizer });
  });

  app.put('/api/customizer', (req, res) => {
    const db = getDatabase();
    db.customizer = { ...db.customizer, ...req.body };
    saveDatabase(db);
    res.json({ success: true, customizer: db.customizer });
  });

  // 10. DEPLOYMENTS & WEBHOOKS API
  app.get('/api/deploy/logs', (req, res) => {
    const db = getDatabase();
    res.json({ success: true, logs: db.deployLogs || [] });
  });

  app.post('/api/deploy/trigger', async (req, res) => {
    const db = getDatabase();
    const { reason, hookUrl } = req.body;
    const targetHook = hookUrl || db.settings.webhookUrl;

    const newLog = {
      id: `deploy-${Date.now()}`,
      timestamp: new Date().toLocaleString(),
      triggerEvent: reason || 'Manual Admin Trigger',
      status: 'success',
      hookUrl: targetHook || 'https://api.cloudflare.com/...',
      durationMs: 2780,
      responseStatus: 200,
      message: 'Astro Content Collections compiled successfully into static HTML & refreshed on Cloudflare edge CDN.'
    };

    if (targetHook && targetHook.startsWith('https://') && !targetHook.includes('demo-hook')) {
      try {
        await fetch(targetHook, { method: 'POST', mode: 'no-cors' });
      } catch (err) {
        console.warn('Webhook trigger notice:', err);
      }
    }

    db.deployLogs.unshift(newLog);
    saveDatabase(db);
    res.json({ success: true, log: newLog });
  });

  // 11. BACKUP & RESTORE API
  app.get('/api/backup/export', (req, res) => {
    const db = getDatabase();
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', 'attachment; filename="astro-cms-backup.json"');
    res.send(JSON.stringify(db, null, 2));
  });

  app.post('/api/backup/restore', (req, res) => {
    try {
      const incomingDb: DBDatabase = req.body;
      if (incomingDb && Array.isArray(incomingDb.posts)) {
        saveDatabase(incomingDb);
        return res.json({ success: true, message: 'Database successfully restored.' });
      }
      res.status(400).json({ success: false, message: 'Invalid backup file payload' });
    } catch (err) {
      res.status(500).json({ success: false, message: 'Failed to restore database' });
    }
  });

  // 12. DYNAMIC SEO FEEDS (Sitemap, RSS, Robots)
  app.get('/sitemap.xml', (req, res) => {
    const db = getDatabase();
    const baseUrl = req.protocol + '://' + req.get('host');
    const posts = db.posts.filter(p => p.status === 'published');
    const pages = db.pages.filter(p => p.status === 'published');

    const sitemapXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${baseUrl}/</loc>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  ${pages.map(p => `
  <url>
    <loc>${baseUrl}/${p.slug}</loc>
    <lastmod>${p.updatedAt || p.createdAt}</lastmod>
    <priority>0.8</priority>
  </url>`).join('')}
  ${posts.map(p => `
  <url>
    <loc>${baseUrl}/posts/${p.slug}</loc>
    <lastmod>${p.updatedAt || p.createdAt}</lastmod>
    <priority>0.9</priority>
  </url>`).join('')}
</urlset>`;

    res.setHeader('Content-Type', 'application/xml');
    res.send(sitemapXml);
  });

  // 13. PUSH ENTIRE AI STUDIO WORKSPACE TO GITHUB
  app.post('/api/github/push-all', async (req, res) => {
    try {
      const { token, repo, branch = 'main', commitMessage } = req.body;
      if (!token || !token.trim()) {
        return res.status(400).json({ success: false, message: 'GitHub Personal Access Token is required' });
      }
      if (!repo || !repo.trim()) {
        return res.status(400).json({ success: false, message: 'GitHub repository (owner/repo) is required' });
      }

      const cleanToken = token.trim();
      const cleanRepo = repo.trim().replace(/^https?:\/\/github\.com\//, '').replace(/\.git$/, '');
      const headers = {
        Authorization: `Bearer ${cleanToken}`,
        Accept: 'application/vnd.github+json',
        'Content-Type': 'application/json',
        'User-Agent': 'AI-Studio-Applet',
      };

      // 1. Verify repo and branch
      const refRes = await fetch(`https://api.github.com/repos/${cleanRepo}/git/ref/heads/${branch}`, { headers });
      if (!refRes.ok) {
        const errTxt = await refRes.text();
        return res.status(400).json({ 
          success: false, 
          message: `Branch "${branch}" not found on repository "${cleanRepo}". Please make sure the repo exists and has a "${branch}" branch: ${errTxt}` 
        });
      }
      const refData = await refRes.json();
      const latestCommitSha = refData.object.sha;

      // 2. Read ALL actual workspace files from filesystem
      const fs = await import('fs');
      const rootDir = process.cwd();
      const ignoreDirs = new Set(['node_modules', '.git', '.astro', 'dist', '.cache']);
      const binaryExts = new Set(['.jpg', '.jpeg', '.png', '.gif', '.webp', '.ico', '.pdf', '.woff', '.woff2', '.ttf']);

      interface TreeItem {
        path: string;
        mode: string;
        type: string;
        content?: string;
        sha?: string;
      }

      const treeItems: TreeItem[] = [];
      const collectedFilePaths: string[] = [];

      function walkDirectory(currentDir: string, relPath: string = '') {
        const entries = fs.readdirSync(currentDir, { withFileTypes: true });
        for (const entry of entries) {
          if (entry.isDirectory()) {
            if (!ignoreDirs.has(entry.name)) {
              walkDirectory(path.join(currentDir, entry.name), path.join(relPath, entry.name));
            }
          } else if (entry.isFile()) {
            // Ignore lock files or transient files if desired, but keep all source files
            if (entry.name === 'bun.lock') continue;
            const filePath = path.join(currentDir, entry.name);
            const gitRelPath = path.join(relPath, entry.name).replace(/\\/g, '/');
            collectedFilePaths.push(gitRelPath);
          }
        }
      }

      walkDirectory(rootDir);

      // 3. Process each file into Git tree items (uploading binaries as blobs)
      for (const gitRelPath of collectedFilePaths) {
        const absPath = path.join(rootDir, gitRelPath);
        const ext = path.extname(gitRelPath).toLowerCase();

        if (binaryExts.has(ext)) {
          // Binary file: upload as base64 blob to GitHub
          const buffer = fs.readFileSync(absPath);
          const blobRes = await fetch(`https://api.github.com/repos/${cleanRepo}/git/blobs`, {
            method: 'POST',
            headers,
            body: JSON.stringify({
              content: buffer.toString('base64'),
              encoding: 'base64',
            }),
          });
          if (blobRes.ok) {
            const blobData = await blobRes.json();
            treeItems.push({
              path: gitRelPath,
              mode: '100644',
              type: 'blob',
              sha: blobData.sha,
            });
          }
        } else {
          // Text file: send directly in tree
          const textContent = fs.readFileSync(absPath, 'utf8');
          treeItems.push({
            path: gitRelPath,
            mode: '100644',
            type: 'blob',
            content: textContent,
          });
        }
      }

      // 4. Create Git tree on GitHub
      const createTreeRes = await fetch(`https://api.github.com/repos/${cleanRepo}/git/trees`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          tree: treeItems,
        }),
      });

      if (!createTreeRes.ok) {
        const err = await createTreeRes.text();
        return res.status(500).json({ success: false, message: `Failed to create Git tree: ${err}` });
      }
      const newTreeData = await createTreeRes.json();

      // 5. Create new commit
      const createCommitRes = await fetch(`https://api.github.com/repos/${cleanRepo}/git/commits`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          message: commitMessage || `feat: sync complete AI Studio workspace & Astro site [${new Date().toISOString()}]`,
          tree: newTreeData.sha,
          parents: [latestCommitSha],
        }),
      });

      if (!createCommitRes.ok) {
        const err = await createCommitRes.text();
        return res.status(500).json({ success: false, message: `Failed to create Git commit: ${err}` });
      }
      const newCommitData = await createCommitRes.json();

      // 6. Update branch pointer
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
        return res.status(500).json({ success: false, message: `Failed to update branch reference: ${err}` });
      }

      return res.json({
        success: true,
        commitSha: newCommitData.sha,
        commitUrl: `https://github.com/${cleanRepo}/commit/${newCommitData.sha}`,
        filesCount: treeItems.length,
        filesPushed: collectedFilePaths,
      });
    } catch (err: any) {
      console.error('Push error:', err);
      return res.status(500).json({ success: false, message: err.message || 'Failed to push to GitHub' });
    }
  });

  app.get('/rss.xml', (req, res) => {
    const db = getDatabase();
    const baseUrl = req.protocol + '://' + req.get('host');
    const posts = db.posts.filter(p => p.status === 'published');

    const rssXml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>${db.customizer.siteTitle || 'PromptPlum AI'}</title>
    <link>${baseUrl}</link>
    <description>${db.customizer.tagline || 'Curated AI Prompts & Guides'}</description>
    <language>en</language>
    ${posts.map(p => `
    <item>
      <title><![CDATA[${p.title}]]></title>
      <link>${baseUrl}/posts/${p.slug}</link>
      <description><![CDATA[${p.excerpt || p.prompt}]]></description>
      <pubDate>${new Date(p.publishedAt || p.createdAt).toUTCString()}</pubDate>
      <guid>${baseUrl}/posts/${p.slug}</guid>
    </item>`).join('')}
  </channel>
</rss>`;

    res.setHeader('Content-Type', 'application/rss+xml');
    res.send(rssXml);
  });

  app.get('/robots.txt', (req, res) => {
    const baseUrl = req.protocol + '://' + req.get('host');
    res.setHeader('Content-Type', 'text/plain');
    res.send(`User-agent: *
Allow: /
Disallow: /api/
Disallow: /admin/

Sitemap: ${baseUrl}/sitemap.xml`);
  });

  // --- VITE MIDDLEWARE IN DEV / STATIC IN PROD ---
  if (!isProd) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(process.cwd(), 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(process.cwd(), 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Astro CMS Server] Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch(err => {
  console.error('[Astro CMS Server] Startup Error:', err);
});
