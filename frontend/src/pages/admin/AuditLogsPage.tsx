import React, { useState } from 'react';
import { useToast } from '../../context/ToastContext';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import {
  ShieldAlert,
  Download,
  Search,
  CheckCircle2,
  AlertTriangle,
  Lock,
  Clock,
} from 'lucide-react';

interface AuditEntry {
  id: string;
  actor: string;
  role: string;
  action: string;
  target: string;
  ipAddress: string;
  status: 'SUCCESS' | 'WARNING' | 'DENIED';
  timestamp: string;
}

const MOCK_AUDIT_LOGS: AuditEntry[] = [
  {
    id: 'log-101',
    actor: 'Prof. Rajesh Verma',
    role: 'dept_admin',
    action: 'DISPATCH_SUB_TICKET',
    target: 'CP-2026-102 (Hostel Electrical)',
    ipAddress: '10.14.2.118',
    status: 'SUCCESS',
    timestamp: new Date(Date.now() - 1000 * 60 * 12).toISOString(),
  },
  {
    id: 'log-102',
    actor: 'Super Administrator',
    role: 'superadmin',
    action: 'RBAC_ROLE_UPDATE',
    target: 'Elevated user u-3 to management',
    ipAddress: '10.14.0.5',
    status: 'SUCCESS',
    timestamp: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
  },
  {
    id: 'log-103',
    actor: 'Dr. Sunita Rao',
    role: 'management',
    action: 'CREATE_SURVEY',
    target: 'Survey: Library Hours Extension',
    ipAddress: '10.14.1.44',
    status: 'SUCCESS',
    timestamp: new Date(Date.now() - 1000 * 60 * 110).toISOString(),
  },
  {
    id: 'log-104',
    actor: 'Aarav Sharma',
    role: 'student',
    action: 'VOTE_SURVEY',
    target: 'poll-1 (Wi-Fi 6 Upgrade Ballot)',
    ipAddress: '172.20.45.88',
    status: 'SUCCESS',
    timestamp: new Date(Date.now() - 1000 * 60 * 140).toISOString(),
  },
  {
    id: 'log-105',
    actor: 'Anonymous Guest',
    role: 'guest',
    action: 'UNAUTHORIZED_ACCESS_ATTEMPT',
    target: 'GET /api/v1/admin/audit-logs',
    ipAddress: '192.168.1.109',
    status: 'DENIED',
    timestamp: new Date(Date.now() - 1000 * 60 * 220).toISOString(),
  },
  {
    id: 'log-106',
    actor: 'Campus AI Worker',
    role: 'system',
    action: 'AUTO_TRIAGE_INFERENCE',
    target: 'Zero-shot bart-large-mnli (94% conf)',
    ipAddress: '127.0.0.1 (FastAPI :8000)',
    status: 'SUCCESS',
    timestamp: new Date(Date.now() - 1000 * 60 * 300).toISOString(),
  },
];

export const AuditLogsPage: React.FC = () => {
  const { showToast } = useToast();
  const [logs] = useState<AuditEntry[]>(MOCK_AUDIT_LOGS);
  const [search, setSearch] = useState('');

  const filteredLogs = logs.filter(
    (l) =>
      l.actor.toLowerCase().includes(search.toLowerCase()) ||
      l.action.toLowerCase().includes(search.toLowerCase()) ||
      l.target.toLowerCase().includes(search.toLowerCase()) ||
      l.ipAddress.includes(search)
  );

  const handleExport = () => {
    showToast('Audit Trail Exported', 'Downloaded encrypted immutable audit logs.', 'success');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <ShieldAlert className="h-6 w-6 text-[#fca311]" />
            <span>Immutable Security & Operations Audit Logs</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Complete cryptographic audit log of all system mutations, role updates, and model inference events.
          </p>
        </div>

        <Button variant="accent" size="sm" onClick={handleExport}>
          <Download className="h-4 w-4" />
          <span>Export Audit Log</span>
        </Button>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
        <Input
          placeholder="Filter by actor, action, IP, or tracking ID..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Logs Table */}
      <div className="glass-card rounded-2xl border border-white/10 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-white/10 bg-slate-950/70 text-[11px] uppercase tracking-wider text-slate-400">
                <th className="py-3.5 px-4 font-semibold">Event Timestamp</th>
                <th className="py-3.5 px-4 font-semibold">Actor / Role</th>
                <th className="py-3.5 px-4 font-semibold">Action Type</th>
                <th className="py-3.5 px-4 font-semibold">Target Resource</th>
                <th className="py-3.5 px-4 font-semibold">Source IP</th>
                <th className="py-3.5 px-4 font-semibold text-right">Verification</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-slate-300">
              {filteredLogs.map((log) => (
                <tr key={log.id} className="hover:bg-white/[0.02]">
                  <td className="py-3.5 px-4 font-mono text-slate-400 whitespace-nowrap">
                    {new Date(log.timestamp).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                      second: '2-digit',
                    })}{' '}
                    • {new Date(log.timestamp).toLocaleDateString()}
                  </td>

                  <td className="py-3.5 px-4">
                    <p className="font-bold text-white">{log.actor}</p>
                    <span className="text-[10px] uppercase font-mono text-slate-400">
                      {log.role}
                    </span>
                  </td>

                  <td className="py-3.5 px-4">
                    <span className="font-mono text-xs text-[#fca311] font-semibold bg-[#fca311]/10 px-2 py-0.5 rounded border border-[#fca311]/20">
                      {log.action}
                    </span>
                  </td>

                  <td className="py-3.5 px-4 text-white font-medium">{log.target}</td>

                  <td className="py-3.5 px-4 font-mono text-slate-400">{log.ipAddress}</td>

                  <td className="py-3.5 px-4 text-right">
                    <span
                      className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        log.status === 'SUCCESS'
                          ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                          : log.status === 'DENIED'
                          ? 'bg-rose-500/15 text-rose-400 border border-rose-500/30'
                          : 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                      }`}
                    >
                      {log.status === 'SUCCESS' ? (
                        <CheckCircle2 className="h-3 w-3" />
                      ) : (
                        <AlertTriangle className="h-3 w-3" />
                      )}
                      <span>{log.status}</span>
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
