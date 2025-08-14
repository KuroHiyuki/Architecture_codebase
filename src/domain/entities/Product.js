/**
 * Product Entity
 * Domain entity for product management
 */
import { BaseEntity } from './BaseEntity.js';
import { Money } from '../value-objects/Money.js';

export class Product extends BaseEntity {
  constructor({
    id = null,
    name,
    description,
    sku,
    price,
    currency = 'USD',
    category,
    isActive = true,
    tags = [],
    specifications = {}
  }) {
    super(id);
    
    this.name = name;
    this.description = description;
    this.sku = sku;
    this.price = new Money(price, currency);
    this.category = category;
    this.isActive = isActive;
    this.tags = tags;
    this.specifications = specifications;
  }

  updatePrice(newPrice, currency = null) {
    this.price = new Money(newPrice, currency || this.price.currency);
    this.updateTimestamp();
  }

  updateDetails({ name, description, category, tags, specifications }) {
    if (name) this.name = name;
    if (description) this.description = description;
    if (category) this.category = category;
    if (tags) this.tags = tags;
    if (specifications) this.specifications = specifications;
    this.updateTimestamp();
  }

  addTag(tag) {
    if (!this.tags.includes(tag)) {
      this.tags.push(tag);
      this.updateTimestamp();
    }
  }

  removeTag(tag) {
    this.tags = this.tags.filter(t => t !== tag);
    this.updateTimestamp();
  }

  deactivate() {
    this.isActive = false;
    this.updateTimestamp();
  }

  activate() {
    this.isActive = true;
    this.updateTimestamp();
  }

  toJSON() {
    return {
      ...super.toJSON(),
      name: this.name,
      description: this.description,
      sku: this.sku,
      price: this.price.toJSON(),
      category: this.category,
      isActive: this.isActive,
      tags: this.tags,
      specifications: this.specifications
    };
  }
}
