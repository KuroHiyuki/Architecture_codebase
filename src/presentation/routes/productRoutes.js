/**
 * Product Routes
 * Defines routes for product management
 */
import { Router } from 'express';

export function createProductRoutes({ 
  productController, 
  validationMiddleware, 
  rateLimitMiddleware, 
  authMiddleware,
  errorHandler 
}) {
  const router = Router();

  // Apply general rate limiting
  router.use(rateLimitMiddleware.general());

  // Public routes (read-only)
  router.get('/',
    validationMiddleware.validate(validationMiddleware.constructor.schemas.queryParams, 'query'),
    errorHandler.asyncHandler(productController.getAll.bind(productController))
  );

  router.get('/search',
    validationMiddleware.validate(validationMiddleware.constructor.schemas.queryParams, 'query'),
    errorHandler.asyncHandler(productController.search.bind(productController))
  );

  router.get('/category/:category',
    validationMiddleware.validate(validationMiddleware.constructor.schemas.queryParams, 'query'),
    errorHandler.asyncHandler(productController.getByCategory.bind(productController))
  );

  router.get('/:id',
    validationMiddleware.validate(validationMiddleware.constructor.schemas.idParam, 'params'),
    errorHandler.asyncHandler(productController.getById.bind(productController))
  );

  // Protected routes - require authentication
  router.use(authMiddleware.authenticate());

  // Admin only routes for create, update, delete
  router.post('/',
    authMiddleware.authorize(['admin']),
    validationMiddleware.validate(validationMiddleware.constructor.schemas.createProduct),
    errorHandler.asyncHandler(productController.create.bind(productController))
  );

  router.put('/:id',
    authMiddleware.authorize(['admin']),
    validationMiddleware.validate(validationMiddleware.constructor.schemas.idParam, 'params'),
    validationMiddleware.validate(validationMiddleware.constructor.schemas.updateProduct),
    errorHandler.asyncHandler(productController.update.bind(productController))
  );

  router.delete('/:id',
    authMiddleware.authorize(['admin']),
    validationMiddleware.validate(validationMiddleware.constructor.schemas.idParam, 'params'),
    errorHandler.asyncHandler(productController.delete.bind(productController))
  );

  return router;
}
