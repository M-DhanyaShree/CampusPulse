import React, { useState } from 'react';
import { useToast } from '../../context/ToastContext';
import { MOCK_USERS } from '../../lib/api';
import { User, UserRole } from '../../types';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Modal } from '../../components/ui/Modal';
import { Users, UserPlus, Search, ShieldCheck, Mail, Building, Check } from 'lucide-react';
import { formatDate } from '../../lib/utils';

export const UserManagementPage: React.FC = () => {
  const { showToast } = useToast();
  const [users, setUsers] = useState<User[]>(MOCK_USERS);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');

  // Add User Modal State
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newRole, setNewRole] = useState<UserRole>('student');
  const [newDept, setNewDept] = useState('Computer Science & Engineering');

  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase());
    const matchesRole = roleFilter === 'all' || u.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const handleRoleChange = (userId: string, targetRole: UserRole) => {
    setUsers((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, role: targetRole } : u))
    );
    showToast('Role Permission Modified', `User role changed to ${targetRole.toUpperCase()}`, 'success');
  };

  const handleCreateUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newEmail.trim()) return;

    const created: User = {
      id: `u-${Date.now()}`,
      name: newName.trim(),
      email: newEmail.trim(),
      role: newRole,
      departmentName: newDept,
      createdAt: new Date().toISOString(),
    };

    setUsers([created, ...users]);
    setIsAddOpen(false);
    setNewName('');
    setNewEmail('');
    showToast('Account Provisioned', `New user account created for ${created.name}`, 'success');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <Users className="h-6 w-6 text-[#fca311]" />
            <span>Campus User Directory & RBAC Permissions</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Super Administrator controls for campus authentication, role elevation, and staff directory.
          </p>
        </div>

        <Button variant="accent" size="sm" onClick={() => setIsAddOpen(true)}>
          <UserPlus className="h-4 w-4" />
          <span>Provision User Account</span>
        </Button>
      </div>

      {/* Filter and Search */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          <Input
            placeholder="Search campus user name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>

        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className="h-10 rounded-xl glass-input px-3 text-xs text-white bg-slate-900 border border-white/10"
        >
          <option value="all">All Roles</option>
          <option value="student">Student</option>
          <option value="dept_admin">Department Admin</option>
          <option value="management">Management</option>
          <option value="superadmin">Super Admin</option>
        </select>
      </div>

      {/* Users Table */}
      <div className="glass-card rounded-2xl border border-white/10 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-white/10 bg-slate-950/70 text-[11px] uppercase tracking-wider text-slate-400">
                <th className="py-3.5 px-4 font-semibold">User Identity</th>
                <th className="py-3.5 px-4 font-semibold">Email</th>
                <th className="py-3.5 px-4 font-semibold">Department</th>
                <th className="py-3.5 px-4 font-semibold">Role Tier</th>
                <th className="py-3.5 px-4 font-semibold">Joined Date</th>
                <th className="py-3.5 px-4 font-semibold text-right">Access Control</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-slate-300">
              {filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-white/[0.02]">
                  <td className="py-3.5 px-4 font-bold text-white flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-[#14213d] border border-white/10 flex items-center justify-center text-xs font-bold text-[#fca311]">
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                    <span>{user.name}</span>
                  </td>

                  <td className="py-3.5 px-4 font-mono text-slate-400">{user.email}</td>

                  <td className="py-3.5 px-4 text-slate-300">
                    {user.departmentName || 'General Campus'}
                  </td>

                  <td className="py-3.5 px-4">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase font-mono ${
                        user.role === 'superadmin'
                          ? 'bg-purple-950 text-purple-300 border border-purple-500/40'
                          : user.role === 'management'
                          ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/40'
                          : user.role === 'dept_admin'
                          ? 'bg-sky-950 text-sky-300 border border-sky-500/40'
                          : 'bg-slate-800 text-slate-300'
                      }`}
                    >
                      {user.role}
                    </span>
                  </td>

                  <td className="py-3.5 px-4 text-slate-400 font-mono">
                    {formatDate(user.createdAt)}
                  </td>

                  <td className="py-3.5 px-4 text-right">
                    <select
                      value={user.role}
                      onChange={(e) =>
                        handleRoleChange(user.id, e.target.value as UserRole)
                      }
                      className="bg-slate-900 text-xs text-white border border-white/10 rounded-lg px-2.5 py-1 focus:border-[#fca311]"
                    >
                      <option value="student">Student</option>
                      <option value="dept_admin">Dept Admin</option>
                      <option value="management">Management</option>
                      <option value="superadmin">Super Admin</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Provision User Modal */}
      <Modal
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        title="Provision New Campus User"
        description="Register a new student, department administrator, or executive."
      >
        <form onSubmit={handleCreateUser} className="space-y-4">
          <Input
            label="Full Name"
            placeholder="e.g. Dr. Ramesh Gupta"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            required
          />

          <Input
            label="Campus Email Address"
            type="email"
            placeholder="e.g. ramesh.gupta@campuspulse.edu"
            value={newEmail}
            onChange={(e) => setNewEmail(e.target.value)}
            required
          />

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-300">Assign Role</label>
              <select
                value={newRole}
                onChange={(e) => setNewRole(e.target.value as UserRole)}
                className="w-full h-10 rounded-xl glass-input px-3.5 py-2 text-sm text-white bg-slate-900 border border-white/10"
              >
                <option value="student">Student</option>
                <option value="dept_admin">Department Admin</option>
                <option value="management">Management</option>
                <option value="superadmin">Super Admin</option>
              </select>
            </div>

            <Input
              label="Department / Faculty"
              placeholder="e.g. Mechanical Engineering"
              value={newDept}
              onChange={(e) => setNewDept(e.target.value)}
            />
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-white/10">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsAddOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" variant="accent" size="sm">
              <Check className="h-4 w-4" />
              <span>Create Account</span>
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
