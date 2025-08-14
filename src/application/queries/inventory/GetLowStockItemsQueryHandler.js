/**
 * Get Low Stock Items Query Handler
 * Handles retrieving inventory items with low stock levels
 */
import { IQueryHandler } from '../IQueryHandler.js';

export class GetLowStockItemsQueryHandler extends IQueryHandler {
  constructor({ inventoryRepository, logger }) {
    super();
    this.inventoryRepository = inventoryRepository;
    this.logger = logger;
  }

  async handle(query) {
    try {
      this.logger.info('Retrieving low stock items', { 
        warehouseId: query.warehouseId 
      });

      const filters = {
        $expr: {
          $lte: ['$quantity', '$minimumStock']
        }
      };

      // Filter by warehouse if specified
      if (query.warehouseId) {
        filters.warehouseId = query.warehouseId;
      }

      const options = {
        page: query.page || 1,
        limit: query.limit || 50,
        sort: { 
          // Sort by how critical the shortage is (percentage below minimum)
          $expr: {
            $divide: ['$quantity', '$minStockLevel']
          }
        }
      };

      const result = await this.inventoryRepository.findAll(filters, options);

      // Calculate shortage details for each item
      const itemsWithShortageDetails = result.data.map(item => ({
        ...item.toJSON(),
        shortageAmount: Math.max(0, item.minimumStock - item.quantity),
        shortagePercentage: item.minimumStock > 0 
          ? Math.round(((item.minimumStock - item.quantity) / item.minimumStock) * 100)
          : 0,
        availableQuantity: Math.max(0, item.quantity - item.reservedQuantity)
      }));

      this.logger.info('Low stock items retrieved successfully', { 
        count: result.data.length,
        total: result.total 
      });

      return {
        success: true,
        data: itemsWithShortageDetails,
        pagination: {
          page: result.page,
          limit: result.limit,
          total: result.total,
          totalPages: result.totalPages,
          hasNext: result.hasNext,
          hasPrev: result.hasPrev
        },
        message: 'Low stock items retrieved successfully'
      };

    } catch (error) {
      this.logger.error('Failed to retrieve low stock items', { 
        error: error.message 
      });
      throw error;
    }
  }
}
