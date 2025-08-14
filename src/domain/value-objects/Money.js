/**
 * Money Value Object
 * Handles monetary values with currency
 */
export class Money {
  constructor(amount, currency = 'USD') {
    this.validateAmount(amount);
    this.validateCurrency(currency);
    
    this._amount = parseFloat(parseFloat(amount).toFixed(2));
    this._currency = currency.toUpperCase();
  }

  get amount() {
    return this._amount;
  }

  get currency() {
    return this._currency;
  }

  validateAmount(amount) {
    if (amount == null) {
      throw new Error('Amount is required');
    }

    const numAmount = parseFloat(amount);
    if (isNaN(numAmount)) {
      throw new Error('Amount must be a valid number');
    }

    if (numAmount < 0) {
      throw new Error('Amount cannot be negative');
    }
  }

  validateCurrency(currency) {
    if (!currency) {
      throw new Error('Currency is required');
    }

    const validCurrencies = ['USD', 'EUR', 'GBP', 'JPY', 'CAD', 'AUD', 'VND'];
    if (!validCurrencies.includes(currency.toUpperCase())) {
      throw new Error(`Unsupported currency: ${currency}`);
    }
  }

  add(other) {
    this.ensureSameCurrency(other);
    return new Money(this._amount + other._amount, this._currency);
  }

  subtract(other) {
    this.ensureSameCurrency(other);
    const result = this._amount - other._amount;
    if (result < 0) {
      throw new Error('Result cannot be negative');
    }
    return new Money(result, this._currency);
  }

  multiply(factor) {
    if (factor < 0) {
      throw new Error('Factor cannot be negative');
    }
    return new Money(this._amount * factor, this._currency);
  }

  divide(factor) {
    if (factor <= 0) {
      throw new Error('Factor must be positive');
    }
    return new Money(this._amount / factor, this._currency);
  }

  ensureSameCurrency(other) {
    if (!(other instanceof Money)) {
      throw new Error('Can only operate on Money objects');
    }
    if (this._currency !== other._currency) {
      throw new Error(`Currency mismatch: ${this._currency} vs ${other._currency}`);
    }
  }

  equals(other) {
    return other instanceof Money && 
           this._amount === other._amount && 
           this._currency === other._currency;
  }

  isGreaterThan(other) {
    this.ensureSameCurrency(other);
    return this._amount > other._amount;
  }

  isLessThan(other) {
    this.ensureSameCurrency(other);
    return this._amount < other._amount;
  }

  toString() {
    return `${this._amount} ${this._currency}`;
  }

  toJSON() {
    return {
      amount: this._amount,
      currency: this._currency
    };
  }
}
