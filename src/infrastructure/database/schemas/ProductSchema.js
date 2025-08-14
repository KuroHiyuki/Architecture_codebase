/**
 * MongoDB Schema for Product
 */
import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
  _id: {
    type: String,
    required: true
  },
  name: {
    type: String,
    required: true,
    trim: true,
    index: true
  },
  description: {
    type: String,
    trim: true
  },
  sku: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    uppercase: true
  },
  price: {
    amount: {
      type: Number,
      required: true,
      min: 0
    },
    currency: {
      type: String,
      required: true,
      default: 'USD',
      enum: ['USD', 'EUR', 'GBP', 'JPY', 'CAD', 'AUD', 'VND']
    }
  },
  category: {
    type: String,
    required: true,
    trim: true,
    index: true
  },
  isActive: {
    type: Boolean,
    default: true,
    index: true
  },
  tags: [{
    type: String,
    trim: true
  }],
  specifications: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
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
  collection: 'products'
});

// Indexes
productSchema.index({ name: 'text', description: 'text' });
productSchema.index({ category: 1, isActive: 1 });
productSchema.index({ tags: 1 });
productSchema.index({ 'price.amount': 1, 'price.currency': 1 });
productSchema.index({ createdAt: -1 });
productSchema.index({ isActive: 1, category: 1, createdAt: -1 });

// Pre-save middleware to update updatedAt
productSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

productSchema.pre(['updateOne', 'findOneAndUpdate'], function(next) {
  this.set({ updatedAt: new Date() });
  next();
});

export const ProductModel = mongoose.model('Product', productSchema);
