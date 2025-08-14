/**
 * Inventory Routes
 * Defines routes for inventory management
 */
import { Router } from 'express';

export function createInventoryRoutes({ 
  inventoryController, 
  validationMiddleware, 
  rateLimitMiddleware, 
  authMiddleware,
  errorHandler 
}) {
  const router = Router();

  // Apply general rate limiting
  router.use(rateLimitMiddleware.general());

  // All inventory routes require authentication
  router.use(authMiddleware.authenticate());

  // General inventory routes
  router.get('/',
    validationMiddleware.validate(validationMiddleware.constructor.schemas.queryParams, 'query'),
    errorHandler.asyncHandler(inventoryController.getAll.bind(inventoryController))
  );

  router.get('/low-stock',
    validationMiddleware.validate(validationMiddleware.constructor.schemas.queryParams, 'query'),
    errorHandler.asyncHandler(inventoryController.getLowStock.bind(inventoryController))
  );

  router.get('/over-stock',
    validationMiddleware.validate(validationMiddleware.constructor.schemas.queryParams, 'query'),
    errorHandler.asyncHandler(inventoryController.getOverStock.bind(inventoryController))
  );

  router.get('/product/:productId',
    validationMiddleware.validate(validationMiddleware.constructor.schemas.idParam, 'params'),
    validationMiddleware.validate(validationMiddleware.constructor.schemas.queryParams, 'query'),
    errorHandler.asyncHandler(inventoryController.getByProduct.bind(inventoryController))
  );

  router.get('/warehouse/:warehouseId',
    validationMiddleware.validate(validationMiddleware.constructor.schemas.idParam, 'params'),
    validationMiddleware.validate(validationMiddleware.constructor.schemas.queryParams, 'query'),
    errorHandler.asyncHandler(inventoryController.getByWarehouse.bind(inventoryController))
  );

  router.get('/:id',
    validationMiddleware.validate(validationMiddleware.constructor.schemas.idParam, 'params'),
    errorHandler.asyncHandler(inventoryController.getById.bind(inventoryController))
  );

  // Admin only routes for create and delete
  router.post('/',
    authMiddleware.authorize(['admin']),
    validationMiddleware.validate(validationMiddleware.constructor.schemas.createInventory),
    errorHandler.asyncHandler(inventoryController.create.bind(inventoryController))
  );

  router.delete('/:id',
    authMiddleware.authorize(['admin']),
    validationMiddleware.validate(validationMiddleware.constructor.schemas.idParam, 'params'),
    errorHandler.asyncHandler(inventoryController.delete.bind(inventoryController))
  );

  // Stock management routes (admin and user with permissions)
  router.put('/:id/stock',
    authMiddleware.authorize(['admin', 'user']),
    validationMiddleware.validate(validationMiddleware.constructor.schemas.idParam, 'params'),
    validationMiddleware.validate(validationMiddleware.constructor.schemas.updateInventoryStock),
    errorHandler.asyncHandler(inventoryController.updateStock.bind(inventoryController))
  );

  router.post('/:id/reserve',
    authMiddleware.authorize(['admin', 'user']),
    validationMiddleware.validate(validationMiddleware.constructor.schemas.idParam, 'params'),
    validationMiddleware.validate({
      quantity: validationMiddleware.constructor.schemas.updateInventoryStock.extract('quantity')
    }),
    errorHandler.asyncHandler(inventoryController.reserveStock.bind(inventoryController))
  );

  router.post('/:id/release',
    authMiddleware.authorize(['admin', 'user']),
    validationMiddleware.validate(validationMiddleware.constructor.schemas.idParam, 'params'),
    validationMiddleware.validate({
      quantity: validationMiddleware.constructor.schemas.updateInventoryStock.extract('quantity')
    }),
    errorHandler.asyncHandler(inventoryController.releaseReservation.bind(inventoryController))
  );

  return router;
}
