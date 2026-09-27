import React, { useState } from 'react';
import { ActivityLog } from '../../types/cms';
import { Clock, Search, Filter } from 'lucide-react';

interface ActivityLogsProps {
  logs: ActivityLog[];
}

export const ActivityLogs: React.FC<ActivityLogsProps> = ({ logs }) => {
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');

  const filtered = logs.filter((log) => {
    if (roleFilter !== 'all' && log.userRole !== roleFilter) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      return (
        log.action.toLowerCase().includes(q) ||
        log.details.toLowerCase().includes(q) ||
        log.userName.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-2xl font-bold text-white">Activity & Audit Logs</h2>
        <p className="text-xs text-slate-400">
          Per Section 8 & 9: Complete immutable audit trail of publishing, editing, and administrative events.
        </p>
      </div>

      {/* Filters */}
      <div className="p-4 rounded-2xl border border-slate-800 bg-[#090d16] flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative flex-1 w-full sm:max-w-md">
          <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-2.5" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search action or details..."
            className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg border border-slate-800 bg-slate-900 text-white placeholder-slate-500 focus:outline-none focus:border-orange-500"
          />
        </div>

        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className="px-3 py-1.5 text-xs rounded-lg border border-slate-800 bg-slate-900 text-slate-300 w-full sm:w-auto"
        >
          <option value="all">All Roles</option>
          <option value="Super Admin">Super Admin</option>
          <option value="Admin">Admin</option>
          <option value="Editor">Editor</option>
          <option value="Author">Author</option>
          <option value="Contributor">Contributor</option>
        </select>
      </div>

      {/* Logs Table */}
      <div className="overflow-hidden rounded-2xl border border-slate-800 bg-[#090d16]">
        <table className="w-full text-left text-xs">
          <thead className="bg-[#060910] text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-800">
            <tr>
              <th className="px-5 py-3.5">Action</th>
              <th className="px-4 py-3.5">Details</th>
              <th className="px-4 py-3.5">User</th>
              <th className="px-4 py-3.5">Role</th>
              <th className="px-5 py-3.5 text-right">Timestamp</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {filtered.map((log) => (
              <tr key={log.id} className="hover:bg-slate-800/20 transition-colors">
                <td className="px-5 py-3.5 font-semibold text-white whitespace-nowrap">
                  {log.action}
                </td>
                <td className="px-4 py-3.5 text-slate-300 max-w-md truncate">
                  {log.details}
                </td>
                <td className="px-4 py-3.5 text-slate-200 whitespace-nowrap">
                  {log.userName}
                </td>
                <td className="px-4 py-3.5 whitespace-nowrap">
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-slate-900 border border-slate-800 text-slate-400">
                    {log.userRole}
                  </span>
                </td>
                <td className="px-5 py-3.5 text-right text-slate-400 font-mono text-[11px] whitespace-nowrap">
                  {new Date(log.timestamp).toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
