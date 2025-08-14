/**
 * Update Product Command Handler
 * Handles product update business logic
 */
import { ICommandHandler } from '../ICommandHandler.js';

export class UpdateProductCommandHandler extends ICommandHandler {
  constructor({ productRepository, unitOfWork, logger }) {
    super();
    this.productRepository = productRepository;
    this.unitOfWork = unitOfWork;
    this.logger = logger;
  }

  async handle(command) {
    try {
      this.logger.info('Starting product update process', { productId: command.id });

      // Check if product exists
      const existingProduct = await this.productRepository.findById(command.id);
      if (!existingProduct) {
        throw new Error('Product not found');
      }

      // Start transaction
      const session = await this.unitOfWork.startTransaction();

      try {
        // Update product fields
        const updateData = {};
        if (command.name !== undefined) updateData.name = command.name;
        if (command.description !== undefined) updateData.description = command.description;
        if (command.price !== undefined || command.currency !== undefined) {
          updateData.price = {
            amount: command.price !== undefined ? command.price : existingProduct.price.amount,
            currency: command.currency !== undefined ? command.currency : existingProduct.price.currency
          };
        }
        if (command.category !== undefined) updateData.category = command.category;
        if (command.tags !== undefined) updateData.tags = command.tags;
        if (command.specifications !== undefined) updateData.specifications = command.specifications;

        // Update product
        const updatedProduct = await this.productRepository.update(command.id, updateData, session);
        
        // Commit transaction
        await this.unitOfWork.commitTransaction(session);

        this.logger.info('Product updated successfully', { 
          productId: command.id,
          updatedFields: Object.keys(updateData)
        });

        return {
          success: true,
          data: updatedProduct.toJSON(),
          message: 'Product updated successfully'
        };

      } catch (error) {
        await this.unitOfWork.rollbackTransaction(session);
        throw error;
      }

    } catch (error) {
      this.logger.error('Product update failed', { 
        productId: command.id, 
        error: error.message 
      });
      throw error;
    }
  }
}
