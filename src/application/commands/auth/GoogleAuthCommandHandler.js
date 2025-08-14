/**
 * Google Auth Command Handler
 * Handles Google OAuth authentication business logic
 */
import { ICommandHandler } from '../ICommandHandler.js';
import { User } from '../../../domain/entities/User.js';
import jwt from 'jsonwebtoken';

export class GoogleAuthCommandHandler extends ICommandHandler {
  constructor({ userRepository, unitOfWork, logger }) {
    super();
    this.userRepository = userRepository;
    this.unitOfWork = unitOfWork;
    this.logger = logger;
  }

  async handle(command) {
    try {
      this.logger.info('Starting Google authentication process', { 
        googleId: command.googleId,
        email: command.email 
      });

      // Check if user already exists by Google ID
      let user = await this.userRepository.findByGoogleId(command.googleId);
      
      if (!user) {
        // Check if user exists by email
        user = await this.userRepository.findByEmail(command.email);
        
        if (user) {
          // User exists with email but no Google ID, link accounts
          const session = await this.unitOfWork.startTransaction();
          
          try {
            user.googleId = command.googleId;
            user.updateLastLogin();
            
            await this.userRepository.update(user.id, {
              googleId: command.googleId,
              lastLoginAt: new Date()
            }, session);
            
            await this.unitOfWork.commitTransaction(session);
            
          } catch (error) {
            await this.unitOfWork.rollbackTransaction(session);
            throw error;
          }
        } else {
          // Create new user
          const session = await this.unitOfWork.startTransaction();
          
          try {
            user = new User({
              email: command.email,
              firstName: command.firstName,
              lastName: command.lastName,
              googleId: command.googleId,
              password: null // No password for OAuth users
            });
            
            user.updateLastLogin();
            user = await this.userRepository.save(user, session);
            
            await this.unitOfWork.commitTransaction(session);
            
          } catch (error) {
            await this.unitOfWork.rollbackTransaction(session);
            throw error;
          }
        }
      } else {
        // User exists, update last login
        user.updateLastLogin();
        await this.userRepository.updateLastLogin(user.id);
      }

      // Generate JWT tokens
      const payload = {
        userId: user.id,
        email: user.email.value,
        role: user.role
      };

      const accessToken = jwt.sign(
        payload,
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRE }
      );

      const refreshToken = jwt.sign(
        { userId: user.id },
        process.env.JWT_REFRESH_SECRET,
        { expiresIn: process.env.JWT_REFRESH_EXPIRE }
      );

      this.logger.info('Google authentication successful', { 
        userId: user.id, 
        email: user.email.value,
        isNewUser: !user.googleId
      });

      // Return user without password
      const { password, ...userWithoutPassword } = user.toJSON();
      return {
        success: true,
        data: {
          user: userWithoutPassword,
          accessToken,
          refreshToken
        },
        message: 'Google authentication successful'
      };

    } catch (error) {
      this.logger.error('Google authentication failed', { 
        googleId: command.googleId,
        email: command.email, 
        error: error.message 
      });
      throw error;
    }
  }
}
