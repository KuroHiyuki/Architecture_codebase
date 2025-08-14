/**
 * Reserve Inventory Command
 * Command for reserving inventory stock
 */
import { ICommand } from '../ICommand.js';
import Joi from 'joi';

export class ReserveInventoryCommand extends ICommand {
  constructor({ inventoryId, quantity }) {
    super();
    this.inventoryId = inventoryId;
    this.quantity = quantity;
  }

  async validate() {
    const schema = Joi.object({
      inventoryId: Joi.string().required().messages({
        'any.required': 'Inventory ID is required'
      }),
      quantity: Joi.number().integer().positive().required().messages({
        'number.positive': 'Quantity must be positive',
        'any.required': 'Quantity is required'
      })
    });

    const { error } = schema.validate({
      inventoryId: this.inventoryId,
      quantity: this.quantity
    });

    if (error) {
      throw new Error(error.details[0].message);
    }
  }
}
