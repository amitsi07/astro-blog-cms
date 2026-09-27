import React, { useState } from 'react';
import { User, UserRole } from '../../types/cms';
import { Users, Shield, Plus, CheckCircle, UserCheck } from 'lucide-react';

interface UserManagerProps {
  users: User[];
  currentUser: User;
  onSwitchUser: (userId: string) => void;
  onAddUser: (user: User) => void;
  onUpdateUserRole: (userId: string, newRole: UserRole) => void;
}

export const UserManager: React.FC<UserManagerProps> = ({
  users,
  currentUser,
  onSwitchUser,
  onAddUser,
  onUpdateUserRole,
}) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<UserRole>('Author');
  const [title, setTitle] = useState('');

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) return;

    const newUser: User = {
      id: `user-${Date.now()}`,
      name: name.trim(),
      email: email.trim(),
      role,
      title: title.trim() || 'Technical Contributor',
      avatar: `https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=240&h=240&q=80`,
      createdAt: new Date().toISOString(),
    };

    onAddUser(newUser);
    setName('');
    setEmail('');
    setTitle('');
    setShowAddModal(false);
  };

  const rolesMatrix = [
    {
      role: 'Super Admin',
      access: 'Full control including users, roles, site settings, custom code snippets, and Cloudflare D1 schema.',
      badgeColor: 'bg-purple-950/60 text-purple-400 border-purple-500/40',
    },
    {
      role: 'Admin',
      access: 'Posts, pages, categories, tags, media library, and standard CMS operations.',
      badgeColor: 'bg-blue-950/60 text-blue-400 border-blue-500/40',
    },
    {
      role: 'Editor',
      access: 'Review, edit, publish/unpublish posts and manage editorial content.',
      badgeColor: 'bg-emerald-950/60 text-emerald-400 border-emerald-500/40',
    },
    {
      role: 'Author',
      access: 'Create, edit, and publish own assigned articles.',
      badgeColor: 'bg-amber-950/60 text-amber-400 border-amber-500/40',
    },
    {
      role: 'Contributor',
      access: 'Create drafts only; publishing requires editorial approval.',
      badgeColor: 'bg-slate-900 text-slate-300 border-slate-700',
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-display text-2xl font-bold text-white">
            Staff & Role-Based Access Control (RBAC)
          </h2>
          <p className="text-xs text-slate-400">
            Per Section 9 of the specification: Manage user roles, simulate team workflows, and test permissions.
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-orange-600 hover:bg-orange-500 text-white font-semibold text-xs shadow-md shadow-orange-600/30 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Add Staff Member</span>
        </button>
      </div>

      {/* Quick Role Switcher Banner */}
      <div className="p-5 rounded-2xl border border-orange-500/30 bg-gradient-to-r from-orange-950/20 via-[#0d131f] to-[#090d16] space-y-3">
        <div className="flex items-center gap-2 text-orange-400 font-semibold text-xs uppercase tracking-wider">
          <UserCheck className="w-4 h-4" />
          <span>Simulate Active Session Role</span>
        </div>
        <p className="text-xs text-slate-300 leading-relaxed max-w-2xl">
          Click any team member below to instantly switch the simulated active user. Test how the CMS dynamically grants or restricts publishing, settings, and code editing permissions.
        </p>
        <div className="flex flex-wrap gap-2 pt-1">
          {users.map((u) => {
            const isActive = currentUser.id === u.id;
            return (
              <button
                key={u.id}
                onClick={() => onSwitchUser(u.id)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-orange-600 text-white shadow-md shadow-orange-600/30 ring-2 ring-orange-400'
                    : 'bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800'
                }`}
              >
                <img
                  src={u.avatar}
                  alt={u.name}
                  className="w-4 h-4 rounded-full object-cover"
                />
                <span>{u.name}</span>
                <span className="opacity-75 text-[10px] font-mono">({u.role})</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Staff Table */}
      <div className="overflow-hidden rounded-2xl border border-slate-800 bg-[#090d16]">
        <table className="w-full text-left text-xs">
          <thead className="bg-[#060910] text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-800">
            <tr>
              <th className="px-5 py-3.5">Staff Member</th>
              <th className="px-4 py-3.5">Role</th>
              <th className="px-4 py-3.5">Title</th>
              <th className="px-4 py-3.5">Created</th>
              <th className="px-5 py-3.5 text-right">Switch / Manage</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {users.map((u) => {
              const isCurrent = currentUser.id === u.id;
              return (
                <tr
                  key={u.id}
                  className={`hover:bg-slate-800/30 transition-colors ${
                    isCurrent ? 'bg-orange-950/10' : ''
                  }`}
                >
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <img
                        src={u.avatar}
                        alt={u.name}
                        className="w-9 h-9 rounded-full object-cover border border-slate-700"
                      />
                      <div>
                        <div className="font-semibold text-white flex items-center gap-2">
                          <span>{u.name}</span>
                          {isCurrent && (
                            <span className="px-1.5 py-0.2 rounded text-[10px] bg-orange-600 text-white font-mono">
                              ACTIVE
                            </span>
                          )}
                        </div>
                        <span className="text-[11px] text-slate-400">{u.email}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <select
                      value={u.role}
                      onChange={(e) => onUpdateUserRole(u.id, e.target.value as UserRole)}
                      className="px-2.5 py-1 text-xs rounded-lg border border-slate-800 bg-slate-900 text-white font-semibold"
                    >
                      <option value="Super Admin">Super Admin</option>
                      <option value="Admin">Admin</option>
                      <option value="Editor">Editor</option>
                      <option value="Author">Author</option>
                      <option value="Contributor">Contributor</option>
                    </select>
                  </td>
                  <td className="px-4 py-4 text-slate-300">{u.title || u.role}</td>
                  <td className="px-4 py-4 text-slate-400 text-[11px]">
                    {new Date(u.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-5 py-4 text-right">
                    <button
                      onClick={() => onSwitchUser(u.id)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                        isCurrent
                          ? 'bg-slate-800 text-slate-400 cursor-default'
                          : 'bg-slate-900 hover:bg-slate-800 text-white border border-slate-700'
                      }`}
                    >
                      {isCurrent ? 'Simulating' : 'Simulate Role'}
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Section 9 Roles & Permissions Matrix */}
      <div className="p-6 rounded-2xl border border-slate-800 bg-[#090d16] space-y-4">
        <h3 className="font-display text-base font-bold text-white pb-2 border-b border-slate-800">
          Section 9 Specification: Roles & Typical Access Matrix
        </h3>
        <div className="space-y-3">
          {rolesMatrix.map((item) => (
            <div
              key={item.role}
              className="p-3.5 rounded-xl border border-slate-800/80 bg-[#060910] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
            >
              <div className="flex items-center gap-3">
                <span
                  className={`px-2.5 py-1 rounded-md text-xs font-semibold border ${item.badgeColor}`}
                >
                  {item.role}
                </span>
                <span className="text-slate-300">{item.access}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Add Staff Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <form
            onSubmit={handleAddSubmit}
            className="w-full max-w-md rounded-2xl border border-slate-800 bg-[#0d131f] p-6 space-y-4"
          >
            <h3 className="font-display text-base font-bold text-white">Add Staff Account</h3>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Sarah Connor"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-800 bg-slate-900 text-white"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Email Address *</label>
                <input
                  type="email"
                  required
                  placeholder="sarah@astroblog.dev"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-800 bg-slate-900 text-white"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Title / Designation</label>
                <input
                  type="text"
                  placeholder="e.g. Edge Infrastructure Specialist"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-800 bg-slate-900 text-white"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Assigned Role</label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value as UserRole)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-800 bg-slate-900 text-white"
                >
                  <option value="Super Admin">Super Admin</option>
                  <option value="Admin">Admin</option>
                  <option value="Editor">Editor</option>
                  <option value="Author">Author</option>
                  <option value="Contributor">Contributor</option>
                </select>
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
                Add Member
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
