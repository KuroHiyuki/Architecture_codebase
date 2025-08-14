/**
 * Update Product Command
 * Command for updating existing products
 */
import { ICommand } from '../ICommand.js';
import Joi from 'joi';

export class UpdateProductCommand extends ICommand {
  constructor({ id, name, description, price, currency, category, tags, specifications }) {
    super();
    this.id = id;
    this.name = name;
    this.description = description;
    this.price = price;
    this.currency = currency;
    this.category = category;
    this.tags = tags;
    this.specifications = specifications;
  }

  async validate() {
    const schema = Joi.object({
      id: Joi.string().required().messages({
        'any.required': 'Product ID is required'
      }),
      name: Joi.string().min(2).max(100).optional(),
      description: Joi.string().max(1000).optional(),
      price: Joi.number().positive().precision(2).optional(),
      currency: Joi.string().valid('USD', 'EUR', 'GBP', 'JPY', 'CAD', 'AUD', 'VND').optional(),
      category: Joi.string().min(2).max(50).optional(),
      tags: Joi.array().items(Joi.string().max(30)).max(10).optional(),
      specifications: Joi.object().optional()
    });

    const { error } = schema.validate({
      id: this.id,
      name: this.name,
      description: this.description,
      price: this.price,
      currency: this.currency,
      category: this.category,
      tags: this.tags,
      specifications: this.specifications
    });

    if (error) {
      throw new Error(error.details[0].message);
    }
  }
}
