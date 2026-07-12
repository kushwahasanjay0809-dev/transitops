const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const corsOptions = require('./config/cors');
const { apiLimiter } = require('./middleware/rateLimiter');
const errorHandler = require('./middleware/errorHandler');
const ApiResponse = require('./utils/apiResponse');

const app = express();

// ============================================================
// SECURITY MIDDLEWARE
// ============================================================

// Helmet — sets security HTTP headers
app.use(helmet());

// CORS — cross-origin resource sharing
app.use(cors(corsOptions));

// Rate limiting — applied to all /api routes
app.use('/api', apiLimiter);

// ============================================================
// PARSING MIDDLEWARE
// ============================================================

// Parse JSON bodies (limit: 10mb for potential large payloads)
app.use(express.json({ limit: '10mb' }));

// Parse URL-encoded bodies
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ============================================================
// LOGGING MIDDLEWARE
// ============================================================

// Morgan — HTTP request logger
// 'dev' format in development, 'combined' in production
const env = require('./config/env');
app.use(morgan(env.isDevelopment ? 'dev' : 'combined'));

// ============================================================
// HEALTH CHECK
// ============================================================

app.get('/api/health', (req, res) => {
  ApiResponse.success(res, {
    message: 'TransitOps API is running',
    data: {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: env.nodeEnv,
    },
  });
});

// ============================================================
// HEALTH CHECK
// ============================================================

app.get('/api/health', async (req, res) => {
  try {
    const { prisma } = require('./config/database');
    await prisma.$queryRaw`SELECT 1`;
    res.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      database: 'connected',
    });
  } catch (error) {
    res.status(503).json({
      status: 'error',
      timestamp: new Date().toISOString(),
      database: 'disconnected',
      error: error.message,
    });
  }
});

// ============================================================
// API ROUTES
// ============================================================

// Step 6: Authentication & User Management
app.use('/api/auth', require('./modules/auth/auth.routes'));
app.use('/api/users', require('./modules/users/user.routes'));

// Step 7: Vehicle & Region Management
app.use('/api/vehicles', require('./modules/vehicles/vehicle.routes'));
app.use('/api/regions', require('./modules/regions/region.routes'));

// Step 8: Driver Management
app.use('/api/drivers', require('./modules/drivers/driver.routes'));

// Step 9: Trip Management
app.use('/api/trips', require('./modules/trips/trip.routes'));

// Step 10: Maintenance Management
app.use('/api/maintenance', require('./modules/maintenance/maintenance.routes'));

// Step 11: Fuel Log Management
app.use('/api/fuel-logs', require('./modules/fuel/fuel.routes'));

// Step 12: Expense Management
app.use('/api/expenses', require('./modules/expenses/expense.routes'));

// Step 13: Dashboard
app.use('/api/dashboard', require('./modules/dashboard/dashboard.routes'));

// Step 14: Reports & CSV Export
app.use('/api/reports', require('./modules/reports/report.routes'));

// ============================================================
// 404 HANDLER — Catch unmatched routes
// ============================================================

app.use((req, res) => {
  ApiResponse.notFound(res, `Route ${req.method} ${req.originalUrl} not found`);
});

// ============================================================
// GLOBAL ERROR HANDLER — Must be last
// ============================================================

app.use(errorHandler);

module.exports = app;
