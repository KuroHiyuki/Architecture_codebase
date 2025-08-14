/**
 * Delete Product Command Handler
 * Handles product deletion business logic
 */
import { ICommandHandler } from '../ICommandHandler.js';

export class DeleteProductCommandHandler extends ICommandHandler {
  constructor({ productRepository, inventoryRepository, unitOfWork, logger }) {
    super();
    this.productRepository = productRepository;
    this.inventoryRepository = inventoryRepository;
    this.unitOfWork = unitOfWork;
    this.logger = logger;
  }

  async handle(command) {
    try {
      this.logger.info('Starting product deletion process', { productId: command.id });

      // Check if product exists
      const existingProduct = await this.productRepository.findById(command.id);
      if (!existingProduct) {
        throw new Error('Product not found');
      }

      // Check if product has inventory
      const hasInventory = await this.inventoryRepository.findByProductId(command.id);
      if (hasInventory && hasInventory.length > 0) {
        throw new Error('Cannot delete product with existing inventory. Please remove inventory first.');
      }

      // Start transaction
      const session = await this.unitOfWork.startTransaction();

      try {
        // Delete product
        const deleted = await this.productRepository.delete(command.id, session);
        
        if (!deleted) {
          throw new Error('Failed to delete product');
        }

        // Commit transaction
        await this.unitOfWork.commitTransaction(session);

        this.logger.info('Product deleted successfully', { 
          productId: command.id,
          productSku: existingProduct.sku
        });

        return {
          success: true,
          message: 'Product deleted successfully'
        };

      } catch (error) {
        await this.unitOfWork.rollbackTransaction(session);
        throw error;
      }

    } catch (error) {
      this.logger.error('Product deletion failed', { 
        productId: command.id, 
        error: error.message 
      });
      throw error;
    }
  }
}
