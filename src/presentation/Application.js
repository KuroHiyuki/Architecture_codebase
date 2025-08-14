/**
 * Express Application Setup
 * Main application configuration and middleware setup
 */
import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import { DIContainer } from '../infrastructure/DIContainer.js';

// Route imports
import { createAuthRoutes } from './routes/authRoutes.js';
import { createProductRoutes } from './routes/productRoutes.js';
import { createInventoryRoutes } from './routes/inventoryRoutes.js';
import { createLogRoutes } from './routes/logRoutes.js';

export class Application {
  constructor() {
    this.app = express();
    this.container = new DIContainer();
    this.logger = this.container.resolve('logger');
    
    this.setupMiddleware();
    this.setupRoutes();
    this.setupErrorHandling();
  }

  setupMiddleware() {
    // Security middleware
    this.app.use(helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          styleSrc: ["'self'", "'unsafe-inline'"],
          scriptSrc: ["'self'"],
          imgSrc: ["'self'", "data:", "https:"],
          connectSrc: ["'self'"],
          fontSrc: ["'self'"],
          objectSrc: ["'none'"],
          mediaSrc: ["'self'"],
          frameSrc: ["'none'"]
        }
      },
      crossOriginEmbedderPolicy: false,
      hsts: {
        maxAge: 31536000,
        includeSubDomains: true,
        preload: true
      }
    }));

    // CORS configuration
    this.app.use(cors({
      origin: this.getAllowedOrigins(),
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
      exposedHeaders: ['X-Total-Count', 'X-Page-Count']
    }));

    // Body parsing middleware
    this.app.use(express.json({ 
      limit: '10mb',
      strict: true
    }));
    
    this.app.use(express.urlencoded({ 
      extended: true,
      limit: '10mb'
    }));

    // Request logging
    this.app.use(this.logger.logRequest.bind(this.logger));

    // Add trace ID to requests
    this.app.use((req, res, next) => {
      req.traceId = this.generateTraceId();
      res.setHeader('X-Trace-ID', req.traceId);
      next();
    });

    // Trust proxy for accurate IP addresses
    this.app.set('trust proxy', 1);
  }

  setupRoutes() {
    // Health check route
    this.app.get('/health', (req, res) => {
      const database = this.container.resolve('database');
      const health = {
        status: 'healthy',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        database: database.isConnected() ? 'connected' : 'disconnected',
        environment: process.env.NODE_ENV || 'development',
        version: process.env.npm_package_version || '1.0.0'
      };

      const statusCode = health.database === 'connected' ? 200 : 503;
      res.status(statusCode).json(health);
    });

    // API info route
    this.app.get('/', (req, res) => {
      res.json({
        name: 'Inventory Management API',
        version: process.env.npm_package_version || '1.0.0',
        description: 'Clean Architecture Inventory Management System',
        environment: process.env.NODE_ENV || 'development',
        documentation: '/api-docs',
        health: '/health'
      });
    });

    // API routes
    const authController = this.container.resolve('authController');
    const productController = this.container.resolve('productController');
    const inventoryController = this.container.resolve('inventoryController');
    
    const validationMiddleware = this.container.resolve('validationMiddleware');
    const rateLimitMiddleware = this.container.resolve('rateLimitMiddleware');
    const authMiddleware = this.container.resolve('authMiddleware');
    const errorHandler = this.container.resolve('errorHandler');

    // Register routes
    this.app.use('/api/auth', createAuthRoutes({
      authController,
      validationMiddleware,
      rateLimitMiddleware,
      authMiddleware,
      errorHandler
    }));

    this.app.use('/api/products', createProductRoutes({
      productController,
      validationMiddleware,
      rateLimitMiddleware,
      authMiddleware,
      errorHandler
    }));

    this.app.use('/api/inventory', createInventoryRoutes({
      inventoryController,
      validationMiddleware,
      rateLimitMiddleware,
      authMiddleware,
      errorHandler
    }));

    this.app.use('/api/logs', createLogRoutes(this.container));

    // 404 handler for unknown routes
    this.app.use(errorHandler.notFound());
  }

  setupErrorHandling() {
    const errorHandler = this.container.resolve('errorHandler');
    
    // Global error handler (must be last middleware)
    this.app.use(errorHandler.handle());

    // Handle uncaught exceptions
    process.on('uncaughtException', (error) => {
      this.logger.error('Uncaught Exception', { error: error.message, stack: error.stack });
      this.gracefulShutdown('UNCAUGHT_EXCEPTION');
    });

    // Handle unhandled promise rejections
    process.on('unhandledRejection', (reason, promise) => {
      this.logger.error('Unhandled Rejection', { reason, promise });
      this.gracefulShutdown('UNHANDLED_REJECTION');
    });

    // Handle SIGTERM
    process.on('SIGTERM', () => {
      this.logger.info('SIGTERM received');
      this.gracefulShutdown('SIGTERM');
    });

    // Handle SIGINT
    process.on('SIGINT', () => {
      this.logger.info('SIGINT received');
      this.gracefulShutdown('SIGINT');
    });
  }

  getAllowedOrigins() {
    const origins = process.env.ALLOWED_ORIGINS || 'http://localhost:3000,http://localhost:3001';
    return origins.split(',').map(origin => origin.trim());
  }

  generateTraceId() {
    return Math.random().toString(36).substring(2, 15) + 
           Math.random().toString(36).substring(2, 15);
  }

  async start(port = process.env.PORT || 3000) {
    try {
      // Connect to database
      const database = this.container.resolve('database');
      await database.connect(process.env.MONGODB_URI);

      // Setup MongoDB logging after database connection
      const logger = this.container.resolve('logger');
      logger.setDatabase(database);

      // Start server
      this.server = this.app.listen(port, () => {
        this.logger.info(`Server started successfully`, {
          port,
          environment: process.env.NODE_ENV || 'development',
          nodeVersion: process.version,
          platform: process.platform
        });
      });

      return this.server;
    } catch (error) {
      this.logger.error('Failed to start server', { error: error.message });
      throw error;
    }
  }

  async gracefulShutdown(signal) {
    this.logger.info(`${signal} received, starting graceful shutdown`);

    // Stop accepting new connections
    if (this.server) {
      this.server.close(async () => {
        this.logger.info('HTTP server closed');

        try {
          // Close database connection
          const database = this.container.resolve('database');
          await database.disconnect();

          // Dispose dependency injection container
          await this.container.dispose();

          this.logger.info('Graceful shutdown completed');
          process.exit(0);
        } catch (error) {
          this.logger.error('Error during shutdown', { error: error.message });
          process.exit(1);
        }
      });

      // Force close after timeout
      setTimeout(() => {
        this.logger.error('Could not close connections in time, forcefully shutting down');
        process.exit(1);
      }, 10000);
    }
  }

  getApp() {
    return this.app;
  }

  getContainer() {
    return this.container;
  }
}
