/**
 * Delete Inventory Command Handler
 * Handles inventory deletion business logic
 */
import { ICommandHandler } from '../ICommandHandler.js';

export class DeleteInventoryCommandHandler extends ICommandHandler {
  constructor({ inventoryRepository, unitOfWork, logger }) {
    super();
    this.inventoryRepository = inventoryRepository;
    this.unitOfWork = unitOfWork;
    this.logger = logger;
  }

  async handle(command) {
    try {
      this.logger.info('Deleting inventory entry', { 
        inventoryId: command.id 
      });

      const session = await this.unitOfWork.startTransaction();

      try {
        // Check if inventory exists
        const existingInventory = await this.inventoryRepository.findById(command.id);
        if (!existingInventory) {
          throw new Error('Inventory entry not found');
        }

        // Check if inventory has reserved quantity
        if (existingInventory.reservedQuantity > 0) {
          throw new Error('Cannot delete inventory entry with reserved quantity');
        }

        await this.inventoryRepository.delete(command.id, session);
        await this.unitOfWork.commitTransaction(session);

        this.logger.info('Inventory entry deleted successfully', { 
          inventoryId: command.id 
        });

        return {
          success: true,
          message: 'Inventory entry deleted successfully'
        };

      } catch (error) {
        await this.unitOfWork.rollbackTransaction(session);
        throw error;
      }

    } catch (error) {
      this.logger.error('Failed to delete inventory entry', { 
        inventoryId: command.id,
        error: error.message 
      });
      throw error;
    }
  }
}
