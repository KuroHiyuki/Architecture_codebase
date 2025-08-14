/**
 * Get Product By ID Query
 * Query for retrieving a specific product by ID
 */
import { IQuery } from '../IQuery.js';
import Joi from 'joi';

export class GetProductByIdQuery extends IQuery {
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
