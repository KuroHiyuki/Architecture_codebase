/**
 * Create Product Command Handler
 * Handles product creation business logic
 */
import { ICommandHandler } from '../ICommandHandler.js';
import { Product } from '../../../domain/entities/Product.js';

export class CreateProductCommandHandler extends ICommandHandler {
  constructor({ productRepository, unitOfWork, logger }) {
    super();
    this.productRepository = productRepository;
    this.unitOfWork = unitOfWork;
    this.logger = logger;
  }

  async handle(command) {
    try {
      this.logger.info('Starting product creation process', { sku: command.sku });

      // Check if SKU already exists
      const existingProduct = await this.productRepository.findBySku(command.sku);
      if (existingProduct) {
        throw new Error('Product with this SKU already exists');
      }

      // Create product entity
      const product = new Product({
        name: command.name,
        description: command.description,
        sku: command.sku,
        price: command.price,
        currency: command.currency,
        category: command.category,
        tags: command.tags,
        specifications: command.specifications
      });

      // Start transaction
      const session = await this.unitOfWork.startTransaction();

      try {
        // Save product
        const savedProduct = await this.productRepository.save(product, session);
        
        // Commit transaction
        await this.unitOfWork.commitTransaction(session);

        this.logger.info('Product created successfully', { 
          productId: savedProduct.id, 
          sku: savedProduct.sku 
        });

        return {
          success: true,
          data: savedProduct.toJSON(),
          message: 'Product created successfully'
        };

      } catch (error) {
        await this.unitOfWork.rollbackTransaction(session);
        throw error;
      }

    } catch (error) {
      this.logger.error('Product creation failed', { 
        sku: command.sku, 
        error: error.message 
      });
      throw error;
    }
  }
}
