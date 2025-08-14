/**
 * Logout Command Handler
 * Handles user logout business logic
 */
import { ICommandHandler } from '../ICommandHandler.js';

export class LogoutCommandHandler extends ICommandHandler {
  constructor({ logger, cacheService }) {
    super();
    this.logger = logger;
    this.cacheService = cacheService;
  }

  async handle(command) {
    try {
      this.logger.info('Starting logout process', { 
        userId: command.userId,
        tokenId: command.tokenId 
      });

      // Add token to blacklist to invalidate it
      if (command.token && command.tokenId) {
        const tokenExpiresAt = new Date(command.expiresAt);
        const ttl = Math.max(0, Math.floor((tokenExpiresAt.getTime() - Date.now()) / 1000));
        
        if (ttl > 0) {
          await this.cacheService.set(
            `blacklist:${command.tokenId}`,
            'true',
            ttl
          );
        }
      }

      // If refresh token is provided, blacklist it too
      if (command.refreshToken && command.refreshTokenId) {
        const refreshTokenExpiresAt = new Date(command.refreshTokenExpiresAt);
        const refreshTtl = Math.max(0, Math.floor((refreshTokenExpiresAt.getTime() - Date.now()) / 1000));
        
        if (refreshTtl > 0) {
          await this.cacheService.set(
            `blacklist:${command.refreshTokenId}`,
            'true',
            refreshTtl
          );
        }
      }

      this.logger.info('Logout successful', { 
        userId: command.userId,
        tokenId: command.tokenId 
      });

      return {
        success: true,
        message: 'Logout successful'
      };

    } catch (error) {
      this.logger.error('Logout failed', { 
        userId: command.userId,
        tokenId: command.tokenId,
        error: error.message 
      });
      throw error;
    }
  }
}
