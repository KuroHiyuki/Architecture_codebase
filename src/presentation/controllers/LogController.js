/**
 * Log Management Controller
 * REST API endpoints for log management and monitoring
 */
import { ResponseHelper } from '../../shared/ResponseHelper.js';

export class LogController {
  constructor({ logService, logger }) {
    this.logService = logService;
    this.logger = logger;
  }

  // GET /api/logs - Get logs with filtering and pagination
  async getLogs(req, res) {
    try {
      const {
        level,
        service,
        startDate,
        endDate,
        search,
        page = 1,
        limit = 50,
        sort = 'timestamp',
        order = 'desc'
      } = req.query;

      // Build filters
      const filters = {};
      
      if (level) {
        filters.level = level;
      }
      
      if (service) {
        filters.service = service;
      }
      
      if (startDate || endDate) {
        filters.timestamp = {};
        if (startDate) {
          filters.timestamp.$gte = new Date(startDate);
        }
        if (endDate) {
          filters.timestamp.$lte = new Date(endDate);
        }
      }
      
      if (search) {
        filters.$text = { $search: search };
      }

      // Build options
      const options = {
        page: parseInt(page),
        limit: parseInt(limit),
        sort: { [sort]: order === 'desc' ? -1 : 1 }
      };

      const result = await this.logService.getLogs(filters, options);

      this.logger.info('Logs retrieved via API', {
        filters,
        options,
        resultCount: result.logs.length,
        userId: req.user?.id
      });

      return ResponseHelper.success(res, result, 'Logs retrieved successfully');
    } catch (error) {
      this.logger.error('Failed to retrieve logs via API', {
        query: req.query,
        userId: req.user?.id,
        error: error.message
      });
      return ResponseHelper.error(res, error.message, 500);
    }
  }

  // GET /api/logs/errors - Get error logs
  async getErrorLogs(req, res) {
    try {
      const { limit = 100 } = req.query;
      
      const result = await this.logService.getErrorLogs(parseInt(limit));

      this.logger.info('Error logs retrieved via API', {
        limit,
        resultCount: result.logs.length,
        userId: req.user?.id
      });

      return ResponseHelper.success(res, result, 'Error logs retrieved successfully');
    } catch (error) {
      this.logger.error('Failed to retrieve error logs via API', {
        query: req.query,
        userId: req.user?.id,
        error: error.message
      });
      return ResponseHelper.error(res, error.message, 500);
    }
  }

  // GET /api/logs/level/:level - Get logs by level
  async getLogsByLevel(req, res) {
    try {
      const { level } = req.params;
      const { limit = 100 } = req.query;
      
      const result = await this.logService.getLogsByLevel(level, parseInt(limit));

      this.logger.info('Logs by level retrieved via API', {
        level,
        limit,
        resultCount: result.logs.length,
        userId: req.user?.id
      });

      return ResponseHelper.success(res, result, `${level} logs retrieved successfully`);
    } catch (error) {
      this.logger.error('Failed to retrieve logs by level via API', {
        params: req.params,
        query: req.query,
        userId: req.user?.id,
        error: error.message
      });
      return ResponseHelper.error(res, error.message, 500);
    }
  }

  // GET /api/logs/service/:service - Get logs by service
  async getLogsByService(req, res) {
    try {
      const { service } = req.params;
      const { limit = 100 } = req.query;
      
      const result = await this.logService.getLogsByService(service, parseInt(limit));

      this.logger.info('Logs by service retrieved via API', {
        service,
        limit,
        resultCount: result.logs.length,
        userId: req.user?.id
      });

      return ResponseHelper.success(res, result, `Logs for ${service} retrieved successfully`);
    } catch (error) {
      this.logger.error('Failed to retrieve logs by service via API', {
        params: req.params,
        query: req.query,
        userId: req.user?.id,
        error: error.message
      });
      return ResponseHelper.error(res, error.message, 500);
    }
  }

  // GET /api/logs/user/:userId - Get logs by user
  async getLogsByUser(req, res) {
    try {
      const { userId } = req.params;
      const { limit = 100 } = req.query;
      
      // Check if user can access other users' logs (admin only)
      if (req.user?.id !== userId && req.user?.role !== 'admin') {
        return ResponseHelper.error(res, 'Unauthorized to access other users logs', 403);
      }
      
      const result = await this.logService.getLogsByUser(userId, parseInt(limit));

      this.logger.info('Logs by user retrieved via API', {
        targetUserId: userId,
        limit,
        resultCount: result.logs.length,
        requesterId: req.user?.id
      });

      return ResponseHelper.success(res, result, `Logs for user ${userId} retrieved successfully`);
    } catch (error) {
      this.logger.error('Failed to retrieve logs by user via API', {
        params: req.params,
        query: req.query,
        userId: req.user?.id,
        error: error.message
      });
      return ResponseHelper.error(res, error.message, 500);
    }
  }

  // GET /api/logs/search - Search logs
  async searchLogs(req, res) {
    try {
      const { q: searchTerm, limit = 100 } = req.query;
      
      if (!searchTerm) {
        return ResponseHelper.error(res, 'Search term is required', 400);
      }
      
      const result = await this.logService.searchLogs(searchTerm, parseInt(limit));

      this.logger.info('Log search performed via API', {
        searchTerm,
        limit,
        resultCount: result.logs.length,
        userId: req.user?.id
      });

      return ResponseHelper.success(res, result, 'Log search completed successfully');
    } catch (error) {
      this.logger.error('Failed to search logs via API', {
        query: req.query,
        userId: req.user?.id,
        error: error.message
      });
      return ResponseHelper.error(res, error.message, 500);
    }
  }

