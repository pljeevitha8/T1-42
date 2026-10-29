import { Router, Response } from 'express';
import { z } from 'zod';
import { store } from '../db/store.js';
import { authenticate, AuthenticatedRequest, requireRole } from '../middleware/auth.js';
import { aiService } from '../services/aiService.js';
import { FacialFeatures } from '../types/index.js';

const router = Router();

const GenerateSchema = z.object({
  caseId: z.string(),
  features: z.any(),
  witnessStatement: z.string().optional(),
});

const RefineSchema = z.object({
  caseId: z.string(),
  features: z.any(),
  refinementNotes: z.string().min(2),
  previousSketchId: z.string().optional(),
});

// Auto-extract features from unstructured witness text
router.post('/parse-statement', authenticate, (req: AuthenticatedRequest, res: Response): void => {
  const { statement } = req.body;
  if (!statement || typeof statement !== 'string' || statement.trim().length === 0) {
    res.status(400).json({ error: 'Statement text is required.' });
    return;
  }

  const extracted = aiService.extractFeaturesFromStatement(statement);
  res.json({ extracted });
});

// Generate initial sketch (v1)
router.post('/generate', authenticate, requireRole(['admin', 'investigator']), async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const parseResult = GenerateSchema.safeParse(req.body);
  if (!parseResult.success) {
    res.status(400).json({ error: 'Validation failed', details: parseResult.error.flatten() });
    return;
  }

  const { caseId, features, witnessStatement } = parseResult.data;
  const caseItem = store.getCaseById(caseId);

  if (!caseItem) {
    res.status(404).json({ error: `Case '${caseId}' not found.` });
    return;
  }

  const user = req.user!;
  const versionNumber = (caseItem.sketches?.length || 0) + 1;

  try {
    const sketchVersion = await aiService.generateCompositeSketch(
      features as FacialFeatures,
      versionNumber,
      user.name,
      witnessStatement || caseItem.witnessStatement
    );

    // Update case with new sketch and features
    const updatedSketches = [...(caseItem.sketches || []), sketchVersion];
    const primaryId = caseItem.primarySketchId || sketchVersion.id;

    const updatedCase = store.updateCase(caseId, {
      features: features as FacialFeatures,
      sketches: updatedSketches,
      primarySketchId: primaryId,
      updatedAt: new Date().toISOString(),
    });

    store.addAuditLog({
      userId: user.id,
      userName: user.name,
      userRole: user.role,
      action: 'SKETCH_GENERATE',
      caseId: caseItem.id,
      details: `Generated Composite Sketch Version ${sketchVersion.versionNumber} [Model: ${sketchVersion.modelUsed}, Provider: ${sketchVersion.provider}]`,
      ipAddress: req.ip || '127.0.0.1',
    });

    res.status(201).json({
      sketch: sketchVersion,
      case: updatedCase,
    });
  } catch (err: any) {
    console.error('[Sketches] Generation error:', err);
    res.status(500).json({
      error: 'AI Sketch Generation failed.',
      message: err.message || 'Unknown processing error',
    });
  }
});

// Iterative refinement (v2, v3, etc.)
router.post('/refine', authenticate, requireRole(['admin', 'investigator']), async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const parseResult = RefineSchema.safeParse(req.body);
  if (!parseResult.success) {
    res.status(400).json({ error: 'Validation failed', details: parseResult.error.flatten() });
    return;
  }

  const { caseId, features, refinementNotes, previousSketchId } = parseResult.data;
  const caseItem = store.getCaseById(caseId);

  if (!caseItem) {
    res.status(404).json({ error: `Case '${caseId}' not found.` });
    return;
  }

  const user = req.user!;
  const versionNumber = (caseItem.sketches?.length || 0) + 1;

  try {
    const sketchVersion = await aiService.generateCompositeSketch(
      features as FacialFeatures,
      versionNumber,
      user.name,
      caseItem.witnessStatement,
      refinementNotes
    );

    const updatedSketches = [...(caseItem.sketches || []), sketchVersion];

    const updatedCase = store.updateCase(caseId, {
      features: features as FacialFeatures,
      sketches: updatedSketches,
      primarySketchId: sketchVersion.id, // latest refinement becomes primary automatically
      updatedAt: new Date().toISOString(),
    });

    store.addAuditLog({
      userId: user.id,
      userName: user.name,
      userRole: user.role,
      action: 'SKETCH_REFINE',
      caseId: caseItem.id,
      details: `Refined composite to v${versionNumber} [Notes: "${refinementNotes.slice(0, 80)}"]`,
      ipAddress: req.ip || '127.0.0.1',
    });

    res.status(201).json({
      sketch: sketchVersion,
      case: updatedCase,
    });
  } catch (err: any) {
    console.error('[Sketches] Refinement error:', err);
    res.status(500).json({
      error: 'Refinement generation failed.',
      message: err.message || 'Unknown processing error',
    });
  }
});

// Set primary composite version
router.post('/set-primary', authenticate, requireRole(['admin', 'investigator']), (req: AuthenticatedRequest, res: Response): void => {
  const { caseId, sketchId } = req.body;
  const caseItem = store.getCaseById(caseId);

  if (!caseItem) {
    res.status(404).json({ error: `Case '${caseId}' not found.` });
    return;
  }

  const targetSketch = caseItem.sketches.find((s) => s.id === sketchId);
  if (!targetSketch) {
    res.status(404).json({ error: `Sketch version '${sketchId}' not found in case.` });
    return;
  }

  const updatedCase = store.updateCase(caseId, {
    primarySketchId: sketchId,
  });

  const user = req.user!;
  store.addAuditLog({
    userId: user.id,
    userName: user.name,
    userRole: user.role,
    action: 'PRIMARY_SELECT',
    caseId: caseItem.id,
    details: `Selected Sketch v${targetSketch.versionNumber} (${targetSketch.id}) as official primary composite`,
    ipAddress: req.ip || '127.0.0.1',
  });

  res.json({ case: updatedCase });
});

// Audit logging for evidence export
router.post('/log-export', authenticate, (req: AuthenticatedRequest, res: Response): void => {
  const { caseId, sketchId, exportFormat } = req.body;
  const caseItem = store.getCaseById(caseId);

  if (!caseItem) {
    res.status(404).json({ error: `Case '${caseId}' not found.` });
    return;
  }

  const user = req.user!;
  const targetSketch = caseItem.sketches.find((s) => s.id === sketchId);

  store.addAuditLog({
    userId: user.id,
    userName: user.name,
    userRole: user.role,
    action: 'SKETCH_EXPORT',
    caseId: caseItem.id,
    details: `Exported high-resolution evidence composite (Format: ${exportFormat || 'PNG'}, Version: v${targetSketch?.versionNumber || '1'})`,
    ipAddress: req.ip || '127.0.0.1',
  });

  res.json({ success: true, message: 'Export event logged to chain of custody.' });
});

export default router;
