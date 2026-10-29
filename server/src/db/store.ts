import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import { User, Case, AuditLog, AIProviderConfig } from '../types/index.js';

interface DatabaseSchema {
  users: User[];
  cases: Case[];
  auditLogs: AuditLog[];
  config: AIProviderConfig;
}

const DATA_DIR = path.resolve(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'store.json');

// Default initial state
const getInitialData = (): DatabaseSchema => {
  const salt = bcrypt.genSaltSync(10);
  const defaultPasswordHash = bcrypt.hashSync('Forensics2026!', salt);

  const users: User[] = [
    {
      id: 'USR-001',
      email: 'lead.investigator@metro-forensics.gov',
      name: 'Dr. Marcus Vance',
      badgeNumber: 'B-8492',
      department: 'Major Crimes & Forensic Imaging Division',
      role: 'admin',
      passwordHash: defaultPasswordHash,
    },
    {
      id: 'USR-002',
      email: 'artist.chen@metro-forensics.gov',
      name: 'Elena Rostova',
      badgeNumber: 'FA-1044',
      department: 'Forensic Art & Facial Reconstruction Unit',
      role: 'investigator',
      passwordHash: defaultPasswordHash,
    },
    {
      id: 'USR-003',
      email: 'reviewer.guest@metro-forensics.gov',
      name: 'Det. Liam Hayes',
      badgeNumber: 'D-3180',
      department: 'Special Investigations Bureau',
      role: 'reviewer',
      passwordHash: defaultPasswordHash,
    },
  ];

  // Pre-configured realistic forensic cases with versions
  const cases: Case[] = [
    {
      id: 'CASE-2026-0814',
      title: 'Downtown Metropolitan Vault Burglary — Suspect "Apex"',
      incidentType: 'Armed Burglary & Grand Larceny',
      incidentLocation: 'Vault 4, 400 Financial Plaza, Metro City',
      incidentDate: '2026-10-24 02:45',
      witnessName: 'Julian Sterling (Night Security Officer)',
      witnessContact: '555-019-4821',
      investigatorId: 'USR-001',
      investigatorName: 'Dr. Marcus Vance',
      status: 'ACTIVE',
      priority: 'CRITICAL',
      witnessStatement:
        'Suspect was a male, late 30s, around 6ft tall. Extremely sharp angular jawline, sunken cheeks with several days of dark stubble. He had intense, deep-set hooded dark eyes with thick straight eyebrows. Hair was short cropped, dark brown, slightly receding at temples. He had a distinct horizontal scar through his left eyebrow.',
      features: {
        gender: 'Male',
        ageGroup: '36-45',
        faceShape: 'Diamond',
        skinTone: 'Olive',
        eyesShape: 'Deep-set',
        eyeColor: 'Dark',
        eyebrows: 'Thick Bushy',
        nose: 'Aquiline / Hooked',
        jawline: 'Sharp Angular',
        hairstyle: 'Short Cropped',
        hairColor: 'Dark Brown',
        facialHair: '5 O\'Clock Shadow',
        distinctiveFeatures: ['Scar over left eyebrow', 'Hollow cheeks'],
        accessories: ['None'],
        refinements: {
          ageOffset: 2,
          jawWidth: 68,
          eyeNarrowness: 72,
          noseProminence: 65,
          stubbleDensity: 75,
          cheekHollow: 80,
        },
      },
      sketches: [
        {
          id: 'SKT-0814-V1',
          versionNumber: 1,
          imageUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&auto=format&fit=crop&q=80',
          prompt:
            'Forensic facial composite pencil sketch, realistic graphite drawing on parchment, male mid 30s, sharp angular jawline, deep hooded eyes, thick straight eyebrows, short cropped dark hair, subtle scar over left eyebrow, dark stubble, police forensic artist sketch, neutral lighting, frontal mugshot view, cross-hatching, highly detailed forensic illustration',
          negativePrompt:
            'photograph, 3d render, anime, vibrant colors, blurry, smiling, cartoon, deformed, makeup',
          modelUsed: 'ForensicSketch-XL (Graphite Core)',
          provider: 'pollinations',
          confidenceScore: 86,
          refinementNotes: 'Initial composite sketch generated from security officer testimony.',
          createdAt: '2026-10-24T04:15:00Z',
          createdBy: 'Dr. Marcus Vance',
          featuresSnapshot: {
            gender: 'Male',
            ageGroup: '36-45',
            faceShape: 'Diamond',
            skinTone: 'Olive',
            eyesShape: 'Deep-set',
            eyeColor: 'Dark',
            eyebrows: 'Thick Bushy',
            nose: 'Aquiline / Hooked',
            jawline: 'Sharp Angular',
            hairstyle: 'Short Cropped',
            hairColor: 'Dark Brown',
            facialHair: '5 O\'Clock Shadow',
            distinctiveFeatures: ['Scar over left eyebrow'],
            accessories: [],
            refinements: {
              ageOffset: 0,
              jawWidth: 50,
              eyeNarrowness: 50,
              noseProminence: 50,
              stubbleDensity: 50,
              cheekHollow: 50,
            },
          },
          biometricMetrics: {
            cranialRatio: 1.34,
            interpupillaryDistance: 64.2,
            jawAngleDegrees: 112.5,
            symmetryScore: 94.1,
          },
        },
        {
          id: 'SKT-0814-V2',
          versionNumber: 2,
          imageUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=800&auto=format&fit=crop&q=80',
          prompt:
            'Forensic facial composite pencil sketch, detailed graphite portrait, male 38 years old, sharpened angular jawline, deeper cheek hollows, heavier 5 o clock shadow stubble, pronounced scar slicing left eyebrow, forensic police artist drawing, charcoal cross-hatching, high contrast monochrome, anatomical precision',
          negativePrompt: 'photograph, cartoon, color, deformed',
          modelUsed: 'ForensicSketch-XL (Graphite Core)',
          provider: 'pollinations',
          confidenceScore: 93,
          refinementNotes: 'Witness requested sharper jawline (+18%), intensified cheek hollows, and heavier stubble.',
          createdAt: '2026-10-24T05:30:00Z',
          createdBy: 'Elena Rostova',
          featuresSnapshot: {
            gender: 'Male',
            ageGroup: '36-45',
            faceShape: 'Diamond',
            skinTone: 'Olive',
            eyesShape: 'Deep-set',
            eyeColor: 'Dark',
            eyebrows: 'Thick Bushy',
            nose: 'Aquiline / Hooked',
            jawline: 'Sharp Angular',
            hairstyle: 'Short Cropped',
            hairColor: 'Dark Brown',
            facialHair: '5 O\'Clock Shadow',
            distinctiveFeatures: ['Scar over left eyebrow', 'Hollow cheeks'],
            accessories: [],
            refinements: {
              ageOffset: 2,
              jawWidth: 68,
              eyeNarrowness: 72,
              noseProminence: 65,
              stubbleDensity: 75,
              cheekHollow: 80,
            },
          },
          biometricMetrics: {
            cranialRatio: 1.35,
            interpupillaryDistance: 64.0,
            jawAngleDegrees: 109.8,
            symmetryScore: 95.8,
          },
        },
      ],
      primarySketchId: 'SKT-0814-V2',
      notes: 'Second iteration verified by witness with 90%+ recognition confidence. Authorized for investigative lead bulletins.',
      createdAt: '2026-10-24T03:30:00Z',
      updatedAt: '2026-10-24T05:35:00Z',
    },
    {
      id: 'CASE-2026-0922',
      title: 'Harbor Arts District Courier Interception — Suspect "Vesper"',
      incidentType: 'Armed Hijacking & High-Value Transit Robbery',
      incidentLocation: 'Pier 19 Transit Tunnel, North Bay',
      incidentDate: '2026-10-26 21:15',
      witnessName: 'Rachel Navarro (Transport Logistics Driver)',
      witnessContact: '555-018-9923',
      investigatorId: 'USR-002',
      investigatorName: 'Elena Rostova',
      status: 'ACTIVE',
      priority: 'HIGH',
      witnessStatement:
        'Suspect was an athletic female, late 20s to early 30s. Very prominent high cheekbones, square defined jaw, piercing almond-shaped eyes with arched narrow eyebrows. Dark hair slicked back tightly into a bun or ponytail. She wore thin wire-framed dark tinted glasses and a high-collar ballistic windbreaker.',
      features: {
        gender: 'Female',
        ageGroup: '26-35',
        faceShape: 'Square',
        skinTone: 'Fair / Pale',
        eyesShape: 'Almond',
        eyeColor: 'Hazel',
        eyebrows: 'Angular High Arch',
        nose: 'Straight',
        jawline: 'Square Chiseled',
        hairstyle: 'Long Slicked',
        hairColor: 'Black',
        facialHair: 'Clean Shaven',
        distinctiveFeatures: ['High prominent cheekbones', 'Small mole right upper lip'],
        accessories: ['Wire-rim spectacles'],
        refinements: {
          ageOffset: -1,
          jawWidth: 62,
          eyeNarrowness: 60,
          noseProminence: 45,
          stubbleDensity: 0,
          cheekHollow: 65,
        },
      },
      sketches: [
        {
          id: 'SKT-0922-V1',
          versionNumber: 1,
          imageUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800&auto=format&fit=crop&q=80',
          prompt:
            'Forensic facial composite pencil sketch, female late 20s, square structured jaw, prominent high cheekbones, almond shaped eyes, arched eyebrows, sleek hair pulled back, wire-rim glasses, graphite pencil texture on paper, police forensic artist sketch, neutral gaze, cross-hatching shading',
          negativePrompt: 'photograph, vibrant colors, cartoon, makeup, smiling',
          modelUsed: 'ForensicSketch-XL (Graphite Core)',
          provider: 'pollinations',
          confidenceScore: 89,
          refinementNotes: 'Composite generated from courier driver interview.',
          createdAt: '2026-10-26T22:10:00Z',
          createdBy: 'Elena Rostova',
          featuresSnapshot: {
            gender: 'Female',
            ageGroup: '26-35',
            faceShape: 'Square',
            skinTone: 'Fair / Pale',
            eyesShape: 'Almond',
            eyeColor: 'Hazel',
            eyebrows: 'Angular High Arch',
            nose: 'Straight',
            jawline: 'Square Chiseled',
            hairstyle: 'Long Slicked',
            hairColor: 'Black',
            facialHair: 'Clean Shaven',
            distinctiveFeatures: ['High prominent cheekbones'],
            accessories: ['Wire-rim spectacles'],
            refinements: {
              ageOffset: 0,
              jawWidth: 50,
              eyeNarrowness: 50,
              noseProminence: 50,
              stubbleDensity: 0,
              cheekHollow: 50,
            },
          },
          biometricMetrics: {
            cranialRatio: 1.28,
            interpupillaryDistance: 61.8,
            jawAngleDegrees: 118.2,
            symmetryScore: 96.4,
          },
        },
      ],
      primarySketchId: 'SKT-0922-V1',
      notes: 'Initial composite drafted within 1 hour of incident. Matches description from security checkpoint camera 4.',
      createdAt: '2026-10-26T21:45:00Z',
      updatedAt: '2026-10-26T22:15:00Z',
    },
    {
      id: 'CASE-2026-1005',
      title: 'University Research Lab Cyber Infiltration — Suspect "Cipher"',
      incidentType: 'Industrial Espionage & System Sabotage',
      incidentLocation: 'Bio-Informatics Wing 3, Tech Campus',
      incidentDate: '2026-10-28 01:20',
      witnessName: 'Prof. David Krum (Senior Fellow)',
      witnessContact: '555-014-7719',
      investigatorId: 'USR-001',
      investigatorName: 'Dr. Marcus Vance',
      status: 'REVIEW',
      priority: 'HIGH',
      witnessStatement:
        'Male suspect, approximately 45 to 50 years old. Heavily weathered face with deep crow\'s feet around eyes and pronounced nasolabial folds. Crooked nose, likely broken in the past. Full salt-and-pepper gray beard trimmed short, receding hairline. Wore a dark knit beanie.',
      features: {
        gender: 'Male',
        ageGroup: '46-55',
        faceShape: 'Oblong',
        skinTone: 'Weathered',
        eyesShape: 'Hooded',
        eyeColor: 'Brown',
        eyebrows: 'Thick Bushy',
        nose: 'Broken / Asymmetric',
        jawline: 'Square Chiseled',
        hairstyle: 'Receding Hairline',
        hairColor: 'Gray / Salt & Pepper',
        facialHair: 'Full Beard',
        distinctiveFeatures: ['Broken / crooked nose bridge', 'Deep crow\'s feet', 'Forehead furrows'],
        accessories: ['Knit beanie'],
        refinements: {
          ageOffset: 3,
          jawWidth: 55,
          eyeNarrowness: 65,
          noseProminence: 70,
          stubbleDensity: 85,
          cheekHollow: 60,
        },
      },
      sketches: [
        {
          id: 'SKT-1005-V1',
          versionNumber: 1,
          imageUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=800&auto=format&fit=crop&q=80',
          prompt:
            'Forensic facial composite pencil sketch, older male 50 years old, weathered face, deep forehead wrinkles, crooked broken nose bridge, hooded tired eyes, salt and pepper full trimmed beard, knit watch beanie cap, charcoal graphite forensic drawing, police sketch artist style, forensic grid lines',
          negativePrompt: 'photograph, smooth skin, cartoon, color',
          modelUsed: 'ForensicSketch-XL (Graphite Core)',
          provider: 'pollinations',
          confidenceScore: 91,
          refinementNotes: 'Generated based on Prof. Krum detailed eyewitness account.',
          createdAt: '2026-10-28T02:30:00Z',
          createdBy: 'Dr. Marcus Vance',
          featuresSnapshot: {
            gender: 'Male',
            ageGroup: '46-55',
            faceShape: 'Oblong',
            skinTone: 'Weathered',
            eyesShape: 'Hooded',
            eyeColor: 'Brown',
            eyebrows: 'Thick Bushy',
            nose: 'Broken / Asymmetric',
            jawline: 'Square Chiseled',
            hairstyle: 'Receding Hairline',
            hairColor: 'Gray / Salt & Pepper',
            facialHair: 'Full Beard',
            distinctiveFeatures: ['Broken / crooked nose bridge', 'Deep crow\'s feet'],
            accessories: ['Knit beanie'],
            refinements: {
              ageOffset: 3,
              jawWidth: 55,
              eyeNarrowness: 65,
              noseProminence: 70,
              stubbleDensity: 85,
              cheekHollow: 60,
            },
          },
          biometricMetrics: {
            cranialRatio: 1.41,
            interpupillaryDistance: 65.5,
            jawAngleDegrees: 114.0,
            symmetryScore: 88.5,
          },
        },
      ],
      primarySketchId: 'SKT-1005-V1',
      notes: 'Under review by federal counter-espionage task force. Facial geometry forwarded to transit surveillance team.',
      createdAt: '2026-10-28T01:50:00Z',
      updatedAt: '2026-10-28T02:35:00Z',
    },
  ];

  // Pre-populated tamper-evident audit logs with chained SHA-256 hashes
  const auditLogs: AuditLog[] = [];

  const addSeedLog = (
    timestamp: string,
    userId: string,
    userName: string,
    userRole: 'admin' | 'investigator' | 'reviewer',
    action: AuditLog['action'],
    details: string,
    caseId?: string
  ) => {
    const prevHash = auditLogs.length > 0 ? auditLogs[auditLogs.length - 1].integrityHash : 'GENESIS_FORENSIC_ROOT_BLOCK';
    const logData = `${timestamp}|${userId}|${action}|${caseId || ''}|${details}|${prevHash}`;
    const hash = crypto.createHash('sha256').update(logData).digest('hex');

    auditLogs.push({
      id: `AUD-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`,
      timestamp,
      userId,
      userName,
      userRole,
      action,
      caseId,
      details,
      ipAddress: '192.168.1.104',
      integrityHash: hash,
    });
  };

  addSeedLog('2026-10-24T03:30:12Z', 'USR-001', 'Dr. Marcus Vance', 'admin', 'LOGIN_SUCCESS', 'Investigator authenticated with badge B-8492');
  addSeedLog('2026-10-24T03:31:05Z', 'USR-001', 'Dr. Marcus Vance', 'admin', 'CASE_CREATE', 'Created Case CASE-2026-0814: Downtown Vault Burglary', 'CASE-2026-0814');
  addSeedLog('2026-10-24T04:15:22Z', 'USR-001', 'Dr. Marcus Vance', 'admin', 'SKETCH_GENERATE', 'Generated Composite Sketch v1 using ForensicSketch-XL Engine', 'CASE-2026-0814');
  addSeedLog('2026-10-24T05:25:10Z', 'USR-002', 'Elena Rostova', 'investigator', 'LOGIN_SUCCESS', 'Forensic Artist Elena Rostova session started');
  addSeedLog('2026-10-24T05:30:45Z', 'USR-002', 'Elena Rostova', 'investigator', 'SKETCH_REFINE', 'Refined Composite to v2: Jawline sharpened, stubble increased, scar intensified', 'CASE-2026-0814');
  addSeedLog('2026-10-24T05:35:12Z', 'USR-002', 'Elena Rostova', 'investigator', 'PRIMARY_SELECT', 'Selected Sketch v2 as Primary Composite', 'CASE-2026-0814');
  addSeedLog('2026-10-24T05:40:00Z', 'USR-002', 'Elena Rostova', 'investigator', 'SKETCH_EXPORT', 'Exported High-Resolution Evidence Dossier for CASE-2026-0814', 'CASE-2026-0814');
  addSeedLog('2026-10-26T21:45:10Z', 'USR-002', 'Elena Rostova', 'investigator', 'CASE_CREATE', 'Created Case CASE-2026-0922: Harbor Arts District Courier Interception', 'CASE-2026-0922');
  addSeedLog('2026-10-26T22:10:30Z', 'USR-002', 'Elena Rostova', 'investigator', 'SKETCH_GENERATE', 'Generated Composite Sketch v1 for CASE-2026-0922', 'CASE-2026-0922');
  addSeedLog('2026-10-28T01:50:22Z', 'USR-001', 'Dr. Marcus Vance', 'admin', 'CASE_CREATE', 'Created Case CASE-2026-1005: Research Lab Espionage', 'CASE-2026-1005');
  addSeedLog('2026-10-28T02:30:15Z', 'USR-001', 'Dr. Marcus Vance', 'admin', 'SKETCH_GENERATE', 'Generated Composite Sketch v1 for CASE-2026-1005', 'CASE-2026-1005');

  const config: AIProviderConfig = {
    provider: (process.env.DEFAULT_AI_PROVIDER as any) || 'pollinations',
    apiKey: process.env.AI_API_KEY || '',
    modelName: process.env.AI_MODEL_NAME || 'flux',
  };

  return { users, cases, auditLogs, config };
};

