# MongoDB Database Logging System Documentation

## Overview
Hệ thống logging đã được nâng cấp để lưu trữ logs vào MongoDB database thay vì chỉ console và file. Điều này cho phép truy vấn, phân tích và giám sát logs một cách hiệu quả.

## 🆕 New Features

### 1. **Database Logging**
- Logs được lưu trữ vào MongoDB collection `logs`
- Automatic TTL (Time To Live) để tự động xóa logs cũ
- Structured logging với metadata tách biệt theo loại

### 2. **Log Management API**
Hoàn toàn mới - 12 endpoints để quản lý logs:

#### **Basic Log Queries:**
- `GET /api/logs` - Get logs with filtering and pagination
- `GET /api/logs/errors` - Get error logs only
- `GET /api/logs/level/{level}` - Get logs by level (error/warn/info/debug)
- `GET /api/logs/service/{service}` - Get logs by service
- `GET /api/logs/user/{userId}` - Get logs by user (requires auth)

#### **Advanced Queries:**
- `GET /api/logs/search?q={term}` - Full-text search in logs
- `GET /api/logs/recent?minutes={n}` - Get recent logs (last N minutes)
- `GET /api/logs/statistics` - Get log statistics and distribution

#### **Monitoring & Analysis:**
- `GET /api/logs/health` - System health based on error rates
- `GET /api/logs/analysis/errors` - Error pattern analysis
- `GET /api/logs/export` - Export logs (Admin only) - JSON/CSV formats

### 3. **Smart Log Categorization**
Logs được tự động phân loại và structure:

```javascript
// HTTP Request logs
{
  level: 'info',
  message: 'HTTP Request',
  httpRequest: {
    method: 'GET',
    url: '/api/products',
    statusCode: 200,
    duration: '45ms',
    ip: '192.168.1.100',
    userId: 'user-123'
  }
}

// Database Operation logs
{
  level: 'debug',
  message: 'Database Operation',
  databaseOperation: {
    operation: 'find',
    collection: 'products',
    query: {...},
    resultCount: 10
  }
}

// Security Event logs
{
  level: 'warn',
  message: 'Security Event',
  securityEvent: {
    event: 'failed_login',
    userId: 'user-123',
    ip: '192.168.1.100',
    severity: 'medium'
  }
}

// Error logs
{
  level: 'error',
  message: 'Database connection failed',
  error: {
    name: 'MongoError',
    message: 'Connection timeout',
    stack: '...',
    code: 'ETIMEOUT'
  }
}
```

### 4. **Performance Optimizations**
- **Buffer-based writing**: Logs được buffer trước khi ghi vào DB
- **Batch insertions**: Ghi nhiều logs cùng lúc để tăng performance
- **Async processing**: Không block application performance
- **Automatic expiration**: TTL indexes để tự động cleanup

## 📊 Log Schema Design

```javascript
{
  _id: "uuid",
  level: "error|warn|info|debug",
  message: "Log message",
  timestamp: ISODate,
  service: "inventory-management",
  environment: "development|production",
  
  // Categorized metadata
  httpRequest: {...},      // HTTP-related logs
  databaseOperation: {...}, // DB operation logs
  securityEvent: {...},    // Security events
  businessOperation: {...}, // Business logic logs
  performance: {...},      // Performance metrics
  error: {...},           // Error details
  context: {...},         // Request context (traceId, etc)
  
  // Auto-expiration
  expiresAt: ISODate
}
```

## 🔧 Configuration

### Environment Variables
```bash
# Enable/disable database logging
ENABLE_DB_LOGGING=true

# Buffer configuration for performance
LOG_BUFFER_SIZE=50          # Number of logs to buffer
LOG_BUFFER_TIMEOUT=3000     # Buffer flush timeout (ms)

# Log level
LOG_LEVEL=info
```

### TTL (Time To Live) Settings
- **Error logs**: 90 days
- **Warning logs**: 60 days  
- **Info logs**: 30 days
- **Debug logs**: 7 days

## 🚀 Usage Examples

### 1. **Basic Log Retrieval**
```bash
# Get recent error logs
curl "http://localhost:3001/api/logs/errors?limit=20"

# Get logs from last hour
curl "http://localhost:3001/api/logs/recent?minutes=60"

# Search logs
curl "http://localhost:3001/api/logs/search?q=database+error"
```

