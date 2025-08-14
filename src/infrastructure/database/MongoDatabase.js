/**
 * MongoDB Database Connection
 * Handles database connectivity and configuration
 */
import mongoose from 'mongoose';

export class MongoDatabase {
  constructor({ logger }) {
    this.logger = logger;
    this.connection = null;
  }

  async connect(uri) {
    try {
      const options = {
        maxPoolSize: 10,
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 45000,
        family: 4, // Use IPv4, skip trying IPv6
        bufferCommands: false
      };

      this.connection = await mongoose.connect(uri, options);
      
      this.logger.info('MongoDB connected successfully', { 
        host: this.connection.connection.host,
        port: this.connection.connection.port,
        database: this.connection.connection.name
      });

      // Handle connection events
      mongoose.connection.on('error', (error) => {
        this.logger.error('MongoDB connection error', { error: error.message });
      });

      mongoose.connection.on('disconnected', () => {
        this.logger.warn('MongoDB disconnected');
      });

      mongoose.connection.on('reconnected', () => {
        this.logger.info('MongoDB reconnected');
      });

      return this.connection;

    } catch (error) {
      this.logger.error('MongoDB connection failed', { error: error.message });
      throw error;
    }
  }

  async disconnect() {
    try {
      if (this.connection) {
        await mongoose.disconnect();
        this.logger.info('MongoDB disconnected successfully');
      }
    } catch (error) {
      this.logger.error('MongoDB disconnect error', { error: error.message });
      throw error;
    }
  }

  getConnection() {
    return this.connection;
  }

  isConnected() {
    return mongoose.connection.readyState === 1;
  }
}
