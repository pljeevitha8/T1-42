import React, { useState, useEffect } from 'react';
import {
  Palette,
  Sparkles,
  Sliders,
  History,
  Download,
  FileText,
  RotateCcw,
  Eye,
  Grid,
  Ruler,
  Check,
  Split,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  Wand2,
  Maximize2,
  Scan,
  Compass,
  Layers,
} from 'lucide-react';
import { Case, FacialFeatures, SketchVersion } from '../types';
import { api } from '../services/api';
import { ExportModal } from './ExportModal';

interface StudioViewProps {
  activeCase: Case | null;
  onUpdateCase: (updatedCase: Case) => void;
  onNotify: (title: string, message?: string, type?: 'success' | 'error' | 'info') => void;
  onOpenEthicsModal: () => void;
}

const SAMPLE_STATEMENTS = [
  {
    title: 'Bank Robber "Apex"',
    text: 'Male, late 30s, around 6ft tall. Extremely sharp angular jawline, sunken hollow cheeks with heavy dark stubble. Intense deep-set hooded dark eyes, thick straight eyebrows. Short cropped dark brown hair, slight temple recession. Distinct scar slicing across his left eyebrow.',
  },
  {
    title: 'Pier Courier "Vesper"',
    text: 'Female, late 20s. Defined square jaw, high prominent cheekbones, piercing almond hazel eyes with high arched brows. Sleek black hair slicked tightly into a ponytail. Wore thin wire-framed spectacles.',
  },
  {
    title: 'Cyber Infiltrator "Cipher"',
    text: 'Male, approximately 50 years old. Weathered skin with deep crow feet and forehead furrows. Crooked broken nose bridge. Full salt and pepper beard trimmed short, receding hair under a dark knit beanie.',
  },
];

const DISTINCTIVE_OPTIONS = [
  'Scar over left eyebrow',
  'Cheek scar',
  'Sunken hollow cheeks',
  'Broken nose bridge',
  'Facial mole / mark',
  "Deep crow's feet",
  'Forehead furrows',
  'Cleft chin',
];

const ACCESSORY_OPTIONS = [
  'None',
  'Wire-rim spectacles',
  'Thick dark frames',
  'Baseball cap',
  'Knit beanie',
  'Hoodie pulled up',
];

