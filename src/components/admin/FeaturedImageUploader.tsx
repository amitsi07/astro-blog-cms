import React, { useState, useRef } from 'react';
import {
  Upload,
  Image as ImageIcon,
  X,
  Check,
  Sparkles,
  Link as LinkIcon,
  Maximize2,
  Trash2,
  RefreshCw,
  FolderOpen,
  Info,
} from 'lucide-react';
import { MediaItem } from '../../types/cms';

export interface FeaturedImageData {
  url: string;
  alt: string;
  caption: string;
  credit?: string;
  showInPost?: boolean;
}

interface FeaturedImageUploaderProps {
  imageData: FeaturedImageData;
  onChange: (data: FeaturedImageData) => void;
  postTitle?: string;
  mediaLibrary?: MediaItem[];
  onUploadMedia?: (item: MediaItem) => void;
}

// Curated stock photos for rapid 1-click blog illustration
export const CURATED_STOCK_PRESETS = [
  {
    category: 'AI & Future',
    title: 'Neural Network Glow',
    url: 'https://images.unsplash.com/photo-1677442136019-21780efad99a?auto=format&fit=crop&w=1200&h=675&q=80',
    alt: 'Futuristic AI neural network glowing visualization',
    credit: 'Unsplash / Cash Macanaya',
  },
  {
    category: 'AI & Future',
    title: 'Cybernetic Mind Matrix',
    url: 'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?auto=format&fit=crop&w=1200&h=675&q=80',
    alt: 'Digital artificial intelligence concept art with glowing particles',
    credit: 'Unsplash / DeepMind',
  },
  {
    category: 'Code & Tech',
    title: 'Developer Workspace Dark',
    url: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=1200&h=675&q=80',
    alt: 'Modern code editor on screen with syntax highlighting',
    credit: 'Unsplash / Fatos Bytyqi',
  },
  {
    category: 'Code & Tech',
    title: 'Terminal Matrix Stream',
    url: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=1200&h=675&q=80',
    alt: 'Green digital binary and code stream on black background',
    credit: 'Unsplash / Markus Spiske',
  },
  {
    category: 'Design & Minimal',
    title: 'Abstract 3D Liquid Waves',
    url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&h=675&q=80',
    alt: 'Abstract modern 3D fluid shape in dark cosmic colors',
    credit: 'Unsplash / Milad Fakurian',
  },
  {
    category: 'Design & Minimal',
    title: 'Minimalist Clean Desk',
    url: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=1200&h=675&q=80',
    alt: 'Clean minimalist developer laptop on wood table',
    credit: 'Unsplash / Christopher Gower',
  },
  {
    category: 'Cyberpunk',
    title: 'Tokyo Neon Alley Rain',
    url: 'https://images.unsplash.com/photo-1508739773434-c26b3d09e071?auto=format&fit=crop&w=1200&h=675&q=80',
    alt: 'Cyberpunk style illuminated street with reflections',
    credit: 'Unsplash / Aleksandar Pasaric',
  },
  {
    category: 'Cyberpunk',
    title: 'Synthetic Grid Tunnel',
    url: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1200&h=675&q=80',
    alt: 'Motherboard microchip technology illuminated with golden light',
    credit: 'Unsplash / Alexandre Debiève',
  },
  {
    category: 'Business & Cloud',
    title: 'Server Cloud Racks',
    url: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=1200&h=675&q=80',
    alt: 'High-speed cloud computing data center servers with blue LEDs',
    credit: 'Unsplash / Thomas Jensen',
  },
  {
    category: 'Business & Cloud',
    title: 'Modern Architecture Glass',
    url: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1200&h=675&q=80',
    alt: 'Low angle shot of modern geometric glass skyscraper',
    credit: 'Unsplash / Sean Pollock',
  },
  {
    category: 'Nature & Space',
    title: 'Deep Cosmic Nebula',
    url: 'https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?auto=format&fit=crop&w=1200&h=675&q=80',
    alt: 'Space nebula with glowing stars and galaxy dust',
    credit: 'Unsplash / NASA',
  },
  {
    category: 'Nature & Space',
    title: 'Misty Alpine Mountain',
    url: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1200&h=675&q=80',
    alt: 'Scenic mountain peaks surrounded by clouds at dawn',
    credit: 'Unsplash / Kalen Emsley',
  },
];

