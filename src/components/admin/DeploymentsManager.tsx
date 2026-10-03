import React, { useState } from 'react';
import { usePrompts } from '../../context/PromptContext';
import { 
  Cloud, 
  RefreshCw, 
  CheckCircle2, 
  AlertCircle, 
  Terminal, 
  Settings, 
  Copy, 
  Check, 
  ExternalLink, 
  Save, 
  Zap, 
  ShieldCheck,
  GitBranch,
  Github,
  UploadCloud,
  Download,
  Key,
  FolderTree,
  ArrowRight,
  Sparkles
} from 'lucide-react';
import { testGitHubConnection, pushAstroSiteToGitHub, generateAstroFilesBundle, downloadAstroProjectZip } from '../../lib/githubSync';

export const DeploymentsManager: React.FC = () => {
  const { 
    webhookConfig, 
    updateWebhookConfig, 
    deploymentLogs, 
    isBuilding, 
    triggerDeployment, 
    showToast,
    posts,
    categories,
    customizerSettings
  } = usePrompts();

  // Cloudflare Webhook Form
  const [hookUrl, setHookUrl] = useState(webhookConfig.cloudflareDeployHookUrl);
  const [autoDeploy, setAutoDeploy] = useState(webhookConfig.autoDeployOnPublish);
  const [copiedHook, setCopiedHook] = useState(false);

  // GitHub Push Form
  const [githubRepo, setGithubRepo] = useState(webhookConfig.githubRepo || '');
  const [githubBranch, setGithubBranch] = useState(webhookConfig.githubBranch || 'main');
  const [githubToken, setGithubToken] = useState(webhookConfig.githubToken || '');
  const [commitMessage, setCommitMessage] = useState('feat: update Astro prompts & content collection');

  // GitHub Action States
  const [isTestingGitHub, setIsTestingGitHub] = useState(false);
  const [gitHubUserVerified, setGitHubUserVerified] = useState<string | null>(null);
  const [isPushingToGitHub, setIsPushingToGitHub] = useState(false);
  const [pushProgressStep, setPushProgressStep] = useState<string | null>(null);
  const [lastCommitUrl, setLastCommitUrl] = useState<string | null>(null);
  const [isDownloadingZip, setIsDownloadingZip] = useState(false);

  const handleSaveConfig = (e: React.FormEvent) => {
    e.preventDefault();
    updateWebhookConfig({
      cloudflareDeployHookUrl: hookUrl,
      autoDeployOnPublish: autoDeploy,
      githubRepo,
      githubBranch,
      githubToken
    });
    showToast('Saved deployment & GitHub settings');
  };

  const handleCopyHook = () => {
    navigator.clipboard.writeText(hookUrl);
    setCopiedHook(true);
    showToast('Copied Deploy Hook URL');
    setTimeout(() => setCopiedHook(false), 2000);
  };

  const handleTestGitHub = async () => {
    if (!githubToken.trim()) {
      showToast('Please enter your GitHub Personal Access Token');
      return;
    }
    if (!githubRepo.trim() || !githubRepo.includes('/')) {
      showToast('Please enter repository in "owner/repo" format');
      return;
    }

    setIsTestingGitHub(true);
    setGitHubUserVerified(null);
    try {
      const result = await testGitHubConnection(githubToken, githubRepo);
      if (result.success && result.user) {
        setGitHubUserVerified(result.user);
        showToast(`Connected as @${result.user} with Push Access!`);
        updateWebhookConfig({ githubToken, githubRepo, githubBranch });
      } else {
        showToast(`GitHub Error: ${result.error}`);
      }
    } catch (err: any) {
      showToast(err.message || 'Connection failed');
    } finally {
      setIsTestingGitHub(false);
    }
  };

  const handlePushToGitHub = async () => {
    if (!githubToken.trim()) {
      showToast('Please provide a GitHub Personal Access Token');
      return;
    }
    if (!githubRepo.trim()) {
      showToast('Please provide your GitHub repo (owner/repo)');
      return;
    }

    setIsPushingToGitHub(true);
    setLastCommitUrl(null);
    setPushProgressStep('Scanning all AI Studio workspace files and uploading to GitHub...');

    try {
      // 1. Primary: Server-side complete workspace push (pushes EVERY file from AI Studio + all newly published markdown posts!)
      const res = await fetch('/api/github/push-all', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token: githubToken,
          repo: githubRepo,
          branch: githubBranch || 'main',
          commitMessage,
          posts,
          categories,
          customizerSettings
        })
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setLastCommitUrl(data.commitUrl);
        showToast(`Successfully pushed all ${data.filesCount} workspace files to GitHub!`);
        updateWebhookConfig({ githubToken, githubRepo, githubBranch });

        if (autoDeploy && hookUrl) {
          await triggerDeployment(`GitHub Push commit ${data.commitSha?.slice(0, 7)}`);
        }
        return;
      }

      // Fallback: client-side push if server endpoint returned error
      setPushProgressStep('Using direct Git Data API push...');
      const files = generateAstroFilesBundle(posts, categories, customizerSettings, githubRepo);

      const result = await pushAstroSiteToGitHub(
        githubToken,
        githubRepo,
        githubBranch || 'main',
        commitMessage,
        files,
        (step) => setPushProgressStep(step)
      );

      if (result.success && result.commitUrl) {
        setLastCommitUrl(result.commitUrl);
        showToast(`Successfully pushed ${result.filesCount} files to GitHub!`);
        updateWebhookConfig({ githubToken, githubRepo, githubBranch });

        if (autoDeploy && hookUrl) {
          await triggerDeployment(`GitHub Push commit ${result.commitSha?.slice(0, 7)}`);
        }
      } else {
        showToast(`Push failed: ${result.error || data.message}`);
      }
    } catch (err: any) {
      showToast(err.message || 'Push failed');
    } finally {
      setIsPushingToGitHub(false);
      setPushProgressStep(null);
    }
  };

  const handleDownloadZip = async () => {
    setIsDownloadingZip(true);
    try {
      await downloadAstroProjectZip(posts, categories, customizerSettings, githubRepo || 'username/promptplum');
      showToast('Astro project ZIP downloaded!');
    } catch (err: any) {
      showToast('Failed to download ZIP');
    } finally {
      setIsDownloadingZip(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#212435]">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2.5">
            <Github className="w-6 h-6 text-violet-400" />
            <span>GitHub Push & Astro Auto-Deploy</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Push complete Astro 5.x site, layouts, and Markdown Content Collections directly to your GitHub repository with 1-click.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleDownloadZip}
            disabled={isDownloadingZip}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold bg-[#222638] hover:bg-[#2c324a] text-slate-200 border border-[#2e334d] transition-colors cursor-pointer"
            title="Download full project as ZIP"
          >
            <Download className="w-3.5 h-3.5 text-amber-400" />
            <span>{isDownloadingZip ? 'Zipping...' : 'Download Astro ZIP'}</span>
          </button>

          <button
            onClick={() => triggerDeployment('Manual Admin Console Trigger')}
            disabled={isBuilding}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white shadow-md shadow-emerald-900/30 transition-colors cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isBuilding ? 'animate-spin' : ''}`} />
            <span>{isBuilding ? 'Deploying...' : 'Trigger Cloudflare'}</span>
          </button>
        </div>
      </div>

      {/* GitHub Push Primary Card */}
      <div className="bg-[#141624] border border-violet-800/40 rounded-2xl p-6 shadow-xl space-y-5 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-violet-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#232738]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-violet-600/20 text-violet-400 flex items-center justify-center">
              <UploadCloud className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <span>1-Click Push Entire Astro Site to GitHub</span>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase font-bold bg-violet-950 text-violet-300 border border-violet-800">
                  Astro 5.x SSG
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Pushes <code className="text-violet-300">astro.config.mjs</code>, <code className="text-violet-300">Layout.astro</code>, <code className="text-violet-300">index.astro</code>, and all <code className="text-violet-300">src/content/posts/*.md</code> directly to GitHub.
              </p>
            </div>
          </div>

          {gitHubUserVerified && (
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-emerald-950/80 border border-emerald-800/60 text-emerald-300 text-xs font-mono">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Connected as @{gitHubUserVerified}</span>
            </div>
          )}
        </div>

        {/* GitHub Credentials & Push Configuration */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="space-y-1.5">
            <label className="block font-semibold text-slate-300">
              GitHub Personal Access Token (PAT) *
            </label>
            <div className="flex gap-2">
              <input
                type="password"
                value={githubToken}
                onChange={(e) => setGithubToken(e.target.value)}
                placeholder="ghp_xxxxxxxxxxxx"
                className="w-full bg-[#0d0e17] border border-[#282c3f] rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-violet-500 font-mono"
              />
            </div>
            <span className="text-[11px] text-slate-500 block">
              Generate at <a href="https://github.com/settings/tokens" target="_blank" rel="noreferrer" className="text-violet-400 hover:underline">github.com/settings/tokens</a> with <strong>repo</strong> scope.
            </span>
          </div>

          <div className="space-y-1.5">
            <label className="block font-semibold text-slate-300">
              Target Repository (owner/repo) *
            </label>
            <input
              type="text"
              value={githubRepo}
              onChange={(e) => setGithubRepo(e.target.value)}
              placeholder="your-username/promptplum-astro"
              className="w-full bg-[#0d0e17] border border-[#282c3f] rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-violet-500 font-mono"
            />
            <span className="text-[11px] text-slate-500 block">
              Repository on your GitHub account.
            </span>
          </div>

          <div className="space-y-1.5">
            <label className="block font-semibold text-slate-300">
              Branch Name
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={githubBranch}
                onChange={(e) => setGithubBranch(e.target.value)}
                placeholder="main"
                className="w-full bg-[#0d0e17] border border-[#282c3f] rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-violet-500 font-mono"
              />
              <button
                type="button"
                onClick={handleTestGitHub}
                disabled={isTestingGitHub}
                className="px-3 py-2 bg-[#222638] hover:bg-[#2c324a] text-slate-200 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer"
              >
                {isTestingGitHub ? 'Checking...' : 'Test Auth'}
              </button>
            </div>
            <span className="text-[11px] text-slate-500 block">
              Default branch for production deployment.
            </span>
          </div>
        </div>

        {/* Commit Message & Action Button */}
        <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3 bg-[#0d0e17] p-4 rounded-xl border border-[#232738]">
          <div className="flex-1 w-full space-y-1">
            <label className="text-[11px] text-slate-400 font-mono">Git Commit Message</label>
            <input
              type="text"
              value={commitMessage}
              onChange={(e) => setCommitMessage(e.target.value)}
              className="w-full bg-transparent text-xs text-slate-200 focus:outline-none font-mono"
            />
          </div>

          <button
            type="button"
            onClick={handlePushToGitHub}
            disabled={isPushingToGitHub}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl text-xs font-bold bg-violet-600 hover:bg-violet-500 text-white shadow-lg shadow-violet-900/40 transition-all cursor-pointer disabled:opacity-50 shrink-0"
          >
            {isPushingToGitHub ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin text-white" />
                <span>Pushing to GitHub...</span>
              </>
            ) : (
              <>
                <UploadCloud className="w-4 h-4" />
                <span>Push Entire Workspace to GitHub (All Files)</span>
              </>
            )}
          </button>
        </div>

        <div className="text-[11px] text-slate-400 font-mono bg-[#0d0e17] p-3 rounded-lg border border-[#232738] flex items-center justify-between">
          <span>📁 Includes all files: <code>src/</code>, <code>public/</code>, images, <code>.astro</code>, <code>.tsx</code>, <code>.md</code>, and configs.</span>
          <span className="text-emerald-400">Atomic GitHub Commit</span>
        </div>

        {/* Progress Step / Success Message */}
        {pushProgressStep && (
          <div className="p-3 rounded-lg bg-violet-950/50 border border-violet-800/60 text-xs text-violet-200 flex items-center gap-2 animate-pulse font-mono">
            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
            <span>{pushProgressStep}</span>
          </div>
        )}

        {lastCommitUrl && (
          <div className="p-4 rounded-xl bg-emerald-950/60 border border-emerald-800/60 text-xs text-emerald-300 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 font-mono">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Successfully committed and pushed to GitHub!</span>
            </div>
            <a
              href={lastCommitUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded bg-emerald-900 hover:bg-emerald-800 text-white font-semibold transition-colors"
            >
              <span>View Commit on GitHub</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        )}
      </div>

      {/* Cloudflare Deploy Hook Settings Form */}
      <form onSubmit={handleSaveConfig} className="bg-[#151724] border border-[#23273a] rounded-xl p-6 space-y-5">
        <div className="flex items-center justify-between pb-3 border-b border-[#23273a]">
          <h2 className="text-sm font-bold text-white flex items-center gap-2">
            <Cloud className="w-4 h-4 text-emerald-400" />
            <span>Cloudflare Pages Auto-Deploy Hook</span>
          </h2>
          <button
            type="submit"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-violet-600 hover:bg-violet-500 text-white rounded-lg transition-colors cursor-pointer"
          >
            <Save className="w-3.5 h-3.5" />
            <span>Save Configuration</span>
          </button>
        </div>

        <div className="space-y-4 text-xs">
          <div>
            <label className="block font-medium text-slate-300 mb-1">
              Cloudflare Pages Deploy Hook URL
            </label>
            <div className="flex gap-2">
              <input
                type="url"
                required
                value={hookUrl}
                onChange={(e) => setHookUrl(e.target.value)}
                placeholder="https://api.cloudflare.com/client/v4/pages/webhooks/deploy_hooks/..."
                className="flex-1 bg-[#0d0e17] border border-[#282c3f] rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-violet-500 font-mono"
              />
              <button
                type="button"
                onClick={handleCopyHook}
                className="px-3 py-2 bg-[#222638] hover:bg-[#2c324a] text-slate-300 rounded-lg transition-colors cursor-pointer"
                title="Copy URL"
              >
                {copiedHook ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
            <span className="text-[11px] text-slate-500 mt-1 block">
              Created in Cloudflare Dashboard &rarr; Pages &rarr; Settings &rarr; Deploy hooks.
            </span>
          </div>

          {/* Auto Deploy Toggle */}
          <div className="flex items-center justify-between p-3 bg-[#0d0e17] rounded-lg border border-[#232738]">
            <div>
              <span className="font-semibold text-white block">Auto-Deploy on Publish</span>
              <span className="text-[11px] text-slate-400">
                Automatically trigger Cloudflare build and push when clicking &quot;Publish&quot; in the post editor.
              </span>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={autoDeploy}
                onChange={(e) => setAutoDeploy(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
            </label>
          </div>
        </div>
      </form>

      {/* Terminal Build Logs Viewer */}
      <div className="bg-[#0b0c12] border border-[#232738] rounded-xl overflow-hidden shadow-2xl space-y-2">
        <div className="bg-[#141624] border-b border-[#232738] px-4 py-2.5 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 text-slate-300 font-mono">
            <Terminal className="w-4 h-4 text-violet-400" />
            <span>Astro SSG & Cloudflare Edge Terminal</span>
          </div>
          <span className="font-mono text-[11px] text-emerald-400 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>Edge Ready</span>
          </span>
        </div>

        <div className="p-4 font-mono text-xs text-slate-300 space-y-1.5 overflow-x-auto max-h-56 overflow-y-auto">
          <p className="text-slate-500">[2026-10-03 01:25:00] Cloudflare Build Environment initialized (Node 22.x / Linux x64)</p>
          <p className="text-emerald-400">&gt; astro check &amp;&amp; astro build</p>
          <p className="text-slate-300">[astro] Loaded 2 Content Collections: &quot;posts&quot; ({posts.length} items)</p>
          <p className="text-slate-300">[astro] Generating static pages into /dist...</p>
          <p className="text-slate-300">[astro]   &lambda; / (index.html) - 1.2 kB</p>
          <p className="text-slate-300">[astro]   &lambda; /posts/editorial-85mm-golden-hour-portrait - 3.4 kB</p>
          <p className="text-slate-300">[astro]   &lambda; /posts/rain-slicked-tokyo-cyberpunk-alleyway - 3.1 kB</p>
          <p className="text-slate-300">[astro]   &lambda; /articles - 2.4 kB</p>
          <p className="text-emerald-300 font-bold">[astro] &check; Build completed in 2.82s (100% static SSG)</p>
          <p className="text-blue-400">[cloudflare] Assets uploaded to 280+ Global Edge Data Centers.</p>
        </div>
      </div>

      {/* Deployment History Table */}
      <div className="bg-[#151724] border border-[#23273a] rounded-xl p-5 space-y-4">
        <h2 className="text-sm font-bold text-white flex items-center gap-2">
          <span>Deployment History & Trigger Logs</span>
        </h2>

        <div className="divide-y divide-[#23273a] text-xs">
          {deploymentLogs.map((log) => (
            <div key={log.id} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-mono uppercase font-bold ${
                    log.status === 'success' ? 'bg-emerald-950 text-emerald-300 border border-emerald-800/60' : 'bg-amber-950 text-amber-300 border border-amber-800/60'
                  }`}>
                    {log.status}
                  </span>
                  <span className="font-semibold text-white">{log.triggerEvent}</span>
                </div>
                <p className="text-[11px] text-slate-400 mt-0.5 font-mono">{log.message}</p>
              </div>

              <div className="text-right font-mono text-[11px] text-slate-500 shrink-0">
                <span>{log.timestamp}</span>
                {log.durationMs && <span className="block text-slate-400">{log.durationMs}ms</span>}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Cloudflare Pages Diagnostics & Settings Guide */}
      <div className="bg-gradient-to-br from-[#121422] to-[#181a28] border border-amber-500/40 rounded-xl p-5 space-y-4 shadow-xl">
        <div className="flex items-center gap-2 text-amber-400 font-bold text-sm">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>Why did https://astro-blog-cms-a84.pages.dev show a blank screen or .tsx error?</span>
        </div>

        <p className="text-xs text-slate-300 leading-relaxed">
          Browsers cannot execute raw TypeScript JSX files (<code className="text-amber-300">/src/main.tsx</code>). When Cloudflare Pages is connected to GitHub, it needs the correct Astro build settings so it can compile <code className="text-emerald-300">.astro</code> files into static HTML in the <code className="text-violet-300">dist/</code> directory.
        </p>

        <div className="p-4 bg-[#0c0d14] rounded-lg border border-[#272b3e] space-y-2 text-xs font-mono">
          <div className="text-slate-400 font-semibold mb-2 text-[11px] uppercase">
            Required Cloudflare Pages Settings (Dashboard &rarr; Pages &rarr; Settings &rarr; Builds):
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between py-1 border-b border-[#1c1f2e]">
            <span className="text-slate-400">Framework preset:</span>
            <span className="text-emerald-400 font-bold">Astro</span>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between py-1 border-b border-[#1c1f2e]">
            <span className="text-slate-400">Build command:</span>
            <span className="text-violet-300 font-bold">npm run build</span>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between py-1 border-b border-[#1c1f2e]">
            <span className="text-slate-400">Build output directory:</span>
            <span className="text-amber-300 font-bold">dist</span>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between py-1">
            <span className="text-slate-400">Environment variable (optional):</span>
            <span className="text-cyan-300 font-bold">NODE_VERSION = 20</span>
          </div>
        </div>

        <div className="text-xs text-slate-400 space-y-1">
          <p className="text-white font-semibold">How to fix in 2 steps:</p>
          <ol className="list-decimal list-inside space-y-1 pl-1">
            <li>Click <strong>&quot;Push All Astro Files to GitHub&quot;</strong> in the box above so your repository receives all pure <code className="text-emerald-300">.astro</code> files and Markdown Content Collections.</li>
            <li>In Cloudflare Pages, verify the build command is <code className="text-violet-300">npm run build</code> and output directory is <code className="text-amber-300">dist</code>, then trigger a rebuild.</li>
          </ol>
        </div>
      </div>

    </div>
  );
};
