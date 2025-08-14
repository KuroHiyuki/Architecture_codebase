/**
 * Validation Middleware
 * Handles input validation using Joi schemas
 */
import Joi from 'joi';

export class ValidationMiddleware {
  constructor({ logger }) {
    this.logger = logger;
  }

  validate(schema, property = 'body') {
    return (req, res, next) => {
      try {
        const dataToValidate = req[property];
        
        const { error, value } = schema.validate(dataToValidate, {
          abortEarly: false,
          allowUnknown: false,
          stripUnknown: true
        });

        if (error) {
          const errors = error.details.map(detail => ({
            field: detail.path.join('.'),
            message: detail.message,
            value: detail.context?.value
          }));

          this.logger.debug('Validation failed', { 
            property, 
            errors,
            originalData: dataToValidate 
          });

          return res.status(400).json({
            type: 'https://tools.ietf.org/html/rfc7807',
            title: 'Bad Request',
            status: 400,
            detail: 'Input validation failed',
            instance: req.originalUrl,
            errors
          });
        }

        // Replace the original data with validated and sanitized data
        req[property] = value;
        
        this.logger.debug('Validation passed', { property });
        next();

      } catch (error) {
        this.logger.error('Validation middleware error', { error: error.message });
        
        return res.status(500).json({
          type: 'https://tools.ietf.org/html/rfc7807',
          title: 'Internal Server Error',
          status: 500,
          detail: 'Validation processing failed',
          instance: req.originalUrl
        });
      }
    };
  }

  // Common validation schemas
  static get schemas() {
    return {
      // User registration schema
      registerUser: Joi.object({
        email: Joi.string().email().required().messages({
          'string.email': 'Invalid email format',
          'any.required': 'Email is required'
        }),
        password: Joi.string()
          .min(8)
          .pattern(new RegExp('^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]'))
          .required()
          .messages({
            'string.min': 'Password must be at least 8 characters long',
            'string.pattern.base': 'Password must contain at least one uppercase letter, one lowercase letter, one number and one special character',
            'any.required': 'Password is required'
          }),
        firstName: Joi.string().min(2).max(50).required().trim(),
        lastName: Joi.string().min(2).max(50).required().trim()
      }),

      // User login schema
      loginUser: Joi.object({
        email: Joi.string().email().required(),
        password: Joi.string().required()
      }),

      // Create product schema
      createProduct: Joi.object({
        name: Joi.string().min(2).max(100).required().trim(),
        description: Joi.string().max(1000).optional().trim(),
        sku: Joi.string().min(3).max(50).required().trim(),
        price: Joi.number().positive().precision(2).required(),
        currency: Joi.string().valid('USD', 'EUR', 'GBP', 'JPY', 'CAD', 'AUD', 'VND').default('USD'),
        category: Joi.string().min(2).max(50).required().trim(),
        tags: Joi.array().items(Joi.string().max(30).trim()).max(10).default([]),
        specifications: Joi.object().default({})
      }),

      // Update product schema
      updateProduct: Joi.object({
        name: Joi.string().min(2).max(100).optional().trim(),
        description: Joi.string().max(1000).optional().trim(),
        price: Joi.number().positive().precision(2).optional(),
        currency: Joi.string().valid('USD', 'EUR', 'GBP', 'JPY', 'CAD', 'AUD', 'VND').optional(),
        category: Joi.string().min(2).max(50).optional().trim(),
        tags: Joi.array().items(Joi.string().max(30).trim()).max(10).optional(),
        specifications: Joi.object().optional()
      }),

      // Create inventory schema
      createInventory: Joi.object({
        productId: Joi.string().required(),
        quantity: Joi.number().integer().min(0).default(0),
        location: Joi.string().min(2).max(100).required().trim(),
        warehouseId: Joi.string().required(),
        minimumStock: Joi.number().integer().min(0).default(0),
        maximumStock: Joi.number().integer().positive().optional().allow(null),
        unitCost: Joi.number().min(0).precision(2).default(0)
      }),

      // Update inventory stock schema
      updateInventoryStock: Joi.object({
        quantity: Joi.number().integer().positive().required(),
        operation: Joi.string().valid('add', 'remove').default('add'),
        unitCost: Joi.number().min(0).precision(2).optional().allow(null)
      }),

      // Query parameters schema
      queryParams: Joi.object({
        page: Joi.number().integer().min(1).default(1),
        limit: Joi.number().integer().min(1).max(100).default(10),
        sortBy: Joi.string().optional(),
        sortOrder: Joi.string().valid('asc', 'desc').default('desc')
      }),

      // ID parameter schema
      idParam: Joi.object({
        id: Joi.string().required()
      })
    };
  }
}
