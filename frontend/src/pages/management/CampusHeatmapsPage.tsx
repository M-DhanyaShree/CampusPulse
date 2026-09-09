import React, { useState } from 'react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import {
  Flame,
  MapPin,
  AlertTriangle,
  CheckCircle2,
  Layers,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import { Link } from 'react-router-dom';

interface CampusZone {
  id: string;
  name: string;
  type: 'Hostel' | 'Academic' | 'Dining' | 'Recreation';
  ticketsCount: number;
  criticalCount: number;
  urgencyLevel: 'critical' | 'high' | 'medium' | 'low';
  topIssue: string;
  gridSpan?: string;
}

const CAMPUS_ZONES: CampusZone[] = [
  {
    id: 'hostel-a',
    name: 'Hostel Block A (Arya)',
    type: 'Hostel',
    ticketsCount: 24,
    criticalCount: 3,
    urgencyLevel: 'critical',
    topIssue: 'Main breaker tripping & electrical sparks',
    gridSpan: 'col-span-1 md:col-span-2',
  },
  {
    id: 'hostel-b',
    name: 'Hostel Block B (Bhaskara)',
    type: 'Hostel',
    ticketsCount: 16,
    criticalCount: 0,
    urgencyLevel: 'high',
    topIssue: 'Wi-Fi 2nd floor router packet loss',
  },
  {
    id: 'hostel-c',
    name: 'Hostel Block C (Charaka)',
    type: 'Hostel',
    ticketsCount: 9,
    criticalCount: 0,
    urgencyLevel: 'medium',
    topIssue: 'Drinking water cooler filtration',
  },
  {
    id: 'hostel-d',
    name: 'Hostel Block D (Dronacharya)',
    type: 'Hostel',
    ticketsCount: 4,
    criticalCount: 0,
    urgencyLevel: 'low',
    topIssue: 'Table tennis net replacement',
  },
  {
    id: 'central-lib',
    name: 'Central Library & Reading Hall',
    type: 'Academic',
    ticketsCount: 19,
    criticalCount: 0,
    urgencyLevel: 'high',
    topIssue: 'HVAC cooling & evening peak bandwidth',
    gridSpan: 'col-span-1 md:col-span-2',
  },
  {
    id: 'cse-lab',
    name: 'Computer Science Labs 1-4',
    type: 'Academic',
    ticketsCount: 8,
    criticalCount: 0,
    urgencyLevel: 'medium',
    topIssue: 'GPU workstation driver mismatch',
  },
  {
    id: 'main-canteen',
    name: 'Central Dining Hall & Food Court',
    type: 'Dining',
    ticketsCount: 5,
    criticalCount: 0,
    urgencyLevel: 'low',
    topIssue: 'Breakfast fruit queue bottleneck',
  },
  {
    id: 'sports-complex',
    name: 'Indoor Sports Arena & Gymnasium',
    type: 'Recreation',
    ticketsCount: 3,
    criticalCount: 0,
    urgencyLevel: 'low',
    topIssue: 'Locker latch adjustment',
  },
];

