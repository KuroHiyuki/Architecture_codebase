# Command and Query Handlers Documentation

## Overview
This document provides a comprehensive list of all command and query handlers implemented in the inventory management system, following CQRS pattern and Clean Architecture principles.

## Command Handlers

### Authentication Commands
1. **RegisterUserCommandHandler** - `src/application/commands/auth/RegisterUserCommandHandler.js`
   - Handles user registration with email validation and password hashing
   - Validates unique email addresses
   - Returns JWT tokens upon successful registration

2. **LoginUserCommandHandler** - `src/application/commands/auth/LoginUserCommandHandler.js`
   - Handles user login with email and password
   - Validates credentials and updates last login timestamp
   - Returns JWT tokens upon successful authentication

3. **GoogleAuthCommandHandler** - `src/application/commands/auth/GoogleAuthCommandHandler.js`
   - Handles Google OAuth authentication
   - Creates new users or links existing accounts with Google ID
   - Returns JWT tokens upon successful authentication

4. **LogoutCommandHandler** - `src/application/commands/auth/LogoutCommandHandler.js`
   - Handles user logout by blacklisting tokens
   - Invalidates both access and refresh tokens
   - Uses cache service for token blacklisting

### Product Commands
1. **CreateProductCommandHandler** - `src/application/commands/product/CreateProductCommandHandler.js`
   - Creates new products with validation
   - Ensures unique SKU and name
   - Handles transactional operations

2. **UpdateProductCommandHandler** - `src/application/commands/product/UpdateProductCommandHandler.js`
   - Updates existing product information
   - Validates product existence before update
   - Handles partial updates with validation

3. **DeleteProductCommandHandler** - `src/application/commands/product/DeleteProductCommandHandler.js`
   - Soft or hard deletes products
   - Validates product existence before deletion
   - Handles cascading operations

### Inventory Commands
1. **CreateInventoryCommandHandler** - `src/application/commands/inventory/CreateInventoryCommandHandler.js`
   - Creates new inventory entries
   - Validates product existence
   - Ensures unique product-warehouse combinations

2. **UpdateInventoryCommandHandler** - `src/application/commands/inventory/UpdateInventoryCommandHandler.js`
   - Updates inventory information
   - Supports partial updates
   - Validates business rules

3. **DeleteInventoryCommandHandler** - `src/application/commands/inventory/DeleteInventoryCommandHandler.js`
   - Deletes inventory entries
   - Validates no reserved quantities exist
   - Handles cleanup operations

4. **AdjustInventoryCommandHandler** - `src/application/commands/inventory/AdjustInventoryCommandHandler.js`
   - Handles various inventory adjustments:
     - ADD: Increase quantity
     - SUBTRACT: Decrease quantity
     - SET: Set absolute quantity
     - RESERVE: Reserve quantities
     - UNRESERVE: Release reserved quantities
   - Validates sufficient quantities for operations
   - Maintains inventory integrity

## Query Handlers

### Product Queries
1. **GetProductByIdQueryHandler** - `src/application/queries/product/GetProductByIdQueryHandler.js`
   - Retrieves a single product by ID
   - Returns null if product not found
   - Includes basic product information

2. **GetProductsQueryHandler** - `src/application/queries/product/GetProductsQueryHandler.js`
   - Retrieves multiple products with pagination
   - Supports filtering by:
     - Name (text search)
     - Category
     - Active status
     - Price range (min/max)
   - Supports sorting and pagination
   - Returns paginated results with metadata

### Inventory Queries
1. **GetInventoryByIdQueryHandler** - `src/application/queries/inventory/GetInventoryByIdQueryHandler.js`
   - Retrieves a single inventory entry by ID
   - Includes populated product information
   - Returns null if not found

2. **GetInventoryQueryHandler** - `src/application/queries/inventory/GetInventoryQueryHandler.js`
   - Retrieves multiple inventory entries with pagination
   - Supports filtering by:
     - Product ID
     - Warehouse ID
     - Low stock status
     - Quantity range (min/max)
     - Location (text search)
   - Supports sorting and pagination
   - Returns paginated results with metadata

3. **GetLowStockItemsQueryHandler** - `src/application/queries/inventory/GetLowStockItemsQueryHandler.js`
   - Retrieves inventory items with low stock levels
   - Filters items where quantity ≤ minimum stock level
   - Optional warehouse filtering
   - Calculates shortage details:
     - Shortage amount
     - Shortage percentage
     - Available quantity (total - reserved)
   - Sorts by shortage severity

