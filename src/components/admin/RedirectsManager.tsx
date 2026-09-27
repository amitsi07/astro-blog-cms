import React, { useState } from 'react';
import { RedirectRule } from '../../types/cms';
import { Compass, Plus, Trash2, ExternalLink } from 'lucide-react';

interface RedirectsManagerProps {
  redirects: RedirectRule[];
  onAddRedirect: (rule: RedirectRule) => void;
  onDeleteRedirect: (id: string) => void;
}

export const RedirectsManager: React.FC<RedirectsManagerProps> = ({
  redirects,
  onAddRedirect,
  onDeleteRedirect,
}) => {
  const [fromPath, setFromPath] = useState('');
  const [toPath, setToPath] = useState('');
  const [type, setType] = useState<301 | 302>(301);

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fromPath.trim() || !toPath.trim()) return;

    const normalizedFrom = fromPath.startsWith('/') ? fromPath.trim() : `/${fromPath.trim()}`;
    const normalizedTo = toPath.startsWith('/') ? toPath.trim() : `/${toPath.trim()}`;

    onAddRedirect({
      id: `red-${Date.now()}`,
      fromPath: normalizedFrom,
      toPath: normalizedTo,
      type,
      hits: 0,
      createdAt: new Date().toISOString(),
    });

    setFromPath('');
    setToPath('');
  };

  return (
    <div className="max-w-4xl space-y-6">
      <div>
        <h2 className="font-display text-2xl font-bold text-white">301 / 302 Redirect Manager</h2>
        <p className="text-xs text-slate-400">
          Per Section 14: Preserve SEO link equity and resolve 404s when article or category slugs change.
        </p>
      </div>

      {/* Add New Rule */}
      <form onSubmit={handleAddSubmit} className="p-5 rounded-2xl border border-slate-800 bg-[#090d16] space-y-3">
        <h3 className="font-semibold text-xs text-white uppercase tracking-wider">
          Add New Redirect Rule
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
          <div className="sm:col-span-5">
            <input
              type="text"
              required
              placeholder="Source Path (e.g. /old-slug)"
              value={fromPath}
              onChange={(e) => setFromPath(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-800 bg-slate-900 text-white font-mono"
            />
          </div>
          <div className="sm:col-span-4">
            <input
              type="text"
              required
              placeholder="Target Path (e.g. /new-slug)"
              value={toPath}
              onChange={(e) => setToPath(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-800 bg-slate-900 text-white font-mono"
            />
          </div>
          <div className="sm:col-span-2">
            <select
              value={type}
              onChange={(e) => setType(Number(e.target.value) as 301 | 302)}
              className="w-full px-2.5 py-2 text-xs rounded-xl border border-slate-800 bg-slate-900 text-white font-mono"
            >
              <option value={301}>301 (Perm)</option>
              <option value={302}>302 (Temp)</option>
            </select>
          </div>
          <div className="sm:col-span-1">
            <button
              type="submit"
              className="w-full h-full py-2 rounded-xl bg-orange-600 hover:bg-orange-500 text-white text-xs font-semibold flex items-center justify-center"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
        </div>
      </form>

      {/* Table */}
      <div className="overflow-hidden rounded-2xl border border-slate-800 bg-[#090d16]">
        <table className="w-full text-left text-xs">
          <thead className="bg-[#060910] text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-800">
            <tr>
              <th className="px-5 py-3.5">Source URL Path</th>
              <th className="px-4 py-3.5">Target Destination</th>
              <th className="px-4 py-3.5">HTTP Code</th>
              <th className="px-4 py-3.5">Hits Forwarded</th>
              <th className="px-5 py-3.5 text-right">Delete</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 font-mono">
            {redirects.map((r) => (
              <tr key={r.id} className="hover:bg-slate-800/20 transition-colors">
                <td className="px-5 py-3.5 text-rose-300">{r.fromPath}</td>
                <td className="px-4 py-3.5 text-emerald-300">{r.toPath}</td>
                <td className="px-4 py-3.5 text-amber-400 font-bold">{r.type}</td>
                <td className="px-4 py-3.5 text-slate-400">{r.hits.toLocaleString()}</td>
                <td className="px-5 py-3.5 text-right">
                  <button
                    onClick={() => onDeleteRedirect(r.id)}
                    className="p-1 text-slate-500 hover:text-rose-400"
                    title="Remove rule"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