class Store {
  private data: DatabaseSchema;

  constructor() {
    this.ensureDirectory();
    this.data = this.load();
  }

  private ensureDirectory() {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
  }

  private load(): DatabaseSchema {
    try {
      if (fs.existsSync(DB_FILE)) {
        const fileContent = fs.readFileSync(DB_FILE, 'utf-8');
        const parsed = JSON.parse(fileContent);
        if (parsed.users && parsed.cases && parsed.auditLogs) {
          return parsed;
        }
      }
    } catch (err) {
      console.error('[Store] Failed to parse existing database file, reinitializing:', err);
    }

    const initial = getInitialData();
    this.saveDirect(initial);
    return initial;
  }

  private saveDirect(dataToSave: DatabaseSchema) {
    try {
      this.ensureDirectory();
      fs.writeFileSync(DB_FILE, JSON.stringify(dataToSave, null, 2), 'utf-8');
    } catch (err) {
      console.error('[Store] Error writing database file:', err);
    }
  }

  private save() {
    this.saveDirect(this.data);
  }

  // Users
  getUsers(): User[] {
    return this.data.users;
  }

  getUserById(id: string): User | undefined {
    return this.data.users.find((u) => u.id === id);
  }

  getUserByEmail(email: string): User | undefined {
    return this.data.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
  }

