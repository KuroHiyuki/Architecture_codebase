/**
 * Generic Repository Interface
 * Base interface for all repositories following Repository pattern
 */
export class IRepository {
  async findById(id) {
    throw new Error('Method findById must be implemented');
  }

  async findAll(filters = {}, pagination = {}) {
    throw new Error('Method findAll must be implemented');
  }

  async save(entity) {
    throw new Error('Method save must be implemented');
  }

  async update(id, updateData) {
    throw new Error('Method update must be implemented');
  }

  async delete(id) {
    throw new Error('Method delete must be implemented');
  }

  async exists(id) {
    throw new Error('Method exists must be implemented');
  }

  async count(filters = {}) {
    throw new Error('Method count must be implemented');
  }
}
