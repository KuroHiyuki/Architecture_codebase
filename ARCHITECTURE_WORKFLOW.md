# Sơ Đồ Workflow và Tương Tác Giữa Các Thành Phần

## 🏗️ Tổng Quan Kiến Trúc với CQRS

```mermaid
graph TB
    %% Presentation Layer
    subgraph "🌐 Presentation Layer"
        API[API Routes]
        CTRL[Controllers]
        FAST_CTRL[FastReadController]
        MW[Middleware]
    end

    %% Application Layer
    subgraph "🎯 Application Layer"
        MED[Mediator]
        CMD[Command Handlers]
        QRY[Query Handlers]
        FAST_QRY[Fast Query Handlers]
        SVC[Application Services]
    end

    %% Domain Layer
    subgraph "🏛️ Domain Layer"
        ENT[Entities]
        VO[Value Objects]
        AGG[Aggregates]
        DOM_SVC[Domain Services]
    end

    %% Infrastructure Layer - Write Side
    subgraph "🔧 Infrastructure Layer - Write Side"
        REPO[Write Repositories]
        DB[Write Database]
        UOW[Unit of Work]
    end

    %% Infrastructure Layer - Read Side
    subgraph "📊 Infrastructure Layer - Read Side"
        READ_REPO[Read Repositories]
        READ_DB[Read Database]
        CACHE[Cache Layer]
    end

    %% Event System
    subgraph "🔄 Event System (CQRS)"
        EVENT_BUS[Event Bus]
        EVENT_HANDLERS[Event Handlers]
    end

    %% DI Container
    DI[🏭 DI Container<br/>Awilix IoC]

    %% Write Flow
    API --> MW
    MW --> CTRL
    CTRL --> MED
    MED --> CMD
    CMD --> REPO
    CMD --> UOW
    REPO --> DB
    
    %% Read Flow (Fast)
    API --> FAST_CTRL
    FAST_CTRL --> MED
    MED --> FAST_QRY
    FAST_QRY --> READ_REPO
    READ_REPO --> READ_DB
    READ_REPO --> CACHE

    %% Event Flow (CQRS Sync)
    CMD --> EVENT_BUS
    EVENT_BUS --> EVENT_HANDLERS
    EVENT_HANDLERS --> READ_REPO
    
    %% DI connections
    DI -.-> CTRL
    DI -.-> FAST_CTRL
    DI -.-> MED
    DI -.-> CMD
    DI -.-> FAST_QRY
    DI -.-> REPO
    DI -.-> READ_REPO
    DI -.-> EVENT_BUS
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

## 🔄 Complete Request Flow

```mermaid
graph TB
    START([HTTP Request]) --> TYPE{Request Type?}
    
    TYPE -->|Write Operation| WRITE_FLOW[Write Flow]
    TYPE -->|Read Operation| READ_TYPE{Fast Read?}
    
    READ_TYPE -->|Normal Read| NORMAL_READ[Normal Read Flow]
    READ_TYPE -->|Fast Read| FAST_READ[Fast Read Flow]
    
    subgraph "✍️ Write Flow (CQRS Command Side)"
        WRITE_FLOW --> AUTH1{Authentication}
        AUTH1 -->|Valid| VAL1{Validation}
        AUTH1 -->|Invalid| UNAUTH1[401 Unauthorized]
        
        VAL1 -->|Valid| RATE1{Rate Limit}
        VAL1 -->|Invalid| BAD1[400 Bad Request]
        
        RATE1 -->|OK| CTRL1[Controller]
        RATE1 -->|Exceeded| LIMIT1[429 Too Many Requests]
        
        CTRL1 --> CMD_FLOW[Command Processing]
        CMD_FLOW --> VALIDATE_CMD[Validate Command]
        VALIDATE_CMD --> START_TRANS[Start Transaction]
        START_TRANS --> BIZ_LOGIC[Business Logic]
        BIZ_LOGIC --> SAVE_DATA[Save to Write DB]
        SAVE_DATA --> COMMIT[Commit Transaction]
        COMMIT --> PUBLISH_EVENT[Publish Event]
        PUBLISH_EVENT --> LOG_SUCCESS1[Log Success]
        LOG_SUCCESS1 --> RESPONSE1[HTTP Response]
    end
    
    subgraph "� Normal Read Flow (Write Model)"
        NORMAL_READ --> AUTH2{Authentication}
        AUTH2 -->|Valid| CTRL2[Controller]
        AUTH2 -->|Invalid| UNAUTH2[401 Unauthorized]
        
        CTRL2 --> QRY_FLOW[Query Processing]
        QRY_FLOW --> VALIDATE_QRY[Validate Query]
        VALIDATE_QRY --> FETCH_WRITE[Fetch from Write DB]
        FETCH_WRITE --> FORMAT1[Format Response]
        FORMAT1 --> RESPONSE2[HTTP Response]
    end
    
    subgraph "⚡ Fast Read Flow (Read Model)"
        FAST_READ --> AUTH3{Authentication}
        AUTH3 -->|Valid| FAST_CTRL[FastReadController]
        AUTH3 -->|Invalid| UNAUTH3[401 Unauthorized]
        
        FAST_CTRL --> FAST_QRY_FLOW[Fast Query Processing]
        FAST_QRY_FLOW --> CHECK_CACHE{Cache Hit?}
        CHECK_CACHE -->|Hit| CACHE_RESPONSE[Return Cached Data]
        CHECK_CACHE -->|Miss| FETCH_READ[Fetch from Read DB]
        FETCH_READ --> UPDATE_CACHE[Update Cache]
        UPDATE_CACHE --> FORMAT2[Format Response]
        CACHE_RESPONSE --> RESPONSE3[HTTP Response]
        FORMAT2 --> RESPONSE3
    end
    
    subgraph "🔄 Event Processing (Background)"
        PUBLISH_EVENT --> EVENT_BUS[Event Bus Queue]
        EVENT_BUS --> PROCESS_EVENT[Process Event]
        PROCESS_EVENT --> UPDATE_READ[Update Read Model]
        UPDATE_READ --> CLEAR_CACHE[Clear Related Cache]
    end
    
    RESPONSE1 --> END1([Client Response])
    RESPONSE2 --> END2([Client Response])
    RESPONSE3 --> END3([Client Response])
