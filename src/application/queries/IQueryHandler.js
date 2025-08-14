/**
 * Query Handler Interface
 * Base interface for all query handlers
 */
export class IQueryHandler {
  constructor() {
    if (this.constructor === IQueryHandler) {
      throw new Error('Cannot instantiate abstract class');
    }
  }

  async handle(query) {
    throw new Error('Method handle must be implemented');
  }
}
