/**
 * Log Management Service
 * Service for managing and querying application logs
 */
import { MongoDBTransport } from '../../infrastructure/logging/MongoDBTransport.js';

export class LogService {
  constructor({ logger }) {
    this.logger = logger;
  }

  async getLogs(filters = {}, options = {}) {
    try {
      this.logger.debug('Retrieving logs', { filters, options });
      
      const result = await MongoDBTransport.queryLogs(filters, options);
      
      this.logger.debug('Logs retrieved successfully', { 
        count: result.logs.length,
        total: result.total 
      });
      
      return result;
    } catch (error) {
      this.logger.error('Failed to retrieve logs', { 
        filters, 
        options, 
        error: error.message 
      });
      throw error;
    }
  }

  async getLogsByLevel(level, limit = 100) {
    try {
      this.logger.debug('Retrieving logs by level', { level, limit });
      
      const result = await MongoDBTransport.getLogsByLevel(level, limit);
      
      this.logger.debug('Logs by level retrieved successfully', { 
        level,
        count: result.logs.length 
      });
      
      return result;
    } catch (error) {
      this.logger.error('Failed to retrieve logs by level', { 
        level, 
        limit, 
        error: error.message 
      });
      throw error;
    }
  }

  async getErrorLogs(limit = 100) {
    try {
      this.logger.debug('Retrieving error logs', { limit });
      
      const result = await MongoDBTransport.getErrorLogs(limit);
      
      this.logger.debug('Error logs retrieved successfully', { 
        count: result.logs.length 
      });
      
      return result;
    } catch (error) {
      this.logger.error('Failed to retrieve error logs', { 
        limit, 
        error: error.message 
      });
      throw error;
    }
  }

  async getLogsByService(service, limit = 100) {
    try {
      this.logger.debug('Retrieving logs by service', { service, limit });
      
      const result = await MongoDBTransport.getLogsByService(service, limit);
      
      this.logger.debug('Logs by service retrieved successfully', { 
        service,
        count: result.logs.length 
      });
      
      return result;
    } catch (error) {
      this.logger.error('Failed to retrieve logs by service', { 
        service, 
        limit, 
        error: error.message 
      });
      throw error;
    }
  }

  async getLogsByUser(userId, limit = 100) {
    try {
      this.logger.debug('Retrieving logs by user', { userId, limit });
      
      const result = await MongoDBTransport.getLogsByUser(userId, limit);
      
      this.logger.debug('Logs by user retrieved successfully', { 
        userId,
        count: result.logs.length 
      });
      
      return result;
    } catch (error) {
      this.logger.error('Failed to retrieve logs by user', { 
        userId, 
        limit, 
        error: error.message 
      });
      throw error;
    }
  }

  async getLogsByDateRange(startDate, endDate, limit = 1000) {
    try {
      this.logger.debug('Retrieving logs by date range', { 
        startDate, 
        endDate, 
        limit 
      });
      
      const result = await MongoDBTransport.getLogsByDateRange(startDate, endDate, limit);
      
      this.logger.debug('Logs by date range retrieved successfully', { 
        startDate,
        endDate,
        count: result.logs.length 
      });
      
      return result;
    } catch (error) {
      this.logger.error('Failed to retrieve logs by date range', { 
        startDate, 
        endDate, 
        limit, 
        error: error.message 
      });
      throw error;
    }
  }

  async searchLogs(searchTerm, limit = 100) {
    try {
      this.logger.debug('Searching logs', { searchTerm, limit });
      
      const result = await MongoDBTransport.searchLogs(searchTerm, limit);
      
      this.logger.debug('Log search completed successfully', { 
        searchTerm,
        count: result.logs.length 
      });
      
      return result;
    } catch (error) {
      this.logger.error('Failed to search logs', { 
        searchTerm, 
        limit, 
        error: error.message 
      });
      throw error;
    }
  }

