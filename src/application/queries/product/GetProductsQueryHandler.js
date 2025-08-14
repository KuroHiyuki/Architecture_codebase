/**
 * Get Products Query Handler
 * Handles retrieving multiple products with pagination and filtering
 */
import { IQueryHandler } from '../IQueryHandler.js';

export class GetProductsQueryHandler extends IQueryHandler {
  constructor({ productRepository, logger }) {
    super();
    this.productRepository = productRepository;
    this.logger = logger;
  }

  async handle(query) {
    try {
      this.logger.info('Retrieving products', { 
        page: query.page,
        limit: query.limit,
        filters: query.filters 
      });

      const options = {
        page: query.page || 1,
        limit: query.limit || 10,
        sort: query.sort || { createdAt: -1 }
      };

      const filters = {};
      
      // Apply filters
      if (query.filters) {
        if (query.filters.name) {
          filters.name = { $regex: query.filters.name, $options: 'i' };
        }
        
        if (query.filters.category) {
          filters.category = query.filters.category;
        }
        
        if (query.filters.isActive !== undefined) {
          filters.isActive = query.filters.isActive;
        }
        
        if (query.filters.minPrice || query.filters.maxPrice) {
          filters.price = {};
          if (query.filters.minPrice) {
            filters.price.$gte = query.filters.minPrice;
          }
          if (query.filters.maxPrice) {
            filters.price.$lte = query.filters.maxPrice;
          }
        }
      }

      const result = await this.productRepository.findAll(filters, options);

      this.logger.info('Products retrieved successfully', { 
        count: result.data.length,
        total: result.total,
        page: result.page 
      });

      return {
        success: true,
        data: result.data,
        pagination: {
          page: result.page,
          limit: result.limit,
          total: result.total,
          totalPages: result.totalPages,
          hasNext: result.hasNext,
          hasPrev: result.hasPrev
        },
        message: 'Products retrieved successfully'
      };

    } catch (error) {
      this.logger.error('Failed to retrieve products', { 
        error: error.message 
      });
      throw error;
    }
  }
}
