/**
 * Authentication Controller
 * Handles user authentication endpoints
 */
export class AuthController {
  constructor({ mediator, logger }) {
    this.mediator = mediator;
    this.logger = logger;
  }

  async register(req, res, next) {
    try {
      const { RegisterUserCommand } = await import('../../application/commands/auth/RegisterUserCommand.js');
      
      const command = new RegisterUserCommand({
        email: req.body.email,
        password: req.body.password,
        firstName: req.body.firstName,
        lastName: req.body.lastName
      });

      const result = await this.mediator.send(command);

      this.logger.info('User registration successful', { 
        email: req.body.email,
        userId: result.data.id 
      });

      res.status(201).json({
        success: true,
        message: 'User registered successfully',
        data: result.data
      });

    } catch (error) {
      next(error);
    }
  }

  async login(req, res, next) {
    try {
      const { LoginUserCommand } = await import('../../application/commands/auth/LoginUserCommand.js');
      
      const command = new LoginUserCommand({
        email: req.body.email,
        password: req.body.password
      });

      const result = await this.mediator.send(command);

      this.logger.info('User login successful', { 
        email: req.body.email,
        userId: result.data.user.id 
      });

      res.status(200).json({
        success: true,
        message: 'Login successful',
        data: result.data
      });

    } catch (error) {
      next(error);
    }
  }

  async logout(req, res, next) {
    try {
      // In a stateless JWT system, logout is handled client-side
      // But we can log the event for monitoring
      this.logger.info('User logout', { 
        userId: req.user?.id,
        email: req.user?.email 
      });

      res.status(200).json({
        success: true,
        message: 'Logout successful'
      });

    } catch (error) {
      next(error);
    }
  }

  async googleAuth(req, res, next) {
    try {
      const { GoogleAuthCommand } = await import('../../application/commands/auth/GoogleAuthCommand.js');
      
      // This would typically be called from passport callback
      const command = new GoogleAuthCommand({
        googleId: req.user.googleId,
        email: req.user.email,
        firstName: req.user.firstName,
        lastName: req.user.lastName
      });

      const result = await this.mediator.send(command);

      this.logger.info('Google authentication successful', { 
        email: req.user.email,
        userId: result.data.user.id 
      });

      res.status(200).json({
        success: true,
        message: 'Google authentication successful',
        data: result.data
      });

    } catch (error) {
      next(error);
    }
  }

  async refreshToken(req, res, next) {
    try {
      const { refreshToken } = req.body;

      if (!refreshToken) {
        return res.status(400).json({
          type: 'https://tools.ietf.org/html/rfc7807',
          title: 'Bad Request',
          status: 400,
          detail: 'Refresh token is required',
          instance: req.originalUrl
        });
      }

      // This would be handled by a refresh token command/handler
      // For now, we'll return a placeholder response
      res.status(200).json({
        success: true,
        message: 'Token refreshed successfully',
        data: {
          accessToken: 'new-access-token',
          refreshToken: 'new-refresh-token'
        }
      });

    } catch (error) {
      next(error);
    }
  }

  async getProfile(req, res, next) {
    try {
      const user = req.user;

      res.status(200).json({
        success: true,
        message: 'Profile retrieved successfully',
        data: {
          id: user.id,
          email: user.email.value,
          firstName: user.firstName,
          lastName: user.lastName,
          fullName: user.fullName,
          role: user.role,
          isActive: user.isActive,
          lastLoginAt: user.lastLoginAt,
          createdAt: user.createdAt
        }
      });

    } catch (error) {
      next(error);
    }
  }

  async updateProfile(req, res, next) {
    try {
      // This would be handled by an update profile command
      const { firstName, lastName } = req.body;
      
      const user = req.user;
      user.updateProfile({ firstName, lastName });

      this.logger.info('Profile updated successfully', { 
        userId: user.id,
        email: user.email.value 
      });

      res.status(200).json({
        success: true,
        message: 'Profile updated successfully',
        data: {
          id: user.id,
          email: user.email.value,
          firstName: user.firstName,
          lastName: user.lastName,
          fullName: user.fullName,
          updatedAt: user.updatedAt
        }
      });

    } catch (error) {
      next(error);
    }
  }
}
