/**
 * Fast Read Controller
 * Demonstrates CQRS read model performance
 */
import { ResponseHelper } from '../../shared/ResponseHelper.js';

export class FastReadController {
  constructor({ mediator, logger }) {
    this.mediator = mediator;
    this.logger = logger;
  }

  // Fast product listing using read model
  async getProducts(req, res, next) {
    try {
      const startTime = Date.now();
      
      const { FastGetProductsQuery } = await import('../../application/queries/readModel/FastGetProductsQuery.js');
      
      const query = new FastGetProductsQuery({
        page: parseInt(req.query.page) || 1,
        limit: parseInt(req.query.limit) || 20,
        category: req.query.category,
        tags: req.query.tags ? req.query.tags.split(',') : [],
        minPrice: req.query.minPrice ? parseFloat(req.query.minPrice) : null,
        maxPrice: req.query.maxPrice ? parseFloat(req.query.maxPrice) : null,
        currency: req.query.currency || 'USD',
        search: req.query.search,
        isActive: req.query.isActive !== 'false',
        isLowStock: req.query.isLowStock === 'true',
        sortBy: req.query.sortBy || 'createdAt',
        sortOrder: req.query.sortOrder || 'desc'
      });

      const result = await this.mediator.query(query);
      const executionTime = Date.now() - startTime;

      this.logger.info('Fast products query executed', { 
        totalFound: result.pagination?.total,
        executionTime: `${executionTime}ms`,
        source: 'read-model'
      });

      return ResponseHelper.paginated(
        res, 
        result.data, 
        result.pagination, 
        `${result.message} (${executionTime}ms)`
      );

    } catch (error) {
      next(error);
    }
  }

  // Fast product search using read model text indexes
  async searchProducts(req, res, next) {
    try {
      const startTime = Date.now();
      
      const { FastSearchProductsQuery } = await import('../../application/queries/readModel/FastSearchProductsQuery.js');
      
      const query = new FastSearchProductsQuery({
        searchTerm: req.query.q || req.query.search,
        page: parseInt(req.query.page) || 1,
        limit: parseInt(req.query.limit) || 20,
        category: req.query.category,
        minPrice: req.query.minPrice ? parseFloat(req.query.minPrice) : null,
        maxPrice: req.query.maxPrice ? parseFloat(req.query.maxPrice) : null,
        currency: req.query.currency || 'USD'
      });

      const result = await this.mediator.query(query);
      const executionTime = Date.now() - startTime;

      this.logger.info('Fast product search executed', { 
        searchTerm: result.searchTerm,
        totalFound: result.pagination?.total,
        executionTime: `${executionTime}ms`,
        source: 'read-model'
      });

      return ResponseHelper.paginated(
        res, 
        result.data, 
        result.pagination, 
        `${result.message} (${executionTime}ms)`
      );

    } catch (error) {
      next(error);
    }
  }

  // Fast product by ID using read model with cache
  async getProductById(req, res, next) {
    try {
      const startTime = Date.now();
      
      const { FastGetProductByIdQuery } = await import('../../application/queries/readModel/FastGetProductByIdQuery.js');
      
      const query = new FastGetProductByIdQuery({
        id: req.params.id
      });

      const result = await this.mediator.query(query);
      const executionTime = Date.now() - startTime;

      if (!result.success) {
        return ResponseHelper.notFound(res, result.message, req.originalUrl);
      }

      this.logger.info('Fast product by ID query executed', { 
        productId: req.params.id,
        executionTime: `${executionTime}ms`,
        source: 'read-model'
      });

      return ResponseHelper.success(
        res, 
        result.data, 
        `${result.message} (${executionTime}ms)`
      );

    } catch (error) {
      next(error);
    }
  }

  // Fast inventory analytics using read model
  async getInventoryAnalytics(req, res, next) {
    try {
      const startTime = Date.now();
      
      const { FastInventoryAnalyticsQuery } = await import('../../application/queries/readModel/FastInventoryAnalyticsQuery.js');
      
      const query = new FastInventoryAnalyticsQuery({
        analyticsType: req.params.type || 'summary',
        timeframe: req.query.timeframe || '30d',
        threshold: req.query.threshold ? parseInt(req.query.threshold) : null,
        warehouse: req.query.warehouse,
        category: req.query.category
      });

      const result = await this.mediator.query(query);
      const executionTime = Date.now() - startTime;

      this.logger.info('Fast inventory analytics executed', { 
        analyticsType: result.analyticsType,
        timeframe: result.timeframe,
        executionTime: `${executionTime}ms`,
        source: 'read-model'
      });

      return ResponseHelper.success(
        res, 
        result.data, 
        `${result.message} (${executionTime}ms)`
      );

    } catch (error) {
      next(error);
    }
  }

  // Performance comparison endpoint
  async comparePerformance(req, res, next) {
    try {
      const { FastGetProductsQuery } = await import('../../application/queries/readModel/FastGetProductsQuery.js');
      const { GetProductsQuery } = await import('../../application/queries/product/GetProductsQuery.js');
      
      const queryParams = {
        page: 1,
        limit: 50,
        category: req.query.category,
        isActive: true
      };

      // Execute both queries and measure time
      const startFast = Date.now();
      const fastQuery = new FastGetProductsQuery(queryParams);
      const fastResult = await this.mediator.query(fastQuery);
      const fastTime = Date.now() - startFast;

      const startNormal = Date.now();
      const normalQuery = new GetProductsQuery(queryParams);
      const normalResult = await this.mediator.query(normalQuery);
      const normalTime = Date.now() - startNormal;

      const comparison = {
        readModel: {
          executionTime: `${fastTime}ms`,
          totalResults: fastResult.pagination?.total || 0,
          source: 'denormalized-read-store'
        },
        writeModel: {
          executionTime: `${normalTime}ms`,
          totalResults: normalResult.pagination?.total || 0,
          source: 'normalized-write-store'
        },
        performance: {
          speedImprovement: `${Math.round(((normalTime - fastTime) / normalTime) * 100)}%`,
          fastToNormalRatio: `${(normalTime / fastTime).toFixed(2)}x`,
          description: fastTime < normalTime 
            ? 'Read model is faster' 
            : 'Write model is faster (check indexes)'
        }
      };

      this.logger.info('Performance comparison completed', comparison);

      return ResponseHelper.success(
        res, 
        comparison, 
        'Performance comparison completed'
      );

    } catch (error) {
      next(error);
    }
  }

  // CQRS system health check
  async getSystemHealth(req, res, next) {
    try {
      const container = req.app.get('container');
      const readDatabase = container.resolve('readDatabase');
      const eventBus = container.resolve('eventBus');
      
      const [readDbHealth, eventBusStats] = await Promise.all([
        readDatabase.healthCheck(),
        Promise.resolve(eventBus.getStats())
      ]);

      const health = {
        readDatabase: readDbHealth,
        eventBus: eventBusStats,
        cqrs: {
          status: readDbHealth.status === 'connected' ? 'healthy' : 'degraded',
          readModelSync: eventBusStats.subscriberCount > 0 ? 'active' : 'inactive'
        },
        timestamp: new Date().toISOString()
      };

      return ResponseHelper.success(res, health, 'CQRS system health check');

    } catch (error) {
      next(error);
    }
  }
}
