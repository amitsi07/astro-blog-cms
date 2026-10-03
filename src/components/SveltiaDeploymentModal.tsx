import React, { useState } from 'react';
import { usePrompts } from '../context/PromptContext';
import { 
  X, 
  Cloud, 
  Github, 
  Layers, 
  Check, 
  Copy, 
  ExternalLink, 
  Sparkles, 
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Terminal,
  Globe
} from 'lucide-react';

export const SveltiaDeploymentModal: React.FC = () => {
  const { isDeployModalOpen, setIsDeployModalOpen, showToast } = usePrompts();

  const [githubUser, setGithubUser] = useState('your-username');
  const [githubRepo, setGithubRepo] = useState('promptplum-ai');
  const [branch, setBranch] = useState('main');
  const [copiedConfig, setCopiedConfig] = useState(false);
  const [copiedGitCmd, setCopiedGitCmd] = useState(false);

  if (!isDeployModalOpen) return null;

  const generatedConfigYml = `# Sveltia CMS Configuration for PromptPlum
# Hosted 100% Free on Cloudflare Pages + GitHub

backend:
  name: github
  repo: ${githubUser}/${githubRepo}
  branch: ${branch}
  auth_type: implicit
  base_url: https://sveltia-cms-auth.vercel.app

media_folder: "public/uploads"
public_folder: "/uploads"

display_url: "/"
logo_url: "/logo.svg"

collections:
  - name: "prompts"
    label: "AI Prompts"
    label_singular: "Prompt"
    folder: "content/prompts"
    create: true
    slug: "{{slug}}"
    format: "json"
    fields:
      - { label: "ID", name: "id", widget: "string" }
      - { label: "Title", name: "title", widget: "string" }
      - { label: "Slug", name: "slug", widget: "string" }
      - { label: "AI Model", name: "model", widget: "select", options: [
          "Midjourney v6",
          "Flux.1",
          "Gemini / Imagen 3",
          "ChatGPT / DALL·E 3",
          "Stable Diffusion XL"
        ] }
      - { label: "Category", name: "category", widget: "select", options: [
          "Portraits",
          "Cinematic",
          "Realistic",
          "Fashion",
          "Cyberpunk",
          "Fantasy",
          "Product",
          "3D Art",
          "Anime",
          "Architecture"
        ] }
      - { label: "Image URL or Upload", name: "image", widget: "image" }
      - { label: "Aspect Ratio", name: "aspectRatio", widget: "select", options: ["1:1", "16:9", "9:16", "4:3", "3:4", "4:5"] }
      - { label: "Prompt Text", name: "prompt", widget: "text" }
      - { label: "Negative Prompt", name: "negativePrompt", widget: "text", required: false }
      - { label: "Tags", name: "tags", widget: "list" }
      - { label: "Featured in Hero", name: "featured", widget: "boolean", default: false }
      - { label: "Author", name: "author", widget: "string", default: "PromptPlum Community" }
`;

  const gitPushCommand = `git init
git add .
git commit -m "Initial PromptPlum website with Sveltia CMS"
git branch -M ${branch}
git remote add origin https://github.com/${githubUser}/${githubRepo}.git
git push -u origin ${branch}`;

  const handleCopyConfig = () => {
    navigator.clipboard.writeText(generatedConfigYml);
    setCopiedConfig(true);
    showToast('Copied config.yml to clipboard!');
    setTimeout(() => setCopiedConfig(false), 2000);
  };

  const handleCopyGitCmd = () => {
    navigator.clipboard.writeText(gitPushCommand);
    setCopiedGitCmd(true);
    showToast('Copied git push command!');
    setTimeout(() => setCopiedGitCmd(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md overflow-hidden">
      <div 
        className="w-full max-w-4xl bg-[#10121b] border border-[#272b3d] rounded-2xl shadow-2xl shadow-black flex flex-col h-[92vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#1f2334] bg-[#141724]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
              <Cloud className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <span>Free Cloudflare Pages + GitHub + Sveltia CMS Setup</span>
              </h2>
              <p className="text-xs text-slate-400">
                100% Free Lifetime Hosting, Unlimited Bandwidth, Git-based CMS & Zero Server Cost
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsDeployModalOpen(false)}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-[#1f2334] rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          
          {/* Architecture Summary Banner in Hindi and English */}
          <div className="bg-gradient-to-r from-emerald-950/40 via-violet-950/30 to-[#141724] border border-emerald-800/40 rounded-xl p-4.5">
            <h3 className="text-sm font-bold text-emerald-300 mb-1 flex items-center gap-2">
              <Sparkles className="w-4 h-4" />
              <span>फ्री ऑफ कॉस्ट (100% Free) आर्किटेक्चर कैसे काम करेगा:</span>
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              1. <strong>Cloudflare Pages:</strong> आपकी वेबसाइट को बिल्कुल मुफ्त में होस्ट करता है (Unlimited bandwidth, Global CDN, SSL security).<br/>
              2. <strong>GitHub:</strong> आपका पूरा कोड और प्रॉम्प्ट डेटाबेस (<code className="font-mono text-emerald-300">content/prompts/</code>) मुफ़्त में स्टोर करता है।<br/>
              3. <strong>Sveltia CMS:</strong> बिना किसी पेड डेटाबेस या सर्वर के, सीधे आपके ब्राउज़र में <code className="font-mono text-emerald-300">/admin/</code> पर खुलता है और नए प्रॉम्प्ट्स को सीधे GitHub पर कमिट करता है!
            </p>
          </div>

          {/* Interactive Repository Configuration Builder */}
          <div className="bg-[#141724] border border-[#25293d] rounded-xl p-5 space-y-4">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider text-slate-300">
              चरण 1: अपना GitHub रेपो दर्ज करें (Customize your config)
            </h4>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] font-mono text-slate-400 mb-1">
                  GitHub Username / Org
                </label>
                <input
                  type="text"
                  value={githubUser}
                  onChange={(e) => setGithubUser(e.target.value)}
                  placeholder="amtsi5630"
                  className="w-full bg-[#0d0e17] border border-[#2b2f44] rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-[11px] font-mono text-slate-400 mb-1">
                  GitHub Repo Name
                </label>
                <input
                  type="text"
                  value={githubRepo}
                  onChange={(e) => setGithubRepo(e.target.value)}
                  placeholder="promptplum-ai"
                  className="w-full bg-[#0d0e17] border border-[#2b2f44] rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-[11px] font-mono text-slate-400 mb-1">
                  Main Branch
                </label>
                <input
                  type="text"
                  value={branch}
                  onChange={(e) => setBranch(e.target.value)}
                  placeholder="main"
                  className="w-full bg-[#0d0e17] border border-[#2b2f44] rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500 font-mono"
                />
              </div>
            </div>
          </div>

          {/* Step 2: Push code to GitHub */}
          <div className="bg-[#141724] border border-[#25293d] rounded-xl p-5 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <Terminal className="w-4 h-4 text-violet-400" />
                <span>चरण 2: कोड को GitHub पर पुश करें</span>
              </h4>
              <button
                onClick={handleCopyGitCmd}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs text-slate-300 hover:text-white bg-[#1e2235] hover:bg-[#272c42] rounded-lg border border-[#2e334d] transition-colors cursor-pointer"
              >
                {copiedGitCmd ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedGitCmd ? 'कॉपीड' : 'Copy Commands'}</span>
              </button>
            </div>

            <pre className="bg-[#0b0c12] border border-[#232638] rounded-lg p-3 text-xs text-slate-300 font-mono overflow-x-auto">
              {gitPushCommand}
            </pre>
          </div>

          {/* Step 3: Cloudflare Pages Setup */}
          <div className="bg-[#141724] border border-[#25293d] rounded-xl p-5 space-y-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Globe className="w-4 h-4 text-emerald-400" />
              <span>चरण 3: Cloudflare Pages पर फ्री में कनेक्ट करें</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="bg-[#0e1018] p-3 rounded-lg border border-[#242738] space-y-1">
                <span className="text-slate-500 block">1. Build Command:</span>
                <code className="text-emerald-300 font-mono font-bold block text-sm">npm run build</code>
              </div>

              <div className="bg-[#0e1018] p-3 rounded-lg border border-[#242738] space-y-1">
                <span className="text-slate-500 block">2. Build output directory:</span>
                <code className="text-emerald-300 font-mono font-bold block text-sm">dist</code>
              </div>
            </div>

            <p className="text-xs text-slate-400">
              👉 <a href="https://dash.cloudflare.com/" target="_blank" rel="noreferrer" className="text-emerald-400 underline">Cloudflare Dashboard</a> खोलें &rarr; <strong>Workers & Pages</strong> &rarr; <strong>Create Application</strong> &rarr; <strong>Pages</strong> &rarr; <strong>Connect to Git</strong> चुनकर अपना GitHub रेपो सिलेक्ट करें।
            </p>
          </div>

          {/* Step 4: Sveltia CMS config.yml */}
          <div className="bg-[#141724] border border-[#25293d] rounded-xl p-5 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <Layers className="w-4 h-4 text-amber-400" />
                <span>चरण 4: Sveltia CMS Config (public/admin/config.yml)</span>
              </h4>
              <button
                onClick={handleCopyConfig}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-violet-600 hover:bg-violet-500 rounded-lg shadow-sm transition-colors cursor-pointer"
              >
                {copiedConfig ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedConfig ? 'Copied Config!' : 'Copy config.yml'}</span>
              </button>
            </div>

            <p className="text-xs text-slate-400">
              यह फाइल पहले से ही आपके प्रोजेक्ट के <code className="font-mono text-slate-300">/public/admin/config.yml</code> में मौजूद है। बस ऊपर दिए गए GitHub यूजरनेम से मैच कराएं।
            </p>

            <pre className="bg-[#0b0c12] border border-[#232638] rounded-lg p-3 text-xs text-slate-300 font-mono max-h-56 overflow-y-auto">
              {generatedConfigYml}
            </pre>
          </div>

          {/* Step 5: Accessing the Admin */}
          <div className="bg-emerald-950/20 border border-emerald-800/40 rounded-xl p-4.5 flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <h4 className="text-xs font-bold text-white">एडमिन पैनल एक्सेस कैसे करें:</h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                Cloudflare Pages पर डिप्लॉय होने के बाद, आपका एडमिन पैनल सीधे इस URL पर खुलेगा:
                <br/>
                <code className="text-emerald-300 font-mono text-xs block mt-1 bg-black/40 p-1.5 rounded border border-emerald-800/50">
                  https://your-site.pages.dev/admin/
                </code>
                वहां आप अपने GitHub अकाउंट से 1-क्लिक में लॉगिन करके नए AI प्रॉम्प्ट जोड़ सकते हैं, फोटो एडिट कर सकते हैं और श्रेणियां बदल सकते हैं!
              </p>
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 border-t border-[#1f2334] bg-[#141724] flex items-center justify-between">
          <span className="text-xs text-slate-400 font-mono">
            Zero Cost · Zero Server Maintenance
          </span>
          <button
            onClick={() => setIsDeployModalOpen(false)}
            className="px-4 py-2 text-xs font-medium text-white bg-[#1e2235] hover:bg-[#282d46] rounded-lg transition-colors cursor-pointer"
          >
            Close Guide
          </button>
        </div>

      </div>
    </div>
  );
};