  addUser(user: User): void {
    this.data.users.push(user);
    this.save();
  }

  // Cases
  getCases(): Case[] {
    return [...this.data.cases].sort(
      (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    );
  }

  getCaseById(id: string): Case | undefined {
    return this.data.cases.find((c) => c.id === id);
  }

  createCase(newCase: Case): Case {
    this.data.cases.unshift(newCase);
    this.save();
    return newCase;
  }

  updateCase(id: string, updates: Partial<Case>): Case | undefined {
    const index = this.data.cases.findIndex((c) => c.id === id);
    if (index === -1) return undefined;

    this.data.cases[index] = {
      ...this.data.cases[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    this.save();
    return this.data.cases[index];
  }

  deleteCase(id: string): boolean {
    const initialLen = this.data.cases.length;
    this.data.cases = this.data.cases.filter((c) => c.id !== id);
    if (this.data.cases.length !== initialLen) {
      this.save();
      return true;
    }
    return false;
  }

  // Audit Logs
  getAuditLogs(): AuditLog[] {
    return [...this.data.auditLogs].sort(
      (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
  }

  addAuditLog(log: Omit<AuditLog, 'id' | 'timestamp' | 'integrityHash'>): AuditLog {
    const timestamp = new Date().toISOString();
    const prevHash =
      this.data.auditLogs.length > 0
        ? this.data.auditLogs[this.data.auditLogs.length - 1].integrityHash
        : 'GENESIS_FORENSIC_ROOT_BLOCK';

    const logData = `${timestamp}|${log.userId}|${log.action}|${log.caseId || ''}|${log.details}|${prevHash}`;
    const integrityHash = crypto.createHash('sha256').update(logData).digest('hex');

    const entry: AuditLog = {
      id: `AUD-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`,
      timestamp,
      integrityHash,
      ...log,
    };

    this.data.auditLogs.push(entry);
    this.save();
    return entry;
  }

  // AI Config
  getConfig(): AIProviderConfig {
    return this.data.config;
  }

  updateConfig(updates: Partial<AIProviderConfig>): AIProviderConfig {
    this.data.config = {
      ...this.data.config,
      ...updates,
    };
    this.save();
    return this.data.config;
  }
}

export const store = new Store();