export const StudioView: React.FC<StudioViewProps> = ({
  activeCase,
  onUpdateCase,
  onNotify,
  onOpenEthicsModal,
}) => {
  if (!activeCase) {
    return (
      <div className="flex-1 flex items-center justify-center p-8 text-center bg-navy-950">
        <div className="max-w-md p-8 bg-navy-900 border border-navy-800 rounded-2xl shadow-xl">
          <Palette className="w-12 h-12 text-forensic-purple mx-auto mb-4" />
          <h2 className="text-lg font-bold text-white mb-2">No Active Case Selected</h2>
          <p className="text-sm text-slate-400 mb-6">
            Please select a case from the Case Files or initialize a new forensic investigation dossier to begin composite sketch generation.
          </p>
        </div>
      </div>
    );
  }

  // Local state for features form
  const [features, setFeatures] = useState<FacialFeatures>(activeCase.features);
  const [witnessStatement, setWitnessStatement] = useState(activeCase.witnessStatement || '');
  const [refinementNotes, setRefinementNotes] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationPhase, setGenerationPhase] = useState<string>('');
  const [generationProgress, setGenerationProgress] = useState(0);

  // Canvas visual tools
  const [showGrid, setShowGrid] = useState(false);
  const [showRuler, setShowRuler] = useState(true);
  const [showBiometrics, setShowBiometrics] = useState(true);
  const [compareMode, setCompareMode] = useState<'single' | 'split' | 'matrix'>('single');
  const [splitPosition, setSplitPosition] = useState(50);
  const [selectedVersionId, setSelectedVersionId] = useState<string>(
    activeCase.primarySketchId || (activeCase.sketches[0]?.id ?? '')
  );
  const [compareVersionId, setCompareVersionId] = useState<string>(
    activeCase.sketches.length > 1 ? activeCase.sketches[0].id : ''
  );

  // Accordion state
  const [openSection, setOpenSection] = useState<'basic' | 'eyes' | 'hair' | 'sliders'>('basic');
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);

  // Synchronize when activeCase changes
  useEffect(() => {
    setFeatures(activeCase.features);
    setWitnessStatement(activeCase.witnessStatement);
    if (activeCase.sketches.length > 0) {
      setSelectedVersionId(activeCase.primarySketchId || activeCase.sketches[activeCase.sketches.length - 1].id);
      if (activeCase.sketches.length > 1) {
        setCompareVersionId(activeCase.sketches[0].id);
      }
    }
  }, [activeCase.id]);

  const currentSketch =
    activeCase.sketches.find((s) => s.id === selectedVersionId) ||
    activeCase.sketches[activeCase.sketches.length - 1];

  const compareSketch =
    activeCase.sketches.find((s) => s.id === compareVersionId) ||
    activeCase.sketches[0];

  // AI Auto-Extract Parameters from text statement
  const handleAutoExtract = async () => {
    if (!witnessStatement || witnessStatement.trim().length === 0) {
      onNotify('Statement Empty', 'Please enter a witness statement first', 'info');
      return;
    }

    try {
      const res = await api.parseWitnessStatement(witnessStatement);
      const extracted = res.extracted;
      setFeatures((prev) => ({
        ...prev,
        ...extracted,
        distinctiveFeatures: [
          ...new Set([...prev.distinctiveFeatures, ...(extracted.distinctiveFeatures || [])]),
        ],
        accessories: [
          ...new Set([...prev.accessories, ...(extracted.accessories || [])]),
        ],
      }));
      onNotify(
        'Statement Parsed',
        'Facial morphology parameters synthesized from witness deposition',
        'success'
      );
    } catch (err: any) {
      onNotify('Parsing Failed', err.message, 'error');
    }
  };

  // Generate initial sketch or new version
  const handleGenerate = async (isRefinement: boolean = false) => {
    if (isRefinement && !refinementNotes.trim()) {
      onNotify('Refinement Note Required', 'Please specify what adjustments the witness requested', 'info');
      return;
    }

    setIsGenerating(true);
    setGenerationProgress(10);
    setGenerationPhase('Deconstructing witness testimony & extracting biometric markers...');

    const timer1 = setTimeout(() => {
      setGenerationProgress(35);
      setGenerationPhase('Synthesizing cranial morphology & facial proportion grid...');
    }, 900);

    const timer2 = setTimeout(() => {
      setGenerationProgress(65);
      setGenerationPhase('Tracing graphite contours & forensic cross-hatch shading...');
    }, 1800);

    const timer3 = setTimeout(() => {
      setGenerationProgress(85);
      setGenerationPhase('Applying distinctive features & forensic lighting calibration...');
    }, 2700);

    try {
      let res;
      if (isRefinement) {
        res = await api.refineSketch(
          activeCase.id,
          features,
          refinementNotes,
          currentSketch?.id
        );
      } else {
        res = await api.generateSketch(activeCase.id, features, witnessStatement);
      }

      setGenerationProgress(100);
      setGenerationPhase('Composite rendering complete.');

      onUpdateCase(res.case);
      setSelectedVersionId(res.sketch.id);
      if (res.case.sketches.length > 1) {
        setCompareVersionId(res.case.sketches[res.case.sketches.length - 2].id);
      }
      setRefinementNotes('');

      onNotify(
        isRefinement ? `Composite Refined (v${res.sketch.versionNumber})` : 'Initial Composite Generated',
        `Forensic sketch generated with ${res.sketch.confidenceScore}% confidence`,
        'success'
      );
    } catch (err: any) {
      console.error('Generation error:', err);
      onNotify('Generation Error', err.message || 'AI sketch pipeline failed', 'error');
    } finally {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
      setIsGenerating(false);
      setGenerationProgress(0);
    }
  };

  const handleSetPrimary = async (sketchId: string) => {
    try {
      const res = await api.setPrimarySketch(activeCase.id, sketchId);
      onUpdateCase(res.case);
      onNotify('Primary Composite Updated', `Selected as official case lead image`, 'success');
    } catch (err: any) {
      onNotify('Error', err.message, 'error');
    }
  };

  const handleSliderChange = (key: keyof FacialFeatures['refinements'], val: number) => {
    setFeatures((prev) => ({
      ...prev,
      refinements: {
        ...prev.refinements,
        [key]: val,
      },
    }));
  };

  const toggleDistinctive = (item: string) => {
    setFeatures((prev) => {
      const exists = prev.distinctiveFeatures.includes(item);
      return {
        ...prev,
        distinctiveFeatures: exists
          ? prev.distinctiveFeatures.filter((i) => i !== item)
          : [...prev.distinctiveFeatures, item],
      };
    });
  };

  const toggleAccessory = (item: string) => {
    setFeatures((prev) => {
      const exists = prev.accessories.includes(item);
      return {
        ...prev,
        accessories: exists
          ? prev.accessories.filter((i) => i !== item)
          : [...prev.accessories, item],
      };
    });
  };

  return (
    <div className="flex-1 flex flex-col lg:flex-row overflow-hidden bg-navy-950">
      {/* ================= LEFT PANEL: WITNESS INPUT & MORPHOLOGY REFINEMENT ================= */}
      <div className="w-full lg:w-[460px] xl:w-[500px] border-r border-navy-800 bg-navy-900 flex flex-col h-full shrink-0">
        {/* Panel Header */}
        <div className="p-4 border-b border-navy-800 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Sliders className="w-4 h-4 text-forensic-purple" />
            <h2 className="text-xs font-bold uppercase tracking-wider text-white">
              Witness Deposition & Morphometrics
            </h2>
          </div>
          <span className="text-[10px] font-mono px-2 py-0.5 bg-navy-800 text-slate-300 rounded border border-navy-700">
            {activeCase.sketches.length} Versions Drafted
          </span>
        </div>

        {/* Scrollable Form Body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-5">
          {/* Witness Statement Box */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-200">
                Eyewitness Natural Language Statement
              </label>
              <button
                onClick={handleAutoExtract}
                className="flex items-center space-x-1 text-[11px] font-medium text-forensic-purple hover:text-forensic-accent transition-colors"
                title="Extract structured features from testimony using AI"
              >
                <Wand2 className="w-3.5 h-3.5" />
                <span>AI Auto-Extract</span>
              </button>
            </div>
            <textarea
              rows={3}
              value={witnessStatement}
              onChange={(e) => setWitnessStatement(e.target.value)}
              placeholder="e.g. Suspect was male, around 35 years old, square chiseled jaw, piercing hooded dark eyes, horizontal scar over left eyebrow, short black hair..."
              className="w-full p-2.5 bg-navy-950 border border-navy-700 rounded-lg text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-forensic-purple transition-colors resize-none"
            />

            {/* Quick Sample Testimony Chips */}
            <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 pt-0.5">
              <span className="text-[10px] text-slate-500 font-mono shrink-0">Demo Cases:</span>
              {SAMPLE_STATEMENTS.map((sample) => (
                <button
                  key={sample.title}
                  onClick={() => {
                    setWitnessStatement(sample.text);
                    api.parseWitnessStatement(sample.text).then((res) => {
                      setFeatures((prev) => ({ ...prev, ...res.extracted }));
                      onNotify('Sample Loaded', `${sample.title} deposition applied`, 'info');
                    });
                  }}
                  className="px-2 py-0.5 bg-navy-800 hover:bg-navy-700 text-slate-300 text-[10px] rounded border border-navy-700 shrink-0 transition-colors"
                >
                  {sample.title}
                </button>
              ))}
            </div>
          </div>

          {/* Morphometrics Accordion Sections */}
          <div className="space-y-3">
            {/* Section 1: Demographics & Face Shape */}
            <div className="border border-navy-700/80 rounded-xl overflow-hidden bg-navy-950/60">
              <button
                onClick={() => setOpenSection(openSection === 'basic' ? 'sliders' : 'basic')}
                className="w-full p-3 flex items-center justify-between text-xs font-semibold text-white bg-navy-800/40 hover:bg-navy-800/70 transition-colors"
              >
                <span>1. Cranial Geometry & Demographics</span>
                {openSection === 'basic' ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
              </button>

              {openSection === 'basic' && (
                <div className="p-3.5 space-y-3 text-xs">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[11px] text-slate-400 block mb-1">Gender Presentation</label>
                      <select
                        value={features.gender}
                        onChange={(e) => setFeatures({ ...features, gender: e.target.value })}
                        className="w-full p-2 bg-navy-900 border border-navy-700 rounded text-slate-200"
                      >
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Androgynous">Androgynous</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-[11px] text-slate-400 block mb-1">Age Bracket</label>
                      <select
                        value={features.ageGroup}
                        onChange={(e) => setFeatures({ ...features, ageGroup: e.target.value })}
                        className="w-full p-2 bg-navy-900 border border-navy-700 rounded text-slate-200"
                      >
                        <option value="18-25">18 - 25 years</option>
                        <option value="26-35">26 - 35 years</option>
                        <option value="36-45">36 - 45 years</option>
                        <option value="46-55">46 - 55 years</option>
                        <option value="56-65">56 - 65 years</option>
                        <option value="65+">65+ years</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[11px] text-slate-400 block mb-1">Cranial / Face Shape</label>
                      <select
                        value={features.faceShape}
                        onChange={(e) => setFeatures({ ...features, faceShape: e.target.value })}
                        className="w-full p-2 bg-navy-900 border border-navy-700 rounded text-slate-200"
                      >
                        <option value="Oval">Oval</option>
                        <option value="Square">Square</option>
                        <option value="Diamond">Diamond</option>
                        <option value="Round">Round</option>
                        <option value="Heart">Heart</option>
                        <option value="Oblong">Oblong</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-[11px] text-slate-400 block mb-1">Mandibular Jawline</label>
                      <select
                        value={features.jawline}
                        onChange={(e) => setFeatures({ ...features, jawline: e.target.value })}
                        className="w-full p-2 bg-navy-900 border border-navy-700 rounded text-slate-200"
                      >
                        <option value="Sharp Angular">Sharp Angular</option>
                        <option value="Square Chiseled">Square Chiseled</option>
                        <option value="Soft Rounded">Soft Rounded</option>
                        <option value="Cleft Chin">Cleft Chin</option>
                        <option value="Prominent">Prominent</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="text-[11px] text-slate-400 block mb-1">Complexion / Skin Texture</label>
                    <select
                      value={features.skinTone}
                      onChange={(e) => setFeatures({ ...features, skinTone: e.target.value })}
                      className="w-full p-2 bg-navy-900 border border-navy-700 rounded text-slate-200"
                    >
                      <option value="Fair / Pale">Fair / Pale</option>
                      <option value="Olive">Olive</option>
                      <option value="Medium Tan">Medium Tan</option>
                      <option value="Deep Dark">Deep Dark</option>
                      <option value="Weathered">Weathered / Leathery</option>
                    </select>
                  </div>
                </div>
              )}
            </div>

            {/* Section 2: Eyes & Nose */}
            <div className="border border-navy-700/80 rounded-xl overflow-hidden bg-navy-950/60">
              <button
                onClick={() => setOpenSection(openSection === 'eyes' ? 'sliders' : 'eyes')}
                className="w-full p-3 flex items-center justify-between text-xs font-semibold text-white bg-navy-800/40 hover:bg-navy-800/70 transition-colors"
              >
                <span>2. Ocular & Nasal Characteristics</span>
                {openSection === 'eyes' ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
              </button>

              {openSection === 'eyes' && (
                <div className="p-3.5 space-y-3 text-xs">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[11px] text-slate-400 block mb-1">Eye Geometry</label>
                      <select
                        value={features.eyesShape}
                        onChange={(e) => setFeatures({ ...features, eyesShape: e.target.value })}
                        className="w-full p-2 bg-navy-900 border border-navy-700 rounded text-slate-200"
                      >
                        <option value="Deep-set">Deep-set</option>
                        <option value="Almond">Almond</option>
                        <option value="Round">Round</option>
                        <option value="Hooded">Hooded</option>
                        <option value="Narrow">Narrow</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-[11px] text-slate-400 block mb-1">Iris Color</label>
                      <select
                        value={features.eyeColor}
                        onChange={(e) => setFeatures({ ...features, eyeColor: e.target.value })}
                        className="w-full p-2 bg-navy-900 border border-navy-700 rounded text-slate-200"
                      >
                        <option value="Dark">Dark / Black</option>
                        <option value="Brown">Brown</option>
                        <option value="Hazel">Hazel</option>
                        <option value="Blue">Blue</option>
                        <option value="Green">Green</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[11px] text-slate-400 block mb-1">Eyebrow Form</label>
                      <select
                        value={features.eyebrows}
                        onChange={(e) => setFeatures({ ...features, eyebrows: e.target.value })}
                        className="w-full p-2 bg-navy-900 border border-navy-700 rounded text-slate-200"
                      >
                        <option value="Thick Bushy">Thick Bushy</option>
                        <option value="Thin Arched">Thin Arched</option>
                        <option value="Straight">Straight</option>
                        <option value="Angular High Arch">Angular High Arch</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-[11px] text-slate-400 block mb-1">Nasal Bridge & Profile</label>
                      <select
                        value={features.nose}
                        onChange={(e) => setFeatures({ ...features, nose: e.target.value })}
                        className="w-full p-2 bg-navy-900 border border-navy-700 rounded text-slate-200"
                      >
                        <option value="Straight">Straight</option>
                        <option value="Aquiline / Hooked">Aquiline / Hooked</option>
                        <option value="Button / Small">Button / Small</option>
                        <option value="Wide / Broad">Wide / Broad</option>
                        <option value="Broken / Asymmetric">Broken / Asymmetric</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Section 3: Hair, Facial Hair & Marks */}
            <div className="border border-navy-700/80 rounded-xl overflow-hidden bg-navy-950/60">
              <button
                onClick={() => setOpenSection(openSection === 'hair' ? 'sliders' : 'hair')}
                className="w-full p-3 flex items-center justify-between text-xs font-semibold text-white bg-navy-800/40 hover:bg-navy-800/70 transition-colors"
              >
                <span>3. Hair, Scars & Distinctive Marks</span>
                {openSection === 'hair' ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
              </button>

              {openSection === 'hair' && (
                <div className="p-3.5 space-y-3 text-xs">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[11px] text-slate-400 block mb-1">Hairstyle</label>
                      <select
                        value={features.hairstyle}
                        onChange={(e) => setFeatures({ ...features, hairstyle: e.target.value })}
                        className="w-full p-2 bg-navy-900 border border-navy-700 rounded text-slate-200"
                      >
                        <option value="Short Cropped">Short Cropped</option>
                        <option value="Buzz Cut">Buzz Cut</option>
                        <option value="Receding Hairline">Receding Hairline</option>
                        <option value="Wavy Medium">Wavy Medium</option>
                        <option value="Long Slicked">Long Slicked</option>
                        <option value="Curly / Afro">Curly / Afro</option>
                        <option value="Braids / Dreadlocks">Braids / Dreadlocks</option>
                        <option value="Bald / Shaved">Bald / Shaved</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-[11px] text-slate-400 block mb-1">Hair Color</label>
                      <select
                        value={features.hairColor}
                        onChange={(e) => setFeatures({ ...features, hairColor: e.target.value })}
                        className="w-full p-2 bg-navy-900 border border-navy-700 rounded text-slate-200"
                      >
                        <option value="Black">Black</option>
                        <option value="Dark Brown">Dark Brown</option>
                        <option value="Blonde">Blonde</option>
                        <option value="Gray / Salt & Pepper">Gray / Salt & Pepper</option>
                        <option value="Red / Auburn">Red / Auburn</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="text-[11px] text-slate-400 block mb-1">Facial Hair</label>
                    <select
                      value={features.facialHair}
                      onChange={(e) => setFeatures({ ...features, facialHair: e.target.value })}
                      className="w-full p-2 bg-navy-900 border border-navy-700 rounded text-slate-200"
                    >
                      <option value="Clean Shaven">Clean Shaven</option>
                      <option value="5 O'Clock Shadow">5 O'Clock Shadow / Stubble</option>
                      <option value="Full Beard">Full Beard</option>
                      <option value="Goatee">Goatee</option>
                      <option value="Horseshoe Mustache">Horseshoe Mustache</option>
                    </select>
                  </div>

                  {/* Distinctive Marks Chips */}
                  <div>
                    <label className="text-[11px] text-slate-400 block mb-1.5">Distinctive Scars & Marks</label>
                    <div className="flex flex-wrap gap-1.5">
                      {DISTINCTIVE_OPTIONS.map((item) => {
                        const selected = features.distinctiveFeatures.includes(item);
                        return (
                          <button
                            key={item}
                            onClick={() => toggleDistinctive(item)}
                            className={`px-2 py-1 rounded text-[10px] font-medium transition-colors ${
                              selected
                                ? 'bg-forensic-purple text-white shadow-sm'
                                : 'bg-navy-900 text-slate-400 hover:text-slate-200 border border-navy-800'
                            }`}
                          >
                            {selected ? `✓ ${item}` : `+ ${item}`}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Accessories Chips */}
                  <div>
                    <label className="text-[11px] text-slate-400 block mb-1.5">Headwear & Spectacles</label>
                    <div className="flex flex-wrap gap-1.5">
                      {ACCESSORY_OPTIONS.map((item) => {
                        const selected = features.accessories.includes(item);
                        return (
                          <button
                            key={item}
                            onClick={() => toggleAccessory(item)}
                            className={`px-2 py-1 rounded text-[10px] font-medium transition-colors ${
                              selected
                                ? 'bg-forensic-indigo text-white'
                                : 'bg-navy-900 text-slate-400 hover:text-slate-200 border border-navy-800'
                            }`}
                          >
                            {selected ? `✓ ${item}` : `+ ${item}`}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Section 4: Continuous Forensic Refinement Sliders */}
            <div className="border border-navy-700/80 rounded-xl overflow-hidden bg-navy-950/60">
              <button
                onClick={() => setOpenSection(openSection === 'sliders' ? 'basic' : 'sliders')}
                className="w-full p-3 flex items-center justify-between text-xs font-semibold text-white bg-navy-800/40 hover:bg-navy-800/70 transition-colors"
              >
                <div className="flex items-center space-x-2">
                  <Sliders className="w-3.5 h-3.5 text-forensic-purple" />
                  <span>4. Fine Biometric Adjustment Sliders</span>
                </div>
                {openSection === 'sliders' ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
              </button>

              {openSection === 'sliders' && (
                <div className="p-3.5 space-y-3.5 text-xs">
                  {/* Slider: Age Offset */}
                  <div>
                    <div className="flex justify-between text-[11px] mb-1">
                      <span className="text-slate-400">Age Shift Calibration</span>
                      <span className="font-mono text-forensic-cyan">
                        {features.refinements.ageOffset > 0 ? `+${features.refinements.ageOffset}` : features.refinements.ageOffset} yrs
                      </span>
                    </div>
                    <input
                      type="range"
                      min="-10"
                      max="10"
                      value={features.refinements.ageOffset}
                      onChange={(e) => handleSliderChange('ageOffset', parseInt(e.target.value, 10))}
                      className="w-full accent-forensic-purple cursor-pointer"
                    />
                  </div>

                  {/* Slider: Jaw Width */}
                  <div>
                    <div className="flex justify-between text-[11px] mb-1">
                      <span className="text-slate-400">Mandibular Width & Angularity</span>
                      <span className="font-mono text-forensic-cyan">{features.refinements.jawWidth}%</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={features.refinements.jawWidth}
                      onChange={(e) => handleSliderChange('jawWidth', parseInt(e.target.value, 10))}
                      className="w-full accent-forensic-purple cursor-pointer"
                    />
                  </div>

                  {/* Slider: Eye Narrowness */}
                  <div>
                    <div className="flex justify-between text-[11px] mb-1">
                      <span className="text-slate-400">Ocular Aperture / Eye Squint</span>
                      <span className="font-mono text-forensic-cyan">{features.refinements.eyeNarrowness}%</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={features.refinements.eyeNarrowness}
                      onChange={(e) => handleSliderChange('eyeNarrowness', parseInt(e.target.value, 10))}
                      className="w-full accent-forensic-purple cursor-pointer"
                    />
                  </div>

                  {/* Slider: Nose Prominence */}
                  <div>
                    <div className="flex justify-between text-[11px] mb-1">
                      <span className="text-slate-400">Nose Bridge Prominence</span>
                      <span className="font-mono text-forensic-cyan">{features.refinements.noseProminence}%</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={features.refinements.noseProminence}
                      onChange={(e) => handleSliderChange('noseProminence', parseInt(e.target.value, 10))}
                      className="w-full accent-forensic-purple cursor-pointer"
                    />
                  </div>

                  {/* Slider: Stubble Density */}
                  <div>
                    <div className="flex justify-between text-[11px] mb-1">
                      <span className="text-slate-400">Graphite Stubble Density</span>
                      <span className="font-mono text-forensic-cyan">{features.refinements.stubbleDensity}%</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={features.refinements.stubbleDensity}
                      onChange={(e) => handleSliderChange('stubbleDensity', parseInt(e.target.value, 10))}
                      className="w-full accent-forensic-purple cursor-pointer"
                    />
                  </div>

                  {/* Slider: Cheek Hollow */}
                  <div>
                    <div className="flex justify-between text-[11px] mb-1">
                      <span className="text-slate-400">Cheekbone Hollow & Gauntness</span>
                      <span className="font-mono text-forensic-cyan">{features.refinements.cheekHollow}%</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={features.refinements.cheekHollow}
                      onChange={(e) => handleSliderChange('cheekHollow', parseInt(e.target.value, 10))}
                      className="w-full accent-forensic-purple cursor-pointer"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Iterative Refinement Note Box */}
          {activeCase.sketches.length > 0 && (
            <div className="p-3 bg-navy-950 border border-forensic-purple/40 rounded-xl space-y-2">
              <label className="text-xs font-bold text-forensic-purple flex items-center space-x-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Witness Correction Delta (Refinement Note)</span>
              </label>
              <input
                type="text"
                value={refinementNotes}
                onChange={(e) => setRefinementNotes(e.target.value)}
                placeholder="e.g. Witness noted: 'Narrow the nose slightly and deepen the scar'"
                className="w-full p-2 bg-navy-900 border border-navy-700 rounded text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-forensic-purple"
              />
            </div>
          )}
        </div>

        {/* Action Generation Footer */}
        <div className="p-4 border-t border-navy-800 bg-navy-950/80 space-y-2.5">
          {/* Generation Progress Indicator */}
          {isGenerating && (
            <div className="p-3 bg-navy-900 border border-forensic-purple/40 rounded-lg space-y-2 animate-in fade-in">
              <div className="flex justify-between text-[11px] font-mono text-slate-300">
                <span className="truncate pr-2">{generationPhase}</span>
                <span className="text-forensic-cyan font-bold">{generationProgress}%</span>
              </div>
              <div className="w-full h-1.5 bg-navy-950 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-forensic-purple via-forensic-indigo to-forensic-cyan transition-all duration-300 rounded-full"
                  style={{ width: `${generationProgress}%` }}
                />
              </div>
            </div>
          )}

          <div className="flex items-center space-x-2">
            {activeCase.sketches.length === 0 ? (
              <button
                onClick={() => handleGenerate(false)}
                disabled={isGenerating}
                className="flex-1 flex items-center justify-center space-x-2 py-3 bg-gradient-to-r from-forensic-purple to-forensic-indigo hover:from-forensic-accent hover:to-forensic-purple text-white text-xs font-bold rounded-xl shadow-lg shadow-forensic-purple/20 transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50"
              >
                <Palette className="w-4 h-4" />
                <span>{isGenerating ? 'Synthesizing Sketch...' : 'Generate Initial Composite (v1)'}</span>
              </button>
            ) : (
              <>
                <button
                  onClick={() => handleGenerate(true)}
                  disabled={isGenerating}
                  className="flex-1 flex items-center justify-center space-x-1.5 py-2.5 bg-forensic-purple hover:bg-forensic-accent text-white text-xs font-bold rounded-xl shadow-lg shadow-forensic-purple/20 transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>{isGenerating ? 'Refining...' : `Refine to v${activeCase.sketches.length + 1}`}</span>
                </button>
                <button
                  onClick={() => handleGenerate(false)}
                  disabled={isGenerating}
                  title="Generate alternative variation from scratch"
                  className="px-3 py-2.5 bg-navy-800 hover:bg-navy-700 text-slate-300 text-xs font-medium rounded-xl border border-navy-700 transition-colors"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* ================= RIGHT PANEL: FORENSIC COMPOSITE CANVAS & INSPECTION ================= */}
      <div className="flex-1 flex flex-col h-full overflow-hidden bg-navy-950">
        {/* Canvas Toolbar */}
        <div className="p-3 border-b border-navy-800 bg-navy-900/60 backdrop-blur-md flex items-center justify-between shrink-0">
          {/* Inspection View Tools */}
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowGrid(!showGrid)}
              className={`p-2 rounded-lg text-xs flex items-center space-x-1.5 transition-colors ${
                showGrid ? 'bg-forensic-purple text-white' : 'bg-navy-800 text-slate-400 hover:text-white'
              }`}
              title="Toggle Facial Proportion Grid"
            >
              <Grid className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Cranial Grid</span>
            </button>

            <button
              onClick={() => setShowRuler(!showRuler)}
              className={`p-2 rounded-lg text-xs flex items-center space-x-1.5 transition-colors ${
                showRuler ? 'bg-forensic-purple text-white' : 'bg-navy-800 text-slate-400 hover:text-white'
              }`}
              title="Toggle Metric Centimeter Ruler"
            >
              <Ruler className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Metric Scale</span>
            </button>

            <button
              onClick={() => setShowBiometrics(!showBiometrics)}
              className={`p-2 rounded-lg text-xs flex items-center space-x-1.5 transition-colors ${
                showBiometrics ? 'bg-forensic-purple text-white' : 'bg-navy-800 text-slate-400 hover:text-white'
              }`}
              title="Toggle Biometric Metrics HUD"
            >
              <Compass className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Biometrics HUD</span>
            </button>
          </div>

          {/* Comparison Mode Toggles */}
          {activeCase.sketches.length > 1 && (
            <div className="flex items-center space-x-1 bg-navy-950 p-1 rounded-lg border border-navy-800 text-xs">
              <button
                onClick={() => setCompareMode('single')}
                className={`px-2.5 py-1 rounded font-medium transition-colors ${
                  compareMode === 'single' ? 'bg-forensic-purple text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                Single
              </button>
              <button
                onClick={() => setCompareMode('split')}
                className={`flex items-center space-x-1 px-2.5 py-1 rounded font-medium transition-colors ${
                  compareMode === 'split' ? 'bg-forensic-purple text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                <Split className="w-3 h-3" />
                <span>Split Slider</span>
              </button>
              <button
                onClick={() => setCompareMode('matrix')}
                className={`flex items-center space-x-1 px-2.5 py-1 rounded font-medium transition-colors ${
                  compareMode === 'matrix' ? 'bg-forensic-purple text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                <Layers className="w-3 h-3" />
                <span>Side-by-Side</span>
              </button>
            </div>
          )}

          {/* Export Actions */}
          {currentSketch && (
            <button
              onClick={() => setIsExportModalOpen(true)}
              className="flex items-center space-x-1.5 px-3.5 py-1.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold rounded-lg shadow-md transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export Dossier</span>
            </button>
          )}
        </div>

        {/* Canvas Display Viewport */}
        <div className="flex-1 relative flex items-center justify-center p-6 overflow-hidden forensic-canvas select-none">
          {!currentSketch ? (
            <div className="text-center max-w-sm p-6 bg-navy-900/80 border border-navy-800 rounded-2xl backdrop-blur-md">
              <div className="w-16 h-16 rounded-full bg-navy-800 border border-forensic-purple/40 flex items-center justify-center text-forensic-purple mx-auto mb-4">
                <Scan className="w-8 h-8 animate-pulse" />
              </div>
              <h3 className="text-sm font-bold text-white mb-1">Canvas Ready for Deposition</h3>
              <p className="text-xs text-slate-400 leading-relaxed mb-4">
                Enter eyewitness statement parameters on the left and trigger initial composite synthesis.
              </p>
              <button
                onClick={() => handleGenerate(false)}
                className="px-4 py-2 bg-forensic-purple hover:bg-forensic-accent text-white text-xs font-semibold rounded-lg shadow transition-colors"
              >
                Generate Composite v1
              </button>
            </div>
          ) : compareMode === 'split' && compareSketch ? (
            /* ================= SPLIT SCREEN SLIDER COMPARISON ================= */
            <div className="relative w-full max-w-lg aspect-square rounded-2xl overflow-hidden border-2 border-forensic-purple/60 shadow-2xl bg-charcoal-900">
              {/* Underneath image: Compare Sketch (e.g. v1) */}
              <img
                src={compareSketch.imageUrl}
                alt={`Composite v${compareSketch.versionNumber}`}
                className="absolute inset-0 w-full h-full object-cover filter contrast-105"
              />
              <div className="absolute top-3 left-3 px-2 py-1 bg-navy-950/80 backdrop-blur-sm border border-navy-700 text-[10px] font-mono text-slate-300 rounded z-10">
                v{compareSketch.versionNumber} (Original)
              </div>

              {/* Top clipped image: Current Sketch (e.g. v2) */}
              <div
                className="absolute inset-0 overflow-hidden"
                style={{ clipPath: `inset(0 0 0 ${splitPosition}%)` }}
              >
                <img
                  src={currentSketch.imageUrl}
                  alt={`Composite v${currentSketch.versionNumber}`}
                  className="absolute inset-0 w-full h-full object-cover filter contrast-105"
                />
                <div className="absolute top-3 right-3 px-2 py-1 bg-forensic-purple/90 backdrop-blur-sm border border-forensic-purple text-[10px] font-mono text-white rounded z-10">
                  v{currentSketch.versionNumber} (Refined)
                </div>
              </div>

              {/* Draggable Divider Bar */}
              <div
                className="absolute top-0 bottom-0 w-1 bg-white cursor-ew-resize shadow-2xl flex items-center justify-center z-20"
                style={{ left: `${splitPosition}%` }}
              >
                <div className="w-8 h-8 rounded-full bg-navy-900 border-2 border-white shadow-xl flex items-center justify-center text-white text-[10px] font-bold">
                  ↔
                </div>
              </div>

              {/* Hidden Range Input over canvas for touch/drag */}
              <input
                type="range"
                min="0"
                max="100"
                value={splitPosition}
                onChange={(e) => setSplitPosition(parseInt(e.target.value, 10))}
                className="absolute inset-0 opacity-0 cursor-ew-resize z-30 w-full h-full"
              />
            </div>
          ) : compareMode === 'matrix' && compareSketch ? (
            /* ================= SIDE BY SIDE MATRIX COMPARISON ================= */
            <div className="grid grid-cols-2 gap-4 w-full max-w-4xl max-h-[80vh]">
              {/* Left Version */}
              <div className="relative rounded-xl overflow-hidden border border-navy-700 bg-charcoal-900 shadow-xl">
                <img
                  src={compareSketch.imageUrl}
                  alt={`Composite v${compareSketch.versionNumber}`}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-3 left-3 px-2.5 py-1 bg-navy-950/80 backdrop-blur-sm border border-navy-700 text-xs font-mono text-slate-300 rounded">
                  v{compareSketch.versionNumber} (Baseline)
                </div>
                <div className="absolute bottom-3 left-3 right-3 p-2 bg-navy-950/80 backdrop-blur-sm rounded text-[11px] text-slate-300">
                  Confidence: {compareSketch.confidenceScore}% • Jaw: {compareSketch.biometricMetrics.jawAngleDegrees}°
                </div>
              </div>

              {/* Right Version */}
              <div className="relative rounded-xl overflow-hidden border-2 border-forensic-purple bg-charcoal-900 shadow-xl">
                <img
                  src={currentSketch.imageUrl}
                  alt={`Composite v${currentSketch.versionNumber}`}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-3 left-3 px-2.5 py-1 bg-forensic-purple text-xs font-mono text-white rounded">
                  v{currentSketch.versionNumber} (Active Refinement)
                </div>
                <div className="absolute bottom-3 left-3 right-3 p-2 bg-navy-950/80 backdrop-blur-sm rounded text-[11px] text-slate-300">
                  Confidence: {currentSketch.confidenceScore}% • Jaw: {currentSketch.biometricMetrics.jawAngleDegrees}°
                </div>
              </div>
            </div>
          ) : (
            /* ================= SINGLE COMPOSITE VIEW ================= */
            <div className="relative w-full max-w-lg aspect-square rounded-2xl overflow-hidden border border-forensic-purple/40 shadow-2xl bg-charcoal-900 group">
              <img
                src={currentSketch.imageUrl}
                alt={`Composite v${currentSketch.versionNumber}`}
                className="w-full h-full object-cover filter contrast-105"
              />

              {/* Rule of Thirds / Cranial Grid Overlay */}
              {showGrid && <div className="biometric-grid" />}

              {/* Metric Centimeter Ruler Scale */}
              {showRuler && (
                <div className="absolute left-3 top-3 bottom-3 w-8 border-r border-slate-400/40 flex flex-col justify-between py-2 text-[9px] font-mono text-slate-400 pointer-events-none select-none">
                  <span>0cm</span>
                  <span>5cm</span>
                  <span>10cm</span>
                  <span>15cm</span>
                  <span>20cm</span>
                </div>
              )}

              {/* Biometrics HUD Box */}
              {showBiometrics && (
                <div className="absolute top-3 right-3 p-2.5 bg-navy-950/85 backdrop-blur-md border border-navy-700/80 rounded-xl text-[10px] font-mono text-slate-300 space-y-1 shadow-lg pointer-events-none">
                  <div className="flex justify-between space-x-3 text-forensic-cyan font-bold border-b border-navy-800 pb-1">
                    <span>CRANIAL BIOMETRICS</span>
                    <span>v{currentSketch.versionNumber}</span>
                  </div>
                  <div className="flex justify-between space-x-3">
                    <span className="text-slate-400">Cranial Ratio:</span>
                    <span>{currentSketch.biometricMetrics.cranialRatio}</span>
                  </div>
                  <div className="flex justify-between space-x-3">
                    <span className="text-slate-400">Interpupillary:</span>
                    <span>{currentSketch.biometricMetrics.interpupillaryDistance} mm</span>
                  </div>
                  <div className="flex justify-between space-x-3">
                    <span className="text-slate-400">Jaw Angle:</span>
                    <span>{currentSketch.biometricMetrics.jawAngleDegrees}°</span>
                  </div>
                  <div className="flex justify-between space-x-3">
                    <span className="text-slate-400">Facial Symmetry:</span>
                    <span className="text-emerald-400 font-bold">{currentSketch.biometricMetrics.symmetryScore}%</span>
                  </div>
                </div>
              )}

              {/* Mandatory Responsible AI Canvas Watermark */}
              <div className="absolute bottom-3 left-3 right-3 px-3 py-1.5 bg-navy-950/80 backdrop-blur-sm border border-navy-800 rounded-lg flex items-center justify-between text-[10px] text-slate-400 font-mono">
                <span className="text-amber-400">★ AI-GENERATED APPROXIMATION</span>
                <span>{currentSketch.provider}</span>
              </div>
            </div>
          )}
        </div>

        {/* Filmstrip Version Reel Footer */}
        {activeCase.sketches.length > 0 && (
          <div className="p-3 border-t border-navy-800 bg-navy-900/80 backdrop-blur-sm shrink-0">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2">
                <History className="w-3.5 h-3.5 text-forensic-purple" />
                <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
                  Iteration Filmstrip ({activeCase.sketches.length} Versions)
                </span>
              </div>
              {currentSketch && activeCase.primarySketchId !== currentSketch.id && (
                <button
                  onClick={() => handleSetPrimary(currentSketch.id)}
                  className="flex items-center space-x-1 text-xs font-medium text-emerald-400 hover:text-emerald-300 transition-colors"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Set Active v{currentSketch.versionNumber} as Primary Composite</span>
                </button>
              )}
            </div>

            {/* Reel Thumbnails */}
            <div className="flex items-center space-x-3 overflow-x-auto pb-1">
              {activeCase.sketches.map((s) => {
                const isSelected = s.id === selectedVersionId;
                const isPrimary = s.id === activeCase.primarySketchId;

                return (
                  <div
                    key={s.id}
                    onClick={() => setSelectedVersionId(s.id)}
                    className={`relative w-20 h-20 rounded-xl overflow-hidden shrink-0 cursor-pointer border-2 transition-all ${
                      isSelected
                        ? 'border-forensic-purple shadow-lg shadow-forensic-purple/20 scale-105'
                        : 'border-navy-700 opacity-60 hover:opacity-100'
                    }`}
                  >
                    <img src={s.imageUrl} alt={`v${s.versionNumber}`} className="w-full h-full object-cover" />
                    <div className="absolute top-1 left-1 px-1.5 py-0.5 bg-navy-950/80 text-[9px] font-mono font-bold text-white rounded">
                      v{s.versionNumber}
                    </div>
                    {isPrimary && (
                      <div className="absolute bottom-1 right-1 px-1 bg-emerald-500 text-white rounded text-[8px] font-bold">
                        PRIMARY
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Export Evidence Dossier Modal */}
      {currentSketch && (
        <ExportModal
          isOpen={isExportModalOpen}
          onClose={() => setIsExportModalOpen(false)}
          caseItem={activeCase}
          sketch={currentSketch}
          onNotify={onNotify}
        />
      )}
    </div>
  );
};
