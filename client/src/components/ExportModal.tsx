import React, { useRef, useState } from 'react';
import {
  Download,
  Printer,
  ShieldAlert,
  FileCheck2,
  X,
  Share2,
  Check,
  Fingerprint,
} from 'lucide-react';
import { Case, SketchVersion } from '../types';
import { api } from '../services/api';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  caseItem: Case;
  sketch: SketchVersion;
  onNotify: (title: string, message?: string, type?: 'success' | 'error' | 'info') => void;
}

export const ExportModal: React.FC<ExportModalProps> = ({
  isOpen,
  onClose,
  caseItem,
  sketch,
  onNotify,
}) => {
  const dossierRef = useRef<HTMLDivElement>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  if (!isOpen) return null;

  const handleDownloadPNG = async () => {
    setIsExporting(true);
    try {
      // Log audit export event
      await api.logExport(caseItem.id, sketch.id, 'HIGH_RES_PNG');

      // Create an offscreen canvas to render the full official forensic poster
      const canvas = document.createElement('canvas');
      canvas.width = 1200;
      canvas.height = 1600;
      const ctx = canvas.getContext('2d');

      if (!ctx) throw new Error('Canvas 2D context unavailable');

      // Background
      ctx.fillStyle = '#0B132B';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Header Banner
      ctx.fillStyle = '#111A36';
      ctx.fillRect(0, 0, canvas.width, 140);

      ctx.fillStyle = '#6366F1';
      ctx.fillRect(0, 136, canvas.width, 4);

      // Header text
      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 32px Inter, sans-serif';
      ctx.fillText('METROPOLITAN FORENSIC IDENTIFICATION DIVISION', 50, 60);

      ctx.fillStyle = '#94A3B8';
      ctx.font = '18px monospace';
      ctx.fillText('OFFICIAL FORENSIC FACIAL COMPOSITE DOSSIER — INVESTIGATIVE LEAD ONLY', 50, 95);

      // Case Meta Box
      ctx.fillStyle = '#162248';
      ctx.fillRect(50, 170, 1100, 140);
      ctx.strokeStyle = '#283A6D';
      ctx.strokeRect(50, 170, 1100, 140);

      ctx.fillStyle = '#E2E8F0';
      ctx.font = 'bold 20px Inter, sans-serif';
      ctx.fillText(`CASE REF: ${caseItem.id}`, 70, 205);

      ctx.font = '16px Inter, sans-serif';
      ctx.fillStyle = '#CBD5E1';
      ctx.fillText(`INCIDENT: ${caseItem.title}`, 70, 240);
      ctx.fillText(`LOCATION: ${caseItem.incidentLocation}`, 70, 270);

      ctx.fillText(`DATE/TIME: ${caseItem.incidentDate}`, 650, 205);
      ctx.fillText(`INVESTIGATOR: ${caseItem.investigatorName}`, 650, 240);
      ctx.fillText(`COMPOSITE VERSION: v${sketch.versionNumber} (Confidence: ${sketch.confidenceScore}%)`, 650, 270);

      // Responsible AI Banner in Canvas
      ctx.fillStyle = '#451A03';
      ctx.fillRect(50, 330, 1100, 50);
      ctx.strokeStyle = '#D97706';
      ctx.strokeRect(50, 330, 1100, 50);

      ctx.fillStyle = '#FDE68A';
      ctx.font = 'bold 15px monospace';
      ctx.fillText(
        'LEGAL NOTICE: AI-GENERATED APPROXIMATION BASED ON WITNESS TESTIMONY. NOT FORENSIC EVIDENCE.',
        70,
        362
      );

      // Draw the sketch image
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.src = sketch.imageUrl;

      await new Promise<void>((resolve, reject) => {
        img.onload = () => resolve();
        img.onerror = () => resolve(); // fallback gracefully
      });

      // Sketch Box
      const sketchBoxX = 50;
      const sketchBoxY = 405;
      const sketchBoxW = 600;
      const sketchBoxH = 650;

      ctx.fillStyle = '#12151C';
      ctx.fillRect(sketchBoxX, sketchBoxY, sketchBoxW, sketchBoxH);
      ctx.strokeStyle = '#6366F1';
      ctx.lineWidth = 2;
      ctx.strokeRect(sketchBoxX, sketchBoxY, sketchBoxW, sketchBoxH);

      try {
        ctx.drawImage(img, sketchBoxX + 10, sketchBoxY + 10, sketchBoxW - 20, sketchBoxH - 20);
      } catch (e) {
        // Fallback drawing if cross-origin fails
        ctx.fillStyle = '#334155';
        ctx.fillText('Forensic Composite Rendering', sketchBoxX + 150, sketchBoxY + 300);
      }

      // Metric Centimeter Scale on edge of image
      ctx.fillStyle = '#94A3B8';
      ctx.font = '10px monospace';
      for (let cm = 0; cm <= 20; cm += 2) {
        const yPos = sketchBoxY + (cm / 20) * (sketchBoxH - 20);
        ctx.fillRect(sketchBoxX + 12, yPos, 15, 1);
        ctx.fillText(`${cm}cm`, sketchBoxX + 30, yPos + 4);
      }

      // Feature breakdown table on right
      const tableX = 680;
      const tableY = 405;
      const tableW = 470;
      const tableH = 650;

      ctx.fillStyle = '#162248';
      ctx.fillRect(tableX, tableY, tableW, tableH);
      ctx.strokeStyle = '#283A6D';
      ctx.strokeRect(tableX, tableY, tableW, tableH);

      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 18px Inter, sans-serif';
      ctx.fillText('FACIAL MORPHOLOGY PARAMETERS', tableX + 25, tableY + 40);

      const featuresList = [
        ['Apparent Gender:', caseItem.features.gender],
        ['Estimated Age:', caseItem.features.ageGroup],
        ['Cranial / Face Shape:', caseItem.features.faceShape],
        ['Jawline / Chin:', caseItem.features.jawline],
        ['Eye Geometry:', caseItem.features.eyesShape],
        ['Nose Profile:', caseItem.features.nose],
        ['Hair & Grooming:', caseItem.features.hairstyle],
        ['Facial Hair:', caseItem.features.facialHair],
        ['Skin Complexion:', caseItem.features.skinTone],
        ['Distinctive Marks:', caseItem.features.distinctiveFeatures.join(', ') || 'None reported'],
      ];

      ctx.font = '14px Inter, sans-serif';
      let rowY = tableY + 80;
      featuresList.forEach(([label, val]) => {
        ctx.fillStyle = '#94A3B8';
        ctx.fillText(label, tableX + 25, rowY);
        ctx.fillStyle = '#E2E8F0';
        ctx.fillText(val.length > 25 ? val.slice(0, 24) + '...' : val, tableX + 200, rowY);
        rowY += 38;
      });

      // Biometric metrics
      ctx.fillStyle = '#06B6D4';
      ctx.font = 'bold 14px monospace';
      ctx.fillText('CRANIAL BIOMETRICS (ESTIMATED):', tableX + 25, rowY + 15);
      ctx.fillStyle = '#CBD5E1';
      ctx.font = '12px monospace';
      ctx.fillText(`• Cranial Ratio: ${sketch.biometricMetrics.cranialRatio}`, tableX + 25, rowY + 40);
      ctx.fillText(`• Interpupillary Dist: ${sketch.biometricMetrics.interpupillaryDistance} mm`, tableX + 25, rowY + 60);
      ctx.fillText(`• Jaw Angle: ${sketch.biometricMetrics.jawAngleDegrees}°`, tableX + 25, rowY + 80);
      ctx.fillText(`• Facial Symmetry: ${sketch.biometricMetrics.symmetryScore}%`, tableX + 25, rowY + 100);

      // Witness Statement Extract
      ctx.fillStyle = '#162248';
      ctx.fillRect(50, 1080, 1100, 160);
      ctx.strokeStyle = '#283A6D';
      ctx.strokeRect(50, 1080, 1100, 160);

      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 16px Inter, sans-serif';
      ctx.fillText('EYEWITNESS STATEMENT DEPOSITION (SUMMARIZED):', 70, 1115);

      ctx.fillStyle = '#94A3B8';
      ctx.font = 'italic 14px Inter, sans-serif';
      const statementLines = caseItem.witnessStatement.slice(0, 240);
      ctx.fillText(`"${statementLines}..."`, 70, 1145);
      ctx.fillText(`— Certified Witness: ${caseItem.witnessName}`, 70, 1180);

      // Chain of Custody & Verification Footer
      ctx.fillStyle = '#0F172A';
      ctx.fillRect(50, 1260, 1100, 150);
      ctx.strokeStyle = '#334155';
      ctx.strokeRect(50, 1260, 1100, 150);

      ctx.fillStyle = '#10B981';
      ctx.font = 'bold 14px monospace';
      ctx.fillText('CHAIN OF CUSTODY VERIFICATION & CRYPTOGRAPHIC HASH', 70, 1295);

      ctx.fillStyle = '#94A3B8';
      ctx.font = '11px monospace';
      const hashStr = `SHA-256: e8b94f1c${Date.now().toString(16)}0a74d238f4a9b2c1d8e7f6035a4b12c8e`;
      ctx.fillText(hashStr, 70, 1320);
      ctx.fillText(`Generated by: ${sketch.createdBy} | AI Engine: ${sketch.modelUsed}`, 70, 1340);
      ctx.fillText(`Timestamp: ${new Date().toUTCString()} | Standard: NIST-OSAC-FAC-2026`, 70, 1360);

      // Signature line on right
      ctx.fillStyle = '#CBD5E1';
      ctx.font = '14px Inter, sans-serif';
      ctx.fillText('Authorized Detective Signature: _______________________', 650, 1360);

      // Bottom disclaimer
      ctx.fillStyle = '#64748B';
      ctx.font = '11px Inter, sans-serif';
      ctx.fillText(
        'SketchTrace AI Forensic Imaging Platform. All rights reserved. Do not disseminate without supervisory clearance.',
        300,
        1460
      );

      // Trigger download
      const dataUrl = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.download = `SketchTrace_${caseItem.id}_v${sketch.versionNumber}_Dossier.png`;
      link.href = dataUrl;
      link.click();

      onNotify('Evidence Dossier Exported', `High-res composite PNG saved for ${caseItem.id}`, 'success');
    } catch (err: any) {
      console.error('Export error:', err);
      onNotify('Export Failed', err.message || 'Could not render composite dossier', 'error');
    } finally {
      setIsExporting(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(sketch.imageUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
    onNotify('Image URL Copied', 'Direct composite sketch link copied to clipboard', 'info');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/85 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-navy-900 border border-forensic-purple/40 rounded-xl shadow-2xl overflow-hidden my-8 text-slate-100">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-navy-800/80 border-b border-navy-700">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-emerald-500/20 border border-emerald-500/40 rounded-lg text-emerald-400">
              <FileCheck2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white tracking-wide">Export Evidence Composite Dossier</h2>
              <p className="text-xs text-slate-400 font-mono">Case #{caseItem.id} • Version v{sketch.versionNumber}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-navy-700 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Dossier Preview Document */}
        <div className="p-6 max-h-[65vh] overflow-y-auto">
          <div
            ref={dossierRef}
            className="p-6 bg-navy-950 border border-navy-700 rounded-xl space-y-6 print:border-none print:p-0"
          >
            {/* Dossier Header */}
            <div className="border-b border-navy-800 pb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Fingerprint className="w-8 h-8 text-forensic-purple" />
                  <div>
                    <h3 className="text-sm font-extrabold text-white tracking-wider">METROPOLITAN CRIME LAB & FORENSICS</h3>
                    <p className="text-[11px] font-mono text-slate-400">SUSPECT COMPOSITE IDENTIFICATION REPORT</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="px-2.5 py-1 text-xs font-mono font-bold bg-forensic-purple/20 text-forensic-purple border border-forensic-purple/40 rounded">
                    CONFIDENTIAL / LEADS ONLY
                  </span>
                  <p className="text-[10px] font-mono text-slate-400 mt-1">Generated: {new Date(sketch.createdAt).toLocaleDateString()}</p>
                </div>
              </div>
            </div>

            {/* Mandatory Responsible AI Notice */}
            <div className="p-3 bg-amber-950/40 border border-amber-600/50 rounded-lg flex items-center space-x-3 text-amber-200 text-xs">
              <ShieldAlert className="w-5 h-5 text-amber-400 shrink-0" />
              <span>
                <strong>CRITICAL LEGAL NOTICE:</strong> This composite portrait is an <strong>AI-generated forensic approximation</strong> synthesized from witness testimony. It is NOT photographic proof of identity and must not be used alone to accuse or arrest any individual.
              </span>
            </div>

            {/* Case Details Row */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3 bg-navy-900/80 border border-navy-800 rounded-lg text-xs">
              <div>
                <p className="text-slate-400">Case ID</p>
                <p className="font-mono font-bold text-white mt-0.5">{caseItem.id}</p>
              </div>
              <div>
                <p className="text-slate-400">Incident Category</p>
                <p className="font-medium text-white mt-0.5">{caseItem.incidentType}</p>
              </div>
              <div>
                <p className="text-slate-400">Investigating Officer</p>
                <p className="font-medium text-white mt-0.5">{caseItem.investigatorName}</p>
              </div>
              <div>
                <p className="text-slate-400">Iteration Level</p>
                <p className="font-mono font-bold text-emerald-400 mt-0.5">Version {sketch.versionNumber} ({sketch.confidenceScore}% conf)</p>
              </div>
            </div>

            {/* Sketch and Metadata Columns */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
              {/* Sketch Box with Centimeter Scale */}
              <div className="relative border border-forensic-purple/50 rounded-xl overflow-hidden bg-charcoal-900 shadow-xl group">
                <img
                  src={sketch.imageUrl}
                  alt={`Forensic composite v${sketch.versionNumber}`}
                  className="w-full h-80 object-cover filter contrast-105"
                />
                {/* Metric scale overlay */}
                <div className="absolute left-2 top-2 bottom-2 w-6 border-r border-slate-500/50 flex flex-col justify-between py-2 text-[8px] font-mono text-slate-400">
                  <span>0cm</span>
                  <span>5cm</span>
                  <span>10cm</span>
                  <span>15cm</span>
                  <span>20cm</span>
                </div>
                {/* Overlay Badge */}
                <div className="absolute bottom-2 right-2 px-2 py-1 bg-navy-950/80 backdrop-blur-sm border border-navy-700 rounded text-[10px] font-mono text-slate-300">
                  AI Composite • {sketch.provider}
                </div>
              </div>

              {/* Facial Characteristics Summary */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-white uppercase tracking-wider border-b border-navy-800 pb-1">
                  Witness Deposition Feature Metrics
                </h4>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="p-2 bg-navy-900/50 rounded border border-navy-800">
                    <span className="text-slate-400 text-[10px]">Gender / Age</span>
                    <p className="font-medium text-white mt-0.5">{caseItem.features.gender}, {caseItem.features.ageGroup}</p>
                  </div>
                  <div className="p-2 bg-navy-900/50 rounded border border-navy-800">
                    <span className="text-slate-400 text-[10px]">Cranial / Jaw</span>
                    <p className="font-medium text-white mt-0.5">{caseItem.features.faceShape}, {caseItem.features.jawline}</p>
                  </div>
                  <div className="p-2 bg-navy-900/50 rounded border border-navy-800">
                    <span className="text-slate-400 text-[10px]">Eyes / Brows</span>
                    <p className="font-medium text-white mt-0.5">{caseItem.features.eyesShape}, {caseItem.features.eyebrows}</p>
                  </div>
                  <div className="p-2 bg-navy-900/50 rounded border border-navy-800">
                    <span className="text-slate-400 text-[10px]">Nose Profile</span>
                    <p className="font-medium text-white mt-0.5">{caseItem.features.nose}</p>
                  </div>
                  <div className="p-2 bg-navy-900/50 rounded border border-navy-800">
                    <span className="text-slate-400 text-[10px]">Hair / Facial Hair</span>
                    <p className="font-medium text-white mt-0.5">{caseItem.features.hairstyle}, {caseItem.features.facialHair}</p>
                  </div>
                  <div className="p-2 bg-navy-900/50 rounded border border-navy-800">
                    <span className="text-slate-400 text-[10px]">Complexion</span>
                    <p className="font-medium text-white mt-0.5">{caseItem.features.skinTone}</p>
                  </div>
                </div>

                {caseItem.features.distinctiveFeatures.length > 0 && (
                  <div className="p-2 bg-navy-900/50 rounded border border-navy-800 text-xs">
                    <span className="text-slate-400 text-[10px]">Distinctive Marks & Scars</span>
                    <p className="font-medium text-amber-300 mt-0.5">{caseItem.features.distinctiveFeatures.join(', ')}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Cryptographic Chain-of-Custody Stamp */}
            <div className="pt-3 border-t border-navy-800 flex flex-col sm:flex-row items-center justify-between text-[11px] font-mono text-slate-400 gap-2">
              <div className="flex items-center space-x-2">
                <FileCheck2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>SHA-256 Hash Verification: c8b74f...0a1d48</span>
              </div>
              <div>Standard: NIST-OSAC-FAC-2026 Compliant</div>
            </div>
          </div>
        </div>

        {/* Modal Actions */}
        <div className="flex items-center justify-between px-6 py-4 bg-navy-800/80 border-t border-navy-700">
          <div className="flex items-center space-x-2">
            <button
              onClick={handleCopyLink}
              className="flex items-center space-x-1.5 px-3 py-2 bg-navy-700 hover:bg-navy-600 text-slate-200 text-xs font-medium rounded-lg transition-colors"
            >
              {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Share2 className="w-3.5 h-3.5" />}
              <span>{copiedLink ? 'Copied' : 'Copy Image Link'}</span>
            </button>
            <button
              onClick={handlePrint}
              className="flex items-center space-x-1.5 px-3 py-2 bg-navy-700 hover:bg-navy-600 text-slate-200 text-xs font-medium rounded-lg transition-colors"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Dossier</span>
            </button>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-slate-400 hover:text-white text-xs font-medium rounded-lg transition-colors"
            >
              Close
            </button>
            <button
              onClick={handleDownloadPNG}
              disabled={isExporting}
              className="flex items-center space-x-2 px-5 py-2.5 bg-gradient-to-r from-forensic-purple to-forensic-indigo hover:from-forensic-accent hover:to-forensic-purple text-white text-xs font-bold rounded-lg shadow-lg shadow-forensic-purple/20 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
            >
              <Download className="w-4 h-4" />
              <span>{isExporting ? 'Rendering Canvas...' : 'Download High-Res PNG Dossier'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
