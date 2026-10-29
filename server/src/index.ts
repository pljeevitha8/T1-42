import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import authRoutes from './routes/auth.js';
import casesRoutes from './routes/cases.js';
import sketchesRoutes from './routes/sketches.js';
import auditRoutes from './routes/audit.js';
import systemRoutes from './routes/system.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Security and middleware
app.use(cors({
  origin: true,
  credentials: true,
}));
app.use(express.json({ limit: '15mb' }));
app.use(express.urlencoded({ extended: true, limit: '15mb' }));

// Request logging
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    if (req.originalUrl.startsWith('/api')) {
      console.log(`[${req.method}] ${req.originalUrl} -> ${res.statusCode} (${duration}ms)`);
    }
  });
  next();
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/cases', casesRoutes);
app.use('/api/sketches', sketchesRoutes);
app.use('/api/audit', auditRoutes);
app.use('/api/system', systemRoutes);

// Health check endpoint
app.get('/api/health', (_req, res) => {
  res.json({
    status: 'OPERATIONAL',
    service: 'SketchTrace AI Forensic Server',
    timestamp: new Date().toISOString(),
    uptime: Math.floor(process.uptime()),
    features: ['Real AI Generation', 'Forensic Refinement', 'Biometric Overlays', 'Tamper-Evident Audit Chain'],
  });
});

// Serve frontend static files if client is built
const clientDist = path.resolve(process.cwd(), '../client/dist');
if (fs.existsSync(clientDist)) {
  app.use(express.static(clientDist));
  app.get('*', (_req, res) => {
    res.sendFile(path.join(clientDist, 'index.html'));
  });
}

// Global error handler
app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('[Server Error]', err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal Forensic Server Error',
  });
});

app.listen(PORT, () => {
  console.log(`====================================================`);
  console.log(`  SketchTrace AI Forensic Server v2.4.0 Running     `);
  console.log(`  Port: http://localhost:${PORT}                    `);
  console.log(`  Health: http://localhost:${PORT}/api/health        `);
  console.log(`====================================================`);
});
