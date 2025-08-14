/**
 * Get Inventory Query
 * Query for retrieving inventory with filters and pagination
 */
import { IQuery } from '../IQuery.js';
import Joi from 'joi';

export class GetInventoryQuery extends IQuery {
  constructor({ 
    page = 1, 
    limit = 10, 
    productId = null, 
    warehouseId = null, 
    location = null,
    lowStock = false,
    overStock = false 
  }) {
    super();
    this.page = page;
    this.limit = limit;
    this.productId = productId;
    this.warehouseId = warehouseId;
    this.location = location;
    this.lowStock = lowStock;
    this.overStock = overStock;
  }

  async validate() {
    const schema = Joi.object({
      page: Joi.number().integer().min(1).default(1),
      limit: Joi.number().integer().min(1).max(100).default(10),
      productId: Joi.string().optional().allow(null),
      warehouseId: Joi.string().optional().allow(null),
      location: Joi.string().optional().allow(null),
      lowStock: Joi.boolean().default(false),
      overStock: Joi.boolean().default(false)
    });

    const { error } = schema.validate({
      page: this.page,
      limit: this.limit,
      productId: this.productId,
      warehouseId: this.warehouseId,
      location: this.location,
      lowStock: this.lowStock,
      overStock: this.overStock
    });

    if (error) {
      throw new Error(error.details[0].message);
    }
  }
}
