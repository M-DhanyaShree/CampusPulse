import React from 'react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { useToast } from '../../context/ToastContext';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import {
  FileBarChart,
  Download,
  Clock,
  CheckCircle,
  TrendingUp,
  Award,
  AlertCircle,
} from 'lucide-react';

const WEEKLY_DATA = [
  { day: 'Mon', received: 12, resolved: 10 },
  { day: 'Tue', received: 18, resolved: 15 },
  { day: 'Wed', received: 14, resolved: 16 },
  { day: 'Thu', received: 22, resolved: 19 },
  { day: 'Fri', received: 16, resolved: 17 },
  { day: 'Sat', received: 8, resolved: 9 },
  { day: 'Sun', received: 5, resolved: 5 },
];

const CATEGORY_DISTRIBUTION = [
  { name: 'Wi-Fi & LAN', value: 38, color: '#fca311' },
  { name: 'Electrical & Power', value: 25, color: '#e5e5e5' },
  { name: 'Plumbing & Water', value: 20, color: '#14213d' },
  { name: 'Lab Hardware', value: 17, color: '#38bdf8' },
];

const STAFF_LEADERBOARD = [
  { name: 'Suresh Kumar', specialty: 'Electrical Engineering', resolved: 42, avgTime: '2.4 hrs', rating: '4.9/5' },
  { name: 'Amit Patel', specialty: 'Network Systems & Fiber', resolved: 37, avgTime: '1.8 hrs', rating: '4.8/5' },
  { name: 'Praveen Singh', specialty: 'Hostel Maintenance', resolved: 29, avgTime: '3.1 hrs', rating: '4.7/5' },
  { name: 'Ramesh Chandra', specialty: 'AV & Classroom Tech', resolved: 24, avgTime: '2.9 hrs', rating: '4.6/5' },
];

export const DeptReportsPage: React.FC = () => {
  const { showToast } = useToast();

  const handleExport = () => {
    showToast('Report Generated', 'Department SLA Audit exported in CSV & PDF format.', 'success');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <FileBarChart className="h-6 w-6 text-[#fca311]" />
            <span>Department Performance & SLA Reports</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Weekly throughput, SLA compliance audit, and field technician dispatch efficiency.
          </p>
        </div>

        <Button variant="accent" size="sm" onClick={handleExport}>
          <Download className="h-4 w-4" />
          <span>Export Audit Report</span>
        </Button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-card p-5 rounded-2xl border border-white/10 space-y-2">
          <span className="text-xs text-slate-400 font-medium">SLA Compliance</span>
          <p className="text-2xl sm:text-3xl font-extrabold text-emerald-400">95.4%</p>
          <span className="text-[10px] text-emerald-400 font-semibold">Target: ≥90.0% adhered</span>
        </div>

        <div className="glass-card p-5 rounded-2xl border border-white/10 space-y-2">
          <span className="text-xs text-slate-400 font-medium">Avg Resolution Time</span>
          <p className="text-2xl sm:text-3xl font-extrabold text-[#fca311]">2.8 hrs</p>
          <span className="text-[10px] text-slate-400">18% faster than last cycle</span>
        </div>

        <div className="glass-card p-5 rounded-2xl border border-white/10 space-y-2">
          <span className="text-xs text-slate-400 font-medium">Weekly Throughput</span>
          <p className="text-2xl sm:text-3xl font-extrabold text-white">91 Tickets</p>
          <span className="text-[10px] text-sky-400 font-semibold">95 Received vs 91 Closed</span>
        </div>

        <div className="glass-card p-5 rounded-2xl border border-white/10 space-y-2">
          <span className="text-xs text-slate-400 font-medium">Student Satisfaction</span>
          <p className="text-2xl sm:text-3xl font-extrabold text-white">4.8 / 5.0</p>
          <span className="text-[10px] text-amber-400 font-semibold">Based on 140 ratings</span>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Weekly Inflow vs Resolved */}
        <div className="lg:col-span-2 glass-card rounded-2xl p-6 border border-white/10 space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-bold text-white">Weekly Inflow vs. Resolved Throughput</h4>
            <span className="text-xs text-slate-400 font-mono">Past 7 Days</span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={WEEKLY_DATA} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="day" stroke="#64748b" fontSize={12} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={12} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#050811',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '12px',
                    color: '#ffffff',
                    fontSize: '12px',
                  }}
                />
                <Bar dataKey="received" name="Received" fill="#14213d" radius={[4, 4, 0, 0]} />
                <Bar dataKey="resolved" name="Resolved" fill="#fca311" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category Breakdown */}
        <div className="glass-card rounded-2xl p-6 border border-white/10 space-y-4">
          <h4 className="text-sm font-bold text-white">Category Proportions</h4>

          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={CATEGORY_DISTRIBUTION}
                  innerRadius={50}
                  outerRadius={75}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {CATEGORY_DISTRIBUTION.map((entry, index) => (
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
            {CATEGORY_DISTRIBUTION.map((cat) => (
              <div key={cat.name} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <div className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: cat.color }} />
                  <span className="text-slate-300">{cat.name}</span>
                </div>
                <span className="font-mono text-white font-bold">{cat.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Staff Leaderboard */}
      <div className="glass-card rounded-2xl p-6 border border-white/10 space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-bold text-white flex items-center gap-2">
            <Award className="h-4 w-4 text-[#fca311]" />
            <span>Field Technician Dispatch & Resolution Leaderboard</span>
          </h4>
          <span className="text-xs text-slate-400">Current Sprint</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-white/10 text-slate-400 font-semibold uppercase tracking-wider text-[11px]">
                <th className="pb-3 px-3">Technician</th>
                <th className="pb-3 px-3">Domain</th>
                <th className="pb-3 px-3">Resolved</th>
                <th className="pb-3 px-3">Avg Resolution Time</th>
                <th className="pb-3 px-3 text-right">Rating</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-slate-300">
              {STAFF_LEADERBOARD.map((staff, i) => (
                <tr key={staff.name} className="hover:bg-white/[0.02]">
                  <td className="py-3 px-3 font-bold text-white flex items-center gap-2">
                    <span className="text-slate-500 font-mono text-[10px]">#{i + 1}</span>
                    <span>{staff.name}</span>
                  </td>
                  <td className="py-3 px-3 text-slate-400">{staff.specialty}</td>
                  <td className="py-3 px-3 font-bold text-[#fca311]">{staff.resolved} tickets</td>
                  <td className="py-3 px-3 font-mono">{staff.avgTime}</td>
                  <td className="py-3 px-3 text-right text-emerald-400 font-bold">{staff.rating}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
