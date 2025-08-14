/**
 * Create Inventory Command
 * Command for creating new inventory records
 */
import { ICommand } from '../ICommand.js';
import Joi from 'joi';

export class CreateInventoryCommand extends ICommand {
  constructor({ productId, quantity = 0, location, warehouseId, minimumStock = 0, maximumStock = null, unitCost = 0 }) {
    super();
    this.productId = productId;
    this.quantity = quantity;
    this.location = location;
    this.warehouseId = warehouseId;
    this.minimumStock = minimumStock;
    this.maximumStock = maximumStock;
    this.unitCost = unitCost;
  }

  async validate() {
    const schema = Joi.object({
      productId: Joi.string().required().messages({
        'any.required': 'Product ID is required'
      }),
      quantity: Joi.number().integer().min(0).default(0),
      location: Joi.string().min(2).max(100).required().messages({
        'string.min': 'Location must be at least 2 characters long',
        'string.max': 'Location cannot exceed 100 characters',
        'any.required': 'Location is required'
      }),
      warehouseId: Joi.string().required().messages({
        'any.required': 'Warehouse ID is required'
      }),
      minimumStock: Joi.number().integer().min(0).default(0),
      maximumStock: Joi.number().integer().positive().optional().allow(null),
      unitCost: Joi.number().min(0).precision(2).default(0)
    });

    const { error } = schema.validate({
      productId: this.productId,
      quantity: this.quantity,
      location: this.location,
      warehouseId: this.warehouseId,
      minimumStock: this.minimumStock,
      maximumStock: this.maximumStock,
      unitCost: this.unitCost
    });

    if (error) {
      throw new Error(error.details[0].message);
    }

    // Business rule validation
    if (this.maximumStock && this.minimumStock >= this.maximumStock) {
      throw new Error('Maximum stock must be greater than minimum stock');
    }
  }
}
