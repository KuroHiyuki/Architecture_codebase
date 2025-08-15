# Sơ Đồ Workflow và Tương Tác Giữa Các Thành Phần

## 🏗️ Tổng Quan Kiến Trúc

```mermaid
graph TB
    %% Presentation Layer
    subgraph "🌐 Presentation Layer"
        API[API Routes]
        CTRL[Controllers]
        MW[Middleware]
    end

    %% Application Layer
    subgraph "🎯 Application Layer"
        MED[Mediator]
        CMD[Command Handlers]
        QRY[Query Handlers]
        SVC[Application Services]
    end

    %% Domain Layer
    subgraph "🏛️ Domain Layer"
        ENT[Entities]
        VO[Value Objects]
        AGG[Aggregates]
        DOM_SVC[Domain Services]
    end

    %% Infrastructure Layer
    subgraph "🔧 Infrastructure Layer"
        REPO[Repositories]
        DB[Database]
        CACHE[Cache]
        SEC[Security Services]
        LOG[Logger]
    end

    %% DI Container
    DI[🏭 DI Container<br/>Awilix IoC]

    %% Flow
    API --> MW
    MW --> CTRL
    CTRL --> MED
    MED --> CMD
    MED --> QRY
    CMD --> REPO
    QRY --> REPO
    CMD --> ENT
    REPO --> DB
    
    %% DI connections
    DI -.-> CTRL
    DI -.-> MED
    DI -.-> CMD
    DI -.-> QRY
    DI -.-> REPO
    DI -.-> SEC
    DI -.-> LOG
```

## 🔄 Chi Tiết Workflow: Tạo Sản Phẩm

```mermaid
sequenceDiagram
    participant Client
    participant API as API Route
    participant MW as Middleware
    participant PC as ProductController
    participant DI as DIContainer
    participant MED as Mediator
    participant CH as CreateProductCommandHandler
    participant UOW as UnitOfWork
    participant REPO as ProductRepository
    participant DB as MongoDB
    participant LOG as Logger

    Client->>API: POST /api/products
    API->>MW: Request Processing
    
    MW->>MW: Authentication
    MW->>MW: Validation
    MW->>MW: Rate Limiting
    
    MW->>PC: Forward Request
    PC->>DI: Resolve Dependencies
    DI-->>PC: Inject mediator, logger
    
    PC->>PC: Create Command Object
    PC->>MED: mediator.send(command)
    
    MED->>MED: Validate Command
    MED->>CH: Find & Execute Handler
    
    CH->>LOG: Log Start Process
    CH->>REPO: Check SKU Exists
    REPO->>DB: Query Database
    DB-->>REPO: Result
    REPO-->>CH: Validation Result
    
    CH->>CH: Create Product Entity
    CH->>UOW: Start Transaction
    UOW->>DB: Begin Transaction
    DB-->>UOW: Session
    
    CH->>REPO: Save Product
    REPO->>DB: Insert with Session
    DB-->>REPO: Saved Product
    REPO-->>CH: Product Result
    
    CH->>UOW: Commit Transaction
    UOW->>DB: Commit & End Session
    
    CH->>LOG: Log Success
    CH-->>MED: Return Result
    MED-->>PC: Command Result
    PC->>LOG: Log Controller Action
    PC-->>API: HTTP Response
    API-->>Client: JSON Response
```

## 🏭 DIContainer - Dependency Injection Flow

```mermaid
graph TB
    subgraph "🏭 DI Container (Awilix)"
        REG[Registration Phase]
        RES[Resolution Phase]
        SCOPE[Scope Management]
    end

    subgraph "📦 Service Lifetimes"
        SING[Singleton<br/>- Logger<br/>- Database<br/>- JwtService]
        SCOPED[Scoped<br/>- Controllers<br/>- Handlers<br/>- Repositories]
        TRANS[Transient<br/>- Commands<br/>- Queries]
    end

    subgraph "🔗 Dependency Graph"
        CTRL_DEP[Controller Dependencies]
        HAND_DEP[Handler Dependencies] 
        REPO_DEP[Repository Dependencies]
    end

    REG --> SING
    REG --> SCOPED
    REG --> TRANS
    
    RES --> CTRL_DEP
    RES --> HAND_DEP
    RES --> REPO_DEP
    
    SCOPE --> SCOPED
```

### DIContainer Functions:
1. **Registration (setupContainer())**:
   - Đăng ký tất cả services với lifetime phù hợp
   - Singleton: Services dùng chung (Logger, Database)
   - Scoped: Services theo request (Controllers, Handlers)
   - Transient: Objects tạo mới mỗi lần (Commands, Queries)

2. **Resolution (resolve())**:
   - Tự động inject dependencies vào constructor
   - Quản lý dependency graph và circular dependencies
   - Lazy loading các dependencies

3. **Mediator Registration**:
   - Đăng ký tất cả Command/Query handlers với Mediator
   - Map command types với handlers tương ứng

## 🎭 Mediator Pattern - CQRS Implementation

