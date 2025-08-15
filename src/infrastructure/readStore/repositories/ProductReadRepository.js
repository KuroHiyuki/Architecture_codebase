/**
 * Product Read Repository
 * Optimized for fast read operations using denormalized data
 */
export class ProductReadRepository {
  constructor({ readDatabase, logger, cacheService }) {
    this.readDatabase = readDatabase;
    this.logger = logger;
    this.cacheService = cacheService;
    this.model = null;
    // Don't call initModel in constructor - will be called after DB connection
  }

  async initModel() {
    try {
      if (!this.readDatabase.isConnected) {
        // Wait for connection if not ready yet
        let retries = 0;
        while (!this.readDatabase.isConnected && retries < 10) {
          await new Promise(resolve => setTimeout(resolve, 1000));
          retries++;
        }
        
        if (!this.readDatabase.isConnected) {
          throw new Error('Read Database connection timeout during model initialization');
        }
      }
      
      const connection = this.readDatabase.getConnection();
      const { ProductReadModel } = await import('../models/ProductReadModel.js');
      this.model = ProductReadModel(connection);
      this.logger.info('ProductReadModel initialized successfully');
    } catch (error) {
      this.logger.error('Failed to initialize ProductReadModel', { error: error.message });
      throw error;
    }
  }

  async findById(id, useCache = true) {
    try {
      // Ensure model is initialized
      if (!this.model) {
        await this.initModel();
      }

      const cacheKey = `product_read:${id}`;
      
      if (useCache) {
        const cached = await this.cacheService.get(cacheKey);
        if (cached) {
          this.logger.debug('Product found in cache', { productId: id });
          return cached;
        }
      }

      const product = await this.model.findById(id).lean();
      
      if (product && useCache) {
        await this.cacheService.set(cacheKey, product, 300); // 5 minutes cache
      }

      return product;
    } catch (error) {
      this.logger.error('Error finding product by ID in read store', { 
        productId: id, 
        error: error.message 
      });
      throw error;
    }
  }

  async findBySku(sku, useCache = true) {
    try {
      const cacheKey = `product_read:sku:${sku}`;
      
      if (useCache) {
        const cached = await this.cacheService.get(cacheKey);
        if (cached) return cached;
      }

      const product = await this.model.findOne({ sku }).lean();
      
      if (product && useCache) {
        await this.cacheService.set(cacheKey, product, 300);
      }

      return product;
    } catch (error) {
      this.logger.error('Error finding product by SKU in read store', { 
        sku, 
        error: error.message 
      });
      throw error;
    }
  }

