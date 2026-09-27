import React, { useState } from 'react';
import { MediaItem } from '../../types/cms';
import { Image, Upload, Search, Trash2, Copy, Check, ExternalLink, Info } from 'lucide-react';

interface MediaLibraryProps {
  media: MediaItem[];
  onAddMedia: (item: MediaItem) => void;
  onUpdateMedia: (id: string, updates: Partial<MediaItem>) => void;
  onDeleteMedia: (id: string) => void;
}

export const MediaLibrary: React.FC<MediaLibraryProps> = ({
  media,
  onAddMedia,
  onUpdateMedia,
  onDeleteMedia,
}) => {
  const [search, setSearch] = useState('');
  const [selectedItem, setSelectedItem] = useState<MediaItem | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // New Media Form
  const [newTitle, setNewTitle] = useState('');
  const [newUrl, setNewUrl] = useState('');
  const [newAlt, setNewAlt] = useState('');
  const [newCaption, setNewCaption] = useState('');
  const [uploadTab, setUploadTab] = useState<'upload' | 'url'>('upload');
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleFileUpload = (file: File) => {
    if (!file.type.startsWith('image/')) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      if (dataUrl) {
        setNewUrl(dataUrl);
        if (!newTitle) {
          setNewTitle(file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' '));
        }
        if (!newAlt) {
          setNewAlt(file.name.replace(/\.[^/.]+$/, ''));
        }
      }
    };
    reader.readAsDataURL(file);
  };

  const filtered = media.filter(
    (m) =>
      m.title.toLowerCase().includes(search.toLowerCase()) ||
      m.altText?.toLowerCase().includes(search.toLowerCase())
  );

  const handleCopyUrl = (item: MediaItem) => {
    navigator.clipboard.writeText(item.url);
    setCopiedId(item.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUrl.trim() || !newTitle.trim()) return;

    const newItem: MediaItem = {
      id: `media-${Date.now()}`,
      title: newTitle.trim(),
      url: newUrl.trim(),
      altText: newAlt.trim() || newTitle.trim(),
      caption: newCaption.trim(),
      mimeType: 'image/jpeg',
      sizeBytes: 312000,
      dimensions: '1200x675',
      uploadedAt: new Date().toISOString(),
    };

    onAddMedia(newItem);
    setNewTitle('');
    setNewUrl('');
    setNewAlt('');
    setNewCaption('');
    setShowAddModal(false);
  };

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-display text-2xl font-bold text-white">Media Library</h2>
          <p className="text-xs text-slate-400">
            Optimized image and asset repository designed for Cloudflare R2 zero-egress delivery.
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-orange-600 hover:bg-orange-500 text-white font-semibold text-xs transition-colors shadow-md shadow-orange-600/30"
        >
          <Upload className="w-4 h-4" />
          <span>Add Media Asset</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="p-4 rounded-2xl border border-slate-800 bg-[#090d16] flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search media by title or alt text..."
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-slate-800 bg-slate-900 text-white placeholder-slate-500 focus:outline-none focus:border-orange-500"
          />
        </div>
        <span className="text-xs text-slate-400 font-mono">
          {media.length} Assets Stored
        </span>
      </div>

      {/* Grid of Media */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {filtered.map((item) => (
          <div
            key={item.id}
            onClick={() => setSelectedItem(item)}
            className="group rounded-xl border border-slate-800 bg-[#090d16] overflow-hidden hover:border-slate-700 transition-all cursor-pointer flex flex-col justify-between"
          >
            <div className="aspect-video w-full bg-slate-950 overflow-hidden relative">
              <img
                src={item.url}
                alt={item.altText}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleCopyUrl(item);
                  }}
                  className="p-1 rounded-md bg-black/70 text-white hover:bg-black"
                  title="Copy URL"
                >
                  {copiedId === item.id ? (
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                </button>
              </div>
            </div>
            <div className="p-3">
              <div className="font-semibold text-xs text-white truncate">{item.title}</div>
              <div className="flex items-center justify-between text-[10px] text-slate-500 mt-1 font-mono">
                <span>{item.dimensions || '1200x675'}</span>
                <span>{(item.sizeBytes / 1024).toFixed(0)} KB</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Media Details Modal */}
      {selectedItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-2xl rounded-2xl border border-slate-800 bg-[#0d131f] p-6 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="font-display text-base font-bold text-white">Asset Details</h3>
              <button
                onClick={() => setSelectedItem(null)}
                className="text-xs text-slate-400 hover:text-white"
              >
                Close
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div className="rounded-xl overflow-hidden border border-slate-800 bg-slate-950 aspect-video">
                <img
                  src={selectedItem.url}
                  alt={selectedItem.altText}
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="space-y-3 text-xs">
                <div>
                  <span className="text-slate-500 block uppercase text-[10px] font-semibold">Title</span>
                  <span className="text-white font-medium">{selectedItem.title}</span>
                </div>
                <div>
                  <span className="text-slate-500 block uppercase text-[10px] font-semibold">Public URL</span>
                  <div className="flex items-center gap-2 mt-0.5">
                    <input
                      type="text"
                      readOnly
                      value={selectedItem.url}
                      className="w-full px-2 py-1 rounded bg-slate-900 border border-slate-800 text-slate-300 font-mono text-[11px]"
                    />
                    <button
                      onClick={() => handleCopyUrl(selectedItem)}
                      className="p-1 text-slate-400 hover:text-white"
                      title="Copy URL"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <div>
                  <span className="text-slate-500 block uppercase text-[10px] font-semibold">Alt Text</span>
                  <input
                    type="text"
                    value={selectedItem.altText}
                    onChange={(e) => {
                      const updated = { ...selectedItem, altText: e.target.value };
                      setSelectedItem(updated);
                      onUpdateMedia(selectedItem.id, { altText: e.target.value });
                    }}
                    className="w-full px-2 py-1 rounded bg-slate-900 border border-slate-800 text-slate-200 mt-0.5"
                  />
                </div>
                <div>
                  <span className="text-slate-500 block uppercase text-[10px] font-semibold">Caption</span>
                  <input
                    type="text"
                    value={selectedItem.caption || ''}
                    onChange={(e) => {
                      const updated = { ...selectedItem, caption: e.target.value };
                      setSelectedItem(updated);
                      onUpdateMedia(selectedItem.id, { caption: e.target.value });
                    }}
                    className="w-full px-2 py-1 rounded bg-slate-900 border border-slate-800 text-slate-200 mt-0.5"
                  />
                </div>
                <div className="pt-2 flex items-center justify-between border-t border-slate-800">
                  <span className="text-slate-500 font-mono text-[11px]">
                    Uploaded: {new Date(selectedItem.uploadedAt).toLocaleDateString()}
                  </span>
                  <button
                    onClick={() => {
                      onDeleteMedia(selectedItem.id);
                      setSelectedItem(null);
                    }}
                    className="px-3 py-1 rounded bg-rose-950/40 border border-rose-500/30 text-rose-400 hover:bg-rose-900/60"
                  >
                    Delete Asset
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Media Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <form
            onSubmit={handleAddSubmit}
            className="w-full max-w-lg rounded-2xl border border-slate-800 bg-[#0d131f] p-6 space-y-4"
          >
            <h3 className="font-display text-base font-bold text-white">Add New Media Asset</h3>
            <div className="space-y-3">
              {/* Upload mode tabs */}
              <div className="flex rounded-lg bg-slate-900 p-1 border border-slate-800 text-xs font-medium">
                <button
                  type="button"
                  onClick={() => setUploadTab('upload')}
                  className={`flex-1 py-1.5 rounded-md transition-colors ${
                    uploadTab === 'upload' ? 'bg-orange-600 text-white' : 'text-slate-400'
                  }`}
                >
                  Upload File
                </button>
                <button
                  type="button"
                  onClick={() => setUploadTab('url')}
                  className={`flex-1 py-1.5 rounded-md transition-colors ${
                    uploadTab === 'url' ? 'bg-orange-600 text-white' : 'text-slate-400'
                  }`}
                >
                  Paste Image URL
                </button>
              </div>

              {uploadTab === 'upload' ? (
                <div
                  onDrop={(e) => {
                    e.preventDefault();
                    setIsDragging(false);
                    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                      handleFileUpload(e.dataTransfer.files[0]);
                    }
                  }}
                  onDragOver={(e) => {
                    e.preventDefault();
                    setIsDragging(true);
                  }}
                  onDragLeave={() => setIsDragging(false)}
                  onClick={() => fileInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-xl p-5 text-center cursor-pointer transition-all ${
                    isDragging
                      ? 'border-orange-500 bg-orange-500/10'
                      : 'border-slate-700 bg-slate-900/60 hover:border-orange-500/60'
                  }`}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        handleFileUpload(e.target.files[0]);
                      }
                    }}
                  />
                  {newUrl ? (
                    <div className="space-y-2">
                      <img
                        src={newUrl}
                        alt="Upload preview"
                        className="w-full h-32 object-cover rounded-lg"
                      />
                      <span className="text-[11px] text-emerald-400 font-medium">
                        ✓ Image file loaded successfully. Click to replace.
                      </span>
                    </div>
                  ) : (
                    <div>
                      <Upload className="w-6 h-6 text-orange-400 mx-auto mb-2" />
                      <div className="font-semibold text-white text-xs mb-1">
                        Click or drag image file here
                      </div>
                      <div className="text-[10px] text-slate-400">
                        Supports PNG, JPG, WebP, GIF, SVG (Up to 10MB)
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
                    Image Source URL (R2 / CDN / Unsplash) *
                  </label>
                  <input
                    type="url"
                    placeholder="https://images.unsplash.com/..."
                    value={newUrl}
                    onChange={(e) => setNewUrl(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-800 bg-slate-900 text-white"
                  />
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
                  Asset Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Cloudflare Edge Server Infrastructure"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-800 bg-slate-900 text-white"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
                  Alt Text (SEO & Accessibility)
                </label>
                <input
                  type="text"
                  placeholder="Describe image content..."
                  value={newAlt}
                  onChange={(e) => setNewAlt(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-800 bg-slate-900 text-white"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
                  Caption (Optional)
                </label>
                <input
                  type="text"
                  placeholder="Displayed underneath image in articles..."
                  value={newCaption}
                  onChange={(e) => setNewCaption(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-800 bg-slate-900 text-white"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="px-3 py-1.5 text-xs text-slate-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-orange-600 hover:bg-orange-500 text-white text-xs font-semibold"
              >
                Save to Library
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
