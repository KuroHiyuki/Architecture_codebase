/**
 * Cache Service Interface
 * Simple in-memory cache for development
 */
export class CacheService {
  constructor({ logger }) {
    this.logger = logger;
    this.cache = new Map();
    this.timers = new Map();
  }

  async get(key) {
    try {
      const value = this.cache.get(key);
      this.logger.debug('Cache get', { key, found: !!value });
      return value || null;
    } catch (error) {
      this.logger.error('Cache get error', { key, error: error.message });
      return null;
    }
  }

  async set(key, value, ttlSeconds = null) {
    try {
      this.cache.set(key, value);
      
      // Clear existing timer if any
      if (this.timers.has(key)) {
        clearTimeout(this.timers.get(key));
      }
      
      // Set TTL timer if specified
      if (ttlSeconds && ttlSeconds > 0) {
        const timer = setTimeout(() => {
          this.delete(key);
        }, ttlSeconds * 1000);
        
        this.timers.set(key, timer);
      }
      
      this.logger.debug('Cache set', { key, ttlSeconds });
      return true;
    } catch (error) {
      this.logger.error('Cache set error', { key, error: error.message });
      return false;
    }
  }

  async delete(key) {
    try {
      const deleted = this.cache.delete(key);
      
      // Clear timer if exists
      if (this.timers.has(key)) {
        clearTimeout(this.timers.get(key));
        this.timers.delete(key);
      }
      
      this.logger.debug('Cache delete', { key, deleted });
      return deleted;
    } catch (error) {
      this.logger.error('Cache delete error', { key, error: error.message });
      return false;
    }
  }

  async exists(key) {
    try {
      const exists = this.cache.has(key);
      this.logger.debug('Cache exists', { key, exists });
      return exists;
    } catch (error) {
      this.logger.error('Cache exists error', { key, error: error.message });
      return false;
    }
  }

  async clear() {
    try {
      // Clear all timers
      for (const timer of this.timers.values()) {
        clearTimeout(timer);
      }
      
      this.cache.clear();
      this.timers.clear();
      
      this.logger.info('Cache cleared');
      return true;
    } catch (error) {
      this.logger.error('Cache clear error', { error: error.message });
      return false;
    }
  }

  // Get cache statistics
  getStats() {
    return {
      size: this.cache.size,
      timersCount: this.timers.size
    };
  }
}
