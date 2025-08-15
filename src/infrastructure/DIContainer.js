/**
 * Dependency Injection Container
 * Using Awilix for IoC container management
 */
import { createContainer, asClass, asFunction, asValue, Lifetime } from 'awilix';

// Import all dependencies
import { Logger } from '../shared/Logger.js';
import { MongoDatabase } from '../infrastructure/database/MongoDatabase.js';
import { UnitOfWork } from '../infrastructure/database/UnitOfWork.js';

// Read Store (CQRS)
import { ReadDatabase } from '../infrastructure/readStore/ReadDatabase.js';
import { ProductReadRepository } from '../infrastructure/readStore/repositories/ProductReadRepository.js';
import { InventoryReadRepository } from '../infrastructure/readStore/repositories/InventoryReadRepository.js';

// Event System
import { EventBus } from '../infrastructure/events/EventBus.js';
import { ReadModelEventHandlers } from '../infrastructure/events/ReadModelEventHandlers.js';

// Repositories
import { UserRepository } from '../infrastructure/repositories/UserRepository.js';
import { ProductRepository } from '../infrastructure/repositories/ProductRepository.js';
import { InventoryRepository } from '../infrastructure/repositories/InventoryRepository.js';

// Security services
import { JwtTokenService } from '../infrastructure/security/JwtTokenService.js';
import { PasswordService } from '../infrastructure/security/PasswordService.js';

// Cache service
import { CacheService } from '../infrastructure/cache/CacheService.js';

// Application services
import { Mediator } from '../application/Mediator.js';
import { LogService } from '../application/services/LogService.js';
import { CQRSSyncService } from '../application/services/CQRSSyncService.js';

// Command handlers
import { RegisterUserCommandHandler } from '../application/commands/auth/RegisterUserCommandHandler.js';
import { LoginUserCommandHandler } from '../application/commands/auth/LoginUserCommandHandler.js';
import { GoogleAuthCommandHandler } from '../application/commands/auth/GoogleAuthCommandHandler.js';
import { LogoutCommandHandler } from '../application/commands/auth/LogoutCommandHandler.js';
import { CreateProductCommandHandler } from '../application/commands/product/CreateProductCommandHandler.js';
import { UpdateProductCommandHandler } from '../application/commands/product/UpdateProductCommandHandler.js';
import { DeleteProductCommandHandler } from '../application/commands/product/DeleteProductCommandHandler.js';
import { CreateInventoryCommandHandler } from '../application/commands/inventory/CreateInventoryCommandHandler.js';
import { UpdateInventoryCommandHandler } from '../application/commands/inventory/UpdateInventoryCommandHandler.js';
import { DeleteInventoryCommandHandler } from '../application/commands/inventory/DeleteInventoryCommandHandler.js';
import { AdjustInventoryCommandHandler } from '../application/commands/inventory/AdjustInventoryCommandHandler.js';

// Query handlers
import { GetProductByIdQueryHandler } from '../application/queries/product/GetProductByIdQueryHandler.js';
import { GetProductsQueryHandler } from '../application/queries/product/GetProductsQueryHandler.js';
import { GetInventoryByIdQueryHandler } from '../application/queries/inventory/GetInventoryByIdQueryHandler.js';
import { GetInventoryQueryHandler } from '../application/queries/inventory/GetInventoryQueryHandler.js';
import { GetLowStockItemsQueryHandler } from '../application/queries/inventory/GetLowStockItemsQueryHandler.js';

// Fast Query Handlers (CQRS Read Model)
import { FastGetProductsQueryHandler } from '../application/queries/readModel/FastGetProductsQueryHandler.js';
import { FastSearchProductsQueryHandler } from '../application/queries/readModel/FastSearchProductsQueryHandler.js';
import { FastGetProductByIdQueryHandler } from '../application/queries/readModel/FastGetProductByIdQueryHandler.js';
import { FastInventoryAnalyticsQueryHandler } from '../application/queries/readModel/FastInventoryAnalyticsQueryHandler.js';

// Middleware
import { AuthenticationMiddleware } from '../presentation/middleware/AuthenticationMiddleware.js';
import { ValidationMiddleware } from '../presentation/middleware/ValidationMiddleware.js';
import { RateLimitMiddleware } from '../presentation/middleware/RateLimitMiddleware.js';
import { ErrorHandlerMiddleware } from '../presentation/middleware/ErrorHandlerMiddleware.js';

