import React from 'react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { useToast } from '../../context/ToastContext';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import {
  BarChart3,
  TrendingUp,
  Download,
  AlertTriangle,
  CheckCircle2,
  Clock,
  ShieldCheck,
  Building,
} from 'lucide-react';

const MONTHLY_TREND = [
  { month: 'Sep', total: 110, resolved: 98 },
  { month: 'Oct', total: 145, resolved: 130 },
  { month: 'Nov', total: 180, resolved: 165 },
  { month: 'Dec', total: 95, resolved: 92 },
  { month: 'Jan', total: 210, resolved: 190 },
  { month: 'Feb', total: 240, resolved: 228 },
];

const DEPT_PERFORMANCE = [
  { dept: 'IT Infrastructure', complaints: 88, adherence: 96 },
  { dept: 'Hostel Maintenance', complaints: 72, adherence: 92 },
  { dept: 'Cafeteria Services', complaints: 45, adherence: 98 },
  { dept: 'Campus Security', complaints: 18, adherence: 100 },
  { dept: 'Academic Facilities', complaints: 34, adherence: 94 },
];

const SENTIMENT_PIE = [
  { name: 'Satisfied / Positive', value: 58, color: '#10b981' },
  { name: 'Neutral / Informational', value: 24, color: '#fca311' },
  { name: 'Frustrated / Urgent', value: 18, color: '#f43f5e' },
];

export const ManagementAnalyticsPage: React.FC = () => {
  const { showToast } = useToast();

  const handleExport = () => {
    showToast('Executive Analytics Exported', 'Downloaded campus health metrics report.', 'success');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <BarChart3 className="h-6 w-6 text-[#fca311]" />
            <span>Campus Executive Analytics Dashboard</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Aggregated campus operational intelligence, departmental response SLAs, and grievance velocity.
          </p>
        </div>

        <Button variant="accent" size="sm" onClick={handleExport}>
          <Download className="h-4 w-4" />
          <span>Export Executive Digest</span>
        </Button>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-card p-5 rounded-2xl border border-white/10 space-y-2">
          <span className="text-xs text-slate-400 font-medium">Total Grievances (YTD)</span>
          <p className="text-2xl sm:text-3xl font-extrabold text-white">1,248</p>
          <span className="text-[10px] text-emerald-400 font-semibold">93.2% Campus Resolution Rate</span>
        </div>

        <div className="glass-card p-5 rounded-2xl border border-white/10 space-y-2">
          <span className="text-xs text-slate-400 font-medium">Campus SLA Adherence</span>
          <p className="text-2xl sm:text-3xl font-extrabold text-emerald-400">95.1%</p>
          <span className="text-[10px] text-slate-400">Within 24h statutory response</span>
        </div>

        <div className="glass-card p-5 rounded-2xl border border-white/10 space-y-2">
          <span className="text-xs text-slate-400 font-medium">Critical Safety Incidents</span>
          <p className="text-2xl sm:text-3xl font-extrabold text-[#fca311]">3 Active</p>
          <span className="text-[10px] text-amber-400 font-semibold">All assigned to emergency teams</span>
        </div>

        <div className="glass-card p-5 rounded-2xl border border-white/10 space-y-2">
          <span className="text-xs text-slate-400 font-medium">AI Auto-Triage Accuracy</span>
          <p className="text-2xl sm:text-3xl font-extrabold text-sky-400">96.8%</p>
          <span className="text-[10px] text-slate-400">zero-shot bart-large-mnli</span>
        </div>
      </div>

      {/* Main Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Trend Area Chart */}
        <div className="lg:col-span-2 glass-card rounded-2xl p-6 border border-white/10 space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-bold text-white">Monthly Grievance Volume vs. Resolution Rate</h4>
            <span className="text-xs text-slate-400 font-mono">Academic Session 2025-26</span>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={MONTHLY_TREND} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#14213d" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#14213d" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorResolved" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#fca311" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#fca311" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="month" stroke="#64748b" fontSize={12} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={12} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#050811',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '12px',
                    color: '#fff',
                    fontSize: '12px',
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="total"
                  name="Grievances Logged"
                  stroke="#38bdf8"
                  fillOpacity={1}
                  fill="url(#colorTotal)"
                />
                <Area
                  type="monotone"
                  dataKey="resolved"
                  name="Resolved"
                  stroke="#fca311"
                  fillOpacity={1}
                  fill="url(#colorResolved)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Sentiment Distribution */}
        <div className="glass-card rounded-2xl p-6 border border-white/10 space-y-4">
          <h4 className="text-sm font-bold text-white">Student Sentiment Distribution</h4>
          <p className="text-xs text-slate-400">
            Real-time roberta NLP mining across campus grievance submissions and poll threads.
          </p>

          <div className="h-52 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={SENTIMENT_PIE}
                  innerRadius={50}
                  outerRadius={75}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {SENTIMENT_PIE.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#050811',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '12px',
                    color: '#fff',
                    fontSize: '12px',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="space-y-1.5 pt-2 border-t border-white/5">
            {SENTIMENT_PIE.map((s) => (
              <div key={s.name} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <div className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: s.color }} />
                  <span className="text-slate-300">{s.name}</span>
                </div>
                <span className="font-mono text-white font-bold">{s.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Department SLA Benchmark */}
      <div className="glass-card rounded-2xl p-6 border border-white/10 space-y-4">
        <h4 className="text-sm font-bold text-white flex items-center gap-2">
          <Building className="h-4 w-4 text-[#fca311]" />
          <span>Departmental Resolution Benchmarks</span>
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {DEPT_PERFORMANCE.map((d) => (
            <div
              key={d.dept}
              className="p-4 rounded-xl bg-slate-950/60 border border-white/5 space-y-2"
            >
              <h5 className="text-xs font-bold text-white truncate">{d.dept}</h5>
              <div className="flex items-baseline justify-between">
                <span className="text-xs text-slate-400">{d.complaints} Active</span>
                <span className="text-xs font-mono font-bold text-emerald-400">{d.adherence}% SLA</span>
              </div>
              <div className="h-1.5 w-full rounded-full bg-slate-800 overflow-hidden">
                <div
                  className="h-full bg-emerald-500 rounded-full"
                  style={{ width: `${d.adherence}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
