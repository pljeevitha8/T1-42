import React, { useState, useEffect } from 'react';
import {
  Settings,
  Cpu,
  Key,
  CheckCircle2,
  Shield,
  Layers,
  Sparkles,
  Server,
  Save,
  Info,
} from 'lucide-react';
import { AIProviderConfig } from '../types';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';

interface SettingsViewProps {
  onNotify: (title: string, message?: string, type?: 'success' | 'error' | 'info') => void;
  onConfigChange: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({ onNotify, onConfigChange }) => {
  const { user } = useAuth();
  const [provider, setProvider] = useState<'pollinations' | 'huggingface' | 'openai' | 'procedural_demo'>('pollinations');
  const [apiKey, setApiKey] = useState('');
  const [modelName, setModelName] = useState('flux');
  const [isSaving, setIsSaving] = useState(false);
  const [systemInfo, setSystemInfo] = useState<any>(null);

  useEffect(() => {
    api.getSystemConfig()
      .then((data) => {
        setProvider(data.config.provider);
        setModelName(data.config.modelName || 'flux');
        setSystemInfo(data);
      })
      .catch((err) => console.error('Failed to load system config:', err));
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (user?.role !== 'admin') {
      onNotify('Permission Denied', 'Only Lead Investigator / Admin can reconfigure AI pipeline', 'error');
      return;
    }

    setIsSaving(true);
    try {
      await api.updateSystemConfig({
        provider,
        apiKey: apiKey.trim() ? apiKey.trim() : undefined,
        modelName,
      });

      onNotify('AI Configuration Saved', `Switched generative engine to: ${provider.toUpperCase()}`, 'success');
      onConfigChange();
      setApiKey('');
    } catch (err: any) {
      onNotify('Update Failed', err.message, 'error');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="flex-1 overflow-y-auto p-6 lg:p-8 space-y-6 bg-navy-950">
      <div>
        <h1 className="text-xl font-bold text-white tracking-wide flex items-center space-x-2">
          <Settings className="w-5 h-5 text-forensic-purple" />
          <span>Forensic Generative AI Engine & System Policies</span>
        </h1>
        <p className="text-xs text-slate-400 mt-0.5">
          Configure backend diffusion models, API credentials, and responsible AI compliance parameters.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: AI Engine Form */}
        <div className="lg:col-span-2 space-y-6">
          <form onSubmit={handleSave} className="p-6 bg-navy-900 border border-navy-800 rounded-xl space-y-6 shadow-xl">
            <h2 className="text-sm font-bold uppercase tracking-wider text-white border-b border-navy-800 pb-2 flex items-center space-x-2">
              <Cpu className="w-4 h-4 text-forensic-purple" />
              <span>Generative Sketch Synthesis Provider</span>
            </h2>

            {/* Provider Radios */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {/* Pollinations */}
              <label
                onClick={() => setProvider('pollinations')}
                className={`p-4 rounded-xl border cursor-pointer transition-all ${
                  provider === 'pollinations'
                    ? 'bg-forensic-purple/20 border-forensic-purple text-white shadow-md'
                    : 'bg-navy-950 border-navy-800 text-slate-300 hover:border-navy-700'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold text-sm">Pollinations FLUX (Live AI)</span>
                  <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 bg-emerald-500/20 text-emerald-400 rounded">
                    RECOMMENDED
                  </span>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Generates real forensic graphite sketches via direct cloud diffusion. Zero API key configuration required.
                </p>
              </label>

              {/* Procedural Demo */}
              <label
                onClick={() => setProvider('procedural_demo')}
                className={`p-4 rounded-xl border cursor-pointer transition-all ${
                  provider === 'procedural_demo'
                    ? 'bg-forensic-purple/20 border-forensic-purple text-white shadow-md'
                    : 'bg-navy-950 border-navy-800 text-slate-300 hover:border-navy-700'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold text-sm">Forensic Studio Demo</span>
                  <span className="text-[10px] font-mono px-1.5 py-0.5 bg-navy-800 text-slate-400 rounded">
                    OFFLINE
                  </span>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Guaranteed offline forensic pencil presets. Explicitly watermarked and labeled for safe demo presentations.
                </p>
              </label>

              {/* OpenAI */}
              <label
                onClick={() => setProvider('openai')}
                className={`p-4 rounded-xl border cursor-pointer transition-all ${
                  provider === 'openai'
                    ? 'bg-forensic-purple/20 border-forensic-purple text-white shadow-md'
                    : 'bg-navy-950 border-navy-800 text-slate-300 hover:border-navy-700'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold text-sm">OpenAI DALL-E 3</span>
                  <span className="text-[10px] font-mono px-1.5 py-0.5 bg-navy-800 text-slate-400 rounded">
                    CUSTOM KEY
                  </span>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Direct integration with OpenAI image API. Requires valid OpenAI secret key.
                </p>
              </label>

              {/* Hugging Face */}
              <label
                onClick={() => setProvider('huggingface')}
                className={`p-4 rounded-xl border cursor-pointer transition-all ${
                  provider === 'huggingface'
                    ? 'bg-forensic-purple/20 border-forensic-purple text-white shadow-md'
                    : 'bg-navy-950 border-navy-800 text-slate-300 hover:border-navy-700'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold text-sm">HuggingFace Inference</span>
                  <span className="text-[10px] font-mono px-1.5 py-0.5 bg-navy-800 text-slate-400 rounded">
                    CUSTOM KEY
                  </span>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Call SDXL or custom police sketch LoRAs hosted on HuggingFace Hub.
                </p>
              </label>
            </div>

            {/* API Key input if custom provider */}
            {(provider === 'openai' || provider === 'huggingface') && (
              <div className="space-y-3 pt-2">
                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1 flex items-center space-x-1.5">
                    <Key className="w-3.5 h-3.5 text-forensic-purple" />
                    <span>{provider.toUpperCase()} API Secret Key</span>
                  </label>
                  <input
                    type="password"
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    placeholder={systemInfo?.config?.hasApiKey ? '•••••••••••• (Key saved on backend)' : 'Paste API Key (sk-... / hf_...)'}
                    className="w-full p-2.5 bg-navy-950 border border-navy-700 rounded-lg text-xs text-white focus:outline-none focus:border-forensic-purple font-mono"
                  />
                  <p className="text-[10px] text-slate-500 mt-1">
                    Keys are securely stored in server environment memory and never exposed to the client.
                  </p>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">Target Model Name</label>
                  <input
                    type="text"
                    value={modelName}
                    onChange={(e) => setModelName(e.target.value)}
                    placeholder={provider === 'openai' ? 'dall-e-3' : 'stabilityai/stable-diffusion-xl-base-1.0'}
                    className="w-full p-2.5 bg-navy-950 border border-navy-700 rounded-lg text-xs text-white focus:outline-none focus:border-forensic-purple font-mono"
                  />
                </div>
              </div>
            )}

            {user?.role === 'admin' ? (
              <button
                type="submit"
                disabled={isSaving}
                className="flex items-center space-x-2 px-5 py-2.5 bg-forensic-purple hover:bg-forensic-accent text-white text-xs font-bold rounded-lg shadow-lg shadow-forensic-purple/20 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                <span>{isSaving ? 'Updating...' : 'Save AI Engine Configuration'}</span>
              </button>
            ) : (
              <div className="p-3 bg-navy-950 border border-navy-800 rounded-lg text-xs text-slate-400 flex items-center space-x-2">
                <Info className="w-4 h-4 text-forensic-cyan shrink-0" />
                <span>AI Pipeline configuration is restricted to Lead Investigator / Administrator accounts.</span>
              </div>
            )}
          </form>
        </div>

        {/* Right Col: System Health & Compliance */}
        <div className="space-y-6">
          <div className="p-5 bg-navy-900 border border-navy-800 rounded-xl space-y-4 shadow-xl">
            <h3 className="text-xs font-bold uppercase tracking-wider text-white border-b border-navy-800 pb-2 flex items-center space-x-2">
              <Server className="w-4 h-4 text-emerald-400" />
              <span>System & Environment Status</span>
            </h3>

            <div className="space-y-2.5 text-xs">
              <div className="flex justify-between py-1 border-b border-navy-800/60">
                <span className="text-slate-400">Server Architecture</span>
                <span className="font-mono text-white">Node.js Express (ESM)</span>
              </div>
              <div className="flex justify-between py-1 border-b border-navy-800/60">
                <span className="text-slate-400">Database Layer</span>
                <span className="font-mono text-white">Transactional JSON DB</span>
              </div>
              <div className="flex justify-between py-1 border-b border-navy-800/60">
                <span className="text-slate-400">Cryptographic Standard</span>
                <span className="font-mono text-emerald-400">SHA-256 Hash Recursion</span>
              </div>
              <div className="flex justify-between py-1 border-b border-navy-800/60">
                <span className="text-slate-400">Compliance Standard</span>
                <span className="font-mono text-forensic-cyan">NIST-OSAC-FAC-2026</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-400">Responsible AI Engine</span>
                <span className="font-mono text-amber-400">Enforced Watermark v1.2</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