```mermaid
graph LR
    subgraph "📨 Commands (Write Operations)"
        CC[CreateProductCommand]
        UC[UpdateProductCommand]
        DC[DeleteProductCommand]
    end

    subgraph "🔍 Queries (Read Operations)"
        GQ[GetProductsQuery]
        GIQ[GetProductByIdQuery]
        SQ[SearchQuery]
    end

    subgraph "🎭 Mediator"
        CMD_MAP[Command Handlers Map]
        QRY_MAP[Query Handlers Map]
        VALIDATE[Validation Logic]
    end

    subgraph "⚡ Handlers"
        CMD_H[Command Handlers]
        QRY_H[Query Handlers]
    end

    CC --> CMD_MAP
    UC --> CMD_MAP
    DC --> CMD_MAP
    
    GQ --> QRY_MAP
    GIQ --> QRY_MAP
    SQ --> QRY_MAP
    
    CMD_MAP --> VALIDATE
    QRY_MAP --> VALIDATE
    
    VALIDATE --> CMD_H
    VALIDATE --> QRY_H
```

### Mediator Functions:
1. **Command Handling**:
   - Nhận command từ controller
   - Validate command data
   - Route đến đúng command handler
   - Write operations (Create, Update, Delete)

2. **Query Handling**:
   - Nhận query từ controller
   - Validate query parameters
   - Route đến đúng query handler
   - Read operations (Get, Search, Filter)

3. **Decoupling**:
   - Controllers không biết về handlers
   - Dễ dàng thêm/sửa handlers
   - Centralized validation và error handling

## 🔄 Unit of Work Pattern

```mermaid
graph TB
    subgraph "🔄 UnitOfWork"
        START[startTransaction()]
        COMMIT[commitTransaction()]
        ROLLBACK[rollbackTransaction()]
        EXEC[executeInTransaction()]
    end

    subgraph "💾 Database Operations"
        SESS[MongoDB Session]
        TRANS[Transaction State]
        OPS[Multiple Operations]
    end

    START --> SESS
    SESS --> TRANS
    TRANS --> OPS
    
    OPS --> COMMIT
    OPS --> ROLLBACK
    
    EXEC --> START
    EXEC --> COMMIT
    EXEC --> ROLLBACK
```

### Unit of Work Functions:
1. **Transaction Management**:
   - Đảm bảo ACID properties
   - All-or-nothing operations
   - Consistency across multiple repositories

2. **Session Handling**:
   - Quản lý MongoDB sessions
   - Auto cleanup resources
   - Error handling và rollback

## 🎯 Complete Request Flow

```mermaid
graph TB
    START([HTTP Request]) --> AUTH{Authentication}
    AUTH -->|Valid| VAL{Validation}
    AUTH -->|Invalid| UNAUTH[401 Unauthorized]
    
    VAL -->|Valid| RATE{Rate Limit}
    VAL -->|Invalid| BAD[400 Bad Request]
    
    RATE -->|OK| CTRL[Controller]
    RATE -->|Exceeded| LIMIT[429 Too Many Requests]
    
    CTRL --> CMD_QRY{Command or Query?}
    
    CMD_QRY -->|Command| CMD_FLOW[Command Flow]
    CMD_QRY -->|Query| QRY_FLOW[Query Flow]
    
    subgraph "📝 Command Flow"
        CMD_FLOW --> VALIDATE_CMD[Validate Command]
        VALIDATE_CMD --> START_TRANS[Start Transaction]
        START_TRANS --> BIZ_LOGIC[Business Logic]
        BIZ_LOGIC --> SAVE_DATA[Save to Database]
        SAVE_DATA --> COMMIT[Commit Transaction]
        COMMIT --> LOG_SUCCESS[Log Success]
    end
    
    subgraph "🔍 Query Flow"
        QRY_FLOW --> VALIDATE_QRY[Validate Query]
        VALIDATE_QRY --> FETCH_DATA[Fetch from Database/Cache]
        FETCH_DATA --> FORMAT[Format Response]
    end
    
    LOG_SUCCESS --> RESPONSE[HTTP Response]
    FORMAT --> RESPONSE
    
    RESPONSE --> END([Client Response])
```

## 📊 Architecture Benefits

### ✅ Clean Architecture
- **Separation of Concerns**: Mỗi layer có trách nhiệm rõ ràng
- **Dependency Inversion**: Depend on abstractions, not concretions
- **Testability**: Dễ dàng unit test từng component

### ✅ SOLID Principles
- **Single Responsibility**: Mỗi class có 1 nhiệm vụ duy nhất
- **Open/Closed**: Mở cho extension, đóng cho modification
- **Liskov Substitution**: Có thể thay thế implementations
- **Interface Segregation**: Interfaces nhỏ và focused
- **Dependency Inversion**: High-level modules không depend vào low-level

### ✅ Design Patterns
- **CQRS**: Tách biệt read/write operations
- **Mediator**: Decoupling giữa controllers và handlers
- **Repository**: Abstraction cho data access
- **Unit of Work**: Transaction management
- **Dependency Injection**: Loose coupling và testability

### ✅ Scalability & Maintainability
- **Modular Design**: Dễ dàng thêm features mới
- **Error Handling**: Centralized error management
- **Logging**: Comprehensive monitoring
- **Caching**: Performance optimization
- **Security**: Authentication, authorization, rate limiting
