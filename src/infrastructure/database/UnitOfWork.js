/**
 * Unit of Work Pattern Implementation
 * Manages database transactions
 */
import mongoose from 'mongoose';

export class UnitOfWork {
  constructor({ logger }) {
    this.logger = logger;
  }

  async startTransaction() {
    try {
      const session = await mongoose.startSession();
      session.startTransaction();
      
      this.logger.debug('Transaction started', { sessionId: session.id });
      return session;
    } catch (error) {
      this.logger.error('Failed to start transaction', { error: error.message });
      throw error;
    }
  }

  async commitTransaction(session) {
    try {
      await session.commitTransaction();
      await session.endSession();
      
      this.logger.debug('Transaction committed successfully', { sessionId: session.id });
    } catch (error) {
      this.logger.error('Failed to commit transaction', { 
        sessionId: session.id, 
        error: error.message 
      });
      throw error;
    }
  }

  async rollbackTransaction(session) {
    try {
      await session.abortTransaction();
      await session.endSession();
      
      this.logger.debug('Transaction rolled back', { sessionId: session.id });
    } catch (error) {
      this.logger.error('Failed to rollback transaction', { 
        sessionId: session.id, 
        error: error.message 
      });
      throw error;
    }
  }

  async executeInTransaction(operation) {
    const session = await this.startTransaction();
    
    try {
      const result = await operation(session);
      await this.commitTransaction(session);
      return result;
    } catch (error) {
      await this.rollbackTransaction(session);
      throw error;
    }
  }
}
