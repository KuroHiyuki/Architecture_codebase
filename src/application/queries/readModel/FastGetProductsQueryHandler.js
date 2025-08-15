/**
 * Fast Product Query Handler
 * Uses read model for optimized queries
 */
import { IQueryHandler } from '../IQueryHandler.js';

export class FastGetProductsQueryHandler extends IQueryHandler {
  constructor({ productReadRepository, logger }) {
    super();
    this.productReadRepository = productReadRepository;
    this.logger = logger;
  }

  async handle(query) {
    try {
      this.logger.info('Processing fast products query', { 
        filters: {
          category: query.category,
          tags: query.tags?.length,
          search: query.search,
          page: query.page,
          limit: query.limit
        }
      });

      const filters = {
        page: query.page || 1,
        limit: query.limit || 20,
        category: query.category,
        tags: query.tags,
        minPrice: query.minPrice,
        maxPrice: query.maxPrice,
        currency: query.currency,
        search: query.search,
        isActive: query.isActive,
        isLowStock: query.isLowStock,
        sortBy: query.sortBy || 'createdAt',
        sortOrder: query.sortOrder || 'desc'
      };

      const result = await this.productReadRepository.findAll(filters);

      this.logger.info('Fast products query completed', { 
        totalFound: result.pagination.total,
        page: result.pagination.page,
        executionTime: 'fast'
      });

      return {
        success: true,
        data: result.data,
        pagination: result.pagination,
        message: 'Products retrieved successfully from read store'
      };

    } catch (error) {
      this.logger.error('Fast products query failed', { 
        query: query,
        error: error.message 
      });
      throw error;
    }
  }
}
