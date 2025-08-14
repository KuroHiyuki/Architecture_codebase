/**
 * Delete Product Command
 * Command for deleting products
 */
import { ICommand } from '../ICommand.js';
import Joi from 'joi';

export class DeleteProductCommand extends ICommand {
  constructor({ id }) {
    super();
    this.id = id;
  }

  async validate() {
    const schema = Joi.object({
      id: Joi.string().required().messages({
        'any.required': 'Product ID is required'
      })
    });

    const { error } = schema.validate({
      id: this.id
    });

    if (error) {
      throw new Error(error.details[0].message);
    }
  }
}
