/**
 * Inventory Entity
 * Domain entity for inventory management
 */
import { BaseEntity } from './BaseEntity.js';

export class Inventory extends BaseEntity {
  constructor({
    id = null,
    productId,
    quantity = 0,
    reservedQuantity = 0,
    location,
    warehouseId,
    minimumStock = 0,
    maximumStock = null,
    unitCost = 0
  }) {
    super(id);
    
    this.productId = productId;
    this.quantity = quantity;
    this.reservedQuantity = reservedQuantity;
    this.location = location;
    this.warehouseId = warehouseId;
    this.minimumStock = minimumStock;
    this.maximumStock = maximumStock;
    this.unitCost = unitCost;
  }

  get availableQuantity() {
    return this.quantity - this.reservedQuantity;
  }

  get isLowStock() {
    return this.availableQuantity <= this.minimumStock;
  }

  get isOverStock() {
    return this.maximumStock && this.quantity >= this.maximumStock;
  }

  addStock(quantity, unitCost = null) {
    if (quantity <= 0) {
      throw new Error('Quantity must be positive');
    }
    
    this.quantity += quantity;
    if (unitCost !== null) {
      this.unitCost = unitCost;
    }
    this.updateTimestamp();
  }

  removeStock(quantity) {
    if (quantity <= 0) {
      throw new Error('Quantity must be positive');
    }
    
    if (quantity > this.availableQuantity) {
      throw new Error('Insufficient available stock');
    }
    
    this.quantity -= quantity;
    this.updateTimestamp();
  }

  reserveStock(quantity) {
    if (quantity <= 0) {
      throw new Error('Quantity must be positive');
    }
    
    if (quantity > this.availableQuantity) {
      throw new Error('Insufficient available stock for reservation');
    }
    
    this.reservedQuantity += quantity;
    this.updateTimestamp();
  }

  releaseReservation(quantity) {
    if (quantity <= 0) {
      throw new Error('Quantity must be positive');
    }
    
    if (quantity > this.reservedQuantity) {
      throw new Error('Cannot release more than reserved');
    }
    
    this.reservedQuantity -= quantity;
    this.updateTimestamp();
  }

  updateStockLevels({ minimumStock, maximumStock }) {
    if (minimumStock !== undefined) this.minimumStock = minimumStock;
    if (maximumStock !== undefined) this.maximumStock = maximumStock;
    this.updateTimestamp();
  }

  updateLocation(newLocation, newWarehouseId = null) {
    this.location = newLocation;
    if (newWarehouseId) this.warehouseId = newWarehouseId;
    this.updateTimestamp();
  }

  toJSON() {
    return {
      ...super.toJSON(),
      productId: this.productId,
      quantity: this.quantity,
      reservedQuantity: this.reservedQuantity,
      availableQuantity: this.availableQuantity,
      location: this.location,
      warehouseId: this.warehouseId,
      minimumStock: this.minimumStock,
      maximumStock: this.maximumStock,
      unitCost: this.unitCost,
      isLowStock: this.isLowStock,
      isOverStock: this.isOverStock
    };
  }
}
