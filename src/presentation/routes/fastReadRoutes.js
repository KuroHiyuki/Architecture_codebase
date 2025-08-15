/**
 * Fast Read Routes
 * CQRS read model optimized endpoints
 */
import express from 'express';

export const createFastReadRoutes = (container) => {
  const router = express.Router();
  
  // Resolve dependencies
  const fastReadController = container.resolve('fastReadController');
  const authMiddleware = container.resolve('authMiddleware');

  // Fast product queries (read model)
  router.get('/products', 
    authMiddleware.authenticate,
    fastReadController.getProducts.bind(fastReadController)
  );

  router.get('/products/search',
    authMiddleware.authenticate,
    fastReadController.searchProducts.bind(fastReadController)
  );

  router.get('/products/:id',
    authMiddleware.authenticate,
    fastReadController.getProductById.bind(fastReadController)
  );

  // Fast inventory analytics (read model)
  router.get('/inventory/analytics/:type',
    authMiddleware.authenticate,
    fastReadController.getInventoryAnalytics.bind(fastReadController)
  );

  // Performance comparison
  router.get('/performance/compare',
    authMiddleware.authenticate,
    fastReadController.comparePerformance.bind(fastReadController)
  );

  // System health
  router.get('/health/cqrs',
    authMiddleware.authenticate,
    fastReadController.getSystemHealth.bind(fastReadController)
  );

  return router;
};
