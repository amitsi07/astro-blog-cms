import React, { useState, useEffect } from 'react';
import { usePrompts } from '../context/PromptContext';
import { X, Copy, Check, SlidersHorizontal, Sparkles, RefreshCw } from 'lucide-react';
import { PromptVariable } from '../types/prompt';

export const PromptCustomizerModal: React.FC = () => {
  const { 
    activeCustomizerPrompt, 
    setActiveCustomizerPrompt, 
    incrementCopy,
    showToast 
  } = usePrompts();

  if (!activeCustomizerPrompt) return null;

  const prompt = activeCustomizerPrompt;

  const [values, setValues] = useState<Record<string, string>>(() => {
    const init: Record<string, string> = {};
    prompt.variables?.forEach((v: PromptVariable) => {
      init[v.token] = v.defaultValue;
    });
    return init;
  });

  const [copied, setCopied] = useState(false);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setActiveCustomizerPrompt(null);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [setActiveCustomizerPrompt]);

  const computedPrompt = React.useMemo(() => {
    let result = prompt.prompt || '';
    Object.entries(values).forEach(([token, val]) => {
      result = result.split(token).join(val);
    });
    return result;
  }, [prompt.prompt, values]);

  const handleCopy = () => {
    navigator.clipboard.writeText(computedPrompt);
    incrementCopy(prompt.id);
    setCopied(true);
    showToast('Customized prompt copied!');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleRandomize = () => {
    const randomized: Record<string, string> = {};
    prompt.variables?.forEach((v: PromptVariable) => {
      if (v.options && v.options.length > 0) {
        const randomIndex = Math.floor(Math.random() * v.options.length);
        randomized[v.token] = v.options[randomIndex];
      } else {
        randomized[v.token] = v.defaultValue;
      }
    });
    setValues(randomized);
    showToast('Randomized variables! 🎲');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div 
        className="w-full max-w-2xl bg-[#11131e] border border-[#252a3d] rounded-2xl shadow-2xl shadow-black overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#1f2334] bg-[#141724]">
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="w-4 h-4 text-violet-400" />
            <h3 className="text-sm font-semibold text-white">Customize Prompt Variables</h3>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleRandomize}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs text-slate-300 hover:text-white bg-[#1a1d2c] hover:bg-[#22273b] border border-[#2a2f44] rounded-lg transition-colors cursor-pointer"
              title="Pick random options"
            >
              <RefreshCw className="w-3 h-3 text-violet-400" />
              <span>Surprise Me</span>
            </button>
            <button
              onClick={() => setActiveCustomizerPrompt(null)}
              className="p-1.5 text-slate-400 hover:text-white hover:bg-[#1f2334] rounded-lg transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-5 overflow-y-auto space-y-5">
          <div>
            <h4 className="text-sm font-semibold text-white mb-1">{prompt.title}</h4>
            <div className="flex items-center gap-2 text-xs text-slate-400 font-mono">
              <span>{prompt.category}</span>
              {prompt.model && (
                <>
                  <span aria-hidden="true">·</span>
                  <span>{prompt.model}</span>
                </>
              )}
              {prompt.aspectRatio && (
                <>
                  <span aria-hidden="true">·</span>
                  <span>{prompt.aspectRatio}</span>
                </>
              )}
            </div>
          </div>

          {/* Variables Inputs */}
          <div className="space-y-4 bg-[#141724] border border-[#222638] rounded-xl p-4">
            {prompt.variables && prompt.variables.length > 0 ? (
              prompt.variables.map((variable: PromptVariable) => (
                <div key={variable.token} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium text-slate-200">{variable.name}</span>
                    <code className="text-violet-400 font-mono text-[11px]">{variable.token}</code>
                  </div>

                  {variable.options && variable.options.length > 0 ? (
                    <div className="space-y-2">
                      <select
                        value={values[variable.token] || ''}
                        onChange={(e) =>
                          setValues({ ...values, [variable.token]: e.target.value })
                        }
                        className="w-full bg-[#0c0d14] border border-[#2a2e42] rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-violet-500 cursor-pointer"
                      >
                        {variable.options.map((opt: string) => (
                          <option key={opt} value={opt} className="bg-[#141724]">
                            {opt}
                          </option>
                        ))}
                      </select>
                      
                      {/* Quick click pills */}
                      <div className="flex flex-wrap gap-1.5">
                        {variable.options.map((opt: string) => (
                          <button
                            key={opt}
                            onClick={() => setValues({ ...values, [variable.token]: opt })}
                            className={`text-[11px] px-2 py-1 rounded text-left transition-colors cursor-pointer ${
                              values[variable.token] === opt
                                ? 'bg-violet-600 text-white font-medium'
                                : 'bg-[#1b1e2c] text-slate-400 hover:text-slate-200'
                            }`}
                          >
                            {opt.length > 35 ? opt.substring(0, 32) + '...' : opt}
                          </button>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <input
                      type="text"
                      value={values[variable.token] || ''}
                      onChange={(e) =>
                        setValues({ ...values, [variable.token]: e.target.value })
                      }
                      className="w-full bg-[#0c0d14] border border-[#2a2e42] rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-violet-500"
                    />
                  )}
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-400">
                This prompt does not have predefined variables. You can copy it directly!
              </p>
            )}
          </div>

          {/* Live Preview Box */}
          <div className="space-y-1.5">
            <span className="text-xs font-semibold text-slate-300">Live Result Preview:</span>
            <div className="bg-[#0b0c12] border border-[#26293a] rounded-xl p-3.5">
              <p className="text-xs text-slate-200 font-mono leading-relaxed select-all">
                {computedPrompt}
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-[#1f2334] bg-[#141724] flex items-center justify-between">
          <span className="text-[11px] text-slate-400 font-mono">
            Astro SSG Variable Engine
          </span>
          <button
            onClick={handleCopy}
            className={`inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
              copied
                ? 'bg-emerald-600 text-white'
                : 'bg-violet-600 hover:bg-violet-500 text-white shadow-md shadow-violet-900/40'
            }`}
          >
            {copied ? (
              <>
                <Check className="w-4 h-4" />
                <span>Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                <span>Copy Customized Prompt</span>
              </>
            )}
          </button>
        </div>

      </div>
    </div>
  );
};
