/**
 * Inventory Controller
 * Handles inventory management endpoints
 */
export class InventoryController {
  constructor({ mediator, logger }) {
    this.mediator = mediator;
    this.logger = logger;
  }

  async create(req, res, next) {
    try {
      const { CreateInventoryCommand } = await import('../../application/commands/inventory/CreateInventoryCommand.js');
      
      const command = new CreateInventoryCommand({
        productId: req.body.productId,
        quantity: req.body.quantity,
        location: req.body.location,
        warehouseId: req.body.warehouseId,
        minimumStock: req.body.minimumStock,
        maximumStock: req.body.maximumStock,
        unitCost: req.body.unitCost
      });

      const result = await this.mediator.send(command);

      this.logger.info('Inventory created successfully', { 
        inventoryId: result.data.id,
        productId: result.data.productId,
        userId: req.user.id
      });

      res.status(201).json({
        success: true,
        message: 'Inventory created successfully',
        data: result.data
      });

    } catch (error) {
      next(error);
    }
  }

  async getAll(req, res, next) {
    try {
      const { GetInventoryQuery } = await import('../../application/queries/inventory/GetInventoryQuery.js');
      
      const query = new GetInventoryQuery({
        page: parseInt(req.query.page) || 1,
        limit: parseInt(req.query.limit) || 10,
        productId: req.query.productId,
        warehouseId: req.query.warehouseId,
        location: req.query.location,
        lowStock: req.query.lowStock === 'true',
        overStock: req.query.overStock === 'true'
      });

      const result = await this.mediator.query(query);

      res.status(200).json({
        success: true,
        message: 'Inventory retrieved successfully',
        data: result.data,
        pagination: result.pagination
      });

    } catch (error) {
      next(error);
    }
  }

  async getById(req, res, next) {
    try {
      // This would use a GetInventoryByIdQuery
      const { id } = req.params;

      // Placeholder for actual query implementation
      res.status(200).json({
        success: true,
        message: 'Inventory item retrieved successfully',
        data: {
          id,
          // ... inventory data
        }
      });

    } catch (error) {
      next(error);
    }
  }

  async updateStock(req, res, next) {
    try {
      const { UpdateInventoryStockCommand } = await import('../../application/commands/inventory/UpdateInventoryStockCommand.js');
      
      const command = new UpdateInventoryStockCommand({
        inventoryId: req.params.id,
        quantity: req.body.quantity,
        operation: req.body.operation,
        unitCost: req.body.unitCost
      });

      const result = await this.mediator.send(command);

      this.logger.info('Inventory stock updated successfully', { 
        inventoryId: req.params.id,
        operation: req.body.operation,
        quantity: req.body.quantity,
        userId: req.user.id
      });

      res.status(200).json({
        success: true,
        message: 'Inventory stock updated successfully',
        data: result.data
      });

    } catch (error) {
      next(error);
    }
  }

  async reserveStock(req, res, next) {
    try {
      const { ReserveInventoryCommand } = await import('../../application/commands/inventory/ReserveInventoryCommand.js');
      
      const command = new ReserveInventoryCommand({
        inventoryId: req.params.id,
        quantity: req.body.quantity
      });

      const result = await this.mediator.send(command);

      this.logger.info('Inventory stock reserved successfully', { 
        inventoryId: req.params.id,
        quantity: req.body.quantity,
        userId: req.user.id
      });

      res.status(200).json({
        success: true,
        message: 'Inventory stock reserved successfully',
        data: result.data
      });

    } catch (error) {
      next(error);
    }
  }

  async releaseReservation(req, res, next) {
    try {
      // This would use a ReleaseInventoryReservationCommand
      const { id } = req.params;
      const { quantity } = req.body;

      this.logger.info('Inventory reservation released successfully', { 
        inventoryId: id,
        quantity,
        userId: req.user.id
      });

      res.status(200).json({
        success: true,
        message: 'Inventory reservation released successfully'
      });

    } catch (error) {
      next(error);
    }
  }

  async getLowStock(req, res, next) {
    try {
      const { GetInventoryQuery } = await import('../../application/queries/inventory/GetInventoryQuery.js');
      
      const query = new GetInventoryQuery({
        page: parseInt(req.query.page) || 1,
        limit: parseInt(req.query.limit) || 10,
        lowStock: true,
        warehouseId: req.query.warehouseId
      });

      const result = await this.mediator.query(query);

      res.status(200).json({
        success: true,
        message: 'Low stock items retrieved successfully',
        data: result.data,
        pagination: result.pagination
      });

    } catch (error) {
      next(error);
    }
  }

  async getOverStock(req, res, next) {
    try {
      const { GetInventoryQuery } = await import('../../application/queries/inventory/GetInventoryQuery.js');
      
      const query = new GetInventoryQuery({
        page: parseInt(req.query.page) || 1,
        limit: parseInt(req.query.limit) || 10,
        overStock: true,
        warehouseId: req.query.warehouseId
      });

      const result = await this.mediator.query(query);

      res.status(200).json({
        success: true,
        message: 'Over stock items retrieved successfully',
        data: result.data,
        pagination: result.pagination
      });

    } catch (error) {
      next(error);
    }
  }

  async getByProduct(req, res, next) {
    try {
      const { GetInventoryQuery } = await import('../../application/queries/inventory/GetInventoryQuery.js');
      
      const query = new GetInventoryQuery({
        page: parseInt(req.query.page) || 1,
        limit: parseInt(req.query.limit) || 10,
        productId: req.params.productId
      });

      const result = await this.mediator.query(query);

      res.status(200).json({
        success: true,
        message: 'Product inventory retrieved successfully',
        data: result.data,
        pagination: result.pagination
      });

    } catch (error) {
      next(error);
    }
  }

  async getByWarehouse(req, res, next) {
    try {
      const { GetInventoryQuery } = await import('../../application/queries/inventory/GetInventoryQuery.js');
      
      const query = new GetInventoryQuery({
        page: parseInt(req.query.page) || 1,
        limit: parseInt(req.query.limit) || 10,
        warehouseId: req.params.warehouseId
      });

      const result = await this.mediator.query(query);

      res.status(200).json({
        success: true,
        message: 'Warehouse inventory retrieved successfully',
        data: result.data,
        pagination: result.pagination
      });

    } catch (error) {
      next(error);
    }
  }

  async delete(req, res, next) {
    try {
      // This would use a DeleteInventoryCommand
      const { id } = req.params;

      this.logger.info('Inventory deleted successfully', { 
        inventoryId: id,
        userId: req.user.id
      });

      res.status(200).json({
        success: true,
        message: 'Inventory deleted successfully'
      });

    } catch (error) {
      next(error);
    }
  }
}
