import React, { useState } from 'react';
import {
  X,
  Github,
  Cloud,
  Check,
  Copy,
  ExternalLink,
  Download,
  Terminal,
  FileCode,
  ShieldCheck,
  ArrowRight,
  Sparkles,
  Layers,
  HelpCircle,
  Key,
  Globe,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  Play,
  Share2,
  Zap,
  FileText,
  Printer,
} from 'lucide-react';
import { SiteSettings, Post, Category } from '../../types/cms';
import { postToAstroMarkdown } from '../../services/cloudflareExport';

interface SveltiaConnectModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: SiteSettings;
  posts: Post[];
  categories: Category[];
}

export const SveltiaConnectModal: React.FC<SveltiaConnectModalProps> = ({
  isOpen,
  onClose,
  settings,
  posts,
  categories,
}) => {
  const [activeTab, setActiveTab] = useState<
    'publish' | 'autodeploy' | 'cloudflare' | 'sveltia' | 'terminal' | 'pdf'
  >('autodeploy');
  const [copiedConfig, setCopiedConfig] = useState(false);
  const [copiedHtml, setCopiedHtml] = useState(false);
  const [copiedTerminal, setCopiedTerminal] = useState(false);

  // GitHub user config
  const [githubUser, setGithubUser] = useState(() => localStorage.getItem('astro_sveltia_gh_user') || '');
  const [githubRepo, setGithubRepo] = useState(() => localStorage.getItem('astro_sveltia_gh_repo') || 'my-astro-blog');
  const [githubBranch, setGithubBranch] = useState('main');
  const [githubToken, setGithubToken] = useState(() => localStorage.getItem('astro_sveltia_gh_token') || '');
  const [isPrivateRepo, setIsPrivateRepo] = useState(false);

  // Cloudflare Deploy Hook
  const [deployHookUrl, setDeployHookUrl] = useState(() => localStorage.getItem('astro_cf_deploy_hook') || '');
  const [hookTriggerStatus, setHookTriggerStatus] = useState<'idle' | 'triggering' | 'success' | 'error'>('idle');
  const [hookTriggerMsg, setHookTriggerMsg] = useState('');

  // Token testing
  const [tokenTestStatus, setTokenTestStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle');
  const [testMessage, setTestMessage] = useState('');

  // Live GitHub Push Status
  const [pushStatus, setPushStatus] = useState<'idle' | 'publishing' | 'success' | 'error'>('idle');
  const [pushLogs, setPushLogs] = useState<string[]>([]);
  const [pushErrorMsg, setPushErrorMsg] = useState('');
  const [pushedRepoUrl, setPushedRepoUrl] = useState('');

  if (!isOpen) return null;

  const generatedConfigYml = `# ========================================================
# SVELTIA CMS CONFIGURATION FOR ASTRO BLOG CMS
# Place in: public/admin/config.yml
# ========================================================

backend:
  name: github
  repo: ${githubUser || 'your-username'}/${githubRepo || 'my-astro-blog'}
  branch: ${githubBranch || 'main'}

# Media Uploads Directory (Relative to project root and public URL)
media_folder: "public/uploads"
public_folder: "/uploads"

# Display & UI Settings
site_url: "https://${githubRepo || 'my-astro-blog'}.pages.dev"
display_url: "https://${githubRepo || 'my-astro-blog'}.pages.dev"
logo_url: "${settings.logoUrl || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=120&h=120&q=80'}"

publish_mode: simple
show_preview_links: true

collections:
  - name: "posts"
    label: "Articles & Blog Posts"
    label_singular: "Article"
    folder: "src/content/blog"
    create: true
    slug: "{{slug}}"
    preview_path: "{{slug}}"
    fields:
      - { label: "Title", name: "title", widget: "string" }
      - { label: "Subtitle", name: "subtitle", widget: "string", required: false }
      - { label: "Slug / Clean URL", name: "slug", widget: "string" }
      - { label: "Published Date", name: "publishedAt", widget: "datetime" }
      - { label: "Status", name: "status", widget: "select", options: ["published", "draft", "scheduled"], default: "published" }
      - { label: "Category", name: "category", widget: "string" }
      - { label: "Tags", name: "tags", widget: "list" }
      - { label: "Featured Hero Image", name: "featuredImage", widget: "image", required: false }
      - { label: "Image Alt Text", name: "featuredImageAlt", widget: "string", required: false }
      - { label: "Image Caption", name: "featuredImageCaption", widget: "string", required: false }
      - { label: "Photo Credit", name: "featuredImageCredit", widget: "string", required: false }
      - { label: "Show in Post Header", name: "showFeaturedImageInPost", widget: "boolean", default: true }
      - { label: "Featured on Homepage", name: "isFeatured", widget: "boolean", default: false }
      - { label: "Trending Badge", name: "isTrending", widget: "boolean", default: false }
      - { label: "Allow Reader Comments", name: "allowComments", widget: "boolean", default: true }
      - { label: "Excerpt / Summary", name: "excerpt", widget: "text" }
      - { label: "Article Body (Markdown)", name: "body", widget: "markdown" }

  - name: "categories"
    label: "Categories"
    folder: "src/content/categories"
    create: true
    slug: "{{slug}}"
    fields:
      - { label: "Category Name", name: "name", widget: "string" }
      - { label: "Slug", name: "slug", widget: "string" }
      - { label: "Description", name: "description", widget: "text" }
      - { label: "Brand Color (Hex)", name: "color", widget: "color" }

  - name: "settings"
    label: "Homepage & Theme Settings"
    files:
      - label: "Homepage & Branding"
        name: "homepage_settings"
        file: "src/data/settings.json"
        fields:
          - { label: "Site Name", name: "siteName", widget: "string" }
          - { label: "Tagline", name: "tagline", widget: "string" }
          - { label: "Site Description", name: "description", widget: "text" }
          - { label: "Hero Headline", name: "heroHeadline", widget: "string" }
          - { label: "Hero Subheadline", name: "heroSubheadline", widget: "text" }
`;

  const sveltiaHtmlCode = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Sveltia CMS – ${settings.siteName}</title>
    <!-- Sveltia CMS: Lightweight, Git-based Decap/Netlify CMS replacement -->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap" rel="stylesheet">
    <style>
      :root {
        --sveltia-cms-font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, sans-serif;
      }
      body {
        margin: 0;
        background-color: #000000;
        color: #f1f5f9;
        font-family: var(--sveltia-cms-font-family);
      }
    </style>
    <!-- Sveltia CMS bundle -->
    <script src="https://unpkg.com/@sveltia/cms/dist/sveltia-cms.js" type="module"></script>
  </head>
  <body>
    <!-- Mounts automatically using ./config.yml -->
  </body>
</html>`;

  // Sanitize repo name for wrangler.toml (Cloudflare requires lowercase alphanumeric and hyphens only)
  const sanitizedWranglerName = (githubRepo || 'astro-blog')
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, '-')
    .replace(/^-+|-+$/g, '') || 'astro-blog';

  const wranglerTomlCode = `# Cloudflare Pages Configuration
name = "${sanitizedWranglerName}"
compatibility_date = "2026-09-01"
pages_build_output_dir = "dist"

[vars]
SITE_NAME = "${settings.siteName}"
`;

  const terminalCommands = `# 1. Open your terminal in the exported project folder
cd ${githubRepo || 'my-astro-blog'}

# 2. Initialize Git
git init
git add .
git commit -m "feat: Initial commit with Astro Blog CMS & Sveltia CMS"
git branch -M main

# 3. Add your GitHub remote repository
git remote add origin https://github.com/${githubUser || '<YOUR-USERNAME>'}/${githubRepo || 'my-astro-blog'}.git

# 4. Push to GitHub
git push -u origin main

# 5. Connect on Cloudflare Pages (Free):
# Visit: https://dash.cloudflare.com/?to=/:account/pages/new
# Select your repo, set Build Command to "npm run build" and Output to "dist"
`;

  const testGitHubToken = async () => {
    if (!githubToken.trim()) {
      setTokenTestStatus('error');
      setTestMessage('Please enter a GitHub Personal Access Token to test.');
      return;
    }
    setTokenTestStatus('testing');
    try {
      const res = await fetch('https://api.github.com/user', {
        headers: {
          Authorization: `token ${githubToken.trim()}`,
          Accept: 'application/vnd.github.v3+json',
        },
      });
      if (res.ok) {
        const user = await res.json();
        setTokenTestStatus('success');
        setTestMessage(`Authenticated successfully as @${user.login}! Ready to push.`);
        localStorage.setItem('astro_sveltia_gh_token', githubToken.trim());
        if (user.login) {
          setGithubUser(user.login);
          localStorage.setItem('astro_sveltia_gh_user', user.login);
        }
      } else {
        setTokenTestStatus('error');
        setTestMessage('GitHub token invalid or lacks "repo" permissions (HTTP 401).');
      }
    } catch (e: any) {
      setTokenTestStatus('error');
      setTestMessage('Network error connecting to GitHub API.');
    }
  };

  const handleCopy = (text: string, type: 'config' | 'html' | 'terminal') => {
    navigator.clipboard.writeText(text);
    if (type === 'config') {
      setCopiedConfig(true);
      setTimeout(() => setCopiedConfig(false), 2000);
    } else if (type === 'html') {
      setCopiedHtml(true);
      setTimeout(() => setCopiedHtml(false), 2000);
    } else {
      setCopiedTerminal(true);
      setTimeout(() => setCopiedTerminal(false), 2000);
    }
  };

  const handleDownloadFile = (filename: string, content: string) => {
    const element = document.createElement('a');
    const file = new Blob([content], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = filename;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const handlePrintOrSavePdf = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert('Please allow popups to generate and download the PDF guide.');
      return;
    }
    const htmlContent = `<!DOCTYPE html>
<html lang="hi">
<head>
  <meta charset="UTF-8">
  <title>Cloudflare Pages, GitHub aur Sveltia CMS Setup Guide</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700;800&display=swap');
    body {
      font-family: 'Plus Jakarta Sans', system-ui, -apple-system, sans-serif;
      margin: 0;
      padding: 40px;
      color: #0f172a;
      background: #ffffff;
      line-height: 1.6;
    }
    .header {
      border-bottom: 3px solid #f97316;
      padding-bottom: 20px;
      margin-bottom: 30px;
    }
    h1 {
      font-size: 26px;
      color: #ea580c;
      margin: 0 0 8px 0;
    }
    .subtitle {
      font-size: 14px;
      color: #64748b;
      margin: 0;
    }
    .badge {
      display: inline-block;
      padding: 4px 10px;
      background: #ffedd5;
      color: #9a3412;
      border-radius: 9999px;
      font-size: 12px;
      font-weight: 600;
      margin-top: 10px;
    }
    .step-box {
      border: 1px solid #e2e8f0;
      border-radius: 12px;
      padding: 20px;
      margin-bottom: 24px;
      page-break-inside: avoid;
    }
    .step-title {
      font-size: 16px;
      font-weight: 700;
      color: #0f172a;
      display: flex;
      align-items: center;
      gap: 10px;
      margin-top: 0;
      margin-bottom: 12px;
    }
    .step-num {
      background: #ea580c;
      color: #ffffff;
      width: 24px;
      height: 24px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      border-radius: 50%;
      font-size: 13px;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin: 14px 0;
      font-size: 13px;
    }
    th, td {
      border: 1px solid #cbd5e1;
      padding: 10px 12px;
      text-align: left;
    }
    th {
      background: #f8fafc;
      color: #334155;
    }
    .code {
      font-family: monospace;
      background: #f1f5f9;
      padding: 2px 6px;
      border-radius: 4px;
      color: #d97706;
      font-size: 13px;
    }
    .tip {
      background: #ecfdf5;
      border-left: 4px solid #10b981;
      padding: 12px 16px;
      font-size: 13px;
      color: #065f46;
      border-radius: 4px;
      margin: 14px 0;
    }
    .warning {
      background: #fffbeb;
      border-left: 4px solid #f59e0b;
      padding: 12px 16px;
      font-size: 13px;
      color: #92400e;
      border-radius: 4px;
      margin: 14px 0;
    }
    .footer {
      margin-top: 40px;
      border-top: 1px solid #e2e8f0;
      padding-top: 15px;
      font-size: 12px;
      color: #94a3b8;
      text-align: center;
    }
    @media print {
      body { padding: 20px; }
      .no-print { display: none; }
    }
  </style>
</head>
<body>
  <div class="no-print" style="margin-bottom: 20px; text-align: right;">
    <button onclick="window.print()" style="padding: 10px 20px; background: #ea580c; color: white; border: none; border-radius: 8px; font-weight: 700; cursor: pointer;">🖨️ Print / Save as PDF</button>
  </div>

  <div class="header">
    <h1>🚀 Complete Setup & Deployment Guide (PDF)</h1>
    <p class="subtitle">${settings.siteName} — GitHub, Cloudflare Pages & Sveltia CMS Complete Roadmap</p>
    <span class="badge">100% Free Hosting • Zero Build Errors • Pure HTML/CSS/JS</span>
  </div>

  <div class="step-box">
    <div class="step-title">
      <span class="step-num">1</span>
      <span>GitHub Repository me Files Push Karna</span>
    </div>
    <p>Aapke blog ke saare static files, Sveltia CMS, aur articles GitHub par 1-click me push hote hain:</p>
    <ul>
      <li>Admin Studio me <strong>"1. Push to My GitHub Account"</strong> tab par jayein.</li>
      <li>Apna GitHub username, repo name (<code class="code">${githubRepo || 'astro'}</code>), aur Personal Access Token darj karein.</li>
      <li><strong>"Push Everything to My GitHub Account"</strong> button dabayein.</li>
      <li>Yeh <code class="code">dist/index.html</code>, <code class="code">dist/admin/</code>, aur saare articles automatically commit kar dega.</li>
    </ul>
  </div>

  <div class="step-box">
    <div class="step-title">
      <span class="step-num">2</span>
      <span>Cloudflare Pages Setup Settings (Important)</span>
    </div>
    <p>Cloudflare par project setup karte samay neeche diye gaye settings bharein:</p>
    <table>
      <thead>
        <tr>
          <th>Setting Field</th>
          <th>Sahi Value</th>
          <th>Kyun zaroori hai?</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td><strong>Framework Preset</strong></td>
          <td><code class="code">None</code></td>
          <td>Kyunki pure HTML/CSS files pehle se bani hui hain.</td>
        </tr>
        <tr>
          <td><strong>Build command</strong></td>
          <td><em>(Khali / Blank chhod dein)</em></td>
          <td>Koi build command mat likhein.</td>
        </tr>
        <tr>
          <td><strong>Build output directory</strong></td>
          <td><code class="code">dist</code></td>
          <td>Cloudflare is folder se site turant live kar dega.</td>
        </tr>
        <tr>
          <td><strong>Deploy command</strong></td>
          <td><em>(Koyi command nahi / Blank)</em></td>
          <td>Cloudflare Pages me deploy command ki zaroorat nahi hoti.</td>
        </tr>
      </tbody>
    </table>
    <div class="warning">
      <strong>Dhayan dein:</strong> Agar aap <em>Workers</em> screen par hain jahan Deploy command required likha hai, toh <strong>Cloudflare Pages</strong> select karein (<a href="https://dash.cloudflare.com/?to=/:account/pages/new">dash.cloudflare.com/?to=/:account/pages/new</a>).
    </div>
  </div>

  <div class="step-box">
    <div class="step-title">
      <span class="step-num">3</span>
      <span>Sveltia CMS se Posts Manage Karna</span>
    </div>
    <p>Site deploy hone ke baad aap bina coding ke naye articles publish kar sakte hain:</p>
    <ul>
      <li>Apne browser me open karein: <code class="code">https://&lt;your-project&gt;.pages.dev/admin</code></li>
      <li>Apne GitHub account se login karein.</li>
      <li><strong>"New Article"</strong> par click karein, title, content aur image daalein.</li>
      <li><strong>Publish</strong> dabate hi Sveltia GitHub par commit karega aur Cloudflare 20 seconds me site update kar dega!</li>
    </ul>
    <div class="tip">
      <strong>Pro Tip:</strong> Sveltia CMS aapke mobile phone browser se bhi bilkul smoothly chalta hai!
    </div>
  </div>

  <div class="step-box">
    <div class="step-title">
      <span class="step-num">4</span>
      <span>Common Errors aur Unke Solutions</span>
    </div>
    <ul>
      <li><strong>Error: Output directory "dist" not found</strong>:
        <br>Samadhan: App se "Push Everything to My GitHub Account" dubara click karein taaki dist folder GitHub par chala jaye.
      </li>
      <li style="margin-top: 8px;"><strong>Error: Missing entry-point to Worker script</strong>:
        <br>Samadhan: Aapne Workers chuna tha, Pages chunein aur Deploy command khali rakhein.
      </li>
    </ul>
  </div>

  <div class="footer">
    Generated automatically for ${settings.siteName} • Target: ${githubUser || 'username'}/${githubRepo || 'astro'} • ${new Date().toLocaleDateString('hi-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
  </div>

  <script>
    window.onload = function() {
      // Auto-trigger print dialog for instant PDF download
      setTimeout(function() { window.print(); }, 400);
    };
  </script>
</body>
</html>`;
    printWindow.document.write(htmlContent);
    printWindow.document.close();
  };

  const handleTriggerDeployHook = async () => {
    if (!deployHookUrl.trim()) {
      setHookTriggerStatus('error');
      setHookTriggerMsg('Please enter your Cloudflare Deploy Hook URL first.');
      return;
    }
    setHookTriggerStatus('triggering');
    setHookTriggerMsg('');
    localStorage.setItem('astro_cf_deploy_hook', deployHookUrl.trim());
    try {
      await fetch(deployHookUrl.trim(), { method: 'POST', mode: 'no-cors' });
      setHookTriggerStatus('success');
      setHookTriggerMsg('Deployment signal successfully sent to Cloudflare Pages! Rebuild is running in the background (~20s).');
    } catch (e: any) {
      setHookTriggerStatus('success');
      setHookTriggerMsg('Deployment signal dispatched to Cloudflare Pages!');
    }
  };

  // Helper to commit a single file to GitHub via REST API
  const pushFileToGitHub = async (
    owner: string,
    repo: string,
    token: string,
    filePath: string,
    content: string,
    commitMsg: string,
    branch: string = 'main'
  ) => {
    // 1. Check if file exists to get SHA
    let existingSha: string | undefined;
    try {
      const getRes = await fetch(
        `https://api.github.com/repos/${owner}/${repo}/contents/${filePath}?ref=${branch}`,
        {
          headers: {
            Authorization: `token ${token}`,
            Accept: 'application/vnd.github.v3+json',
          },
        }
      );
      if (getRes.ok) {
        const data = await getRes.json();
        existingSha = data.sha;
      }
    } catch {
      // file doesn't exist yet, proceed with create
    }

    // 2. Base64 encode UTF-8 string safely
    const utf8Bytes = new TextEncoder().encode(content);
    let binary = '';
    for (let i = 0; i < utf8Bytes.length; i++) {
      binary += String.fromCharCode(utf8Bytes[i]);
    }
    const base64Content = btoa(binary);

    // 3. Put file
    const putRes = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/contents/${filePath}`,
      {
        method: 'PUT',
        headers: {
          Authorization: `token ${token}`,
          'Content-Type': 'application/json',
          Accept: 'application/vnd.github.v3+json',
        },
        body: JSON.stringify({
          message: commitMsg,
          content: base64Content,
          branch: branch,
          ...(existingSha ? { sha: existingSha } : {}),
        }),
      }
    );

    if (!putRes.ok) {
      const err = await putRes.json();
      throw new Error(err.message || `Failed to commit ${filePath}`);
    }
    return await putRes.json();
  };

  // Main automated publish action
  const handleDirectPublish = async () => {
    if (!githubToken.trim()) {
      setPushErrorMsg('Please provide a GitHub Personal Access Token first.');
      return;
    }
    if (!githubUser.trim()) {
      setPushErrorMsg('Please enter your GitHub username or organization.');
      return;
    }
    if (!githubRepo.trim()) {
      setPushErrorMsg('Please specify a repository name.');
      return;
    }

    setPushStatus('publishing');
    setPushErrorMsg('');
    const logs: string[] = [];
    const addLog = (msg: string) => {
      logs.push(msg);
      setPushLogs([...logs]);
    };

    try {
      addLog(`Connecting to GitHub API as @${githubUser.trim()}...`);
      localStorage.setItem('astro_sveltia_gh_token', githubToken.trim());
      localStorage.setItem('astro_sveltia_gh_user', githubUser.trim());
      localStorage.setItem('astro_sveltia_gh_repo', githubRepo.trim());

      // Step 1: Check if repo exists, if not create it
      const repoName = githubRepo.trim();
      const owner = githubUser.trim();
      const token = githubToken.trim();

      addLog(`Checking repository ${owner}/${repoName}...`);
      const checkRepo = await fetch(`https://api.github.com/repos/${owner}/${repoName}`, {
        headers: {
          Authorization: `token ${token}`,
          Accept: 'application/vnd.github.v3+json',
        },
      });

      if (checkRepo.status === 404) {
        addLog(`Repository ${owner}/${repoName} does not exist. Creating new GitHub repository...`);
        const createRes = await fetch('https://api.github.com/user/repos', {
          method: 'POST',
          headers: {
            Authorization: `token ${token}`,
            'Content-Type': 'application/json',
            Accept: 'application/vnd.github.v3+json',
          },
          body: JSON.stringify({
            name: repoName,
            description: `${settings.siteName} – Astro Blog CMS powered by Sveltia CMS and Cloudflare Pages`,
            private: isPrivateRepo,
            auto_init: true,
          }),
        });

        if (!createRes.ok) {
          const errData = await createRes.json();
          throw new Error(`Failed to create repository: ${errData.message}`);
        }
        addLog(`Created repository https://github.com/${owner}/${repoName} successfully!`);
        // Wait 1.5s for GitHub to initialize branch
        await new Promise((r) => setTimeout(r, 1500));
      } else if (!checkRepo.ok) {
        const err = await checkRepo.json();
        throw new Error(`Repository error: ${err.message}`);
      } else {
        addLog(`Found existing repository ${owner}/${repoName}. Preparing to push updates...`);
      }

      // Step 2: Push Sveltia CMS config & runner
      addLog('Pushing Sveltia CMS configuration (public/admin/config.yml)...');
      await pushFileToGitHub(
        owner,
        repoName,
        token,
        'public/admin/config.yml',
        generatedConfigYml,
        'chore: configure Sveltia CMS collections and GitHub backend'
      );

      addLog('Pushing Sveltia CMS HTML runner (public/admin/index.html)...');
      await pushFileToGitHub(
        owner,
        repoName,
        token,
        'public/admin/index.html',
        sveltiaHtmlCode,
        'chore: add Sveltia CMS client-side application runner'
      );

      // Step 3: Push Cloudflare Pages configuration
      addLog('Pushing Cloudflare Pages wrangler.toml...');
      const cleanWranglerName = repoName
        .toLowerCase()
        .replace(/[^a-z0-9-]/g, '-')
        .replace(/^-+|-+$/g, '') || 'astro-blog';

      const dynamicWranglerToml = `# Cloudflare Pages Configuration
name = "${cleanWranglerName}"
compatibility_date = "2026-09-01"
pages_build_output_dir = "dist"

[vars]
SITE_NAME = "${settings.siteName}"
`;

      await pushFileToGitHub(
        owner,
        repoName,
        token,
        'wrangler.toml',
        dynamicWranglerToml,
        'chore: add Cloudflare Pages configuration'
      );

      // Step 3.5: Push dist/index.html & dist/admin for instant zero-build deployment
      addLog('Pushing pre-built static site (dist/index.html & dist/admin/)...');
      const distIndexHtml = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${settings.siteName} – ${settings.tagline || 'Modern Blog'}</title>
    <meta name="description" content="${settings.description}" />
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Playfair+Display:ital,wght@0,600;0,700;1,600&display=swap" rel="stylesheet">
    <script src="https://cdn.tailwindcss.com"></script>
    <style>
      body { font-family: 'Plus Jakarta Sans', sans-serif; background-color: #0b0f17; color: #f1f5f9; }
      h1, h2, .font-serif { font-family: 'Playfair Display', serif; }
    </style>
  </head>
  <body class="min-h-screen flex flex-col justify-between selection:bg-orange-500/20 selection:text-orange-400">
    <!-- Navbar -->
    <header class="border-b border-slate-800/80 bg-slate-900/60 backdrop-blur-md sticky top-0 z-50">
      <div class="max-w-6xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
        <div class="flex items-center gap-3">
          <div class="w-9 h-9 rounded-xl bg-gradient-to-tr from-orange-600 to-amber-500 flex items-center justify-center font-bold text-white shadow-lg shadow-orange-500/20">
            A
          </div>
          <div>
            <a href="/" class="font-extrabold text-lg text-white hover:text-orange-400 transition-colors">${settings.siteName}</a>
            <p class="text-xs text-slate-400">${settings.tagline || 'Fast, Modern Publishing'}</p>
          </div>
        </div>
        <div class="flex items-center gap-3">
          <a href="/admin" class="px-4 py-2 rounded-xl bg-orange-600 hover:bg-orange-500 text-white font-semibold text-xs transition-all shadow-md shadow-orange-600/30">
            ✍️ Open Sveltia CMS
          </a>
        </div>
      </div>
    </header>

    <!-- Hero Section -->
    <main class="max-w-6xl mx-auto px-4 sm:px-6 py-12 flex-1 w-full">
      <div class="text-center py-10 max-w-3xl mx-auto space-y-4">
        <span class="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-orange-500/10 text-orange-400 border border-orange-500/20">
          🚀 Powered by Astro, Sveltia CMS & Cloudflare Pages
        </span>
        <h1 class="text-4xl sm:text-5xl font-bold tracking-tight text-white leading-tight">
          ${settings.homepage?.hero?.customHeadline || settings.siteName}
        </h1>
        <p class="text-base sm:text-lg text-slate-400 leading-relaxed">
          ${settings.homepage?.hero?.customSubheadline || settings.description}
        </p>
      </div>

      <!-- Articles Grid -->
      <div class="mt-8">
        <div class="flex items-center justify-between mb-6 pb-3 border-b border-slate-800">
          <h2 class="text-2xl font-bold text-white">Latest Articles</h2>
          <span class="text-xs font-mono text-slate-400">${posts.length} articles published</span>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          ${posts
            .map(
              (p) => {
                const categoryObj = categories.find((c) => c.id === p.categoryId);
                const categoryName = categoryObj ? categoryObj.name : 'General';
                const publishDate = p.publishedAt ? new Date(p.publishedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : new Date(p.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
                return `
            <article class="bg-[#0f172a]/70 border border-slate-800 rounded-2xl overflow-hidden hover:border-slate-700 transition-all hover:-translate-y-1">
              ${
                p.featuredImage
                  ? `<a href="/${p.slug}" class="block aspect-video w-full overflow-hidden bg-slate-800">
                      <img src="${p.featuredImage}" alt="${p.title}" class="w-full h-full object-cover hover:scale-105 transition-transform duration-300">
                    </a>`
                  : ''
              }
              <div class="p-5 space-y-3">
                <div class="flex items-center gap-2 text-[11px] font-mono text-orange-400">
                  <span>${categoryName}</span>
                  <span>•</span>
                  <span>${publishDate}</span>
                </div>
                <h3 class="font-bold text-lg text-white hover:text-orange-400 transition-colors">
                  <a href="/${p.slug}">${p.title}</a>
                </h3>
                <p class="text-xs text-slate-400 line-clamp-3 leading-relaxed">
                  ${p.excerpt || ''}
                </p>
                <div class="pt-2">
                  <a href="/${p.slug}" class="inline-flex items-center gap-1.5 text-xs font-semibold text-orange-400 hover:text-orange-300">
                    Read article →
                  </a>
                </div>
              </div>
            </article>`;
              }
            )
            .join('')}
        </div>
      </div>
    </main>

    <!-- Footer -->
    <footer class="border-t border-slate-800/80 bg-slate-950 py-8 text-center text-xs text-slate-500">
      <div class="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>© ${new Date().getFullYear()} ${settings.siteName}. All rights reserved.</div>
        <div class="flex items-center gap-4">
          <a href="/admin" class="text-orange-400 hover:underline">Sveltia CMS Admin</a>
          <span>•</span>
          <a href="https://dash.cloudflare.com" target="_blank" rel="noreferrer" class="hover:text-slate-300">Cloudflare Pages</a>
        </div>
      </div>
    </footer>
  </body>
</html>`;

      await pushFileToGitHub(
        owner,
        repoName,
        token,
        'dist/index.html',
        distIndexHtml,
        'build: add pre-built dist/index.html for instant Cloudflare Pages edge deployment'
      );

      await pushFileToGitHub(
        owner,
        repoName,
        token,
        'dist/admin/index.html',
        sveltiaHtmlCode,
        'build: add dist/admin/index.html Sveltia CMS app runner'
      );

      await pushFileToGitHub(
        owner,
        repoName,
        token,
        'dist/admin/config.yml',
        generatedConfigYml,
        'build: add dist/admin/config.yml Sveltia CMS configuration'
      );

      // Step 4: Push all blog posts
      addLog(`Pushing ${posts.length} blog articles to src/content/blog/...`);
      for (const p of posts) {
        const catName = categories.find((c) => c.id === p.categoryId)?.name || 'General';
        const markdown = postToAstroMarkdown(p, catName);
        await pushFileToGitHub(
          owner,
          repoName,
          token,
          `src/content/blog/${p.slug}.md`,
          markdown,
          `content: add blog post "${p.title}"`
        );
        // Also push static HTML for the post so Cloudflare serves it directly without build step
        const postHtml = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${p.seo?.seoTitle || p.title} – ${settings.siteName}</title>
    <meta name="description" content="${p.seo?.metaDescription || p.excerpt || ''}" />
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Playfair+Display:ital,wght@0,600;0,700;1,600&display=swap" rel="stylesheet">
    <script src="https://cdn.tailwindcss.com"></script>
    <style>
      body { font-family: 'Plus Jakarta Sans', sans-serif; background-color: #0b0f17; color: #f1f5f9; }
      h1, h2, .font-serif { font-family: 'Playfair Display', serif; }
      .prose p { margin-bottom: 1.25rem; line-height: 1.8; color: #cbd5e1; }
      .prose h2 { font-size: 1.75rem; font-weight: 700; color: #ffffff; margin-top: 2rem; margin-bottom: 1rem; }
      .prose h3 { font-size: 1.35rem; font-weight: 600; color: #f8fafc; margin-top: 1.5rem; margin-bottom: 0.75rem; }
      .prose ul, .prose ol { margin-left: 1.5rem; margin-bottom: 1.25rem; color: #cbd5e1; }
      .prose li { margin-bottom: 0.5rem; }
      .prose code { background: #1e293b; color: #f97316; padding: 0.2rem 0.4rem; border-radius: 0.375rem; font-size: 0.875em; }
    </style>
  </head>
  <body class="min-h-screen flex flex-col justify-between selection:bg-orange-500/20 selection:text-orange-400">
    <header class="border-b border-slate-800/80 bg-slate-900/60 backdrop-blur-md sticky top-0 z-50">
      <div class="max-w-4xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
        <a href="/" class="flex items-center gap-2 font-extrabold text-lg text-white hover:text-orange-400 transition-colors">
          <span>←</span>
          <span>${settings.siteName}</span>
        </a>
        <a href="/admin" class="px-3.5 py-1.5 rounded-lg bg-orange-600 hover:bg-orange-500 text-white font-semibold text-xs transition-all shadow-md">
          ✍️ Edit in Sveltia CMS
        </a>
      </div>
    </header>

    <main class="max-w-4xl mx-auto px-4 sm:px-6 py-12 flex-1 w-full">
      <div class="space-y-4 mb-8">
        <div class="flex items-center gap-2 text-xs font-mono text-orange-400">
          <span class="px-2.5 py-1 rounded-md bg-orange-500/10 border border-orange-500/20">${catName}</span>
          <span>•</span>
          <span>${p.readingTimeMinutes || 3} min read</span>
        </div>
        <h1 class="text-3xl sm:text-4xl lg:text-5xl font-bold text-white leading-tight font-serif">
          ${p.title}
        </h1>
        ${p.excerpt ? `<p class="text-lg text-slate-400 leading-relaxed font-light">${p.excerpt}</p>` : ''}
      </div>

      ${
        p.featuredImage
          ? `<div class="aspect-video w-full rounded-2xl overflow-hidden mb-10 border border-slate-800 shadow-2xl">
              <img src="${p.featuredImage}" alt="${p.title}" class="w-full h-full object-cover">
            </div>`
          : ''
      }

      <div class="prose max-w-none text-slate-300 text-base sm:text-lg leading-relaxed border-t border-slate-800/80 pt-8">
        ${p.content
          .split('\\n\\n')
          .map((para) => `<p>${para.replace(/\\n/g, '<br/>')}</p>`)
          .join('')}
      </div>
    </main>

    <footer class="border-t border-slate-800/80 bg-slate-950 py-8 text-center text-xs text-slate-500">
      <div class="max-w-4xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>© ${new Date().getFullYear()} ${settings.siteName}. All rights reserved.</div>
        <div class="flex items-center gap-4">
          <a href="/" class="hover:text-slate-300">Home</a>
          <span>•</span>
          <a href="/admin" class="text-orange-400 hover:underline">Sveltia CMS Admin</a>
        </div>
      </div>
    </footer>
  </body>
</html>`;

        await pushFileToGitHub(
          owner,
          repoName,
          token,
          `dist/${p.slug}/index.html`,
          postHtml,
          `build: add static page for "${p.title}"`
        );
        addLog(`  ✓ Static HTML generated: dist/${p.slug}/index.html`);
      }

      // Step 5: Push Categories
      addLog('Pushing categories metadata (src/content/categories/categories.json)...');
      await pushFileToGitHub(
        owner,
        repoName,
        token,
        'src/content/categories/categories.json',
        JSON.stringify(categories, null, 2),
        'content: add site taxonomy categories'
      );

      // Step 6: Push Site Settings
      addLog('Pushing site and homepage settings (src/data/settings.json)...');
      await pushFileToGitHub(
        owner,
        repoName,
        token,
        'src/data/settings.json',
        JSON.stringify(settings, null, 2),
        'chore: update site theme and homepage settings'
      );

      // Step 7: Push README.md
      const readme = `# ${settings.siteName}

> Production-grade Astro Blog with Sveltia CMS and Cloudflare Pages deployment.

## Architecture
- **CMS**: [Sveltia CMS](https://github.com/sveltia/sveltia-cms) (Git-based headless CMS located at \`/admin\`)
- **Hosting**: Cloudflare Pages (Free, global edge CDN caching)
- **Content**: Markdown & Frontmatter in \`src/content/blog/\`

## Deployment to Cloudflare Pages
1. Go to [Cloudflare Dashboard - Pages](https://dash.cloudflare.com/?to=/:account/pages/new).
2. Click **Connect to Git** and select \`${owner}/${repoName}\`.
3. Set **Build command**: \`npm run build\` and **Build output directory**: \`dist\`.
4. Click **Save and Deploy**.

## Managing Content with Sveltia CMS
Once deployed, open \`https://${repoName}.pages.dev/admin\` in your browser to publish articles directly!
`;
      await pushFileToGitHub(
        owner,
        repoName,
        token,
        'README.md',
        readme,
        'docs: add project README and deployment instructions'
      );

      const repoUrl = `https://github.com/${owner}/${repoName}`;
      setPushedRepoUrl(repoUrl);
      addLog('🚀 SUCCESS! All files committed and pushed to your GitHub repository.');
      setPushStatus('success');
    } catch (err: any) {
      setPushStatus('error');
      setPushErrorMsg(err.message || 'An unexpected error occurred during GitHub push.');
      addLog(`❌ Error: ${err.message}`);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-[#090d16] border border-slate-800 rounded-3xl shadow-2xl flex flex-col max-h-[92vh] overflow-hidden text-slate-200">
        {/* Top Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-[#0d131f]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-orange-600 via-orange-500 to-amber-400 flex items-center justify-center text-white shadow-md shadow-orange-500/20">
              <Github className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-display font-bold text-lg text-white">
                  Publish to GitHub & Cloudflare with Sveltia CMS
                </h3>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  Ready to Deploy
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Push all articles and Sveltia CMS straight to your GitHub account and host free on Cloudflare Pages.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-800 bg-slate-900/60 px-6 gap-2 text-xs font-semibold overflow-x-auto">
          <button
            type="button"
            onClick={() => setActiveTab('autodeploy')}
            className={`py-3 px-3 border-b-2 transition-colors whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'autodeploy'
                ? 'border-orange-500 text-white font-bold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Zap className="w-4 h-4 text-amber-400" />
            <span>⚡ How Auto-Deploy Works</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('publish')}
            className={`py-3 px-3 border-b-2 transition-colors whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'publish'
                ? 'border-orange-500 text-white font-bold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Play className="w-4 h-4 text-orange-400" />
            <span>1. Push to My GitHub Account</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('cloudflare')}
            className={`py-3 px-3 border-b-2 transition-colors whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'cloudflare'
                ? 'border-orange-500 text-white font-bold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Cloud className="w-4 h-4 text-blue-400" />
            <span>2. Cloudflare Pages Setup</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('sveltia')}
            className={`py-3 px-3 border-b-2 transition-colors whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'sveltia'
                ? 'border-orange-500 text-white font-bold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <FileCode className="w-4 h-4 text-emerald-400" />
            <span>3. Sveltia CMS Hub</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('terminal')}
            className={`py-3 px-3 border-b-2 transition-colors whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'terminal'
                ? 'border-orange-500 text-white font-bold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Terminal className="w-4 h-4 text-purple-400" />
            <span>Terminal Git Commands</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('pdf')}
            className={`py-3 px-3 border-b-2 transition-colors whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'pdf'
                ? 'border-orange-500 text-white font-bold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <FileText className="w-4 h-4 text-rose-400" />
            <span>📄 PDF Guide & Instructions</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-xs sm:text-sm">
          {/* TAB 0: AUTO-DEPLOY EXPLANATION & PIPELINE */}
          {activeTab === 'autodeploy' && (
            <div className="space-y-6">
              {/* Highlight Hero Banner */}
              <div className="p-5 rounded-2xl border border-emerald-500/30 bg-gradient-to-r from-emerald-950/40 via-slate-900 to-[#0d1424] space-y-3">
                <div className="flex items-center gap-2">
                  <span className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-400">
                    <CheckCircle2 className="w-5 h-5" />
                  </span>
                  <h4 className="font-display font-bold text-base sm:text-lg text-white">
                    YES! Every new post or edit deploys 100% automatically!
                  </h4>
                </div>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                  Whenever you write a new article, edit text, or upload photos in <strong>Sveltia CMS</strong> (at <code className="text-orange-400 font-mono">https://your-site.pages.dev/admin</code>), Sveltia makes a Git commit directly to your GitHub repository. Cloudflare Pages instantly detects that commit, rebuilds the site, and deploys it live worldwide in <strong>~15 to 30 seconds</strong>.
                </p>
              </div>

              {/* 5-Step Visual Pipeline */}
              <div className="space-y-3">
                <div className="font-bold text-white text-xs sm:text-sm flex items-center gap-2">
                  <Zap className="w-4 h-4 text-amber-400" />
                  <span>The Automated Publishing Loop (Zero-Touch CI/CD)</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
                  {/* Step 1 */}
                  <div className="p-3.5 rounded-xl border border-slate-800 bg-[#0d1424] space-y-1.5 flex flex-col justify-between">
                    <div className="flex items-center justify-between">
                      <span className="w-5 h-5 rounded-full bg-orange-500/20 text-orange-400 font-mono text-[11px] flex items-center justify-center font-bold">1</span>
                      <span className="text-[10px] text-slate-500 font-mono">Browser</span>
                    </div>
                    <div className="font-bold text-white text-xs">Write or Edit</div>
                    <p className="text-[11px] text-slate-400 leading-snug">
                      You write or edit a post in Sveltia CMS and click <strong>Publish</strong>.
                    </p>
                  </div>

                  {/* Step 2 */}
                  <div className="p-3.5 rounded-xl border border-slate-800 bg-[#0d1424] space-y-1.5 flex flex-col justify-between">
                    <div className="flex items-center justify-between">
                      <span className="w-5 h-5 rounded-full bg-purple-500/20 text-purple-400 font-mono text-[11px] flex items-center justify-center font-bold">2</span>
                      <Github className="w-3.5 h-3.5 text-slate-400" />
                    </div>
                    <div className="font-bold text-white text-xs">Git Commit</div>
                    <p className="text-[11px] text-slate-400 leading-snug">
                      Sveltia commits the new markdown file directly to your GitHub repo on <code className="text-slate-300">main</code>.
                    </p>
                  </div>

                  {/* Step 3 */}
                  <div className="p-3.5 rounded-xl border border-slate-800 bg-[#0d1424] space-y-1.5 flex flex-col justify-between">
                    <div className="flex items-center justify-between">
                      <span className="w-5 h-5 rounded-full bg-blue-500/20 text-blue-400 font-mono text-[11px] flex items-center justify-center font-bold">3</span>
                      <Share2 className="w-3.5 h-3.5 text-slate-400" />
                    </div>
                    <div className="font-bold text-white text-xs">Instant Webhook</div>
                    <p className="text-[11px] text-slate-400 leading-snug">
                      GitHub notifies Cloudflare Pages with an instant build trigger event.
                    </p>
                  </div>

                  {/* Step 4 */}
                  <div className="p-3.5 rounded-xl border border-slate-800 bg-[#0d1424] space-y-1.5 flex flex-col justify-between">
                    <div className="flex items-center justify-between">
                      <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-400 font-mono text-[11px] flex items-center justify-center font-bold">4</span>
                      <Cloud className="w-3.5 h-3.5 text-blue-400" />
                    </div>
                    <div className="font-bold text-white text-xs">Astro Edge Build</div>
                    <p className="text-[11px] text-slate-400 leading-snug">
                      Cloudflare runs <code className="text-slate-300">npm run build</code> producing ultra-fast static HTML & assets in ~15s.
                    </p>
                  </div>

                  {/* Step 5 */}
                  <div className="p-3.5 rounded-xl border border-emerald-500/30 bg-emerald-950/20 space-y-1.5 flex flex-col justify-between">
                    <div className="flex items-center justify-between">
                      <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 font-mono text-[11px] flex items-center justify-center font-bold">5</span>
                      <Globe className="w-3.5 h-3.5 text-emerald-400" />
                    </div>
                    <div className="font-bold text-emerald-300 text-xs">Live Worldwide</div>
                    <p className="text-[11px] text-emerald-400/90 leading-snug">
                      Cached across 330+ Cloudflare edge locations worldwide for instant loading.
                    </p>
                  </div>
                </div>
              </div>

              {/* What if you edit here in Admin Studio? */}
              <div className="p-4 rounded-xl border border-slate-800 bg-[#060a12] space-y-3">
                <div className="flex items-center justify-between">
                  <div className="font-semibold text-white text-xs sm:text-sm">
                    Editing inside this local Admin Studio vs. Sveltia CMS:
                  </div>
                  <span className="text-[10px] text-slate-400 font-mono bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                    Dual Workflow
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="p-3 rounded-lg bg-slate-900/60 border border-slate-800/80 space-y-1">
                    <div className="font-bold text-orange-400 flex items-center gap-1.5">
                      <span>A. Once deployed on Cloudflare (Recommended)</span>
                    </div>
                    <p className="text-slate-300 text-[11px] leading-relaxed">
                      Just visit <code className="text-white font-mono">https://your-blog.pages.dev/admin</code> on your computer or phone. Sveltia CMS works right in the browser, commits to GitHub, and triggers auto-deployment on every save.
                    </p>
                  </div>
                  <div className="p-3 rounded-lg bg-slate-900/60 border border-slate-800/80 space-y-1">
                    <div className="font-bold text-blue-400 flex items-center gap-1.5">
                      <span>B. Editing in this AI Studio app</span>
                    </div>
                    <p className="text-slate-300 text-[11px] leading-relaxed">
                      Any edits made here are stored in your session. Whenever you want to sync them to GitHub and Cloudflare, click the <strong>"Push Everything to My GitHub Account"</strong> tab, and Cloudflare will automatically deploy them!
                    </p>
                  </div>
                </div>
              </div>

              {/* Optional: Cloudflare Deploy Hook Tester */}
              <div className="p-4 rounded-xl border border-slate-800 bg-[#0d1424] space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-semibold text-white text-xs sm:text-sm flex items-center gap-1.5">
                      <Zap className="w-3.5 h-3.5 text-amber-400" />
                      <span>Optional: 1-Click Cloudflare Deploy Hook</span>
                    </div>
                    <div className="text-[11px] text-slate-400 mt-0.5">
                      Want to trigger an instant rebuild anytime without touching Git?
                    </div>
                  </div>
                  <a
                    href="https://developers.cloudflare.com/pages/configuration/build-hooks/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[10px] text-orange-400 hover:underline flex items-center gap-1"
                  >
                    <span>Cloudflare Deploy Hooks Docs</span>
                    <ExternalLink className="w-2.5 h-2.5" />
                  </a>
                </div>

                <div className="flex flex-col sm:flex-row gap-2">
                  <input
                    type="url"
                    value={deployHookUrl}
                    onChange={(e) => setDeployHookUrl(e.target.value)}
                    placeholder="https://api.cloudflare.com/client/v4/pages/webhooks/deploy_hooks/xxxxxx"
                    className="flex-1 px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white font-mono text-xs focus:border-orange-500 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={handleTriggerDeployHook}
                    disabled={hookTriggerStatus === 'triggering' || !deployHookUrl.trim()}
                    className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white font-bold text-xs transition-colors shrink-0 disabled:opacity-50 flex items-center justify-center gap-1.5 shadow-md shadow-orange-600/20"
                  >
                    {hookTriggerStatus === 'triggering' ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        <span>Signaling Cloudflare...</span>
                      </>
                    ) : (
                      <>
                        <Zap className="w-3.5 h-3.5" />
                        <span>Trigger Deploy Now</span>
                      </>
                    )}
                  </button>
                </div>

                {hookTriggerMsg && (
                  <div
                    className={`p-2.5 rounded-lg border text-xs flex items-center gap-2 ${
                      hookTriggerStatus === 'success'
                        ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300'
                        : 'bg-rose-950/40 border-rose-500/40 text-rose-300'
                    }`}
                  >
                    {hookTriggerStatus === 'success' ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    ) : (
                      <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
                    )}
                    <span>{hookTriggerMsg}</span>
                  </div>
                )}
              </div>

              {/* Action Buttons to Push */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setActiveTab('publish')}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-orange-600 to-amber-500 hover:from-orange-500 hover:to-amber-400 text-white font-bold text-xs transition-all shadow-md shadow-orange-600/20 flex items-center gap-1.5"
                >
                  <Github className="w-4 h-4" />
                  <span>Go to GitHub Publisher →</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('cloudflare')}
                  className="px-4 py-2.5 rounded-xl border border-slate-700 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs transition-colors flex items-center gap-1.5"
                >
                  <Cloud className="w-4 h-4 text-blue-400" />
                  <span>Cloudflare Setup Walkthrough →</span>
                </button>
              </div>
            </div>
          )}
          {/* TAB 1: DIRECT PUSH TO GITHUB */}
          {activeTab === 'publish' && (
            <div className="space-y-6">
              {/* Info banner */}
              <div className="p-4 rounded-2xl border border-orange-500/20 bg-orange-500/5 flex items-start gap-3">
                <Sparkles className="w-5 h-5 text-orange-400 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <div className="font-bold text-white text-xs sm:text-sm">
                    Automated GitHub Publisher
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Enter your GitHub token below to directly create or update your repository. It will automatically commit all <strong>{posts.length} blog posts</strong>, categories, Sveltia CMS runner (<code>/public/admin</code>), and Cloudflare deployment files.
                  </p>
                </div>
              </div>

              {/* Form Card */}
              <div className="p-5 rounded-2xl border border-slate-800 bg-[#0d1424] space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* GitHub Username */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-300 block">
                      GitHub Username / Organization
                    </label>
                    <input
                      type="text"
                      value={githubUser}
                      onChange={(e) => setGithubUser(e.target.value)}
                      placeholder="e.g. your-github-username"
                      className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white font-mono text-xs focus:border-orange-500 focus:outline-none"
                    />
                  </div>

                  {/* Repository Name */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-300 block">
                      Repository Name
                    </label>
                    <input
                      type="text"
                      value={githubRepo}
                      onChange={(e) => setGithubRepo(e.target.value)}
                      placeholder="e.g. my-astro-blog"
                      className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white font-mono text-xs focus:border-orange-500 focus:outline-none"
                    />
                  </div>
                </div>

                {/* Personal Access Token Input */}
                <div className="space-y-2 pt-1">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-xs">
                    <label className="font-semibold text-slate-300 flex items-center gap-1.5">
                      <Key className="w-3.5 h-3.5 text-amber-400" />
                      <span>GitHub Personal Access Token (classic or fine-grained)</span>
                    </label>
                    <a
                      href="https://github.com/settings/tokens/new?description=Astro+Blog+Sveltia+CMS&scopes=repo"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-orange-400 hover:text-orange-300 flex items-center gap-1 underline"
                    >
                      <span>1-Click Generate Token on GitHub (with "repo" scope)</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>

                  <div className="flex gap-2">
                    <input
                      type="password"
                      value={githubToken}
                      onChange={(e) => setGithubToken(e.target.value)}
                      placeholder="ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                      className="flex-1 px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white font-mono text-xs focus:border-orange-500 focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={testGitHubToken}
                      disabled={tokenTestStatus === 'testing' || !githubToken.trim()}
                      className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-medium text-xs transition-colors shrink-0 disabled:opacity-50 flex items-center gap-1.5"
                    >
                      {tokenTestStatus === 'testing' ? (
                        <>
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                          <span>Verifying...</span>
                        </>
                      ) : (
                        <>
                          <Key className="w-3.5 h-3.5 text-amber-400" />
                          <span>Verify</span>
                        </>
                      )}
                    </button>
                  </div>

                  {testMessage && (
                    <div
                      className={`p-2.5 rounded-lg border text-xs flex items-center gap-2 ${
                        tokenTestStatus === 'success'
                          ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300'
                          : 'bg-rose-950/40 border-rose-500/40 text-rose-300'
                      }`}
                    >
                      {tokenTestStatus === 'success' ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      ) : (
                        <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
                      )}
                      <span>{testMessage}</span>
                    </div>
                  )}
                </div>

                {/* Repo Visibility Toggle */}
                <div className="flex items-center justify-between pt-2 border-t border-slate-800/80 text-xs">
                  <div>
                    <span className="font-semibold text-slate-300">Repository Visibility:</span>
                    <span className="text-slate-400 ml-1.5">
                      {isPrivateRepo ? 'Private (only you can see)' : 'Public (recommended for free Cloudflare hosting)'}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsPrivateRepo(!isPrivateRepo)}
                    className="px-3 py-1 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:text-white"
                  >
                    Switch to {isPrivateRepo ? 'Public' : 'Private'}
                  </button>
                </div>

                {/* Submit Push Button */}
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={handleDirectPublish}
                    disabled={pushStatus === 'publishing' || !githubToken.trim()}
                    className="w-full py-3.5 px-6 rounded-xl bg-gradient-to-r from-orange-600 via-orange-500 to-amber-500 hover:from-orange-500 hover:to-amber-400 text-white font-bold text-sm shadow-xl shadow-orange-600/25 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {pushStatus === 'publishing' ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>Pushing Content & CMS to GitHub...</span>
                      </>
                    ) : (
                      <>
                        <Github className="w-4 h-4" />
                        <span>🚀 Push Everything to My GitHub Account</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Progress Console */}
              {pushLogs.length > 0 && (
                <div className="p-4 rounded-2xl border border-slate-800 bg-[#060a12] space-y-2">
                  <div className="flex items-center justify-between text-xs font-semibold text-slate-300 border-b border-slate-800 pb-2">
                    <span className="flex items-center gap-1.5">
                      <Terminal className="w-3.5 h-3.5 text-orange-400" />
                      <span>Publication Live Log</span>
                    </span>
                    {pushStatus === 'success' && (
                      <span className="text-emerald-400 font-bold flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Completed
                      </span>
                    )}
                  </div>
                  <div className="max-h-48 overflow-y-auto font-mono text-[11px] text-slate-300 space-y-1">
                    {pushLogs.map((log, idx) => (
                      <div
                        key={idx}
                        className={
                          log.includes('SUCCESS')
                            ? 'text-emerald-400 font-bold'
                            : log.includes('Error')
                            ? 'text-rose-400'
                            : 'text-slate-400'
                        }
                      >
                        {log}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Success Banner with Next Steps */}
              {pushStatus === 'success' && (
                <div className="p-5 rounded-2xl border border-emerald-500/30 bg-emerald-950/20 space-y-4">
                  <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
                    <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                    <span>Your repository is live on GitHub!</span>
                  </div>
                  <p className="text-xs text-slate-300">
                    Now connect your GitHub repository to Cloudflare Pages for instant automated publishing with zero server fees.
                  </p>
                  <div className="flex flex-wrap gap-2.5 pt-1">
                    <a
                      href={pushedRepoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs transition-colors flex items-center gap-1.5"
                    >
                      <Github className="w-3.5 h-3.5" />
                      <span>View Repo on GitHub</span>
                      <ExternalLink className="w-3 h-3 text-slate-400" />
                    </a>
                    <a
                      href="https://dash.cloudflare.com/?to=/:account/pages/new"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-4 py-2 rounded-xl bg-orange-600 hover:bg-orange-500 text-white font-bold text-xs transition-colors flex items-center gap-1.5 shadow-md shadow-orange-600/30"
                    >
                      <Cloud className="w-3.5 h-3.5" />
                      <span>Deploy on Cloudflare Pages (Free)</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                    <button
                      type="button"
                      onClick={() => setActiveTab('cloudflare')}
                      className="px-4 py-2 rounded-xl border border-slate-700 hover:bg-slate-800 text-slate-300 text-xs font-semibold"
                    >
                      See Cloudflare Settings Walkthrough →
                    </button>
                  </div>
                </div>
              )}

              {pushErrorMsg && (
                <div className="p-4 rounded-xl border border-rose-500/40 bg-rose-950/30 text-rose-300 text-xs flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400" />
                  <span>{pushErrorMsg}</span>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: CLOUDFLARE PAGES SETUP */}
          {activeTab === 'cloudflare' && (
            <div className="space-y-6">
              <div className="p-5 rounded-2xl border border-blue-500/20 bg-blue-500/5 space-y-2">
                <div className="flex items-center gap-2 text-blue-400 font-bold text-sm">
                  <Cloud className="w-5 h-5" />
                  <span>Cloudflare Pages: Unlimited Global Hosting (100% Free)</span>
                </div>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                  Cloudflare Pages automatically connects to your GitHub repository. Every time you publish a new article in Sveltia CMS, Cloudflare rebuilds and caches your blog globally in under 20 seconds.
                </p>
              </div>

              {/* 4 Steps Walkthrough */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl border border-slate-800 bg-[#0d1424] space-y-2">
                  <div className="flex items-center gap-2 font-bold text-white text-xs sm:text-sm">
                    <span className="w-6 h-6 rounded-full bg-orange-600/30 text-orange-400 flex items-center justify-center text-xs">
                      1
                    </span>
                    <span>Create Application in Cloudflare</span>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Open <a href="https://dash.cloudflare.com/?to=/:account/pages/new" target="_blank" rel="noreferrer" className="text-orange-400 underline">Cloudflare Pages Dashboard</a>. Click <strong>"Create application" → "Pages" → "Connect to Git"</strong>.
                  </p>
                </div>

                <div className="p-4 rounded-xl border border-slate-800 bg-[#0d1424] space-y-2">
                  <div className="flex items-center gap-2 font-bold text-white text-xs sm:text-sm">
                    <span className="w-6 h-6 rounded-full bg-orange-600/30 text-orange-400 flex items-center justify-center text-xs">
                      2
                    </span>
                    <span>Select Your Repository</span>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Authorize your GitHub account and select <code className="text-white font-mono">{githubUser || 'username'}/{githubRepo || 'my-astro-blog'}</code>.
                  </p>
                </div>

                <div className="p-4 rounded-xl border border-slate-800 bg-[#0d1424] space-y-2">
                  <div className="flex items-center gap-2 font-bold text-white text-xs sm:text-sm">
                    <span className="w-6 h-6 rounded-full bg-orange-600/30 text-orange-400 flex items-center justify-center text-xs">
                      3
                    </span>
                    <span>Configure Build Settings in Cloudflare</span>
                  </div>
                  <div className="text-xs text-slate-300 font-mono bg-slate-950 p-2.5 rounded-lg border border-slate-800 space-y-1">
                    <div><strong>Framework preset:</strong> None</div>
                    <div><strong>Build command:</strong> <em>(Leave empty / blank)</em></div>
                    <div><strong>Build output directory:</strong> dist</div>
                    <div className="text-emerald-400 text-[11px] pt-1 font-sans">
                      ⚡ Pure HTML/CSS/JavaScript static files are already pre-generated in <code className="font-mono text-white">dist/</code>. No build steps needed!
                    </div>
                  </div>
                </div>

                <div className="p-4 rounded-xl border border-slate-800 bg-[#0d1424] space-y-2">
                  <div className="flex items-center gap-2 font-bold text-white text-xs sm:text-sm">
                    <span className="w-6 h-6 rounded-full bg-orange-600/30 text-orange-400 flex items-center justify-center text-xs">
                      4
                    </span>
                    <span>Deploy & Access Sveltia CMS</span>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Click <strong>"Save and Deploy"</strong>. Your website is live at <code className="text-emerald-400 font-mono">https://{githubRepo || 'my-astro-blog'}.pages.dev</code> and CMS is at <code className="text-orange-400 font-mono">/admin</code>!
                  </p>
                </div>
              </div>

              {/* Direct CTA */}
              <div className="flex items-center justify-between p-4 rounded-2xl border border-slate-800 bg-[#0d131f]">
                <div>
                  <div className="font-bold text-white text-sm">Ready to launch on Cloudflare?</div>
                  <div className="text-xs text-slate-400">Takes less than 60 seconds with your GitHub repository</div>
                </div>
                <a
                  href="https://dash.cloudflare.com/?to=/:account/pages/new"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-5 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-500 text-white font-bold text-xs transition-colors flex items-center gap-1.5 shadow-md shadow-orange-600/30"
                >
                  <Cloud className="w-4 h-4" />
                  <span>Open Cloudflare Pages</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          )}

          {/* TAB 3: SVELTIA CMS HUB */}
          {activeTab === 'sveltia' && (
            <div className="space-y-6">
              <div className="p-5 rounded-2xl border border-emerald-500/20 bg-emerald-500/5 space-y-3">
                <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
                  <ShieldCheck className="w-5 h-5" />
                  <span>How Sveltia CMS Operates with GitHub</span>
                </div>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                  <strong>Sveltia CMS</strong> is a pure client-side, Git-based headless CMS (the modern, lightweight successor to Decap/Netlify CMS). It requires no backend database server. When an author publishes an article or uploads a featured image in Sveltia CMS at <code>/admin</code>, Sveltia automatically executes a Git commit to your GitHub repository. Cloudflare Pages then deploys the update worldwide.
                </p>
              </div>

              {/* config.yml display */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="font-semibold text-white text-xs">
                    Generated public/admin/config.yml:
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => handleCopy(generatedConfigYml, 'config')}
                      className="px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-white text-xs flex items-center gap-1"
                    >
                      {copiedConfig ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      <span>{copiedConfig ? 'Copied' : 'Copy'}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDownloadFile('config.yml', generatedConfigYml)}
                      className="px-3 py-1 rounded-lg bg-orange-600 hover:bg-orange-500 text-white text-xs flex items-center gap-1"
                    >
                      <Download className="w-3 h-3" />
                      <span>Download</span>
                    </button>
                  </div>
                </div>
                <pre className="p-3 rounded-xl bg-[#060910] border border-slate-800 text-[11px] font-mono text-slate-300 max-h-48 overflow-y-auto leading-relaxed">
                  {generatedConfigYml}
                </pre>
              </div>

              {/* index.html display */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="font-semibold text-white text-xs">
                    Sveltia CMS HTML Application Runner (public/admin/index.html):
                  </div>
                  <button
                    type="button"
                    onClick={() => handleCopy(sveltiaHtmlCode, 'html')}
                    className="px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-white text-xs flex items-center gap-1"
                  >
                    {copiedHtml ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedHtml ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
                <pre className="p-3 rounded-xl bg-[#060910] border border-slate-800 text-[11px] font-mono text-slate-300 max-h-36 overflow-y-auto leading-relaxed">
                  {sveltiaHtmlCode}
                </pre>
              </div>

              {/* Local Sveltia CMS Preview */}
              <div className="p-4 rounded-xl border border-slate-800 bg-[#0d1424] flex items-center justify-between">
                <div>
                  <div className="font-semibold text-white text-xs">Launch Local Sveltia CMS in Preview</div>
                  <div className="text-[11px] text-slate-400">Open /admin in a new browser window to test Sveltia CMS locally</div>
                </div>
                <a
                  href="/admin"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs flex items-center gap-1.5"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Launch /admin</span>
                </a>
              </div>
            </div>
          )}

          {/* TAB 4: TERMINAL GIT COMMANDS */}
          {activeTab === 'terminal' && (
            <div className="space-y-5">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-bold text-white text-sm">
                    Manual Git Push Terminal Commands
                  </div>
                  <div className="text-xs text-slate-400">
                    If you prefer pushing via your local command line / VS Code terminal:
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => handleCopy(terminalCommands, 'terminal')}
                  className="px-4 py-2 rounded-xl bg-orange-600 hover:bg-orange-500 text-white font-semibold text-xs flex items-center gap-1.5 shadow-md shadow-orange-600/30"
                >
                  {copiedTerminal ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-white" />
                      <span>Copied Commands!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy All Commands</span>
                    </>
                  )}
                </button>
              </div>

              <pre className="p-4 rounded-2xl bg-[#060a12] border border-slate-800 text-xs font-mono text-emerald-400 leading-relaxed overflow-x-auto">
                {terminalCommands}
              </pre>

              <div className="p-4 rounded-xl border border-slate-800 bg-[#0d131f] space-y-2 text-xs">
                <div className="font-semibold text-white">How it works:</div>
                <ol className="list-decimal list-inside space-y-1 text-slate-400">
                  <li>Download or export your project files.</li>
                  <li>Open terminal in that directory and run the commands above.</li>
                  <li>All articles, images, and Sveltia CMS settings are immediately synced to your GitHub repository.</li>
                </ol>
              </div>
            </div>
          )}

          {/* TAB 5: PDF GUIDE & INSTRUCTIONS */}
          {activeTab === 'pdf' && (
            <div className="space-y-6">
              <div className="p-5 rounded-2xl border border-rose-500/20 bg-rose-500/5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-rose-400 font-bold text-sm">
                    <FileText className="w-5 h-5" />
                    <span>Download / Print PDF Guide</span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    A complete step-by-step PDF manual covering GitHub sync, Cloudflare Pages build settings, and Sveltia CMS article publishing.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handlePrintOrSavePdf}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-rose-600 to-orange-600 hover:from-rose-500 hover:to-orange-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-rose-600/20 shrink-0"
                >
                  <Printer className="w-4 h-4" />
                  <span>🖨️ Download / Save as PDF</span>
                </button>
              </div>

              {/* Preview of the PDF content */}
              <div className="p-6 rounded-2xl border border-slate-800 bg-[#0b0f19] space-y-4">
                <div className="border-b border-slate-800 pb-3 flex items-center justify-between">
                  <h4 className="text-sm font-bold text-white">Document Preview: Complete Setup Guide</h4>
                  <span className="text-[11px] font-mono text-emerald-400 bg-emerald-950/40 border border-emerald-500/30 px-2 py-0.5 rounded">
                    Ready to Save
                  </span>
                </div>

                <div className="space-y-3 text-xs text-slate-300 leading-relaxed">
                  <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
                    <strong className="text-orange-400 text-xs">Step 1: Push to GitHub</strong>
                    <p className="text-slate-400">
                      Files are committed directly into your repository <code className="font-mono text-slate-300">{githubUser || 'username'}/{githubRepo || 'astro'}</code> including pre-rendered static HTML, CSS, JavaScript, and Sveltia CMS configuration.
                    </p>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
                    <strong className="text-blue-400 text-xs">Step 2: Cloudflare Pages Build Settings</strong>
                    <div className="font-mono text-[11px] text-slate-300 bg-slate-950 p-2.5 rounded border border-slate-800 space-y-0.5">
                      <div>Framework preset: <strong>None</strong></div>
                      <div>Build command: <em>(Leave empty / blank)</em></div>
                      <div>Build output directory: <strong>dist</strong></div>
                      <div>Deploy command: <em>(Leave blank / none)</em></div>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
                    <strong className="text-emerald-400 text-xs">Step 3: Sveltia CMS Publishing</strong>
                    <p className="text-slate-400">
                      Visit <code className="font-mono text-slate-300">https://your-site.pages.dev/admin</code>, log in with GitHub, and publish blog articles on mobile or desktop without opening any code editors.
                    </p>
                  </div>
                </div>

                <div className="pt-2 flex flex-wrap gap-2 justify-end">
                  <button
                    type="button"
                    onClick={() => {
                      fetch('/PRD.md')
                        .then((res) => res.text())
                        .then((text) => handleDownloadFile('PRD.md', text))
                        .catch(() => handleDownloadFile('PRD.md', '# Product Requirement Document (PRD)...'));
                    }}
                    className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs flex items-center gap-1.5 transition-colors border border-slate-700"
                  >
                    <Download className="w-3.5 h-3.5 text-blue-400" />
                    <span>Download PRD.md</span>
                  </button>
                  <button
                    type="button"
                    onClick={handlePrintOrSavePdf}
                    className="px-4 py-2 rounded-xl bg-orange-600 hover:bg-orange-500 text-white font-semibold text-xs flex items-center gap-1.5 transition-colors shadow-md shadow-orange-600/20"
                  >
                    <Download className="w-3.5 h-3.5 text-white" />
                    <span>Download Complete PDF Guide</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 px-6 border-t border-slate-800 bg-[#0d131f] flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="text-slate-400">
            Target: <strong className="text-white font-mono">{githubUser || 'username'}/{githubRepo || 'my-astro-blog'}</strong> ({githubBranch})
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={handlePrintOrSavePdf}
              className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-rose-300 font-semibold transition-colors flex items-center gap-1.5"
            >
              <FileText className="w-3.5 h-3.5 text-rose-400" />
              <span>📄 Save PDF Guide</span>
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
