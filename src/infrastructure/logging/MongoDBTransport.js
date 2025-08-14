/**
 * MongoDB Transport for Winston Logger
 * Custom transport to store logs in MongoDB
 */
import Transport from 'winston-transport';
import { LogModel } from '../database/schemas/LogSchema.js';
import { v4 as uuidv4 } from 'uuid';

export class MongoDBTransport extends Transport {
  constructor(options = {}) {
    super(options);
    
    this.name = 'mongodb';
    this.level = options.level || 'info';
    this.silent = options.silent || false;
    this.decolorize = options.decolorize || false;
    
    // Connection options
    this.db = options.db;
    this.collection = options.collection || 'logs';
    
    // Buffering options
    this.buffer = [];
    this.bufferSize = options.bufferSize || 100;
    this.bufferTimeout = options.bufferTimeout || 5000; // 5 seconds
    
    // Start buffer flush timer
    this.startBufferTimer();
    
    // Graceful shutdown handling
    process.on('SIGINT', () => this.flush());
    process.on('SIGTERM', () => this.flush());
    process.on('beforeExit', () => this.flush());
  }

  log(info, callback) {
    setImmediate(() => {
      this.emit('logged', info);
    });

    // Don't log if silent
    if (this.silent) {
      callback();
      return true;
    }

    try {
      // Parse the log entry
      const logEntry = this.formatLogEntry(info);
      
      // Add to buffer
      this.buffer.push(logEntry);
      
      // Flush if buffer is full
      if (this.buffer.length >= this.bufferSize) {
        this.flush();
      }
      
      callback();
      return true;
    } catch (error) {
      console.error('MongoDB Transport Error:', error);
      callback(error);
      return false;
    }
  }

  formatLogEntry(info) {
    const {
      level,
      message,
      timestamp,
      service,
      environment,
      stack,
      ...metadata
    } = info;

    const logEntry = {
      _id: uuidv4(),
      level,
      message,
      timestamp: new Date(timestamp || Date.now()),
      service: service || 'inventory-management',
      environment: environment || process.env.NODE_ENV || 'development',
      metadata: {}
    };

    // Handle error objects
    if (info instanceof Error || (info.error && info.error instanceof Error)) {
      const error = info instanceof Error ? info : info.error;
      logEntry.error = {
        name: error.name,
        message: error.message,
        stack: error.stack,
        code: error.code
      };
    } else if (stack) {
      logEntry.error = {
        name: info.name || 'Error',
        message: message,
        stack: stack
      };
    }

    // Categorize metadata based on context
    this.categorizeMetadata(metadata, logEntry);

    return logEntry;
  }

  categorizeMetadata(metadata, logEntry) {
    // HTTP Request logging
    if (metadata.method && metadata.url) {
      logEntry.httpRequest = {
        method: metadata.method,
        url: metadata.url,
        statusCode: metadata.statusCode,
        duration: metadata.duration,
        ip: metadata.ip,
        userAgent: metadata.userAgent,
        userId: metadata.userId,
        contentLength: metadata.contentLength
      };
      delete metadata.method;
      delete metadata.url;
      delete metadata.statusCode;
      delete metadata.duration;
      delete metadata.ip;
      delete metadata.userAgent;
      delete metadata.userId;
      delete metadata.contentLength;
    }

    // Database operation logging
    if (metadata.operation && metadata.collection) {
      logEntry.databaseOperation = {
        operation: metadata.operation,
        collection: metadata.collection,
        query: metadata.query,
        resultCount: metadata.resultCount
      };
      delete metadata.operation;
      delete metadata.collection;
      delete metadata.query;
      delete metadata.resultCount;
    }

    // Security event logging
    if (metadata.event) {
      logEntry.securityEvent = {
        event: metadata.event,
        userId: metadata.userId,
        ip: metadata.ip,
        userAgent: metadata.userAgent,
        severity: metadata.severity || 'medium'
      };
      delete metadata.event;
      delete metadata.severity;
    }

    // Business operation logging
    if (metadata.operation && (metadata.entityType || metadata.entityId)) {
      logEntry.businessOperation = {
        operation: metadata.operation,
        entityType: metadata.entityType,
        entityId: metadata.entityId,
        userId: metadata.userId,
        previousState: metadata.previousState,
        newState: metadata.newState
      };
      delete metadata.operation;
      delete metadata.entityType;
      delete metadata.entityId;
      delete metadata.previousState;
      delete metadata.newState;
    }

    // Performance logging
    if (metadata.duration && typeof metadata.duration === 'number') {
      logEntry.performance = {
        operation: metadata.operation,
        duration: metadata.duration,
        memoryUsage: metadata.memoryUsage,
        cpuUsage: metadata.cpuUsage
      };
      delete metadata.duration;
      delete metadata.memoryUsage;
      delete metadata.cpuUsage;
    }

    // Context information
    if (metadata.requestId || metadata.sessionId || metadata.traceId) {
      logEntry.context = {
        requestId: metadata.requestId,
        sessionId: metadata.sessionId,
        traceId: metadata.traceId,
        spanId: metadata.spanId
      };
      delete metadata.requestId;
      delete metadata.sessionId;
      delete metadata.traceId;
      delete metadata.spanId;
    }

    // Store remaining metadata
    logEntry.metadata = metadata;
  }

