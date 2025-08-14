/**
 * Logger Configuration
 * Winston-based logging system with MongoDB storage
 */
import winston from 'winston';
import path from 'path';
import { fileURLToPath } from 'url';
import { MongoDBTransport } from '../infrastructure/logging/MongoDBTransport.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export class Logger {
  constructor() {
    this.database = null;
    this.logger = this.createLogger();
  }

  // Method to inject database after container initialization
  setDatabase(database) {
    this.database = database;
    // Recreate logger with MongoDB transport if database is available
    if (database && process.env.ENABLE_DB_LOGGING !== 'false') {
      this.addMongoDBTransport();
    }
  }

  addMongoDBTransport() {
    if (this.mongoTransportAdded) return;
    
    try {
      const mongoTransport = new MongoDBTransport({
        level: process.env.LOG_LEVEL || 'info',
        db: this.database,
        bufferSize: parseInt(process.env.LOG_BUFFER_SIZE) || 50,
        bufferTimeout: parseInt(process.env.LOG_BUFFER_TIMEOUT) || 3000
      });
      
      this.logger.add(mongoTransport);
      this.mongoTransportAdded = true;
      console.log('✓ MongoDB logging transport added');
    } catch (error) {
      console.error('Failed to add MongoDB transport:', error.message);
    }
  }

  createLogger() {
    const logLevel = process.env.LOG_LEVEL || 'info';
    const logFormat = winston.format.combine(
      winston.format.timestamp({
        format: 'YYYY-MM-DD HH:mm:ss'
      }),
      winston.format.errors({ stack: true }),
      winston.format.json()
    );

    const transports = [
      // Console transport for development
      new winston.transports.Console({
        level: logLevel,
        format: winston.format.combine(
          winston.format.colorize(),
          winston.format.printf(({ timestamp, level, message, ...meta }) => {
            return `${timestamp} [${level}]: ${message} ${
              Object.keys(meta).length ? JSON.stringify(meta, null, 2) : ''
            }`;
          })
        )
      })
    ];

    // Note: MongoDB transport will be added later via setDatabase()
    // to avoid cyclic dependency issues

    // File transport for production backup
    if (process.env.NODE_ENV === 'production') {
      const logDir = path.join(__dirname, '../../logs');
      
      transports.push(
        // Error log file
        new winston.transports.File({
          filename: path.join(logDir, 'error.log'),
          level: 'error',
          format: logFormat,
          maxsize: 10485760, // 10MB
          maxFiles: 5,
          tailable: true
        }),
        
        // Combined log file
        new winston.transports.File({
          filename: path.join(logDir, 'combined.log'),
          format: logFormat,
          maxsize: 10485760, // 10MB
          maxFiles: 10,
          tailable: true
        })
      );
    }

    return winston.createLogger({
      level: logLevel,
      format: logFormat,
      defaultMeta: { 
        service: 'inventory-management',
        environment: process.env.NODE_ENV || 'development'
      },
      transports,
      exitOnError: false
    });
  }

  // Convenience methods
  error(message, meta = {}) {
    this.logger.error(message, this.sanitizeMeta(meta));
  }

  warn(message, meta = {}) {
    this.logger.warn(message, this.sanitizeMeta(meta));
  }

  info(message, meta = {}) {
    this.logger.info(message, this.sanitizeMeta(meta));
  }

  debug(message, meta = {}) {
    this.logger.debug(message, this.sanitizeMeta(meta));
  }

  // HTTP request logging
  logRequest(req, res, next) {
    const start = Date.now();
    
    res.on('finish', () => {
      const duration = Date.now() - start;
      const logData = {
        method: req.method,
        url: req.originalUrl,
        statusCode: res.statusCode,
        duration: `${duration}ms`,
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        userId: req.user?.id,
        contentLength: res.get('Content-Length')
      };

      if (res.statusCode >= 400) {
        this.warn('HTTP Request Error', logData);
      } else {
        this.info('HTTP Request', logData);
      }
    });

    next();
  }

  // Database operation logging
  logDatabaseOperation(operation, collection, query = {}, result = {}) {
    this.debug('Database Operation', {
      operation,
      collection,
      query: this.sanitizeQuery(query),
      resultCount: result.length || (result.acknowledged ? 1 : 0),
      timestamp: new Date().toISOString()
    });
  }

  // Security event logging
  logSecurityEvent(event, details = {}) {
    this.warn('Security Event', {
      event,
      ...this.sanitizeMeta(details),
      timestamp: new Date().toISOString()
    });
  }

  // Business operation logging
  logBusinessOperation(operation, details = {}) {
    this.info('Business Operation', {
      operation,
      ...this.sanitizeMeta(details),
      timestamp: new Date().toISOString()
    });
  }

  // Performance logging
  logPerformance(operation, duration, details = {}) {
    const level = duration > 1000 ? 'warn' : 'info';
    this.logger[level]('Performance Metrics', {
      operation,
      duration: `${duration}ms`,
      ...this.sanitizeMeta(details),
      timestamp: new Date().toISOString()
    });
  }

  // Sanitize sensitive information from logs
  sanitizeMeta(meta) {
    const sanitized = { ...meta };
    const sensitiveFields = ['password', 'token', 'secret', 'key', 'authorization'];
    
    const sanitizeObject = (obj) => {
      if (!obj || typeof obj !== 'object') return obj;
      
      const result = Array.isArray(obj) ? [] : {};
      
      for (const [key, value] of Object.entries(obj)) {
        const lowerKey = key.toLowerCase();
        
        if (sensitiveFields.some(field => lowerKey.includes(field))) {
          result[key] = '[REDACTED]';
        } else if (typeof value === 'object') {
          result[key] = sanitizeObject(value);
        } else {
          result[key] = value;
        }
      }
      
      return result;
    };

    return sanitizeObject(sanitized);
  }

  sanitizeQuery(query) {
    const sanitized = { ...query };
    delete sanitized.password;
    return sanitized;
  }

  // Create child logger with additional context
  child(context) {
    return {
      error: (message, meta = {}) => this.error(message, { ...context, ...meta }),
      warn: (message, meta = {}) => this.warn(message, { ...context, ...meta }),
      info: (message, meta = {}) => this.info(message, { ...context, ...meta }),
      debug: (message, meta = {}) => this.debug(message, { ...context, ...meta })
    };
  }

  // Stream for external libraries (like Morgan)
  stream() {
    return {
      write: (message) => {
        this.info(message.trim());
      }
    };
  }

  // Database log query methods
  async queryLogs(filters = {}, options = {}) {
    return await MongoDBTransport.queryLogs(filters, options);
  }

  async getLogsByLevel(level, limit = 100) {
    return await MongoDBTransport.getLogsByLevel(level, limit);
  }

  async getErrorLogs(limit = 100) {
    return await MongoDBTransport.getErrorLogs(limit);
  }

  async getLogsByService(service, limit = 100) {
    return await MongoDBTransport.getLogsByService(service, limit);
  }

  async getLogsByUser(userId, limit = 100) {
    return await MongoDBTransport.getLogsByUser(userId, limit);
  }

  async getLogsByDateRange(startDate, endDate, limit = 1000) {
    return await MongoDBTransport.getLogsByDateRange(startDate, endDate, limit);
  }

  async searchLogs(searchTerm, limit = 100) {
    return await MongoDBTransport.searchLogs(searchTerm, limit);
  }

  async getLogStatistics(filters = {}) {
    return await MongoDBTransport.getLogStatistics(filters);
  }

  // Enhanced logging methods with context
  logWithContext(level, message, metadata = {}, context = {}) {
    const enrichedMeta = {
      ...metadata,
      ...context,
      timestamp: new Date().toISOString()
    };
    
    this.logger[level](message, this.sanitizeMeta(enrichedMeta));
  }

  errorWithContext(message, metadata = {}, context = {}) {
    this.logWithContext('error', message, metadata, context);
  }

  warnWithContext(message, metadata = {}, context = {}) {
    this.logWithContext('warn', message, metadata, context);
  }

  infoWithContext(message, metadata = {}, context = {}) {
    this.logWithContext('info', message, metadata, context);
  }

  debugWithContext(message, metadata = {}, context = {}) {
    this.logWithContext('debug', message, metadata, context);
  }
}
