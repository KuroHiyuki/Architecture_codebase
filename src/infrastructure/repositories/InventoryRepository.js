/**
 * Inventory Repository Implementation
 * Implements IInventoryRepository using MongoDB
 */
import { InventoryModel } from '../database/schemas/InventorySchema.js';
import { IInventoryRepository } from '../../domain/repositories/IInventoryRepository.js';

export class InventoryRepository extends IInventoryRepository {
  constructor({ database, logger }) {
    super();
    this.database = database;
    this.logger = logger;
    this.model = InventoryModel;
  }

  async getModel() {
    if (!this.model) {
      await this.database.connect();
      this.model = InventoryModel;
    }
    return this.model;
  }

  async save(inventory, session = null) {
    try {
      const Model = await this.getModel();
      const inventoryData = inventory.toJSON ? inventory.toJSON() : inventory;
      
      const savedInventory = new Model(inventoryData);
      const result = await savedInventory.save({ session });
      
      this.logger.info('Inventory saved successfully', { inventoryId: result._id });
      return result;
    } catch (error) {
      this.logger.error('Failed to save inventory', { error: error.message });
      throw error;
    }
  }

  async findById(id) {
    try {
      const Model = await this.getModel();
      const inventory = await Model.findById(id).populate('productId');
      
      if (inventory) {
        this.logger.debug('Inventory found', { inventoryId: id });
      }
      
      return inventory;
    } catch (error) {
      this.logger.error('Failed to find inventory by ID', { inventoryId: id, error: error.message });
      throw error;
    }
  }

  async findByProductId(productId) {
    try {
      const Model = await this.getModel();
      const inventories = await Model.find({ productId }).populate('productId');
      
      this.logger.debug('Inventories found by product ID', { productId, count: inventories.length });
      return inventories;
    } catch (error) {
      this.logger.error('Failed to find inventory by product ID', { productId, error: error.message });
      throw error;
    }
  }

  async findByWarehouseId(warehouseId) {
    try {
      const Model = await this.getModel();
      const inventories = await Model.find({ warehouseId }).populate('productId');
      
      this.logger.debug('Inventories found by warehouse ID', { warehouseId, count: inventories.length });
      return inventories;
    } catch (error) {
      this.logger.error('Failed to find inventory by warehouse ID', { warehouseId, error: error.message });
      throw error;
    }
  }

  async findByProductAndWarehouse(productId, warehouseId) {
    try {
      const Model = await this.getModel();
      const inventory = await Model.findOne({ productId, warehouseId }).populate('productId');
      
      if (inventory) {
        this.logger.debug('Inventory found by product and warehouse', { productId, warehouseId });
      }
      
      return inventory;
    } catch (error) {
      this.logger.error('Failed to find inventory by product and warehouse', { 
        productId, 
        warehouseId, 
        error: error.message 
      });
      throw error;
    }
  }

  async findLowStockItems(warehouseId = null) {
    try {
      const Model = await this.getModel();
      
      const filters = {
        $expr: {
          $lte: ['$quantity', '$minStockLevel']
        }
      };

      if (warehouseId) {
        filters.warehouseId = warehouseId;
      }

      const inventories = await Model.find(filters).populate('productId');
      
      this.logger.debug('Low stock items found', { count: inventories.length, warehouseId });
      return inventories;
    } catch (error) {
      this.logger.error('Failed to find low stock items', { warehouseId, error: error.message });
      throw error;
    }
  }

  async findAll(filters = {}, options = {}) {
    try {
      const Model = await this.getModel();
      
      const page = parseInt(options.page) || 1;
      const limit = parseInt(options.limit) || 10;
      const skip = (page - 1) * limit;
      const sort = options.sort || { updatedAt: -1 };

      // Build query
      const query = Model.find(filters).populate('productId');
      
      // Apply pagination and sorting
      const [data, total] = await Promise.all([
        query.clone().sort(sort).skip(skip).limit(limit).exec(),
        Model.countDocuments(filters)
      ]);

      const totalPages = Math.ceil(total / limit);
      
      this.logger.debug('Inventories retrieved', { 
        count: data.length, 
        total, 
        page, 
        totalPages 
      });

      return {
        data,
        total,
        page,
        limit,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1
      };
    } catch (error) {
      this.logger.error('Failed to find inventories', { filters, error: error.message });
      throw error;
    }
  }

  async update(id, updateData, session = null) {
    try {
      const Model = await this.getModel();
      
      const updatedInventory = await Model.findByIdAndUpdate(
        id,
        { $set: updateData },
        { new: true, session, runValidators: true }
      ).populate('productId');

      if (!updatedInventory) {
        throw new Error('Inventory not found');
      }

      this.logger.info('Inventory updated successfully', { inventoryId: id });
      return updatedInventory;
    } catch (error) {
      this.logger.error('Failed to update inventory', { inventoryId: id, error: error.message });
      throw error;
    }
  }

  async delete(id, session = null) {
    try {
      const Model = await this.getModel();
      
      const deletedInventory = await Model.findByIdAndDelete(id, { session });
      
      if (!deletedInventory) {
        throw new Error('Inventory not found');
      }

      this.logger.info('Inventory deleted successfully', { inventoryId: id });
      return deletedInventory;
    } catch (error) {
      this.logger.error('Failed to delete inventory', { inventoryId: id, error: error.message });
      throw error;
    }
  }

  async updateQuantity(id, quantity, session = null) {
    try {
      const Model = await this.getModel();
      
      const updatedInventory = await Model.findByIdAndUpdate(
        id,
        { 
          $set: { 
            quantity, 
            updatedAt: new Date() 
          } 
        },
        { new: true, session, runValidators: true }
      ).populate('productId');

      if (!updatedInventory) {
        throw new Error('Inventory not found');
      }

      this.logger.info('Inventory quantity updated successfully', { 
        inventoryId: id, 
        newQuantity: quantity 
      });
      return updatedInventory;
    } catch (error) {
      this.logger.error('Failed to update inventory quantity', { 
        inventoryId: id, 
        quantity, 
        error: error.message 
      });
      throw error;
    }
  }

  async adjustReservedQuantity(id, reservedQuantity, session = null) {
    try {
      const Model = await this.getModel();
      
      const updatedInventory = await Model.findByIdAndUpdate(
        id,
        { 
          $set: { 
            reservedQuantity, 
            updatedAt: new Date() 
          } 
        },
        { new: true, session, runValidators: true }
      ).populate('productId');

      if (!updatedInventory) {
        throw new Error('Inventory not found');
      }

      this.logger.info('Inventory reserved quantity updated successfully', { 
        inventoryId: id, 
        newReservedQuantity: reservedQuantity 
      });
      return updatedInventory;
    } catch (error) {
      this.logger.error('Failed to update inventory reserved quantity', { 
        inventoryId: id, 
        reservedQuantity, 
        error: error.message 
      });
      throw error;
    }
  }

  async exists(id) {
    try {
      const Model = await this.getModel();
      const exists = await Model.exists({ _id: id });
      return !!exists;
    } catch (error) {
      this.logger.error('Failed to check if inventory exists', { inventoryId: id, error: error.message });
      throw error;
    }
  }

  async count(filters = {}) {
    try {
      const Model = await this.getModel();
      const count = await Model.countDocuments(filters);
      return count;
    } catch (error) {
      this.logger.error('Failed to count inventories', { filters, error: error.message });
      throw error;
    }
  }
}
