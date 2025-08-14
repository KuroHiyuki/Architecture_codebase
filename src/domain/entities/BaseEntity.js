/**
 * Base Entity Class
 * Following DDD principles
 */
import { v4 as uuidv4 } from 'uuid';

export class BaseEntity {
  constructor(id = null) {
    this.id = id || uuidv4();
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
    return this.id === other.id;
  }

  toJSON() {
    return {
      id: this.id,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    };
  }
}