export const CampusHeatmapsPage: React.FC = () => {
  const [selectedZone, setSelectedZone] = useState<CampusZone>(CAMPUS_ZONES[0]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2">
          <Flame className="h-6 w-6 text-[#fca311]" />
          <span>Campus Grievance Heatmaps & Spatial Density</span>
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          Geographic grievance concentration across residential halls, academic complexes, and campus facilities.
        </p>
      </div>

      {/* Legend Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-xl glass-panel border border-white/10 text-xs">
        <span className="font-semibold text-white">Heat Intensity Scale:</span>
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-1.5">
            <span className="h-3 w-3 rounded-full bg-rose-500 shadow-sm shadow-rose-500/50" />
            <span className="text-slate-300">Critical Hotspot (&gt;20 tickets or Safety Alert)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-3 w-3 rounded-full bg-amber-500" />
            <span className="text-slate-300">Elevated (10–19 tickets)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-3 w-3 rounded-full bg-sky-500" />
            <span className="text-slate-300">Moderate (5–9 tickets)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-3 w-3 rounded-full bg-emerald-500" />
            <span className="text-slate-300">Low / Optimal (&lt;5 tickets)</span>
          </div>
        </div>
      </div>

      {/* Main Grid Map & Zone Inspector Split */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Campus Map Grid: 2 Cols */}
        <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-3 gap-4">
          {CAMPUS_ZONES.map((zone) => {
            const isSelected = selectedZone.id === zone.id;

            let borderTheme = 'border-emerald-500/30 bg-emerald-950/10 hover:border-emerald-500';
            let badgeBg = 'bg-emerald-500/20 text-emerald-400';

            if (zone.urgencyLevel === 'critical') {
              borderTheme =
                'border-rose-500/60 bg-rose-950/30 hover:border-rose-400 shadow-lg shadow-rose-950/40';
              badgeBg = 'bg-rose-500 text-black font-bold';
            } else if (zone.urgencyLevel === 'high') {
              borderTheme = 'border-amber-500/40 bg-amber-950/20 hover:border-amber-400';
              badgeBg = 'bg-amber-500/20 text-amber-300';
            } else if (zone.urgencyLevel === 'medium') {
              borderTheme = 'border-sky-500/30 bg-sky-950/20 hover:border-sky-400';
              badgeBg = 'bg-sky-500/20 text-sky-300';
            }

            return (
              <div
                key={zone.id}
                onClick={() => setSelectedZone(zone)}
                className={`p-5 rounded-2xl glass-card border transition-all cursor-pointer space-y-3 relative ${
                  zone.gridSpan || ''
                } ${borderTheme} ${
                  isSelected ? 'ring-2 ring-[#fca311] ring-offset-2 ring-offset-[#050811]' : ''
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                      {zone.type}
                    </span>
                    <h4 className="text-sm font-bold text-white mt-0.5">{zone.name}</h4>
                  </div>
                  <span className={`text-xs px-2.5 py-0.5 rounded-full ${badgeBg}`}>
                    {zone.ticketsCount} Tickets
                  </span>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-950/70 border border-white/5 text-[11px] text-slate-300">
                  <span className="text-slate-500 block text-[10px]">Primary Grievance:</span>
                  <span className="font-medium line-clamp-1">{zone.topIssue}</span>
                </div>

                {zone.criticalCount > 0 && (
                  <div className="flex items-center gap-1.5 text-[11px] text-rose-400 font-bold">
                    <Flame className="h-3.5 w-3.5 animate-pulse" />
                    <span>{zone.criticalCount} Life-Safety Priority Tickets</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Selected Zone Inspector Panel */}
        <Card className="p-6 space-y-5 border border-white/10 h-fit bg-slate-950/80">
          <div className="pb-4 border-b border-white/10 space-y-1">
            <span className="text-xs uppercase font-bold text-[#fca311]">
              Zone Intelligence Inspector
            </span>
            <h3 className="text-lg font-bold text-white">{selectedZone.name}</h3>
            <p className="text-xs text-slate-400">Classification: {selectedZone.type} Facility</p>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs p-3 rounded-xl bg-slate-900 border border-white/5">
              <span className="text-slate-400">Total Active Complaints:</span>
              <span className="font-mono font-bold text-white text-sm">
                {selectedZone.ticketsCount}
              </span>
            </div>

            <div className="flex items-center justify-between text-xs p-3 rounded-xl bg-slate-900 border border-white/5">
              <span className="text-slate-400">Emergency / Hazard Tickets:</span>
              <span
                className={`font-mono font-bold text-sm ${
                  selectedZone.criticalCount > 0 ? 'text-rose-400' : 'text-emerald-400'
                }`}
              >
                {selectedZone.criticalCount}
              </span>
            </div>

            <div className="flex items-center justify-between text-xs p-3 rounded-xl bg-slate-900 border border-white/5">
              <span className="text-slate-400">Urgency Category:</span>
              <span className="font-bold text-[#fca311] uppercase">
                {selectedZone.urgencyLevel}
              </span>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/60 border border-white/5 space-y-1.5 text-xs">
            <span className="font-bold text-slate-300 block">AI Grievance Pattern Analysis:</span>
            <p className="text-slate-400 leading-relaxed">
              Spatial clustering highlights repetitive reports regarding{' '}
              <strong className="text-white">"{selectedZone.topIssue}"</strong>. Automated technician
              dispatch is prioritized for this perimeter.
            </p>
          </div>

          <Link to="/dept/queue" className="block">
            <Button size="sm" variant="accent" className="w-full">
              <span>View Filtered Department Queue</span>
              <ArrowRight className="h-4 w-4 ml-1" />
            </Button>
          </Link>
        </Card>
      </div>
    </div>
  );
};
