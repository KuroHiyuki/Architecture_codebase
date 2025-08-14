/**
 * Get Inventory By ID Query Handler
 * Handles retrieving a single inventory entry by ID
 */
import { IQueryHandler } from '../IQueryHandler.js';

export class GetInventoryByIdQueryHandler extends IQueryHandler {
  constructor({ inventoryRepository, logger }) {
    super();
    this.inventoryRepository = inventoryRepository;
    this.logger = logger;
  }

  async handle(query) {
    try {
      this.logger.info('Retrieving inventory by ID', { 
        inventoryId: query.id 
      });

      const inventory = await this.inventoryRepository.findById(query.id);
      
      if (!inventory) {
        return {
          success: false,
          data: null,
          message: 'Inventory entry not found'
        };
      }

      this.logger.info('Inventory retrieved successfully', { 
        inventoryId: query.id 
      });

      return {
        success: true,
        data: inventory,
        message: 'Inventory entry retrieved successfully'
      };

    } catch (error) {
      this.logger.error('Failed to retrieve inventory', { 
        inventoryId: query.id,
        error: error.message 
      });
      throw error;
    }
  }
}
