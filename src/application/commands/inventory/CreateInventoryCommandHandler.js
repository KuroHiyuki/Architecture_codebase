/**
 * Create Inventory Command Handler
 * Handles inventory creation business logic
 */
import { ICommandHandler } from '../ICommandHandler.js';
import { Inventory } from '../../../domain/entities/Inventory.js';

export class CreateInventoryCommandHandler extends ICommandHandler {
  constructor({ inventoryRepository, productRepository, unitOfWork, logger }) {
    super();
    this.inventoryRepository = inventoryRepository;
    this.productRepository = productRepository;
    this.unitOfWork = unitOfWork;
    this.logger = logger;
  }

  async handle(command) {
    try {
      this.logger.info('Creating new inventory entry', { 
        productId: command.productId,
        warehouseId: command.warehouseId,
        quantity: command.quantity 
      });

      const session = await this.unitOfWork.startTransaction();

      try {
        // Verify product exists
        const product = await this.productRepository.findById(command.productId);
        if (!product) {
          throw new Error('Product not found');
        }

        // Check if inventory entry already exists for this product and warehouse
        const existingInventory = await this.inventoryRepository.findByProductAndWarehouse(
          command.productId,
          command.warehouseId
        );

        if (existingInventory) {
          throw new Error('Inventory entry already exists for this product and warehouse');
        }

        // Create new inventory
        const inventory = new Inventory({
          productId: command.productId,
          warehouseId: command.warehouseId,
          quantity: command.quantity,
          reservedQuantity: command.reservedQuantity || 0,
          minimumStock: command.minStockLevel || 0,
          maximumStock: command.maxStockLevel || null,
          location: command.location || null,
          notes: command.notes || null
        });

        const savedInventory = await this.inventoryRepository.save(inventory, session);
        await this.unitOfWork.commitTransaction(session);

        this.logger.info('Inventory entry created successfully', { 
          inventoryId: savedInventory.id,
          productId: command.productId,
          warehouseId: command.warehouseId 
        });

        return {
          success: true,
          data: savedInventory,
          message: 'Inventory entry created successfully'
        };

      } catch (error) {
        await this.unitOfWork.rollbackTransaction(session);
        throw error;
      }

    } catch (error) {
      this.logger.error('Failed to create inventory entry', { 
        productId: command.productId,
        warehouseId: command.warehouseId,
        error: error.message 
      });
      throw error;
    }
  }
}
