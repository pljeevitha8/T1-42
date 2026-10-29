import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { store } from '../db/store.js';
import { authenticate, AuthenticatedRequest, JWT_SECRET } from '../middleware/auth.js';
import { User } from '../types/index.js';

const router = Router();

const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

const RegisterSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  name: z.string().min(2),
  badgeNumber: z.string().min(2),
  department: z.string().min(2),
  role: z.enum(['admin', 'investigator', 'reviewer']).default('investigator'),
});

// Login
router.post('/login', (req: Request, res: Response): void => {
  const parseResult = LoginSchema.safeParse(req.body);
  if (!parseResult.success) {
    res.status(400).json({ error: 'Validation failed', details: parseResult.error.flatten() });
    return;
  }

  const { email, password } = parseResult.data;
  const user = store.getUserByEmail(email);

  if (!user || !bcrypt.compareSync(password, user.passwordHash)) {
    store.addAuditLog({
      userId: 'UNKNOWN',
      userName: 'Unauthenticated Visitor',
      userRole: 'reviewer',
      action: 'LOGIN_FAILED',
      details: `Failed authentication attempt for email: ${email}`,
      ipAddress: req.ip || '127.0.0.1',
    });

    res.status(401).json({ error: 'Invalid credentials. Please verify your badge email and password.' });
    return;
  }

  const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET, {
    expiresIn: '24h',
  });

  store.addAuditLog({
    userId: user.id,
    userName: user.name,
    userRole: user.role,
    action: 'LOGIN_SUCCESS',
    details: `Officer/User ${user.name} logged in successfully [Badge: ${user.badgeNumber}]`,
    ipAddress: req.ip || '127.0.0.1',
  });

  const { passwordHash, ...userWithoutPassword } = user;
  res.json({
    token,
    user: userWithoutPassword,
  });
});

// Register new investigator
router.post('/register', (req: Request, res: Response): void => {
  const parseResult = RegisterSchema.safeParse(req.body);
  if (!parseResult.success) {
    res.status(400).json({ error: 'Validation failed', details: parseResult.error.flatten() });
    return;
  }

  const { email, password, name, badgeNumber, department, role } = parseResult.data;
  if (store.getUserByEmail(email)) {
    res.status(409).json({ error: 'An investigator account with this email already exists.' });
    return;
  }

  const salt = bcrypt.genSaltSync(10);
  const passwordHash = bcrypt.hashSync(password, salt);

  const newUser: User = {
    id: `USR-${Date.now().toString(36).toUpperCase()}`,
    email,
    name,
    badgeNumber,
    department,
    role,
    passwordHash,
  };

  store.addUser(newUser);

  const token = jwt.sign({ id: newUser.id, email: newUser.email, role: newUser.role }, JWT_SECRET, {
    expiresIn: '24h',
  });

  store.addAuditLog({
    userId: newUser.id,
    userName: newUser.name,
    userRole: newUser.role,
    action: 'LOGIN_SUCCESS',
    details: `New account registered for ${newUser.name} (${newUser.role})`,
    ipAddress: req.ip || '127.0.0.1',
  });

  const { passwordHash: _, ...userWithoutPassword } = newUser;
  res.status(201).json({
    token,
    user: userWithoutPassword,
  });
});

// Get current user profile
router.get('/me', authenticate, (req: AuthenticatedRequest, res: Response): void => {
  if (!req.user) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }

  const { passwordHash, ...userWithoutPassword } = req.user;
  res.json({ user: userWithoutPassword });
});

// Get demo quick-login credentials for hackathon evaluation
router.get('/demo-accounts', (_req: Request, res: Response): void => {
  const demoUsers = store.getUsers().map(({ passwordHash, ...user }) => ({
    ...user,
    demoPasswordHint: 'Forensics2026!',
  }));

  res.json({ demoAccounts: demoUsers });
});

export default router;
