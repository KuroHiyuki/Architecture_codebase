/**
 * Log Management Routes
 * API routes for log monitoring and management
 */
import { Router } from 'express';
import Joi from 'joi';

export const createLogRoutes = (container) => {
  const router = Router();
  
  // Resolve dependencies
  const logController = container.resolve('logController');
  const authMiddleware = container.resolve('authMiddleware');
  const validationMiddleware = container.resolve('validationMiddleware');

  // Validation schemas
  const getLogsSchema = Joi.object({
    level: Joi.string().valid('error', 'warn', 'info', 'debug'),
    service: Joi.string().max(100),
    startDate: Joi.date().iso(),
    endDate: Joi.date().iso().greater(Joi.ref('startDate')),
    search: Joi.string().max(200),
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(1000).default(50),
    sort: Joi.string().valid('timestamp', 'level', 'service').default('timestamp'),
    order: Joi.string().valid('asc', 'desc').default('desc')
  });

  const limitSchema = Joi.object({
    limit: Joi.number().integer().min(1).max(1000).default(100)
  });

  const searchSchema = Joi.object({
    q: Joi.string().required().max(200),
    limit: Joi.number().integer().min(1).max(1000).default(100)
  });

  const recentLogsSchema = Joi.object({
    minutes: Joi.number().integer().min(1).max(1440).default(10),
    level: Joi.string().valid('error', 'warn', 'info', 'debug')
  });

  const errorAnalysisSchema = Joi.object({
    hours: Joi.number().integer().min(1).max(168).default(24)
  });

  const exportSchema = Joi.object({
    format: Joi.string().valid('json', 'csv').default('json'),
    level: Joi.string().valid('error', 'warn', 'info', 'debug'),
    startDate: Joi.date().iso(),
    endDate: Joi.date().iso().greater(Joi.ref('startDate')),
    limit: Joi.number().integer().min(1).max(100000).default(10000)
  });

  // Apply authentication to all routes
  router.use(authMiddleware.authenticate.bind(authMiddleware));

  // GET /api/logs - Get logs with filtering and pagination
  router.get('/', 
    validationMiddleware.validate(getLogsSchema, 'query'),
    logController.getLogs.bind(logController)
  );

  // GET /api/logs/errors - Get error logs
  router.get('/errors',
    validationMiddleware.validate(limitSchema, 'query'),
    logController.getErrorLogs.bind(logController)
  );

  // GET /api/logs/level/:level - Get logs by level
  router.get('/level/:level',
    validationMiddleware.validate(Joi.object({
      level: Joi.string().valid('error', 'warn', 'info', 'debug').required()
    }), 'params'),
    validationMiddleware.validate(limitSchema, 'query'),
    logController.getLogsByLevel.bind(logController)
  );

  // GET /api/logs/service/:service - Get logs by service
  router.get('/service/:service',
    validationMiddleware.validate(Joi.object({
      service: Joi.string().required().max(100)
    }), 'params'),
    validationMiddleware.validate(limitSchema, 'query'),
    logController.getLogsByService.bind(logController)
  );

  // GET /api/logs/user/:userId - Get logs by user
  router.get('/user/:userId',
    validationMiddleware.validate(Joi.object({
      userId: Joi.string().required()
    }), 'params'),
    validationMiddleware.validate(limitSchema, 'query'),
    logController.getLogsByUser.bind(logController)
  );

  // GET /api/logs/search - Search logs
  router.get('/search',
    validationMiddleware.validate(searchSchema, 'query'),
    logController.searchLogs.bind(logController)
  );

  // GET /api/logs/statistics - Get log statistics
  router.get('/statistics',
    validationMiddleware.validate(Joi.object({
      level: Joi.string().valid('error', 'warn', 'info', 'debug'),
      service: Joi.string().max(100),
      startDate: Joi.date().iso(),
      endDate: Joi.date().iso().greater(Joi.ref('startDate'))
    }), 'query'),
    logController.getLogStatistics.bind(logController)
  );

  // GET /api/logs/recent - Get recent logs
  router.get('/recent',
    validationMiddleware.validate(recentLogsSchema, 'query'),
    logController.getRecentLogs.bind(logController)
  );

  // GET /api/logs/health - Get system health based on logs
  router.get('/health',
    logController.getSystemHealth.bind(logController)
  );

  // GET /api/logs/analysis/errors - Analyze error patterns
  router.get('/analysis/errors',
    validationMiddleware.validate(errorAnalysisSchema, 'query'),
    logController.analyzeErrorPatterns.bind(logController)
  );

  // GET /api/logs/export - Export logs (admin only)
  router.get('/export',
    authMiddleware.requireRole('admin'),
    validationMiddleware.validate(exportSchema, 'query'),
    logController.exportLogs.bind(logController)
  );

  return router;
};
