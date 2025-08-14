/**
 * User Entity
 * Domain entity following DDD principles
 */
import { BaseEntity } from './BaseEntity.js';
import { Email } from '../value-objects/Email.js';

export class User extends BaseEntity {
  constructor({
    id = null,
    email,
    password = null,
    firstName,
    lastName,
    isActive = true,
    role = 'user',
    googleId = null,
    lastLoginAt = null
  }) {
    super(id);
    
    this.email = new Email(email);
    this.password = password;
    this.firstName = firstName;
    this.lastName = lastName;
    this.isActive = isActive;
    this.role = role;
    this.googleId = googleId;
    this.lastLoginAt = lastLoginAt;
  }

  get fullName() {
    return `${this.firstName} ${this.lastName}`;
  }

  updateLastLogin() {
    this.lastLoginAt = new Date();
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

  changePassword(newPassword) {
    this.password = newPassword;
    this.updateTimestamp();
  }

  updateProfile({ firstName, lastName }) {
    if (firstName) this.firstName = firstName;
    if (lastName) this.lastName = lastName;
    this.updateTimestamp();
  }

  isAdmin() {
    return this.role === 'admin';
  }

  toJSON() {
    return {
      ...super.toJSON(),
      email: this.email.value,
      firstName: this.firstName,
      lastName: this.lastName,
      fullName: this.fullName,
      isActive: this.isActive,
      role: this.role,
      googleId: this.googleId,
      lastLoginAt: this.lastLoginAt
    };
  }
}
