import path from 'node:path';
import { fileURLToPath } from 'node:url';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

import { env } from './config/env.js';
import { apiRateLimiter } from './middleware/rateLimiter.js';
import { errorHandler } from './middleware/errorHandler.js';
import { successResponse, errorResponse } from './utils/responseFormatter.js';

// Route imports
import authRoutes from './routes/authRoutes.js';
import medicineRoutes from './routes/medicineRoutes.js';
import supplierRoutes from './routes/supplierRoutes.js';
import buyerRoutes from './routes/buyerRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import paymentRoutes from './routes/paymentRoutes.js';
import invoiceRoutes from './routes/invoiceRoutes.js';
import patientBillRoutes from './routes/patientBillRoutes.js';
import reportRoutes from './routes/reportRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';
import chatRoutes from './routes/chatRoutes.js';
import uploadRoutes from './routes/uploadRoutes.js';
import { ExpiryAlertJob } from './jobs/expiryAlertJob.js';
import { requireAuth } from './middleware/authMiddleware.js';

const app = express();

// Secure HTTP Headers
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

// CORS Configuration
const allowedOrigins = [
  env.CLIENT_ORIGIN,
  'http://localhost:3000',
  'http://localhost:5173',
  'http://127.0.0.1:3000',
  'http://127.0.0.1:5173'
];

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps, curl, postman)
    if (!origin || allowedOrigins.includes(origin) || origin.startsWith('http://localhost:')) {
      return callback(null, true);
    }
    return callback(null, true); // Permissive in dev mode for smooth pair programming
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// Request logging (skip in test mode)
if (env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

// Body parsing with safe size limits
app.use(express.json({ limit: '25mb' }));
app.use(express.urlencoded({ extended: true, limit: '25mb' }));

// Serve uploaded documents statically
app.use('/uploads', express.static(path.resolve(__dirname, '../uploads')));

// Global rate limiting
app.use('/api', apiRateLimiter);

// Health check endpoint
app.get('/api/health', (req, res) => {
  return successResponse(res, 'PharmaConnect B2B Core API Online', {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    environment: env.NODE_ENV,
    version: '1.0.0',
    cdscoNode: 'IND-MH-40194'
  });
});

// Trigger manual batch scan
app.post('/api/surveillance/scan-expiry', requireAuth, async (req, res, next) => {
  try {
    const alerts = await ExpiryAlertJob.scanAndTriggerAlerts();
    return successResponse(res, `Batch surveillance scan completed. Generated ${alerts.length} alerts.`, alerts);
  } catch (err) {
    next(err);
  }
});

// API Routes Mounting
app.use('/api/auth', authRoutes);
app.use('/api/medicines', medicineRoutes);
app.use('/api/supplier', supplierRoutes);
app.use('/api/buyer', buyerRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/invoices', invoiceRoutes);
app.use('/api/patient-bills', patientBillRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/uploads', uploadRoutes);

// Catch 404 for undefined API routes
app.use('/api/*', (req, res) => {
  return errorResponse(res, `API route ${req.method} ${req.originalUrl} not found`, [], 404);
});

// Centralized Error Handling Middleware
app.use(errorHandler);

export default app;