### 2. **Advanced Filtering**
```bash
# Get logs by date range
curl "http://localhost:3001/api/logs?startDate=2025-08-14T00:00:00Z&endDate=2025-08-14T23:59:59Z"

# Get logs by level and service
curl "http://localhost:3001/api/logs?level=error&service=inventory-management"

# Get paginated logs
curl "http://localhost:3001/api/logs?page=2&limit=50&sort=timestamp&order=desc"
```

### 3. **Monitoring & Analytics**
```bash
# System health check
curl "http://localhost:3001/api/logs/health"

# Log statistics
curl "http://localhost:3001/api/logs/statistics"

# Error pattern analysis
curl "http://localhost:3001/api/logs/analysis/errors?hours=24"
```

### 4. **Export (Admin Only)**
```bash
# Export as JSON
curl -H "Authorization: Bearer {admin-token}" \
  "http://localhost:3001/api/logs/export?format=json&limit=1000"

# Export as CSV
curl -H "Authorization: Bearer {admin-token}" \
  "http://localhost:3001/api/logs/export?format=csv&startDate=2025-08-01"
```

## 📈 Benefits

### 1. **Better Observability**
- Real-time log monitoring through API
- Advanced search and filtering capabilities
- Trend analysis and pattern detection

### 2. **Performance**
- Non-blocking logging operations
- Efficient batch processing
- Automatic cleanup of old logs

### 3. **Security & Compliance**
- Structured audit trails
- User activity tracking
- Security event monitoring
- Data retention policies

### 4. **Development & Debugging**
- Easy log correlation with trace IDs
- Context-aware logging
- Rich metadata for troubleshooting

## 🔍 Monitoring & Alerting

### System Health Indicators
```javascript
{
  "status": "healthy|warning|critical",
  "errorRate": "2.5%",
  "totalLogs": 1543,
  "errorCount": 12,
  "period": "last_hour"
}
```

### Error Pattern Analysis
```javascript
{
  "period": "24 hours",
  "totalErrors": 45,
  "uniqueErrorTypes": 8,
  "patterns": [
    {
      "errorName": "ValidationError",
      "count": 23,
      "frequency": "0.96 errors/hour",
      "firstSeen": "2025-08-14T10:30:00Z",
      "lastSeen": "2025-08-14T13:45:00Z"
    }
  ]
}
```

## 🔐 Security Features

### Authentication & Authorization
- All log endpoints require authentication
- User logs access restricted to own logs
- Admin-only endpoints for sensitive operations
- Role-based access control

### Data Privacy
- Automatic sanitization of sensitive data
- Password and token redaction
- PII protection in logs

## 🚦 Getting Started

1. **Ensure MongoDB is running and connected**
2. **Set environment variables**:
   ```bash
   ENABLE_DB_LOGGING=true
   LOG_BUFFER_SIZE=50
   LOG_BUFFER_TIMEOUT=3000
   ```
3. **Start the application** - MongoDB logging is automatically enabled
4. **Access logs via API** at `/api/logs/*` endpoints
5. **Monitor system health** at `/api/logs/health`

## 📝 Implementation Notes

### Performance Considerations
- Buffer size should be tuned based on log volume
- Consider increasing buffer timeout for high-traffic applications
- Monitor MongoDB performance with log collection size

### Troubleshooting
- Check console for "✓ MongoDB logging transport added" message
- Verify MongoDB connection is stable
- Monitor buffer flush messages: "✓ Flushed X logs to MongoDB"

---

## 📊 Sample API Response

```javascript
// GET /api/logs/health
{
  "success": true,
  "data": {
    "timestamp": "2025-08-14T14:00:00Z",
    "period": "last_hour",
    "totalLogs": 156,
    "errorCount": 3,
    "errorRate": "1.92",
    "status": "healthy",
    "logDistribution": {
      "error": 3,
      "warn": 12,
      "info": 128,
      "debug": 13
    }
  },
  "message": "System health retrieved successfully"
}
```

Hệ thống logging MongoDB hiện đã sẵn sàng để sử dụng với đầy đủ tính năng monitoring, analytics và management! 🎉
