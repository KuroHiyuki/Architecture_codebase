/**
 * Create Product Command
 * Command for creating new products
 */
import { ICommand } from '../ICommand.js';
import Joi from 'joi';

export class CreateProductCommand extends ICommand {
  constructor({ name, description, sku, price, currency = 'USD', category, tags = [], specifications = {} }) {
    super();
    this.name = name;
    this.description = description;
    this.sku = sku;
    this.price = price;
    this.currency = currency;
    this.category = category;
    this.tags = tags;
    this.specifications = specifications;
  }

  async validate() {
    const schema = Joi.object({
      name: Joi.string().min(2).max(100).required().messages({
        'string.min': 'Product name must be at least 2 characters long',
        'string.max': 'Product name cannot exceed 100 characters',
        'any.required': 'Product name is required'
      }),
      description: Joi.string().max(1000).optional().messages({
        'string.max': 'Description cannot exceed 1000 characters'
      }),
      sku: Joi.string().min(3).max(50).required().messages({
        'string.min': 'SKU must be at least 3 characters long',
        'string.max': 'SKU cannot exceed 50 characters',
        'any.required': 'SKU is required'
      }),
      price: Joi.number().positive().precision(2).required().messages({
        'number.positive': 'Price must be positive',
        'any.required': 'Price is required'
      }),
      currency: Joi.string().valid('USD', 'EUR', 'GBP', 'JPY', 'CAD', 'AUD', 'VND').default('USD'),
      category: Joi.string().min(2).max(50).required().messages({
        'string.min': 'Category must be at least 2 characters long',
        'string.max': 'Category cannot exceed 50 characters',
        'any.required': 'Category is required'
      }),
      tags: Joi.array().items(Joi.string().max(30)).max(10).optional(),
      specifications: Joi.object().optional()
    });

    const { error } = schema.validate({
      name: this.name,
      description: this.description,
      sku: this.sku,
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
