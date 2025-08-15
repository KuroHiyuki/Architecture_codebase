/**
 * Response Helper
 * Standardized response formatting following RFC 7807
 */
import {Code} from './responseCode.js';
export class ResponseHelper {
  // Success responses
  static success(res, data, message = Code.Success.message, statusCode = Code.Success.status) {
    return res.status(statusCode).json({
      success: true,
      message,
      data,
      timestamp: new Date().toISOString()
    });
  }

  static created(res, data, message = Code.Created.message) {
    return this.success(res, data, message, Code.Created.status);
  }

  static noContent(res, message = Code.NoContent.message) {
    return res.status(Code.NoContent.status).json({
      success: true,
      message,
      timestamp: new Date().toISOString()
    });
  }

  // Paginated response
  static paginated(res, data, pagination, message = Code.Success.message) {
    return res.status(Code.Success.status).json({
      success: true,
      message,
      data,
      pagination: {
        page: pagination.page,
        limit: pagination.limit,
        total: pagination.total,
        pages: Math.ceil(pagination.total / pagination.limit),
        hasNext: pagination.page < Math.ceil(pagination.total / pagination.limit),
        hasPrev: pagination.page > 1
      },
      timestamp: new Date().toISOString()
    });
  }

  // Error responses following RFC 7807
  static error(res, {
    statusCode = Code.InternalServerError.status,
    title = Code.InternalServerError.message,
    detail = 'An unexpected error occurred',
    type = 'https://tools.ietf.org/html/rfc7807',
    instance = null,
    errors = null,
    traceId = null
  }) {
    const errorResponse = {
      type,
      title,
      status: statusCode,
      detail,
      timestamp: new Date().toISOString()
    };

    if (instance) errorResponse.instance = instance;
    if (errors) errorResponse.errors = errors;
    if (traceId) errorResponse.traceId = traceId;

    return res.status(statusCode).json(errorResponse);
  }

  static badRequest(res, detail = Code.BadRequest.message, errors = null, instance = null) {
    return this.error(res, {
      statusCode: Code.BadRequest.status,
      title: 'Bad Request',
      detail,
      errors,
      instance
    });
  }

  static unauthorized(res, detail = Code.Unauthorized.message, instance = null) {
    return this.error(res, {
      statusCode: Code.Unauthorized.status,
      title: 'Unauthorized',
      detail,
      instance
    });
  }

  static forbidden(res, detail = Code.Forbidden.message, instance = null) {
    return this.error(res, {
      statusCode: Code.Forbidden.status,
      title: 'Forbidden',
      detail,
      instance
    });
  }

  static notFound(res, detail = Code.NotFound.message, instance = null) {
    return this.error(res, {
      statusCode: Code.NotFound.status,
      title: 'Not Found',
      detail,
      instance
    });
  }

  static conflict(res, detail = Code.Conflict.message, instance = null) {
    return this.error(res, {
      statusCode: Code.Conflict.status,
      title: 'Conflict',
      detail,
      instance
    });
  }

  static unprocessableEntity(res, detail = Code.UnprocessableEntity.message, errors = null, instance = null) {
    return this.error(res, {
      statusCode: Code.UnprocessableEntity.status,
      title: 'Unprocessable Entity',
      detail,
      errors,
      instance
    });
  }

  static tooManyRequests(res, detail = Code.TooManyRequests.message, instance = null) {
    return this.error(res, {
      statusCode: Code.TooManyRequests.status,
      title: 'Too Many Requests',
      detail,
      instance
    });
  }

  static internalServerError(res, detail = Code.InternalServerError.message, instance = null, traceId = null) {
    return this.error(res, {
      statusCode: Code.InternalServerError.status,
      title: 'Internal Server Error',
      detail,
      instance,
      traceId
    });
  }

  // Validation error response
  static validationError(res, errors, instance = null) {
    const formattedErrors = Array.isArray(errors) ? errors : [errors];
    
    return this.error(res, {
      statusCode: Code.ValidationError.status,
      title: 'Validation Error',
      detail: 'Input validation failed',
      errors: formattedErrors,
      instance
    });
  }

  // Business logic error response
  static businessError(res, detail, statusCode = Code.BadRequest.status, instance = null) {
    return this.error(res, {
      statusCode,
      title: 'Business Logic Error',
      detail,
      instance
    });
  }

  // Health check response
  static health(res, status = 'healthy', details = {}) {
    const statusCode = status === 'healthy' ? 200 : 503;
    
    return res.status(statusCode).json({
      status,
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || 'development',
      version: process.env.npm_package_version || '1.0.0',
      details
    });
  }

  // API info response
  static apiInfo(res) {
    return res.status(Code.Success.status).json({
      name: 'Inventory Management API',
      version: process.env.npm_package_version || '1.0.0',
      description: 'Clean Architecture Inventory Management System',
      environment: process.env.NODE_ENV || 'development',
      timestamp: new Date().toISOString(),
      endpoints: {
        auth: '/api/auth',
        products: '/api/products',
        inventory: '/api/inventory',
        health: '/api/health'
      }
    });
  }
}
