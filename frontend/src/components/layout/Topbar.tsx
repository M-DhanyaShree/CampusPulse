import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { UserRole } from '../../types';
import {
  Menu,
  Bell,
  LogOut,
  ChevronDown,
  ShieldCheck,
  UserCheck,
  Building,
  GraduationCap,
  PlusCircle,
} from 'lucide-react';
import { Button } from '../ui/Button';

interface TopbarProps {
  onOpenMobileSidebar: () => void;
}

export const Topbar: React.FC<TopbarProps> = ({ onOpenMobileSidebar }) => {
  const { user, role, switchRoleDemo, logout } = useAuth();
  const navigate = useNavigate();
  const [roleDropdownOpen, setRoleDropdownOpen] = useState(false);

  const handleRoleSelect = (newRole: UserRole) => {
    switchRoleDemo(newRole);
    setRoleDropdownOpen(false);

    if (newRole === 'student') navigate('/student/dashboard');
    else if (newRole === 'dept_admin') navigate('/dept/queue');
    else if (newRole === 'management') navigate('/management/analytics');
    else if (newRole === 'superadmin') navigate('/admin/users');
  };

  const roleLabels: Record<UserRole, { label: string; icon: any }> = {
    student: { label: 'Student', icon: GraduationCap },
    dept_admin: { label: 'Dept Admin', icon: Building },
    management: { label: 'Management', icon: UserCheck },
    superadmin: { label: 'Super Admin', icon: ShieldCheck },
  };

  const CurrentRoleIcon = roleLabels[role]?.icon || GraduationCap;

  return (
    <header className="h-16 border-b border-white/10 bg-[#050811]/80 backdrop-blur-xl px-6 flex items-center justify-between sticky top-0 z-40">
      <div className="flex items-center gap-4">
        <button
          onClick={onOpenMobileSidebar}
          className="lg:hidden text-slate-400 hover:text-white p-1 rounded-lg"
        >
          <Menu className="h-5 w-5" />
        </button>

        {/* Instant Role Switcher Dropdown */}
        <div className="relative">
          <button
            onClick={() => setRoleDropdownOpen(!roleDropdownOpen)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#14213d]/80 border border-[#fca311]/40 text-xs font-semibold text-white hover:bg-[#14213d] transition shadow-sm"
          >
            <CurrentRoleIcon className="h-3.5 w-3.5 text-[#fca311]" />
            <span>Role: {roleLabels[role]?.label || role}</span>
            <ChevronDown className="h-3 w-3 text-slate-400" />
          </button>

          {roleDropdownOpen && (
            <>
              <div
                className="fixed inset-0 z-10"
                onClick={() => setRoleDropdownOpen(false)}
              />
              <div className="absolute left-0 mt-2 w-48 rounded-xl glass-card border border-white/10 p-1 shadow-2xl bg-slate-950 z-20 space-y-1">
                <p className="px-3 py-1.5 text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                  Switch Active Role
                </p>
                {(['student', 'dept_admin', 'management', 'superadmin'] as UserRole[]).map(
                  (r) => {
                    const ItemIcon = roleLabels[r].icon;
                    return (
                      <button
                        key={r}
                        onClick={() => handleRoleSelect(r)}
                        className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium text-left transition ${
                          role === r
                            ? 'bg-[#14213d] text-[#fca311] font-semibold'
                            : 'text-slate-300 hover:bg-white/5 hover:text-white'
                        }`}
                      >
                        <ItemIcon className="h-3.5 w-3.5" />
                        <span>{roleLabels[r].label}</span>
                      </button>
                    );
                  }
                )}
              </div>
            </>
          )}
        </div>
      </div>

      <div className="flex items-center gap-4">
        {/* Quick Submit button for Student */}
        {role === 'student' && (
          <Link to="/student/submit">
            <Button size="sm" variant="accent" className="hidden sm:inline-flex">
              <PlusCircle className="h-3.5 w-3.5" />
              <span>Submit Complaint</span>
            </Button>
          </Link>
        )}

        {/* Notifications Icon */}
        <Link
          to="/student/notifications"
          className="relative p-2 text-slate-400 hover:text-white rounded-lg hover:bg-white/5 transition"
          title="Notifications"
        >
          <Bell className="h-4 w-4" />
          <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-[#fca311] ring-2 ring-[#050811]" />
        </Link>

        {/* User Info & Logout */}
        <div className="flex items-center gap-3 pl-3 border-l border-white/10">
          <div className="hidden md:block text-right">
            <p className="text-xs font-bold text-white leading-none">{user?.name}</p>
            <p className="text-[10px] text-slate-400 mt-0.5">{user?.email}</p>
          </div>

          <button
            onClick={logout}
            className="p-2 text-slate-400 hover:text-rose-400 rounded-lg hover:bg-white/5 transition"
            title="Log Out"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
