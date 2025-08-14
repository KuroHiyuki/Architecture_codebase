/**
 * Inventory Repository Interface
 * Domain interface for inventory data access
 */
import { IRepository } from './IRepository.js';

export class IInventoryRepository extends IRepository {
  async findByProductId(productId) {
    throw new Error('Method findByProductId must be implemented');
  }

  async findByWarehouse(warehouseId, pagination = {}) {
    throw new Error('Method findByWarehouse must be implemented');
  }

  async findLowStockItems(pagination = {}) {
    throw new Error('Method findLowStockItems must be implemented');
  }

  async findOverStockItems(pagination = {}) {
    throw new Error('Method findOverStockItems must be implemented');
  }

  async findByLocation(location, pagination = {}) {
    throw new Error('Method findByLocation must be implemented');
  }

  async updateStock(inventoryId, quantity, operation = 'add') {
    throw new Error('Method updateStock must be implemented');
  }

  async reserveStock(inventoryId, quantity) {
    throw new Error('Method reserveStock must be implemented');
  }

  async releaseReservation(inventoryId, quantity) {
    throw new Error('Method releaseReservation must be implemented');
  }

  async getTotalQuantityByProduct(productId) {
    throw new Error('Method getTotalQuantityByProduct must be implemented');
  }
}
