/**
 * Get Inventory Query Handler
 * Handles retrieving multiple inventory entries with pagination and filtering
 */
import { IQueryHandler } from '../IQueryHandler.js';

export class GetInventoryQueryHandler extends IQueryHandler {
  constructor({ inventoryRepository, logger }) {
    super();
    this.inventoryRepository = inventoryRepository;
    this.logger = logger;
  }

  async handle(query) {
    try {
      this.logger.info('Retrieving inventory entries', { 
        page: query.page,
        limit: query.limit,
        filters: query.filters 
      });

      const options = {
        page: query.page || 1,
        limit: query.limit || 10,
        sort: query.sort || { updatedAt: -1 }
      };

      const filters = {};
      
      // Apply filters
      if (query.filters) {
        if (query.filters.productId) {
          filters.productId = query.filters.productId;
        }
        
        if (query.filters.warehouseId) {
          filters.warehouseId = query.filters.warehouseId;
        }
        
        if (query.filters.lowStock !== undefined && query.filters.lowStock) {
          // Find items where quantity is less than or equal to minimum stock level
          filters.$expr = {
            $lte: ['$quantity', '$minimumStock']
          };
        }
        
        if (query.filters.minQuantity || query.filters.maxQuantity) {
          filters.quantity = {};
          if (query.filters.minQuantity) {
            filters.quantity.$gte = query.filters.minQuantity;
          }
          if (query.filters.maxQuantity) {
            filters.quantity.$lte = query.filters.maxQuantity;
          }
        }
        
        if (query.filters.location) {
          filters.location = { $regex: query.filters.location, $options: 'i' };
        }
      }

      const result = await this.inventoryRepository.findAll(filters, options);

      this.logger.info('Inventory entries retrieved successfully', { 
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
        message: 'Inventory entries retrieved successfully'
      };

    } catch (error) {
      this.logger.error('Failed to retrieve inventory entries', { 
        error: error.message 
      });
      throw error;
    }
  }
}
