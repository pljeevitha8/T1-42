import React from 'react';
import {
  Fingerprint,
  LayoutDashboard,
  Palette,
  FolderOpen,
  FileCheck,
  Settings,
  ShieldAlert,
  LogOut,
  UserCheck,
  ChevronRight,
  Shield,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Case } from '../types';

interface SidebarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  activeCase: Case | null;
  onOpenEthicsModal: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  setCurrentTab,
  activeCase,
  onOpenEthicsModal,
}) => {
  const { user, logout, quickLogin, demoAccounts } = useAuth();

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'studio', label: 'Forensic Studio', icon: Palette, badge: activeCase ? 'Active' : undefined },
    { id: 'cases', label: 'Case Files', icon: FolderOpen },
    { id: 'audit', label: 'Audit Trail', icon: FileCheck, adminOnly: true },
    { id: 'settings', label: 'AI Engine & Config', icon: Settings },
  ];

  return (
    <aside className="w-64 bg-navy-900 border-r border-navy-800 flex flex-col justify-between shrink-0 h-screen select-none">
      {/* Brand Header */}
      <div>
        <div className="p-5 border-b border-navy-800">
          <div className="flex items-center space-x-3">
            <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-forensic-purple to-forensic-indigo text-white shadow-lg shadow-forensic-purple/20">
              <Fingerprint className="w-6 h-6" />
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-forensic-cyan rounded-full animate-ping" />
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-forensic-cyan rounded-full" />
            </div>
            <div>
              <div className="flex items-center space-x-1.5">
                <span className="text-base font-extrabold tracking-wider text-white">SKETCHTRACE</span>
                <span className="px-1.5 py-0.5 text-[10px] font-bold bg-forensic-purple/30 text-forensic-purple border border-forensic-purple/50 rounded">AI</span>
              </div>
              <p className="text-[11px] font-mono text-slate-400">Forensic Imaging Suite</p>
            </div>
          </div>
        </div>

        {/* Active Case Banner if loaded */}
        {activeCase && (
          <div className="mx-3 mt-4 p-3 bg-navy-800/80 border border-forensic-indigo/40 rounded-lg">
            <div className="flex items-center justify-between text-[11px] text-forensic-cyan font-mono mb-1">
              <span>ACTIVE DOSSIER</span>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            </div>
            <p className="text-xs font-semibold text-white truncate">{activeCase.title}</p>
            <p className="text-[10px] font-mono text-slate-400 mt-0.5">{activeCase.id}</p>
          </div>
        )}

        {/* Navigation Items */}
        <nav className="p-3 space-y-1.5 mt-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            const isRestricted = item.adminOnly && user?.role !== 'admin';

            return (
              <button
                key={item.id}
                onClick={() => {
                  if (!isRestricted) setCurrentTab(item.id);
                }}
                disabled={isRestricted}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-forensic-purple/20 text-white border border-forensic-purple/50 shadow-sm'
                    : isRestricted
                    ? 'opacity-40 cursor-not-allowed text-slate-500'
                    : 'text-slate-300 hover:text-white hover:bg-navy-800/60'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-forensic-purple' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span className="px-1.5 py-0.5 text-[10px] font-bold bg-forensic-cyan/20 text-forensic-cyan border border-forensic-cyan/40 rounded">
                    {item.badge}
                  </span>
                )}
                {item.adminOnly && (
                  <span className="text-[9px] uppercase tracking-wider text-slate-500 bg-navy-950 px-1.5 py-0.5 rounded border border-navy-800">
                    Admin
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Footer Area: Responsible AI & User Profile */}
      <div className="p-3 border-t border-navy-800 space-y-3">
        {/* Responsible AI Advisory Pill */}
        <button
          onClick={onOpenEthicsModal}
          className="w-full flex items-center justify-between p-2.5 bg-amber-950/20 hover:bg-amber-950/30 border border-amber-600/30 rounded-lg text-left transition-colors group"
        >
          <div className="flex items-center space-x-2">
            <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0" />
            <div className="overflow-hidden">
              <p className="text-[11px] font-semibold text-amber-200 leading-tight">Forensic AI Ethics</p>
              <p className="text-[9px] text-amber-400/80 truncate">Non-evidentiary lead protocol</p>
            </div>
          </div>
          <ChevronRight className="w-3.5 h-3.5 text-amber-400 group-hover:translate-x-0.5 transition-transform" />
        </button>

        {/* Current Officer Badge & Switcher */}
        <div className="p-3 bg-navy-800/70 border border-navy-700 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-2">
              <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-forensic-indigo to-forensic-purple flex items-center justify-center text-xs font-bold text-white uppercase">
                {user?.name?.slice(0, 2) || 'OF'}
              </div>
              <div className="overflow-hidden">
                <p className="text-xs font-semibold text-white truncate">{user?.name || 'Investigator'}</p>
                <div className="flex items-center space-x-1">
                  <Shield className="w-3 h-3 text-forensic-cyan" />
                  <span className="text-[10px] font-mono text-slate-400 uppercase">{user?.role}</span>
                </div>
              </div>
            </div>
            <button
              onClick={logout}
              title="Sign Out"
              className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-navy-900 rounded transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Quick Demo Switcher for Hackathon Judges */}
          <div className="pt-2 border-t border-navy-700/60">
            <p className="text-[9px] uppercase font-mono tracking-wider text-slate-400 mb-1 flex items-center space-x-1">
              <UserCheck className="w-3 h-3 text-forensic-purple" />
              <span>Quick Role Switch (Demo):</span>
            </p>
            <div className="grid grid-cols-3 gap-1 text-[10px]">
              {demoAccounts.map((acc) => (
                <button
                  key={acc.id}
                  onClick={() => quickLogin(acc.email)}
                  className={`py-1 px-1 rounded text-center truncate font-medium transition-colors ${
                    user?.id === acc.id
                      ? 'bg-forensic-purple text-white'
                      : 'bg-navy-900 text-slate-400 hover:text-white hover:bg-navy-700'
                  }`}
                  title={`${acc.name} (${acc.role})`}
                >
                  {acc.role === 'admin' ? 'Admin' : acc.role === 'investigator' ? 'Artist' : 'Review'}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
};
