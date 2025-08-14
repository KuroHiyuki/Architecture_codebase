/**
 * MongoDB Schema for Inventory
 */
import mongoose from 'mongoose';

const inventorySchema = new mongoose.Schema({
  _id: {
    type: String,
    required: true
  },
  productId: {
    type: String,
    required: true,
    ref: 'Product'
  },
  quantity: {
    type: Number,
    required: true,
    min: 0,
    default: 0
  },
  reservedQuantity: {
    type: Number,
    required: true,
    min: 0,
    default: 0
  },
  location: {
    type: String,
    required: true,
    trim: true
  },
  warehouseId: {
    type: String,
    required: true
  },
  minimumStock: {
    type: Number,
    required: true,
    min: 0,
    default: 0
  },
  maximumStock: {
    type: Number,
    min: 0,
    default: null
  },
  unitCost: {
    type: Number,
    required: true,
    min: 0,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now,
    index: true
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  versionKey: false,
  collection: 'inventory'
});

// Virtual for available quantity
inventorySchema.virtual('availableQuantity').get(function() {
  return this.quantity - this.reservedQuantity;
});

// Virtual for low stock check
inventorySchema.virtual('isLowStock').get(function() {
  return this.availableQuantity <= this.minimumStock;
});

// Virtual for over stock check
inventorySchema.virtual('isOverStock').get(function() {
  return this.maximumStock && this.quantity >= this.maximumStock;
});

// Indexes
inventorySchema.index({ quantity: 1 });
inventorySchema.index({ minimumStock: 1 });
inventorySchema.index({ createdAt: -1 });
inventorySchema.index({ warehouseId: 1, location: 1 });

// Compound index for low stock queries
inventorySchema.index({ 
  quantity: 1, 
  reservedQuantity: 1, 
  minimumStock: 1 
});

// Pre-save middleware to update updatedAt
inventorySchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

inventorySchema.pre(['updateOne', 'findOneAndUpdate'], function(next) {
  this.set({ updatedAt: new Date() });
  next();
});

// Validation middleware
inventorySchema.pre('save', function(next) {
  if (this.maximumStock && this.minimumStock >= this.maximumStock) {
    next(new Error('Maximum stock must be greater than minimum stock'));
  }
  if (this.reservedQuantity > this.quantity) {
    next(new Error('Reserved quantity cannot exceed total quantity'));
  }
  next();
});

export const InventoryModel = mongoose.model('Inventory', inventorySchema);
