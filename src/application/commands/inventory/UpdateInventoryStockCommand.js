/**
 * Update Inventory Stock Command
 * Command for updating inventory stock levels
 */
import { ICommand } from '../ICommand.js';
import Joi from 'joi';

export class UpdateInventoryStockCommand extends ICommand {
  constructor({ inventoryId, quantity, operation = 'add', unitCost = null }) {
    super();
    this.inventoryId = inventoryId;
    this.quantity = quantity;
    this.operation = operation; // 'add' or 'remove'
    this.unitCost = unitCost;
  }

  async validate() {
    const schema = Joi.object({
      inventoryId: Joi.string().required().messages({
        'any.required': 'Inventory ID is required'
      }),
      quantity: Joi.number().integer().positive().required().messages({
        'number.positive': 'Quantity must be positive',
        'any.required': 'Quantity is required'
      }),
      operation: Joi.string().valid('add', 'remove').default('add'),
      unitCost: Joi.number().min(0).precision(2).optional().allow(null)
    });

    const { error } = schema.validate({
      inventoryId: this.inventoryId,
      quantity: this.quantity,
      operation: this.operation,
      unitCost: this.unitCost
    });

    if (error) {
      throw new Error(error.details[0].message);
    }
  }
}
