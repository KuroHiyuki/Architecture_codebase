/**
 * Query Interface
 * Base interface for all queries in CQRS pattern
 */
export class IQuery {
  constructor() {
    if (this.constructor === IQuery) {
      throw new Error('Cannot instantiate abstract class');
    }
  }

  validate() {
    throw new Error('Method validate must be implemented');
  }
}
