import React, { useState } from 'react';
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
  Filter
} from 'lucide-react';

export const MediaLibrary: React.FC = () => {
  const { mediaList, addMedia, deleteMedia, showToast } = usePrompts();

  const [search, setSearch] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // New Media Form state
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [name, setName] = useState('');
  const [url, setUrl] = useState('');
  const [dimensions, setDimensions] = useState('1536 x 2048');
  const [size, setSize] = useState('1.2 MB');

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
            Manage photography assets, prompt previews, and responsive images.
          </p>
        </div>

        <button
          onClick={() => setIsAddOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold bg-violet-600 hover:bg-violet-500 text-white shadow-md shadow-violet-900/30 transition-colors cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Add Media File</span>
        </button>
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
