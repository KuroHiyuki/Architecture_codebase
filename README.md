# Clean Architecture Inventory Management System

```mermaid
flowchart LR
  subgraph Presentation
    A["API Gateway / Express App\n(presentation/Application.js)"]
    B["Controllers & Routes"]
  end

  subgraph Application_Layer
    C["Commands / Queries / Mediator"]
  end

  subgraph Domain_Layer
    D["Entities / Value Objects / Domain Services"]
  end

  subgraph Infrastructure
    E["Repositories (MongoDB via Mongoose)"]
    F["Auth Services (JWT, Google OAuth)"]
    G["Background Workers / Queues"]
    H["Logging & Monitoring (Winston, Metrics)"]
  end

  A --> B
  B --> C
  C --> D
  C --> E
  E --> D
  B --> F
  G --> E
  A --> H


A comprehensive inventory management system built with Node.js following Clean Architecture principles, Domain-Driven Design (DDD), and CQRS patterns.

## 🏗️ Architecture Overview

This project implements a **Clean Architecture** with the following layers:

### 📁 Project Structure

```
src/
├── application/          # Application Business Rules
│   ├── commands/        # CQRS Commands
│   ├── queries/         # CQRS Queries  
│   ├── interfaces/      # Application Interfaces
│   └── Mediator.js      # Mediator Pattern Implementation
├── domain/              # Enterprise Business Rules
│   ├── entities/        # Domain Entities
│   ├── repositories/    # Repository Interfaces
│   └── value-objects/   # Value Objects
├── infrastructure/      # Frameworks & External Concerns
│   ├── database/        # Database Configuration
│   ├── repositories/    # Repository Implementations
│   ├── security/        # Security Services
│   └── DIContainer.js   # Dependency Injection
├── presentation/        # Interface Adapters
│   ├── controllers/     # HTTP Controllers
│   ├── middleware/      # Express Middleware
│   ├── routes/          # Route Definitions
│   └── Application.js   # Express App Setup
└── shared/              # Shared Utilities
    ├── Logger.js        # Logging System
    └── ResponseHelper.js # Response Formatting
```

## 🎯 Design Principles Applied

### Clean Architecture
- **Independence of Frameworks**: The architecture doesn't depend on external libraries
- **Testable**: Business rules can be tested without external elements
- **Independent of UI**: UI can change without changing business rules
- **Independent of Database**: Business rules are not bound to the database
- **Independent of External Agency**: Business rules don't know about the outside world

### SOLID Principles
- **S**ingle Responsibility Principle
- **O**pen/Closed Principle
- **L**iskov Substitution Principle
- **I**nterface Segregation Principle
- **D**ependency Inversion Principle

### Domain-Driven Design (DDD)
- Domain Entities with business logic
- Value Objects for type safety
- Repository pattern for data access
- Domain services for complex business operations

### CQRS (Command Query Responsibility Segregation)
- Separate models for reading and writing data
- Commands for write operations
- Queries for read operations
- Mediator pattern for handling commands/queries

## 🚀 Features

### Authentication & Authorization
- User registration and login
- JWT token-based authentication
- Google OAuth2 integration
- Role-based access control (RBAC)
- Password strength validation
- Rate limiting for security

### Product Management
- Create, read, update, delete products
- Product categorization and tagging
- SKU management
- Price management with currency support
- Product search and filtering

### Inventory Management
- Real-time stock tracking
- Stock reservations
- Low stock and overstock alerts
- Multi-warehouse support
- Location-based inventory
- Unit cost tracking

### Security Features
- Enhanced helmet configuration
- CORS protection
- Input validation and sanitization
- Signature validation
- Rate limiting per endpoint
- SQL injection prevention
- XSS protection

### Monitoring & Logging
- Structured logging with Winston
- Request/response logging
- Error tracking
- Performance monitoring
- Health check endpoints
- Database operation logging

## 🛠️ Technology Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose
- **Authentication**: JWT, Passport.js
- **Validation**: Joi
- **Logging**: Winston
- **DI Container**: Awilix
- **Security**: Helmet, CORS
- **Rate Limiting**: express-rate-limit

## 📋 Prerequisites

- Node.js 18+ 
- MongoDB 5.0+
- npm or yarn

## 🚀 Quick Start

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd Architecture_codebase
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   ```bash
   cp .env.example .env
   ```
   Edit `.env` with your configuration values.

4. **Start MongoDB**
   ```bash
   # Using Docker
   docker run -d -p 27017:27017 --name mongodb mongo:5.0

   # Or start your local MongoDB instance
   mongod
   ```

5. **Run the application**
   ```bash
   # Development mode
   npm run dev

   # Production mode
   npm start
   ```

6. **Access the API**
   - API Base URL: `http://localhost:3000`
   - Health Check: `http://localhost:3000/health`
   - API Documentation: `http://localhost:3000/api-docs`

## 📚 API Endpoints

### Authentication
```
POST   /api/auth/register      # User registration
POST   /api/auth/login         # User login
POST   /api/auth/logout        # User logout
GET    /api/auth/profile       # Get user profile
PUT    /api/auth/profile       # Update user profile
POST   /api/auth/refresh-token # Refresh JWT token
GET    /api/auth/google        # Google OAuth login
```

### Products
```
GET    /api/products           # Get all products
GET    /api/products/:id       # Get product by ID
POST   /api/products           # Create product (Admin)
PUT    /api/products/:id       # Update product (Admin)
DELETE /api/products/:id       # Delete product (Admin)
GET    /api/products/search    # Search products
GET    /api/products/category/:category # Get by category
```

### Inventory
```
GET    /api/inventory          # Get all inventory
GET    /api/inventory/:id      # Get inventory by ID
POST   /api/inventory          # Create inventory (Admin)
PUT    /api/inventory/:id/stock # Update stock
POST   /api/inventory/:id/reserve # Reserve stock
POST   /api/inventory/:id/release # Release reservation
GET    /api/inventory/low-stock # Get low stock items
GET    /api/inventory/over-stock # Get overstock items
DELETE /api/inventory/:id      # Delete inventory (Admin)
```

## 🧪 Testing

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

## 🐳 Docker Deployment

```bash
# Build image
docker build -t inventory-api .

# Run container
docker run -p 3000:3000 --env-file .env inventory-api
```

## 📊 Monitoring

The application includes comprehensive monitoring:

- **Health Checks**: `/health` endpoint
- **Metrics**: Performance and business metrics
- **Logging**: Structured logs with Winston
- **Error Tracking**: Global error handling

## 🔒 Security

- JWT token authentication
- Password hashing with bcrypt
- Rate limiting
- CORS configuration
- Helmet security headers
- Input validation and sanitization
- MongoDB injection prevention

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Ensure all tests pass
6. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Clean Architecture concepts by Robert C. Martin
- Domain-Driven Design by Eric Evans
- CQRS pattern implementation
- Node.js and Express.js communities

---

**Built with ❤️ using Clean Architecture principles**