  // GET /api/logs/statistics - Get log statistics
  async getLogStatistics(req, res) {
    try {
      const {
        level,
        service,
        startDate,
        endDate
      } = req.query;

      // Build filters
      const filters = {};
      
      if (level) {
        filters.level = level;
      }
      
      if (service) {
        filters.service = service;
      }
      
      if (startDate || endDate) {
        filters.timestamp = {};
        if (startDate) {
          filters.timestamp.$gte = new Date(startDate);
        }
        if (endDate) {
          filters.timestamp.$lte = new Date(endDate);
        }
      }

      const result = await this.logService.getLogStatistics(filters);

      this.logger.info('Log statistics retrieved via API', {
        filters,
        totalLogs: result.totalLogs,
        userId: req.user?.id
      });

      return ResponseHelper.success(res, result, 'Log statistics retrieved successfully');
    } catch (error) {
      this.logger.error('Failed to retrieve log statistics via API', {
        query: req.query,
        userId: req.user?.id,
        error: error.message
      });
      return ResponseHelper.error(res, error.message, 500);
    }
  }

  // GET /api/logs/recent - Get recent logs
  async getRecentLogs(req, res) {
    try {
      const { minutes = 10, level } = req.query;
      
      const result = await this.logService.getRecentLogs(parseInt(minutes), level);

      this.logger.info('Recent logs retrieved via API', {
        minutes,
        level,
        resultCount: result.logs.length,
        userId: req.user?.id
      });

      return ResponseHelper.success(res, result, 'Recent logs retrieved successfully');
    } catch (error) {
      this.logger.error('Failed to retrieve recent logs via API', {
        query: req.query,
        userId: req.user?.id,
        error: error.message
      });
      return ResponseHelper.error(res, error.message, 500);
    }
  }

  // GET /api/logs/health - Get system health based on logs
  async getSystemHealth(req, res) {
    try {
      const result = await this.logService.getSystemHealth();

      this.logger.info('System health retrieved via API', {
        status: result.status,
        errorRate: result.errorRate,
        userId: req.user?.id
      });

      return ResponseHelper.success(res, result, 'System health retrieved successfully');
    } catch (error) {
      this.logger.error('Failed to retrieve system health via API', {
        userId: req.user?.id,
        error: error.message
      });
      return ResponseHelper.error(res, error.message, 500);
    }
  }

  // GET /api/logs/analysis/errors - Analyze error patterns
  async analyzeErrorPatterns(req, res) {
    try {
      const { hours = 24 } = req.query;
      
      const result = await this.logService.analyzeErrorPatterns(parseInt(hours));

      this.logger.info('Error pattern analysis completed via API', {
        hours,
        totalErrors: result.totalErrors,
        uniqueErrorTypes: result.uniqueErrorTypes,
        userId: req.user?.id
      });

      return ResponseHelper.success(res, result, 'Error pattern analysis completed successfully');
    } catch (error) {
      this.logger.error('Failed to analyze error patterns via API', {
        query: req.query,
        userId: req.user?.id,
        error: error.message
      });
      return ResponseHelper.error(res, error.message, 500);
    }
  }

  // GET /api/logs/export - Export logs (admin only)
  async exportLogs(req, res) {
    try {
      // Check admin permission
      if (req.user?.role !== 'admin') {
        return ResponseHelper.error(res, 'Admin access required', 403);
      }

      const {
        format = 'json',
        level,
        startDate,
        endDate,
        limit = 10000
      } = req.query;

      // Build filters
      const filters = {};
      
      if (level) {
        filters.level = level;
      }
      
      if (startDate || endDate) {
        filters.timestamp = {};
        if (startDate) {
          filters.timestamp.$gte = new Date(startDate);
        }
        if (endDate) {
          filters.timestamp.$lte = new Date(endDate);
        }
      }

      const result = await this.logService.getLogs(filters, {
        limit: parseInt(limit),
        sort: { timestamp: -1 }
      });

      // Set response headers for download
      const timestamp = new Date().toISOString().split('T')[0];
      const filename = `logs_${timestamp}.${format}`;
      
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      
      if (format === 'csv') {
        res.setHeader('Content-Type', 'text/csv');
        // Convert to CSV format
        const csvHeader = 'timestamp,level,message,service,environment\n';
        const csvData = result.logs.map(log => 
          `"${log.timestamp}","${log.level}","${log.message}","${log.service}","${log.environment}"`
        ).join('\n');
        res.send(csvHeader + csvData);
      } else {
        res.setHeader('Content-Type', 'application/json');
        res.send(JSON.stringify(result, null, 2));
      }

      this.logger.info('Logs exported via API', {
        format,
        filters,
        exportedCount: result.logs.length,
        userId: req.user?.id
      });

    } catch (error) {
      this.logger.error('Failed to export logs via API', {
        query: req.query,
        userId: req.user?.id,
        error: error.message
      });
      return ResponseHelper.error(res, error.message, 500);
    }
  }
}
