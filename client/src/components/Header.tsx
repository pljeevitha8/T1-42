import React from 'react';
import { Plus, ShieldAlert, Cpu, CheckCircle2 } from 'lucide-react';
import { Case, AIProviderConfig } from '../types';

interface HeaderProps {
  title: string;
  subtitle?: string;
  activeCase: Case | null;
  config: AIProviderConfig | null;
  onNewCase: () => void;
  onOpenEthicsModal: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  title,
  subtitle,
  activeCase,
  config,
  onNewCase,
  onOpenEthicsModal,
}) => {
  const getProviderLabel = () => {
    if (!config) return 'AI Pipeline Initializing...';
    switch (config.provider) {
      case 'pollinations':
        return 'Pollinations FLUX (Live AI)';
      case 'openai':
        return 'OpenAI DALL-E 3 (Direct)';
      case 'huggingface':
        return 'HuggingFace SDXL (Direct)';
      case 'procedural_demo':
        return 'Forensic Studio (Demo Mode)';
      default:
        return 'Forensic AI Core';
    }
  };

  return (
    <header className="h-16 px-6 bg-navy-900/60 backdrop-blur-md border-b border-navy-800 flex items-center justify-between shrink-0">
      {/* Title & Case Context */}
      <div className="flex items-center space-x-4">
        <div>
          <h1 className="text-base font-bold text-white tracking-wide flex items-center space-x-2">
            <span>{title}</span>
            {activeCase && (
              <span className="text-xs font-mono font-normal text-slate-400">
                / {activeCase.id}
              </span>
            )}
          </h1>
          {subtitle && <p className="text-xs text-slate-400">{subtitle}</p>}
        </div>
      </div>

      {/* Right controls: Active AI Engine, Responsible AI badge, New Case */}
      <div className="flex items-center space-x-3">
        {/* Active Generative Engine Indicator */}
        <div className="hidden lg:flex items-center space-x-2 px-3 py-1.5 bg-navy-800 border border-navy-700 rounded-lg text-xs font-mono text-slate-300">
          <Cpu className="w-3.5 h-3.5 text-forensic-purple" />
          <span>{getProviderLabel()}</span>
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
        </div>

        {/* Responsible AI Notice Pill */}
        <button
          onClick={onOpenEthicsModal}
          className="flex items-center space-x-1.5 px-3 py-1.5 bg-amber-950/30 hover:bg-amber-950/50 border border-amber-600/40 rounded-lg text-xs font-medium text-amber-300 transition-colors"
          title="Click to view Forensic AI Ethics and Limitations"
        >
          <ShieldAlert className="w-3.5 h-3.5 text-amber-400 shrink-0" />
          <span className="hidden sm:inline">AI-Generated Approximation</span>
          <span className="sm:hidden">AI Lead</span>
        </button>

        {/* New Case Button */}
        <button
          onClick={onNewCase}
          className="flex items-center space-x-1.5 px-3.5 py-1.5 bg-forensic-purple hover:bg-forensic-accent text-white rounded-lg text-xs font-semibold shadow-md shadow-forensic-purple/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
        >
          <Plus className="w-4 h-4" />
          <span>New Case</span>
        </button>
      </div>
    </header>
  );
};
