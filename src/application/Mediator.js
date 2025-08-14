/**
 * Mediator Pattern Implementation
 * Handles command and query dispatching
 */
export class Mediator {
  constructor() {
    this.commandHandlers = new Map();
    this.queryHandlers = new Map();
  }

  registerCommandHandler(commandType, handler) {
    if (this.commandHandlers.has(commandType)) {
      throw new Error(`Command handler for ${commandType} already registered`);
    }
    this.commandHandlers.set(commandType, handler);
  }

  registerQueryHandler(queryType, handler) {
    if (this.queryHandlers.has(queryType)) {
      throw new Error(`Query handler for ${queryType} already registered`);
    }
    this.queryHandlers.set(queryType, handler);
  }

  async send(command) {
    const commandType = command.constructor.name;
    const handler = this.commandHandlers.get(commandType);
    
    if (!handler) {
      throw new Error(`No handler registered for command: ${commandType}`);
    }

    // Validate command before handling
    await command.validate();
    
    return await handler.handle(command);
  }

  async query(query) {
    const queryType = query.constructor.name;
    const handler = this.queryHandlers.get(queryType);
    
    if (!handler) {
      throw new Error(`No handler registered for query: ${queryType}`);
    }

    // Validate query before handling
    await query.validate();
    
    return await handler.handle(query);
  }

  getRegisteredCommands() {
    return Array.from(this.commandHandlers.keys());
  }

  getRegisteredQueries() {
    return Array.from(this.queryHandlers.keys());
  }
}
