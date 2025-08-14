/**
 * MongoDB Schema for Application Logs
 */
import mongoose from 'mongoose';

const logSchema = new mongoose.Schema({
  _id: {
    type: String,
    required: true
  },
  level: {
    type: String,
    required: true,
    enum: ['error', 'warn', 'info', 'debug'],
    index: true
  },
  message: {
    type: String,
    required: true,
    index: true
  },
  timestamp: {
    type: Date,
    required: true,
    default: Date.now,
    index: true
  },
  service: {
    type: String,
    default: 'inventory-management',
    index: true
  },
  environment: {
    type: String,
    default: 'development',
    index: true
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  // HTTP Request specific fields
  httpRequest: {
    method: String,
    url: String,
    statusCode: Number,
    duration: String,
    ip: String,
    userAgent: String,
    userId: String,
    contentLength: String
  },
  // Database operation specific fields
  databaseOperation: {
    operation: String,
    collection: String,
    query: mongoose.Schema.Types.Mixed,
    resultCount: Number
  },
  // Security event specific fields
  securityEvent: {
    event: String,
    userId: String,
    ip: String,
    userAgent: String,
    severity: {
      type: String,
      enum: ['low', 'medium', 'high', 'critical'],
      default: 'medium'
    }
  },
  // Business operation specific fields
  businessOperation: {
    operation: String,
    entityType: String,
    entityId: String,
    userId: String,
    previousState: mongoose.Schema.Types.Mixed,
    newState: mongoose.Schema.Types.Mixed
  },
  // Performance metrics
  performance: {
    operation: String,
    duration: Number,
    memoryUsage: mongoose.Schema.Types.Mixed,
    cpuUsage: Number
  },
  // Error details
  error: {
    name: String,
    message: String,
    stack: String,
    code: String
  },
  // Context information
  context: {
    requestId: String,
    sessionId: String,
    traceId: String,
    spanId: String
  },
  // Expiration for automatic cleanup (30 days for info/debug, 90 days for warn/error)
  expiresAt: {
    type: Date,
    index: { expireAfterSeconds: 0 }
  }
}, {
  versionKey: false,
  collection: 'logs'
});

// Indexes for efficient querying
logSchema.index({ level: 1, timestamp: -1 });
logSchema.index({ service: 1, level: 1, timestamp: -1 });
logSchema.index({ environment: 1, level: 1, timestamp: -1 });
logSchema.index({ 'httpRequest.statusCode': 1, timestamp: -1 });
logSchema.index({ 'httpRequest.userId': 1, timestamp: -1 });
logSchema.index({ 'securityEvent.event': 1, timestamp: -1 });
logSchema.index({ 'securityEvent.userId': 1, timestamp: -1 });
logSchema.index({ 'businessOperation.operation': 1, timestamp: -1 });
logSchema.index({ 'businessOperation.entityType': 1, timestamp: -1 });
logSchema.index({ 'error.name': 1, timestamp: -1 });
logSchema.index({ 'context.requestId': 1 });
logSchema.index({ 'context.userId': 1, timestamp: -1 });

// Text search index
logSchema.index({ 
  message: 'text', 
  'error.message': 'text',
  'httpRequest.url': 'text'
});

// Pre-save middleware to set expiration
logSchema.pre('save', function(next) {
  if (!this.expiresAt) {
    const now = new Date();
    let expirationDays;
    
    switch (this.level) {
      case 'error':
        expirationDays = 90; // Keep errors for 90 days
        break;
      case 'warn':
        expirationDays = 60; // Keep warnings for 60 days
        break;
      case 'info':
        expirationDays = 30; // Keep info logs for 30 days
        break;
      case 'debug':
        expirationDays = 7; // Keep debug logs for 7 days
        break;
      default:
        expirationDays = 30;
    }
    
    this.expiresAt = new Date(now.getTime() + (expirationDays * 24 * 60 * 60 * 1000));
  }
  next();
});

export const LogModel = mongoose.model('Log', logSchema);
