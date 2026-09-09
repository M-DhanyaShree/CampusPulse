import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard,
  PlusCircle,
  FolderOpen,
  Vote,
  Bell,
  User,
  ListTodo,
  Kanban,
  FileBarChart,
  BarChart3,
  Flame,
  Brain,
  Users,
  ShieldAlert,
  Settings,
  X,
} from 'lucide-react';
import { cn } from '../../lib/utils';

interface SidebarProps {
  onCloseMobile?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ onCloseMobile }) => {
  const { role, user } = useAuth();

  const studentNav = [
    { label: 'Dashboard', to: '/student/dashboard', icon: LayoutDashboard },
    { label: 'Submit Complaint', to: '/student/submit', icon: PlusCircle },
    { label: 'My Complaints', to: '/student/complaints', icon: FolderOpen },
    { label: 'Campus Surveys', to: '/student/surveys', icon: Vote },
    { label: 'Notifications', to: '/student/notifications', icon: Bell },
    { label: 'My Profile', to: '/student/profile', icon: User },
  ];

  const deptAdminNav = [
    { label: 'Complaint Queue', to: '/dept/queue', icon: ListTodo },
    { label: 'Kanban Board', to: '/dept/kanban', icon: Kanban },
    { label: 'Dept Reports', to: '/dept/reports', icon: FileBarChart },
    { label: 'Notifications', to: '/student/notifications', icon: Bell },
    { label: 'Admin Profile', to: '/student/profile', icon: User },
  ];

  const managementNav = [
    { label: 'Executive Analytics', to: '/management/analytics', icon: BarChart3 },
    { label: 'Campus Surveys', to: '/management/surveys', icon: Vote },
    { label: 'AI Summaries & Reports', to: '/management/ai-reports', icon: Brain },
    { label: 'Campus Heatmaps', to: '/management/heatmaps', icon: Flame },
    { label: 'Notifications', to: '/student/notifications', icon: Bell },
    { label: 'Profile', to: '/student/profile', icon: User },
  ];

  const superAdminNav = [
    { label: 'User Management', to: '/admin/users', icon: Users },
    { label: 'Audit Logs', to: '/admin/audit-logs', icon: ShieldAlert },
    { label: 'System Settings', to: '/admin/settings', icon: Settings },
    { label: 'Campus Analytics', to: '/management/analytics', icon: BarChart3 },
    { label: 'Notifications', to: '/student/notifications', icon: Bell },
  ];

  let currentNav = studentNav;
  let roleTitle = 'Student Portal';

  if (role === 'dept_admin') {
    currentNav = deptAdminNav;
    roleTitle = 'Department Admin';
  } else if (role === 'management') {
    currentNav = managementNav;
    roleTitle = 'Management';
  } else if (role === 'superadmin') {
    currentNav = superAdminNav;
    roleTitle = 'Super Admin';
  }

  return (
    <aside className="w-64 h-screen bg-[#050811] border-r border-white/10 flex flex-col justify-between shrink-0 select-none">
      {/* Brand Header */}
      <div>
        <div className="h-16 px-6 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-[#14213d] to-[#fca311] p-0.5 flex items-center justify-center shadow-lg shadow-[#fca311]/15">
              <div className="w-full h-full bg-[#050811] rounded-[10px] flex items-center justify-center">
                <Brain className="h-5 w-5 text-[#fca311]" />
              </div>
            </div>
            <div>
              <span className="font-extrabold text-sm tracking-tight text-white flex items-center gap-1.5">
                CampusPulse <span className="text-[#fca311]">AI</span>
              </span>
              <span className="text-[10px] text-slate-400 block font-medium">
                {roleTitle}
              </span>
            </div>
          </div>

          {onCloseMobile && (
            <button
              onClick={onCloseMobile}
              className="lg:hidden text-slate-400 hover:text-white p-1"
            >
              <X className="h-5 w-5" />
            </button>
          )}
        </div>

        {/* Navigation List */}
        <nav className="p-4 space-y-1.5">
          {currentNav.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={onCloseMobile}
                className={({ isActive }) =>
                  cn(
                    'flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all duration-200 group',
                    isActive
                      ? 'bg-[#14213d] text-[#fca311] border border-[#fca311]/25 font-semibold shadow-md shadow-black/40'
                      : 'text-slate-400 hover:text-white hover:bg-white/5'
                  )
                }
              >
                <Icon className="h-4 w-4 shrink-0 transition-transform group-hover:scale-110" />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* User Mini Profile Card */}
      <div className="p-4 border-t border-white/10 m-3 rounded-xl bg-slate-950/70 border border-white/5">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-full bg-[#14213d] border border-[#fca311]/40 flex items-center justify-center text-xs font-bold text-[#fca311]">
            {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-white truncate">{user?.name || 'User'}</p>
            <p className="text-[10px] text-slate-400 truncate uppercase font-mono tracking-wider">
              {role}
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
};
