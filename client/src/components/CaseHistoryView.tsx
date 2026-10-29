import React, { useState } from 'react';
import {
  FolderOpen,
  Search,
  Filter,
  Plus,
  Trash2,
  ExternalLink,
  Calendar,
  MapPin,
  User,
  Palette,
  X,
} from 'lucide-react';
import { Case, CasePriority, CaseStatus } from '../types';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';

interface CaseHistoryViewProps {
  cases: Case[];
  onSelectCase: (caseItem: Case) => void;
  onRefreshCases: () => void;
  onNotify: (title: string, message?: string, type?: 'success' | 'error' | 'info') => void;
}

export const CaseHistoryView: React.FC<CaseHistoryViewProps> = ({
  cases,
  onSelectCase,
  onRefreshCases,
  onNotify,
}) => {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [priorityFilter, setPriorityFilter] = useState<string>('ALL');
  const [isNewCaseModalOpen, setIsNewCaseModalOpen] = useState(false);

  // New Case Form state
  const [title, setTitle] = useState('');
  const [incidentType, setIncidentType] = useState('Armed Robbery');
  const [incidentLocation, setIncidentLocation] = useState('');
  const [incidentDate, setIncidentDate] = useState(new Date().toISOString().slice(0, 16));
  const [witnessName, setWitnessName] = useState('');
  const [witnessContact, setWitnessContact] = useState('');
  const [priority, setPriority] = useState<CasePriority>('MEDIUM');
  const [witnessStatement, setWitnessStatement] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Filter cases
  const filteredCases = cases.filter((c) => {
    const matchesSearch =
      c.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.witnessName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.incidentType.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'ALL' || c.status === statusFilter;
    const matchesPriority = priorityFilter === 'ALL' || c.priority === priorityFilter;

    return matchesSearch && matchesStatus && matchesPriority;
  });

  const handleCreateCase = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !witnessName || !witnessStatement) {
      onNotify('Validation Error', 'Title, witness name, and deposition statement are required', 'info');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await api.createCase({
        title,
        incidentType,
        incidentLocation,
        incidentDate,
        witnessName,
        witnessContact,
        priority,
        witnessStatement,
      });

      onNotify('Case Created', `Investigation dossier ${res.case.id} initiated`, 'success');
      setIsNewCaseModalOpen(false);
      // Reset form
      setTitle('');
      setIncidentLocation('');
      setWitnessName('');
      setWitnessContact('');
      setWitnessStatement('');

      onRefreshCases();
      onSelectCase(res.case);
    } catch (err: any) {
      onNotify('Creation Failed', err.message, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteCase = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!window.confirm(`Are you sure you want to permanently delete case ${id}? This action is recorded in the audit trail.`)) {
      return;
    }

    try {
      await api.deleteCase(id);
      onNotify('Case Deleted', `Case dossier ${id} removed and logged to audit trail`, 'info');
      onRefreshCases();
    } catch (err: any) {
      onNotify('Deletion Failed', err.message, 'error');
    }
  };

  return (
    <div className="flex-1 overflow-y-auto p-6 lg:p-8 space-y-6 bg-navy-950">
      {/* Top Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white tracking-wide flex items-center space-x-2">
            <FolderOpen className="w-5 h-5 text-forensic-purple" />
            <span>Forensic Case Archives</span>
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Manage active investigations, eyewitness depositions, and versioned sketch dossiers.
          </p>
        </div>

        <button
          onClick={() => setIsNewCaseModalOpen(true)}
          className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-forensic-purple to-forensic-indigo hover:from-forensic-accent hover:to-forensic-purple text-white text-xs font-bold rounded-lg shadow-lg shadow-forensic-purple/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
        >
          <Plus className="w-4 h-4" />
          <span>New Case File</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3 bg-navy-900 border border-navy-800 rounded-xl">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by Case ID, suspect, crime..."
            className="w-full pl-9 pr-3 py-1.5 bg-navy-950 border border-navy-700 rounded-lg text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-forensic-purple"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="p-1.5 bg-navy-950 border border-navy-700 rounded-lg text-xs text-slate-300 focus:outline-none"
        >
          <option value="ALL">All Statuses</option>
          <option value="ACTIVE">Active</option>
          <option value="REVIEW">Under Review</option>
          <option value="CLOSED">Closed</option>
        </select>

        <select
          value={priorityFilter}
          onChange={(e) => setPriorityFilter(e.target.value)}
          className="p-1.5 bg-navy-950 border border-navy-700 rounded-lg text-xs text-slate-300 focus:outline-none"
        >
          <option value="ALL">All Priorities</option>
          <option value="CRITICAL">Critical</option>
          <option value="HIGH">High</option>
          <option value="MEDIUM">Medium</option>
          <option value="LOW">Low</option>
        </select>
      </div>

      {/* Cases Table / Grid */}
      <div className="grid grid-cols-1 gap-3">
        {filteredCases.length === 0 ? (
          <div className="p-12 text-center bg-navy-900 border border-navy-800 rounded-xl">
            <FolderOpen className="w-10 h-10 text-slate-600 mx-auto mb-3" />
            <h3 className="text-sm font-semibold text-slate-300">No cases match your filters</h3>
            <p className="text-xs text-slate-500 mt-1">Try adjusting your search criteria or create a new case file.</p>
          </div>
        ) : (
          filteredCases.map((caseItem) => {
            const primarySketch =
              caseItem.sketches.find((s) => s.id === caseItem.primarySketchId) ||
              caseItem.sketches[caseItem.sketches.length - 1];

            return (
              <div
                key={caseItem.id}
                onClick={() => onSelectCase(caseItem)}
                className="p-4 bg-navy-900 border border-navy-800 hover:border-forensic-purple/50 rounded-xl cursor-pointer transition-all hover:bg-navy-850 shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4 group"
              >
                {/* Left: Thumbnail & Core Details */}
                <div className="flex items-start sm:items-center space-x-4">
                  <div className="w-16 h-16 rounded-xl overflow-hidden bg-charcoal-900 border border-navy-700 shrink-0">
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

                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <span className="font-mono text-xs font-bold text-forensic-cyan">
                        {caseItem.id}
                      </span>
                      <span
                        className={`text-[9px] font-bold px-1.5 py-0.5 rounded uppercase ${
                          caseItem.priority === 'CRITICAL'
                            ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40'
                            : caseItem.priority === 'HIGH'
                            ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                            : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                        }`}
                      >
                        {caseItem.priority}
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {caseItem.sketches.length} Sketches
                      </span>
                    </div>

                    <h3 className="text-sm font-bold text-white group-hover:text-forensic-purple transition-colors">
                      {caseItem.title}
                    </h3>

                    <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400">
                      <span className="flex items-center space-x-1">
                        <MapPin className="w-3 h-3 text-slate-500" />
                        <span>{caseItem.incidentLocation}</span>
                      </span>
                      <span className="flex items-center space-x-1">
                        <User className="w-3 h-3 text-slate-500" />
                        <span>Witness: {caseItem.witnessName}</span>
                      </span>
                      <span className="flex items-center space-x-1">
                        <Calendar className="w-3 h-3 text-slate-500" />
                        <span>{caseItem.incidentDate}</span>
                      </span>
                    </div>
                  </div>
                </div>

                {/* Right: Actions */}
                <div className="flex items-center space-x-2 self-end md:self-center">
                  <button
                    onClick={() => onSelectCase(caseItem)}
                    className="flex items-center space-x-1.5 px-3 py-1.5 bg-forensic-purple/20 hover:bg-forensic-purple text-forensic-purple hover:text-white rounded-lg text-xs font-semibold border border-forensic-purple/40 transition-colors"
                  >
                    <span>Open Studio</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </button>

                  {user?.role === 'admin' && (
                    <button
                      onClick={(e) => handleDeleteCase(caseItem.id, e)}
                      title="Archive / Delete Case"
                      className="p-2 text-slate-400 hover:text-rose-400 hover:bg-navy-800 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* New Case Modal */}
      {isNewCaseModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/80 backdrop-blur-sm overflow-y-auto">
          <div className="relative w-full max-w-xl bg-navy-900 border border-forensic-purple/40 rounded-xl shadow-2xl overflow-hidden my-8 text-slate-100">
            <div className="flex items-center justify-between px-6 py-4 bg-navy-800/80 border-b border-navy-700">
              <h2 className="text-base font-bold text-white tracking-wide">Initiate Investigation Dossier</h2>
              <button
                onClick={() => setIsNewCaseModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateCase} className="p-6 space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">Case Title</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Metro Diamond District Heist — Suspect 'Specter'"
                  className="w-full p-2.5 bg-navy-950 border border-navy-700 rounded-lg text-xs text-white focus:outline-none focus:border-forensic-purple"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">Crime Category</label>
                  <select
                    value={incidentType}
                    onChange={(e) => setIncidentType(e.target.value)}
                    className="w-full p-2.5 bg-navy-950 border border-navy-700 rounded-lg text-xs text-white"
                  >
                    <option value="Armed Robbery">Armed Robbery</option>
                    <option value="Assault & Battery">Assault & Battery</option>
                    <option value="Grand Larceny / Vault Burglary">Grand Larceny / Burglary</option>
                    <option value="Cyber Infiltration / Espionage">Cyber Espionage</option>
                    <option value="Missing Person Lead">Missing Person Lead</option>
                    <option value="Hit & Run Vehicle Incident">Hit & Run</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">Investigation Priority</label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as CasePriority)}
                    className="w-full p-2.5 bg-navy-950 border border-navy-700 rounded-lg text-xs text-white"
                  >
                    <option value="CRITICAL">Critical</option>
                    <option value="HIGH">High</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="LOW">Low</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">Incident Location</label>
                  <input
                    type="text"
                    required
                    value={incidentLocation}
                    onChange={(e) => setIncidentLocation(e.target.value)}
                    placeholder="e.g. 400 Financial Plaza, Vault 4"
                    className="w-full p-2.5 bg-navy-950 border border-navy-700 rounded-lg text-xs text-white focus:outline-none focus:border-forensic-purple"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">Incident Date / Time</label>
                  <input
                    type="datetime-local"
                    value={incidentDate}
                    onChange={(e) => setIncidentDate(e.target.value)}
                    className="w-full p-2.5 bg-navy-950 border border-navy-700 rounded-lg text-xs text-white focus:outline-none focus:border-forensic-purple"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">Eyewitness Full Name</label>
                  <input
                    type="text"
                    required
                    value={witnessName}
                    onChange={(e) => setWitnessName(e.target.value)}
                    placeholder="e.g. Julian Sterling"
                    className="w-full p-2.5 bg-navy-950 border border-navy-700 rounded-lg text-xs text-white focus:outline-none focus:border-forensic-purple"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">Witness Contact / Phone</label>
                  <input
                    type="text"
                    value={witnessContact}
                    onChange={(e) => setWitnessContact(e.target.value)}
                    placeholder="e.g. 555-019-4821"
                    className="w-full p-2.5 bg-navy-950 border border-navy-700 rounded-lg text-xs text-white focus:outline-none focus:border-forensic-purple"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">
                  Witness Deposition / Facial Description
                </label>
                <textarea
                  rows={3}
                  required
                  value={witnessStatement}
                  onChange={(e) => setWitnessStatement(e.target.value)}
                  placeholder="Describe suspect's face shape, eyes, nose, hair, jawline, facial hair, scars, glasses, etc..."
                  className="w-full p-2.5 bg-navy-950 border border-navy-700 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-forensic-purple resize-none"
                />
              </div>

              <div className="pt-3 border-t border-navy-800 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setIsNewCaseModalOpen(false)}
                  className="px-4 py-2 text-slate-400 hover:text-white text-xs font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2.5 bg-forensic-purple hover:bg-forensic-accent text-white text-xs font-bold rounded-lg shadow-lg shadow-forensic-purple/20 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
                >
                  {isSubmitting ? 'Creating Dossier...' : 'Create Case File & Launch Studio'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
