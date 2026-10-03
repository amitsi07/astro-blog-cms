import React, { useState, useEffect } from 'react';
import { usePrompts } from '../context/PromptContext';
import { 
  X, 
  Copy, 
  Check, 
  Bookmark, 
  SlidersHorizontal, 
  Sparkles, 
  ExternalLink, 
  Camera, 
  SunMedium, 
  Layers,
  ThumbsUp
} from 'lucide-react';
import { PromptVariable } from '../types/prompt';

export const PromptModal: React.FC = () => {
  const { 
    activePostModal, 
    setActivePostModal, 
    toggleFavorite, 
    favorites, 
    incrementCopy,
    likePost,
    showToast 
  } = usePrompts();

  if (!activePostModal) return null;

  const prompt = activePostModal;
  const isFavorite = favorites.includes(prompt.id);

  // Variable values mapping: { [token]: value }
  const [variableValues, setVariableValues] = useState<Record<string, string>>(() => {
    const initial: Record<string, string> = {};
    if (prompt.variables) {
      prompt.variables.forEach((v: PromptVariable) => {
        initial[v.token] = v.defaultValue;
      });
    }
    return initial;
  });

  const [copiedPrompt, setCopiedPrompt] = useState(false);
  const [copiedNegative, setCopiedNegative] = useState(false);

  // Compute live prompt with replaced variables
  const computedPrompt = React.useMemo(() => {
    let result = prompt.prompt || '';
    Object.entries(variableValues).forEach(([token, val]) => {
      result = result.split(token).join(val);
    });
    return result;
  }, [prompt.prompt, variableValues]);

  // Handle ESC key to close modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setActivePostModal(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [setActivePostModal]);

  const handleCopyPrompt = () => {
    navigator.clipboard.writeText(computedPrompt);
    incrementCopy(prompt.id);
    setCopiedPrompt(true);
    showToast('Prompt copied to clipboard!');
    setTimeout(() => setCopiedPrompt(false), 2000);
  };

  const handleCopyNegative = () => {
    if (!prompt.negativePrompt) return;
    navigator.clipboard.writeText(prompt.negativePrompt);
    setCopiedNegative(true);
    showToast('Negative prompt copied!');
    setTimeout(() => setCopiedNegative(false), 2000);
  };

  const handleOpenChatGPT = () => {
    const encoded = encodeURIComponent(computedPrompt);
    window.open(`https://chatgpt.com/?q=${encoded}`, '_blank');
  };

  const handleOpenGemini = () => {
    window.open('https://gemini.google.com/app', '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-sm overflow-y-auto">
      <div 
        className="relative w-full max-w-4xl bg-[#11131c] border border-[#262a3d] rounded-2xl shadow-2xl shadow-black overflow-hidden max-h-[92vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Bar */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-[#1f2231] bg-[#141724]">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <span className="font-semibold text-violet-400">{prompt.category}</span>
            <span aria-hidden="true" className="text-slate-600">·</span>
            <span className="font-mono text-slate-300">{prompt.model}</span>
            <span aria-hidden="true" className="text-slate-600">·</span>
            <span className="font-mono text-slate-500">Aspect Ratio: {prompt.aspectRatio}</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => toggleFavorite(prompt.id)}
              className={`p-2 rounded-lg border border-[#2b2f42] transition-colors cursor-pointer ${
                isFavorite
                  ? 'bg-rose-500/20 border-rose-500/40 text-rose-300'
                  : 'text-slate-400 hover:text-white hover:bg-[#1f2334]'
              }`}
              title={isFavorite ? 'Saved to favorites' : 'Save prompt'}
            >
              <Bookmark className={`w-4 h-4 ${isFavorite ? 'fill-current' : ''}`} />
            </button>

            <button
              onClick={() => likePost(prompt.id)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#2b2f42] text-xs text-slate-300 hover:text-white hover:bg-[#1f2334] transition-colors cursor-pointer"
            >
              <ThumbsUp className="w-3.5 h-3.5 text-violet-400" />
              <span className="font-mono tabular-nums">{prompt.likesCount}</span>
            </button>

            <button
              onClick={() => setActivePostModal(null)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-[#1f2334] transition-colors cursor-pointer ml-1"
              title="Close (Esc)"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Content Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-6">
          
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            
            {/* Left Column: Image Preview */}
            <div className="md:col-span-5 flex flex-col gap-3">
              <div className="relative rounded-xl overflow-hidden bg-[#0c0d12] border border-[#222636] max-h-[420px] flex items-center justify-center">
                <img
                  src={prompt.image}
                  alt={prompt.title}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-contain max-h-[420px]"
                />
              </div>

              {/* Creator and stats info */}
              <div className="flex items-center justify-between text-xs text-slate-400 px-1 font-mono">
                <span>By: {prompt.author}</span>
                <span className="tabular-nums">{prompt.copiesCount} total copies</span>
              </div>
            </div>

            {/* Right Column: Prompt Details & Variables */}
            <div className="md:col-span-7 flex flex-col justify-between space-y-5">
              
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-white mb-2">
                  {prompt.title}
                </h2>

                {/* Variable Customizer Section */}
                {prompt.variables && prompt.variables.length > 0 && (
                  <div className="mb-4 bg-[#141724] border border-[#25293d] rounded-xl p-3.5 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-violet-300 flex items-center gap-1.5">
                        <SlidersHorizontal className="w-3.5 h-3.5" />
                        <span>Interactive Variables (Customize below)</span>
                      </span>
                      <button
                        onClick={() => {
                          const reset: Record<string, string> = {};
                          prompt.variables?.forEach((v: PromptVariable) => {
                            reset[v.token] = v.defaultValue;
                          });
                          setVariableValues(reset);
                        }}
                        className="text-[11px] text-slate-400 hover:text-white underline cursor-pointer"
                      >
                        Reset Defaults
                      </button>
                    </div>

                    <div className="space-y-2.5">
                      {prompt.variables.map((variable: PromptVariable) => (
                        <div key={variable.token} className="space-y-1">
                          <label className="text-[11px] font-mono text-slate-400 flex items-center justify-between">
                            <span>{variable.name} <code className="text-violet-400">{variable.token}</code></span>
                          </label>

                          {variable.options && variable.options.length > 0 ? (
                            <select
                              value={variableValues[variable.token] || ''}
                              onChange={(e) =>
                                setVariableValues({
                                  ...variableValues,
                                  [variable.token]: e.target.value
                                })
                              }
                              className="w-full bg-[#0d0f17] border border-[#2b2f42] rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-violet-500 cursor-pointer"
                            >
                              {variable.options.map((opt: string) => (
                                <option key={opt} value={opt} className="bg-[#141724]">
                                  {opt}
                                </option>
                              ))}
                            </select>
                          ) : (
                            <input
                              type="text"
                              value={variableValues[variable.token] || ''}
                              onChange={(e) =>
                                setVariableValues({
                                  ...variableValues,
                                  [variable.token]: e.target.value
                                })
                              }
                              className="w-full bg-[#0d0f17] border border-[#2b2f42] rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-violet-500"
                            />
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Prompt Box */}
                <div className="space-y-1.5 mb-4">
                  <div className="flex items-center justify-between text-xs text-slate-400">
                    <span className="font-semibold text-slate-300">Prompt:</span>
                    <span className="font-mono text-[11px] text-slate-500">Ready to copy</span>
                  </div>
                  <div className="relative bg-[#0c0e16] border border-[#262a3c] rounded-xl p-3.5">
                    <p className="text-xs sm:text-sm text-slate-200 font-mono leading-relaxed select-all">
                      {computedPrompt}
                    </p>
                  </div>
                </div>

                {/* Negative Prompt (if present) */}
                {prompt.negativePrompt && (
                  <div className="space-y-1.5 mb-4">
                    <div className="flex items-center justify-between text-xs text-slate-400">
                      <span className="font-medium text-rose-300">Negative Prompt:</span>
                      <button
                        onClick={handleCopyNegative}
                        className="text-[11px] text-slate-400 hover:text-white flex items-center gap-1 cursor-pointer"
                      >
                        {copiedNegative ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                        <span>{copiedNegative ? 'Copied' : 'Copy Negative'}</span>
                      </button>
                    </div>
                    <div className="bg-[#140e14] border border-[#3b1e28] rounded-xl p-2.5">
                      <p className="text-xs text-rose-200/80 font-mono select-all">
                        {prompt.negativePrompt}
                      </p>
                    </div>
                  </div>
                )}

                {/* Recommended settings / EXIF specs */}
                {prompt.settings && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs mb-4">
                    {prompt.settings.lighting && (
                      <div className="bg-[#141724] border border-[#222636] p-2.5 rounded-lg flex items-start gap-2">
                        <SunMedium className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                        <div>
                          <span className="text-[11px] text-slate-500 block">Lighting</span>
                          <span className="text-slate-300 text-xs">{prompt.settings.lighting}</span>
                        </div>
                      </div>
                    )}
                    {prompt.settings.lens && (
                      <div className="bg-[#141724] border border-[#222636] p-2.5 rounded-lg flex items-start gap-2">
                        <Camera className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                        <div>
                          <span className="text-[11px] text-slate-500 block">Camera & Lens</span>
                          <span className="text-slate-300 text-xs">{prompt.settings.lens}</span>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Tags */}
                <div className="flex flex-wrap items-center gap-1.5 text-xs text-slate-400">
                  {prompt.tags.map((tag: string) => (
                    <span key={tag} className="px-2 py-0.5 rounded bg-[#171a27] text-slate-300 border border-[#24283c]">
                      #{tag}
                    </span>
                  ))}
                </div>

              </div>

              {/* Bottom Action Row */}
              <div className="pt-4 border-t border-[#1f2231] flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleOpenChatGPT}
                    className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs text-slate-300 bg-[#161926] hover:bg-[#202538] hover:text-white rounded-lg border border-[#2a2e44] transition-colors cursor-pointer"
                    title="Open ChatGPT"
                  >
                    <span>ChatGPT</span>
                    <ExternalLink className="w-3 h-3 text-slate-500" />
                  </button>

                  <button
                    onClick={handleOpenGemini}
                    className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs text-slate-300 bg-[#161926] hover:bg-[#202538] hover:text-white rounded-lg border border-[#2a2e44] transition-colors cursor-pointer"
                    title="Open Gemini"
                  >
                    <span>Gemini</span>
                    <ExternalLink className="w-3 h-3 text-slate-500" />
                  </button>
                </div>

                <button
                  onClick={handleCopyPrompt}
                  className={`inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                    copiedPrompt
                      ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-900/40'
                      : 'bg-violet-600 hover:bg-violet-500 text-white shadow-lg shadow-violet-900/40'
                  }`}
                >
                  {copiedPrompt ? (
                    <>
                      <Check className="w-4 h-4" />
                      <span>Copied to Clipboard!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      <span>Copy Full Prompt</span>
                    </>
                  )}
                </button>
              </div>

            </div>

          </div>

        </div>

      </div>
    </div>
  );
};