## Dependency Injection Registration

All handlers are registered in the DI Container (`src/infrastructure/DIContainer.js`) and with the Mediator pattern for proper CQRS implementation:

### Command Handler Registration
```javascript
mediator.registerCommandHandler('RegisterUserCommand', registerUserCommandHandler);
mediator.registerCommandHandler('LoginUserCommand', loginUserCommandHandler);
mediator.registerCommandHandler('GoogleAuthCommand', googleAuthCommandHandler);
mediator.registerCommandHandler('LogoutCommand', logoutCommandHandler);
mediator.registerCommandHandler('CreateProductCommand', createProductCommandHandler);
mediator.registerCommandHandler('UpdateProductCommand', updateProductCommandHandler);
mediator.registerCommandHandler('DeleteProductCommand', deleteProductCommandHandler);
mediator.registerCommandHandler('CreateInventoryCommand', createInventoryCommandHandler);
mediator.registerCommandHandler('UpdateInventoryCommand', updateInventoryCommandHandler);
mediator.registerCommandHandler('DeleteInventoryCommand', deleteInventoryCommandHandler);
mediator.registerCommandHandler('AdjustInventoryCommand', adjustInventoryCommandHandler);
```

### Query Handler Registration
```javascript
mediator.registerQueryHandler('GetProductByIdQuery', getProductByIdQueryHandler);
mediator.registerQueryHandler('GetProductsQuery', getProductsQueryHandler);
mediator.registerQueryHandler('GetInventoryByIdQuery', getInventoryByIdQueryHandler);
mediator.registerQueryHandler('GetInventoryQuery', getInventoryQueryHandler);
mediator.registerQueryHandler('GetLowStockItemsQuery', getLowStockItemsQueryHandler);
```

## Repository Implementations

### ProductRepository
- Implements `IProductRepository` interface
- MongoDB-based implementation using ProductModel
- Supports all CRUD operations with pagination and filtering
- Includes specialized methods for finding by name and SKU

### InventoryRepository
- Implements `IInventoryRepository` interface
- MongoDB-based implementation using InventoryModel
- Supports complex inventory operations
- Includes methods for low stock detection and quantity adjustments
- Supports product population for enriched data

### CacheService
- Simple in-memory cache implementation for development
- Used for token blacklisting in logout operations
- Supports TTL (Time To Live) for automatic expiration
- Thread-safe operations with cleanup timers

## Key Features Implemented

1. **CQRS Pattern**: Complete separation of commands and queries
2. **Clean Architecture**: Proper layering with dependency inversion
3. **Domain-Driven Design**: Rich domain entities and value objects
4. **Transaction Support**: All command operations use database transactions
5. **Comprehensive Logging**: Structured logging for all operations
6. **Error Handling**: Proper error propagation and logging
7. **Validation**: Business rule validation in handlers
8. **Security**: JWT token management and blacklisting
9. **Pagination**: Consistent pagination across all list operations
10. **Filtering**: Flexible filtering options for queries

## Usage Examples

### Commands
```javascript
// Create product
await mediator.send(new CreateProductCommand({
  name: 'Product Name',
  sku: 'SKU123',
  price: { amount: 99.99, currency: 'USD' },
  category: 'Electronics'
}));

// Adjust inventory
await mediator.send(new AdjustInventoryCommand({
  inventoryId: 'inv-123',
  adjustmentType: 'ADD',
  quantity: 50
}));
```

### Queries
```javascript
// Get products with filtering
const result = await mediator.send(new GetProductsQuery({
  page: 1,
  limit: 10,
  filters: {
    category: 'Electronics',
    isActive: true,
    minPrice: 10,
    maxPrice: 100
  }
}));

// Get low stock items
const lowStockItems = await mediator.send(new GetLowStockItemsQuery({
  warehouseId: 'warehouse-1',
  page: 1,
  limit: 50
}));
```

## Testing

The application starts successfully and all handlers are properly registered. The system is ready for:
- API endpoint testing
- Business logic validation
- Integration testing
- Performance testing

All components follow best practices for:
- Error handling
- Logging
- Transaction management
- Input validation
- Security considerations