// Controllers
import { AuthController } from '../presentation/controllers/AuthController.js';
import { ProductController } from '../presentation/controllers/ProductController.js';
import { InventoryController } from '../presentation/controllers/InventoryController.js';
import { LogController } from '../presentation/controllers/LogController.js';
import { FastReadController } from '../presentation/controllers/FastReadController.js';
import { CQRSSyncController } from '../presentation/controllers/CQRSSyncController.js';

export class DIContainer {
  constructor() {
    this.container = createContainer();
    this.setupContainer();
  }

  setupContainer() {
    // Register core services
    this.container.register({
      // Shared services
      logger: asClass(Logger).singleton(),
      
      // Database
      database: asClass(MongoDatabase).singleton(),
      readDatabase: asClass(ReadDatabase).singleton(),
      unitOfWork: asClass(UnitOfWork).singleton(),
      
      // Event System (CQRS)
      eventBus: asClass(EventBus).singleton(),
      readModelEventHandlers: asClass(ReadModelEventHandlers).singleton(),
      
      // Write Repositories (Write Model)
      userRepository: asClass(UserRepository).scoped(),
      productRepository: asClass(ProductRepository).scoped(),
      inventoryRepository: asClass(InventoryRepository).scoped(),
      
      // Read Repositories (Read Model)
      productReadRepository: asClass(ProductReadRepository).scoped(),
      inventoryReadRepository: asClass(InventoryReadRepository).scoped(),
      
      // Security services
      jwtTokenService: asClass(JwtTokenService).singleton(),
      passwordService: asClass(PasswordService).singleton(),
      
      // Cache service
      cacheService: asClass(CacheService).singleton(),
      
      // Application services
      mediator: asClass(Mediator).singleton(),
      logService: asClass(LogService).singleton(),
      cqrsSyncService: asClass(CQRSSyncService).singleton(),
      
      // Command handlers
      registerUserCommandHandler: asClass(RegisterUserCommandHandler).scoped(),
      loginUserCommandHandler: asClass(LoginUserCommandHandler).scoped(),
      googleAuthCommandHandler: asClass(GoogleAuthCommandHandler).scoped(),
      logoutCommandHandler: asClass(LogoutCommandHandler).scoped(),
      createProductCommandHandler: asClass(CreateProductCommandHandler).scoped(),
      updateProductCommandHandler: asClass(UpdateProductCommandHandler).scoped(),
      deleteProductCommandHandler: asClass(DeleteProductCommandHandler).scoped(),
      createInventoryCommandHandler: asClass(CreateInventoryCommandHandler).scoped(),
      updateInventoryCommandHandler: asClass(UpdateInventoryCommandHandler).scoped(),
      deleteInventoryCommandHandler: asClass(DeleteInventoryCommandHandler).scoped(),
      adjustInventoryCommandHandler: asClass(AdjustInventoryCommandHandler).scoped(),
      
      // Query handlers (Write Model)
      getProductByIdQueryHandler: asClass(GetProductByIdQueryHandler).scoped(),
      getProductsQueryHandler: asClass(GetProductsQueryHandler).scoped(),
      getInventoryByIdQueryHandler: asClass(GetInventoryByIdQueryHandler).scoped(),
      getInventoryQueryHandler: asClass(GetInventoryQueryHandler).scoped(),
      getLowStockItemsQueryHandler: asClass(GetLowStockItemsQueryHandler).scoped(),
      
      // Fast Query Handlers (Read Model - CQRS)
      fastGetProductsQueryHandler: asClass(FastGetProductsQueryHandler).scoped(),
      fastSearchProductsQueryHandler: asClass(FastSearchProductsQueryHandler).scoped(),
      fastGetProductByIdQueryHandler: asClass(FastGetProductByIdQueryHandler).scoped(),
      fastInventoryAnalyticsQueryHandler: asClass(FastInventoryAnalyticsQueryHandler).scoped(),
      
      // Middleware
      authMiddleware: asClass(AuthenticationMiddleware).singleton(),
      validationMiddleware: asClass(ValidationMiddleware).singleton(),
      rateLimitMiddleware: asClass(RateLimitMiddleware).singleton(),
      errorHandler: asClass(ErrorHandlerMiddleware).singleton(),
      
      // Controllers
      authController: asClass(AuthController).scoped(),
      productController: asClass(ProductController).scoped(),
      inventoryController: asClass(InventoryController).scoped(),
      logController: asClass(LogController).scoped(),
      fastReadController: asClass(FastReadController).scoped(),
      cqrsSyncController: asClass(CQRSSyncController).scoped()
    });

    // Register command and query handlers with mediator
    this.registerMediatorHandlers();
    
    // Setup event handlers for CQRS
    this.setupEventHandlers();
  }