```

## 🎯 CQRS Event-Driven Synchronization

```mermaid
sequenceDiagram
    participant Client
    participant WriteAPI as Write API
    participant WriteDB as Write Database
    participant EventBus as Event Bus
    participant EventHandler as Event Handler
    participant ReadDB as Read Database
    participant Cache
    participant ReadAPI as Read API (Fast)

    Note over Client, ReadAPI: Write Operation Flow
    Client->>WriteAPI: POST /api/products (Create Product)
    WriteAPI->>WriteDB: Save to normalized tables
    WriteDB-->>WriteAPI: Product saved
    WriteAPI->>EventBus: Publish ProductCreated event
    WriteAPI-->>Client: 201 Created

    Note over EventBus, ReadDB: Background Sync (Async)
    EventBus->>EventHandler: Process ProductCreated event
    EventHandler->>ReadDB: Update denormalized read model
    EventHandler->>Cache: Clear related cache
    
    Note over Client, ReadAPI: Read Operation Flow (Later)
    Client->>ReadAPI: GET /api/fast/products
    ReadAPI->>Cache: Check cache
    Cache-->>ReadAPI: Cache miss
    ReadAPI->>ReadDB: Query denormalized data
    ReadDB-->>ReadAPI: Fast results (no joins)
    ReadAPI->>Cache: Update cache
    ReadAPI-->>Client: 200 OK (Fast response)
    
    Note over Client, ReadAPI: Subsequent Read (Cache Hit)
    Client->>ReadAPI: GET /api/fast/products
    ReadAPI->>Cache: Check cache
    Cache-->>ReadAPI: Cache hit
    ReadAPI-->>Client: 200 OK (Very fast response)
```

## 📊 Architecture Benefits

### ✅ CQRS (Command Query Responsibility Segregation)
- **Separate Read/Write Models**: Tối ưu riêng biệt cho từng loại operation
- **Read Model Denormalization**: Data được flatten để queries nhanh hơn
- **Independent Scaling**: Scale read và write operations độc lập
- **Event-Driven Sync**: Read models được sync qua events từ write models
- **Performance**: Read operations có thể nhanh gấp 2-10x so với write model

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
- **CQRS**: Tách biệt read/write operations với models riêng
- **Event Sourcing**: Event-driven synchronization
- **Mediator**: Decoupling giữa controllers và handlers
- **Repository**: Abstraction cho data access
- **Unit of Work**: Transaction management
- **Dependency Injection**: Loose coupling và testability

### ✅ Scalability & Maintainability
- **Modular Design**: Dễ dàng thêm features mới
- **Error Handling**: Centralized error management
- **Logging**: Comprehensive monitoring
- **Caching**: Performance optimization với multiple layers
- **Security**: Authentication, authorization, rate limiting
- **Performance**: Read model có thể cache aggressive hơn write model

## 🚀 CQRS Performance Benefits

### Read Model Advantages:
1. **Denormalized Data**: Giảm joins, faster queries
2. **Optimized Indexes**: Indexes được tối ưu cho read patterns
3. **Aggressive Caching**: Cache được longer vì read-only
4. **Separate Database**: Có thể dùng read replicas hoặc different DB
5. **Text Search**: Full-text indexes cho search performance

### API Endpoints Comparison:

**Write Model (Normalized):**
- `GET /api/products` - Standard queries từ write database
- `GET /api/inventory` - Complex joins và calculations

**Read Model (Denormalized):**
- `GET /api/fast/products` - Pre-calculated, cached results
- `GET /api/fast/inventory/analytics/summary` - Pre-aggregated data
- `GET /api/fast/products/search` - Optimized text search
- `GET /api/fast/performance/compare` - Performance comparison

### Performance Metrics Expected:
- **Read Speed**: 2-10x faster than write model
- **Cache Hit Rate**: 80-95% for read model
- **Search Performance**: 5-20x faster với text indexes
- **Analytics Queries**: 10-100x faster với pre-aggregated data
