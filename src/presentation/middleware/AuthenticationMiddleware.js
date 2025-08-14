/**
 * Authentication Middleware
 * Handles JWT token validation and user authentication
 */
export class AuthenticationMiddleware {
  constructor({ jwtTokenService, userRepository, logger }) {
    this.jwtTokenService = jwtTokenService;
    this.userRepository = userRepository;
    this.logger = logger;
  }

  authenticate() {
    return async (req, res, next) => {
      try {
        const authHeader = req.headers.authorization;
        
        if (!authHeader) {
          return res.status(401).json({
            type: 'https://tools.ietf.org/html/rfc7807',
            title: 'Unauthorized',
            status: 401,
            detail: 'Authorization header is required',
            instance: req.originalUrl
          });
        }

        const token = this.jwtTokenService.extractTokenFromHeader(authHeader);
        const decoded = this.jwtTokenService.verifyAccessToken(token);

        // Get user from database to ensure they still exist and are active
        const user = await this.userRepository.findById(decoded.userId);
        
        if (!user) {
          return res.status(401).json({
            type: 'https://tools.ietf.org/html/rfc7807',
            title: 'Unauthorized',
            status: 401,
            detail: 'User not found',
            instance: req.originalUrl
          });
        }

        if (!user.isActive) {
          return res.status(401).json({
            type: 'https://tools.ietf.org/html/rfc7807',
            title: 'Unauthorized',
            status: 401,
            detail: 'Account is deactivated',
            instance: req.originalUrl
          });
        }

        // Add user to request object
        req.user = user;
        req.token = decoded;

        this.logger.debug('User authenticated successfully', { 
          userId: user.id, 
          email: user.email 
        });

        next();

      } catch (error) {
        this.logger.debug('Authentication failed', { error: error.message });

        let statusCode = 401;
        let detail = 'Authentication failed';

        if (error.message === 'Token expired') {
          detail = 'Token has expired';
        } else if (error.message === 'Invalid token') {
          detail = 'Invalid token provided';
        }

        return res.status(statusCode).json({
          type: 'https://tools.ietf.org/html/rfc7807',
          title: 'Unauthorized',
          status: statusCode,
          detail,
          instance: req.originalUrl
        });
      }
    };
  }

  authorize(roles = []) {
    return (req, res, next) => {
      try {
        if (!req.user) {
          return res.status(401).json({
            type: 'https://tools.ietf.org/html/rfc7807',
            title: 'Unauthorized',
            status: 401,
            detail: 'User not authenticated',
            instance: req.originalUrl
          });
        }

        if (roles.length > 0 && !roles.includes(req.user.role)) {
          this.logger.warn('Access denied - insufficient permissions', {
            userId: req.user.id,
            userRole: req.user.role,
            requiredRoles: roles
          });

          return res.status(403).json({
            type: 'https://tools.ietf.org/html/rfc7807',
            title: 'Forbidden',
            status: 403,
            detail: 'Insufficient permissions',
            instance: req.originalUrl
          });
        }

        this.logger.debug('User authorized successfully', { 
          userId: req.user.id, 
          role: req.user.role 
        });

        next();

      } catch (error) {
        this.logger.error('Authorization error', { error: error.message });

        return res.status(500).json({
          type: 'https://tools.ietf.org/html/rfc7807',
          title: 'Internal Server Error',
          status: 500,
          detail: 'Authorization check failed',
          instance: req.originalUrl
        });
      }
    };
  }

  optional() {
    return async (req, res, next) => {
      try {
        const authHeader = req.headers.authorization;
        
        if (!authHeader) {
          return next();
        }

        const token = this.jwtTokenService.extractTokenFromHeader(authHeader);
        const decoded = this.jwtTokenService.verifyAccessToken(token);
        const user = await this.userRepository.findById(decoded.userId);

        if (user && user.isActive) {
          req.user = user;
          req.token = decoded;
        }

        next();

      } catch (error) {
        // For optional auth, we don't fail the request on invalid tokens
        this.logger.debug('Optional authentication failed', { error: error.message });
        next();
      }
    };
  }

  requireRole(role) {
    return (req, res, next) => {
      try {
        if (!req.user) {
          const detail = 'Authentication required to access this resource';
          this.logger.warn('Unauthorized access attempt', { 
            url: req.originalUrl,
            ip: req.ip,
            userAgent: req.get('User-Agent')
          });

          return res.status(401).json({
            type: 'https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/401',
            title: 'Unauthorized',
            status: 401,
            detail,
            instance: req.originalUrl
          });
        }

        if (req.user.role !== role) {
          const detail = `Access denied. Required role: ${role}`;
          this.logger.warn('Access denied - insufficient role', { 
            userId: req.user.id,
            userRole: req.user.role,
            requiredRole: role,
            url: req.originalUrl,
            ip: req.ip
          });

          return res.status(403).json({
            type: 'https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/403',
            title: 'Forbidden',
            status: 403,
            detail,
            instance: req.originalUrl
          });
        }

        next();
      } catch (error) {
        this.logger.error('Role authorization error', { 
          error: error.message,
          userId: req.user?.id,
          requiredRole: role
        });

        const detail = 'Authorization check failed';
        return res.status(500).json({
          type: 'https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/500',
          title: 'Internal Server Error',
          status: 500,
          detail,
          instance: req.originalUrl
        });
      }
    };
  }
}
