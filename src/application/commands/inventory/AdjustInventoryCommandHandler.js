/**
 * Adjust Inventory Command Handler
 * Handles inventory quantity adjustments
 */
import { ICommandHandler } from '../ICommandHandler.js';

export class AdjustInventoryCommandHandler extends ICommandHandler {
  constructor({ inventoryRepository, unitOfWork, logger }) {
    super();
    this.inventoryRepository = inventoryRepository;
    this.unitOfWork = unitOfWork;
    this.logger = logger;
  }

  async handle(command) {
    try {
      this.logger.info('Adjusting inventory quantity', { 
        inventoryId: command.inventoryId,
        adjustmentType: command.adjustmentType,
        quantity: command.quantity 
      });

      const session = await this.unitOfWork.startTransaction();

      try {
        // Check if inventory exists
        const inventory = await this.inventoryRepository.findById(command.inventoryId);
        if (!inventory) {
          throw new Error('Inventory entry not found');
        }

        let newQuantity;
        let newReservedQuantity = inventory.reservedQuantity;

        switch (command.adjustmentType) {
          case 'ADD':
            newQuantity = inventory.quantity + command.quantity;
            break;
          case 'SUBTRACT':
            newQuantity = Math.max(0, inventory.quantity - command.quantity);
            // Adjust reserved quantity if necessary
            if (newQuantity < inventory.reservedQuantity) {
              newReservedQuantity = newQuantity;
            }
            break;
          case 'SET':
            newQuantity = command.quantity;
            // Adjust reserved quantity if necessary
            if (newQuantity < inventory.reservedQuantity) {
              newReservedQuantity = newQuantity;
            }
            break;
          case 'RESERVE':
            if (inventory.quantity < inventory.reservedQuantity + command.quantity) {
              throw new Error('Insufficient available quantity to reserve');
            }
            newQuantity = inventory.quantity;
            newReservedQuantity = inventory.reservedQuantity + command.quantity;
            break;
          case 'UNRESERVE':
            newQuantity = inventory.quantity;
            newReservedQuantity = Math.max(0, inventory.reservedQuantity - command.quantity);
            break;
          default:
            throw new Error('Invalid adjustment type');
        }

        const updateData = {
          quantity: newQuantity,
          reservedQuantity: newReservedQuantity,
          updatedAt: new Date()
        };

        const updatedInventory = await this.inventoryRepository.update(
          command.inventoryId,
          updateData,
          session
        );

        await this.unitOfWork.commitTransaction(session);

        this.logger.info('Inventory quantity adjusted successfully', { 
          inventoryId: command.inventoryId,
          oldQuantity: inventory.quantity,
          newQuantity: newQuantity,
          adjustmentType: command.adjustmentType 
        });

        return {
          success: true,
          data: updatedInventory,
          message: 'Inventory quantity adjusted successfully'
        };

      } catch (error) {
        await this.unitOfWork.rollbackTransaction(session);
        throw error;
      }

    } catch (error) {
      this.logger.error('Failed to adjust inventory quantity', { 
        inventoryId: command.inventoryId,
        adjustmentType: command.adjustmentType,
        error: error.message 
      });
      throw error;
    }
  }
}
