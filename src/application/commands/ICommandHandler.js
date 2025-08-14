/**
 * Command Handler Interface
 * Base interface for all command handlers
 */
export class ICommandHandler {
  constructor() {
    if (this.constructor === ICommandHandler) {
      throw new Error('Cannot instantiate abstract class');
    }
  }

  async handle(command) {
    throw new Error('Method handle must be implemented');
  }
}
