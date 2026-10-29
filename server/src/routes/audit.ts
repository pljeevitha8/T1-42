import { Router, Response } from 'express';
import crypto from 'crypto';
import { store } from '../db/store.js';
import { authenticate, AuthenticatedRequest, requireRole } from '../middleware/auth.js';

const router = Router();

// Get audit trail (Admin only)
router.get('/', authenticate, requireRole(['admin']), (req: AuthenticatedRequest, res: Response): void => {
  const { action, caseId, userId, limit } = req.query;
  let logs = store.getAuditLogs();

  if (action && typeof action === 'string') {
    logs = logs.filter((l) => l.action === action);
  }

  if (caseId && typeof caseId === 'string') {
    logs = logs.filter((l) => l.caseId === caseId);
  }

  if (userId && typeof userId === 'string') {
    logs = logs.filter((l) => l.userId === userId);
  }

  const maxLogs = limit ? parseInt(limit as string, 10) : 200;
  res.json({ logs: logs.slice(0, maxLogs), total: logs.length });
});

// Verify cryptographic integrity of audit chain
router.get('/verify-integrity', authenticate, requireRole(['admin']), (_req: AuthenticatedRequest, res: Response): void => {
  const logs = [...store.getAuditLogs()].reverse(); // order chronologically from genesis
  let isValid = true;
  let brokenIndex = -1;

  for (let i = 0; i < logs.length; i++) {
    const current = logs[i];
    const prevHash = i === 0 ? 'GENESIS_FORENSIC_ROOT_BLOCK' : logs[i - 1].integrityHash;

    const expectedData = `${current.timestamp}|${current.userId}|${current.action}|${current.caseId || ''}|${current.details}|${prevHash}`;
    const calculatedHash = crypto.createHash('sha256').update(expectedData).digest('hex');

    if (calculatedHash !== current.integrityHash) {
      isValid = false;
      brokenIndex = i;
      break;
    }
  }

  res.json({
    chainLength: logs.length,
    tamperEvidentVerified: isValid,
    status: isValid ? 'CRYPTOGRAPHIC_CHAIN_INTACT' : 'TAMPER_DETECTED',
    brokenIndex: brokenIndex >= 0 ? brokenIndex : null,
    verifiedAt: new Date().toISOString(),
  });
});

// Export audit logs as CSV
router.get('/export-csv', authenticate, requireRole(['admin']), (_req: AuthenticatedRequest, res: Response): void => {
  const logs = store.getAuditLogs();

  const headers = ['Log ID', 'Timestamp (UTC)', 'User ID', 'User Name', 'Role', 'Action', 'Case ID', 'Details', 'IP Address', 'Integrity Hash'];
  const rows = logs.map((l) => [
    `"${l.id}"`,
    `"${l.timestamp}"`,
    `"${l.userId}"`,
    `"${l.userName}"`,
    `"${l.userRole}"`,
    `"${l.action}"`,
    `"${l.caseId || ''}"`,
    `"${(l.details || '').replace(/"/g, '""')}"`,
    `"${l.ipAddress}"`,
    `"${l.integrityHash}"`,
  ]);

  const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\r\n');

  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', `attachment; filename="sketchtrace-audit-trail-${Date.now()}.csv"`);
  res.send(csvContent);
});

export default router;