  async getLogStatistics(filters = {}) {
    try {
      this.logger.debug('Retrieving log statistics', { filters });
      
      const result = await MongoDBTransport.getLogStatistics(filters);
      
      this.logger.debug('Log statistics retrieved successfully', { 
        totalLogs: result.totalLogs,
        levels: Object.keys(result.summary) 
      });
      
      return result;
    } catch (error) {
      this.logger.error('Failed to retrieve log statistics', { 
        filters, 
        error: error.message 
      });
      throw error;
    }
  }

  // Real-time log monitoring methods
  async getRecentLogs(minutes = 10, level = null) {
    try {
      const startDate = new Date(Date.now() - (minutes * 60 * 1000));
      const filters = {
        timestamp: { $gte: startDate }
      };
      
      if (level) {
        filters.level = level;
      }
      
      const result = await this.getLogs(filters, {
        sort: { timestamp: -1 },
        limit: 1000
      });
      
      return result;
    } catch (error) {
      this.logger.error('Failed to retrieve recent logs', { 
        minutes, 
        level, 
        error: error.message 
      });
      throw error;
    }
  }

  async getSystemHealth() {
    try {
      const now = new Date();
      const oneHourAgo = new Date(now.getTime() - (60 * 60 * 1000));
      
      const [recentStats, errorStats] = await Promise.all([
        this.getLogStatistics({
          timestamp: { $gte: oneHourAgo }
        }),
        this.getLogStatistics({
          level: 'error',
          timestamp: { $gte: oneHourAgo }
        })
      ]);
      
      const health = {
        timestamp: now,
        period: 'last_hour',
        totalLogs: recentStats.totalLogs,
        errorCount: errorStats.totalLogs,
        errorRate: recentStats.totalLogs > 0 
          ? (errorStats.totalLogs / recentStats.totalLogs * 100).toFixed(2) 
          : 0,
        status: errorStats.totalLogs > 50 ? 'critical' 
               : errorStats.totalLogs > 20 ? 'warning' 
               : 'healthy',
        logDistribution: recentStats.summary
      };
      
      this.logger.debug('System health calculated', health);
      
      return health;
    } catch (error) {
      this.logger.error('Failed to calculate system health', { 
        error: error.message 
      });
      throw error;
    }
  }

  // Log analysis methods
  async analyzeErrorPatterns(hours = 24) {
    try {
      const startDate = new Date(Date.now() - (hours * 60 * 60 * 1000));
      
      const errorLogs = await this.getLogs({
        level: 'error',
        timestamp: { $gte: startDate }
      }, {
        limit: 1000,
        sort: { timestamp: -1 }
      });
      
      // Analyze error patterns
      const patterns = {};
      errorLogs.logs.forEach(log => {
        const errorName = log.error?.name || 'Unknown';
        if (!patterns[errorName]) {
          patterns[errorName] = {
            count: 0,
            firstSeen: log.timestamp,
            lastSeen: log.timestamp,
            messages: new Set()
          };
        }
        patterns[errorName].count++;
        patterns[errorName].lastSeen = log.timestamp;
        if (log.error?.message) {
          patterns[errorName].messages.add(log.error.message);
        }
      });
      
      // Convert sets to arrays and sort by count
      const analysis = Object.entries(patterns)
        .map(([name, data]) => ({
          errorName: name,
          count: data.count,
          firstSeen: data.firstSeen,
          lastSeen: data.lastSeen,
          uniqueMessages: Array.from(data.messages),
          frequency: (data.count / hours).toFixed(2) + ' errors/hour'
        }))
        .sort((a, b) => b.count - a.count);
      
      return {
        period: `${hours} hours`,
        totalErrors: errorLogs.total,
        uniqueErrorTypes: analysis.length,
        patterns: analysis
      };
    } catch (error) {
      this.logger.error('Failed to analyze error patterns', { 
        hours, 
        error: error.message 
      });
      throw error;
    }
  }
}
