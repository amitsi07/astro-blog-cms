import React, { useState, useRef } from 'react';
import { Upload, Sparkles, Link as LinkIcon, Trash2, Image as ImageIcon, Eye } from 'lucide-react';
import { ImageBlock } from '../../types/cms';
import { CURATED_STOCK_PRESETS } from './FeaturedImageUploader';

interface InlineImageEditorProps {
  block: ImageBlock;
  onChange: (updatedBlock: ImageBlock) => void;
  onRemove: () => void;
}

export const InlineImageEditor: React.FC<InlineImageEditorProps> = ({
  block,
  onChange,
  onRemove,
}) => {
  const [activeTab, setActiveTab] = useState<'upload' | 'preset' | 'url'>('upload');
  const [urlInput, setUrlInput] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileProcess = (file: File) => {
    if (!file.type.startsWith('image/')) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      if (dataUrl) {
        onChange({
          ...block,
          url: dataUrl,
          alt: block.alt || file.name.replace(/\.[^/.]+$/, ''),
          caption: block.caption || '',
          credit: block.credit || 'Uploaded image',
        });
      }
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileProcess(e.dataTransfer.files[0]);
    }
  };

  return (
    <div className="space-y-4">
      {block.url ? (
        <div className="space-y-3">
          <div className="relative group rounded-xl overflow-hidden border border-slate-800 bg-slate-950">
            <img
              src={block.url}
              alt={block.alt || 'Inline post visual'}
              className="w-full max-h-80 object-cover"
            />
            <div className="absolute top-2 right-2 flex items-center gap-1.5 opacity-90 group-hover:opacity-100 transition-opacity">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="px-2.5 py-1 rounded-lg bg-black/75 hover:bg-black text-white text-xs font-medium backdrop-blur-sm transition-colors border border-slate-700"
              >
                Change Image
              </button>
              <button
                type="button"
                onClick={onRemove}
                className="p-1.5 rounded-lg bg-rose-950/80 hover:bg-rose-900 text-rose-300 border border-rose-800 backdrop-blur-sm transition-colors text-xs"
                title="Delete this block"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              if (e.target.files && e.target.files[0]) {
                handleFileProcess(e.target.files[0]);
              }
            }}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div>
              <label className="text-slate-400 font-medium block mb-1">
                Image Alt Text (SEO & Accessibility)
              </label>
              <input
                type="text"
                value={block.alt || ''}
                onChange={(e) => onChange({ ...block, alt: e.target.value })}
                placeholder="Describe image for search engines..."
                className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-white focus:border-orange-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="text-slate-400 font-medium block mb-1">
                Visible Caption
              </label>
              <input
                type="text"
                value={block.caption || ''}
                onChange={(e) => onChange({ ...block, caption: e.target.value })}
                placeholder="Caption displayed below image..."
                className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-white focus:border-orange-500 focus:outline-none"
              />
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="flex rounded-lg bg-slate-900 p-1 border border-slate-800 text-xs font-medium">
            <button
              type="button"
              onClick={() => setActiveTab('upload')}
              className={`flex-1 flex items-center justify-center gap-1.5 py-1 rounded-md transition-colors ${
                activeTab === 'upload'
                  ? 'bg-orange-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Upload from Computer</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('preset')}
              className={`flex-1 flex items-center justify-center gap-1.5 py-1 rounded-md transition-colors ${
                activeTab === 'preset'
                  ? 'bg-orange-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Stock Photo</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('url')}
              className={`flex-1 flex items-center justify-center gap-1.5 py-1 rounded-md transition-colors ${
                activeTab === 'url'
                  ? 'bg-orange-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <LinkIcon className="w-3.5 h-3.5" />
              <span>Image URL</span>
            </button>
          </div>

          {activeTab === 'upload' && (
            <div
              onDrop={handleDrop}
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragging(true);
              }}
              onDragLeave={() => setIsDragging(false)}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-xl p-5 text-center cursor-pointer transition-all ${
                isDragging
                  ? 'border-orange-500 bg-orange-500/10'
                  : 'border-slate-800 bg-slate-900/60 hover:border-orange-500/60 hover:bg-slate-900'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    handleFileProcess(e.target.files[0]);
                  }
                }}
              />
              <Upload className="w-6 h-6 text-orange-400 mx-auto mb-2" />
              <div className="font-semibold text-white text-xs">
                Upload image to insert here
              </div>
              <p className="text-[11px] text-slate-400">
                Click or drag & drop (JPG, PNG, WebP)
              </p>
            </div>
          )}

          {activeTab === 'preset' && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 max-h-48 overflow-y-auto">
              {CURATED_STOCK_PRESETS.slice(0, 8).map((p, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    onChange({
                      ...block,
                      url: p.url,
                      alt: p.alt,
                      caption: p.title,
                      credit: p.credit,
                    });
                  }}
                  className="group rounded-lg overflow-hidden border border-slate-800 hover:border-orange-500 transition-all text-left bg-slate-900"
                >
                  <img src={p.url} alt={p.alt} className="w-full h-16 object-cover" />
                  <div className="p-1 bg-[#090d16] text-[10px] text-slate-300 truncate">
                    {p.title}
                  </div>
                </button>
              ))}
            </div>
          )}

          {activeTab === 'url' && (
            <div className="flex gap-2">
              <input
                type="url"
                placeholder="https://..."
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                className="flex-1 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-white text-xs"
              />
              <button
                type="button"
                onClick={() => {
                  if (urlInput.trim()) {
                    onChange({
                      ...block,
                      url: urlInput.trim(),
                      alt: 'Blog visual',
                    });
                  }
                }}
                className="px-3 py-1.5 rounded-lg bg-orange-600 hover:bg-orange-500 text-white font-medium text-xs"
              >
                Insert
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
