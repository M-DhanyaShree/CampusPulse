import React, { useState } from 'react';
import { useToast } from '../../context/ToastContext';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Settings, Cpu, Shield, Save, CheckCircle2, RefreshCw } from 'lucide-react';

export const SystemSettingsPage: React.FC = () => {
  const { showToast } = useToast();

  const [mlEndpoint, setMlEndpoint] = useState('http://localhost:8000');
  const [minConfidence, setMinConfidence] = useState(85);
  const [slaHours, setSlaHours] = useState(24);
  const [hazardKeywords, setHazardKeywords] = useState(
    'fire, shock, spark, electrocution, gas leak, flooding, collapse'
  );
  const [enableSockets, setEnableSockets] = useState(true);
  const [maintenanceMode, setMaintenanceMode] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    showToast(
      'System Settings Saved',
      'CampusPulse AI operational thresholds updated across all nodes.',
      'success'
    );
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h2 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2">
          <Settings className="h-6 w-6 text-[#fca311]" />
          <span>System Settings & Machine Learning Parameters</span>
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          Configure microservices communication, inference sensitivity, and statutory resolution rules.
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* ML Configuration */}
        <Card className="p-6 space-y-5 border border-white/10">
          <div className="flex items-center gap-2 text-white font-bold text-sm">
            <Cpu className="h-4 w-4 text-[#fca311]" />
            <span>FastAPI ML Inference Microservice Config</span>
          </div>

          <div className="space-y-4 pt-2">
            <Input
              label="ML Service Base URL"
              hint="Internal container network host"
              value={mlEndpoint}
              onChange={(e) => setMlEndpoint(e.target.value)}
              required
            />

            <div className="space-y-2">
              <div className="flex justify-between text-xs text-slate-300">
                <span className="font-medium">Auto-Triage Classification Confidence Cutoff</span>
                <span className="font-mono text-[#fca311] font-bold">{minConfidence}%</span>
              </div>
              <input
                type="range"
                min="50"
                max="99"
                value={minConfidence}
                onChange={(e) => setMinConfidence(Number(e.target.value))}
                className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-[#fca311]"
              />
              <p className="text-[10px] text-slate-400">
                Predictions exceeding this threshold are routed to departments automatically without manual clerical intervention.
              </p>
            </div>
          </div>
        </Card>

        {/* SLA & Safety Settings */}
        <Card className="p-6 space-y-5 border border-white/10">
          <div className="flex items-center gap-2 text-white font-bold text-sm">
            <Shield className="h-4 w-4 text-[#fca311]" />
            <span>Campus Safety & SLA Statutory Guardrails</span>
          </div>

          <div className="space-y-4 pt-2">
            <Input
              label="Standard Grievance SLA Threshold (Hours)"
              type="number"
              value={slaHours}
              onChange={(e) => setSlaHours(Number(e.target.value))}
              required
            />

            <Input
              label="Life-Safety Emergency Keyword Trigger List"
              hint="Comma-separated tokens for direct high-priority escalation"
              value={hazardKeywords}
              onChange={(e) => setHazardKeywords(e.target.value)}
              required
            />

            <div className="pt-2 space-y-3">
              <label className="flex items-center justify-between p-3 rounded-xl bg-slate-950/60 border border-white/5 cursor-pointer">
                <div>
                  <p className="text-xs font-semibold text-white">Live Socket.io Broadcast Streams</p>
                  <p className="text-[11px] text-slate-400">Push status changes instantly to connected student clients.</p>
                </div>
                <input
                  type="checkbox"
                  checked={enableSockets}
                  onChange={(e) => setEnableSockets(e.target.checked)}
                  className="h-4 w-4 accent-[#fca311] rounded"
                />
              </label>

              <label className="flex items-center justify-between p-3 rounded-xl bg-slate-950/60 border border-white/5 cursor-pointer">
                <div>
                  <p className="text-xs font-semibold text-white">Maintenance Mode</p>
                  <p className="text-[11px] text-slate-400">Restrict complaint submission during semester break or database migration.</p>
                </div>
                <input
                  type="checkbox"
                  checked={maintenanceMode}
                  onChange={(e) => setMaintenanceMode(e.target.checked)}
                  className="h-4 w-4 accent-rose-500 rounded"
                />
              </label>
            </div>
          </div>
        </Card>

        <div className="flex justify-end">
          <Button type="submit" variant="accent" size="lg">
            <Save className="h-4 w-4" />
            <span>Save System Parameters</span>
          </Button>
        </div>
      </form>
    </div>
  );
};
