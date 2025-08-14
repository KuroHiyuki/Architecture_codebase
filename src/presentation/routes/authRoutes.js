/**
 * Authentication Routes
 * Defines routes for user authentication
 */
import { Router } from 'express';

export function createAuthRoutes({ 
  authController, 
  validationMiddleware, 
  rateLimitMiddleware, 
  authMiddleware,
  errorHandler 
}) {
  const router = Router();

  // Apply rate limiting to all auth routes
  router.use(rateLimitMiddleware.auth());

  // Public routes
  router.post('/register', 
    validationMiddleware.validate(validationMiddleware.constructor.schemas.registerUser),
    errorHandler.asyncHandler(authController.register.bind(authController))
  );

  router.post('/login',
    validationMiddleware.validate(validationMiddleware.constructor.schemas.loginUser),
    errorHandler.asyncHandler(authController.login.bind(authController))
  );

  router.post('/refresh-token',
    errorHandler.asyncHandler(authController.refreshToken.bind(authController))
  );

  // Google OAuth routes
  router.get('/google',
    // Passport Google OAuth middleware would go here
    errorHandler.asyncHandler(authController.googleAuth.bind(authController))
  );

  router.get('/google/callback',
    // Passport Google OAuth callback middleware would go here
    errorHandler.asyncHandler(authController.googleAuth.bind(authController))
  );

  // Protected routes - require authentication
  router.use(authMiddleware.authenticate());

  router.post('/logout',
    errorHandler.asyncHandler(authController.logout.bind(authController))
  );

  router.get('/profile',
    errorHandler.asyncHandler(authController.getProfile.bind(authController))
  );

  router.put('/profile',
    validationMiddleware.validate(validationMiddleware.constructor.schemas.updateProfile || {
      firstName: validationMiddleware.constructor.schemas.registerUser.extract('firstName'),
      lastName: validationMiddleware.constructor.schemas.registerUser.extract('lastName')
    }),
    errorHandler.asyncHandler(authController.updateProfile.bind(authController))
  );

  return router;
}