  async flush() {
    if (this.buffer.length === 0) {
      return;
    }

    const logsToSave = [...this.buffer];
    this.buffer = [];

    try {
      // Batch insert logs
      await LogModel.insertMany(logsToSave, { ordered: false });
      console.log(`✓ Flushed ${logsToSave.length} logs to MongoDB`);
    } catch (error) {
      console.error('Failed to flush logs to MongoDB:', error);
      
      // Re-add logs to buffer if they failed to save
      this.buffer.unshift(...logsToSave);
      
      // Limit buffer size to prevent memory issues
      if (this.buffer.length > this.bufferSize * 2) {
        this.buffer = this.buffer.slice(0, this.bufferSize);
      }
    }
  }

  startBufferTimer() {
    setInterval(() => {
      if (this.buffer.length > 0) {
        this.flush();
      }
    }, this.bufferTimeout);
  }

  // Query methods for log retrieval
  static async queryLogs(filters = {}, options = {}) {
    const query = LogModel.find(filters);
    
    if (options.limit) {
      query.limit(parseInt(options.limit));
    }
    
    if (options.skip) {
      query.skip(parseInt(options.skip));
    }
    
    if (options.sort) {
      query.sort(options.sort);
    } else {
      query.sort({ timestamp: -1 });
    }

    const [logs, total] = await Promise.all([
      query.exec(),
      LogModel.countDocuments(filters)
    ]);

    return {
      logs,
      total,
      page: options.page || 1,
      limit: options.limit || total,
      totalPages: options.limit ? Math.ceil(total / options.limit) : 1
    };
  }

  static async getLogsByLevel(level, limit = 100) {
    return await this.queryLogs({ level }, { limit, sort: { timestamp: -1 } });
  }

  static async getErrorLogs(limit = 100) {
    return await this.queryLogs({ level: 'error' }, { limit, sort: { timestamp: -1 } });
  }

  static async getLogsByService(service, limit = 100) {
    return await this.queryLogs({ service }, { limit, sort: { timestamp: -1 } });
  }

  static async getLogsByUser(userId, limit = 100) {
    return await this.queryLogs({
      $or: [
        { 'httpRequest.userId': userId },
        { 'securityEvent.userId': userId },
        { 'businessOperation.userId': userId },
        { 'context.userId': userId }
      ]
    }, { limit, sort: { timestamp: -1 } });
  }

  static async getLogsByDateRange(startDate, endDate, limit = 1000) {
    return await this.queryLogs({
      timestamp: {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      }
    }, { limit, sort: { timestamp: -1 } });
  }

  static async searchLogs(searchTerm, limit = 100) {
    return await this.queryLogs({
      $text: { $search: searchTerm }
    }, { limit, sort: { score: { $meta: 'textScore' } } });
  }

  static async getLogStatistics(filters = {}) {
    const stats = await LogModel.aggregate([
      { $match: filters },
      {
        $group: {
          _id: '$level',
          count: { $sum: 1 },
          latestLog: { $max: '$timestamp' }
        }
      },
      { $sort: { count: -1 } }
    ]);

    const totalLogs = await LogModel.countDocuments(filters);
    
    return {
      totalLogs,
      byLevel: stats,
      summary: stats.reduce((acc, stat) => {
        acc[stat._id] = stat.count;
        return acc;
      }, {})
    };
  }
}
