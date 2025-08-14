/**
 * Rate Limiting Middleware
 * Implements rate limiting for API endpoints
 */
import rateLimit from 'express-rate-limit';

export class RateLimitMiddleware {
  constructor({ logger }) {
    this.logger = logger;
  }

  // General API rate limiting
  general() {
    return rateLimit({
      windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
      max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100, // limit each IP to 100 requests per windowMs
      message: {
        type: 'https://tools.ietf.org/html/rfc7807',
        title: 'Too Many Requests',
        status: 429,
        detail: 'Too many requests from this IP, please try again later.',
      },
      standardHeaders: true,
      legacyHeaders: false,
      handler: (req, res) => {
        this.logger.warn('Rate limit exceeded', {
          ip: req.ip,
          userAgent: req.get('User-Agent'),
          url: req.originalUrl
        });

        res.status(429).json({
          type: 'https://tools.ietf.org/html/rfc7807',
          title: 'Too Many Requests',
          status: 429,
          detail: 'Too many requests from this IP, please try again later.',
          instance: req.originalUrl
        });
      }
    });
  }

  // Strict rate limiting for authentication endpoints
  auth() {
    return rateLimit({
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 5, // limit each IP to 5 auth requests per windowMs
      skipSuccessfulRequests: true,
      message: {
        type: 'https://tools.ietf.org/html/rfc7807',
        title: 'Too Many Authentication Attempts',
        status: 429,
        detail: 'Too many authentication attempts from this IP, please try again later.',
      },
      handler: (req, res) => {
        this.logger.warn('Auth rate limit exceeded', {
          ip: req.ip,
          userAgent: req.get('User-Agent'),
          url: req.originalUrl
        });

        res.status(429).json({
          type: 'https://tools.ietf.org/html/rfc7807',
          title: 'Too Many Authentication Attempts',
          status: 429,
          detail: 'Too many authentication attempts from this IP, please try again later.',
          instance: req.originalUrl
        });
      }
    });
  }

  // Password reset rate limiting
  passwordReset() {
    return rateLimit({
      windowMs: 60 * 60 * 1000, // 1 hour
      max: 3, // limit each IP to 3 password reset requests per hour
      message: {
        type: 'https://tools.ietf.org/html/rfc7807',
        title: 'Too Many Password Reset Attempts',
        status: 429,
        detail: 'Too many password reset attempts from this IP, please try again later.',
      },
      handler: (req, res) => {
        this.logger.warn('Password reset rate limit exceeded', {
          ip: req.ip,
          userAgent: req.get('User-Agent'),
          url: req.originalUrl
        });

        res.status(429).json({
          type: 'https://tools.ietf.org/html/rfc7807',
          title: 'Too Many Password Reset Attempts',
          status: 429,
          detail: 'Too many password reset attempts from this IP, please try again later.',
          instance: req.originalUrl
        });
      }
    });
  }

  // File upload rate limiting
  upload() {
    return rateLimit({
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 10, // limit each IP to 10 uploads per windowMs
      message: {
        type: 'https://tools.ietf.org/html/rfc7807',
        title: 'Too Many Upload Attempts',
        status: 429,
        detail: 'Too many upload attempts from this IP, please try again later.',
      },
      handler: (req, res) => {
        this.logger.warn('Upload rate limit exceeded', {
          ip: req.ip,
          userAgent: req.get('User-Agent'),
          url: req.originalUrl
        });

        res.status(429).json({
          type: 'https://tools.ietf.org/html/rfc7807',
          title: 'Too Many Upload Attempts',
          status: 429,
          detail: 'Too many upload attempts from this IP, please try again later.',
          instance: req.originalUrl
        });
      }
    });
  }

  // Custom rate limiting with configurable options
  custom(options = {}) {
    const defaultOptions = {
      windowMs: 15 * 60 * 1000,
      max: 100,
      message: 'Too many requests from this IP, please try again later.'
    };

    const config = { ...defaultOptions, ...options };

    return rateLimit({
      windowMs: config.windowMs,
      max: config.max,
      message: {
        type: 'https://tools.ietf.org/html/rfc7807',
        title: 'Too Many Requests',
        status: 429,
        detail: config.message,
      },
      standardHeaders: true,
      legacyHeaders: false,
      handler: (req, res) => {
        this.logger.warn('Custom rate limit exceeded', {
          ip: req.ip,
          userAgent: req.get('User-Agent'),
          url: req.originalUrl,
          limit: config.max,
          window: config.windowMs
        });

        res.status(429).json({
          type: 'https://tools.ietf.org/html/rfc7807',
          title: 'Too Many Requests',
          status: 429,
          detail: config.message,
          instance: req.originalUrl
        });
      }
    });
  }
}
