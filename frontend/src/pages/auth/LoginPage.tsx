import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { UserRole } from '../../types';
import { Brain, GraduationCap, Building, UserCheck, ShieldCheck, ArrowRight, Sparkles } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';

export const LoginPage: React.FC = () => {
  const { login, switchRoleDemo } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('aarav.student@campuspulse.edu');
  const [password, setPassword] = useState('password123');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await login(email, password);
    setLoading(false);
    navigate('/student/dashboard');
  };

  const handleQuickRole = (role: UserRole) => {
    switchRoleDemo(role);
    if (role === 'student') navigate('/student/dashboard');
    else if (role === 'dept_admin') navigate('/dept/queue');
    else if (role === 'management') navigate('/management/analytics');
    else if (role === 'superadmin') navigate('/admin/users');
  };

  return (
    <div className="min-h-screen w-screen bg-[#050811] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Glow Orbs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#14213d] rounded-full blur-3xl opacity-50 pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[#fca311]/15 rounded-full blur-3xl opacity-40 pointer-events-none" />

      <div className="w-full max-w-md relative z-10 space-y-6">
        {/* Brand Banner */}
        <div className="text-center space-y-2">
          <div className="inline-flex h-14 w-14 rounded-2xl bg-gradient-to-tr from-[#14213d] to-[#fca311] p-0.5 items-center justify-center shadow-xl shadow-[#fca311]/20">
            <div className="w-full h-full bg-[#050811] rounded-[14px] flex items-center justify-center">
              <Brain className="h-8 w-8 text-[#fca311]" />
            </div>
          </div>
          <h2 className="text-2xl font-extrabold text-white tracking-tight">
            CampusPulse <span className="text-[#fca311]">AI</span>
          </h2>
          <p className="text-xs text-slate-400">
            Intelligent Campus Complaint Classification & Opinion Mining
          </p>
        </div>

        {/* Login Form Card */}
        <div className="glass-card rounded-2xl p-7 border border-white/10 shadow-2xl space-y-5">
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Campus Email Address"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@campuspulse.edu"
              required
            />
            <Input
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />

            <Button
              type="submit"
              variant="accent"
              className="w-full"
              isLoading={loading}
            >
              <span>Sign In to Portal</span>
              <ArrowRight className="h-4 w-4 ml-1" />
            </Button>
          </form>

          {/* Instant 1-Click Role Login Demo */}
          <div className="pt-4 border-t border-white/10 space-y-2.5">
            <div className="flex items-center gap-1.5 text-xs text-slate-400">
              <Sparkles className="h-3.5 w-3.5 text-[#fca311]" />
              <span className="font-semibold text-white">1-Click Fast Demo Login:</span>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => handleQuickRole('student')}
                className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-900/80 hover:bg-[#14213d] border border-white/10 text-left transition text-xs group"
              >
                <GraduationCap className="h-4 w-4 text-[#fca311] group-hover:scale-110 transition" />
                <div>
                  <p className="font-semibold text-white leading-tight">Student</p>
                  <p className="text-[10px] text-slate-400">Aarav S.</p>
                </div>
              </button>

              <button
                onClick={() => handleQuickRole('dept_admin')}
                className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-900/80 hover:bg-[#14213d] border border-white/10 text-left transition text-xs group"
              >
                <Building className="h-4 w-4 text-sky-400 group-hover:scale-110 transition" />
                <div>
                  <p className="font-semibold text-white leading-tight">Dept Admin</p>
                  <p className="text-[10px] text-slate-400">Prof. Verma</p>
                </div>
              </button>

              <button
                onClick={() => handleQuickRole('management')}
                className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-900/80 hover:bg-[#14213d] border border-white/10 text-left transition text-xs group"
              >
                <UserCheck className="h-4 w-4 text-emerald-400 group-hover:scale-110 transition" />
                <div>
                  <p className="font-semibold text-white leading-tight">Management</p>
                  <p className="text-[10px] text-slate-400">Dr. Rao (Dean)</p>
                </div>
              </button>

              <button
                onClick={() => handleQuickRole('superadmin')}
                className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-900/80 hover:bg-[#14213d] border border-white/10 text-left transition text-xs group"
              >
                <ShieldCheck className="h-4 w-4 text-purple-400 group-hover:scale-110 transition" />
                <div>
                  <p className="font-semibold text-white leading-tight">Super Admin</p>
                  <p className="text-[10px] text-slate-400">System Admin</p>
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
