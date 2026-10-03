import React, { useState } from 'react';
import { usePrompts } from '../../context/PromptContext';
import { 
  Code2, 
  Download, 
  Copy, 
  Check, 
  FileCode, 
  FolderTree, 
  Sparkles,
  UploadCloud,
  Github,
  ExternalLink,
  Layers,
  ArrowRight
} from 'lucide-react';
import { generateAstroFilesBundle, downloadAstroProjectZip } from '../../lib/githubSync';

export const AstroProjectExporter: React.FC = () => {
  const { posts, categories, customizerSettings, webhookConfig, setAdminSection, showToast } = usePrompts();

  const [activeFileIndex, setActiveFileIndex] = useState(0);
  const [copied, setCopied] = useState(false);
  const [isZipping, setIsZipping] = useState(false);

  // Generate actual files from CMS data
  const files = generateAstroFilesBundle(posts, categories, customizerSettings, webhookConfig.githubRepo || 'username/promptplum');
  const currentFile = files[activeFileIndex] || files[0];

  const handleCopyCode = () => {
    if (!currentFile) return;
    navigator.clipboard.writeText(currentFile.content);
    setCopied(true);
    showToast(`Copied ${currentFile.path} to clipboard!`);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadZip = async () => {
    setIsZipping(true);
    try {
      await downloadAstroProjectZip(posts, categories, customizerSettings, webhookConfig.githubRepo || 'username/promptplum');
      showToast('Downloaded complete Astro 5.x project ZIP!');
    } catch {
      showToast('Failed to download ZIP');
    } finally {
      setIsZipping(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#212435]">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2.5">
            <Code2 className="w-6 h-6 text-amber-400" />
            <span>Complete Astro 5.x Static Site Codebase</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Browse and export all Astro components, layouts, pages, and Content Collection markdown files.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setAdminSection('deployments')}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold bg-violet-600 hover:bg-violet-500 text-white shadow-md shadow-violet-900/30 transition-colors cursor-pointer"
          >
            <UploadCloud className="w-4 h-4" />
            <span>Push to GitHub &rarr;</span>
          </button>

          <button
            onClick={handleDownloadZip}
            disabled={isZipping}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold bg-[#222638] hover:bg-[#2c324a] text-slate-200 border border-[#2e334d] transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-amber-400" />
            <span>{isZipping ? 'Zipping...' : 'Download Project (.zip)'}</span>
          </button>
        </div>
      </div>

      {/* Astro Architecture Banner */}
      <div className="bg-gradient-to-r from-violet-950/40 via-[#151827] to-[#121422] border border-violet-800/40 rounded-xl p-5 space-y-3">
        <h2 className="text-sm font-bold text-violet-300 flex items-center gap-2">
          <Layers className="w-4 h-4 text-violet-400" />
          <span>Astro File Tree & Architecture:</span>
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
          <div className="bg-[#0e1018] p-3 rounded-lg border border-[#23273a]">
            <span className="font-semibold text-amber-300 block font-mono text-[11px]">src/content/posts/</span>
            <p className="text-slate-400 text-[11px] mt-1">{posts.length} markdown post files with type-safe schema</p>
          </div>
          <div className="bg-[#0e1018] p-3 rounded-lg border border-[#23273a]">
            <span className="font-semibold text-violet-300 block font-mono text-[11px]">src/layouts/Layout.astro</span>
            <p className="text-slate-400 text-[11px] mt-1">SEO, OpenGraph, customizer header & footer</p>
          </div>
          <div className="bg-[#0e1018] p-3 rounded-lg border border-[#23273a]">
            <span className="font-semibold text-emerald-300 block font-mono text-[11px]">src/pages/index.astro</span>
            <p className="text-slate-400 text-[11px] mt-1">SSG Homepage with Bento and Prompts grid</p>
          </div>
          <div className="bg-[#0e1018] p-3 rounded-lg border border-[#23273a]">
            <span className="font-semibold text-blue-300 block font-mono text-[11px]">astro.config.mjs</span>
            <p className="text-slate-400 text-[11px] mt-1">Cloudflare Pages static output & tailwind config</p>
          </div>
        </div>
      </div>

      {/* File Explorer & Code Viewer */}
      <div className="bg-[#151724] border border-[#23273a] rounded-xl overflow-hidden shadow-2xl flex flex-col md:flex-row">
        
        {/* Left Column: File List Tree */}
        <div className="w-full md:w-64 bg-[#0e1017] border-b md:border-b-0 md:border-r border-[#23273a] p-3 shrink-0 space-y-1">
          <div className="text-[10px] font-mono uppercase text-slate-500 font-bold px-2 py-1 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <FolderTree className="w-3.5 h-3.5" />
              <span>Project Files ({files.length})</span>
            </span>
          </div>

          <div className="space-y-0.5 overflow-y-auto max-h-72 md:max-h-[500px]">
            {files.map((file, idx) => (
              <button
                key={file.path}
                type="button"
                onClick={() => setActiveFileIndex(idx)}
                className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-mono transition-colors flex items-center gap-2 cursor-pointer ${
                  activeFileIndex === idx
                    ? 'bg-violet-600 text-white font-semibold shadow-sm'
                    : 'text-slate-400 hover:text-white hover:bg-[#181a26]'
                }`}
              >
                <FileCode className="w-3.5 h-3.5 shrink-0" />
                <span className="truncate">{file.path}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Right Column: Code Editor View */}
        <div className="flex-1 flex flex-col min-w-0 bg-[#0b0c12]">
          <div className="flex items-center justify-between px-4 py-2.5 bg-[#141624] border-b border-[#23273a] text-xs">
            <div className="flex items-center gap-2 font-mono text-slate-200 truncate">
              <span className="text-violet-400">path:</span>
              <span className="font-semibold text-white truncate">{currentFile.path}</span>
            </div>

            <button
              onClick={handleCopyCode}
              className="inline-flex items-center gap-1.5 px-3 py-1 text-xs text-slate-300 hover:text-white bg-[#1e2235] hover:bg-[#282d46] rounded border border-[#2b3046] transition-colors cursor-pointer shrink-0"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied' : 'Copy Content'}</span>
            </button>
          </div>

          <pre className="p-4 sm:p-5 text-xs text-slate-200 font-mono leading-relaxed overflow-x-auto max-h-[500px] overflow-y-auto">
            {currentFile.content}
          </pre>
        </div>

      </div>

    </div>
  );
};
