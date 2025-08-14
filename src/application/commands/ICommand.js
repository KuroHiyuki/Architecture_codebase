/**
 * Command Interface
 * Base interface for all commands in CQRS pattern
 */
export class ICommand {
  constructor() {
    if (this.constructor === ICommand) {
      throw new Error('Cannot instantiate abstract class');
    }
  }

  validate() {
    throw new Error('Method validate must be implemented');
  }
}
