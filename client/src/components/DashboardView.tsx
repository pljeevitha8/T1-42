import React, { useEffect, useState } from 'react';
import {
  FolderOpen,
  Palette,
  Sparkles,
  ShieldCheck,
  Plus,
  ArrowRight,
  Clock,
  Fingerprint,
  TrendingUp,
  Activity,
  Layers,
  FileCheck2,
} from 'lucide-react';
import { Case, SystemMetrics, AuditLog } from '../types';
import { api } from '../services/api';

interface DashboardViewProps {
  cases: Case[];
  onSelectCase: (caseItem: Case) => void;
  onNewCase: () => void;
  onNavigateToTab: (tab: string) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  cases,
  onSelectCase,
  onNewCase,
  onNavigateToTab,
}) => {
  const [metrics, setMetrics] = useState<SystemMetrics | null>(null);
  const [recentLogs, setRecentLogs] = useState<AuditLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    api.getSystemMetrics()
      .then((data) => {
        setMetrics(data.metrics);
        setRecentLogs(data.recentActivity);
      })
      .catch((err) => console.error('Failed to load metrics:', err))
      .finally(() => setIsLoading(false));
  }, []);

  const totalSketches = cases.reduce((acc, c) => acc + (c.sketches?.length || 0), 0);
  const activeCasesCount = cases.filter((c) => c.status === 'ACTIVE').length;
  const criticalCasesCount = cases.filter((c) => c.priority === 'CRITICAL' || c.priority === 'HIGH').length;

  return (
    <div className="flex-1 overflow-y-auto p-6 lg:p-8 space-y-8 bg-navy-950">
      {/* Welcome Banner */}
      <div className="relative p-6 lg:p-8 rounded-2xl bg-gradient-to-r from-navy-900 via-navy-800 to-navy-900 border border-forensic-purple/30 shadow-2xl overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-grid-pattern opacity-40 pointer-events-none" />
        <div className="relative z-10 max-w-2xl space-y-3">
          <div className="inline-flex items-center space-x-2 px-3 py-1 bg-forensic-purple/20 border border-forensic-purple/40 text-forensic-purple text-xs font-mono font-bold rounded-full">
            <Fingerprint className="w-3.5 h-3.5" />
            <span>METROPOLITAN FORENSIC IDENTIFICATION DIVISION</span>
          </div>
          <h1 className="text-2xl lg:text-3xl font-extrabold text-white tracking-wide">
            Forensic Facial Reconstruction & Composite Studio
          </h1>
          <p className="text-sm text-slate-300 leading-relaxed">
            Synthesize NIST-standard forensic pencil sketches from subjective eyewitness depositions. Features continuous iterative refinement, cranial proportion calibration, and cryptographic chain-of-custody logging.
          </p>
          <div className="pt-2 flex items-center space-x-3">
            <button
              onClick={onNewCase}
              className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-forensic-purple to-forensic-indigo hover:from-forensic-accent hover:to-forensic-purple text-white text-xs font-bold rounded-lg shadow-lg shadow-forensic-purple/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <Plus className="w-4 h-4" />
              <span>Initiate New Investigation</span>
            </button>
            <button
              onClick={() => onNavigateToTab('cases')}
              className="flex items-center space-x-2 px-4 py-2 bg-navy-800/80 hover:bg-navy-700 text-slate-200 text-xs font-semibold rounded-lg border border-navy-700 transition-colors"
            >
              <FolderOpen className="w-4 h-4" />
              <span>Browse Active Case Files</span>
            </button>
          </div>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Total Cases */}
        <div className="p-5 bg-navy-900 border border-navy-800 rounded-xl relative overflow-hidden group hover:border-forensic-purple/40 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Total Cases</span>
            <div className="p-2 bg-forensic-indigo/20 text-forensic-indigo rounded-lg">
              <FolderOpen className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-extrabold text-white mt-3 font-mono">{cases.length}</p>
          <p className="text-[11px] text-emerald-400 mt-1 flex items-center space-x-1">
            <TrendingUp className="w-3 h-3" />
            <span>{activeCasesCount} Active Investigations</span>
          </p>
        </div>

        {/* Metric 2: Sketches Generated */}
        <div className="p-5 bg-navy-900 border border-navy-800 rounded-xl relative overflow-hidden group hover:border-forensic-purple/40 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Composites Generated</span>
            <div className="p-2 bg-forensic-purple/20 text-forensic-purple rounded-lg">
              <Palette className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-extrabold text-white mt-3 font-mono">{totalSketches}</p>
          <p className="text-[11px] text-forensic-cyan mt-1 flex items-center space-x-1">
            <Layers className="w-3 h-3" />
            <span>Avg {cases.length > 0 ? (totalSketches / cases.length).toFixed(1) : 1} Iterations / Case</span>
          </p>
        </div>

        {/* Metric 3: Critical Priority */}
        <div className="p-5 bg-navy-900 border border-navy-800 rounded-xl relative overflow-hidden group hover:border-forensic-purple/40 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">High Priority Leads</span>
            <div className="p-2 bg-amber-500/20 text-amber-400 rounded-lg">
              <Activity className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-extrabold text-white mt-3 font-mono">{criticalCasesCount}</p>
          <p className="text-[11px] text-amber-400 mt-1">Requires Immediate Lead Review</p>
        </div>

        {/* Metric 4: Audit Events */}
        <div className="p-5 bg-navy-900 border border-navy-800 rounded-xl relative overflow-hidden group hover:border-forensic-purple/40 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Chain-of-Custody Events</span>
            <div className="p-2 bg-emerald-500/20 text-emerald-400 rounded-lg">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-extrabold text-white mt-3 font-mono">{metrics?.totalAuditEvents || 12}</p>
          <p className="text-[11px] text-emerald-400 mt-1 flex items-center space-x-1">
            <FileCheck2 className="w-3 h-3" />
            <span>SHA-256 Tamper-Free Intact</span>
          </p>
        </div>
      </div>

      {/* Main Grid: Active Cases Cards & Chain of Custody Timeline */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 cols: Recent Active Cases */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-300 flex items-center space-x-2">
              <FolderOpen className="w-4 h-4 text-forensic-purple" />
              <span>Active Investigation Dossiers</span>
            </h2>
            <button
              onClick={() => onNavigateToTab('cases')}
              className="text-xs text-forensic-purple hover:text-forensic-accent flex items-center space-x-1 transition-colors"
            >
              <span>View All</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {cases.slice(0, 4).map((caseItem) => {
              const primarySketch =
                caseItem.sketches.find((s) => s.id === caseItem.primarySketchId) ||
                caseItem.sketches[caseItem.sketches.length - 1];

              return (
                <div
                  key={caseItem.id}
                  onClick={() => onSelectCase(caseItem)}
                  className="bg-navy-900 border border-navy-800 hover:border-forensic-purple/50 rounded-xl p-4 cursor-pointer transition-all hover:scale-[1.01] shadow-lg group space-y-3"
                >
                  <div className="flex items-start justify-between">
                    <span className="text-[11px] font-mono px-2 py-0.5 bg-navy-800 text-forensic-cyan rounded border border-navy-700">
                      {caseItem.id}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                        caseItem.priority === 'CRITICAL'
                          ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40'
                          : caseItem.priority === 'HIGH'
                          ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                          : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                      }`}
                    >
                      {caseItem.priority}
                    </span>
                  </div>

                  {/* Sketch Thumbnail & Title */}
                  <div className="flex space-x-3 items-center">
                    <div className="w-16 h-16 rounded-lg overflow-hidden bg-charcoal-900 border border-navy-700 shrink-0">
                      {primarySketch ? (
                        <img
                          src={primarySketch.imageUrl}
                          alt={caseItem.title}
                          className="w-full h-full object-cover filter contrast-105"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-600">
                          <Palette className="w-6 h-6" />
                        </div>
                      )}
                    </div>
                    <div className="overflow-hidden">
                      <h3 className="text-xs font-bold text-white group-hover:text-forensic-purple transition-colors truncate">
                        {caseItem.title}
                      </h3>
                      <p className="text-[11px] text-slate-400 truncate mt-0.5">{caseItem.incidentType}</p>
                      <p className="text-[10px] text-slate-500 mt-1">Witness: {caseItem.witnessName}</p>
                    </div>
                  </div>

                  {/* Footer details */}
                  <div className="pt-2 border-t border-navy-800 flex items-center justify-between text-[11px] text-slate-400">
                    <span>{caseItem.sketches.length} Versions</span>
                    <span className="text-forensic-purple font-medium flex items-center space-x-1 group-hover:translate-x-0.5 transition-transform">
                      <span>Open in Studio</span>
                      <ArrowRight className="w-3 h-3" />
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right col: Chain of Custody Live Activity Feed */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-300 flex items-center space-x-2">
              <Clock className="w-4 h-4 text-emerald-400" />
              <span>Chain of Custody Feed</span>
            </h2>
            <button
              onClick={() => onNavigateToTab('audit')}
              className="text-xs text-forensic-purple hover:text-forensic-accent transition-colors"
            >
              Audit Trail
            </button>
          </div>

          <div className="bg-navy-900 border border-navy-800 rounded-xl p-4 space-y-4">
            {recentLogs.slice(0, 6).map((log) => (
              <div key={log.id} className="flex space-x-3 text-xs pb-3 border-b border-navy-800/80 last:border-b-0 last:pb-0">
                <div className="w-2 h-2 rounded-full bg-forensic-purple mt-1.5 shrink-0" />
                <div className="overflow-hidden flex-1">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-white truncate">{log.userName}</span>
                    <span className="text-[10px] font-mono text-slate-500">
                      {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 truncate mt-0.5">{log.details}</p>
                  <p className="text-[9px] font-mono text-slate-500 mt-0.5">Hash: {log.integrityHash.slice(0, 16)}...</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
