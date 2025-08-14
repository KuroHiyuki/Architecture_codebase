/**
 * Response Helper
 * Standardized response formatting following RFC 7807
 */
export class ResponseHelper {
  // Success responses
  static success(res, data, message = 'Operation successful', statusCode = 200) {
    return res.status(statusCode).json({
      success: true,
      message,
      data,
      timestamp: new Date().toISOString()
    });
  }

  static created(res, data, message = 'Resource created successfully') {
    return this.success(res, data, message, 201);
  }

  static noContent(res, message = 'Operation completed successfully') {
    return res.status(204).json({
      success: true,
      message,
      timestamp: new Date().toISOString()
    });
  }

  // Paginated response
  static paginated(res, data, pagination, message = 'Data retrieved successfully') {
    return res.status(200).json({
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
    statusCode = 500,
    title = 'Internal Server Error',
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

  static badRequest(res, detail = 'Bad request', errors = null, instance = null) {
    return this.error(res, {
      statusCode: 400,
      title: 'Bad Request',
      detail,
      errors,
      instance
    });
  }

  static unauthorized(res, detail = 'Unauthorized access', instance = null) {
    return this.error(res, {
      statusCode: 401,
      title: 'Unauthorized',
      detail,
      instance
    });
  }

  static forbidden(res, detail = 'Access forbidden', instance = null) {
    return this.error(res, {
      statusCode: 403,
      title: 'Forbidden',
      detail,
      instance
    });
  }

  static notFound(res, detail = 'Resource not found', instance = null) {
    return this.error(res, {
      statusCode: 404,
      title: 'Not Found',
      detail,
      instance
    });
  }

  static conflict(res, detail = 'Resource conflict', instance = null) {
    return this.error(res, {
      statusCode: 409,
      title: 'Conflict',
      detail,
      instance
    });
  }

  static unprocessableEntity(res, detail = 'Unprocessable entity', errors = null, instance = null) {
    return this.error(res, {
      statusCode: 422,
      title: 'Unprocessable Entity',
      detail,
      errors,
      instance
    });
  }

  static tooManyRequests(res, detail = 'Too many requests', instance = null) {
    return this.error(res, {
      statusCode: 429,
      title: 'Too Many Requests',
      detail,
      instance
    });
  }

  static internalServerError(res, detail = 'Internal server error', instance = null, traceId = null) {
    return this.error(res, {
      statusCode: 500,
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
      statusCode: 400,
      title: 'Validation Error',
      detail: 'Input validation failed',
      errors: formattedErrors,
      instance
    });
  }

  // Business logic error response
  static businessError(res, detail, statusCode = 400, instance = null) {
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
    return res.status(200).json({
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
