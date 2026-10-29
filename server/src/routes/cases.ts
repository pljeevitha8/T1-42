import { Router, Response } from 'express';
import { z } from 'zod';
import { store } from '../db/store.js';
import { authenticate, AuthenticatedRequest, requireRole } from '../middleware/auth.js';
import { Case, CasePriority, CaseStatus } from '../types/index.js';

const router = Router();

const CaseCreateSchema = z.object({
  title: z.string().min(3),
  incidentType: z.string().min(2),
  incidentLocation: z.string().min(2),
  incidentDate: z.string().min(2),
  witnessName: z.string().min(2),
  witnessContact: z.string().optional().default(''),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']).default('MEDIUM'),
  witnessStatement: z.string().min(5),
  notes: z.string().optional().default(''),
});

// List cases with search & filter
router.get('/', authenticate, (req: AuthenticatedRequest, res: Response): void => {
  const { q, status, priority } = req.query;
  let cases = store.getCases();

  if (q && typeof q === 'string') {
    const searchLower = q.toLowerCase();
    cases = cases.filter(
      (c) =>
        c.id.toLowerCase().includes(searchLower) ||
        c.title.toLowerCase().includes(searchLower) ||
        c.witnessName.toLowerCase().includes(searchLower) ||
        c.incidentType.toLowerCase().includes(searchLower) ||
        c.witnessStatement.toLowerCase().includes(searchLower)
    );
  }

  if (status && typeof status === 'string') {
    cases = cases.filter((c) => c.status === status);
  }

  if (priority && typeof priority === 'string') {
    cases = cases.filter((c) => c.priority === priority);
  }

  res.json({ cases });
});

// Get case by ID
router.get('/:id', authenticate, (req: AuthenticatedRequest, res: Response): void => {
  const caseId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const caseItem = store.getCaseById(caseId);
  if (!caseItem) {
    res.status(404).json({ error: `Case '${caseId}' not found.` });
    return;
  }

  res.json({ case: caseItem });
});

// Create new Case
router.post('/', authenticate, requireRole(['admin', 'investigator']), (req: AuthenticatedRequest, res: Response): void => {
  const parseResult = CaseCreateSchema.safeParse(req.body);
  if (!parseResult.success) {
    res.status(400).json({ error: 'Validation failed', details: parseResult.error.flatten() });
    return;
  }

  const user = req.user!;
  const data = parseResult.data;
  const year = new Date().getFullYear();
  const randomSuffix = Math.floor(1000 + Math.random() * 9000);
  const caseId = `CASE-${year}-${randomSuffix}`;

  const initialFeatures = req.body.features || {
    gender: 'Male',
    ageGroup: '26-35',
    faceShape: 'Oval',
    skinTone: 'Medium Tan',
    eyesShape: 'Almond',
    eyeColor: 'Dark',
    eyebrows: 'Straight',
    nose: 'Straight',
    jawline: 'Square Chiseled',
    hairstyle: 'Short Cropped',
    hairColor: 'Dark Brown',
    facialHair: 'Clean Shaven',
    distinctiveFeatures: [],
    accessories: [],
    refinements: {
      ageOffset: 0,
      jawWidth: 50,
      eyeNarrowness: 50,
      noseProminence: 50,
      stubbleDensity: 50,
      cheekHollow: 50,
    },
  };

  const newCase: Case = {
    id: caseId,
    title: data.title,
    incidentType: data.incidentType,
    incidentLocation: data.incidentLocation,
    incidentDate: data.incidentDate,
    witnessName: data.witnessName,
    witnessContact: data.witnessContact,
    investigatorId: user.id,
    investigatorName: user.name,
    status: 'ACTIVE',
    priority: data.priority as CasePriority,
    witnessStatement: data.witnessStatement,
    features: initialFeatures,
    sketches: [],
    primarySketchId: null,
    notes: data.notes,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const created = store.createCase(newCase);

  store.addAuditLog({
    userId: user.id,
    userName: user.name,
    userRole: user.role,
    action: 'CASE_CREATE',
    caseId: created.id,
    details: `Initiated case dossier: ${created.title} [Type: ${created.incidentType}]`,
    ipAddress: req.ip || '127.0.0.1',
  });

  res.status(201).json({ case: created });
});

// Update case
router.patch('/:id', authenticate, requireRole(['admin', 'investigator']), (req: AuthenticatedRequest, res: Response): void => {
  const user = req.user!;
  const caseId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const existing = store.getCaseById(caseId);

  if (!existing) {
    res.status(404).json({ error: `Case '${caseId}' not found.` });
    return;
  }

  const updated = store.updateCase(caseId, req.body);

  store.addAuditLog({
    userId: user.id,
    userName: user.name,
    userRole: user.role,
    action: 'CASE_UPDATE',
    caseId: existing.id,
    details: `Updated case parameters / status to ${req.body.status || existing.status}`,
    ipAddress: req.ip || '127.0.0.1',
  });

  res.json({ case: updated });
});

// Delete case (Admin only)
router.delete('/:id', authenticate, requireRole(['admin']), (req: AuthenticatedRequest, res: Response): void => {
  const user = req.user!;
  const caseId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const existing = store.getCaseById(caseId);

  if (!existing) {
    res.status(404).json({ error: `Case '${caseId}' not found.` });
    return;
  }

  store.deleteCase(caseId);

  store.addAuditLog({
    userId: user.id,
    userName: user.name,
    userRole: user.role,
    action: 'CASE_DELETE',
    caseId: existing.id,
    details: `Archived/Deleted case dossier: ${existing.title}`,
    ipAddress: req.ip || '127.0.0.1',
  });

  res.json({ success: true, message: `Case ${caseId} deleted successfully.` });
});

export default router;
