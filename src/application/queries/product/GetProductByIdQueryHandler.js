/**
 * Get Product By ID Query Handler
 * Handles retrieving a single product by ID
 */
import { IQueryHandler } from '../IQueryHandler.js';

export class GetProductByIdQueryHandler extends IQueryHandler {
  constructor({ productRepository, logger }) {
    super();
    this.productRepository = productRepository;
    this.logger = logger;
  }

  async handle(query) {
    try {
      this.logger.info('Retrieving product by ID', { 
        productId: query.id 
      });

      const product = await this.productRepository.findById(query.id);
      
      if (!product) {
        return {
          success: false,
          data: null,
          message: 'Product not found'
        };
      }

      this.logger.info('Product retrieved successfully', { 
        productId: query.id 
      });

      return {
        success: true,
        data: product,
        message: 'Product retrieved successfully'
      };

    } catch (error) {
      this.logger.error('Failed to retrieve product', { 
        productId: query.id,
        error: error.message 
      });
      throw error;
    }
  }
}
