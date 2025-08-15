/**
 * Product Controller
 * Handles product management endpoints
 */
import { ResponseHelper } from '../../shared/ResponseHelper.js';
export class ProductController {
  constructor({ mediator, logger }) {
    this.mediator = mediator;
    this.logger = logger;
  }

  async create(req, res, next) {
    try {
      const { CreateProductCommand } = await import('../../application/commands/product/CreateProductCommand.js');
      
      const command = new CreateProductCommand({
        name: req.body.name,
        description: req.body.description,
        sku: req.body.sku,
        price: req.body.price,
        currency: req.body.currency,
        category: req.body.category,
        tags: req.body.tags,
        specifications: req.body.specifications
      });

      const result = await this.mediator.send(command);

      this.logger.info('Product created successfully', { 
        productId: result.data.id,
        sku: result.data.sku,
        userId: req.user.id
      });
      return ResponseHelper.created(res, result.data, 'Product created successfully');

    } catch (error) {
      next(error);
    }
  }

  async getById(req, res, next) {
    try {
      const { GetProductByIdQuery } = await import('../../application/queries/product/GetProductByIdQuery.js');
      
      const query = new GetProductByIdQuery({
        id: req.params.id
      });

      const result = await this.mediator.query(query);

      if (!result) {
        return ResponseHelper.notFound(res, 'Product not found', req.originalUrl);
      }
      return ResponseHelper.success(res, result, 'Product retrieved successfully');

    } catch (error) {
      next(error);
    }
  }

  async getAll(req, res, next) {
    try {
      const { GetProductsQuery } = await import('../../application/queries/product/GetProductsQuery.js');
      
      const query = new GetProductsQuery({
        page: parseInt(req.query.page) || 1,
        limit: parseInt(req.query.limit) || 10,
        category: req.query.category,
        tags: req.query.tags ? req.query.tags.split(',') : [],
        minPrice: req.query.minPrice ? parseFloat(req.query.minPrice) : null,
        maxPrice: req.query.maxPrice ? parseFloat(req.query.maxPrice) : null,
        currency: req.query.currency || 'USD',
        search: req.query.search,
        isActive: req.query.isActive !== 'false'
      });

      const result = await this.mediator.query(query);
      return ResponseHelper.paginated(res, result.data, result.pagination, 'Products retrieved successfully');

    } catch (error) {
      next(error);
    }
  }

  async update(req, res, next) {
    try {
      const { UpdateProductCommand } = await import('../../application/commands/product/UpdateProductCommand.js');
      
      const command = new UpdateProductCommand({
        id: req.params.id,
        name: req.body.name,
        description: req.body.description,
        price: req.body.price,
        currency: req.body.currency,
        category: req.body.category,
        tags: req.body.tags,
        specifications: req.body.specifications
      });

      const result = await this.mediator.send(command);

      if (!result) {
        return ResponseHelper.notFound(res, 'Product not found', req.originalUrl);
      }

      this.logger.info('Product updated successfully', { 
        productId: req.params.id,
        userId: req.user.id
      });
      return ResponseHelper.noContent(res, 'Product updated successfully');

    } catch (error) {
      next(error);
    }
  }

  async delete(req, res, next) {
    try {
      const { DeleteProductCommand } = await import('../../application/commands/product/DeleteProductCommand.js');
      
      const command = new DeleteProductCommand({
        id: req.params.id
      });

      const result = await this.mediator.send(command);

      if (!result) {
        return ResponseHelper.notFound(res, 'Product not found', req.originalUrl);
      }

      this.logger.info('Product deleted successfully', { 
        productId: req.params.id,
        userId: req.user.id
      });

      return ResponseHelper.noContent(res, 'Product deleted successfully');

    } catch (error) {
      next(error);
    }
  }

  async getByCategory(req, res, next) {
    try {
      const { GetProductsQuery } = await import('../../application/queries/product/GetProductsQuery.js');
      
      const query = new GetProductsQuery({
        page: parseInt(req.query.page) || 1,
        limit: parseInt(req.query.limit) || 10,
        category: req.params.category,
        isActive: req.query.isActive !== 'false'
      });

      const result = await this.mediator.query(query);

      return ResponseHelper.paginated(res, result.data, result.pagination, 'Products retrieved successfully');
    

    } catch (error) {
      next(error);
    }
  }

  async search(req, res, next) {
    try {
      const { GetProductsQuery } = await import('../../application/queries/product/GetProductsQuery.js');
      
      const query = new GetProductsQuery({
        page: parseInt(req.query.page) || 1,
        limit: parseInt(req.query.limit) || 10,
        search: req.query.q,
        category: req.query.category,
        tags: req.query.tags ? req.query.tags.split(',') : [],
        minPrice: req.query.minPrice ? parseFloat(req.query.minPrice) : null,
        maxPrice: req.query.maxPrice ? parseFloat(req.query.maxPrice) : null,
        currency: req.query.currency || 'USD',
        isActive: req.query.isActive !== 'false'
      });

      const result = await this.mediator.query(query);

      return ResponseHelper.paginated(res, result.data, result.pagination, 'Search results retrieved successfully');

    } catch (error) {
      next(error);
    }
  }
}