  registerMediatorHandlers() {
    const mediator = this.container.resolve('mediator');
    
    // Register command handlers
    mediator.registerCommandHandler(
      'RegisterUserCommand',
      this.container.resolve('registerUserCommandHandler')
    );
    
    mediator.registerCommandHandler(
      'LoginUserCommand',
      this.container.resolve('loginUserCommandHandler')
    );
    
    mediator.registerCommandHandler(
      'GoogleAuthCommand',
      this.container.resolve('googleAuthCommandHandler')
    );
    
    mediator.registerCommandHandler(
      'LogoutCommand',
      this.container.resolve('logoutCommandHandler')
    );
    
    mediator.registerCommandHandler(
      'CreateProductCommand',
      this.container.resolve('createProductCommandHandler')
    );
    
    mediator.registerCommandHandler(
      'UpdateProductCommand',
      this.container.resolve('updateProductCommandHandler')
    );
    
    mediator.registerCommandHandler(
      'DeleteProductCommand',
      this.container.resolve('deleteProductCommandHandler')
    );
    
    mediator.registerCommandHandler(
      'CreateInventoryCommand',
      this.container.resolve('createInventoryCommandHandler')
    );
    
    mediator.registerCommandHandler(
      'UpdateInventoryCommand',
      this.container.resolve('updateInventoryCommandHandler')
    );
    
    mediator.registerCommandHandler(
      'DeleteInventoryCommand',
      this.container.resolve('deleteInventoryCommandHandler')
    );
    
    mediator.registerCommandHandler(
      'AdjustInventoryCommand',
      this.container.resolve('adjustInventoryCommandHandler')
    );

    // Register query handlers (Write Model)
    mediator.registerQueryHandler(
      'GetProductByIdQuery',
      this.container.resolve('getProductByIdQueryHandler')
    );
    
    mediator.registerQueryHandler(
      'GetProductsQuery',
      this.container.resolve('getProductsQueryHandler')
    );
    
    mediator.registerQueryHandler(
      'GetInventoryByIdQuery',
      this.container.resolve('getInventoryByIdQueryHandler')
    );
    
    mediator.registerQueryHandler(
      'GetInventoryQuery',
      this.container.resolve('getInventoryQueryHandler')
    );
    
    mediator.registerQueryHandler(
      'GetLowStockItemsQuery',
      this.container.resolve('getLowStockItemsQueryHandler')
    );

    // Register fast query handlers (Read Model - CQRS)
    mediator.registerQueryHandler(
      'FastGetProductsQuery',
      this.container.resolve('fastGetProductsQueryHandler')
    );

    mediator.registerQueryHandler(
      'FastSearchProductsQuery',
      this.container.resolve('fastSearchProductsQueryHandler')
    );

    mediator.registerQueryHandler(
      'FastGetProductByIdQuery',
      this.container.resolve('fastGetProductByIdQueryHandler')
    );

    mediator.registerQueryHandler(
      'FastInventoryAnalyticsQuery',
      this.container.resolve('fastInventoryAnalyticsQueryHandler')
    );
  }

  setupEventHandlers() {
    const eventBus = this.container.resolve('eventBus');
    const eventHandlers = this.container.resolve('readModelEventHandlers');
    
    // Register all event handlers
    const handlers = eventHandlers.getEventHandlers();
    
    for (const [eventType, handler] of Object.entries(handlers)) {
      eventBus.subscribe(eventType, handler);
    }

    this.container.resolve('logger').info('Event handlers registered for CQRS read model sync', {
      eventTypes: Object.keys(handlers)
    });
  }

  resolve(name) {
    return this.container.resolve(name);
  }

  register(registrations) {
    this.container.register(registrations);
  }

  getContainer() {
    return this.container;
  }

  // Create a scope for request-specific dependencies
  createScope() {
    return this.container.createScope();
  }

  // Dispose of the container
  dispose() {
    return this.container.dispose();
  }
}