export const FeaturedImageUploader: React.FC<FeaturedImageUploaderProps> = ({
  imageData,
  onChange,
  postTitle = '',
  mediaLibrary = [],
  onUploadMedia,
}) => {
  const [activeTab, setActiveTab] = useState<'upload' | 'preset' | 'url' | 'library'>('upload');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [urlInput, setUrlInput] = useState('');
  const [librarySearch, setLibrarySearch] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [showFullPreview, setShowFullPreview] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // File upload reader
  const handleFileProcess = (file: File) => {
    setUploadError(null);
    if (!file.type.startsWith('image/')) {
      setUploadError('Please select a valid image file (PNG, JPG, WebP, GIF, SVG).');
      return;
    }

    // Limit to 10MB
    if (file.size > 10 * 1024 * 1024) {
      setUploadError('Image size exceeds 10MB limit. Please upload a smaller image.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      if (dataUrl) {
        const altText = imageData.alt || postTitle || file.name.replace(/\.[^/.]+$/, '');
        onChange({
          ...imageData,
          url: dataUrl,
          alt: altText,
          caption: imageData.caption || '',
          credit: imageData.credit || 'Uploaded from device',
          showInPost: imageData.showInPost !== false,
        });

        // Add to permanent Media Library if callback provided
        if (onUploadMedia) {
          onUploadMedia({
            id: `med-${Date.now()}`,
            title: postTitle ? `${postTitle} Image` : file.name.replace(/\.[^/.]+$/, ''),
            url: dataUrl,
            mimeType: file.type,
            sizeBytes: file.size,
            altText: altText,
            caption: imageData.caption || '',
            uploadedAt: new Date().toISOString(),
          });
        }
      }
    };
    reader.onerror = () => {
      setUploadError('Failed to read image file. Please try again.');
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

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleApplyPreset = (preset: (typeof CURATED_STOCK_PRESETS)[0]) => {
    onChange({
      ...imageData,
      url: preset.url,
      alt: preset.alt,
      caption: preset.title,
      credit: preset.credit,
      showInPost: imageData.showInPost !== false,
    });
  };

  const handleApplyUrl = (e: React.FormEvent) => {
    e.preventDefault();
    if (!urlInput.trim()) return;
    onChange({
      ...imageData,
      url: urlInput.trim(),
      alt: imageData.alt || postTitle || 'Featured post image',
      showInPost: imageData.showInPost !== false,
    });
    setUrlInput('');
  };

  const handleRemoveImage = () => {
    onChange({
      ...imageData,
      url: '',
      caption: '',
      credit: '',
    });
  };

  const categories = ['All', ...Array.from(new Set(CURATED_STOCK_PRESETS.map((p) => p.category)))];
  const filteredPresets =
    selectedCategory === 'All'
      ? CURATED_STOCK_PRESETS
      : CURATED_STOCK_PRESETS.filter((p) => p.category === selectedCategory);

  return (
    <div className="space-y-4">
      {/* 1. If an image is currently set */}
      {imageData.url ? (
        <div className="space-y-3">
          <div className="relative group rounded-xl overflow-hidden border border-slate-700 bg-slate-950 shadow-md">
            <img
              src={imageData.url}
              alt={imageData.alt || 'Featured preview'}
              className="w-full h-44 sm:h-52 object-cover transition-transform duration-300 group-hover:scale-[1.02]"
            />
            {/* Quick floating action bar */}
            <div className="absolute top-2 right-2 flex items-center gap-1.5 opacity-90 group-hover:opacity-100 transition-opacity">
              <button
                type="button"
                onClick={() => setShowFullPreview(true)}
                className="p-1.5 rounded-lg bg-black/70 hover:bg-black text-white backdrop-blur-sm transition-colors text-xs flex items-center gap-1"
                title="View Fullsize"
              >
                <Maximize2 className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={handleRemoveImage}
                className="p-1.5 rounded-lg bg-rose-950/80 hover:bg-rose-900 text-rose-300 border border-rose-800/80 backdrop-blur-sm transition-colors text-xs flex items-center gap-1"
                title="Remove Image"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Bottom info badge */}
            <div className="absolute bottom-2 left-2 px-2.5 py-1 rounded-md bg-black/75 backdrop-blur-sm text-[11px] text-slate-300 border border-slate-800 flex items-center gap-1.5">
              <Check className="w-3 h-3 text-emerald-400" />
              <span className="font-medium text-white">Active Featured Image</span>
            </div>
          </div>

          {/* Change or Replace Button */}
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="flex-1 flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-medium text-xs transition-colors border border-slate-700"
            >
              <Upload className="w-3.5 h-3.5 text-orange-400" />
              <span>Upload New File</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('preset')}
              className="flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-200 text-xs transition-colors border border-slate-700"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Pick Stock</span>
            </button>
            <button
              type="button"
              onClick={handleRemoveImage}
              className="py-1.5 px-3 rounded-lg bg-rose-950/30 hover:bg-rose-900/40 text-rose-400 text-xs transition-colors border border-rose-900/50"
            >
              Remove
            </button>
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

          {/* Image Metadata Inputs (Required for professional blogs!) */}
          <div className="p-3.5 rounded-xl border border-slate-800 bg-[#090e18] space-y-3 text-xs">
            <div className="font-semibold text-white flex items-center justify-between">
              <span>Image SEO & Captions</span>
              <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20 font-medium">
                SEO Essential
              </span>
            </div>

            {/* Alt Text */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-slate-400">
                <label className="font-medium text-slate-300">Alt Text (Accessibility & SEO)</label>
                {postTitle && (
                  <button
                    type="button"
                    onClick={() => onChange({ ...imageData, alt: postTitle })}
                    className="text-[10px] text-orange-400 hover:text-orange-300 underline"
                  >
                    Use Post Title
                  </button>
                )}
              </div>
              <input
                type="text"
                value={imageData.alt || ''}
                onChange={(e) => onChange({ ...imageData, alt: e.target.value })}
                placeholder="Descriptive text for Google & screen readers..."
                className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-white placeholder-slate-500 focus:border-orange-500 focus:outline-none"
              />
              <p className="text-[10px] text-slate-500">
                Helps search engines understand image content and improves image search ranking.
              </p>
            </div>

            {/* Caption */}
            <div className="space-y-1">
              <label className="font-medium text-slate-300 block">Caption</label>
              <input
                type="text"
                value={imageData.caption || ''}
                onChange={(e) => onChange({ ...imageData, caption: e.target.value })}
                placeholder="Caption displayed under the image on the article..."
                className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-white placeholder-slate-500 focus:border-orange-500 focus:outline-none"
              />
            </div>

            {/* Photo Credit */}
            <div className="space-y-1">
              <label className="font-medium text-slate-300 block">Photo Credit / Source</label>
              <input
                type="text"
                value={imageData.credit || ''}
                onChange={(e) => onChange({ ...imageData, credit: e.target.value })}
                placeholder="e.g. Unsplash / Photographer Name"
                className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-white placeholder-slate-500 focus:border-orange-500 focus:outline-none"
              />
            </div>

            {/* Show Featured Image at Top of Post Switch */}
            <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between">
              <div>
                <div className="font-medium text-slate-200">Show in Article Header</div>
                <div className="text-[10px] text-slate-500">
                  Display this hero banner at the top of the article view
                </div>
              </div>
              <button
                type="button"
                onClick={() =>
                  onChange({
                    ...imageData,
                    showInPost: imageData.showInPost === false ? true : false,
                  })
                }
                className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none ${
                  imageData.showInPost !== false ? 'bg-orange-600' : 'bg-slate-800'
                }`}
              >
                <span
                  className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${
                    imageData.showInPost !== false ? 'translate-x-4.5' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* 2. No image selected yet: User friendly selector interface */
        <div className="space-y-3">
          {/* Sub-tabs */}
          <div className="flex rounded-lg bg-slate-900 p-1 border border-slate-800 text-xs font-medium">
            <button
              type="button"
              onClick={() => setActiveTab('upload')}
              className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-md transition-colors ${
                activeTab === 'upload'
                  ? 'bg-orange-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Upload File</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('preset')}
              className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-md transition-colors ${
                activeTab === 'preset'
                  ? 'bg-orange-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Stock Presets</span>
            </button>
            {mediaLibrary.length > 0 && (
              <button
                type="button"
                onClick={() => setActiveTab('library')}
                className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-md transition-colors ${
                  activeTab === 'library'
                    ? 'bg-orange-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <FolderOpen className="w-3.5 h-3.5" />
                <span>Library ({mediaLibrary.length})</span>
              </button>
            )}
            <button
              type="button"
              onClick={() => setActiveTab('url')}
              className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-md transition-colors ${
                activeTab === 'url'
                  ? 'bg-orange-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <LinkIcon className="w-3.5 h-3.5" />
              <span>Paste URL</span>
            </button>
          </div>

          {uploadError && (
            <div className="p-2.5 rounded-lg bg-rose-950/50 border border-rose-800 text-rose-300 text-xs flex items-center gap-2">
              <Info className="w-4 h-4 flex-shrink-0 text-rose-400" />
              <span>{uploadError}</span>
            </div>
          )}

          {/* TAB A: LOCAL DRAG & DROP UPLOAD */}
          {activeTab === 'upload' && (
            <div
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all duration-200 ${
                isDragging
                  ? 'border-orange-500 bg-orange-500/10 scale-[1.01]'
                  : 'border-slate-700/80 bg-slate-900/40 hover:border-orange-500/60 hover:bg-slate-900/80'
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
              <div className="w-12 h-12 rounded-2xl bg-orange-500/10 border border-orange-500/20 text-orange-400 flex items-center justify-center mx-auto mb-3">
                <Upload className="w-6 h-6 animate-pulse" />
              </div>
              <div className="font-semibold text-white text-sm mb-1">
                Drop your featured image here
              </div>
              <p className="text-xs text-slate-400 mb-3">
                or <span className="text-orange-400 underline font-medium">browse files</span> from your computer
              </p>
              <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-slate-800 text-[10px] text-slate-400 font-mono">
                <span>PNG, JPG, WebP, GIF, SVG</span>
                <span>·</span>
                <span>Max 10MB</span>
              </div>
            </div>
          )}

          {/* TAB B: CURATED STOCK PRESETS GALLERY */}
          {activeTab === 'preset' && (
            <div className="space-y-3">
              {/* Category Filter Pills */}
              <div className="flex gap-1 overflow-x-auto pb-1 text-[11px] scrollbar-thin">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-2.5 py-1 rounded-md whitespace-nowrap transition-colors ${
                      selectedCategory === cat
                        ? 'bg-orange-600 text-white font-medium'
                        : 'bg-slate-850 hover:bg-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              {/* Grid of stock photos */}
              <div className="grid grid-cols-2 gap-2 max-h-56 overflow-y-auto pr-1">
                {filteredPresets.map((preset, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleApplyPreset(preset)}
                    className="group relative rounded-lg overflow-hidden border border-slate-800 hover:border-orange-500 transition-all text-left bg-slate-900"
                  >
                    <img
                      src={preset.url}
                      alt={preset.alt}
                      className="w-full h-20 object-cover group-hover:scale-105 transition-transform"
                      loading="lazy"
                    />
                    <div className="p-1.5 bg-[#090d16] border-t border-slate-800 text-[10px] font-medium text-slate-300 truncate">
                      {preset.title}
                    </div>
                  </button>
                ))}
              </div>
              <p className="text-[11px] text-slate-500 text-center">
                Click any high-resolution image to set it as featured image with automatic SEO alt text.
              </p>
            </div>
          )}

          {/* TAB: MEDIA REPOSITORY LIBRARY */}
          {activeTab === 'library' && (
            <div className="space-y-3">
              <input
                type="text"
                placeholder="Search uploaded media..."
                value={librarySearch}
                onChange={(e) => setLibrarySearch(e.target.value)}
                className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-white text-xs placeholder-slate-500 focus:border-orange-500 focus:outline-none"
              />

              <div className="grid grid-cols-2 gap-2 max-h-56 overflow-y-auto pr-1">
                {mediaLibrary
                  .filter(
                    (m) =>
                      m.title.toLowerCase().includes(librarySearch.toLowerCase()) ||
                      m.altText?.toLowerCase().includes(librarySearch.toLowerCase())
                  )
                  .map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() =>
                        onChange({
                          ...imageData,
                          url: item.url,
                          alt: item.altText || item.title,
                          caption: item.caption || item.title,
                          credit: 'Media Library',
                          showInPost: imageData.showInPost !== false,
                        })
                      }
                      className="group relative rounded-lg overflow-hidden border border-slate-800 hover:border-orange-500 transition-all text-left bg-slate-900"
                    >
                      <img
                        src={item.url}
                        alt={item.altText || item.title}
                        className="w-full h-20 object-cover group-hover:scale-105 transition-transform"
                        loading="lazy"
                      />
                      <div className="p-1.5 bg-[#090d16] border-t border-slate-800 text-[10px] font-medium text-slate-300 truncate">
                        {item.title}
                      </div>
                    </button>
                  ))}
              </div>
              <p className="text-[11px] text-slate-500 text-center">
                Click any asset from your site's permanent media repository to apply it.
              </p>
            </div>
          )}

          {/* TAB C: CUSTOM URL */}
          {activeTab === 'url' && (
            <form onSubmit={handleApplyUrl} className="space-y-2">
              <div className="flex gap-2">
                <input
                  type="url"
                  placeholder="https://images.unsplash.com/..."
                  value={urlInput}
                  onChange={(e) => setUrlInput(e.target.value)}
                  className="flex-1 px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 text-white text-xs placeholder-slate-500 focus:border-orange-500 focus:outline-none"
                />
                <button
                  type="submit"
                  disabled={!urlInput.trim()}
                  className="px-3 py-2 rounded-lg bg-orange-600 hover:bg-orange-500 disabled:opacity-40 text-white font-medium text-xs transition-colors"
                >
                  Set Image
                </button>
              </div>
              <p className="text-[11px] text-slate-500">
                Paste any publicly accessible image link from AWS S3, Cloudflare R2, Unsplash, or CDN.
              </p>
            </form>
          )}
        </div>
      )}

      {/* Fullscreen Preview Modal */}
      {showFullPreview && imageData.url && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
          <div className="relative max-w-4xl w-full bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden shadow-2xl">
            <div className="flex items-center justify-between p-4 border-b border-slate-800">
              <div className="font-semibold text-sm text-white">
                Featured Image Preview
              </div>
              <button
                type="button"
                onClick={() => setShowFullPreview(false)}
                className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-4 bg-black flex items-center justify-center max-h-[70vh] overflow-hidden">
              <img
                src={imageData.url}
                alt={imageData.alt || 'Fullsize preview'}
                className="max-h-[65vh] w-auto object-contain rounded-lg"
              />
            </div>
            <div className="p-4 bg-slate-900 text-xs text-slate-300 space-y-1">
              <div>
                <span className="font-semibold text-white">Alt Text:</span>{' '}
                {imageData.alt || 'None'}
              </div>
              {imageData.caption && (
                <div>
                  <span className="font-semibold text-white">Caption:</span>{' '}
                  {imageData.caption}
                </div>
              )}
              {imageData.credit && (
                <div>
                  <span className="font-semibold text-white">Credit:</span>{' '}
                  {imageData.credit}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
