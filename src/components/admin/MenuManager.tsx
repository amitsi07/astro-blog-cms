import React, { useState } from 'react';
import { MenuItem } from '../../types/cms';
import { Menu, Plus, Trash2, ArrowUp, ArrowDown, Save } from 'lucide-react';

interface MenuManagerProps {
  menus: MenuItem[];
  onSaveMenus: (items: MenuItem[]) => void;
}

export const MenuManager: React.FC<MenuManagerProps> = ({ menus, onSaveMenus }) => {
  const [items, setItems] = useState<MenuItem[]>(menus);
  const [newLabel, setNewLabel] = useState('');
  const [newUrl, setNewUrl] = useState('');
  const [saved, setSaved] = useState(false);

  const moveUp = (index: number) => {
    if (index === 0) return;
    const reordered = [...items];
    const temp = reordered[index - 1];
    reordered[index - 1] = reordered[index];
    reordered[index] = temp;
    // reset orders
    reordered.forEach((it, i) => (it.order = i + 1));
    setItems(reordered);
  };

  const moveDown = (index: number) => {
    if (index === items.length - 1) return;
    const reordered = [...items];
    const temp = reordered[index + 1];
    reordered[index + 1] = reordered[index];
    reordered[index] = temp;
    reordered.forEach((it, i) => (it.order = i + 1));
    setItems(reordered);
  };

  const handleDelete = (id: string) => {
    const filtered = items.filter((it) => it.id !== id);
    filtered.forEach((it, i) => (it.order = i + 1));
    setItems(filtered);
  };

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLabel.trim() || !newUrl.trim()) return;

    const newItem: MenuItem = {
      id: `m-${Date.now()}`,
      label: newLabel.trim(),
      url: newUrl.trim(),
      order: items.length + 1,
    };
    setItems([...items, newItem]);
    setNewLabel('');
    setNewUrl('');
  };

  const handleSaveAll = () => {
    onSaveMenus(items);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="max-w-3xl space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-display text-2xl font-bold text-white">Menu Navigation</h2>
          <p className="text-xs text-slate-400">
            Configure header and mobile navigation order, external targets, and custom routes.
          </p>
        </div>
        <button
          onClick={handleSaveAll}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-orange-600 hover:bg-orange-500 text-white text-xs font-semibold shadow-md shadow-orange-600/30"
        >
          <Save className="w-3.5 h-3.5" />
          <span>{saved ? 'Saved Successfully!' : 'Save Menu'}</span>
        </button>
      </div>

      {/* Add New Link */}
      <form onSubmit={handleAdd} className="p-4 rounded-2xl border border-slate-800 bg-[#090d16] flex flex-col sm:flex-row gap-3">
        <input
          type="text"
          required
          placeholder="Menu Label (e.g. AI Tutorials)"
          value={newLabel}
          onChange={(e) => setNewLabel(e.target.value)}
          className="flex-1 px-3 py-2 text-xs rounded-xl border border-slate-800 bg-slate-900 text-white"
        />
        <input
          type="text"
          required
          placeholder="Destination URL (e.g. /category/technology)"
          value={newUrl}
          onChange={(e) => setNewUrl(e.target.value)}
          className="flex-1 px-3 py-2 text-xs rounded-xl border border-slate-800 bg-slate-900 text-white font-mono"
        />
        <button
          type="submit"
          className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold whitespace-nowrap"
        >
          + Add Link
        </button>
      </form>

      {/* Reorderable List */}
      <div className="p-5 rounded-2xl border border-slate-800 bg-[#090d16] space-y-3">
        {items.map((item, index) => (
          <div
            key={item.id}
            className="p-3 rounded-xl border border-slate-800/80 bg-[#060910] flex items-center justify-between gap-4"
          >
            <div className="flex items-center gap-3">
              <span className="w-6 h-6 rounded-lg bg-slate-800 text-slate-400 text-xs font-mono flex items-center justify-center font-bold">
                {index + 1}
              </span>
              <div>
                <span className="text-xs font-semibold text-white">{item.label}</span>
                <span className="text-[11px] text-slate-500 font-mono block">{item.url}</span>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => moveUp(index)}
                disabled={index === 0}
                className="p-1 rounded bg-slate-900 text-slate-400 hover:text-white disabled:opacity-30"
              >
                <ArrowUp className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => moveDown(index)}
                disabled={index === items.length - 1}
                className="p-1 rounded bg-slate-900 text-slate-400 hover:text-white disabled:opacity-30"
              >
                <ArrowDown className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => handleDelete(item.id)}
                className="p-1 rounded text-slate-500 hover:text-rose-400 ml-1"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
