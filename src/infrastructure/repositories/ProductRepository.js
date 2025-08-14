/**
 * Product Repository Implementation
 * Implements IProductRepository using MongoDB
 */
import { ProductModel } from '../database/schemas/ProductSchema.js';
import { IProductRepository } from '../../domain/repositories/IProductRepository.js';

export class ProductRepository extends IProductRepository {
  constructor({ database, logger }) {
    super();
    this.database = database;
    this.logger = logger;
    this.model = ProductModel;
  }

  async getModel() {
    if (!this.model) {
      await this.database.connect();
      this.model = ProductModel;
    }
    return this.model;
  }

  async save(product, session = null) {
    try {
      const Model = await this.getModel();
      const productData = product.toJSON ? product.toJSON() : product;
      
      const savedProduct = new Model(productData);
      const result = await savedProduct.save({ session });
      
      this.logger.info('Product saved successfully', { productId: result._id });
      return result;
    } catch (error) {
      this.logger.error('Failed to save product', { error: error.message });
      throw error;
    }
  }

  async findById(id) {
    try {
      const Model = await this.getModel();
      const product = await Model.findById(id);
      
      if (product) {
        this.logger.debug('Product found', { productId: id });
      }
      
      return product;
    } catch (error) {
      this.logger.error('Failed to find product by ID', { productId: id, error: error.message });
      throw error;
    }
  }

  async findByName(name) {
    try {
      const Model = await this.getModel();
      const product = await Model.findOne({ name });
      
      if (product) {
        this.logger.debug('Product found by name', { name });
      }
      
      return product;
    } catch (error) {
      this.logger.error('Failed to find product by name', { name, error: error.message });
      throw error;
    }
  }

  async findBySku(sku) {
    try {
      const Model = await this.getModel();
      const product = await Model.findOne({ sku });
      
      if (product) {
        this.logger.debug('Product found by SKU', { sku });
      }
      
      return product;
    } catch (error) {
      this.logger.error('Failed to find product by SKU', { sku, error: error.message });
      throw error;
    }
  }

  async findAll(filters = {}, options = {}) {
    try {
      const Model = await this.getModel();
      
      const page = parseInt(options.page) || 1;
      const limit = parseInt(options.limit) || 10;
      const skip = (page - 1) * limit;
      const sort = options.sort || { createdAt: -1 };

      // Build query
      const query = Model.find(filters);
      
      // Apply pagination and sorting
      const [data, total] = await Promise.all([
        query.clone().sort(sort).skip(skip).limit(limit).exec(),
        Model.countDocuments(filters)
      ]);

      const totalPages = Math.ceil(total / limit);
      
      this.logger.debug('Products retrieved', { 
        count: data.length, 
        total, 
        page, 
        totalPages 
      });

      return {
        data,
        total,
        page,
        limit,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1
      };
    } catch (error) {
      this.logger.error('Failed to find products', { filters, error: error.message });
      throw error;
    }
  }

  async update(id, updateData, session = null) {
    try {
      const Model = await this.getModel();
      
      const updatedProduct = await Model.findByIdAndUpdate(
        id,
        { $set: updateData },
        { new: true, session, runValidators: true }
      );

      if (!updatedProduct) {
        throw new Error('Product not found');
      }

      this.logger.info('Product updated successfully', { productId: id });
      return updatedProduct;
    } catch (error) {
      this.logger.error('Failed to update product', { productId: id, error: error.message });
      throw error;
    }
  }

  async delete(id, session = null) {
    try {
      const Model = await this.getModel();
      
      const deletedProduct = await Model.findByIdAndDelete(id, { session });
      
      if (!deletedProduct) {
        throw new Error('Product not found');
      }

      this.logger.info('Product deleted successfully', { productId: id });
      return deletedProduct;
    } catch (error) {
      this.logger.error('Failed to delete product', { productId: id, error: error.message });
      throw error;
    }
  }

  async exists(id) {
    try {
      const Model = await this.getModel();
      const exists = await Model.exists({ _id: id });
      return !!exists;
    } catch (error) {
      this.logger.error('Failed to check if product exists', { productId: id, error: error.message });
      throw error;
    }
  }

  async count(filters = {}) {
    try {
      const Model = await this.getModel();
      const count = await Model.countDocuments(filters);
      return count;
    } catch (error) {
      this.logger.error('Failed to count products', { filters, error: error.message });
      throw error;
    }
  }
}
