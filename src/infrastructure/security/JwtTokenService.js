/**
 * JWT Token Service
 * Handles JWT token generation, validation and refresh
 */
import jwt from 'jsonwebtoken';

export class JwtTokenService {
  constructor({ logger }) {
    this.logger = logger;
  }

  generateAccessToken(payload) {
    try {
      const token = jwt.sign(
        payload,
        process.env.JWT_SECRET,
        { 
          expiresIn: process.env.JWT_EXPIRE,
          issuer: 'inventory-system',
          audience: 'inventory-users'
        }
      );

      this.logger.debug('Access token generated', { userId: payload.userId });
      return token;
    } catch (error) {
      this.logger.error('Error generating access token', { error: error.message });
      throw new Error('Failed to generate access token');
    }
  }

  generateRefreshToken(payload) {
    try {
      const token = jwt.sign(
        { userId: payload.userId },
        process.env.JWT_REFRESH_SECRET,
        { 
          expiresIn: process.env.JWT_REFRESH_EXPIRE,
          issuer: 'inventory-system',
          audience: 'inventory-users'
        }
      );

      this.logger.debug('Refresh token generated', { userId: payload.userId });
      return token;
    } catch (error) {
      this.logger.error('Error generating refresh token', { error: error.message });
      throw new Error('Failed to generate refresh token');
    }
  }

  verifyAccessToken(token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET, {
        issuer: 'inventory-system',
        audience: 'inventory-users'
      });

      this.logger.debug('Access token verified', { userId: decoded.userId });
      return decoded;
    } catch (error) {
      this.logger.debug('Access token verification failed', { error: error.message });
      
      if (error.name === 'TokenExpiredError') {
        throw new Error('Token expired');
      } else if (error.name === 'JsonWebTokenError') {
        throw new Error('Invalid token');
      } else {
        throw new Error('Token verification failed');
      }
    }
  }

  verifyRefreshToken(token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET, {
        issuer: 'inventory-system',
        audience: 'inventory-users'
      });

      this.logger.debug('Refresh token verified', { userId: decoded.userId });
      return decoded;
    } catch (error) {
      this.logger.debug('Refresh token verification failed', { error: error.message });
      
      if (error.name === 'TokenExpiredError') {
        throw new Error('Refresh token expired');
      } else if (error.name === 'JsonWebTokenError') {
        throw new Error('Invalid refresh token');
      } else {
        throw new Error('Refresh token verification failed');
      }
    }
  }

  extractTokenFromHeader(authHeader) {
    if (!authHeader) {
      throw new Error('Authorization header missing');
    }

    const parts = authHeader.split(' ');
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      throw new Error('Invalid authorization header format');
    }

    return parts[1];
  }

  refreshAccessToken(refreshToken, userPayload) {
    try {
      // Verify refresh token
      this.verifyRefreshToken(refreshToken);
      
      // Generate new access token
      return this.generateAccessToken(userPayload);
    } catch (error) {
      this.logger.error('Error refreshing access token', { error: error.message });
      throw error;
    }
  }

  getTokenExpiration(token) {
    try {
      const decoded = jwt.decode(token);
      return decoded ? new Date(decoded.exp * 1000) : null;
    } catch (error) {
      this.logger.error('Error getting token expiration', { error: error.message });
      return null;
    }
  }
}
