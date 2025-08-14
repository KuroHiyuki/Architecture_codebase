/**
 * Dependency Injection Container
 * Using Awilix for IoC container management
 */
import { createContainer, asClass, asFunction, asValue, Lifetime } from 'awilix';

// Import all dependencies
import { Logger } from '../shared/Logger.js';
import { MongoDatabase } from '../infrastructure/database/MongoDatabase.js';
import { UnitOfWork } from '../infrastructure/database/UnitOfWork.js';

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
      unitOfWork: asClass(UnitOfWork).singleton(),
      
      // Repositories
      userRepository: asClass(UserRepository).scoped(),
      productRepository: asClass(ProductRepository).scoped(),
      inventoryRepository: asClass(InventoryRepository).scoped(),
      
      // Security services
      jwtTokenService: asClass(JwtTokenService).singleton(),
      passwordService: asClass(PasswordService).singleton(),
      
      // Cache service
      cacheService: asClass(CacheService).singleton(),
      
      // Application services
      mediator: asClass(Mediator).singleton(),
      logService: asClass(LogService).singleton(),
      
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
      
      // Query handlers
      getProductByIdQueryHandler: asClass(GetProductByIdQueryHandler).scoped(),
      getProductsQueryHandler: asClass(GetProductsQueryHandler).scoped(),
      getInventoryByIdQueryHandler: asClass(GetInventoryByIdQueryHandler).scoped(),
      getInventoryQueryHandler: asClass(GetInventoryQueryHandler).scoped(),
      getLowStockItemsQueryHandler: asClass(GetLowStockItemsQueryHandler).scoped(),
      
      // Middleware
      authMiddleware: asClass(AuthenticationMiddleware).singleton(),
      validationMiddleware: asClass(ValidationMiddleware).singleton(),
      rateLimitMiddleware: asClass(RateLimitMiddleware).singleton(),
      errorHandler: asClass(ErrorHandlerMiddleware).singleton(),
      
      // Controllers
      authController: asClass(AuthController).scoped(),
      productController: asClass(ProductController).scoped(),
      inventoryController: asClass(InventoryController).scoped(),
      logController: asClass(LogController).scoped()
    });

    // Register command and query handlers with mediator
    this.registerMediatorHandlers();
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

    // Register query handlers
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
