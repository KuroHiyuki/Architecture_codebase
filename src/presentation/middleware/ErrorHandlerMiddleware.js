/**
 * Global Error Handler Middleware
 * Handles all errors and formats them according to RFC 7807
 */
export class ErrorHandlerMiddleware {
  constructor({ logger }) {
    this.logger = logger;
  }

  handle() {
    return (error, req, res, next) => {
      // Log the error
      this.logger.error('Unhandled error occurred', {
        error: error.message,
        stack: error.stack,
        url: req.originalUrl,
        method: req.method,
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        userId: req.user?.id,
        body: req.body,
        params: req.params,
        query: req.query
      });

      // Default error response
      let statusCode = 500;
      let title = 'Internal Server Error';
      let detail = 'An unexpected error occurred';
      let type = 'https://tools.ietf.org/html/rfc7807';

      // Handle specific error types
      if (error.name === 'ValidationError') {
        statusCode = 400;
        title = 'Bad Request';
        detail = 'Validation failed';
      } else if (error.name === 'CastError') {
        statusCode = 400;
        title = 'Bad Request';
        detail = 'Invalid ID format';
      } else if (error.name === 'MongoError' || error.name === 'MongoServerError') {
        if (error.code === 11000) {
          statusCode = 409;
          title = 'Conflict';
          detail = this.handleDuplicateKeyError(error);
        } else {
          statusCode = 500;
          title = 'Database Error';
          detail = 'Database operation failed';
        }
      } else if (error.name === 'JsonWebTokenError') {
        statusCode = 401;
        title = 'Unauthorized';
        detail = 'Invalid token';
      } else if (error.name === 'TokenExpiredError') {
        statusCode = 401;
        title = 'Unauthorized';
        detail = 'Token expired';
      } else if (error.name === 'MulterError') {
        statusCode = 400;
        title = 'Bad Request';
        detail = this.handleMulterError(error);
      } else if (error.statusCode || error.status) {
        statusCode = error.statusCode || error.status;
        title = this.getHttpStatusText(statusCode);
        detail = error.message || detail;
      } else if (error.message) {
        // Use the error message if it's a custom application error
        detail = error.message;
        
        // Check if it's a known business logic error
        if (this.isBusinessLogicError(error.message)) {
          statusCode = 400;
          title = 'Bad Request';
        }
      }

      // Don't expose sensitive information in production
      if (process.env.NODE_ENV === 'production') {
        if (statusCode === 500) {
          detail = 'An unexpected error occurred';
        }
      }

      // Prepare error response according to RFC 7807
      const errorResponse = {
        type,
        title,
        status: statusCode,
        detail,
        instance: req.originalUrl
      };

      // Add additional context in development mode
      if (process.env.NODE_ENV === 'development') {
        errorResponse.stack = error.stack;
        errorResponse.timestamp = new Date().toISOString();
      }

      // Add trace ID if available
      if (req.traceId) {
        errorResponse.traceId = req.traceId;
      }

      res.status(statusCode).json(errorResponse);
    };
  }

  handleDuplicateKeyError(error) {
    const field = Object.keys(error.keyValue)[0];
    const value = error.keyValue[field];
    return `${field} '${value}' already exists`;
  }

  handleMulterError(error) {
    switch (error.code) {
      case 'LIMIT_FILE_SIZE':
        return 'File size too large';
      case 'LIMIT_FILE_COUNT':
        return 'Too many files uploaded';
      case 'LIMIT_UNEXPECTED_FILE':
        return 'Unexpected file field';
      default:
        return 'File upload error';
    }
  }

  isBusinessLogicError(message) {
    const businessLogicErrorPatterns = [
      /already exists/i,
      /not found/i,
      /insufficient/i,
      /invalid.*format/i,
      /cannot.*exceed/i,
      /must be.*than/i,
      /required/i
    ];

    return businessLogicErrorPatterns.some(pattern => pattern.test(message));
  }

  getHttpStatusText(statusCode) {
    const statusTexts = {
      400: 'Bad Request',
      401: 'Unauthorized',
      403: 'Forbidden',
      404: 'Not Found',
      405: 'Method Not Allowed',
      409: 'Conflict',
      422: 'Unprocessable Entity',
      429: 'Too Many Requests',
      500: 'Internal Server Error',
      502: 'Bad Gateway',
      503: 'Service Unavailable',
      504: 'Gateway Timeout'
    };

    return statusTexts[statusCode] || 'Unknown Error';
  }

  // Handle 404 errors for unmatched routes
  notFound() {
    return (req, res, next) => {
      const error = new Error(`Route ${req.originalUrl} not found`);
      error.statusCode = 404;
      next(error);
    };
  }

  // Handle async errors
  asyncHandler(fn) {
    return (req, res, next) => {
      Promise.resolve(fn(req, res, next)).catch(next);
    };
  }
}
