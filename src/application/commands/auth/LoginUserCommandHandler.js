/**
 * Login User Command Handler
 * Handles user authentication business logic
 */
import { ICommandHandler } from '../ICommandHandler.js';
import bcrypt from 'bcryptjs';

export class LoginUserCommandHandler extends ICommandHandler {
  constructor({ jwtTokenService, userRepository, logger }) {
    super();
    this.userRepository = userRepository;
    this.logger = logger;
    this.jwtTokenService = jwtTokenService;
  }

  async handle(command) {
    try {
      this.logger.info('Starting user login process', { email: command.email });

      // Find user by email
      const user = await this.userRepository.findByEmail(command.email);
      if (!user) {
        throw new Error('Invalid email or password');
      }

      // Check if user is active
      if (!user.isActive) {
        throw new Error('Account is deactivated');
      }

      // Verify password
      const isPasswordValid = await bcrypt.compare(command.password, user.password);
      if (!isPasswordValid) {
        throw new Error('Invalid email or password');
      }

      // Update last login
      user.updateLastLogin();
      await this.userRepository.updateLastLogin(user.id);

      // Generate JWT tokens
      const payload = {
        userId: user.id,
        email: user.email.value || user.email, // Handle both value object and string
        role: user.role
      };

      const accessToken = this.jwtTokenService.generateAccessToken(payload);
      const refreshToken = this.jwtTokenService.generateRefreshToken(payload);

      this.logger.info('User logged in successfully', { 
        userId: user.id, 
        email: user.email.value || user.email 
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
        message: 'Login successful'
      };

    } catch (error) {
      this.logger.error('User login failed', { 
        email: command.email, 
        error: error.message 
      });
      throw error;
    }
  }
}
