import React, { useState } from 'react';
import { usePrompts } from '../context/PromptContext';
import { AIModel, AspectRatio } from '../types/prompt';
import { X, Sparkles, Copy, Check, Plus, Wand2, Sliders } from 'lucide-react';

const STYLES = [
  'Editorial 85mm Fashion Photography',
  'Cinematic Neo-Noir 35mm Movie Still',
  'Makoto Shinkai / Studio Ghibli Anime',
  'Minimalist Commercial Luxury Product',
  'Hyperrealistic Drone Aerial Landscape',
  'Futuristic Cyberpunk Neon Atmospheric',
  'Brutalist Concrete Architectural Digest'
];

const LIGHTINGS = [
  'Soft diffused north-facing daylight',
  'Dramatic golden hour rim lighting',
  'Moody chiaroscuro with deep candlelit shadows',
  'Cyberpunk cyan and magenta neon sign reflections',
  'High-key crisp studio lighting with white foam bounce'
];

const LENSES = [
  '85mm f/1.4 prime lens with shallow depth of field',
  '35mm Panavision anamorphic cinema lens',
  '24mm ultra wide-angle architectural lens',
  '100mm macro medium format lens',
  '50mm f/1.2 street documentary lens'
];

export const PromptGeneratorModal: React.FC = () => {
  const { isGeneratorOpen, setIsGeneratorOpen, saveDraft, showToast } = usePrompts();

  const [model, setModel] = useState<AIModel>('Midjourney v6');
  const [subject, setSubject] = useState('');
  const [style, setStyle] = useState(STYLES[0]);
  const [lighting, setLighting] = useState(LIGHTINGS[0]);
  const [lens, setLens] = useState(LENSES[0]);
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>('3:4');
  const [copied, setCopied] = useState(false);

  if (!isGeneratorOpen) return null;

  // Build generated prompt
  const generatedPromptText = React.useMemo(() => {
    const cleanSubject = subject.trim() || 'a character in contemplative serenity';
    
    let base = `${style} of ${cleanSubject}, illuminated with ${lighting}, shot on ${lens}, 8k high resolution, realistic textures, rich atmospheric depth`;

    if (model === 'Midjourney v6') {
      base += ` --ar ${aspectRatio} --v 6.0 --style raw`;
    } else if (model === 'Flux.1') {
      base += ` --ar ${aspectRatio} --cfg 3.5`;
    } else if (model === 'Gemini / Imagen 3') {
      base += ` Aspect ratio ${aspectRatio}. Photorealistic quality, natural skin details.`;
    } else if (model === 'ChatGPT / DALL·E 3') {
      base += ` Aspect ratio ${aspectRatio}, ultra-detailed composition.`;
    }
    return base;
  }, [model, subject, style, lighting, lens, aspectRatio]);

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedPromptText);
    setCopied(true);
    showToast('AI prompt copied!');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSaveToLibrary = () => {
    const title = subject.trim() ? subject.slice(0, 45) : 'AI Generated Prompt';
    saveDraft({
      title: `${title} (${style.split(' ')[0]})`,
      slug: `custom-${Date.now()}`,
      type: 'prompt',
      model,
      category: 'Realistic',
      image: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=1000&q=80',
      aspectRatio,
      prompt: generatedPromptText,
      tags: ['PromptBuilder', model.split(' ')[0], 'Custom'],
      settings: {
        lighting,
        lens
      },
      author: 'Elena Rostova (Admin)'
    });
    setIsGeneratorOpen(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md overflow-hidden">
      <div 
        className="w-full max-w-3xl bg-[#11131e] border border-[#25293d] rounded-2xl shadow-2xl shadow-black flex flex-col max-h-[92vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#1f2334] bg-[#141724]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-violet-600/30 border border-violet-500/40 flex items-center justify-center text-violet-300">
              <Wand2 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">AI Image Prompt Studio</h3>
              <p className="text-xs text-slate-400">
                Mix and match photography aesthetics to construct tested prompts for Midjourney, Flux & Gemini.
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsGeneratorOpen(false)}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-[#1f2334] rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <div className="p-6 overflow-y-auto space-y-5">
          
          {/* Target AI Engine */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              1. Select Target AI Model
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
              {(['Midjourney v6', 'Flux.1', 'Gemini / Imagen 3', 'ChatGPT / DALL·E 3', 'Stable Diffusion XL'] as AIModel[]).map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setModel(m)}
                  className={`p-2 rounded-lg text-xs font-medium border text-center transition-all cursor-pointer ${
                    model === m
                      ? 'bg-violet-600 border-violet-400 text-white shadow-sm'
                      : 'bg-[#151724] border-[#25293d] text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {m}
                </button>
              ))}
            </div>
          </div>

          {/* Subject */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              2. Describe Subject / Scene Concept
            </label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="e.g. a serene Nordic ceramicist shaping clay, subtle freckles, linen apron"
              className="w-full bg-[#151724] border border-[#262a3d] rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-white focus:outline-none focus:border-violet-500"
            />
          </div>

          {/* Visual Style */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              3. Photography / Art Direction Style
            </label>
            <select
              value={style}
              onChange={(e) => setStyle(e.target.value)}
              className="w-full bg-[#151724] border border-[#262a3d] rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-violet-500 cursor-pointer"
            >
              {STYLES.map((s) => (
                <option key={s} value={s} className="bg-[#141724]">{s}</option>
              ))}
            </select>
          </div>

          {/* Lighting & Camera */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                4. Lighting Atmosphere
              </label>
              <select
                value={lighting}
                onChange={(e) => setLighting(e.target.value)}
                className="w-full bg-[#151724] border border-[#262a3d] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-violet-500 cursor-pointer"
              >
                {LIGHTINGS.map((l) => (
                  <option key={l} value={l} className="bg-[#141724]">{l}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                5. Lens & Depth of Field
              </label>
              <select
                value={lens}
                onChange={(e) => setLens(e.target.value)}
                className="w-full bg-[#151724] border border-[#262a3d] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-violet-500 cursor-pointer"
              >
                {LENSES.map((l) => (
                  <option key={l} value={l} className="bg-[#141724]">{l}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Aspect Ratio */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              6. Aspect Ratio
            </label>
            <div className="flex gap-2">
              {(['1:1', '16:9', '9:16', '4:3', '3:4'] as AspectRatio[]).map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setAspectRatio(r)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-mono font-medium border transition-colors cursor-pointer ${
                    aspectRatio === r
                      ? 'bg-violet-600 border-violet-400 text-white font-semibold'
                      : 'bg-[#151724] border-[#25293d] text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>

          {/* Generated Result Output */}
          <div className="space-y-2 pt-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-300">Generated Prompt Ready to Use:</span>
              <span className="text-[11px] font-mono text-emerald-400">Parameters attached</span>
            </div>

            <div className="bg-[#0b0c12] border border-[#272b3f] rounded-xl p-4">
              <p className="text-xs sm:text-sm text-slate-200 font-mono leading-relaxed select-all">
                {generatedPromptText}
              </p>
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-[#1f2334] bg-[#141724] flex items-center justify-between">
          <button
            onClick={handleSaveToLibrary}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-medium text-slate-200 bg-[#1e2235] hover:bg-[#282d46] rounded-lg transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Save to Library Drafts</span>
          </button>

          <button
            onClick={handleCopy}
            className={`inline-flex items-center gap-2 px-5 py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
              copied
                ? 'bg-emerald-600 text-white'
                : 'bg-violet-600 hover:bg-violet-500 text-white shadow-md shadow-violet-900/40'
            }`}
          >
            {copied ? (
              <>
                <Check className="w-4 h-4" />
                <span>Copied to Clipboard!</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                <span>Copy Generated Prompt</span>
              </>
            )}
          </button>
        </div>

      </div>
    </div>
  );
};
