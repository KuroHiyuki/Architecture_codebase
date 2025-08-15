/**
 * Main Application Entry Point
 * Clean Architecture Inventory Management System
 */
import dotenv from 'dotenv';
import { Application } from './presentation/Application.js';
import { requiredENV } from './shared/requiredENV.js';
dotenv.config();

// Validate required environment variables
requiredENV();

async function startApplication() {
  try {
    const app = new Application();
    const port = process.env.PORT || 3000;
    
    await app.start(port);
    
    console.log(`
    🚀 Inventory Management API is running!
    
    🌐 Server: http://localhost:${port}
    📚 Environment: ${process.env.NODE_ENV || 'development'}
    🗄️  Database: ${process.env.MONGODB_URI ? 'Connected' : 'Not configured'}
    📖 Health Check: http://localhost:${port}/health
    
    Press Ctrl+C to stop the server
    `);
    
  } catch (error) {
    console.error('Failed to start application:', error);
    process.exit(1);
  }
}

startApplication();
