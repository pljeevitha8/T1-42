import { Router, Response } from 'express';
import { store } from '../db/store.js';
import { authenticate, AuthenticatedRequest, requireRole } from '../middleware/auth.js';

const router = Router();

// Get system config & active AI provider
router.get('/config', authenticate, (_req: AuthenticatedRequest, res: Response): void => {
  const config = store.getConfig();
  // Mask API key for security
  const maskedConfig = {
    ...config,
    apiKey: config.apiKey ? `${config.apiKey.slice(0, 4)}...${config.apiKey.slice(-4)}` : '',
    hasApiKey: Boolean(config.apiKey && config.apiKey.length > 5),
  };

  res.json({
    config: maskedConfig,
    serverVersion: '2.4.0-hackathon-release',
    responsibleAIPolicy: {
      version: '1.2-FORENSIC-ETHICS',
      lastReviewDate: '2026-10-15',
      disclaimer:
        'AI-Generated Forensic Approximation for investigative leads only. Not admissible as definitive proof of identity or biometric evidence.',
    },
  });
});

// Update AI provider configuration (Admin only)
router.post('/config', authenticate, requireRole(['admin']), (req: AuthenticatedRequest, res: Response): void => {
  const { provider, apiKey, modelName, customEndpoint } = req.body;

  const updates: any = {};
  if (provider) updates.provider = provider;
  if (apiKey !== undefined && apiKey !== '***') updates.apiKey = apiKey;
  if (modelName) updates.modelName = modelName;
  if (customEndpoint) updates.customEndpoint = customEndpoint;

  const newConfig = store.updateConfig(updates);
  const user = req.user!;

  store.addAuditLog({
    userId: user.id,
    userName: user.name,
    userRole: user.role,
    action: 'CONFIG_UPDATE',
    details: `Updated AI Provider to: ${newConfig.provider} (Model: ${newConfig.modelName || 'default'})`,
    ipAddress: req.ip || '127.0.0.1',
  });

  res.json({
    message: 'System AI settings updated successfully.',
    config: {
      ...newConfig,
      apiKey: newConfig.apiKey ? `${newConfig.apiKey.slice(0, 4)}...${newConfig.apiKey.slice(-4)}` : '',
      hasApiKey: Boolean(newConfig.apiKey && newConfig.apiKey.length > 5),
    },
  });
});

// System dashboard summary metrics
router.get('/metrics', authenticate, (_req: AuthenticatedRequest, res: Response): void => {
  const cases = store.getCases();
  const auditLogs = store.getAuditLogs();

  let totalSketches = 0;
  let totalRefinements = 0;

  cases.forEach((c) => {
    totalSketches += c.sketches?.length || 0;
    if (c.sketches && c.sketches.length > 1) {
      totalRefinements += c.sketches.length - 1;
    }
  });

  const activeCases = cases.filter((c) => c.status === 'ACTIVE').length;
  const reviewCases = cases.filter((c) => c.status === 'REVIEW').length;
  const closedCases = cases.filter((c) => c.status === 'CLOSED').length;

  res.json({
    metrics: {
      totalCases: cases.length,
      activeCases,
      reviewCases,
      closedCases,
      totalSketches,
      totalRefinements,
      totalAuditEvents: auditLogs.length,
      activeEngine: store.getConfig().provider,
      systemUptimeSeconds: Math.floor(process.uptime()),
    },
    recentActivity: auditLogs.slice(0, 8),
  });
});

export default router;
