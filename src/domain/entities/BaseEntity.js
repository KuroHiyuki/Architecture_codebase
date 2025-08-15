/**
 * Base Entity Class
 * Following DDD principles
 */
import { v4 as uuidv4 } from 'uuid';

export class BaseEntity {
  constructor(_id = null) {
    this._id = _id || uuidv4();
    this.createdAt = new Date();
    this.updatedAt = new Date();
  }

  updateTimestamp() {
    this.updatedAt = new Date();
  }

  equals(other) {
    if (!other || other.constructor !== this.constructor) {
      return false;
    }
    return this._id === other._id;
  }

  toJSON() {
    return {
      _id: this._id,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    };
  }
}
