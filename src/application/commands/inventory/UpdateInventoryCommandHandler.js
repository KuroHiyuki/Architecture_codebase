/**
 * Update Inventory Command Handler
 * Handles inventory update business logic
 */
import { ICommandHandler } from '../ICommandHandler.js';

export class UpdateInventoryCommandHandler extends ICommandHandler {
  constructor({ inventoryRepository, unitOfWork, logger }) {
    super();
    this.inventoryRepository = inventoryRepository;
    this.unitOfWork = unitOfWork;
    this.logger = logger;
  }

  async handle(command) {
    try {
      this.logger.info('Updating inventory entry', { 
        inventoryId: command.id 
      });

      const session = await this.unitOfWork.startTransaction();

      try {
        // Check if inventory exists
        const existingInventory = await this.inventoryRepository.findById(command.id);
        if (!existingInventory) {
          throw new Error('Inventory entry not found');
        }

        // Prepare update data
        const updateData = {};
        
        if (command.quantity !== undefined) {
          updateData.quantity = command.quantity;
        }
        
        if (command.reservedQuantity !== undefined) {
          updateData.reservedQuantity = command.reservedQuantity;
        }
        
        if (command.minStockLevel !== undefined) {
          updateData.minimumStock = command.minStockLevel;
        }
        
        if (command.maxStockLevel !== undefined) {
          updateData.maximumStock = command.maxStockLevel;
        }
        
        if (command.location !== undefined) {
          updateData.location = command.location;
        }
        
        if (command.notes !== undefined) {
          updateData.notes = command.notes;
        }

        updateData.updatedAt = new Date();

        const updatedInventory = await this.inventoryRepository.update(
          command.id,
          updateData,
          session
        );

        await this.unitOfWork.commitTransaction(session);

        this.logger.info('Inventory entry updated successfully', { 
          inventoryId: command.id 
        });

        return {
          success: true,
          data: updatedInventory,
          message: 'Inventory entry updated successfully'
        };

      } catch (error) {
        await this.unitOfWork.rollbackTransaction(session);
        throw error;
      }

    } catch (error) {
      this.logger.error('Failed to update inventory entry', { 
        inventoryId: command.id,
        error: error.message 
      });
      throw error;
    }
  }
}
