import React, { useState } from 'react';
import { Fingerprint, Lock, Shield, User, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface LoginModalProps {
  isOpen: boolean;
  onClose?: () => void;
  onNotify: (title: string, message?: string, type?: 'success' | 'error' | 'info') => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose, onNotify }) => {
  const { login, quickLogin, demoAccounts } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await login(email, password);
      onNotify('Officer Authenticated', 'Session initiated with active badge credentials', 'success');
      if (onClose) onClose();
    } catch (err: any) {
      onNotify('Authentication Failed', err.message || 'Invalid badge or password', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleQuick = async (demoEmail: string) => {
    setIsSubmitting(true);
    try {
      await quickLogin(demoEmail);
      onNotify('Demo Session Started', `Logged in as ${demoEmail}`, 'success');
      if (onClose) onClose();
    } catch (err: any) {
      onNotify('Demo Login Failed', err.message, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/90 backdrop-blur-md">
      <div className="relative w-full max-w-md bg-navy-900 border border-forensic-purple/50 rounded-2xl shadow-2xl overflow-hidden p-6 text-slate-100 space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-forensic-purple to-forensic-indigo flex items-center justify-center text-white mx-auto shadow-lg shadow-forensic-purple/30">
            <Fingerprint className="w-7 h-7" />
          </div>
          <h2 className="text-xl font-extrabold text-white tracking-wide">
            SKETCHTRACE <span className="text-forensic-purple">AI</span>
          </h2>
          <p className="text-xs text-slate-400 font-mono">
            Forensic Imaging & Eyewitness Reconstruction Division
          </p>
        </div>

        {/* Quick Demo Switcher for Hackathon Evaluation */}
        <div className="p-3 bg-navy-950 border border-navy-800 rounded-xl space-y-2">
          <p className="text-[10px] font-mono font-bold uppercase tracking-wider text-forensic-cyan flex items-center space-x-1.5">
            <Shield className="w-3.5 h-3.5" />
            <span>Hackathon Instant Evaluation (1-Click Demo):</span>
          </p>
          <div className="space-y-1.5">
            {demoAccounts.map((acc) => (
              <button
                key={acc.id}
                type="button"
                onClick={() => handleQuick(acc.email)}
                className="w-full flex items-center justify-between p-2 rounded-lg bg-navy-900 hover:bg-navy-800 border border-navy-750 text-left transition-all hover:scale-[1.01]"
              >
                <div>
                  <p className="text-xs font-bold text-white">{acc.name}</p>
                  <p className="text-[10px] text-slate-400 font-mono">
                    {acc.email} • <span className="text-forensic-purple uppercase">{acc.role}</span>
                  </p>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
              </button>
            ))}
          </div>
        </div>

        {/* Regular Login Form */}
        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div>
            <label className="text-xs font-bold text-slate-300 block mb-1">Investigator Badge Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. lead.investigator@metro-forensics.gov"
              className="w-full p-2.5 bg-navy-950 border border-navy-700 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-forensic-purple"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-300 block mb-1">Encrypted Badge PIN / Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Forensics2026!"
              className="w-full p-2.5 bg-navy-950 border border-navy-700 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-forensic-purple"
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-2.5 bg-gradient-to-r from-forensic-purple to-forensic-indigo hover:from-forensic-accent hover:to-forensic-purple text-white text-xs font-bold rounded-lg shadow-lg shadow-forensic-purple/20 transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50"
          >
            {isSubmitting ? 'Authenticating Credentials...' : 'Sign In with Badge Credentials'}
          </button>
        </form>
      </div>
    </div>
  );
};
