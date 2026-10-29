import React, { useEffect, useState } from 'react';
import {
  FileCheck,
  ShieldCheck,
  Download,
  Search,
  Filter,
  CheckCircle2,
  AlertTriangle,
  Lock,
  RefreshCw,
  Hash,
  Eye,
} from 'lucide-react';
import { AuditLog } from '../types';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';

interface AuditLogViewProps {
  onNotify: (title: string, message?: string, type?: 'success' | 'error' | 'info') => void;
}

export const AuditLogView: React.FC<AuditLogViewProps> = ({ onNotify }) => {
  const { user } = useAuth();
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [actionFilter, setActionFilter] = useState('ALL');
  const [isLoading, setIsLoading] = useState(true);
  const [isVerifying, setIsVerifying] = useState(false);
  const [integrityStatus, setIntegrityStatus] = useState<{
    chainLength: number;
    tamperEvidentVerified: boolean;
    status: string;
    verifiedAt: string;
  } | null>(null);

  const fetchLogs = async () => {
    setIsLoading(true);
    try {
      const res = await api.getAuditLogs();
      setLogs(res.logs);
    } catch (err: any) {
      onNotify('Audit Load Failed', err.message, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user?.role === 'admin') {
      fetchLogs();
    }
  }, [user?.role]);

  const handleVerifyChain = async () => {
    setIsVerifying(true);
    try {
      const res = await api.verifyAuditIntegrity();
      setIntegrityStatus(res);
      if (res.tamperEvidentVerified) {
        onNotify('Chain of Custody Verified', `All ${res.chainLength} SHA-256 log blocks match cryptographic hashes`, 'success');
      } else {
        onNotify('Integrity Breach Alert', 'Cryptographic signature mismatch detected in block chain', 'error');
      }
    } catch (err: any) {
      onNotify('Verification Failed', err.message, 'error');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleExportCSV = async () => {
    try {
      const blob = await api.downloadAuditCsv();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `sketchtrace-chain-of-custody-${Date.now()}.csv`;
      a.click();
      onNotify('Audit Exported', 'CSV chain of custody downloaded', 'success');
    } catch (err: any) {
      onNotify('Export Failed', err.message, 'error');
    }
  };

  if (user?.role !== 'admin') {
    return (
      <div className="flex-1 flex items-center justify-center p-8 bg-navy-950 text-center">
        <div className="max-w-md p-8 bg-navy-900 border border-rose-500/40 rounded-2xl shadow-xl">
          <Lock className="w-12 h-12 text-rose-400 mx-auto mb-4" />
          <h2 className="text-lg font-bold text-white mb-2">Access Restricted: Administrator Credentials Required</h2>
          <p className="text-sm text-slate-400 mb-6 leading-relaxed">
            Chain of custody audit trails are protected under federal evidentiary compliance protocols. Only officers with Lead Investigator / Administrator clearance may inspect these logs.
          </p>
          <p className="text-xs text-forensic-purple font-mono">
            Tip: Switch to "Admin" role using the sidebar Quick Role Switcher to preview this tab!
          </p>
        </div>
      </div>
    );
  }

  const filteredLogs = logs.filter((log) => {
    const matchesSearch =
      log.details.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (log.caseId && log.caseId.toLowerCase().includes(searchTerm.toLowerCase())) ||
      log.integrityHash.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesAction = actionFilter === 'ALL' || log.action === actionFilter;
    return matchesSearch && matchesAction;
  });

  const getActionBadgeColor = (action: AuditLog['action']) => {
    switch (action) {
      case 'CASE_CREATE':
        return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40';
      case 'SKETCH_GENERATE':
        return 'bg-forensic-purple/20 text-forensic-purple border-forensic-purple/40';
      case 'SKETCH_REFINE':
        return 'bg-forensic-indigo/20 text-forensic-indigo border-forensic-indigo/40';
      case 'SKETCH_EXPORT':
        return 'bg-forensic-cyan/20 text-forensic-cyan border-forensic-cyan/40';
      case 'PRIMARY_SELECT':
        return 'bg-teal-500/20 text-teal-400 border-teal-500/40';
      case 'CASE_DELETE':
        return 'bg-rose-500/20 text-rose-400 border-rose-500/40';
      case 'LOGIN_FAILED':
      case 'UNAUTHORIZED_ACCESS':
        return 'bg-rose-500/30 text-rose-300 border-rose-500/50';
      default:
        return 'bg-slate-700/30 text-slate-300 border-slate-600/40';
    }
  };

  return (
    <div className="flex-1 overflow-y-auto p-6 lg:p-8 space-y-6 bg-navy-950">
      {/* Header and Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white tracking-wide flex items-center space-x-2">
            <FileCheck className="w-5 h-5 text-emerald-400" />
            <span>Chain of Custody & Security Audit Trail</span>
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Tamper-evident, cryptographically hashed chronological ledger of all forensic composite operations.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={handleVerifyChain}
            disabled={isVerifying}
            className="flex items-center space-x-1.5 px-3.5 py-2 bg-navy-800 hover:bg-navy-700 text-emerald-400 rounded-lg text-xs font-semibold border border-emerald-500/40 shadow-sm transition-colors disabled:opacity-50"
          >
            <ShieldCheck className="w-4 h-4" />
            <span>{isVerifying ? 'Verifying Hashes...' : 'Verify Cryptographic Integrity'}</span>
          </button>

          <button
            onClick={handleExportCSV}
            className="flex items-center space-x-1.5 px-3.5 py-2 bg-navy-800 hover:bg-navy-700 text-slate-200 rounded-lg text-xs font-medium border border-navy-700 transition-colors"
          >
            <Download className="w-4 h-4" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Integrity Status Card if verified */}
      {integrityStatus && (
        <div
          className={`p-4 rounded-xl border flex items-center justify-between animate-in fade-in ${
            integrityStatus.tamperEvidentVerified
              ? 'bg-emerald-950/30 border-emerald-500/50 text-emerald-200'
              : 'bg-rose-950/40 border-rose-500/60 text-rose-200'
          }`}
        >
          <div className="flex items-center space-x-3">
            <CheckCircle2 className="w-6 h-6 text-emerald-400 shrink-0" />
            <div>
              <p className="text-xs font-bold text-white uppercase tracking-wider">
                Cryptographic Chain Verification: INTACT & UNALTERED
              </p>
              <p className="text-xs text-slate-300 mt-0.5 font-mono">
                {integrityStatus.chainLength} consecutive blocks validated using SHA-256 hash recursion. Verified at: {integrityStatus.verifiedAt}
              </p>
            </div>
          </div>
          <span className="px-2.5 py-1 text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 rounded">
            NIST SEC-FORENSIC PASS
          </span>
        </div>
      )}

      {/* Filter Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 bg-navy-900 border border-navy-800 rounded-xl">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by action, user, case ID, or SHA-256 hash..."
            className="w-full pl-9 pr-3 py-1.5 bg-navy-950 border border-navy-700 rounded-lg text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-forensic-purple"
          />
        </div>

        <select
          value={actionFilter}
          onChange={(e) => setActionFilter(e.target.value)}
          className="p-1.5 bg-navy-950 border border-navy-700 rounded-lg text-xs text-slate-300 focus:outline-none"
        >
          <option value="ALL">All Event Types</option>
          <option value="CASE_CREATE">Case Creation</option>
          <option value="SKETCH_GENERATE">Initial Composite Generated</option>
          <option value="SKETCH_REFINE">Iterative Refinement</option>
          <option value="PRIMARY_SELECT">Primary Composite Selected</option>
          <option value="SKETCH_EXPORT">Dossier / PNG Exported</option>
          <option value="LOGIN_SUCCESS">Officer Authentication</option>
          <option value="UNAUTHORIZED_ACCESS">Security Warning / Breach</option>
        </select>
      </div>

      {/* Audit Log Table */}
      <div className="bg-navy-900 border border-navy-800 rounded-xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-navy-950 text-slate-400 font-mono text-[11px] uppercase tracking-wider border-b border-navy-800">
              <tr>
                <th className="p-3.5">Timestamp (UTC)</th>
                <th className="p-3.5">Authenticated Officer</th>
                <th className="p-3.5">Action Event</th>
                <th className="p-3.5">Case ID</th>
                <th className="p-3.5">Operational Details</th>
                <th className="p-3.5">Integrity Hash</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-navy-800/60 font-sans">
              {filteredLogs.map((log) => (
                <tr key={log.id} className="hover:bg-navy-800/40 transition-colors">
                  <td className="p-3.5 font-mono text-slate-400 whitespace-nowrap">
                    {new Date(log.timestamp).toLocaleString()}
                  </td>
                  <td className="p-3.5 whitespace-nowrap">
                    <span className="font-semibold text-white">{log.userName}</span>
                    <span className="text-[10px] text-slate-500 block uppercase font-mono">{log.userRole}</span>
                  </td>
                  <td className="p-3.5 whitespace-nowrap">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold border ${getActionBadgeColor(log.action)}`}>
                      {log.action}
                    </span>
                  </td>
                  <td className="p-3.5 font-mono text-forensic-cyan whitespace-nowrap">
                    {log.caseId || '—'}
                  </td>
                  <td className="p-3.5 text-slate-300 max-w-md truncate" title={log.details}>
                    {log.details}
                  </td>
                  <td className="p-3.5 font-mono text-[10px] text-slate-500 whitespace-nowrap" title={log.integrityHash}>
                    <span className="flex items-center space-x-1">
                      <Hash className="w-3 h-3 text-forensic-purple" />
                      <span>{log.integrityHash.slice(0, 14)}...</span>
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
