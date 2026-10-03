import React, { useState, useRef } from 'react';
import { usePrompts } from '../../context/PromptContext';
import { MediaItem } from '../../types/prompt';
import { 
  Image as ImageIcon, 
  Upload, 
  Trash2, 
  Copy, 
  Check, 
  ExternalLink, 
  Plus, 
  Search,
  Filter,
  UploadCloud,
  CheckCircle2,
  FolderOpen
} from 'lucide-react';

export const MediaLibrary: React.FC = () => {
  const { mediaList, addMedia, deleteMedia, showToast } = usePrompts();

  const [search, setSearch] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  // File input ref for device upload
  const fileInputRef = useRef<HTMLInputElement>(null);

  // New Media Form state (for manual URL)
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [name, setName] = useState('');
  const [url, setUrl] = useState('');
  const [dimensions, setDimensions] = useState('1536 x 2048');
  const [size, setSize] = useState('1.2 MB');

  const handleFilesUpload = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    Array.from(files).forEach((file) => {
      if (!file.type.startsWith('image/')) return;
      const reader = new FileReader();
      reader.onload = (event) => {
        const dataUrl = event.target?.result as string;
        addMedia({
          name: file.name,
          url: dataUrl,
          size: `${(file.size / (1024 * 1024)).toFixed(2)} MB`,
          dimensions: 'Original',
          mimeType: file.type || 'image/jpeg'
        });
        showToast(`Uploaded "${file.name}" to Media Library`);
      };
      reader.readAsDataURL(file);
    });
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    handleFilesUpload(e.dataTransfer.files);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleAddMedia = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !url.trim()) {
      showToast('Please enter name and URL');
      return;
    }
    addMedia({
      name,
      url,
      dimensions,
      size,
      mimeType: 'image/jpeg'
    });
    setName('');
    setUrl('');
    setIsAddOpen(false);
  };

  const handleCopyUrl = (item: MediaItem) => {
    navigator.clipboard.writeText(item.url);
    setCopiedId(item.id);
    showToast('Copied media URL to clipboard!');
    setTimeout(() => setCopiedId(null), 2000);
  };

  const filtered = mediaList.filter((m) =>
    m.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#212435]">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2.5">
            <ImageIcon className="w-6 h-6 text-blue-400" />
            <span>WordPress Media Library</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Upload images from your device, manage prompt photography assets, and get direct URLs.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <input
            type="file"
            ref={fileInputRef}
            accept="image/*"
            multiple
            onChange={(e) => {
              handleFilesUpload(e.target.files);
              e.target.value = '';
            }}
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold bg-violet-600 hover:bg-violet-500 text-white shadow-md shadow-violet-900/30 transition-colors cursor-pointer"
          >
            <Upload className="w-4 h-4" />
            <span>Upload from Device</span>
          </button>
          <button
            onClick={() => setIsAddOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold bg-[#222638] hover:bg-[#2c324a] text-slate-200 border border-[#2e334d] transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5 text-slate-400" />
            <span>Add by URL</span>
          </button>
        </div>
      </div>

      {/* Drag & Drop Upload Zone */}
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => fileInputRef.current?.click()}
        className={`border-2 border-dashed rounded-2xl p-6 sm:p-8 text-center transition-all cursor-pointer ${
          isDragging 
            ? 'border-violet-500 bg-violet-950/30 ring-4 ring-violet-500/20 scale-[0.99]' 
            : 'border-[#282d42] bg-[#11131e] hover:border-violet-600/60 hover:bg-[#151826]'
        }`}
      >
        <div className="flex flex-col items-center justify-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-violet-600/20 text-violet-400 flex items-center justify-center shadow-inner">
            <UploadCloud className="w-6 h-6" />
          </div>
          <div className="space-y-0.5">
            <p className="text-sm font-bold text-white">
              Drop images here or <span className="text-violet-400 underline decoration-violet-500">browse files</span>
            </p>
            <p className="text-xs text-slate-400">
              Supports JPG, PNG, WebP, GIF up to 50MB · Uploads directly to your local media store
            </p>
          </div>
        </div>
      </div>

      {/* Add Media Modal */}
      {isAddOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <form
            onSubmit={handleAddMedia}
            className="w-full max-w-md bg-[#151724] border border-[#272b3e] rounded-xl p-5 space-y-4 shadow-2xl"
          >
            <h3 className="text-sm font-bold text-white">Add New Media Asset</h3>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Asset Name</label>
              <input
                type="text"
                required
                placeholder="cinematic-portrait-85mm.jpg"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-[#0d0e17] border border-[#272b3e] rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-violet-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Image URL / File Path</label>
              <input
                type="text"
                required
                placeholder="https://images.unsplash.com/... or /src/assets/..."
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="w-full bg-[#0d0e17] border border-[#272b3e] rounded-lg px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-violet-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Dimensions</label>
                <input
                  type="text"
                  value={dimensions}
                  onChange={(e) => setDimensions(e.target.value)}
                  className="w-full bg-[#0d0e17] border border-[#272b3e] rounded-lg px-3 py-2 text-xs text-white font-mono"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Size</label>
                <input
                  type="text"
                  value={size}
                  onChange={(e) => setSize(e.target.value)}
                  className="w-full bg-[#0d0e17] border border-[#272b3e] rounded-lg px-3 py-2 text-xs text-white font-mono"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsAddOpen(false)}
                className="px-3 py-1.5 text-xs text-slate-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 text-xs font-semibold bg-violet-600 hover:bg-violet-500 text-white rounded-lg"
              >
                Add Asset
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Media Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {filtered.map((item) => (
          <div
            key={item.id}
            className="group bg-[#151724] border border-[#23273a] hover:border-[#383e58] rounded-xl overflow-hidden flex flex-col justify-between shadow-lg transition-all"
          >
            <div className="aspect-square bg-black/40 relative overflow-hidden flex items-center justify-center">
              <img
                src={item.url}
                alt={item.name}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 p-2">
                <button
                  onClick={() => handleCopyUrl(item)}
                  className="p-2 rounded-lg bg-[#222638] text-white hover:bg-violet-600 transition-colors cursor-pointer"
                  title="Copy URL"
                >
                  {copiedId === item.id ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                </button>
                <button
                  onClick={() => {
                    if (confirm(`Delete media "${item.name}"?`)) {
                      deleteMedia(item.id);
                    }
                  }}
                  className="p-2 rounded-lg bg-rose-950/80 text-rose-300 hover:bg-rose-600 hover:text-white transition-colors cursor-pointer"
                  title="Delete media"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="p-3">
              <span className="text-xs font-semibold text-white truncate block">
                {item.name}
              </span>
              <div className="flex items-center justify-between text-[10px] text-slate-500 font-mono mt-1">
                <span>{item.dimensions}</span>
                <span>{item.size}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
};
