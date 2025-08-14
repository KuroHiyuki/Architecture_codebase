/**
 * Register User Command Handler
 * Handles user registration business logic
 */
import { ICommandHandler } from '../ICommandHandler.js';
import { User } from '../../../domain/entities/User.js';
import bcrypt from 'bcryptjs';

export class RegisterUserCommandHandler extends ICommandHandler {
  constructor({ userRepository, unitOfWork, logger }) {
    super();
    this.userRepository = userRepository;
    this.unitOfWork = unitOfWork;
    this.logger = logger;
  }

  async handle(command) {
    try {
      this.logger.info('Starting user registration process', { email: command.email });

      // Check if user already exists
      const existingUser = await this.userRepository.findByEmail(command.email);
      if (existingUser) {
        throw new Error('User with this email already exists');
      }

      // Hash password
      const saltRounds = parseInt(process.env.BCRYPT_ROUNDS) || 12;
      const hashedPassword = await bcrypt.hash(command.password, saltRounds);

      // Create user entity
      const user = new User({
        email: command.email,
        password: hashedPassword,
        firstName: command.firstName,
        lastName: command.lastName
      });

      // Start transaction
      const session = await this.unitOfWork.startTransaction();

      try {
        // Save user
        const savedUser = await this.userRepository.save(user, session);
        
        // Commit transaction
        await this.unitOfWork.commitTransaction(session);

        this.logger.info('User registered successfully', { 
          userId: savedUser.id, 
          email: savedUser.email 
        });

        // Return user without password
        const { password, ...userWithoutPassword } = savedUser.toJSON();
        return {
          success: true,
          data: userWithoutPassword,
          message: 'User registered successfully'
        };

      } catch (error) {
        await this.unitOfWork.rollbackTransaction(session);
        throw error;
      }

    } catch (error) {
      this.logger.error('User registration failed', { 
        email: command.email, 
        error: error.message 
      });
      throw error;
    }
  }
}