  async findAll(filters = {}) {
    try {
      // Ensure model is initialized
      if (!this.model) {
        await this.initModel();
      }

      const {
        page = 1,
        limit = 20,
        category,
        tags,
        minPrice,
        maxPrice,
        currency = 'USD',
        search,
        isActive = true,
        isLowStock,
        sortBy = 'createdAt',
        sortOrder = 'desc'
      } = filters;

      // Build query
      const query = { isActive };
      
      if (category) query.category = category;
      if (tags && tags.length > 0) query.tags = { $in: tags };
      if (isLowStock !== undefined) query['inventory.isLowStock'] = isLowStock;
      
      // Price filter
      if (minPrice || maxPrice) {
        query.price = {};
        if (minPrice) query.price.$gte = minPrice;
        if (maxPrice) query.price.$lte = maxPrice;
      }
      
      if (currency !== 'USD') query.currency = currency;

      // Text search
      if (search) {
        query.$text = { $search: search };
      }

      // Pagination
      const skip = (page - 1) * limit;
      
      // Sort
      const sort = {};
      sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

      // Execute query with aggregation for performance
      const [products, total] = await Promise.all([
        this.model
          .find(query)
          .sort(sort)
          .skip(skip)
          .limit(limit)
          .lean(),
        this.model.countDocuments(query)
      ]);

      return {
        data: products,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
          hasNext: page < Math.ceil(total / limit),
          hasPrev: page > 1
        }
      };

    } catch (error) {
      this.logger.error('Error finding products in read store', { 
        filters, 
        error: error.message 
      });
      throw error;
    }
  }

  async findByCategory(category, options = {}) {
    const filters = { ...options, category };
    return this.findAll(filters);
  }

  async findLowStockProducts(options = {}) {
    const filters = { ...options, isLowStock: true };
    return this.findAll(filters);
  }

  async findTopSelling(limit = 10) {
    try {
      const cacheKey = `products_read:top_selling:${limit}`;
      const cached = await this.cacheService.get(cacheKey);
      if (cached) return cached;

      const products = await this.model
        .find({ isActive: true })
        .sort({ 'salesStats.totalSold': -1 })
        .limit(limit)
        .lean();

      await this.cacheService.set(cacheKey, products, 600); // 10 minutes cache
      return products;

    } catch (error) {
      this.logger.error('Error finding top selling products', { error: error.message });
      throw error;
    }
  }

  async getProductAnalytics(productId) {
    try {
      const product = await this.model
        .findById(productId)
        .select('salesStats inventory analytics')
        .lean();

      if (!product) return null;

      return {
        productId,
        sales: product.salesStats,
        inventory: product.inventory,
        performance: {
          stockTurnover: product.analytics?.turnoverRate || 0,
          daysOfStock: product.analytics?.daysOfStock || 0,
          revenuePerDay: product.salesStats.revenue / 30 // rough estimate
        }
      };

    } catch (error) {
      this.logger.error('Error getting product analytics', { 
        productId, 
        error: error.message 
      });
      throw error;
    }
  }

  async searchProducts(searchTerm, options = {}) {
    try {
      const {
        page = 1,
        limit = 20,
        category,
        minPrice,
        maxPrice
      } = options;

      const query = {
        $text: { $search: searchTerm },
        isActive: true
      };

      if (category) query.category = category;
      if (minPrice || maxPrice) {
        query.price = {};
        if (minPrice) query.price.$gte = minPrice;
        if (maxPrice) query.price.$lte = maxPrice;
      }

      const skip = (page - 1) * limit;

      const [products, total] = await Promise.all([
        this.model
          .find(query, { score: { $meta: 'textScore' } })
          .sort({ score: { $meta: 'textScore' } })
          .skip(skip)
          .limit(limit)
          .lean(),
        this.model.countDocuments(query)
      ]);

      return {
        data: products,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
          hasNext: page < Math.ceil(total / limit),
          hasPrev: page > 1
        }
      };

    } catch (error) {
      this.logger.error('Error searching products', { 
        searchTerm, 
        error: error.message 
      });
      throw error;
    }
  }

  // Update read model (called by event handlers)
  async updateFromEvent(eventData) {
    try {
      const { eventType, productId, data } = eventData;

      switch (eventType) {
        case 'ProductCreated':
          await this.model.create({
            _id: productId,
            ...data,
            inventory: {
              totalQuantity: 0,
              availableQuantity: 0,
              reservedQuantity: 0,
              locations: [],
              isLowStock: false
            },
            salesStats: {
              totalSold: 0,
              revenue: 0,
              averageRating: 0,
              reviewCount: 0
            },
            lastSyncAt: new Date()
          });
          break;

        case 'ProductUpdated':
          await this.model.findByIdAndUpdate(
            productId,
            { ...data, lastSyncAt: new Date() },
            { new: true }
          );
          break;

        case 'ProductDeleted':
          await this.model.findByIdAndUpdate(
            productId,
            { isActive: false, lastSyncAt: new Date() }
          );
          break;

        case 'InventoryUpdated':
          await this.model.findByIdAndUpdate(
            productId,
            { 
              'inventory': data.inventory,
              lastSyncAt: new Date()
            }
          );
          break;
      }

      // Clear cache
      await this.cacheService.delete(`product_read:${productId}`);
      
    } catch (error) {
      this.logger.error('Error updating product read model from event', { 
        eventData, 
        error: error.message 
      });
      throw error;
    }
  }
}
