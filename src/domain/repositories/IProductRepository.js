/**
 * Product Repository Interface
 * Domain interface for product data access
 */
import { IRepository } from './IRepository.js';

export class IProductRepository extends IRepository {
  async findBySku(sku) {
    throw new Error('Method findBySku must be implemented');
  }

  async findByCategory(category, pagination = {}) {
    throw new Error('Method findByCategory must be implemented');
  }

  async findByName(name, isExact = false) {
    throw new Error('Method findByName must be implemented');
  }

  async findActiveProducts(pagination = {}) {
    throw new Error('Method findActiveProducts must be implemented');
  }

  async skuExists(sku) {
    throw new Error('Method skuExists must be implemented');
  }

  async findByTags(tags, pagination = {}) {
    throw new Error('Method findByTags must be implemented');
  }

  async findByPriceRange(minPrice, maxPrice, currency = 'USD', pagination = {}) {
    throw new Error('Method findByPriceRange must be implemented');
  }
}
