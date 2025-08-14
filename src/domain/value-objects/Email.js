/**
 * Email Value Object
 * Ensures email validation following DDD principles
 */
export class Email {
  constructor(value) {
    this.validateEmail(value);
    this._value = value.toLowerCase().trim();
  }

  get value() {
    return this._value;
  }

  validateEmail(email) {
    if (!email) {
      throw new Error('Email is required');
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw new Error('Invalid email format');
    }

    if (email.length > 254) {
      throw new Error('Email too long');
    }
  }

  equals(other) {
    return other instanceof Email && this._value === other._value;
  }

  toString() {
    return this._value;
  }

  toJSON() {
    return this._value;
  }
}
