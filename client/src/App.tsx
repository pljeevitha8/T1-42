import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { DashboardView } from './components/DashboardView';
import { StudioView } from './components/StudioView';
import { CaseHistoryView } from './components/CaseHistoryView';
import { AuditLogView } from './components/AuditLogView';
import { SettingsView } from './components/SettingsView';
import { ResponsibleAIModal } from './components/ResponsibleAIModal';
import { LoginModal } from './components/LoginModal';
import { ToastContainer, ToastMessage } from './components/Toast';
import { Case, AIProviderConfig } from './types';
import { useAuth } from './context/AuthContext';
import { api } from './services/api';

export const App: React.FC = () => {
  const { user, isLoading } = useAuth();

  const [currentTab, setCurrentTab] = useState<string>('dashboard');
  const [cases, setCases] = useState<Case[]>([]);
  const [activeCase, setActiveCase] = useState<Case | null>(null);
  const [config, setConfig] = useState<AIProviderConfig | null>(null);
  const [isEthicsModalOpen, setIsEthicsModalOpen] = useState(false);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Add toast helper
  const notify = (title: string, message?: string, type: 'success' | 'error' | 'info' = 'info') => {
    const id = Date.now().toString() + Math.random().toString(36).slice(2, 6);
    setToasts((prev) => [...prev, { id, title, message, type }]);

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4500);
  };

  const dismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const loadCases = async () => {
    try {
      const res = await api.getCases();
      setCases(res.cases);
      if (res.cases.length > 0 && !activeCase) {
        setActiveCase(res.cases[0]);
      } else if (activeCase) {
        // Keep activeCase updated
        const updated = res.cases.find((c) => c.id === activeCase.id);
        if (updated) setActiveCase(updated);
      }
    } catch (err: any) {
      console.error('Failed to load cases:', err);
    }
  };

  const loadConfig = async () => {
    try {
      const res = await api.getSystemConfig();
      setConfig(res.config);
    } catch (err) {
      console.error('Failed to load config:', err);
    }
  };

  useEffect(() => {
    if (user) {
      loadCases();
      loadConfig();
    }
  }, [user]);

  const handleSelectCase = (caseItem: Case) => {
    setActiveCase(caseItem);
    setCurrentTab('studio');
    notify('Dossier Loaded', `Opened Case ${caseItem.id} in Studio`, 'info');
  };

  const handleUpdateActiveCase = (updated: Case) => {
    setActiveCase(updated);
    setCases((prev) => prev.map((c) => (c.id === updated.id ? updated : c)));
  };

  const handleNewCase = () => {
    setCurrentTab('cases');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-navy-950 flex items-center justify-center text-slate-400 font-mono text-sm">
        <div className="flex flex-col items-center space-y-3">
          <div className="w-10 h-10 border-2 border-forensic-purple border-t-transparent rounded-full animate-spin" />
          <p>Initialising SketchTrace AI Forensic Environment...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-navy-950 font-sans">
      {/* Login Screen Gate if unauthenticated */}
      {!user && (
        <LoginModal
          isOpen={true}
          onNotify={notify}
        />
      )}

      {/* Main Application Interface */}
      {user && (
        <>
          {/* Navigation Sidebar */}
          <Sidebar
            currentTab={currentTab}
            setCurrentTab={setCurrentTab}
            activeCase={activeCase}
            onOpenEthicsModal={() => setIsEthicsModalOpen(true)}
          />

          {/* Main Content Area */}
          <div className="flex-1 flex flex-col h-full overflow-hidden">
            <Header
              title={
                currentTab === 'dashboard'
                  ? 'Forensic Intelligence Dashboard'
                  : currentTab === 'studio'
                  ? 'Forensic Composite Studio'
                  : currentTab === 'cases'
                  ? 'Case File Management'
                  : currentTab === 'audit'
                  ? 'Cryptographic Chain of Custody'
                  : 'System Configuration'
              }
              subtitle={
                currentTab === 'studio' && activeCase
                  ? `${activeCase.title} — ${activeCase.incidentLocation}`
                  : undefined
              }
              activeCase={activeCase}
              config={config}
              onNewCase={handleNewCase}
              onOpenEthicsModal={() => setIsEthicsModalOpen(true)}
            />

            <main className="flex-1 flex overflow-hidden">
              {currentTab === 'dashboard' && (
                <DashboardView
                  cases={cases}
                  onSelectCase={handleSelectCase}
                  onNewCase={handleNewCase}
                  onNavigateToTab={(tab) => setCurrentTab(tab)}
                />
              )}

              {currentTab === 'studio' && (
                <StudioView
                  activeCase={activeCase}
                  onUpdateCase={handleUpdateActiveCase}
                  onNotify={notify}
                  onOpenEthicsModal={() => setIsEthicsModalOpen(true)}
                />
              )}

              {currentTab === 'cases' && (
                <CaseHistoryView
                  cases={cases}
                  onSelectCase={handleSelectCase}
                  onRefreshCases={loadCases}
                  onNotify={notify}
                />
              )}

              {currentTab === 'audit' && (
                <AuditLogView onNotify={notify} />
              )}

              {currentTab === 'settings' && (
                <SettingsView
                  onNotify={notify}
                  onConfigChange={loadConfig}
                />
              )}
            </main>
          </div>

          {/* Responsible AI Modal */}
          <ResponsibleAIModal
            isOpen={isEthicsModalOpen}
            onClose={() => setIsEthicsModalOpen(false)}
          />

          {/* Global Toast Container */}
          <ToastContainer toasts={toasts} onDismiss={dismissToast} />
        </>
      )}
    </div>
  );
};

export default App;
