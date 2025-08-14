/**
 * Get Products Query
 * Query for retrieving products with filters and pagination
 */
import { IQuery } from '../IQuery.js';
import Joi from 'joi';

export class GetProductsQuery extends IQuery {
  constructor({ 
    page = 1, 
    limit = 10, 
    category = null, 
    tags = [], 
    minPrice = null, 
    maxPrice = null, 
    currency = 'USD',
    search = null,
    isActive = true 
  }) {
    super();
    this.page = page;
    this.limit = limit;
    this.category = category;
    this.tags = tags;
    this.minPrice = minPrice;
    this.maxPrice = maxPrice;
    this.currency = currency;
    this.search = search;
    this.isActive = isActive;
  }

  async validate() {
    const schema = Joi.object({
      page: Joi.number().integer().min(1).default(1),
      limit: Joi.number().integer().min(1).max(100).default(10),
      category: Joi.string().optional().allow(null),
      tags: Joi.array().items(Joi.string()).optional(),
      minPrice: Joi.number().min(0).optional().allow(null),
      maxPrice: Joi.number().min(0).optional().allow(null),
      currency: Joi.string().valid('USD', 'EUR', 'GBP', 'JPY', 'CAD', 'AUD', 'VND').default('USD'),
      search: Joi.string().optional().allow(null),
      isActive: Joi.boolean().default(true)
    });

    const { error } = schema.validate({
      page: this.page,
      limit: this.limit,
      category: this.category,
      tags: this.tags,
      minPrice: this.minPrice,
      maxPrice: this.maxPrice,
      currency: this.currency,
      search: this.search,
      isActive: this.isActive
    });

    if (error) {
      throw new Error(error.details[0].message);
    }

    // Business rule validation
    if (this.minPrice && this.maxPrice && this.minPrice >= this.maxPrice) {
      throw new Error('Maximum price must be greater than minimum price');
    }
  }
}
